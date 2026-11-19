import { ProductLookupService } from '../services/productLookupService';

async function runTests() {
  console.log('--- Testing ProductLookupService with live database repository ---\n');
  const service = new ProductLookupService();

  // Test 1: Search by exact dropshipping code P00481
  console.log('Test 1: Lookup by exact code "P00481"...');
  const resultByCode = await service.findByProductCode('P00481');
  if (resultByCode) {
    console.log('✅ Found product by code:');
    console.log(`   Title: ${resultByCode.product.title}`);
    console.log(`   Price: ${resultByCode.formattedPrice}`);
    console.log(`   Stock: ${resultByCode.stockInfo.totalUnits} units (${resultByCode.stockInfo.status})`);
    console.log(`   URL:   ${resultByCode.canonicalUrl}`);
  } else {
    console.error('❌ Failed to find P00481');
    process.exit(1);
  }

  // Test 2: Search by partial title "Boom Wash"
  console.log('\nTest 2: Search by title "Boom Wash"...');
  const resultsByTitle = await service.searchProducts('Boom Wash');
  if (resultsByTitle.length > 0) {
    console.log(`✅ Found ${resultsByTitle.length} product(s) by title search.`);
    console.log(`   First match: ${resultsByTitle[0].product.title}`);
  } else {
    console.error('❌ Failed to search by title "Boom Wash"');
    process.exit(1);
  }

  // Test 3: Formatting single product response
  console.log('\nTest 3: Formatting chat response message...');
  const chatMessage = service.formatSingleProductResponse(resultByCode);
  console.log('--- Formatted Chat Output ---');
  console.log(chatMessage);
  console.log('-----------------------------');

  if (chatMessage.includes('Boom Wash') && chatMessage.includes('LKR 680') && chatMessage.includes('/products/nm-boom-wash-300ml')) {
    console.log('✅ Chat message formatting verified successfully.');
  } else {
    console.error('❌ Chat message format missing expected fields.');
    process.exit(1);
  }

  // Test 4: Search for non-existent product
  console.log('\nTest 4: Searching non-existent product "P99999"...');
  const notFound = await service.findByProductCode('P99999');
  if (notFound === null) {
    console.log('✅ Correctly returned null for non-existent product.');
  } else {
    console.error('❌ Expected null for P99999, but got a result.');
    process.exit(1);
  }

  console.log('\n🎉 All ProductLookupService tests passed successfully!');
}

runTests().catch((err) => {
  console.error('Error running ProductLookupService tests:', err);
  process.exit(1);
});
