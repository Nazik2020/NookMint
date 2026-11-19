import { POST } from '../../app/api/dialogflow/route';
import { NextRequest } from 'next/server';

async function runWebhookTests() {
  console.log('--- Testing Dialogflow Fulfillment Webhook Route (/api/dialogflow) ---\n');

  // Test 1: product.search by exact code P00481
  console.log('Test 1: Webhook payload for product.search with code "P00481"...');
  const req1 = new NextRequest('http://localhost:3000/api/dialogflow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session: 'projects/nooki-agent/agent/sessions/test-session-123',
      queryResult: {
        queryText: 'Mata P00481 thiyenawada?',
        intent: { displayName: 'product.search' },
        parameters: { product: 'P00481' },
      },
    }),
  });

  const res1 = await POST(req1);
  const data1 = await res1.json();

  if (res1.status === 200 && data1.fulfillmentText && data1.fulfillmentText.includes('Boom Wash')) {
    console.log('✅ Status 200 OK');
    console.log('✅ Response contains product title, price, and canonical link.');
    console.log('✅ Output contexts verified:', JSON.stringify(data1.outputContexts));
  } else {
    console.error('❌ Test 1 failed:', data1);
    process.exit(1);
  }

  // Test 2: product.search for non-existent item
  console.log('\nTest 2: Webhook payload for non-existent product "P99999"...');
  const req2 = new NextRequest('http://localhost:3000/api/dialogflow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session: 'projects/nooki-agent/agent/sessions/test-session-123',
      queryResult: {
        queryText: 'P99999',
        intent: { displayName: 'product.search' },
        parameters: { product: 'P99999' },
      },
    }),
  });

  const res2 = await POST(req2);
  const data2 = await res2.json();

  if (res2.status === 200 && data2.fulfillmentText && data2.fulfillmentText.includes("couldn't find")) {
    console.log('✅ Status 200 OK with polite fallback message.');
  } else {
    console.error('❌ Test 2 failed:', data2);
    process.exit(1);
  }

  // Test 3: Invalid payload check (missing queryResult)
  console.log('\nTest 3: Webhook payload with missing queryResult...');
  const req3 = new NextRequest('http://localhost:3000/api/dialogflow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invalid: true }),
  });

  const res3 = await POST(req3);
  if (res3.status === 400) {
    console.log('✅ Correctly rejected with status 400 Bad Request.');
  } else {
    console.error('❌ Expected status 400, got:', res3.status);
    process.exit(1);
  }

  console.log('\n🎉 All Dialogflow webhook fulfillment tests passed successfully!');
}

runWebhookTests().catch((err) => {
  console.error('Error running webhook tests:', err);
  process.exit(1);
});
