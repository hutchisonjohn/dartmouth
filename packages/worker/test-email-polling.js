/**
 * Test script to trigger the scheduled email polling worker
 * Run this while wrangler dev is running
 */

async function testScheduledWorker() {
  try {
    console.log('🧪 Testing scheduled email polling worker...');
    
    // Trigger the scheduled event
    const response = await fetch('http://127.0.0.1:8787/__scheduled?cron=*+*+*+*+*');
    
    console.log('Response status:', response.status);
    console.log('Response:', await response.text());
    
    console.log('✅ Scheduled worker triggered!');
    console.log('📋 Check the wrangler dev console for logs');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testScheduledWorker();


