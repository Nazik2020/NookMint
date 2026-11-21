import { NextRequest, NextResponse } from 'next/server';
import { detectIntent } from '../../../chatbot/dialogflow/dialogflowClient';
import { preprocessCustomerMessage } from '../../../chatbot/nlp/singlishPreprocessor';
import { ProductLookupService, extractRequestedQuantity } from '../../../chatbot/services/productLookupService';
import { DialogflowContext } from '../../../chatbot/dialogflow/dialogflowTypes';

export const dynamic = 'force-dynamic';

// In-memory session context memory for serverless resilience
interface SessionContextMemory {
  contexts: DialogflowContext[];
  lastUpdated: number;
}
const serverSessionMemory = new Map<string, SessionContextMemory>();

function getContext(contexts: DialogflowContext[] | undefined, targetName: string): DialogflowContext | undefined {
  if (!contexts || !Array.isArray(contexts)) return undefined;
  const cleanTarget = targetName.toLowerCase().trim();
  return contexts.find((ctx) => {
    const rawName = ctx.name || '';
    const namePart = rawName.includes('/contexts/') ? rawName.split('/contexts/')[1] : rawName;
    return namePart.toLowerCase().trim() === cleanTarget;
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.message !== 'string' || !body.message.trim()) {
      return NextResponse.json(
        { error: 'A valid "message" string is required in the request body.' },
        { status: 400 }
      );
    }

    const rawMessage = body.message.trim();
    const sessionId = (body.sessionId && String(body.sessionId).trim()) || `session-${Date.now()}`;

    // 1. Singlish & Product Code Preprocessing
    const preprocessed = preprocessCustomerMessage(rawMessage);
    const textToSend = preprocessed.normalized || rawMessage;

    // 2. Resolve Active Conversation Contexts (client-passed or server cache)
    const clientContexts: DialogflowContext[] = Array.isArray(body.contexts) ? body.contexts : [];
    const cachedMemory = serverSessionMemory.get(sessionId);
    const activeContexts: DialogflowContext[] = clientContexts.length > 0 ? clientContexts : (cachedMemory?.contexts || []);

    // 3. Check credentials configuration
    const projectId = process.env.DIALOGFLOW_PROJECT_ID?.trim();
    const clientEmail = process.env.DIALOGFLOW_CLIENT_EMAIL?.trim();
    const privateKey = process.env.DIALOGFLOW_PRIVATE_KEY?.trim();
    const apiKey = process.env.DIALOGFLOW_API_KEY?.trim();

    const hasServiceAccount = Boolean(clientEmail && privateKey);
    const hasApiKey = Boolean(apiKey && apiKey !== 'PASTE_YOUR_API_KEY_HERE');

    const lookupService = new ProductLookupService();
    const sessionBase = `projects/${projectId || 'nookmint'}/agent/sessions/${sessionId}`;

    // 4. Attempt Dialogflow ES detectIntent if credentials are configured
    let dialogflowResponse: any = null;
    const isCredentialsConfigured = Boolean(projectId && (hasServiceAccount || hasApiKey));

    if (isCredentialsConfigured) {
      try {
        dialogflowResponse = await detectIntent(sessionId, textToSend, 'en', activeContexts);
      } catch (err: any) {
        console.warn('Dialogflow detectIntent call failed, falling back to local NLP:', err?.message || err);
        dialogflowResponse = null;
      }
    }

    const queryResult = dialogflowResponse?.queryResult;
    let reply =
      queryResult?.fulfillmentText ||
      queryResult?.fulfillmentMessages?.[0]?.text?.text?.[0] ||
      '';

    let intent = queryResult?.intent?.displayName || 'Default Fallback Intent';
    let outputContexts: DialogflowContext[] = queryResult?.outputContexts || [];

    // 5. If customer provided a product code (e.g. P00481) and Dialogflow returned a generic prompt or unfulfilled response
    if (preprocessed.detectedProductCodes.length > 0 && (!reply || reply.includes('share the product name or code') || reply.includes('Please share'))) {
      const code = preprocessed.detectedProductCodes[0];
      const match = await lookupService.findByProductCode(code);
      if (match) {
        reply = lookupService.formatSingleProductResponse(match);
        intent = 'product.details';
        outputContexts = [
          {
            name: `${sessionBase}/contexts/product_selected`,
            lifespanCount: 5,
            parameters: {
              productId: match.product.id,
              productCode: match.productCode,
              productTitle: match.product.title,
              productPrice: match.product.sellingPrice,
              canonicalUrl: match.canonicalUrl,
            },
          },
        ];
        serverSessionMemory.set(sessionId, { contexts: outputContexts, lastUpdated: Date.now() });
      }
    }

    // 5B. Standardize & Shorten FAQ responses for chatbot interface (Delivery, COD, Order Instructions)
    if (intent === 'delivery.fee' || intent === 'delivery.inquiry' || intent === 'delivery inquiry') {
      reply = lookupService.getDeliveryFaqResponse();
    } else if (intent === 'payment.cod') {
      reply = lookupService.getCodFaqResponse();
    } else if (intent === 'order.how_to') {
      reply = lookupService.getOrderHowToResponse();
    } else if (intent === 'product.availability.followup') {
      const selectedCtx = getContext(outputContexts, 'product_selected') || getContext(activeContexts, 'product_selected');
      const selectedCodeOrId = selectedCtx?.parameters?.productCode || selectedCtx?.parameters?.productId;
      if (selectedCodeOrId) {
        const productResult =
          (await lookupService.findByProductCode(String(selectedCodeOrId))) ||
          (await lookupService.findById(String(selectedCodeOrId)));
        if (productResult) {
          const requestedQty = extractRequestedQuantity(textToSend);
          reply = lookupService.formatStockFollowupResponse(productResult, requestedQty);
        }
      }
    }

    // 6. Intelligent Fallback Routing:
    // If Dialogflow returned Fallback, unconfigured, or was unreachable,
    // inspect the message for product follow-ups, greetings, and catalogue search.
    if (!queryResult || intent === 'Default Fallback Intent' || intent === 'system.unconfigured') {
      const selectedCtx = getContext(activeContexts, 'product_selected');
      const selectedCodeOrId = selectedCtx?.parameters?.productCode || selectedCtx?.parameters?.productId;

      // 6A. Selected-Product Follow-Up Check (Stock Availability or Price Inquiries)
      if (selectedCodeOrId) {
        const productResult =
          (await lookupService.findByProductCode(String(selectedCodeOrId))) ||
          (await lookupService.findById(String(selectedCodeOrId)));

        if (productResult) {
          const requestedQty = extractRequestedQuantity(textToSend);

          if (lookupService.isAvailabilityInquiry(textToSend)) {
            reply = lookupService.formatStockFollowupResponse(productResult, requestedQty);
            intent = 'product.availability.followup';
            outputContexts = [
              {
                name: `${sessionBase}/contexts/product_selected`,
                lifespanCount: 5,
                parameters: selectedCtx.parameters,
              },
            ];
            serverSessionMemory.set(sessionId, { contexts: outputContexts, lastUpdated: Date.now() });

            return NextResponse.json(
              {
                reply,
                intent,
                sessionId,
                outputContexts,
                preprocessedText: textToSend,
                detectedCodes: preprocessed.detectedProductCodes,
              },
              { status: 200 }
            );
          }

          if (lookupService.isPriceInquiry(textToSend)) {
            reply = lookupService.formatPriceResponse(productResult);
            intent = 'product.details.followup';
            outputContexts = [
              {
                name: `${sessionBase}/contexts/product_selected`,
                lifespanCount: 5,
                parameters: selectedCtx.parameters,
              },
            ];
            serverSessionMemory.set(sessionId, { contexts: outputContexts, lastUpdated: Date.now() });

            return NextResponse.json(
              {
                reply,
                intent,
                sessionId,
                outputContexts,
                preprocessedText: textToSend,
                detectedCodes: preprocessed.detectedProductCodes,
              },
              { status: 200 }
            );
          }
        }
      }

      // 6B. FAQ & Conversational Greeting Checks
      if (lookupService.isGeneralGreeting(textToSend)) {
        reply = "👋 Hi there! I'm Nooki, your shopping buddy at NookMint. Ask me about products, prices, stock availability, or Cash on Delivery across Sri Lanka!";
        intent = 'Default Welcome Intent';
      } else if (lookupService.isDeliveryInquiry(textToSend)) {
        reply = lookupService.getDeliveryFaqResponse();
        intent = 'delivery.fee';
      } else if (lookupService.isCodInquiry(textToSend)) {
        reply = lookupService.getCodFaqResponse();
        intent = 'payment.cod';
      } else if (lookupService.isOrderHowToInquiry(textToSend)) {
        reply = lookupService.getOrderHowToResponse();
        intent = 'order.how_to';
      } else {
        // 6C. Partial Product Name, Multiple Keywords & Category Search
        const searchResults = await lookupService.searchProducts(textToSend, 3);

        if (searchResults.length === 1) {
          // Exactly 1 clear match found!
          const match = searchResults[0];
          const requestedQty = extractRequestedQuantity(textToSend);
          reply = lookupService.formatSingleProductResponse(match, requestedQty);
          intent = 'product.search';

          const productContext: DialogflowContext = {
            name: `${sessionBase}/contexts/product_selected`,
            lifespanCount: 5,
            parameters: {
              productId: match.product.id,
              productCode: match.productCode,
              productTitle: match.product.title,
              productPrice: match.product.sellingPrice,
              canonicalUrl: match.canonicalUrl,
            },
          };

          outputContexts = [productContext];

          if (match.product.category) {
            outputContexts.push({
              name: `${sessionBase}/contexts/category_selected`,
              lifespanCount: 5,
              parameters: { product_category: match.product.category },
            });
          }

          serverSessionMemory.set(sessionId, { contexts: outputContexts, lastUpdated: Date.now() });
        } else if (searchResults.length > 1) {
          // Multiple plausible matches found: offer customer a choice
          reply = lookupService.formatMultiProductResponse(searchResults);
          intent = 'product.search.multiple';
          outputContexts = [];
        } else {
          // No product match met threshold: return polite fallback without hallucinating
          if (!reply) {
            reply = "I'm sorry, I couldn't find an answer for that. You can search by product code (e.g. P00481), explore our product catalogue, or contact our WhatsApp team (+94 71 489 7262)!";
          }
          intent = 'Default Fallback Intent';
        }
      }
    } else {
      // Normal Dialogflow intent matched: update active session memory
      if (outputContexts.length > 0) {
        serverSessionMemory.set(sessionId, { contexts: outputContexts, lastUpdated: Date.now() });
      }
    }

    return NextResponse.json(
      {
        reply,
        intent,
        sessionId,
        outputContexts,
        preprocessedText: textToSend,
        detectedCodes: preprocessed.detectedProductCodes,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in /api/chat route:', error);

    const errorMessage = error?.message || 'Internal server error';

    // Gracefully handle unauthenticated Dialogflow API keys / missing permissions
    if (
      errorMessage.includes('API keys are not supported by this API') ||
      errorMessage.includes('API error 401') ||
      errorMessage.includes('CREDENTIALS_MISSING') ||
      errorMessage.includes('Missing Dialogflow credentials')
    ) {
      return NextResponse.json(
        {
          reply:
            "🤖 Google Dialogflow requires a Service Account key (OAuth2) rather than an API key. Please add DIALOGFLOW_CLIENT_EMAIL and DIALOGFLOW_PRIVATE_KEY to Vercel. Our team is also available via WhatsApp!",
          intent: 'system.service_account_required',
          error: errorMessage,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        reply:
          "⚠️ We're momentarily having trouble connecting to the Nooki assistant. Please reach out to us on WhatsApp (+94 71 489 7262) for instant support!",
        intent: 'system.error',
        error: errorMessage,
      },
      { status: 200 }
    );
  }
}
