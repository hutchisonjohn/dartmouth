# 🎨 McCarthy Artwork Agent - Comprehensive Test Suite

## 📊 Overview

This test suite provides **260+ comprehensive tests** covering every aspect of the McCarthy Artwork Agent, including:

- ✅ **Intent Detection** (50+ tests)
- ✅ **DPI Calculations** (100+ tests)
- ✅ **Personality & Tone** (30+ tests)
- ✅ **Context & Memory** (20+ tests)
- ✅ **Constraint Enforcement** (15+ tests)
- ✅ **Error Handling** (20+ tests)
- ✅ **Response Quality** (15+ tests)
- ✅ **Integration** (10+ tests)

---

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18 or higher)
2. **OpenAI API Key** (for LLM tests)

### Setup

```bash
# Set your OpenAI API key
export OPENAI_API_KEY="sk-..."

# Install dependencies (if not already done)
cd packages/mccarthy-artwork
npm install
```

### Run Tests

**Linux/Mac:**
```bash
./run-comprehensive-tests.sh
```

**Windows:**
```batch
run-comprehensive-tests.bat
```

**Or directly with npm:**
```bash
npm test -- comprehensive-agent-test.ts
```

---

## 📋 Test Categories

### 1. Intent Detection Tests (50+)

Tests the agent's ability to correctly identify user intent:

- **Greeting Intent** (15 variations)
  - `hi`, `hello`, `hey`, `good morning`, etc.
  
- **Calculation Intent** (20 variations)
  - `what dpi at 28.5 cm wide?`
  - `if i change my artwork to be 28.5 cm wide, what will the DPI be?`
  - `I need my artwork bigger at least 28.5 wide`
  
- **Information Intent** (12 variations)
  - `what colors are in my artwork?`
  - `does it have transparency?`
  - `what's the file size?`
  
- **How-To Intent** (10 variations)
  - `how do I resize my artwork?`
  - `how to change dpi in photoshop?`
  
- **Farewell Intent** (10 variations)
  - `bye`, `goodbye`, `thanks bye`, etc.

### 2. DPI Calculation Tests (100+)

Tests accuracy and coverage of DPI calculations:

- **Single Width Dimension (CM)** (12 test cases)
  - Tests: 10cm, 15cm, 20cm, 23.8cm, 25cm, 28.5cm, 30cm, 35cm, 40cm, 45cm, 47.6cm, 50cm
  - Validates: DPI accuracy, quality ratings (Optimal/Good/Poor)
  
- **Single Width Dimension (Inches)** (7 test cases)
  - Tests: 5", 7.5", 9.37", 10", 12", 15", 18.74"
  
- **Full Dimensions (Width × Height)** (5 test cases)
  - Tests: 20×18cm, 25×22.5cm, 30×27cm, 35×31.5cm, 40×36cm
  
- **Standard DPI Presets** (6 test cases)
  - Tests: 72, 100, 150, 200, 250, 300 DPI
  
- **Natural Language Variations** (8 test cases)
  - Tests various phrasings of the same question
  
- **Edge Cases** (5 test cases)
  - Very small sizes (high DPI)
  - Very large sizes (low DPI)
  - Decimal sizes
  - Sizes without units
  - Multiple questions in one message

### 3. Personality & Tone Tests (30+)

Tests the agent's personality and communication style:

- ✅ Introduces himself as "McCarthy"
- ✅ Friendly and welcoming tone
- ✅ Concise responses (2-3 sentences for simple questions)
- ✅ Appropriate emoji usage (✨ 👌 ⚠️)
- ✅ Professional but approachable
- ✅ Never calculates DPI in LLM (always uses handler)
- ✅ Provides helpful options

### 4. Context & Memory Tests (20+)

Tests conversation state management:

- ✅ Remembers artwork data across messages
- ✅ Maintains conversation history
- ✅ Handles follow-up questions ("and at 30 cm?")
- ✅ Never loses context mid-conversation
- ✅ References previous interactions appropriately

### 5. Constraint Enforcement Tests (15+)

Tests business rule compliance:

- ✅ Never discusses pricing
- ✅ Never offers discounts
- ✅ Never processes refunds
- ✅ Stays in scope (artwork analysis only)
- ✅ Escalates appropriately to sales/support

### 6. Error Handling Tests (20+)

Tests robustness and edge case handling:

- ✅ Missing artwork data
- ✅ Malformed artwork context
- ✅ Empty messages
- ✅ Very long messages
- ✅ Special characters
- ✅ Multiple questions in one message
- ✅ Invalid dimensions
- ✅ Network errors
- ✅ Timeout scenarios

### 7. Response Quality Tests (15+)

Tests accuracy and consistency:

- ✅ Accurate DPI calculations
- ✅ Quality ratings included
- ✅ Both CM and inches provided
- ✅ Consistent across similar queries
- ✅ Reasonable response times (<5s)
- ✅ Well-formatted output
- ✅ No hallucinations

### 8. Integration Tests (10+)

Tests complete conversation flows:

- ✅ Full conversation flow (greeting → calculation → info → farewell)
- ✅ Rapid-fire questions
- ✅ Complex multi-turn conversations
- ✅ State persistence across sessions
- ✅ Error recovery

---

## 🎯 Test Data

The test suite uses a mock artwork file with the following properties:

```json
{
  "filename": "SUMMERVIBES.png",
  "dimensions": "2811x2539 pixels",
  "dpi": 300,
  "fileSize": "10.37 MB",
  "fileType": "png",
  "quality": "Optimal",
  "hasAlpha": "No",
  "aspectRatio": "1.11:1"
}
```

This allows testing with realistic data without requiring actual file uploads.

---

## 📈 Expected Results

### DPI Calculation Examples

| Width (cm) | Expected DPI | Quality |
|------------|--------------|---------|
| 10.0       | 713          | Optimal |
| 15.0       | 476          | Optimal |
| 20.0       | 357          | Optimal |
| 23.8       | 300          | Optimal |
| 25.0       | 285          | Optimal |
| 28.5       | 251          | Optimal |
| 30.0       | 238          | Good    |
| 35.0       | 204          | Good    |
| 40.0       | 178          | Poor    |
| 45.0       | 158          | Poor    |
| 47.6       | 150          | Poor    |
| 50.0       | 143          | Poor    |

### Quality Thresholds

- **Optimal** (✨): DPI ≥ 250
- **Good** (👌): 200 ≤ DPI < 250
- **Poor** (⚠️): DPI < 200

---

## 🔧 Customization

### Adding Your Own Artwork

To test with your own artwork file, update the `MOCK_ARTWORK_DATA` constant in `comprehensive-agent-test.ts`:

```typescript
const MOCK_ARTWORK_DATA = {
  filename: "your-artwork.png",
  dimensions: "3000x2000 pixels",
  pixels: { w: 3000, h: 2000 },
  dpi: 300,
  // ... other properties
};
```

### Adding New Test Cases

Add new test cases to any category:

```typescript
describe('Your Test Category', () => {
  it('should do something specific', async () => {
    const response = await agent.processMessage(
      `your test message\n${formatArtworkContext(MOCK_ARTWORK_DATA)}`,
      sessionId
    );
    
    expect(response.content).toContain('expected text');
  });
});
```

### Running Specific Tests

```bash
# Run only intent detection tests
npm test -- comprehensive-agent-test.ts -t "Intent Detection"

# Run only DPI calculation tests
npm test -- comprehensive-agent-test.ts -t "DPI Calculations"

# Run only a specific test
npm test -- comprehensive-agent-test.ts -t "should calculate DPI for 28.5 cm wide"
```

---

## 📊 Test Output

The test suite provides detailed output:

```
🎨 COMPREHENSIVE MCCARTHY ARTWORK AGENT TEST SUITE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Intent Detection
  ✅ Greeting Intent
    ✓ should detect greeting: "hi"
    ✓ should detect greeting: "hello"
    ✓ should detect greeting: "hey"
    ...
  ✅ Calculation Intent
    ✓ should detect calculation: "what dpi at 28.5 cm wide?"
    ✓ should detect calculation: "if i change my artwork to be 28.5 cm wide..."
    ...

✅ DPI Calculations
  ✅ Single Width Dimension (CM)
    ✓ should calculate DPI for 10 cm wide (expected: 713 DPI, Optimal)
    ✓ should calculate DPI for 28.5 cm wide (expected: 251 DPI, Optimal)
    ...

... (260+ tests)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ALL TESTS PASSED!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 McCarthy Artwork Agent is fully functional!
```

---

## 🐛 Troubleshooting

### Tests Failing?

1. **Check API Key**: Ensure `OPENAI_API_KEY` is set correctly
2. **Check Dependencies**: Run `npm install` in the package directory
3. **Check Network**: Some tests require internet access for LLM calls
4. **Check Logs**: Review test output for specific error messages

### Common Issues

**Issue**: `TypeError: this.saveSession is not a function`
- **Fix**: Ensure you're using `this.stateManager.saveSession()` not `this.saveSession()`

**Issue**: `Intent detected as 'followup' instead of 'calculation'`
- **Fix**: Check intent detection priority in `IntentDetector.ts`

**Issue**: `Handler response generated (0 chars)`
- **Fix**: Check handler's `canHandle()` and `handle()` methods

---

## 📚 Additional Resources

- [McCarthy Artwork Agent Documentation](../README.md)
- [Dartmouth OS Documentation](../../worker/README.md)
- [FAM Fixes Documentation](../../../FAM_FIXES_COMPLETED.md)
- [Testing Best Practices](../../../docs/testing-guide.md)

---

## 🎉 Success Criteria

All 260+ tests should pass with:
- ✅ 100% intent detection accuracy
- ✅ ±1 DPI calculation tolerance
- ✅ Consistent personality and tone
- ✅ No context loss
- ✅ All constraints enforced
- ✅ Graceful error handling
- ✅ <5s response times

---

**Created**: 2025-11-26  
**Last Updated**: 2025-11-26  
**Version**: 1.0.0  
**Maintainer**: Dartmouth OS Team

