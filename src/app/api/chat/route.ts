import { NextRequest, NextResponse } from 'next/server';
import { detectIntent } from '../../../chatbot/dialogflow/dialogflowClient';
import { preprocessCustomerMessage } from '../../../chatbot/nlp/singlishPreprocessor';

export const dynamic = 'force-dynamic';

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

    // 2. Check credentials configuration
    const projectId = process.env.DIALOGFLOW_PROJECT_ID?.trim();
    const clientEmail = process.env.DIALOGFLOW_CLIENT_EMAIL?.trim();
    const privateKey = process.env.DIALOGFLOW_PRIVATE_KEY?.trim();
    const apiKey = process.env.DIALOGFLOW_API_KEY?.trim();

    const hasServiceAccount = Boolean(clientEmail && privateKey);
    const hasApiKey = Boolean(apiKey && apiKey !== 'PASTE_YOUR_API_KEY_HERE');

    if (!projectId || (!hasServiceAccount && !hasApiKey)) {
      return NextResponse.json(
        {
          reply:
            "👋 Hi there! Nooki is ready, but our Google Dialogflow ES credentials are being linked. In the meantime, feel free to browse our products or reach our team directly via WhatsApp (+94 71 489 7262)!",
          intent: 'system.unconfigured',
          preprocessedText: textToSend,
          sessionId,
        },
        { status: 200 }
      );
    }

    // 3. Call Dialogflow ES detectIntent REST API
    const dialogflowResponse = await detectIntent(sessionId, textToSend);

    const queryResult = dialogflowResponse.queryResult;
    const reply =
      queryResult?.fulfillmentText ||
      queryResult?.fulfillmentMessages?.[0]?.text?.text?.[0] ||
      "I'm sorry, I couldn't find an answer for that. Please try rephrasing or explore our product catalogue!";

    const intent = queryResult?.intent?.displayName || 'Default Fallback Intent';
    const outputContexts = queryResult?.outputContexts || [];

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
