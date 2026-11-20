/**
 * Regression tests for product.availability intent (Nooki chatbot)
 *
 * Verifies that "Is P00481 in stock?" style queries return a concise stock-specific
 * answer (not the full product card) using formatAvailabilityResponse().
 */

import { POST } from '../../app/api/dialogflow/route';
import { NextRequest } from 'next/server';
import {
  ProductLookupService,
  FormattedProductResult,
  extractRequestedQuantity,
} from '../services/productLookupService';

const SESSION = 'projects/nooki-lqqe/agent/sessions/avail-test-session-001';

function makeRequest(queryText: string, parameters: Record<string, string> = {}) {
  return new NextRequest('http://localhost:3000/api/dialogflow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session: SESSION,
      queryResult: {
        queryText,
        intent: { displayName: 'product.availability' },
        parameters,
        outputContexts: [],
      },
    }),
  });
}

function isFullProductCard(text: string): boolean {
  return (
    text.includes('🏷️ Code:') ||
    text.includes('Category:') ||
    text.includes('100% Cash on Delivery across Sri Lanka')
  );
}

function mockResult(overrides: {
  title?: string;
  code?: string;
  id?: string;
  inquiryOnly?: boolean;
  variants?: Array<{ size: string; sku: string; stock: number }>;
}): FormattedProductResult {
  const service = new ProductLookupService();
  const product = {
    id: overrides.id || 'nm-test-product',
    title: overrides.title || 'Test Product',
    slug: 'test-product',
    description: 'Test description',
    category: 'Home & Living',
    mrp: 1000,
    sellingPrice: 800,
    images: [],
    variants: overrides.variants || [{ size: 'Standard', sku: overrides.code || 'P99901', stock: 0 }],
    rating: 0,
    reviewCount: 0,
    isCodAvailable: true,
    inquiryOnly: overrides.inquiryOnly || false,
    sku: overrides.code || 'P99901',
  } as FormattedProductResult['product'];

  const stockInfo = service.calculateStockInfo(product);
  return {
    product,
    productCode: product.sku || product.id,
    stockInfo,
    canonicalUrl: `https://nook-mint.vercel.app/products/${product.id}`,
    formattedPrice: 'LKR 800',
  };
}

async function runTests() {
  console.log('=== product.availability Intent Regression Tests ===\n');
  let passed = 0;
  let failed = 0;

  const assert = (ok: boolean, name: string, detail?: string) => {
    if (ok) {
      console.log(`✅ ${name}\n`);
      passed++;
    } else {
      console.error(`❌ ${name}${detail ? `\n  ${detail}` : ''}\n`);
      failed++;
    }
  };

  const lookup = new ProductLookupService();

  // ---------------------------------------------------------------
  // Quantity parser (product codes must not be treated as quantities)
  // ---------------------------------------------------------------
  console.log('--- Quantity parser ---');
  assert(
    extractRequestedQuantity('Is P00481 in stock?') === undefined,
    'Parser ignores product-code digits in "Is P00481 in stock?"'
  );
  assert(
    extractRequestedQuantity('How many units of P00481 are available?') === undefined,
    'Parser does not invent a quantity for "How many units of P00481 are available?"'
  );
  assert(
    extractRequestedQuantity('Can I order 5 units of P00481?') === 5,
    'Parser reads 5 from "Can I order 5 units of P00481?"'
  );

  // ---------------------------------------------------------------
  // Live webhook: "Is P00481 in stock?"
  // ---------------------------------------------------------------
  console.log('--- Test: "Is P00481 in stock?" ---');
  {
    const live = await lookup.findByProductCode('P00481');
    const res = await POST(makeRequest('Is P00481 in stock?'));
    const data = await res.json();
    console.log('Response:\n', data.fulfillmentText, '\n');

    const text: string = data.fulfillmentText || '';
    const contexts: Array<{ name: string; lifespanCount?: number; parameters?: Record<string, unknown> }> =
      data.outputContexts || [];
    const productCtx = contexts.find((c) => c.name.includes('product_selected'));
    const categoryCtx = contexts.find((c) => c.name.includes('category_selected'));

    const hasNameAndCode = text.includes('Boom Wash') && text.includes('P00481');
    const hasStockStatus =
      text.toLowerCase().includes('in stock') ||
      text.toLowerCase().includes('out of stock') ||
      text.toLowerCase().includes('quotation');
    const hasCanonicalUrl = Boolean(
      live && text.includes(`/products/${live.product.id}`)
    );
    const contextsOk =
      Boolean(productCtx) &&
      productCtx?.lifespanCount === 5 &&
      productCtx?.parameters?.productId === live?.product.id &&
      Boolean(productCtx?.parameters?.productCode) &&
      Boolean(categoryCtx);

    assert(
      hasNameAndCode && hasStockStatus && hasCanonicalUrl && !isFullProductCard(text) && contextsOk,
      '"Is P00481 in stock?" returns concise stock answer with name, code, URL, and contexts',
      !hasNameAndCode
        ? 'Missing product name or code'
        : !hasStockStatus
          ? 'Missing stock status'
          : !hasCanonicalUrl
            ? 'Missing canonical product URL from live record'
            : isFullProductCard(text)
              ? 'Returned full product card'
              : 'Contexts missing or invalid'
    );
  }

  // ---------------------------------------------------------------
  // Live webhook: "How many units of P00481 are available?"
  // ---------------------------------------------------------------
  console.log('--- Test: "How many units of P00481 are available?" ---');
  {
    const live = await lookup.findByProductCode('P00481');
    const res = await POST(makeRequest('How many units of P00481 are available?'));
    const data = await res.json();
    console.log('Response:\n', data.fulfillmentText, '\n');
    const text: string = data.fulfillmentText || '';

    const mentionsUnits = text.includes('units');
    const mentionsProduct = text.includes('Boom Wash') && text.includes('P00481');
    const reportsLiveQty = live ? text.includes(String(live.stockInfo.totalUnits)) : false;
    const didNotTreatCodeAsQty = extractRequestedQuantity('How many units of P00481 are available?') === undefined;

    assert(
      mentionsUnits && mentionsProduct && reportsLiveQty && didNotTreatCodeAsQty && !isFullProductCard(text),
      '"How many units of P00481 are available?" reports live unit count'
    );
  }

  // ---------------------------------------------------------------
  // Live webhook: "Can I order 5 units of P00481?"
  // ---------------------------------------------------------------
  console.log('--- Test: "Can I order 5 units of P00481?" ---');
  {
    const live = await lookup.findByProductCode('P00481');
    const res = await POST(makeRequest('Can I order 5 units of P00481?'));
    const data = await res.json();
    console.log('Response:\n', data.fulfillmentText, '\n');
    const text: string = data.fulfillmentText || '';
    const noAutoOrder = text.toLowerCase().includes('no order has been placed');
    const mentionsFive = text.includes('5');
    const mentionsProduct = text.includes('Boom Wash');
    const qtyAware =
      live &&
      (live.stockInfo.totalUnits >= 5
        ? text.includes('fulfil 5') || text.includes('5 units')
        : text.includes(String(live.stockInfo.totalUnits)));

    assert(
      mentionsFive && mentionsProduct && noAutoOrder && Boolean(qtyAware) && !isFullProductCard(text),
      '"Can I order 5 units of P00481?" compares requested qty to inventory without placing an order'
    );
  }

  // ---------------------------------------------------------------
  // Formatter: out-of-stock
  // ---------------------------------------------------------------
  console.log('--- Test: out-of-stock product ---');
  {
    const result = mockResult({
      title: 'Empty Stock Item',
      code: 'P90001',
      id: 'nm-empty-stock',
      variants: [{ size: 'Standard', sku: 'P90001', stock: 0 }],
    });
    const text = lookup.formatAvailabilityResponse(result);
    console.log('Response:\n', text, '\n');
    assert(
      text.includes('Empty Stock Item') &&
        text.includes('P90001') &&
        text.toLowerCase().includes('out of stock') &&
        text.includes(`/products/${result.product.id}`) &&
        !text.includes('in stock with') &&
        !isFullProductCard(text),
      'Out-of-stock product reports status, name, code, and canonical URL'
    );
  }

  // ---------------------------------------------------------------
  // Formatter: inquiry-only
  // ---------------------------------------------------------------
  console.log('--- Test: inquiry-only product ---');
  {
    const result = mockResult({
      title: 'Quotation Item',
      code: 'P90002',
      id: 'nm-quotation-item',
      inquiryOnly: true,
      variants: [{ size: 'Standard', sku: 'P90002', stock: 12 }],
    });
    const text = lookup.formatAvailabilityResponse(result, 5);
    console.log('Response:\n', text, '\n');
    assert(
      text.includes('Quotation Item') &&
        text.includes('P90002') &&
        (text.toLowerCase().includes('quotation') || text.toLowerCase().includes('whatsapp')) &&
        !text.includes('12 units') &&
        !text.includes('fulfil 5') &&
        text.includes(`/products/${result.product.id}`),
      'Inquiry-only product does not invent a sellable quantity'
    );
  }

  // ---------------------------------------------------------------
  // Formatter: multiple variants
  // ---------------------------------------------------------------
  console.log('--- Test: product with multiple variants ---');
  {
    const result = mockResult({
      title: 'Colour Pack',
      code: 'P90003',
      id: 'nm-colour-pack',
      variants: [
        { size: 'Red', sku: 'P90003-1', stock: 4 },
        { size: 'Blue', sku: 'P90003-2', stock: 0 },
        { size: 'Green', sku: 'P90003-3', stock: 2 },
      ],
    });
    const text = lookup.formatAvailabilityResponse(result);
    console.log('Response:\n', text, '\n');
    const promisesBlue = /Blue \((?!out of stock)\d+ available\)/.test(text);
    assert(
      text.includes('Colour Pack') &&
        text.includes('P90003') &&
        text.includes('6 units') &&
        text.includes('Red (4 available)') &&
        text.includes('Blue (out of stock)') &&
        text.includes('Green (2 available)') &&
        !promisesBlue &&
        text.includes(`/products/${result.product.id}`),
      'Multi-variant product lists actual stock and does not promise unavailable options'
    );
  }

  // ---------------------------------------------------------------
  // Other intents unchanged: product.search still returns full card
  // ---------------------------------------------------------------
  console.log('--- Guard: product.search still uses the full product card ---');
  {
    const res = await POST(
      new NextRequest('http://localhost:3000/api/dialogflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: SESSION,
          queryResult: {
            queryText: 'P00481',
            intent: { displayName: 'product.search' },
            parameters: { product: 'P00481' },
          },
        }),
      })
    );
    const data = await res.json();
    const text: string = data.fulfillmentText || '';
    assert(
      text.includes('Boom Wash') && text.includes('Category:') && text.includes('Price:'),
      'product.search still returns the full product card'
    );
  }

  console.log('='.repeat(55));
  console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  if (failed > 0) {
    console.error(`\n❌ ${failed} test(s) failed — fix before merging to main`);
    process.exit(1);
  } else {
    console.log('\n🎉 ALL PRODUCT.AVAILABILITY REGRESSION TESTS PASSED!');
  }
}

runTests().catch((err) => {
  console.error('Unexpected error in test runner:', err);
  process.exit(1);
});
