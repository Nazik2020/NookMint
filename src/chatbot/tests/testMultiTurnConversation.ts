import { POST } from '../../app/api/dialogflow/route';
import { NextRequest } from 'next/server';
import { DialogflowContext } from '../dialogflow/dialogflowTypes';

async function runMultiTurnConversationTests() {
  console.log('=== Running Multi-Turn Conversation Tests for Nooki Follow-Up Intents ===\n');
  const session = 'projects/nooki-lgqe/agent/sessions/multi-turn-session-test-789';

  let activeContexts: DialogflowContext[] = [];

  // -------------------------------------------------------------
  // Turn 1: Initial Product Search ("Boom Wash")
  // -------------------------------------------------------------
  console.log('--- Turn 1: User asks "Boom Wash" (product.search) ---');
  const req1 = new NextRequest('http://localhost:3000/api/dialogflow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session,
      queryResult: {
        queryText: 'Boom Wash',
        intent: { displayName: 'product.search' },
        parameters: { product: 'Boom Wash' },
        outputContexts: activeContexts,
      },
    }),
  });

  const res1 = await POST(req1);
  const data1 = await res1.json();

  console.log('Response Status:', res1.status);
  console.log('Nooki Response:\n', data1.fulfillmentText);

  if (!data1.fulfillmentText.includes('Boom Wash') || !data1.fulfillmentText.includes('LKR 680')) {
    console.error('❌ Turn 1 Failed: Expected Boom Wash details');
    process.exit(1);
  }

  // Update active contexts from Turn 1 response
  activeContexts = data1.outputContexts || [];
  const hasProductContext = activeContexts.some((c) => c.name.includes('product_selected'));
  const hasCategoryContext = activeContexts.some((c) => c.name.includes('category_selected'));

  if (!hasProductContext || !hasCategoryContext) {
    console.error('❌ Turn 1 Failed: Missing product_selected or category_selected output context');
    process.exit(1);
  }
  console.log('✅ Turn 1 Passed: Both product_selected and category_selected contexts set!\n');

  // -------------------------------------------------------------
  // Turn 2: Follow-up Price Question ("How much is this?")
  // -------------------------------------------------------------
  console.log('--- Turn 2: User asks "How much is this?" (product.details.followup) ---');
  const req2 = new NextRequest('http://localhost:3000/api/dialogflow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session,
      queryResult: {
        queryText: 'How much is this?',
        intent: { displayName: 'product.details.followup' },
        parameters: {},
        outputContexts: activeContexts,
      },
    }),
  });

  const res2 = await POST(req2);
  const data2 = await res2.json();

  console.log('Response Status:', res2.status);
  console.log('Nooki Response:\n', data2.fulfillmentText);

  if (!data2.fulfillmentText.includes('LKR 680') || !data2.fulfillmentText.includes('Boom Wash')) {
    console.error('❌ Turn 2 Failed: Did not answer price for the context product');
    process.exit(1);
  }

  // Verify context was renewed with lifespan = 5
  activeContexts = data2.outputContexts || [];
  const renewedProductContext = activeContexts.find((c) => c.name.includes('product_selected'));

  if (!renewedProductContext || renewedProductContext.lifespanCount !== 5) {
    console.error('❌ Turn 2 Failed: product_selected was not renewed with lifespan 5');
    process.exit(1);
  }
  console.log('✅ Turn 2 Passed: Answered price and renewed product_selected context!\n');

  // -------------------------------------------------------------
  // Turn 3: Follow-up Stock Availability Question ("Is it in stock?")
  // -------------------------------------------------------------
  console.log('--- Turn 3: User asks "Is it in stock?" (product.availability.followup) ---');
  const req3 = new NextRequest('http://localhost:3000/api/dialogflow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session,
      queryResult: {
        queryText: 'Is it in stock?',
        intent: { displayName: 'product.availability.followup' },
        parameters: {},
        outputContexts: activeContexts,
      },
    }),
  });

  const res3 = await POST(req3);
  const data3 = await res3.json();

  console.log('Response Status:', res3.status);
  console.log('Nooki Response:\n', data3.fulfillmentText);

  if (!data3.fulfillmentText.includes('in stock') || !data3.fulfillmentText.includes('Boom Wash')) {
    console.error('❌ Turn 3 Failed: Did not answer stock for the context product');
    process.exit(1);
  }

  // Verify context was renewed again
  activeContexts = data3.outputContexts || [];
  const turn3ProductContext = activeContexts.find((c) => c.name.includes('product_selected'));

  if (!turn3ProductContext || turn3ProductContext.lifespanCount !== 5) {
    console.error('❌ Turn 3 Failed: product_selected was not renewed');
    process.exit(1);
  }
  console.log('✅ Turn 3 Passed: Answered live stock and renewed product_selected context!\n');

  // -------------------------------------------------------------
  // Turn 4: Context Expired / Missing Context Test
  // -------------------------------------------------------------
  console.log('--- Turn 4: User asks "How much is this?" with NO active context ---');
  const req4 = new NextRequest('http://localhost:3000/api/dialogflow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session,
      queryResult: {
        queryText: 'How much is this?',
        intent: { displayName: 'product.details.followup' },
        parameters: {},
        outputContexts: [], // Empty / expired contexts
      },
    }),
  });

  const res4 = await POST(req4);
  const data4 = await res4.json();

  console.log('Response Status:', res4.status);
  console.log('Nooki Response:\n', data4.fulfillmentText);

  if (!data4.fulfillmentText.includes('Which product are you asking about?')) {
    console.error('❌ Turn 4 Failed: Expected fallback clarification prompt');
    process.exit(1);
  }
  console.log('✅ Turn 4 Passed: Gracefully asked for clarification when context was missing!\n');

  // -------------------------------------------------------------
  // Turn 5: Entity Collision Defense Test (product.category with actual product name)
  // -------------------------------------------------------------
  console.log('--- Turn 5: Collision Test: Intent is product.category but query has product name "Boom Wash" ---');
  const req5 = new NextRequest('http://localhost:3000/api/dialogflow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session,
      queryResult: {
        queryText: 'Adjustable Boom Wash Cleaning Powder',
        intent: { displayName: 'product.category' },
        parameters: { product_category: 'Kitchen & Dining' },
        outputContexts: [],
      },
    }),
  });

  const res5 = await POST(req5);
  const data5 = await res5.json();

  console.log('Response Status:', res5.status);
  console.log('Nooki Response:\n', data5.fulfillmentText);

  if (!data5.fulfillmentText.includes('Boom Wash') || !data5.fulfillmentText.includes('LKR 680')) {
    console.error('❌ Turn 5 Failed: Expected product card defense override');
    process.exit(1);
  }
  console.log('✅ Turn 5 Passed: Successfully defended against entity collision and returned the product card!\n');

  console.log('🎉 ALL MULTI-TURN CONVERSATION TESTS PASSED 100%!');
}

runMultiTurnConversationTests().catch((err) => {
  console.error('Error in multi-turn tests:', err);
  process.exit(1);
});
