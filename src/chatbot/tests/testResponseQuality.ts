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
import { extractRequestedQuantity } from '../services/productLookupService';

async function runResponseQualitySuite() {
  console.log('================================================================');
  console.log('🧪 RUNNING NOOKI RESPONSE-QUALITY REGRESSION TEST SUITE');
  console.log('================================================================\n');

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

  async function callChat(message: string, sessionId: string, contexts: any[] = []) {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId, contexts }),
    });
    const res = await chatRouteHandler(req);
    return res.json();
  }

  // --- Test 1: Singlish quantity extraction ("Meken 3k ganna puluwanda?") ---
  console.log('--- Test 1: Singlish Quantity Extraction ---');
  assert(
    extractRequestedQuantity('Meken 3k ganna puluwanda?') === 3,
    'extractRequestedQuantity correctly reads 3 from "Meken 3k ganna puluwanda?"'
  );
  assert(
    extractRequestedQuantity('mata meken 2k ona') === 2,
    'extractRequestedQuantity correctly reads 2 from "mata meken 2k ona"'
  );
  assert(
    extractRequestedQuantity('Can I order 5 units of P00481?') === 5,
    'extractRequestedQuantity correctly reads 5 from "Can I order 5 units of P00481?"'
  );

  // --- Test 2: Turn 2 Singlish quantity check distinguishing requested vs available stock ---
  console.log('\n--- Test 2: Requested Quantity vs Live Stock Differentiation ---');
  const session1 = `test-quality-${Date.now()}`;
  // Turn 1: Customer asks about Boom Wash
  const turn1 = await callChat('Boom Wash', session1);
  const contextsFromTurn1 = turn1.outputContexts || [];

  // Turn 2: Customer asks "Meken 3k ganna puluwanda?"
  const turn2 = await callChat('Meken 3k ganna puluwanda?', session1, contextsFromTurn1);
  assert(
    turn2.reply.includes('You can order 3 units') &&
    turn2.reply.includes('Boom Wash') &&
    turn2.reply.includes('Current available stock:') &&
    turn2.reply.includes('96') &&
    turn2.reply.includes('no order has been placed'),
    'Turn 2 "Meken 3k ganna puluwanda?" distinguishes 3 requested from 96 available stock with no-order disclaimer',
    JSON.stringify(turn2)
  );

  // --- Test 3: Requested Quantity Exceeding Stock ---
  console.log('\n--- Test 3: Requested Quantity Exceeding Available Stock ---');
  const session2 = `test-excess-qty-${Date.now()}`;
  const turn1_b = await callChat('Boom Wash', session2);
  const contextsFromTurn1_b = turn1_b.outputContexts || [];

  const turn2_excess = await callChat('Meken 500k ganna puluwanda?', session2, contextsFromTurn1_b);
  assert(
    turn2_excess.reply.includes('cannot fulfil 500 units') &&
    turn2_excess.reply.includes('Current available stock:') &&
    turn2_excess.reply.includes('no order has been placed'),
    'Excess quantity inquiry gracefully states unavailable requested amount without placing an order',
    JSON.stringify(turn2_excess)
  );

  // --- Test 4: Delivery FAQ Shortened & Complete ---
  console.log('\n--- Test 4: Shortened Delivery FAQ Response ---');
  const resDelivery = await callChat('delivery fee eka kiyada', `session-del-${Date.now()}`);
  assert(
    resDelivery.reply.includes('Islandwide delivery') &&
    resDelivery.reply.includes('LKR 400–500') &&
    resDelivery.reply.includes('WhatsApp invoice') &&
    resDelivery.reply.includes('3–5 days') &&
    resDelivery.reply.includes('Cash on Delivery'),
    'Delivery response contains islandwide, LKR 400–500, WhatsApp invoice, 3–5 days, and COD',
    JSON.stringify(resDelivery)
  );

  // --- Test 5: COD FAQ Shortened & Complete ---
  console.log('\n--- Test 5: Shortened COD FAQ Response ---');
  const resCod = await callChat('cash on delivery puluwanda', `session-cod-${Date.now()}`);
  assert(
    resCod.reply.includes('Cash on Delivery (COD) is available') &&
    resCod.reply.includes('3–5 days') &&
    resCod.reply.includes('LKR 400–500') &&
    resCod.reply.includes('WhatsApp invoice'),
    'COD response contains availability, 3–5 days, LKR 400–500, and WhatsApp invoice confirmation',
    JSON.stringify(resCod)
  );

  // --- Test 6: Detailed Two-Path Ordering Instructions ---
  console.log('\n--- Test 6: Detailed Two-Path Ordering Instructions ---');
  const resOrder = await callChat('order karanne kohomada', `session-ord-${Date.now()}`);
  assert(
    resOrder.reply.includes('Option 1 – Order Now') &&
    resOrder.reply.includes('Option 2 – Add to Cart') &&
    resOrder.reply.includes('WhatsApp'),
    'Order how-to response preserves detailed two-path ordering instructions (Order Now & Add to Cart)',
    JSON.stringify(resOrder)
  );

  console.log(`\n================================================================`);
  console.log(`🏁 RESPONSE QUALITY SUITE: ${passedCount}/${totalCount} TESTS PASSED!`);
  console.log(`================================================================\n`);

  if (passedCount !== totalCount) {
    throw new Error(`Response quality tests failed: ${totalCount - passedCount} failed`);
  }
}

runResponseQualitySuite().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
