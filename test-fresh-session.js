// Test with completely fresh session

const WORKER_URL = 'https://dartmouth-os-worker.dartmouth.workers.dev';

async function test() {
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

  // Use a completely unique session ID
  const sessionId = 'fresh-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

  const message = `[Artwork Context: ${JSON.stringify(artworkContext)}] Hi`;

  console.log('Testing: "Hi" with FRESH session');
  console.log('Session ID:', sessionId);
  console.log('');

  const response = await fetch(`${WORKER_URL}/api/v2/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agentId: 'mccarthy-artwork',
      message: message,
      sessionId: sessionId,
      userId: 'test-user-fresh'
    })
  });

  const data = await response.json();
  console.log('Response:', data.content);
  console.log('');
  
  if (data.content.includes('YouTube tutorial')) {
    console.log('❌ BROKEN - Even fresh session triggers YouTube tutorial');
    console.log('This means the code itself is broken, not just session state');
  } else if (data.content.toLowerCase().includes('hey') || 
             data.content.toLowerCase().includes('hello') ||
             data.content.toLowerCase().includes('mccarthy')) {
    console.log('✅ WORKING - Proper greeting response!');
  } else {
    console.log('⚠️  UNEXPECTED:', data.content);
  }
}

test();

