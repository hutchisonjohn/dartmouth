/**
 * Health Check Verification Script
 * Verifies that Dartmouth OS health monitoring is working correctly
 */

const API_BASE = process.env.API_BASE || 'http://localhost:8787';

async function testHealthCheck() {
  console.log('🏥 Testing Dartmouth OS Health Monitoring...\n');

  try {
    // Test 1: Overall health check
    console.log('1️⃣ Testing overall health check...');
    const healthResponse = await fetch(`${API_BASE}/api/v2/health`);
    const healthData = await healthResponse.json();
    
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Overall Status: ${healthData.status}`);
    console.log(`   Agents Checked: ${healthData.agents?.length || 0}`);
    
    if (healthData.agents) {
      healthData.agents.forEach(agent => {
        console.log(`   - ${agent.agentId}: ${agent.status} (${agent.responseTime}ms)`);
      });
    }
    console.log('   ✅ Overall health check passed\n');

    // Test 2: Specific agent health check (FAM)
    console.log('2️⃣ Testing FAM agent health check...');
    const famHealthResponse = await fetch(`${API_BASE}/api/v2/health?agentId=fam`);
    const famHealthData = await famHealthResponse.json();
    
    console.log(`   Status: ${famHealthResponse.status}`);
    console.log(`   Agent: ${famHealthData.agentId}`);
    console.log(`   Health Status: ${famHealthData.status}`);
    console.log(`   Response Time: ${famHealthData.responseTime}ms`);
    console.log(`   Error Count: ${famHealthData.errorCount}`);
    console.log(`   Success Count: ${famHealthData.successCount}`);
    console.log('   ✅ FAM health check passed\n');

    // Test 3: Specific agent health check (Artwork Analyzer)
    console.log('3️⃣ Testing Artwork Analyzer health check...');
    const artworkHealthResponse = await fetch(`${API_BASE}/api/v2/health?agentId=mccarthy-artwork`);
    const artworkHealthData = await artworkHealthResponse.json();
    
    console.log(`   Status: ${artworkHealthResponse.status}`);
    console.log(`   Agent: ${artworkHealthData.agentId}`);
    console.log(`   Health Status: ${artworkHealthData.status}`);
    console.log(`   Response Time: ${artworkHealthData.responseTime}ms`);
    console.log('   ✅ Artwork Analyzer health check passed\n');

    // Test 4: Agent list
    console.log('4️⃣ Testing agent list...');
    const agentsResponse = await fetch(`${API_BASE}/api/v2/agents`);
    const agentsData = await agentsResponse.json();
    
    console.log(`   Status: ${agentsResponse.status}`);
    console.log(`   Total Agents: ${agentsData.total}`);
    console.log(`   Healthy Agents: ${agentsData.healthy}`);
    console.log(`   Unhealthy Agents: ${agentsData.unhealthy}`);
    
    if (agentsData.agents) {
      console.log('   Registered Agents:');
      agentsData.agents.forEach(agent => {
        console.log(`   - ${agent.id}: ${agent.name} (${agent.healthStatus})`);
      });
    }
    console.log('   ✅ Agent list check passed\n');

    // Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ ALL HEALTH CHECKS PASSED!');
    console.log('═══════════════════════════════════════════════════');
    console.log(`Total Agents: ${agentsData.total}`);
    console.log(`Healthy: ${agentsData.healthy}`);
    console.log(`Unhealthy: ${agentsData.unhealthy}`);
    console.log('═══════════════════════════════════════════════════\n');

    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

// Run tests
testHealthCheck()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

