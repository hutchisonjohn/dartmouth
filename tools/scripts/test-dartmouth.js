/**
 * Dartmouth OS V2.0 - Integration Tests
 * Comprehensive testing of all Dartmouth OS endpoints
 */

const API_BASE = process.env.API_BASE || 'http://localhost:8787';

let testsPassed = 0;
let testsFailed = 0;
let testsTotal = 0;

function logTest(name, passed, details = '') {
  testsTotal++;
  if (passed) {
    testsPassed++;
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
  } else {
    testsFailed++;
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
  }
}

function logSection(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(60));
}

async function testRootEndpoint() {
  logSection('TEST 1: Root Endpoint');
  
  try {
    const response = await fetch(`${API_BASE}/`);
    const data = await response.json();
    
    logTest('Root endpoint responds', response.status === 200);
    logTest('Response contains name', data.name === 'Dartmouth OS API');
    logTest('Response contains version', data.version === '2.0.0');
    logTest('Response contains dartmouth info', data.dartmouth?.version === '2.0.0');
    logTest('Response contains agents list', Array.isArray(data.dartmouth?.agents));
    logTest('Response contains endpoints', typeof data.endpoints === 'object');
    
    return true;
  } catch (error) {
    logTest('Root endpoint test', false, error.message);
    return false;
  }
}

async function testHealthEndpoints() {
  logSection('TEST 2: Health Check Endpoints');
  
  try {
    // Test overall health
    const healthResponse = await fetch(`${API_BASE}/api/v2/health`);
    const healthData = await healthResponse.json();
    
    logTest('Overall health endpoint responds', healthResponse.status === 200 || healthResponse.status === 503);
    logTest('Health response has status', typeof healthData.status === 'string');
    logTest('Health response has agents array', Array.isArray(healthData.agents));
    logTest('Health response has timestamp', typeof healthData.timestamp === 'number');
    
    // Test specific agent health (FAM)
    const famHealthResponse = await fetch(`${API_BASE}/api/v2/health?agentId=fam`);
    const famHealthData = await famHealthResponse.json();
    
    logTest('FAM health endpoint responds', famHealthResponse.status === 200 || famHealthResponse.status === 503);
    logTest('FAM health has agentId', famHealthData.agentId === 'fam');
    logTest('FAM health has status', typeof famHealthData.status === 'string');
    logTest('FAM health has responseTime', typeof famHealthData.responseTime === 'number');
    
    // Test specific agent health (Artwork)
    const artworkHealthResponse = await fetch(`${API_BASE}/api/v2/health?agentId=mccarthy-artwork`);
    const artworkHealthData = await artworkHealthResponse.json();
    
    logTest('Artwork health endpoint responds', artworkHealthResponse.status === 200 || artworkHealthResponse.status === 503);
    logTest('Artwork health has agentId', artworkHealthData.agentId === 'mccarthy-artwork');
    
    // Test invalid agent
    const invalidHealthResponse = await fetch(`${API_BASE}/api/v2/health?agentId=invalid-agent`);
    logTest('Invalid agent returns error', invalidHealthResponse.status === 404 || invalidHealthResponse.status === 500);
    
    return true;
  } catch (error) {
    logTest('Health endpoints test', false, error.message);
    return false;
  }
}

async function testAgentsEndpoint() {
  logSection('TEST 3: Agents List Endpoint');
  
  try {
    const response = await fetch(`${API_BASE}/api/v2/agents`);
    const data = await response.json();
    
    logTest('Agents endpoint responds', response.status === 200);
    logTest('Response has total count', typeof data.total === 'number');
    logTest('Response has healthy count', typeof data.healthy === 'number');
    logTest('Response has unhealthy count', typeof data.unhealthy === 'number');
    logTest('Response has agents array', Array.isArray(data.agents));
    logTest('At least 3 agents registered', data.total >= 3, `Found ${data.total} agents`);
    
    // Check specific agents
    const agentIds = data.agents.map(a => a.id);
    logTest('FAM agent registered', agentIds.includes('fam'));
    logTest('Artwork agent registered', agentIds.includes('mccarthy-artwork'));
    logTest('Test agent registered', agentIds.includes('test-agent'));
    
    return true;
  } catch (error) {
    logTest('Agents endpoint test', false, error.message);
    return false;
  }
}

async function testChatEndpoint() {
  logSection('TEST 4: Chat Endpoint (V2)');
  
  try {
    // Test FAM chat
    const famChatResponse = await fetch(`${API_BASE}/api/v2/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'fam',
        message: 'Hello, this is a test message',
        sessionId: `test-session-${Date.now()}`,
      }),
    });
    const famChatData = await famChatResponse.json();
    
    logTest('FAM chat endpoint responds', famChatResponse.status === 200);
    logTest('FAM chat has content', typeof famChatData.content === 'string');
    logTest('FAM chat has type', typeof famChatData.type === 'string');
    logTest('FAM chat has metadata', typeof famChatData.metadata === 'object');
    logTest('FAM chat metadata has timestamp', typeof famChatData.metadata?.timestamp === 'number');
    logTest('FAM chat metadata has processingTime', typeof famChatData.metadata?.processingTime === 'number');
    
    // Test Artwork chat
    const artworkChatResponse = await fetch(`${API_BASE}/api/v2/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'mccarthy-artwork',
        message: 'What size can I print 4000x6000 pixels at 300 DPI?',
        sessionId: `test-session-${Date.now()}`,
      }),
    });
    const artworkChatData = await artworkChatResponse.json();
    
    logTest('Artwork chat endpoint responds', artworkChatResponse.status === 200);
    logTest('Artwork chat has content', typeof artworkChatData.content === 'string');
    
    // Test missing agentId
    const missingAgentResponse = await fetch(`${API_BASE}/api/v2/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello',
      }),
    });
    logTest('Missing agentId returns error', missingAgentResponse.status === 400);
    
    // Test missing message
    const missingMessageResponse = await fetch(`${API_BASE}/api/v2/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'fam',
      }),
    });
    logTest('Missing message returns error', missingMessageResponse.status === 400);
    
    // Test invalid agent
    const invalidAgentResponse = await fetch(`${API_BASE}/api/v2/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'invalid-agent',
        message: 'Hello',
      }),
    });
    logTest('Invalid agentId returns error', invalidAgentResponse.status === 404 || invalidAgentResponse.status === 500);
    
    return true;
  } catch (error) {
    logTest('Chat endpoint test', false, error.message);
    return false;
  }
}

async function testLegacyEndpoints() {
  logSection('TEST 5: Legacy Endpoints');
  
  try {
    // Test legacy health endpoint (still supported)
    const healthResponse = await fetch(`${API_BASE}/health`);
    logTest('Legacy /health endpoint works', healthResponse.status === 200);
    
    // Note: V1 API routes have been removed in favor of V2 (Dartmouth OS)
    // All agents now use /api/v2/chat endpoint
    
    return true;
  } catch (error) {
    logTest('Legacy endpoints test', false, error.message);
    return false;
  }
}

async function testCORSHeaders() {
  logSection('TEST 6: CORS Headers');
  
  try {
    const response = await fetch(`${API_BASE}/api/v2/agents`);
    const headers = response.headers;
    
    logTest('CORS Allow-Origin header present', headers.has('access-control-allow-origin'));
    logTest('CORS Allow-Methods header present', headers.has('access-control-allow-methods'));
    logTest('CORS Allow-Headers header present', headers.has('access-control-allow-headers'));
    
    return true;
  } catch (error) {
    logTest('CORS headers test', false, error.message);
    return false;
  }
}

async function testErrorHandling() {
  logSection('TEST 7: Error Handling');
  
  try {
    // Test 404
    const notFoundResponse = await fetch(`${API_BASE}/api/v2/nonexistent`);
    logTest('404 for nonexistent endpoint', notFoundResponse.status === 404);
    
    // Test invalid JSON
    const invalidJsonResponse = await fetch(`${API_BASE}/api/v2/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json',
    });
    logTest('400 for invalid JSON', invalidJsonResponse.status === 400 || invalidJsonResponse.status === 500);
    
    return true;
  } catch (error) {
    logTest('Error handling test', false, error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     DARTMOUTH OS V2.0 - INTEGRATION TESTS                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nAPI Base URL: ${API_BASE}\n`);
  
  await testRootEndpoint();
  await testHealthEndpoints();
  await testAgentsEndpoint();
  await testChatEndpoint();
  await testLegacyEndpoints();
  await testCORSHeaders();
  await testErrorHandling();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('  TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testsTotal}`);
  console.log(`Passed: ${testsPassed} ✅`);
  console.log(`Failed: ${testsFailed} ❌`);
  console.log(`Success Rate: ${((testsPassed / testsTotal) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
  
  if (testsFailed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! 🎉\n');
    return true;
  } else {
    console.log(`\n⚠️  ${testsFailed} TEST(S) FAILED\n`);
    return false;
  }
}

// Run all tests
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

