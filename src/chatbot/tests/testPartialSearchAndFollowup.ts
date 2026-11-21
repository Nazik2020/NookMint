import fs from 'fs';
import path from 'path';

// Parse .env.local if present so test runner can test both online Dialogflow & local NLP fallback
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

import { NextRequest } from 'next/server';
import { POST as chatRouteHandler } from '../../app/api/chat/route';
import { ProductLookupService } from '../services/productLookupService';

async function runRegressionSuite() {
  console.log('================================================================');
  console.log('🧪 RUNNING NOOKI PARTIAL PRODUCT RECOGNITION & SEARCH TEST SUITE');
  console.log('================================================================\n');

  const lookupService = new ProductLookupService();
  let passedCount = 0;
  let totalCount = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalCount++;
    if (condition) {
      console.log(`✅ PASS [${totalCount}]: ${testName}`);
      passedCount++;
    } else {
      console.error(`❌ FAIL [${totalCount}]: ${testName}`);
      if (details) console.error(`   Details: ${details}`);
      process.exitCode = 1;
    }
  }

  // Helper to simulate calling /api/chat route directly
  async function callChat(message: string, sessionId: string, contexts: any[] = []) {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId, contexts }),
    });
    const res = await chatRouteHandler(req);
    return res.json();
  }

  // --- Test 1: "30 led solar" (Partial Name Recognition) ---
  console.log('--- Test 1: "30 led solar" (Partial Name Recognition) ---');
  const session1 = `test-session-solar-${Date.now()}`;
  const res1 = await callChat('30 led solar', session1);
  assert(
    res1.intent === 'product.search' &&
    res1.reply.includes('30 LED Solar Wall Light') &&
    res1.reply.includes('P00109') &&
    res1.reply.includes('980') &&
    res1.outputContexts?.some((c: any) => c.name.includes('product_selected')),
    'Query "30 led solar" correctly finds 30 LED Solar Wall Light with price and context',
    JSON.stringify(res1)
  );

  // --- Test 2: "solar wall light" (Different Partial Phrase) ---
  console.log('\n--- Test 2: "solar wall light" (Partial Phrase) ---');
  const res2 = await callChat('solar wall light', `session-${Date.now()}`);
  assert(
    res2.intent === 'product.search' &&
    res2.reply.includes('30 LED Solar Wall Light') &&
    res2.reply.includes('P00109'),
    'Query "solar wall light" finds 30 LED Solar Wall Light',
    JSON.stringify(res2)
  );

  // --- Test 3: "Boom Wash" (Product Name) ---
  console.log('\n--- Test 3: "Boom Wash" (Product Name) ---');
  const res3 = await callChat('Boom Wash', `session-${Date.now()}`);
  assert(
    res3.intent === 'product.search' &&
    res3.reply.includes('Boom Wash') &&
    res3.reply.includes('P00481'),
    'Query "Boom Wash" finds Boom Wash P00481',
    JSON.stringify(res3)
  );

  // --- Test 4: "P00481" (Exact Product Code) ---
  console.log('\n--- Test 4: "P00481" (Exact Product Code) ---');
  const res4 = await callChat('P00481', `session-${Date.now()}`);
  assert(
    res4.reply.includes('Boom Wash') &&
    res4.reply.includes('P00481'),
    'Query "P00481" finds Boom Wash by code',
    JSON.stringify(res4)
  );

  // --- Test 5: "baby shower cap" (Partial Name) ---
  console.log('\n--- Test 5: "baby shower cap" (Partial Name) ---');
  const res5 = await callChat('baby shower cap', `session-${Date.now()}`);
  assert(
    res5.reply.includes('Baby Shower Cap') &&
    res5.reply.includes('P00282'),
    'Query "baby shower cap" finds Adjustable Baby Shower Cap',
    JSON.stringify(res5)
  );

  // --- Test 6: "show kitchen items" (Category Search) ---
  console.log('\n--- Test 6: "show kitchen items" (Category Search) ---');
  const res6 = await callChat('show kitchen items', `session-${Date.now()}`);
  assert(
    (res6.reply.includes('Looking for Kitchen') || res6.reply.includes('match your search')) &&
    (res6.reply.includes('Boom Wash') || res6.reply.includes('Kitchen & Dining') || res6.reply.includes('Sink Sealing Tape')),
    'Query "show kitchen items" returns active kitchen products or category guidance',
    JSON.stringify(res6)
  );

  // --- Test 7: "is it available?" after selecting a product ---
  console.log('\n--- Test 7: Follow-up: "is it available?" after selecting product ---');
  const sessionFollowup1 = `test-session-followup1-${Date.now()}`;
  // Turn 1: Select "30 led solar"
  const turn1_solar = await callChat('30 led solar', sessionFollowup1);
  const contextsFromTurn1 = turn1_solar.outputContexts || [];
  // Turn 2: Ask "is it available?" with preserved context
  const turn2_avail = await callChat('is it available?', sessionFollowup1, contextsFromTurn1);
  assert(
    turn2_avail.intent === 'product.availability.followup' &&
    turn2_avail.reply.includes('30 LED Solar Wall Light') &&
    turn2_avail.reply.includes('in stock') &&
    turn2_avail.reply.includes('116'),
    'Turn 2 "is it available?" answers live stock for 30 LED Solar Wall Light using preserved context',
    JSON.stringify(turn2_avail)
  );

  // --- Test 8: "how much is this?" after selecting a product ---
  console.log('\n--- Test 8: Follow-up: "how much is this?" after selecting product ---');
  const sessionFollowup2 = `test-session-followup2-${Date.now()}`;
  // Turn 1: Select "Boom Wash"
  const turn1_boom = await callChat('Boom Wash', sessionFollowup2);
  const contextsFromBoom = turn1_boom.outputContexts || [];
  // Turn 2: Ask "how much is this?" with preserved context
  const turn2_price = await callChat('how much is this?', sessionFollowup2, contextsFromBoom);
  assert(
    turn2_price.intent === 'product.details.followup' &&
    turn2_price.reply.includes('Boom Wash') &&
    turn2_price.reply.includes('680'),
    'Turn 2 "how much is this?" answers price for Boom Wash using preserved context',
    JSON.stringify(turn2_price)
  );

  // --- Test 9: Unrelated question with no matching product ---
  console.log('\n--- Test 9: Unrelated Question (No false product match) ---');
  const res9 = await callChat('what is your store physical address?', `session-${Date.now()}`);
  assert(
    res9.intent === 'Default Fallback Intent' &&
    !res9.reply.includes('Code: P') &&
    !res9.reply.includes('LKR'),
    'Unrelated query "what is your store physical address?" is NOT falsely matched to a product',
    JSON.stringify(res9)
  );

  // --- Test 10: Multiple products with similar titles ("makeup brush") ---
  console.log('\n--- Test 10: Multiple Products with Similar Titles ("makeup brush") ---');
  const res10 = await callChat('makeup brush', `session-${Date.now()}`);
  assert(
    (res10.intent === 'product.search' || res10.intent === 'product.search.multiple') &&
    res10.reply.includes('13-Piece Professional Makeup Brush') &&
    res10.reply.includes('9 Makeup Brush with Purse'),
    'Query "makeup brush" returns multiple matching brush sets for customer choice',
    JSON.stringify(res10)
  );

  // --- Test 11: Word Order Independence ("solar 30 led") ---
  console.log('\n--- Test 11: Word Order Independence ("solar 30 led") ---');
  const res11 = await callChat('solar 30 led', `session-${Date.now()}`);
  assert(
    res11.reply.includes('30 LED Solar Wall Light') &&
    res11.reply.includes('P00109'),
    'Query "solar 30 led" in reverse word order finds 30 LED Solar Wall Light',
    JSON.stringify(res11)
  );

  // --- Test 12: Reasonable Spelling Differences ("solar lite") ---
  console.log('\n--- Test 12: Reasonable Spelling Differences ("solar lite") ---');
  const res12 = await callChat('solar lite', `session-${Date.now()}`);
  assert(
    res12.reply.includes('30 LED Solar Wall Light'),
    'Query with spelling variation "solar lite" finds 30 LED Solar Wall Light',
    JSON.stringify(res12)
  );

  // --- Test 13: Singlish Product Search Expression ("30 led solar eka thiyenawada") ---
  console.log('\n--- Test 13: Singlish Search Expression ("30 led solar eka thiyenawada") ---');
  const res13 = await callChat('30 led solar eka thiyenawada', `session-${Date.now()}`);
  assert(
    res13.reply.includes('30 LED Solar Wall Light') &&
    res13.reply.includes('P00109'),
    'Singlish query "30 led solar eka thiyenawada" strips filler words and finds product',
    JSON.stringify(res13)
  );

  console.log('\n================================================================');
  console.log(`🏁 REGRESSION SUITE COMPLETED: ${passedCount}/${totalCount} TESTS PASSED!`);
  console.log('================================================================\n');

  if (passedCount !== totalCount) {
    throw new Error(`Regression test failures: ${totalCount - passedCount} failed`);
  }
}

runRegressionSuite().catch((err) => {
  console.error('Test suite execution error:', err);
  process.exit(1);
});
