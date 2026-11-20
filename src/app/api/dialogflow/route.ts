import { NextRequest, NextResponse } from 'next/server';
import { ProductLookupService, FormattedProductResult } from '../../../chatbot/services/productLookupService';
import {
  DialogflowWebhookRequest,
  DialogflowWebhookResponse,
  DialogflowContext,
} from '../../../chatbot/dialogflow/dialogflowTypes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Helper to safely extract a context by name from incoming Dialogflow contexts
 */
function getContext(contexts: DialogflowContext[] | undefined, targetName: string): DialogflowContext | undefined {
  if (!contexts || !Array.isArray(contexts)) return undefined;
  const cleanTarget = targetName.toLowerCase().trim();
  return contexts.find((ctx) => {
    const rawName = ctx.name || '';
    const namePart = rawName.includes('/contexts/')
      ? rawName.split('/contexts/')[1]
      : rawName;
    return namePart.toLowerCase().trim() === cleanTarget;
  });
}

/**
 * Dialogflow ES Fulfillment Webhook Handler
 * Route: POST /api/dialogflow
 *
 * Connects Google Dialogflow ES directly to NookMint's Supabase PostgreSQL product inventory.
 */
export async function POST(req: NextRequest) {
  // 1. Authentication Check (validates secret when configured in environment)
  const webhookSecret = process.env.DIALOGFLOW_WEBHOOK_SECRET?.trim();

  if (webhookSecret) {
    const rawAuth = (
      req.headers.get('x-dialogflow-auth') ||
      req.headers.get('authorization') ||
      ''
    ).trim();

    const cleanAuth = rawAuth.replace(/^bearer\s+/i, '').trim();
    const isValid = cleanAuth === webhookSecret;

    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized webhook access' }, { status: 401 });
    }
  }

  // 2. Parse Incoming Dialogflow ES Payload
  let body: DialogflowWebhookRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const queryResult = body.queryResult;
  if (!queryResult) {
    return NextResponse.json({ error: 'Missing queryResult in payload' }, { status: 400 });
  }

  const intentName = queryResult.intent?.displayName || '';
  const session = body.session || '';
  const rawQuery = queryResult.queryText || '';
  const params = queryResult.parameters || {};

  const lookupService = new ProductLookupService();

  // 3. Route by Intent
  switch (intentName) {
    case 'product.search':
    case 'product.details':
    case 'product.availability': {
      // Determine search term: check extracted parameters or raw text
      const searchTerm =
        params.product ||
        params.any ||
        params.product_code ||
        params.keyword ||
        rawQuery;

      // Also check if a product code was recognized in parameters or query
      const codeMatch = String(searchTerm).match(/\b(NM-P\d+|P\d+)\b/i);

      let result = null;
      let multiResults: any[] = [];

      if (codeMatch) {
        result = await lookupService.findByProductCode(codeMatch[1]);
      }

      if (!result) {
        const searchResults = await lookupService.searchProducts(String(searchTerm), 3);
        if (searchResults.length === 1) {
          result = searchResults[0];
        } else if (searchResults.length > 1) {
          multiResults = searchResults;
        }
      }

      // Context array to maintain conversational memory
      const outputContexts: DialogflowContext[] = [];

      let responseText = '';

      if (result) {
        // Single match found: generate full details with price, stock, and link
        responseText = lookupService.formatSingleProductResponse(result);

        // Store selected product in conversation context (lifespan = 5 turns)
        if (session) {
          outputContexts.push({
            name: `${session}/contexts/product_selected`,
            lifespanCount: 5,
            parameters: {
              productId: result.product.id,
              productCode: result.productCode,
              productTitle: result.product.title,
              productPrice: result.product.sellingPrice,
              canonicalUrl: result.canonicalUrl,
            },
          });

          // Store category in conversation context for follow-up intents
          if (result.product.category) {
            outputContexts.push({
              name: `${session}/contexts/category_selected`,
              lifespanCount: 5,
              parameters: {
                product_category: result.product.category,
              },
            });
          }
        }
      } else if (multiResults.length > 0) {
        // Multiple matches: show concise list
        responseText = lookupService.formatMultiProductResponse(multiResults);
      } else {
        // No match found
        responseText = `🛍️ I couldn't find any products matching "${searchTerm}".\n\nYou can search by product code (e.g. P00481) or explore our store categories on NookMint!`;
      }

      const responsePayload: DialogflowWebhookResponse = {
        fulfillmentText: responseText,
        fulfillmentMessages: [
          {
            text: {
              text: [responseText],
            },
          },
        ],
        source: 'nookmint-ecommerce-webhook',
      };

      if (outputContexts.length > 0) {
        responsePayload.outputContexts = outputContexts;
      }

      return NextResponse.json(responsePayload, { status: 200 });
    }

    case 'product.details.followup':
    case 'product.availability.followup': {
      // 1. Read product_selected from incoming outputContexts
      const productContext = getContext(queryResult.outputContexts, 'product_selected');
      const contextProductId = productContext?.parameters?.productId;
      const contextProductCode = productContext?.parameters?.productCode;
      const contextProductTitle = productContext?.parameters?.productTitle;

      let result: FormattedProductResult | null = null;

      // 2. Lookup product by code or ID
      if (contextProductCode) {
        result = await lookupService.findByProductCode(String(contextProductCode));
      }
      if (!result && contextProductId) {
        result = await lookupService.findByProductCode(String(contextProductId));
      }
      if (!result && contextProductTitle) {
        const searchResults = await lookupService.searchProducts(String(contextProductTitle), 1);
        if (searchResults.length > 0) result = searchResults[0];
      }

      // Check if user specified a code directly in follow-up message
      if (!result) {
        const codeMatch = String(rawQuery).match(/\b(NM-P\d+|P\d+)\b/i);
        if (codeMatch) {
          result = await lookupService.findByProductCode(codeMatch[1]);
        }
      }

      // 3. Fallback if no product context exists or is expired
      if (!result) {
        const fallbackText = "🛍️ Which product are you asking about? Please provide the product name or code (e.g. P00481) so I can help!";
        return NextResponse.json(
          {
            fulfillmentText: fallbackText,
            fulfillmentMessages: [{ text: { text: [fallbackText] } }],
            source: 'nookmint-ecommerce-webhook',
          },
          { status: 200 }
        );
      }

      // 4. Formulate targeted response based on follow-up intent and user question
      let responseText = '';
      const queryLower = rawQuery.toLowerCase();

      if (intentName === 'product.availability.followup') {
        // Check if customer asked for a specific quantity (e.g. "do you have 3?", "item eken 5k")
        let requestedQty: number | undefined;
        const qtyMatch = queryLower.match(/\b(\d+)\s*(?:units?|items?|pieces?|k|packs?)?\b/i);
        if (qtyMatch) {
          const parsed = parseInt(qtyMatch[1], 10);
          if (!isNaN(parsed) && parsed > 0 && parsed < 1000) {
            requestedQty = parsed;
          }
        }
        responseText = lookupService.formatStockFollowupResponse(result, requestedQty);
      } else {
        // product.details.followup
        const isPriceQuery = /\b(price|keeyada|kiyada|keeyak|cost|mila|gaana|how\s*much)\b/i.test(queryLower);
        const isColorQuery = /\b(colo[u]?r|colo[u]?rs|pata|options?)\b/i.test(queryLower);
        const isFeatureQuery = /\b(features?|spec|specs|specifications?|about|description|details)\b/i.test(queryLower);

        if (isPriceQuery) {
          responseText = lookupService.formatPriceResponse(result);
        } else if (isColorQuery) {
          responseText = lookupService.formatColorsResponse(result);
        } else if (isFeatureQuery) {
          responseText = lookupService.formatGeneralDetailsResponse(result);
        } else {
          // Default to price response if "How much is this?" or general inquiry
          responseText = lookupService.formatPriceResponse(result);
        }
      }

      // 5. Renew output contexts: product_selected and category_selected with lifespan = 5
      const outputContexts: DialogflowContext[] = [];
      if (session) {
        outputContexts.push({
          name: `${session}/contexts/product_selected`,
          lifespanCount: 5,
          parameters: {
            productId: result.product.id,
            productCode: result.productCode,
            productTitle: result.product.title,
            productPrice: result.product.sellingPrice,
            canonicalUrl: result.canonicalUrl,
          },
        });

        const categoryContext = getContext(queryResult.outputContexts, 'category_selected');
        const categoryName = categoryContext?.parameters?.product_category || result.product.category;
        if (categoryName) {
          outputContexts.push({
            name: `${session}/contexts/category_selected`,
            lifespanCount: 5,
            parameters: {
              product_category: categoryName,
            },
          });
        }
      }

      return NextResponse.json(
        {
          fulfillmentText: responseText,
          fulfillmentMessages: [{ text: { text: [responseText] } }],
          outputContexts,
          source: 'nookmint-ecommerce-webhook',
        },
        { status: 200 }
      );
    }

    default: {
      // For any intent not explicitly dynamic, allow Dialogflow to use its default responses
      return NextResponse.json(
        {
          fulfillmentText: queryResult.fulfillmentText || 'How can I help you with NookMint products?',
          source: 'nookmint-ecommerce-webhook',
        },
        { status: 200 }
      );
    }
  }
}
