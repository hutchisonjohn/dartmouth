// Simple test for "how do I convert to sRGB?" question

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

  const message = `[Artwork Context: ${JSON.stringify(artworkContext)}] how do I convert to sRGB?`;

  console.log('Testing: "how do I convert to sRGB?"');
  console.log('');

  try {
    const response = await fetch(`${WORKER_URL}/api/v2/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'mccarthy-artwork',
        message: message,
        sessionId: 'test-srgb-' + Date.now(),
        userId: 'test-user'
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS!');
      console.log('');
      console.log('Response:', data.content);
      console.log('');
      if (data.metadata?.error) {
        console.log('⚠️  Warning - error in metadata:', data.metadata.error);
      }
    } else {
      console.log('❌ FAILED!');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ ERROR!');
    console.log(error.message);
  }
}

test();

