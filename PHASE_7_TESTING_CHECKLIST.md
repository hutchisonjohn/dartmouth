# ✅ Phase 7: Comprehensive Testing Checklist

**Date:** November 20, 2024  
**Status:** Ready to Start  
**Estimated Time:** 60 minutes

---

## 🎯 **TESTING OVERVIEW**

Before deploying to production, we need to test:
1. ✅ FAM agent (all core functionality)
2. ✅ Artwork Analyzer agent (calculations, RAG, constraints)
3. ✅ Artwork upload page integration
4. ✅ All API endpoints
5. ✅ Bug fixes (if any found)

---

## 📋 **TEST 1: FAM Agent (Foundational Agent McCarthy)**

### **Setup:**
```bash
# Start local worker
npm run dev

# Open FAM test UI
# http://localhost:8787/test-fam.html
```

### **Test Scenarios (from FAM test plan):**

#### **1.1 - 1.4: Context & Memory (4 tests)**
- [ ] User introduces themselves (name, location, job)
- [ ] Agent remembers user information
- [ ] Agent recalls favorite colors
- [ ] Agent counts messages correctly

**Expected:** Agent maintains context throughout conversation

---

#### **2.1 - 2.3: Greetings & Farewells (3 tests)**
- [ ] Various greetings (hi, hello, hey, morning)
- [ ] Various farewells (bye, goodbye, thanks bye)
- [ ] Agent responds appropriately

**Expected:** Natural greeting/farewell responses

---

#### **3.1 - 3.5: General Knowledge (5 tests)**
- [ ] DPI explanation
- [ ] Printing information
- [ ] General topics (sky, pizza, pasta)
- [ ] Agent handles off-topic gracefully

**Expected:** Helpful, accurate responses

---

#### **4.1 - 4.2: Repetition Handling (2 tests)**
- [ ] User asks same question 3+ times
- [ ] Agent detects repetition and offers help

**Expected:** "I understand you're asking again..." response

---

#### **5.1 - 5.3: Confusion Handling (3 tests)**
- [ ] User says "I don't understand"
- [ ] User says "This is confusing"
- [ ] Agent provides clarification

**Expected:** Empathetic, helpful clarification

---

#### **6.1 - 6.4: Frustration Handling (4 tests)**
- [ ] Mild frustration ("this isn't working")
- [ ] Moderate frustration ("nothing is working")
- [ ] High frustration (profanity)
- [ ] False positives (birthday party conversation)

**Expected:** Appropriate escalation based on frustration level

---

#### **7.1 - 7.3: Constraint Validation (3 tests)**
- [ ] User asks about pricing → Agent deflects
- [ ] User asks about discounts → Agent deflects
- [ ] User asks about refunds → Agent deflects

**Expected:** "Unfortunately I don't have access to..." responses

---

#### **8.1 - 8.2: Sentiment Analysis (2 tests)**
- [ ] Positive sentiment detected
- [ ] Negative sentiment detected

**Expected:** Appropriate emotional responses

---

#### **9.1 - 9.3: Off-Topic Handling (3 tests)**
- [ ] Quantum physics question
- [ ] Design/art question
- [ ] Agent stays helpful but on-brand

**Expected:** Helpful responses, gentle redirects if needed

---

### **FAM Test Summary:**
- **Total Tests:** 40 scenarios
- **Expected Pass Rate:** 95%+
- **Critical Issues:** None expected (already tested in previous phases)

---

## 📋 **TEST 2: Artwork Analyzer Agent**

### **Setup:**
```bash
# Open Artwork Analyzer test UI
# http://localhost:8787/index.html
```

### **Test Scenarios:**

#### **2.1 - 2.6: DPI Calculations (6 tests)**
- [ ] 4000x6000 @ 300 DPI → Shows CM first, then inches
- [ ] 3000x4500 @ 150 DPI → Multiple size options
- [ ] 6000x9000 @ 300 DPI → Large format sizes
- [ ] 800x1200 @ 72 DPI → Low DPI warning
- [ ] Various pixel/DPI combinations
- [ ] Quality ratings shown (EXCELLENT, GOOD, ACCEPTABLE, POOR)

**Expected:** Accurate calculations, CM shown first, quality ratings

---

#### **3.1 - 3.3: DTF/UV DTF Knowledge (3 tests)**
- [ ] "What is DTF printing?" → RAG response
- [ ] "What are UV DTF requirements?" → RAG response
- [ ] "How does semi-transparency affect DTF?" → RAG response

**Expected:** Accurate information from knowledge base

---

#### **4.1 - 4.3: Artwork Guidance (3 tests)**
- [ ] "What DPI is recommended?" → 300 DPI recommendation
- [ ] "What file format should I use?" → Format advice
- [ ] "How do I prepare my artwork?" → Preparation steps

**Expected:** Professional, accurate guidance

---

#### **5.1 - 5.2: Constraint Validation (2 tests)**
- [ ] User asks about pricing → Agent deflects
- [ ] User asks about refunds → Agent escalates

**Expected:** Specific wording: "Unfortunately I don't have access to..."

---

#### **6.1 - 6.2: Context & Memory (2 tests)**
- [ ] User mentions artwork size, asks follow-up
- [ ] Agent remembers previous calculation

**Expected:** Agent maintains context, references previous messages

---

### **Artwork Analyzer Test Summary:**
- **Total Tests:** 16 scenarios
- **Expected Pass Rate:** 95%+
- **Critical:** CM shown first, quality ratings present

---

## 📋 **TEST 3: Artwork Upload Page Integration**

### **Setup:**
```bash
# This requires the artwork upload page to be built/available
# If not built yet, this is a future test
```

### **Test Scenarios:**

#### **Upload Flow:**
- [ ] User uploads artwork file (PNG/JPG)
- [ ] System extracts metadata (dimensions, DPI, file size)
- [ ] Metadata passed to agent in context
- [ ] Agent can reference uploaded artwork in conversation

**Example Conversation:**
```
User: [Uploads 4000x6000 @ 300 DPI image]
User: "What size can I print this?"
Agent: "Based on your uploaded artwork (4000x6000 pixels at 300 DPI)..."
```

**Expected:** Agent has access to uploaded artwork metadata

---

#### **Metadata Available to Agent:**
- [ ] Image dimensions (width x height)
- [ ] DPI/resolution
- [ ] File format (PNG, JPG, etc.)
- [ ] File size
- [ ] Color mode (RGB, CMYK)

**Expected:** All metadata accessible in agent context

---

### **Upload Integration Test Summary:**
- **Total Tests:** 5 scenarios
- **Status:** Depends on upload page availability
- **Critical:** Artwork metadata must be passed to agent

---

## 📋 **TEST 4: Integration Tests (Automated)**

### **Run Integration Tests:**
```bash
# Run full test suite
node tools/scripts/test-dartmouth.js

# Expected output:
# ✅ Root endpoint
# ✅ Health check endpoints
# ✅ Agents list endpoint
# ✅ Chat endpoint (V2)
# ✅ Legacy endpoints (V1)
# ✅ CORS headers
# ✅ Error handling
# 
# Total Tests: 36
# Passed: 36 ✅
# Failed: 0 ❌
# Success Rate: 100%
```

**Expected:** All 36 tests pass

---

### **Run Health Verification:**
```bash
# Run health checks
node tools/scripts/verify-health.js

# Expected output:
# ✅ Overall health check passed
# ✅ FAM health check passed
# ✅ Artwork Analyzer health check passed
# ✅ Agent list check passed
```

**Expected:** All agents healthy

---

## 🐛 **BUG TRACKING**

### **Bugs Found:**

| # | Component | Description | Severity | Status |
|---|-----------|-------------|----------|--------|
| - | - | - | - | - |

**Instructions:**
- Document any bugs found during testing
- Fix critical bugs immediately
- Log minor bugs for future fixes

---

## ✅ **COMPLETION CRITERIA**

Phase 7 is complete when:

- [ ] All FAM tests pass (95%+ pass rate)
- [ ] All Artwork Analyzer tests pass (95%+ pass rate)
- [ ] Integration tests pass (100%)
- [ ] Health checks pass (all agents healthy)
- [ ] Artwork upload integration working (if page available)
- [ ] All critical bugs fixed
- [ ] Documentation updated with any changes

---

## 📊 **TEST RESULTS SUMMARY**

| Test Suite | Total | Passed | Failed | Pass Rate |
|------------|-------|--------|--------|-----------|
| FAM Agent | 40 | - | - | -% |
| Artwork Analyzer | 16 | - | - | -% |
| Upload Integration | 5 | - | - | -% |
| Integration Tests | 36 | - | - | -% |
| Health Checks | 4 | - | - | -% |
| **TOTAL** | **101** | **-** | **-** | **-%** |

---

## 🚀 **NEXT STEPS AFTER TESTING**

Once all tests pass:
1. ✅ Commit all bug fixes
2. ✅ Update documentation
3. ✅ Create backup (Git + push)
4. ✅ Move to Phase 8 (Deploy to Cloudflare)

---

**STATUS: READY TO START TESTING** 🧪

Let's test everything and ensure Dartmouth OS is production-ready!

