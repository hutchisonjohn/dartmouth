/**
 * Vector RAG Testing Script
 * 
 * Tests the Vector Embeddings RAG system with questions from all 9 knowledge documents.
 * Each question has an expected answer that should be found in the RAG results.
 * 
 * Run with: npx ts-node scripts/test-vector-rag.ts
 */

// Test cases organized by document
const TEST_CASES = [
  // ============================================================
  // DTF TRANSFERS - Direct to Film Technology
  // ============================================================
  {
    category: 'DTF Transfers',
    question: 'What temperature should I use for DTF transfers?',
    expectedKeywords: ['150', '160', '°C', 'temperature'],
    expectedAnswer: '150-160°C (302-320°F)',
  },
  {
    category: 'DTF Transfers',
    question: 'How long should I press DTF transfers?',
    expectedKeywords: ['8', '12', 'seconds', 'press'],
    expectedAnswer: '8-12 seconds',
  },
  {
    category: 'DTF Transfers',
    question: 'Should I hot peel or cold peel DTF transfers?',
    expectedKeywords: ['hot', 'peel', '2', '10', 'seconds'],
    expectedAnswer: 'Hot peel (peel within 2-10 seconds)',
  },
  {
    category: 'DTF Transfers',
    question: 'What fabrics work with DTF transfers?',
    expectedKeywords: ['cotton', 'polyester', 'blend', 'fabric'],
    expectedAnswer: '100% cotton, cotton/poly blends',
  },
  {
    category: 'DTF Transfers',
    question: 'How many washes do DTF transfers last?',
    expectedKeywords: ['52', 'wash', 'last'],
    expectedAnswer: '52+ washes',
  },
  {
    category: 'DTF Transfers',
    question: 'How should I store DTF transfers before use?',
    expectedKeywords: ['cool', 'dry', 'store', 'flat'],
    expectedAnswer: 'Cool, dry place, away from direct sunlight',
  },

  // ============================================================
  // UV DTF TRANSFERS - UV Direct to Film Technology
  // ============================================================
  {
    category: 'UV DTF Transfers',
    question: 'Do UV DTF transfers need a heat press?',
    expectedKeywords: ['no', 'heat', 'peel', 'stick'],
    expectedAnswer: 'No heat press required - peel and stick',
  },
  {
    category: 'UV DTF Transfers',
    question: 'What surfaces work with UV DTF transfers?',
    expectedKeywords: ['glass', 'metal', 'plastic', 'wood', 'ceramic'],
    expectedAnswer: 'Glass, metal, plastic, wood, ceramic, leather',
  },
  {
    category: 'UV DTF Transfers',
    question: 'Are UV DTF transfers waterproof?',
    expectedKeywords: ['waterproof', 'water', 'resistant'],
    expectedAnswer: 'Yes, waterproof and scratch-resistant',
  },
  {
    category: 'UV DTF Transfers',
    question: 'Can I put UV DTF transfers in the dishwasher?',
    expectedKeywords: ['dishwasher', 'top', 'rack', 'hand', 'wash'],
    expectedAnswer: 'Top rack only, gentle cycle - hand wash recommended',
  },
  {
    category: 'UV DTF Transfers',
    question: 'How long do UV DTF transfers last outdoors?',
    expectedKeywords: ['2', '3', 'year', 'outdoor'],
    expectedAnswer: '2-3+ years outdoors, 5+ years indoors',
  },

  // ============================================================
  // SHIPPING AND DELIVERY
  // ============================================================
  {
    category: 'Shipping',
    question: 'How long does it take to dispatch orders?',
    expectedKeywords: ['24', 'hour', 'dispatch', 'business', 'day'],
    expectedAnswer: '24 hours (1 business day) from artwork approval',
  },
  {
    category: 'Shipping',
    question: 'Do you provide tracking numbers?',
    expectedKeywords: ['tracking', 'number', 'provided'],
    expectedAnswer: 'Yes, tracking number provided',
  },
  {
    category: 'Shipping',
    question: 'Can I get a rush order?',
    expectedKeywords: ['rush', 'order', 'particular', 'date'],
    expectedAnswer: 'Yes, let us know if you need it by a particular date',
  },

  // ============================================================
  // RETURNS AND REFUNDS
  // ============================================================
  {
    category: 'Returns',
    question: 'Can I return my order if I change my mind?',
    expectedKeywords: ['no', 'refund', 'change', 'mind', 'custom'],
    expectedAnswer: 'No refunds for change of mind (custom products)',
  },
  {
    category: 'Returns',
    question: 'How long do I have to report a faulty product?',
    expectedKeywords: ['7', 'day', 'faulty', 'contact'],
    expectedAnswer: '7 days to report faulty products',
  },
  {
    category: 'Returns',
    question: 'What happens if my product is faulty?',
    expectedKeywords: ['reprint', 'refund', 'store', 'credit'],
    expectedAnswer: 'Reprint, store credit, or refund where appropriate',
  },
  {
    category: 'Returns',
    question: 'Can I cancel my order?',
    expectedKeywords: ['cancel', 'before', 'work', 'start', 'fee'],
    expectedAnswer: 'Yes if work hasn\'t started, administration fee may apply after',
  },

  // ============================================================
  // TERMS AND CONDITIONS
  // ============================================================
  {
    category: 'Terms',
    question: 'Can you print fluorescent or neon colors?',
    expectedKeywords: ['no', 'fluorescent', 'neon', 'metallic', 'CMYK'],
    expectedAnswer: 'No - CMYK only, no fluorescent, neon, or metallic',
  },
  {
    category: 'Terms',
    question: 'What are the sizing tolerances for prints?',
    expectedKeywords: ['1cm', '2.5cm', 'tolerance', 'dimension'],
    expectedAnswer: 'Print dimensions: ±1cm, Print placement: ±2.5cm',
  },
  {
    category: 'Terms',
    question: 'Do I need to pay before production starts?',
    expectedKeywords: ['full', 'payment', 'before', 'production'],
    expectedAnswer: 'Yes, full payment required before production',
  },

  // ============================================================
  // ORDERING PROCESS
  // ============================================================
  {
    category: 'Ordering',
    question: 'What file formats do you accept?',
    expectedKeywords: ['PNG', 'PDF', 'AI', 'EPS', 'format'],
    expectedAnswer: 'PNG, PDF, AI, EPS - 300 DPI minimum',
  },
  {
    category: 'Ordering',
    question: 'Do you have minimum order quantities?',
    expectedKeywords: ['no', 'minimum', 'order'],
    expectedAnswer: 'No minimum order on most products',
  },
  {
    category: 'Ordering',
    question: 'Do you offer colour matching?',
    expectedKeywords: ['colour', 'matching', '$30', '30'],
    expectedAnswer: 'Yes, $30 for colour matching service',
  },
  {
    category: 'Ordering',
    question: 'Do you offer bulk pricing?',
    expectedKeywords: ['bulk', 'pricing', 'larger', 'quantities'],
    expectedAnswer: 'Yes, better pricing for larger quantities',
  },

  // ============================================================
  // FAQ
  // ============================================================
  {
    category: 'FAQ',
    question: 'Where is Amazing Transfers located?',
    expectedKeywords: ['Coolum', 'Beach', 'QLD', 'Queensland', 'Australia'],
    expectedAnswer: 'Unit 5, 21 Lomandra Place, Coolum Beach QLD 4573',
  },
  {
    category: 'FAQ',
    question: 'What is the contact email?',
    expectedKeywords: ['info@amazingtransfers.com.au', 'email'],
    expectedAnswer: 'info@amazingtransfers.com.au',
  },
  {
    category: 'FAQ',
    question: 'Do you offer free samples?',
    expectedKeywords: ['free', 'sample', 'yes'],
    expectedAnswer: 'Yes, free samples available',
  },
  {
    category: 'FAQ',
    question: 'What is the difference between DTF and UV DTF?',
    expectedKeywords: ['heat', 'press', 'fabric', 'hard', 'surface', 'peel', 'stick'],
    expectedAnswer: 'DTF needs heat press for fabrics, UV DTF is peel & stick for hard surfaces',
  },

  // ============================================================
  // COMPANY INFORMATION
  // ============================================================
  {
    category: 'Company',
    question: 'What products does Amazing Transfers offer?',
    expectedKeywords: ['DTF', 'UV DTF', 'transfer', 'custom'],
    expectedAnswer: 'DTF Transfers and UV DTF Transfers for custom printing',
  },

  // ============================================================
  // PRIVACY POLICY
  // ============================================================
  {
    category: 'Privacy',
    question: 'What personal information do you collect?',
    expectedKeywords: ['name', 'email', 'address', 'phone', 'order'],
    expectedAnswer: 'Name, email, phone, billing/shipping address, order details',
  },
  {
    category: 'Privacy',
    question: 'Do you sell personal information?',
    expectedKeywords: ['no', 'sell', 'personal', 'information'],
    expectedAnswer: 'No, we do not sell personal information',
  },
  {
    category: 'Privacy',
    question: 'How do I make a privacy complaint?',
    expectedKeywords: ['OAIC', 'contact', 'complaint'],
    expectedAnswer: 'Contact us first, then OAIC if unresolved',
  },
];

// API Configuration
const API_BASE_URL = 'https://dartmouth-os-worker.dartmouth.workers.dev';

interface TestResult {
  question: string;
  category: string;
  passed: boolean;
  expectedKeywords: string[];
  foundKeywords: string[];
  missingKeywords: string[];
  ragContext: string;
  error?: string;
}

async function login(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'john@dtf.com.au',
      password: 'changeme123'
    })
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const data = await response.json() as { token: string };
  return data.token;
}

async function testVectorSearch(token: string, question: string): Promise<{ context: string; sources: string[] }> {
  // We'll test by calling the chat endpoint and checking logs
  // For now, let's create a simple test endpoint
  
  // Actually, let's test by sending a chat message and seeing the response
  const startResponse = await fetch(`${API_BASE_URL}/api/chat/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: 'RAG Tester',
      customer_email: 'test@ragtest.com'
    })
  });
  
  if (!startResponse.ok) {
    throw new Error('Failed to start chat');
  }
  
  const startData = await startResponse.json() as { conversation_id: string };
  const conversationId = startData.conversation_id;
  
  // Send the test question
  const messageResponse = await fetch(`${API_BASE_URL}/api/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversation_id: conversationId,
      message: question
    })
  });
  
  if (!messageResponse.ok) {
    throw new Error('Failed to send message');
  }
  
  const messageData = await messageResponse.json() as { ai_response: string };
  
  return {
    context: messageData.ai_response || '',
    sources: []
  };
}

function checkKeywords(text: string, keywords: string[]): { found: string[]; missing: string[] } {
  const lowerText = text.toLowerCase();
  const found: string[] = [];
  const missing: string[] = [];
  
  for (const keyword of keywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      found.push(keyword);
    } else {
      missing.push(keyword);
    }
  }
  
  return { found, missing };
}

async function runTests(): Promise<void> {
  console.log('='.repeat(80));
  console.log('VECTOR RAG TESTING SCRIPT');
  console.log('Testing semantic search with questions from all 9 knowledge documents');
  console.log('='.repeat(80));
  console.log('');
  
  let token: string;
  try {
    console.log('🔐 Logging in...');
    token = await login();
    console.log('✅ Login successful\n');
  } catch (error) {
    console.error('❌ Login failed:', error);
    return;
  }
  
  const results: TestResult[] = [];
  let passed = 0;
  let failed = 0;
  
  // Group tests by category
  const categories = [...new Set(TEST_CASES.map(t => t.category))];
  
  for (const category of categories) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📁 Testing: ${category}`);
    console.log(`${'─'.repeat(60)}`);
    
    const categoryTests = TEST_CASES.filter(t => t.category === category);
    
    for (const test of categoryTests) {
      process.stdout.write(`  ❓ ${test.question.substring(0, 50)}... `);
      
      try {
        const { context } = await testVectorSearch(token, test.question);
        const { found, missing } = checkKeywords(context, test.expectedKeywords);
        
        // Pass if at least 50% of keywords found
        const passThreshold = Math.ceil(test.expectedKeywords.length * 0.5);
        const testPassed = found.length >= passThreshold;
        
        if (testPassed) {
          console.log(`✅ PASS (${found.length}/${test.expectedKeywords.length} keywords)`);
          passed++;
        } else {
          console.log(`❌ FAIL (${found.length}/${test.expectedKeywords.length} keywords)`);
          console.log(`     Missing: ${missing.join(', ')}`);
          failed++;
        }
        
        results.push({
          question: test.question,
          category: test.category,
          passed: testPassed,
          expectedKeywords: test.expectedKeywords,
          foundKeywords: found,
          missingKeywords: missing,
          ragContext: context.substring(0, 200) + '...'
        });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error: any) {
        console.log(`❌ ERROR: ${error.message}`);
        failed++;
        results.push({
          question: test.question,
          category: test.category,
          passed: false,
          expectedKeywords: test.expectedKeywords,
          foundKeywords: [],
          missingKeywords: test.expectedKeywords,
          ragContext: '',
          error: error.message
        });
      }
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${TEST_CASES.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Pass Rate: ${((passed / TEST_CASES.length) * 100).toFixed(1)}%`);
  console.log('');
  
  // Category breakdown
  console.log('By Category:');
  for (const category of categories) {
    const categoryResults = results.filter(r => r.category === category);
    const categoryPassed = categoryResults.filter(r => r.passed).length;
    const emoji = categoryPassed === categoryResults.length ? '✅' : categoryPassed > 0 ? '🟡' : '❌';
    console.log(`  ${emoji} ${category}: ${categoryPassed}/${categoryResults.length}`);
  }
  
  // Failed tests detail
  const failedTests = results.filter(r => !r.passed);
  if (failedTests.length > 0) {
    console.log('\n' + '─'.repeat(60));
    console.log('FAILED TESTS DETAIL:');
    console.log('─'.repeat(60));
    for (const test of failedTests) {
      console.log(`\n❌ ${test.question}`);
      console.log(`   Category: ${test.category}`);
      console.log(`   Missing keywords: ${test.missingKeywords.join(', ')}`);
      if (test.error) {
        console.log(`   Error: ${test.error}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('Testing complete!');
  console.log('='.repeat(80));
}

// Run tests
runTests().catch(console.error);

