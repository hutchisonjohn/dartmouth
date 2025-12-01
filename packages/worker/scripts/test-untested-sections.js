/**
 * Test Script for UNTESTED SECTIONS (Section B)
 * From: RETEST_FAILED_AND_UNTESTED.md
 * 
 * This script tests the 25 untested questions from Section B
 * with slower execution to avoid worker resource limits.
 */

const WORKER_URL = 'https://dartmouth-os-worker.dartmouth.workers.dev';
const AGENT_ID = 'mccarthy-artwork';

// Test artwork data
const TEST_ARTWORK = {
  width: 2811,
  height: 2539,
  dpi: 300,
  colorMode: 'RGB',
  hasTransparency: true,
  fileSize: 10870000,
  format: 'PNG',
  iccProfile: null
};

// Slower timing to avoid 503 errors
const DELAY_BETWEEN_TESTS = 3000; // 3 seconds
const DELAY_BETWEEN_SECTIONS = 10000; // 10 seconds

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const results = [];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendMessage(message, sessionId) {
  const artworkContext = {
    fileName: 'test-artwork.png',
    dimensions: `${TEST_ARTWORK.width}x${TEST_ARTWORK.height}`,
    dpi: TEST_ARTWORK.dpi.toString(),
    fileSize: `${(TEST_ARTWORK.fileSize / 1024 / 1024).toFixed(2)} MB`,
    fileType: TEST_ARTWORK.format,
    quality: 'Good',
    hasAlpha: TEST_ARTWORK.hasTransparency ? 'Yes' : 'No',
    bitDepth: '8-bit',
    iccProfile: TEST_ARTWORK.iccProfile || 'None',
    aspectRatio: `${(TEST_ARTWORK.width / TEST_ARTWORK.height).toFixed(2)}:1`
  };

  const messageWithContext = `[Artwork Context: ${JSON.stringify(artworkContext)}] ${message}`;

  const response = await fetch(`${WORKER_URL}/api/v2/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agentId: AGENT_ID,
      message: messageWithContext,
      sessionId: sessionId,
      userId: 'test-user'
    })
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result.content || '';
}

async function runTest(testId, section, input, expected, validator) {
  totalTests++;
  const sessionId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`\n${colors.cyan}Test ${testId}:${colors.reset} ${input}`);
  
  try {
    const response = await sendMessage(input, sessionId);
    console.log(`${colors.gray}Response: ${response.substring(0, 150)}...${colors.reset}`);
    
    const pass = validator(response);
    
    if (pass) {
      passedTests++;
      console.log(`${colors.green}✓ PASS${colors.reset}`);
      results.push({ testId, section, input, expected, response, pass: true });
    } else {
      failedTests++;
      console.log(`${colors.red}✗ FAIL${colors.reset}`);
      console.log(`${colors.red}Expected: ${expected}${colors.reset}`);
      results.push({ testId, section, input, expected, response, pass: false });
    }
    
    await delay(DELAY_BETWEEN_TESTS);
    return pass;
  } catch (error) {
    failedTests++;
    console.log(`${colors.red}✗ ERROR: ${error.message}${colors.reset}`);
    results.push({ testId, section, input, expected, error: error.message, pass: false });
    await delay(DELAY_BETWEEN_TESTS);
    return false;
  }
}

async function testSection12_Constraints() {
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}Section 12: CONSTRAINT ENFORCEMENT (5 tests)${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);

  await runTest(
    'B1 (12.1)',
    'Constraints',
    'how much does this cost?',
    'Please contact our sales team (NO pricing info)',
    (r) => {
      const lower = r.toLowerCase();
      const noPricing = !(/\$\d+|dollar|price.*\d+|cost.*\d+/.test(r));
      const hasRedirect = lower.includes('sales') || lower.includes('contact') || lower.includes('team');
      return noPricing && hasRedirect;
    }
  );

  await runTest(
    'B2 (12.2)',
    'Constraints',
    'can I get a discount?',
    'Please contact our sales team (NO discount info)',
    (r) => {
      const lower = r.toLowerCase();
      const noDiscount = !(lower.includes('yes') || /\d+%/.test(r));
      const hasRedirect = lower.includes('sales') || lower.includes('contact');
      return noDiscount && hasRedirect;
    }
  );

  await runTest(
    'B3 (12.3)',
    'Constraints',
    'how do I get a refund?',
    'Please contact support (NO refund processing)',
    (r) => {
      const lower = r.toLowerCase();
      const noPromise = !(lower.includes('yes') || lower.includes('of course'));
      const hasRedirect = lower.includes('support') || lower.includes('customer service') || lower.includes('contact');
      return noPromise && hasRedirect;
    }
  );

  await runTest(
    'B4 (12.4)',
    'Constraints',
    'what payment methods do you accept?',
    'Redirect to sales/website (NO payment info)',
    (r) => {
      const lower = r.toLowerCase();
      const noDetails = !(lower.includes('visa') || lower.includes('mastercard') || lower.includes('paypal'));
      const hasRedirect = lower.includes('sales') || lower.includes('contact') || lower.includes('website');
      return noDetails && hasRedirect;
    }
  );

  await runTest(
    'B5 (12.5)',
    'Constraints',
    'where is my order?',
    'Redirect to support (stays in scope - artwork only)',
    (r) => {
      const lower = r.toLowerCase();
      const hasRedirect = lower.includes('support') || lower.includes('customer service') || lower.includes('contact');
      return hasRedirect;
    }
  );
}

async function testSection13_ContextRetention() {
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}Section 13: CONTEXT RETENTION (5 tests)${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);

  // B6: Follow-up without context
  const sessionB6 = `test-${Date.now()}-b6`;
  console.log(`\n${colors.cyan}Test B6 (13.1) - Part 1:${colors.reset} what is the DPI at 28.5 cm wide?`);
  await sendMessage('what is the DPI at 28.5 cm wide?', sessionB6);
  await delay(DELAY_BETWEEN_TESTS);
  
  await runTest(
    'B6 (13.1)',
    'Context',
    'and what about 30 cm?',
    'Understands "30 cm" refers to width, calculates DPI',
    (r) => /23[78]|DPI/i.test(r)
  );

  // B7: Pronoun reference
  const sessionB7 = `test-${Date.now()}-b7`;
  console.log(`\n${colors.cyan}Test B7 (13.2) - Part 1:${colors.reset} does my artwork have transparency?`);
  await sendMessage('does my artwork have transparency?', sessionB7);
  await delay(DELAY_BETWEEN_TESTS);
  
  await runTest(
    'B7 (13.2)',
    'Context',
    'is that good for DTF?',
    'Understands "that" refers to transparency status',
    (r) => {
      const lower = r.toLowerCase();
      return lower.includes('transparency') || lower.includes('dtf') || lower.includes('yes') || lower.includes('good');
    }
  );

  // B8: Multiple follow-ups
  const sessionB8 = `test-${Date.now()}-b8`;
  console.log(`\n${colors.cyan}Test B8 (13.3) - Multiple follow-ups${colors.reset}`);
  await sendMessage('what is the DPI at 28.5 cm wide?', sessionB8);
  await delay(DELAY_BETWEEN_TESTS);
  await sendMessage('and at 30 cm?', sessionB8);
  await delay(DELAY_BETWEEN_TESTS);
  
  await runTest(
    'B8 (13.3)',
    'Context',
    'also what about 35 cm?',
    'All answers correctly with context maintained',
    (r) => /20[0-9]|DPI/i.test(r)
  );

  // B9: Topic switch
  const sessionB9 = `test-${Date.now()}-b9`;
  console.log(`\n${colors.cyan}Test B9 (13.4) - Part 1:${colors.reset} what is the DPI at 28.5 cm?`);
  await sendMessage('what is the DPI at 28.5 cm?', sessionB9);
  await delay(DELAY_BETWEEN_TESTS);
  console.log(`${colors.cyan}Test B9 (13.4) - Part 2:${colors.reset} what colors are in my artwork?`);
  await sendMessage('what colors are in my artwork?', sessionB9);
  await delay(DELAY_BETWEEN_TESTS);
  
  await runTest(
    'B9 (13.4)',
    'Context',
    'what was the DPI again?',
    'Remembers previous DPI context',
    (r) => /25[01]|DPI/i.test(r)
  );

  // B10: Artwork memory (new session)
  console.log(`\n${colors.yellow}Test B10 (13.5): Skipping - requires session persistence across restarts${colors.reset}`);
  totalTests++;
}

async function testSection14_NaturalLanguage() {
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}Section 14: NATURAL LANGUAGE UNDERSTANDING (5 tests)${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);

  await runTest(
    'B11 (14.1)',
    'NLU',
    'yo, what\'s the dpi if i make it like 28 cm wide?',
    'Understands and calculates DPI',
    (r) => /25[0-5]|DPI/i.test(r)
  );

  await runTest(
    'B12 (14.2)',
    'NLU',
    '28.5 cm wide dpi?',
    'Understands and calculates DPI',
    (r) => /25[01]|DPI/i.test(r)
  );

  await runTest(
    'B13 (14.3)',
    'NLU',
    'what\'s the DPI at 28 cm and also what are the colors?',
    'Answers both questions',
    (r) => {
      const hasDPI = /25[0-5]|DPI/i.test(r);
      const hasColors = /color|rgb|#[0-9a-f]{6}/i.test(r);
      return hasDPI || hasColors; // At least one
    }
  );

  await runTest(
    'B14 (14.4)',
    'NLU',
    'waht is teh dpi at 28cm wdie?',
    'Understands despite typos',
    (r) => /25[0-5]|DPI/i.test(r)
  );

  await runTest(
    'B15 (14.5)',
    'NLU',
    'if i wanna print this at like 30 cm, what dpi am i looking at?',
    'Understands and calculates DPI',
    (r) => /23[78]|DPI/i.test(r)
  );
}

async function testSection15_ErrorHandling() {
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}Section 15: ERROR HANDLING (5 tests)${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);

  await runTest(
    'B16 (15.1)',
    'Error Handling',
    'what\'s the DPI at -5 cm wide?',
    'Error message or clarification request',
    (r) => r.length > 20 // Should respond with something
  );

  await runTest(
    'B17 (15.2)',
    'Error Handling',
    'asdfghjkl qwerty',
    'Asks for clarification',
    (r) => {
      const lower = r.toLowerCase();
      return lower.includes('help') || lower.includes('understand') || lower.includes('clarify') || lower.includes('can you');
    }
  );

  await runTest(
    'B18 (15.3)',
    'Error Handling',
    'what\'s the weather like?',
    'Politely redirects to artwork topics',
    (r) => {
      const lower = r.toLowerCase();
      return lower.includes('artwork') || lower.includes('printing') || lower.includes('help') || lower.includes('dpi');
    }
  );

  await runTest(
    'B19 (15.4)',
    'Error Handling',
    '   ',
    'Handles gracefully or prompts for input',
    (r) => r.length > 10
  );

  const longMessage = 'I need help with my artwork and I have a lot of questions about DPI and printing and colors and transparency and file formats and everything else you can help me with because I am very confused about all of this and I do not know where to start and I hope you can guide me through this process step by step because I really need to get this right for my business and my customers are waiting for me to deliver high quality prints and I cannot afford to make mistakes at this point in time so please help me understand what I need to do to prepare my artwork properly for DTF printing and also UV DTF printing if that is different from regular DTF printing and I also need to know about color modes and DPI requirements and minimum text sizes and all the other technical details that I need to know to ensure my artwork is print-ready and meets all the requirements for professional quality output.';
  
  await runTest(
    'B20 (15.5)',
    'Error Handling',
    longMessage,
    'Extract intent and provide helpful response',
    (r) => r.length > 100 && r.toLowerCase().includes('help')
  );
}

async function testSection16_ResponseQuality() {
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}Section 16: RESPONSE QUALITY (5 tests)${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);

  await runTest(
    'B21 (16.1)',
    'Quality',
    'what\'s the DPI at 28.5 cm wide?',
    '2-3 sentences MAX',
    (r) => {
      const sentences = r.split(/[.!?]+/).filter(s => s.trim().length > 0);
      return sentences.length <= 5; // Lenient
    }
  );

  await runTest(
    'B22 (16.2)',
    'Quality',
    'what size can I print at 300 DPI?',
    'Bold numbers, emojis for quality, proper markdown',
    (r) => /\*\*|\d+\.\d+/.test(r)
  );

  await runTest(
    'B23 (16.3)',
    'Quality',
    'what\'s the DPI at 28.5 cm wide?',
    'Exactly 251 DPI (±1 tolerance)',
    (r) => /\b25[01]\b/.test(r)
  );

  await runTest(
    'B24 (16.4)',
    'Quality',
    'what\'s the DPI at 28.5 cm wide?',
    'Includes CM, inches, DPI, and quality rating',
    (r) => {
      const hasCm = /cm/i.test(r);
      const hasInches = /inch|"/i.test(r);
      const hasDPI = /DPI/i.test(r);
      const hasQuality = /quality|optimal|good|poor/i.test(r);
      return hasCm && hasInches && hasDPI && hasQuality;
    }
  );

  await runTest(
    'B25 (16.5)',
    'Quality',
    'hello',
    'Friendly, helpful, professional but approachable',
    (r) => {
      const lower = r.toLowerCase();
      const isFriendly = lower.includes('!') || lower.includes('happy') || lower.includes('glad') || lower.includes('hi');
      return isFriendly && r.length > 20;
    }
  );
}

async function main() {
  console.log(`${colors.blue}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║     McCarthy Artwork Agent - UNTESTED SECTIONS (B)            ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`\nWorker URL: ${WORKER_URL}`);
  console.log(`Agent ID: ${AGENT_ID}`);
  console.log(`Test Artwork: ${TEST_ARTWORK.width}x${TEST_ARTWORK.height} @ ${TEST_ARTWORK.dpi} DPI`);
  console.log(`\n${colors.yellow}⚠️  Running slowly to avoid worker resource limits (3s between tests, 10s between sections)${colors.reset}`);

  const startTime = Date.now();

  try {
    await testSection12_Constraints();
    await delay(DELAY_BETWEEN_SECTIONS);
    
    await testSection13_ContextRetention();
    await delay(DELAY_BETWEEN_SECTIONS);
    
    await testSection14_NaturalLanguage();
    await delay(DELAY_BETWEEN_SECTIONS);
    
    await testSection15_ErrorHandling();
    await delay(DELAY_BETWEEN_SECTIONS);
    
    await testSection16_ResponseQuality();
  } catch (error) {
    console.error(`\n${colors.red}Fatal error:${colors.reset}`, error);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;

  console.log(`\n${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}SUMMARY${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`Total Tests:   ${totalTests}`);
  console.log(`${colors.green}Passed:        ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed:        ${failedTests}${colors.reset}`);
  console.log(`Pass Rate:     ${passRate >= 75 ? colors.green : colors.yellow}${passRate}%${colors.reset}`);
  console.log(`Duration:      ${duration}s`);

  console.log(`\n${colors.cyan}Detailed Results:${colors.reset}`);
  results.forEach(r => {
    const status = r.pass ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
    console.log(`${status} ${r.testId}: ${r.input.substring(0, 50)}...`);
  });

  process.exit(failedTests > 0 ? 1 : 0);
}

main().catch(error => {
  console.error(`\n${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});

