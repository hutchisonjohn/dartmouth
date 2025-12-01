// Test YouTube tutorial feature

const WORKER_URL = 'https://dartmouth-os-worker.dartmouth.workers.dev';

const artworkContext = {
  fileName: 'test.png',
  dimensions: '2811x2539',
  dpi: '300',
  fileSize: '10.37 MB',
  fileType: 'PNG',
  quality: 'Good',
  hasAlpha: 'Yes',
  bitDepth: '8-bit',
  iccProfile: 'None',
  aspectRatio: '1.11:1'
};

async function sendMessage(sessionId, message) {
  const fullMessage = `[Artwork Context: ${JSON.stringify(artworkContext)}] ${message}`;
  
  const response = await fetch(`${WORKER_URL}/api/v2/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agentId: 'mccarthy-artwork',
      message: fullMessage,
      sessionId: sessionId,
      userId: 'test-user'
    })
  });

  const data = await response.json();
  return data.content;
}

async function test() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST 1: Greeting should work (not trigger YouTube)');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const session1 = 'test-greeting-' + Date.now();
  const response1 = await sendMessage(session1, 'Hi');
  console.log('User: Hi');
  console.log('Agent:', response1);
  
  if (response1.includes('YouTube tutorial')) {
    console.log('❌ FAILED - Greeting triggered YouTube tutorial\n');
  } else if (response1.toLowerCase().includes('hey') || response1.toLowerCase().includes('mccarthy')) {
    console.log('✅ PASSED - Proper greeting\n');
  } else {
    console.log('⚠️  UNEXPECTED\n');
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST 2: How-to question should offer YouTube');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  await new Promise(resolve => setTimeout(resolve, 2000)); // Delay
  
  const session2 = 'test-howto-' + Date.now();
  const response2 = await sendMessage(session2, 'how do I convert to sRGB?');
  console.log('User: how do I convert to sRGB?');
  console.log('Agent:', response2);
  
  if (response2.includes('Would you like a quick YouTube tutorial?')) {
    console.log('✅ PASSED - Offered YouTube tutorial\n');
  } else {
    console.log('❌ FAILED - Did not offer YouTube tutorial\n');
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST 3: "Yes" response should provide YouTube link');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  await new Promise(resolve => setTimeout(resolve, 2000)); // Delay
  
  const response3 = await sendMessage(session2, 'yes');
  console.log('User: yes');
  console.log('Agent:', response3);
  
  if (response3.includes('youtube.com')) {
    console.log('✅ PASSED - Provided YouTube link\n');
  } else {
    console.log('❌ FAILED - Did not provide YouTube link\n');
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST 4: New session with "yes" should NOT trigger YouTube');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  await new Promise(resolve => setTimeout(resolve, 2000)); // Delay
  
  const session4 = 'test-yes-alone-' + Date.now();
  const response4 = await sendMessage(session4, 'yes');
  console.log('User: yes (in new session)');
  console.log('Agent:', response4);
  
  if (response4.includes('youtube.com') || response4.includes('YouTube tutorial')) {
    console.log('❌ FAILED - "Yes" alone triggered YouTube (should not)\n');
  } else {
    console.log('✅ PASSED - "Yes" alone did not trigger YouTube\n');
  }
}

test().catch(console.error);

