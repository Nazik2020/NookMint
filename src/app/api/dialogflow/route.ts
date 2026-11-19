import { NextRequest, NextResponse } from 'next/server';
import { ProductLookupService } from '../../../chatbot/services/productLookupService';
import {
  DialogflowWebhookRequest,
  DialogflowWebhookResponse,
  DialogflowContext,
} from '../../../chatbot/dialogflow/dialogflowTypes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
