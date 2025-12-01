// Test "Hi" greeting

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

  const message = `[Artwork Context: ${JSON.stringify(artworkContext)}] Hi`;

  console.log('Testing: "Hi"');
  console.log('');

  const response = await fetch(`${WORKER_URL}/api/v2/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agentId: 'mccarthy-artwork',
      message: message,
      sessionId: 'test-hi-' + Date.now(),
      userId: 'test-user'
    })
  });

  const data = await response.json();
  console.log('Response:', data.content);
  console.log('');
  
  if (data.content.includes('YouTube tutorial')) {
    console.log('❌ STILL BROKEN - Greeting triggers YouTube tutorial');
  } else if (data.content.toLowerCase().includes('hi') || 
             data.content.toLowerCase().includes('hello') || 
             data.content.toLowerCase().includes('hey') ||
             data.content.toLowerCase().includes('mccarthy')) {
    console.log('✅ FIXED - Proper greeting response!');
  } else {
    console.log('⚠️  UNEXPECTED - Different response');
  }
}

test();

