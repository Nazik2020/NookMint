/**
 * Dialogflow ES REST Client for Nooki (NookMint Chatbot)
 *
 * Calls the Dialogflow ES detectIntent REST endpoint directly — no SDK needed.
 * Authentication: Dialogflow ES API key (passed as ?key= query param).
 *
 * This runs only on the server (/api/chat route). The API key is NEVER sent to the browser.
 */

export interface DialogflowDetectIntentRequest {
  session: string;
  queryInput: {
    text: {
      text: string;
      languageCode: string;
    };
  };
}

export interface DialogflowDetectIntentResponse {
  responseId?: string;
  queryResult?: {
    queryText?: string;
    action?: string;
    parameters?: Record<string, unknown>;
    fulfillmentText?: string;
    fulfillmentMessages?: Array<{ text?: { text?: string[] } }>;
    intent?: {
      name?: string;
      displayName?: string;
    };
    intentDetectionConfidence?: number;
    outputContexts?: Array<{
      name: string;
      lifespanCount?: number;
      parameters?: Record<string, unknown>;
    }>;
  };
}

/**
 * Calls Dialogflow ES detectIntent REST API and returns the parsed response.
 *
 * Required env vars (server-side only):
 *   DIALOGFLOW_PROJECT_ID     — your GCP project ID (e.g. "nooki-chatbot-xxxxx")
 *   DIALOGFLOW_API_KEY        — Dialogflow ES API key from Google Cloud Console
 *
 * @param sessionId  Unique per-user/per-tab session string (e.g. UUID)
 * @param text       Normalized customer message (after Singlish preprocessing)
 * @param languageCode  Dialogflow language code (default: "en")
 */
export async function detectIntent(
  sessionId: string,
  text: string,
  languageCode: string = 'en'
): Promise<DialogflowDetectIntentResponse> {
  const projectId = process.env.DIALOGFLOW_PROJECT_ID?.trim();
  const apiKey = process.env.DIALOGFLOW_API_KEY?.trim();

  if (!projectId || !apiKey) {
    throw new Error(
      'Missing DIALOGFLOW_PROJECT_ID or DIALOGFLOW_API_KEY environment variables. ' +
        'Add them to .env.local and Vercel project settings.'
    );
  }

  const url =
    `https://dialogflow.googleapis.com/v2/projects/${projectId}/agent/sessions/${sessionId}:detectIntent` +
    `?key=${apiKey}`;

  const payload: DialogflowDetectIntentRequest = {
    session: `projects/${projectId}/agent/sessions/${sessionId}`,
    queryInput: {
      text: {
        text,
        languageCode,
      },
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Dialogflow API error ${res.status}: ${errText}`);
  }

  return res.json() as Promise<DialogflowDetectIntentResponse>;
}
