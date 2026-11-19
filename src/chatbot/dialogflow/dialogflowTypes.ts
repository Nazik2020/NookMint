/**
 * Dialogflow Essentials (ES) Webhook Request and Response Type Definitions
 */

export interface DialogflowContext {
  name: string;
  lifespanCount?: number;
  parameters?: Record<string, any>;
}

export interface DialogflowWebhookRequest {
  responseId?: string;
  session?: string;
  queryResult?: {
    queryText?: string;
    action?: string;
    parameters?: Record<string, any>;
    allRequiredParamsPresent?: boolean;
    fulfillmentText?: string;
    fulfillmentMessages?: Array<Record<string, any>>;
    outputContexts?: DialogflowContext[];
    intent?: {
      name?: string;
      displayName?: string;
    };
    intentDetectionConfidence?: number;
    languageCode?: string;
  };
  originalDetectIntentRequest?: {
    source?: string;
    payload?: Record<string, any>;
  };
}

export interface DialogflowWebhookResponse {
  fulfillmentText: string;
  fulfillmentMessages?: Array<{
    text: {
      text: string[];
    };
  }>;
  source?: string;
  outputContexts?: DialogflowContext[];
}
