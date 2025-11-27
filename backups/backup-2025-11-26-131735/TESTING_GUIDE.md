# 🧪 McCarthy Artwork Agent - Testing Guide

## 🎯 Quick Start

### Run All 260+ Tests

**Windows:**
```batch
cd packages\mccarthy-artwork
run-comprehensive-tests.bat
```

**Linux/Mac:**
```bash
cd packages/mccarthy-artwork
./run-comprehensive-tests.sh
```

---

## 📊 What Gets Tested

### 1. Intent Detection (50+ tests)
- ✅ Greeting variations
- ✅ Calculation requests
- ✅ Information queries
- ✅ How-to questions
- ✅ Farewells

### 2. DPI Calculations (100+ tests)
- ✅ Single width (CM): 10cm, 15cm, 20cm, 25cm, 28.5cm, 30cm, 35cm, 40cm, 50cm
- ✅ Single width (Inches): 5", 7.5", 10", 12", 15", 18"
- ✅ Full dimensions: 20×18cm, 25×22.5cm, 30×27cm, etc.
- ✅ Standard DPI: 72, 100, 150, 200, 250, 300
- ✅ Natural language: "I need my artwork bigger at least 28.5 wide"
- ✅ Edge cases: very small, very large, decimals

### 3. Personality & Tone (30+ tests)
- ✅ Introduces as "McCarthy"
- ✅ Friendly and welcoming
- ✅ Concise (2-3 sentences)
- ✅ Appropriate emojis (✨ 👌 ⚠️)
- ✅ Professional but approachable
- ✅ Never calculates in LLM

### 4. Context & Memory (20+ tests)
- ✅ Remembers artwork data
- ✅ Maintains conversation history
- ✅ Handles follow-ups
- ✅ Never loses context

### 5. Constraints (15+ tests)
- ✅ Never discusses pricing
- ✅ Never offers discounts
- ✅ Never processes refunds
- ✅ Stays in scope

### 6. Error Handling (20+ tests)
- ✅ Missing artwork data
- ✅ Malformed JSON
- ✅ Empty messages
- ✅ Long messages
- ✅ Special characters

### 7. Response Quality (15+ tests)
- ✅ Accurate calculations
- ✅ Quality ratings
- ✅ CM and inches
- ✅ Consistent results
- ✅ Fast responses (<5s)

### 8. Integration (10+ tests)
- ✅ Complete conversation flows
- ✅ Rapid-fire questions
- ✅ Multi-turn conversations

---

## 🎨 Test Artwork Data

The tests use a mock artwork file:

```
Filename: SUMMERVIBES.png
Dimensions: 2811 × 2539 pixels
DPI: 300
Aspect Ratio: 1.11:1
File Size: 10.37 MB
Format: PNG
```

---

## 📈 Expected DPI Results

| Width (cm) | DPI | Quality |
|------------|-----|---------|
| 10.0       | 713 | ✨ Optimal |
| 20.0       | 357 | ✨ Optimal |
| 23.8       | 300 | ✨ Optimal |
| 28.5       | 251 | ✨ Optimal |
| 30.0       | 238 | 👌 Good    |
| 35.0       | 204 | 👌 Good    |
| 40.0       | 178 | ⚠️ Poor    |
| 47.6       | 150 | ⚠️ Poor    |

---

## 🔧 Setup

### 1. Set API Key

**Windows:**
```batch
set OPENAI_API_KEY=sk-...
```

**Linux/Mac:**
```bash
export OPENAI_API_KEY=sk-...
```

### 2. Install Dependencies

```bash
cd packages/mccarthy-artwork
npm install
```

---

## 🚀 Running Tests

### Run All Tests
```bash
npm test -- comprehensive-agent-test.ts
```

### Run Specific Category
```bash
# Intent detection only
npm test -- comprehensive-agent-test.ts -t "Intent Detection"

# DPI calculations only
npm test -- comprehensive-agent-test.ts -t "DPI Calculations"

# Personality tests only
npm test -- comprehensive-agent-test.ts -t "Personality"
```

### Run Single Test
```bash
npm test -- comprehensive-agent-test.ts -t "should calculate DPI for 28.5 cm wide"
```

### Verbose Output
```bash
npm test -- comprehensive-agent-test.ts --reporter=verbose
```

---

## ✅ Success Criteria

All tests should pass with:
- ✅ 100% intent detection accuracy
- ✅ ±1 DPI calculation tolerance
- ✅ Consistent personality
- ✅ No context loss
- ✅ All constraints enforced
- ✅ Graceful error handling
- ✅ <5s response times

---

## 📊 Example Output

```
🎨 MCCARTHY ARTWORK AGENT - COMPREHENSIVE TEST SUITE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Test Coverage:
  • 50+ Intent Detection tests
  • 100+ DPI Calculation tests
  • 30+ Personality & Tone tests
  • 20+ Context & Memory tests
  • 15+ Constraint Enforcement tests
  • 20+ Error Handling tests
  • 15+ Response Quality tests
  • 10+ Integration tests

🎯 Total: 260+ comprehensive tests
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Starting test suite...

✓ Intent Detection (50 tests) - 2.3s
✓ DPI Calculations (100 tests) - 8.7s
✓ Personality & Tone (30 tests) - 1.9s
✓ Context & Memory (20 tests) - 3.2s
✓ Constraint Enforcement (15 tests) - 1.1s
✓ Error Handling (20 tests) - 2.4s
✓ Response Quality (15 tests) - 1.8s
✓ Integration (10 tests) - 4.6s

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ALL 260 TESTS PASSED!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 McCarthy Artwork Agent is fully functional!
```

---

## 🐛 Troubleshooting

### Tests Failing?

1. **Check API Key**: `echo $OPENAI_API_KEY` (Linux/Mac) or `echo %OPENAI_API_KEY%` (Windows)
2. **Check Dependencies**: `npm install`
3. **Check Network**: Tests require internet for LLM calls
4. **Review Logs**: Look for specific error messages

### Common Issues

**"TypeError: this.saveSession is not a function"**
- Fix: Use `this.stateManager.saveSession()` not `this.saveSession()`

**"Intent detected as 'followup' instead of 'calculation'"**
- Fix: Check `IntentDetector.ts` priority order

**"Handler response generated (0 chars)"**
- Fix: Check handler's `canHandle()` and `handle()` methods

**"Artwork data is NULL"**
- Fix: Check JSON parsing in `McCarthyArtworkAgent.ts`

---

## 📚 Documentation

- [Test Suite README](packages/mccarthy-artwork/tests/README.md)
- [McCarthy Agent Documentation](packages/mccarthy-artwork/README.md)
- [FAM Fixes Documentation](FAM_FIXES_COMPLETED.md)
- [Dartmouth OS Documentation](packages/worker/README.md)

---

## 🎉 Next Steps

Once all tests pass:
1. ✅ Deploy to production
2. ✅ Monitor live performance
3. ✅ Build DOS Infrastructure
4. ✅ Build Sales Agent

---

**Created**: 2025-11-26  
**Version**: 1.0.0


