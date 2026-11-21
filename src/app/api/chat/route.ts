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
    // Use provided sessionId or fallback to a per-request default
    const sessionId = (body.sessionId && String(body.sessionId).trim()) || `session-${Date.now()}`;

    // 1. Singlish & Product Code Preprocessing
    const preprocessed = preprocessCustomerMessage(rawMessage);
    const textToSend = preprocessed.normalized || rawMessage;

    // 2. Check if API credentials are configured
    const apiKey = process.env.DIALOGFLOW_API_KEY?.trim();
    const projectId = process.env.DIALOGFLOW_PROJECT_ID?.trim();

    if (!apiKey || apiKey === 'PASTE_YOUR_API_KEY_HERE' || !projectId) {
      return NextResponse.json(
        {
          reply:
            "👋 Hi there! Nooki is almost ready, but our Google Dialogflow ES API key is currently being configured. In the meantime, feel free to browse our products or reach our team directly via WhatsApp (+94 71 489 7262)!",
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
      "I'm sorry, I couldn't find an answer for that. Please try rephrasing or check our product catalogue!";

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

    // Handle common Dialogflow API key / permission errors gracefully
    if (errorMessage.includes('API error 400') || errorMessage.includes('API error 403') || errorMessage.includes('API key not valid')) {
      return NextResponse.json(
        {
          reply:
            "⚠️ Nooki is currently updating its connection to Dialogflow. Please ensure your Google Cloud Dialogflow API key is enabled with the Dialogflow API. You can also chat with us directly on WhatsApp!",
          intent: 'system.error',
          error: errorMessage,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to process chat message',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
