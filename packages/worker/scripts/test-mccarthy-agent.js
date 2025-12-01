/**
 * Automated Test Suite for McCarthy Artwork Agent
 * 
 * This script automatically tests all categories of the McCarthy Artwork Agent
 * against the deployed Dartmouth worker.
 * 
 * Usage: node scripts/test-mccarthy-agent.js [--category=N] [--verbose]
 */

const WORKER_URL = 'https://dartmouth-os-worker.dartmouth.workers.dev';
const AGENT_ID = 'mccarthy-artwork';

// Test artwork data (simulating uploaded artwork)
const TEST_ARTWORK = {
  width: 2811,
  height: 2539,
  dpi: 300,
  colorMode: 'RGB',
  hasTransparency: true,
  fileSize: 10870000, // ~10.37 MB
  format: 'PNG',
  iccProfile: null
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let skippedTests = 0;
const failedTestDetails = [];

// Command line arguments
const args = process.argv.slice(2);
const categoryFilter = args.find(arg => arg.startsWith('--category='))?.split('=')[1];
const verbose = args.includes('--verbose');

// Rate limiting configuration
const DELAY_BETWEEN_TESTS = 2000; // 2 seconds between tests
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds between retries

/**
 * Delay helper
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Send a chat message to the agent with retry logic
 */
async function sendMessage(message, sessionId, metadata = {}, retryCount = 0) {
  // Prepare artwork context to embed in message (McCarthy Artwork Agent expects this format)
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
    aspectRatio: `${(TEST_ARTWORK.width / TEST_ARTWORK.height).toFixed(2)}:1`,
    colors: null
  };

  // Embed artwork context in message (only on first message of session)
  const messageWithContext = `[Artwork Context: ${JSON.stringify(artworkContext)}] ${message}`;

  try {
    const response = await fetch(`${WORKER_URL}/api/v2/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId: AGENT_ID,
        message: messageWithContext,
        sessionId: sessionId,
        userId: 'test-user'
      })
    });

    const responseText = await response.text();
    
    // Handle 503 Service Unavailable (worker resource limits)
    if (response.status === 503 && retryCount < MAX_RETRIES) {
      if (verbose) {
        console.log(`${colors.yellow}  503 error, retrying in ${RETRY_DELAY/1000}s... (attempt ${retryCount + 1}/${MAX_RETRIES})${colors.reset}`);
      }
      await delay(RETRY_DELAY);
      return sendMessage(message, sessionId, metadata, retryCount + 1);
    }
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}\n${responseText.substring(0, 500)}`);
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Failed to parse response as JSON. Response: ${responseText.substring(0, 500)}`);
    }

    // Debug: log response structure for first request
    if (verbose && totalTests === 1) {
      console.log(`${colors.gray}  API Response structure:${colors.reset}`, JSON.stringify(result, null, 2).substring(0, 300));
    }

    return result;
  } catch (error) {
    // Retry on network errors
    if (retryCount < MAX_RETRIES && (error.message.includes('fetch') || error.message.includes('network'))) {
      if (verbose) {
        console.log(`${colors.yellow}  Network error, retrying in ${RETRY_DELAY/1000}s... (attempt ${retryCount + 1}/${MAX_RETRIES})${colors.reset}`);
      }
      await delay(RETRY_DELAY);
      return sendMessage(message, sessionId, metadata, retryCount + 1);
    }
    throw error;
  }
}

/**
 * Run a single test
 */
async function runTest(testId, category, description, message, validator, sessionId = null) {
  totalTests++;
  
  // Generate unique session ID if not provided
  if (!sessionId) {
    sessionId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  try {
    if (verbose) {
      console.log(`${colors.gray}  Sending: "${message}"${colors.reset}`);
    }

    const result = await sendMessage(message, sessionId);
    
    // Check if result has expected structure
    if (!result || typeof result !== 'object') {
      throw new Error(`Invalid API response structure: ${JSON.stringify(result)}`);
    }

    // The response content is in the 'content' field (AgentResponse interface)
    const responseText = result.content || result.response || result.message || '';
    
    if (verbose) {
      console.log(`${colors.gray}  Response: "${responseText.substring(0, 100)}..."${colors.reset}`);
    }

    // Add responseText to result for validators
    result.responseText = responseText;

    // Run validator
    const validation = validator(result);
    
    if (validation.pass) {
      passedTests++;
      console.log(`  ${colors.green}✓${colors.reset} ${testId}: ${description}`);
      
      // Add delay between tests to avoid rate limits
      await delay(DELAY_BETWEEN_TESTS);
      
      return { pass: true, sessionId };
    } else {
      failedTests++;
      console.log(`  ${colors.red}✗${colors.reset} ${testId}: ${description}`);
      console.log(`    ${colors.red}Expected: ${validation.expected}${colors.reset}`);
      console.log(`    ${colors.red}Got: ${validation.actual}${colors.reset}`);
      
      failedTestDetails.push({
        testId,
        category,
        description,
        message,
        expected: validation.expected,
        actual: validation.actual,
        response: result.response
      });
      
      // Add delay between tests to avoid rate limits
      await delay(DELAY_BETWEEN_TESTS);
      
      return { pass: false, sessionId };
    }
  } catch (error) {
    failedTests++;
    console.log(`  ${colors.red}✗${colors.reset} ${testId}: ${description}`);
    console.log(`    ${colors.red}Error: ${error.message}${colors.reset}`);
    
    failedTestDetails.push({
      testId,
      category,
      description,
      message,
      error: error.message
    });
    
    // Add delay between tests to avoid rate limits
    await delay(DELAY_BETWEEN_TESTS);
    
    return { pass: false, sessionId };
  }
}

/**
 * Category 1: Greeting & Basic Interaction
 */
async function testCategory1() {
  console.log(`\n${colors.cyan}${colors.bright}Category 1: Greeting & Basic Interaction${colors.reset}`);
  
  await runTest(
    '1.1',
    'Greeting',
    'Basic Greeting',
    'hello',
    (result) => {
      const response = (result.responseText || '').toLowerCase();
      const hasGreeting = response.includes('hello') || response.includes('hi') || response.includes('hey');
      const hasArtwork = response.includes('artwork') || response.includes('printing');
      return {
        pass: hasGreeting && hasArtwork,
        expected: 'Greeting with artwork/printing context',
        actual: hasGreeting ? 'Has greeting' : 'No greeting'
      };
    }
  );

  await runTest(
    '1.2',
    'Greeting',
    'Help Request',
    'can you help me?',
    (result) => {
      const response = (result.responseText || '').toLowerCase();
      const isHelpful = response.includes('help') || response.includes('assist') || response.includes('can');
      return {
        pass: isHelpful && response.length > 50,
        expected: 'Helpful response explaining capabilities',
        actual: isHelpful ? 'Helpful response' : 'Not helpful'
      };
    }
  );

  await runTest(
    '1.3',
    'Greeting',
    'Casual Greeting',
    'hey there',
    (result) => {
      const response = (result.responseText || '').toLowerCase();
      const hasGreeting = response.includes('hi') || response.includes('hello') || response.includes('hey');
      return {
        pass: hasGreeting,
        expected: 'Friendly greeting response',
        actual: hasGreeting ? 'Has greeting' : 'No greeting'
      };
    }
  );
}

/**
 * Category 2: DPI Calculations
 */
async function testCategory2() {
  console.log(`\n${colors.cyan}${colors.bright}Category 2: DPI Calculations${colors.reset}`);
  
  // Test 2.1: Standard DPI calculation
  await runTest(
    '2.1',
    'Calculation',
    'Standard DPI at 28.5 cm',
    'what is the DPI at 28.5 cm wide?',
    (result) => {
      const response = result.responseText || '';
      const hasDPI = /\*\*25[01]\*\*|\b25[01]\b/i.test(response); // 250 or 251 DPI (with or without markdown)
      const hasSize = /28\.5/i.test(response);
      return {
        pass: hasDPI && hasSize,
        expected: '~251 DPI at 28.5 cm',
        actual: hasDPI ? 'Has correct DPI' : 'Wrong DPI'
      };
    }
  );

  // Test 2.2: Different size
  await runTest(
    '2.2',
    'Calculation',
    'DPI at 30 cm',
    'what about 30 cm wide?',
    (result) => {
      const response = result.responseText || '';
      const hasDPI = /\*\*23[78]\*\*|\b23[78]\b/i.test(response); // 237 or 238 DPI (with or without markdown)
      return {
        pass: hasDPI,
        expected: '~237 DPI at 30 cm',
        actual: hasDPI ? 'Has correct DPI' : 'Wrong DPI'
      };
    }
  );

  // Test 2.3: Reverse calculation - what size at 300 DPI
  await runTest(
    '2.3',
    'Calculation',
    'Reverse: Size at 300 DPI',
    'what size can I print at 300 DPI?',
    (result) => {
      const response = result.responseText || '';
      const hasSize = /23\.8|23\.7|9\.3[0-9]"/i.test(response); // ~23.8 cm or ~9.37"
      return {
        pass: hasSize,
        expected: '~23.8 cm (9.37") at 300 DPI',
        actual: hasSize ? 'Has correct size' : 'Wrong size'
      };
    }
  );

  // Test 2.4: Multiple DPI values
  await runTest(
    '2.4',
    'Calculation',
    'Multiple DPI values',
    'show me sizes for 300, 250, and 200 DPI',
    (result) => {
      const response = result.responseText || '';
      const has300 = /300\s*DPI/i.test(response);
      const has250 = /250\s*DPI/i.test(response);
      const has200 = /200\s*DPI/i.test(response);
      return {
        pass: has300 && has250 && has200,
        expected: 'All three DPI values with sizes',
        actual: `300:${has300}, 250:${has250}, 200:${has200}`
      };
    }
  );

  // Test 2.5: Low resolution warning
  await runTest(
    '2.5',
    'Calculation',
    'Low resolution warning',
    'what is the DPI at 50 cm wide?',
    (result) => {
      const response = (result.responseText || '').toLowerCase();
      const hasWarning = response.includes('low') || response.includes('poor') || response.includes('below');
      const hasDPI = /\*\*14[23]\*\*|\b14[23]\b/i.test(result.responseText || ''); // ~142-143 DPI (with or without markdown)
      return {
        pass: hasWarning && hasDPI,
        expected: 'Low DPI warning (~142 DPI)',
        actual: hasWarning && hasDPI ? 'Has warning and DPI' : hasWarning ? 'Has warning, wrong DPI' : 'No warning'
      };
    }
  );
}

/**
 * Category 3: DTF Questions (RAG)
 */
async function testCategory3() {
  console.log(`\n${colors.cyan}${colors.bright}Category 3: DTF Questions (RAG)${colors.reset}`);
  
  await runTest(
    '3.1',
    'RAG',
    'DTF Preparation',
    'how do I prepare my artwork for DTF printing?',
    (result) => {
      const response = (result.responseText || '').toLowerCase();
      const hasYouTube = response.includes('youtube') || response.includes('tutorial');
      const hasInfo = response.includes('dtf') || response.includes('print');
      return {
        pass: hasYouTube || hasInfo,
        expected: 'YouTube tutorial offer or DTF preparation info',
        actual: hasYouTube ? 'Has YouTube offer' : 'Has info'
      };
    }
  );

  await runTest(
    '3.2',
    'RAG',
    'Minimum Text Size',
    'what is the minimum text size for DTF?',
    (result) => {
      const response = result.responseText || '';
      const hasSize = /6\s*pt|6\s*point/i.test(response) || /8\s*pt|8\s*point/i.test(response);
      return {
        pass: hasSize,
        expected: 'Minimum text size (6-8pt)',
        actual: hasSize ? 'Has text size' : 'No text size'
      };
    }
  );

  await runTest(
    '3.3',
    'RAG',
    'Color Requirements',
    'what color mode should I use for DTF?',
    (result) => {
      const response = result.responseText || '';
      const hasRGB = /RGB/i.test(response);
      const hasCMYK = /CMYK/i.test(response);
      return {
        pass: hasRGB || hasCMYK,
        expected: 'Color mode information (RGB or CMYK)',
        actual: hasRGB ? 'Has RGB' : hasCMYK ? 'Has CMYK' : 'No color mode'
      };
    }
  );

  await runTest(
    '3.4',
    'RAG',
    'ICC Profile with typo',
    'does my artwork have an iic profile?',
    (result) => {
      const response = (result.responseText || '').toLowerCase();
      const hasAnswer = response.includes('no') || response.includes('not') || response.includes('doesn\'t');
      return {
        pass: hasAnswer,
        expected: 'No ICC profile (handles typo)',
        actual: hasAnswer ? 'Correct answer' : 'Wrong answer'
      };
    }
  );
}

/**
 * Category 4: Constraint Testing (CRITICAL)
 */
async function testCategory4() {
  console.log(`\n${colors.cyan}${colors.bright}Category 4: Constraint Testing (CRITICAL)${colors.reset}`);
  
  await runTest(
    '4.1',
    'Constraints',
    'Pricing Question',
    'how much does DTF printing cost?',
    (result) => {
      const response = (result.responseText || '').toLowerCase();
      const refusesPricing = !(/\$\d+|dollar|price.*\d+|cost.*\d+/i.test(response));
      const redirects = response.includes('sales') || response.includes('contact') || response.includes('team');
      return {
        pass: refusesPricing && redirects,
        expected: 'Refuse pricing, redirect to sales',
        actual: refusesPricing ? 'Refuses pricing' : 'Provides pricing'
      };
    }
  );

  await runTest(
    '4.2',
    'Constraints',
    'Discount Request',
    'can I get a discount?',
    (result) => {
      const response = (result.responseText || '').toLowerCase();
      const refusesDiscount = !(response.includes('yes') || /\d+%/.test(response));
      const redirects = response.includes('sales') || response.includes('contact');
      return {
        pass: refusesDiscount && redirects,
        expected: 'Refuse discount, redirect to sales',
        actual: refusesDiscount ? 'Refuses discount' : 'Offers discount'
      };
    }
  );

  await runTest(
    '4.3',
    'Constraints',
    'Refund Question',
    'can I get a refund if I\'m not happy?',
    (result) => {
      const response = (result.responseText || '').toLowerCase();
      const refusesRefund = !(response.includes('yes') || response.includes('of course'));
      const redirects = response.includes('support') || response.includes('customer service') || response.includes('contact');
      return {
        pass: refusesRefund && redirects,
        expected: 'Refuse refund promise, redirect to support',
        actual: refusesRefund ? 'Refuses refund' : 'Promises refund'
      };
    }
  );

  await runTest(
    '4.4',
    'Constraints',
    'Payment Methods',
    'what payment methods do you accept?',
    (result) => {
      const response = (result.responseText || '').toLowerCase();
      const avoidsDetails = !(response.includes('visa') || response.includes('mastercard') || response.includes('paypal'));
      const redirects = response.includes('sales') || response.includes('contact') || response.includes('website');
      return {
        pass: avoidsDetails && redirects,
        expected: 'Avoid payment details, redirect',
        actual: avoidsDetails ? 'Avoids details' : 'Provides details'
      };
    }
  );

  await runTest(
    '4.5',
    'Constraints',
    'Order Tracking',
    'where is my order?',
    (result) => {
      const response = (result.responseText || '').toLowerCase();
      const redirects = response.includes('support') || response.includes('customer service') || response.includes('contact');
      const staysInScope = response.includes('artwork') || redirects;
      return {
        pass: staysInScope,
        expected: 'Redirect to support, stay in artwork scope',
        actual: staysInScope ? 'Redirects appropriately' : 'Out of scope'
      };
    }
  );
}

/**
 * Category 5: Conversation Flow
 */
async function testCategory5() {
  console.log(`\n${colors.cyan}${colors.bright}Category 5: Conversation Flow${colors.reset}`);
  
  // Test 5.1: Context retention
  let sessionId = `test-context-${Date.now()}`;
  
  await runTest(
    '5.1a',
    'Context',
    'First message - provide dimensions',
    'I have a 4000x6000 pixel image',
    (result) => {
      const response = (result.responseText || '').toLowerCase();
      const acknowledges = response.includes('4000') || response.includes('6000');
      return {
        pass: acknowledges || response.length > 20,
        expected: 'Acknowledge dimensions',
        actual: acknowledges ? 'Acknowledges' : 'Generic response'
      };
    },
    sessionId
  );

  await runTest(
    '5.1b',
    'Context',
    'Follow-up - ask about DPI',
    'what DPI should I use?',
    (result) => {
      const response = result.responseText || '';
      const hasDPI = /\d{3}\s*DPI/i.test(response);
      const hasRecommendation = response.toLowerCase().includes('recommend') || response.toLowerCase().includes('suggest');
      return {
        pass: hasDPI || hasRecommendation,
        expected: 'DPI recommendation based on context',
        actual: hasDPI ? 'Has DPI value' : 'Generic response'
      };
    },
    sessionId
  );

  // Test 5.2: Topic change
  sessionId = `test-topic-${Date.now()}`;
  
  await runTest(
    '5.2a',
    'Context',
    'Topic change - DPI question',
    'what size can I print 4000x6000 at 300 DPI?',
    (result) => {
      const response = result.responseText || '';
      const hasSize = /\d+\.?\d*\s*(cm|inch)/i.test(response);
      return {
        pass: hasSize,
        expected: 'Print size calculation',
        actual: hasSize ? 'Has size' : 'No size'
      };
    },
    sessionId
  );

  await runTest(
    '5.2b',
    'Context',
    'Topic change - switch to UV DTF',
    'actually, tell me about UV DTF instead',
    (result) => {
      const response = (result.responseText || '').toLowerCase();
      const hasUVDTF = response.includes('uv dtf') || response.includes('uv-dtf');
      return {
        pass: hasUVDTF,
        expected: 'Switch to UV DTF topic',
        actual: hasUVDTF ? 'Discusses UV DTF' : 'Stays on previous topic'
      };
    },
    sessionId
  );
}

/**
 * Category 6: Edge Cases
 */
async function testCategory6() {
  console.log(`\n${colors.cyan}${colors.bright}Category 6: Edge Cases${colors.reset}`);
  
  await runTest(
    '6.1',
    'Edge Cases',
    'Invalid dimensions',
    'I have a -4000x6000 pixel image',
    (result) => {
      const response = (result.responseText || '').toLowerCase();
      const handlesGracefully = !response.includes('error') && response.length > 20;
      return {
        pass: handlesGracefully,
        expected: 'Handle gracefully',
        actual: handlesGracefully ? 'Handled gracefully' : 'Error or poor response'
      };
    }
  );

  await runTest(
    '6.2',
    'Edge Cases',
    'Extremely large image',
    'what about 50000x75000 pixels?',
    (result) => {
      const response = result.responseText || '';
      const hasCalculation = /\d+\s*(cm|inch|DPI)/i.test(response);
      return {
        pass: hasCalculation || response.length > 50,
        expected: 'Calculate or acknowledge large size',
        actual: hasCalculation ? 'Has calculation' : 'Generic response'
      };
    }
  );

  await runTest(
    '6.3',
    'Edge Cases',
    'Nonsense input',
    'asdfghjkl qwerty',
    (result) => {
      const response = (result.responseText || '').toLowerCase();
      const asksForClarification = response.includes('help') || response.includes('understand') || response.includes('clarify');
      return {
        pass: asksForClarification,
        expected: 'Ask for clarification',
        actual: asksForClarification ? 'Asks for clarification' : 'Tries to answer'
      };
    }
  );

  await runTest(
    '6.4',
    'Edge Cases',
    'Very long message',
    'I need help with my artwork and I have a lot of questions about DPI and printing and colors and transparency and file formats and everything else you can help me with because I am very confused about all of this and I do not know where to start and I hope you can guide me through this process step by step because I really need to get this right for my business and my customers are waiting for me to deliver high quality prints and I cannot afford to make mistakes at this point in time so please help me understand what I need to do to prepare my artwork properly for DTF printing and also UV DTF printing if that is different from regular DTF printing and I also need to know about color modes and DPI requirements and minimum text sizes and all the other technical details that I need to know to ensure my artwork is print-ready and meets all the requirements for professional quality output.',
    (result) => {
      const response = result.responseText || '';
      const isHelpful = response.length > 100 && response.toLowerCase().includes('help');
      return {
        pass: isHelpful,
        expected: 'Extract intent and provide helpful response',
        actual: isHelpful ? 'Helpful response' : 'Poor response'
      };
    }
  );
}

/**
 * Category 7: UV DTF Specific
 */
async function testCategory7() {
  console.log(`\n${colors.cyan}${colors.bright}Category 7: UV DTF Specific${colors.reset}`);
  
  await runTest(
    '7.1',
    'UV DTF',
    'UV DTF applications',
    'what can UV DTF be used for?',
    (result) => {
      const response = (result.responseText || '').toLowerCase();
      const hasHardSurfaces = response.includes('glass') || response.includes('metal') || response.includes('wood') || response.includes('hard');
      return {
        pass: hasHardSurfaces,
        expected: 'Hard substrates (glass, metal, wood, etc.)',
        actual: hasHardSurfaces ? 'Correct applications' : 'Wrong applications'
      };
    }
  );

  await runTest(
    '7.2',
    'UV DTF',
    'UV DTF vs DTF',
    'what is the difference between DTF and UV DTF?',
    (result) => {
      const response = (result.responseText || '').toLowerCase();
      const mentionsBoth = (response.includes('dtf') && response.includes('uv')) || response.includes('difference');
      return {
        pass: mentionsBoth,
        expected: 'Explain differences between DTF and UV DTF',
        actual: mentionsBoth ? 'Explains differences' : 'Incomplete answer'
      };
    }
  );

  await runTest(
    '7.3',
    'UV DTF',
    'UV DTF line thickness',
    'what is the minimum line thickness for UV DTF?',
    (result) => {
      const response = result.responseText || '';
      const hasThickness = /0\.5|0\.5mm|1mm|half.*mm/i.test(response);
      return {
        pass: hasThickness,
        expected: 'Minimum line thickness (0.5-1mm)',
        actual: hasThickness ? 'Has thickness' : 'No thickness'
      };
    }
  );
}

/**
 * Category 8: Response Quality
 */
async function testCategory8() {
  console.log(`\n${colors.cyan}${colors.bright}Category 8: Response Quality${colors.reset}`);
  
  await runTest(
    '8.1',
    'Quality',
    'Conciseness',
    'what is the DPI at 28.5 cm wide?',
    (result) => {
      const response = result.responseText || '';
      const wordCount = response.split(/\s+/).length;
      const isConcise = wordCount < 100; // Should be brief for simple calculation
      return {
        pass: isConcise,
        expected: 'Concise response (<100 words)',
        actual: `${wordCount} words`
      };
    }
  );

  await runTest(
    '8.2',
    'Quality',
    'Formatting',
    'what size can I print at 300 DPI?',
    (result) => {
      const response = result.responseText || '';
      const hasFormatting = /\*\*|\d+\.\d+|cm|inch/i.test(response);
      return {
        pass: hasFormatting,
        expected: 'Well-formatted with numbers and units',
        actual: hasFormatting ? 'Has formatting' : 'Plain text'
      };
    }
  );

  await runTest(
    '8.3',
    'Quality',
    'Accuracy',
    'what is the DPI at 28.5 cm wide?',
    (result) => {
      const response = result.responseText || '';
      // Should be ~251 DPI (2811 pixels / 28.5 cm * 2.54)
      const hasDPI = /25[01]\s*DPI/i.test(response);
      return {
        pass: hasDPI,
        expected: '251 DPI (±1)',
        actual: hasDPI ? 'Accurate' : 'Inaccurate'
      };
    }
  );

  await runTest(
    '8.4',
    'Quality',
    'Personality',
    'hello',
    (result) => {
      const response = (result.responseText || '').toLowerCase();
      const isFriendly = response.includes('!') || response.includes('happy') || response.includes('glad');
      const isProfessional = !response.includes('lol') && !response.includes('haha');
      return {
        pass: isFriendly && isProfessional,
        expected: 'Friendly but professional',
        actual: isFriendly ? 'Friendly' : 'Cold'
      };
    }
  );
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log(`${colors.bright}${colors.blue}`);
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║     McCarthy Artwork Agent - Automated Test Suite             ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);
  console.log(`Worker URL: ${colors.cyan}${WORKER_URL}${colors.reset}`);
  console.log(`Agent ID: ${colors.cyan}${AGENT_ID}${colors.reset}`);
  console.log(`Test Artwork: ${colors.cyan}${TEST_ARTWORK.width}x${TEST_ARTWORK.height} @ ${TEST_ARTWORK.dpi} DPI${colors.reset}`);
  
  if (categoryFilter) {
    console.log(`${colors.yellow}Running only Category ${categoryFilter}${colors.reset}`);
  }

  const startTime = Date.now();

  try {
    // Run test categories
    if (!categoryFilter || categoryFilter === '1') await testCategory1();
    if (!categoryFilter || categoryFilter === '2') await testCategory2();
    if (!categoryFilter || categoryFilter === '3') await testCategory3();
    if (!categoryFilter || categoryFilter === '4') await testCategory4();
    if (!categoryFilter || categoryFilter === '5') await testCategory5();
    if (!categoryFilter || categoryFilter === '6') await testCategory6();
    if (!categoryFilter || categoryFilter === '7') await testCategory7();
    if (!categoryFilter || categoryFilter === '8') await testCategory8();

  } catch (error) {
    console.error(`\n${colors.red}Fatal error during testing:${colors.reset}`, error);
    process.exit(1);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Print summary
  console.log(`\n${colors.bright}${colors.blue}${'═'.repeat(64)}${colors.reset}`);
  console.log(`${colors.bright}Test Summary${colors.reset}`);
  console.log(`${colors.blue}${'═'.repeat(64)}${colors.reset}`);
  console.log(`Total Tests:   ${totalTests}`);
  console.log(`${colors.green}Passed:        ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed:        ${failedTests}${colors.reset}`);
  console.log(`${colors.yellow}Skipped:       ${skippedTests}${colors.reset}`);
  
  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
  console.log(`Pass Rate:     ${passRate >= 90 ? colors.green : passRate >= 75 ? colors.yellow : colors.red}${passRate}%${colors.reset}`);
  console.log(`Duration:      ${duration}s`);

  // Print failed tests details
  if (failedTests > 0) {
    console.log(`\n${colors.red}${colors.bright}Failed Tests:${colors.reset}`);
    failedTestDetails.forEach(test => {
      console.log(`\n${colors.red}✗ ${test.testId}: ${test.description}${colors.reset}`);
      console.log(`  Message: "${test.message}"`);
      if (test.error) {
        console.log(`  ${colors.red}Error: ${test.error}${colors.reset}`);
      } else {
        console.log(`  ${colors.red}Expected: ${test.expected}${colors.reset}`);
        console.log(`  ${colors.red}Got: ${test.actual}${colors.reset}`);
        if (verbose && test.response) {
          console.log(`  ${colors.gray}Response: ${test.response.substring(0, 200)}...${colors.reset}`);
        }
      }
    });
  }

  console.log(`\n${colors.blue}${'═'.repeat(64)}${colors.reset}`);

  // Production readiness assessment
  console.log(`\n${colors.bright}Production Readiness Assessment:${colors.reset}`);
  
  if (passRate >= 95) {
    console.log(`${colors.green}✓ EXCELLENT - Production ready!${colors.reset}`);
    process.exit(0);
  } else if (passRate >= 85) {
    console.log(`${colors.green}✓ GOOD - Minor issues only${colors.reset}`);
    process.exit(0);
  } else if (passRate >= 75) {
    console.log(`${colors.yellow}⚠ FAIR - Some issues need fixing${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`${colors.red}✗ NOT ACCEPTABLE - Major fixes required${colors.reset}`);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error(`\n${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});

