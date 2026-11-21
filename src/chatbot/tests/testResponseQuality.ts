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
  console.log('🧪 RUNNING NOOKI MULTILINGUAL & RESPONSE QUALITY TEST SUITE');
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

  // =========================================================================
  // ISSUE 1: Sinhala, Singlish & English Quantity Extraction Unit Tests
  // =========================================================================
  console.log('--- Suite 1: Multilingual Quantity Extraction ---');

  // Sinhala queries
  assert(
    extractRequestedQuantity('මේකෙන් 3ක් ගන්න පුළුවන්ද?') === 3,
    'Sinhala: "මේකෙන් 3ක් ගන්න පුළුවන්ද?" extracts quantity 3'
  );
  assert(
    extractRequestedQuantity('මට 2ක් ඕන') === 2,
    'Sinhala: "මට 2ක් ඕන" extracts quantity 2'
  );
  assert(
    extractRequestedQuantity('10ක් තියෙනවද?') === 10,
    'Sinhala: "10ක් තියෙනවද?" extracts quantity 10'
  );
  assert(
    extractRequestedQuantity('මට තුනක් ඕන') === 3,
    'Sinhala word: "මට තුනක් ඕන" extracts quantity 3'
  );
  assert(
    extractRequestedQuantity('දෙකක් ගන්න පුළුවන්ද?') === 2,
    'Sinhala word: "දෙකක් ගන්න පුළුවන්ද?" extracts quantity 2'
  );

  // Singlish & English queries
  assert(
    extractRequestedQuantity('Meken 3k ganna puluwanda?') === 3,
    'Singlish: "Meken 3k ganna puluwanda?" extracts quantity 3'
  );
  assert(
    extractRequestedQuantity('mata meken 2k ona') === 2,
    'Singlish: "mata meken 2k ona" extracts quantity 2'
  );
  assert(
    extractRequestedQuantity('Can I order 5 units?') === 5,
    'English: "Can I order 5 units?" extracts quantity 5'
  );

  // Security & Product Code Protection
  assert(
    extractRequestedQuantity('Boom Wash P00481 thiyeda?') === undefined,
    'Product code digits (e.g. P00481) are protected and never extracted as requested quantities'
  );

  // =========================================================================
  // ISSUE 1: Sinhala Turn-2 Quantity Availability Check
  // =========================================================================
  console.log('\n--- Suite 2: Sinhala Multi-Turn Quantity Follow-Up ---');
  const sessionSinhala = `test-sinhala-qty-${Date.now()}`;

  // Turn 1: Select Boom Wash
  const t1 = await callChat('Boom Wash', sessionSinhala);
  const contextsT1 = t1.outputContexts || [];

  // Turn 2: Customer asks in Sinhala: "මේකෙන් 3ක් ගන්න පුළුවන්ද?"
  const t2 = await callChat('මේකෙන් 3ක් ගන්න පුළුවන්ද?', sessionSinhala, contextsT1);

  assert(
    t2.reply.includes('✅ Yes! You can order 3 units of Boom Wash') &&
    t2.reply.includes('(P00481)') &&
    t2.reply.includes('📦 Current available stock: 96 units.') &&
    t2.reply.includes('This is only a stock check; no order has been placed.') &&
    t2.reply.includes('👉 View product:') &&
    !t2.reply.toLowerCase().includes('cash on delivery') &&
    !t2.reply.toLowerCase().includes('delivery charge'),
    'Sinhala "මේකෙන් 3ක් ගන්න පුළුවන්ද?" returns exact required response with 3 units requested, 96 stock, disclaimer, and product link',
    JSON.stringify(t2)
  );

  // Insufficient stock in Sinhala
  const t2_excess = await callChat('මේකෙන් 500ක් ගන්න පුළුවන්ද?', sessionSinhala, contextsT1);
  assert(
    t2_excess.reply.includes('⚠️ We cannot fulfil 500 units of Boom Wash') &&
    t2_excess.reply.includes('(P00481)') &&
    t2_excess.reply.includes('📦 Current available stock: 96 units.') &&
    t2_excess.reply.includes('This is only a stock check; no order has been placed.'),
    'Sinhala insufficient stock ("මේකෙන් 500ක් ගන්න පුළුවන්ද?") properly displays requested vs available units',
    JSON.stringify(t2_excess)
  );

  // =========================================================================
  // ISSUE 2: Non-Repetitive Conversational Response Quality Tests
  // =========================================================================
  console.log('\n--- Suite 3: Non-Repetitive Response Behavior ---');

  const sessionProduct = `test-product-followups-${Date.now()}`;
  const prodTurn1 = await callChat('Boom Wash', sessionProduct);
  const prodContexts = prodTurn1.outputContexts || [];

  // 1. Customer: "How much is this?"
  const resPrice = await callChat('How much is this?', sessionProduct, prodContexts);
  assert(
    resPrice.reply.includes('Boom Wash') &&
    resPrice.reply.includes('LKR 680.00') &&
    resPrice.reply.includes('View & order here') &&
    !resPrice.reply.toLowerCase().includes('cash on delivery') &&
    !resPrice.reply.toLowerCase().includes('delivery charge'),
    '1. "How much is this?" answers name, price & link without repetitive COD or delivery info',
    JSON.stringify(resPrice)
  );

  // 2. Customer: "Is this in stock?"
  const resStock = await callChat('Is this in stock?', sessionProduct, prodContexts);
  assert(
    resStock.reply.includes('Boom Wash') &&
    resStock.reply.includes('in stock') &&
    resStock.reply.includes('96 units') &&
    !resStock.reply.toLowerCase().includes('cash on delivery') &&
    !resStock.reply.toLowerCase().includes('delivery charges'),
    '2. "Is this in stock?" answers status & unit count without repetitive COD or delivery info',
    JSON.stringify(resStock)
  );

  // 3. Customer: "Can I order 3 units?"
  const resQty = await callChat('Can I order 3 units?', sessionProduct, prodContexts);
  assert(
    resQty.reply.includes('You can order 3 units of Boom Wash') &&
    resQty.reply.includes('Current available stock: 96 units.') &&
    resQty.reply.includes('This is only a stock check; no order has been placed.') &&
    !resQty.reply.toLowerCase().includes('cash on delivery') &&
    !resQty.reply.toLowerCase().includes('delivery charges'),
    '3. "Can I order 3 units?" answers quantity availability & stock without repetitive COD or delivery info',
    JSON.stringify(resQty)
  );

  // 4. Customer: "Tell me about this product"
  const resDetails = await callChat('Tell me about this product', sessionProduct, prodContexts);
  assert(
    resDetails.reply.includes('Boom Wash') &&
    resDetails.reply.includes('Price:') &&
    resDetails.reply.includes('Stock:') &&
    !resDetails.reply.toLowerCase().includes('cash on delivery') &&
    !resDetails.reply.toLowerCase().includes('delivery charges'),
    '4. "Tell me about this product" answers relevant product details without repeated promotional text',
    JSON.stringify(resDetails)
  );

  // 5. Customer: "Do you offer Cash on Delivery?"
  const resCodFaq = await callChat('Do you offer Cash on Delivery?', `session-faq-cod-${Date.now()}`);
  assert(
    resCodFaq.reply.includes('Cash on Delivery (COD) is available') &&
    resCodFaq.reply.includes('doorstep') &&
    resCodFaq.reply.includes('No advance payment') &&
    !resCodFaq.reply.toLowerCase().includes('lkr 400–500'),
    '5. "Do you offer Cash on Delivery?" answers COD availability & doorstep payment without delivery-fee essay',
    JSON.stringify(resCodFaq)
  );

  // 6. Customer: "How much is delivery?"
  const resFeeFaq = await callChat('How much is delivery?', `session-faq-fee-${Date.now()}`);
  assert(
    resFeeFaq.reply.includes('LKR 400–500') &&
    resFeeFaq.reply.includes('WhatsApp invoice') &&
    !resFeeFaq.reply.toLowerCase().includes('cash on delivery'),
    '6. "How much is delivery?" explains LKR 400–500 fee and WhatsApp invoice confirmation without COD repetition',
    JSON.stringify(resFeeFaq)
  );

  // 7. Customer: "How long does delivery take?"
  const resTimeFaq = await callChat('How long does delivery take?', `session-faq-time-${Date.now()}`);
  assert(
    resTimeFaq.reply.includes('3–5 business days') &&
    !resTimeFaq.reply.toLowerCase().includes('lkr 400–500') &&
    !resTimeFaq.reply.toLowerCase().includes('cash on delivery'),
    '7. "How long does delivery take?" answers 3–5 days without full delivery fee or COD text',
    JSON.stringify(resTimeFaq)
  );

  // 8. Customer: "How do I place an order?"
  const resOrderFaq = await callChat('How do I place an order?', `session-faq-order-${Date.now()}`);
  assert(
    resOrderFaq.reply.includes('Option 1 – Order Now') &&
    resOrderFaq.reply.includes('Option 2 – Add to Cart') &&
    resOrderFaq.reply.includes('WhatsApp'),
    '8. "How do I place an order?" explains existing two-path ordering methods (Order Now and Add to Cart)',
    JSON.stringify(resOrderFaq)
  );

  console.log(`\n================================================================`);
  console.log(`🏁 ALL TESTS PASSED: ${passedCount}/${totalCount} SUCCESSFUL!`);
  console.log(`================================================================\n`);

  if (passedCount !== totalCount) {
    throw new Error(`Response quality tests failed: ${totalCount - passedCount} failed`);
  }
}

runResponseQualitySuite().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
