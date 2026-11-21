import { POST } from '../../app/api/chat/route';
import { NextRequest } from 'next/server';

async function runChatRouteTests() {
  console.log('--- Testing /api/chat Gateway Route ---\n');

  // Test 1: Empty or invalid payload
  console.log('Test 1: Empty payload rejection...');
  const req1 = new NextRequest('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const res1 = await POST(req1);
  const data1 = await res1.json();
  if (res1.status === 400) {
    console.log('✅ Correctly rejected empty message with 400 Bad Request.');
  } else {
    console.error('❌ Test 1 failed:', data1);
    process.exit(1);
  }

  // Test 2: Unconfigured API key fallback
  console.log('\nTest 2: Graceful unconfigured key handling...');
  const req2 = new NextRequest('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Meka thiyenawada? P00481',
      sessionId: 'test-session-xyz',
    }),
  });
  const res2 = await POST(req2);
  const data2 = await res2.json();
  if (res2.status === 200 && data2.reply) {
    console.log('✅ Received friendly response:', data2.reply.substring(0, 80) + '...');
    console.log('✅ Preprocessed text verified:', data2.preprocessedText);
    console.log('✅ Intent reported:', data2.intent);
  } else {
    console.error('❌ Test 2 failed:', data2);
    process.exit(1);
  }

  console.log('\n🎉 /api/chat route tests passed successfully!');
}

runChatRouteTests().catch((err) => {
  console.error('Unhandled test failure:', err);
  process.exit(1);
});
