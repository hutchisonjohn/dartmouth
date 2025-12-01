/**
 * Test Worker Health
 */

const WORKER_URL = 'https://agent-army-worker.dartmouth.workers.dev';

async function testHealth() {
  console.log('Testing worker health...\n');
  
  const response = await fetch(`${WORKER_URL}/health`);
  console.log(`Status: ${response.status}`);
  
  const text = await response.text();
  console.log(`Response:\n${text}`);
}

testHealth().catch(console.error);

