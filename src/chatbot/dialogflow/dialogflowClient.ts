import crypto from 'crypto';

/**
 * Dialogflow ES REST Client for Nooki (NookMint Chatbot)
 *
 * Supports two authentication modes:
 * 1. Google Cloud Service Account (OAuth2 JWT exchange - Recommended & Required by Dialogflow v2)
 *    Requires: DIALOGFLOW_PROJECT_ID, DIALOGFLOW_CLIENT_EMAIL, DIALOGFLOW_PRIVATE_KEY
 * 2. API Key query parameter fallback (?key=...)
 *
 * Runs exclusively server-side. Credentials are NEVER sent to the browser.
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

// In-memory token cache to avoid exchanging JWT on every turn
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Generates and exchanges a signed Google OAuth2 Service Account JWT for a bearer access token.
 * Uses native Node.js crypto (RS256) with zero external dependencies.
 */
async function getGoogleOAuth2AccessToken(clientEmail: string, privateKeyRaw: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // Return cached token if valid for at least another 60 seconds
  if (cachedToken && cachedToken.expiresAt > now + 60) {
    return cachedToken.token;
  }

  // Handle both escaped \n and raw newlines from environment variables, and strip any surrounding quotes
  let cleanPrivateKey = privateKeyRaw.trim();
  if (
    (cleanPrivateKey.startsWith('"') && cleanPrivateKey.endsWith('"')) ||
    (cleanPrivateKey.startsWith("'") && cleanPrivateKey.endsWith("'"))
  ) {
    cleanPrivateKey = cleanPrivateKey.slice(1, -1);
  }
  cleanPrivateKey = cleanPrivateKey.replace(/\\n/g, '\n').trim();

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const payload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/dialogflow',
  };

  const base64Url = (obj: any) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const unsignedToken = `${base64Url(header)}.${base64Url(payload)}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsignedToken);
  sign.end();

  const signature = sign
    .sign(cleanPrivateKey, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwtAssertion = `${unsignedToken}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwtAssertion,
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text().catch(() => '');
    throw new Error(`Google OAuth2 token error ${tokenRes.status}: ${errText}`);
  }

  const tokenData = (await tokenRes.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: tokenData.access_token,
    expiresAt: now + (tokenData.expires_in || 3600),
  };

  return cachedToken.token;
}

/**
 * Calls Dialogflow ES detectIntent REST API and returns the parsed response.
 */
export async function detectIntent(
  sessionId: string,
  text: string,
  languageCode: string = 'en'
): Promise<DialogflowDetectIntentResponse> {
  const projectId = process.env.DIALOGFLOW_PROJECT_ID?.trim();
  const clientEmail = process.env.DIALOGFLOW_CLIENT_EMAIL?.trim();
  const privateKey = process.env.DIALOGFLOW_PRIVATE_KEY?.trim();
  const apiKey = process.env.DIALOGFLOW_API_KEY?.trim();

  if (!projectId) {
    throw new Error('Missing DIALOGFLOW_PROJECT_ID environment variable.');
  }

  let url = `https://dialogflow.googleapis.com/v2/projects/${projectId}/agent/sessions/${sessionId}:detectIntent`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 1. Prefer Google Cloud Service Account OAuth2 Bearer Authentication
  if (clientEmail && privateKey) {
    const accessToken = await getGoogleOAuth2AccessToken(clientEmail, privateKey);
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else if (apiKey && apiKey !== 'PASTE_YOUR_API_KEY_HERE') {
    // 2. Fallback to API Key query parameter
    url += `?key=${apiKey}`;
  } else {
    throw new Error(
      'Missing Dialogflow credentials. Please configure DIALOGFLOW_CLIENT_EMAIL & DIALOGFLOW_PRIVATE_KEY in .env.local and Vercel.'
    );
  }

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
    headers,
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Dialogflow API error ${res.status}: ${errText}`);
  }

  return res.json() as Promise<DialogflowDetectIntentResponse>;
}
