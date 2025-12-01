/**
 * Simple RAG Test
 * Test the RAG endpoint with a small document
 */

const WORKER_URL = 'https://agent-army-worker.dartmouth.workers.dev';

async function testSimpleIngest() {
  console.log('🧪 Testing RAG endpoint with small document...\n');
  
  const testDoc = {
    action: 'ingest',
    agentId: 'test-agent',
    title: 'Test Document',
    content: 'This is a test document. It contains minimal content for testing the RAG system.'
  };
  
  console.log('Sending request...');
  const response = await fetch(`${WORKER_URL}/test/rag`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testDoc)
  });
  
  console.log(`Status: ${response.status} ${response.statusText}`);
  
  const text = await response.text();
  console.log(`Response length: ${text.length} characters`);
  console.log(`Response preview:\n${text.substring(0, 500)}\n`);
  
  try {
    const json = JSON.parse(text);
    console.log('✅ Valid JSON response:');
    console.log(JSON.stringify(json, null, 2));
  } catch (e) {
    console.log('❌ Not valid JSON');
    console.log('Full response:', text);
  }
}

testSimpleIngest().catch(console.error);

