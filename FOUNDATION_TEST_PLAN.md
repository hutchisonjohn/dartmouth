# 🧪 DARTMOUTH FOUNDATION - TEST PLAN

**Version:** 1.0  
**Date:** November 18, 2025  
**Status:** Ready to Execute

---

## 🎯 **OBJECTIVE**

Test the Dartmouth Foundation (BaseAgent) thoroughly before building McCarthy agents on top of it.

**Why Test Now:**
- ✅ Foundation is complete (Phases 1-5)
- ✅ All core systems integrated
- ✅ Before adding complexity (McCarthy agents)
- ✅ Ensure solid base for all future agents

---

## 📋 **WHAT TO TEST**

### **1. Conversation Quality System** (THE HEART)
- ✅ ConversationQualityValidator
- ✅ EmpathyInjector
- ✅ PersonalityPrompt
- ✅ Handler personality (Greeting, Fallback, Frustration, Repeat)

### **2. Agent Routing System**
- ✅ AgentRegistry
- ✅ AgentRouter
- ✅ AgentOrchestrator

### **3. Constraint System**
- ✅ ConstraintValidator
- ✅ Global constraints
- ✅ Violation detection
- ✅ Escalation logic

### **4. Core Components**
- ✅ ConversationStateManager
- ✅ IntentDetector
- ✅ ResponseRouter
- ✅ ResponseValidator
- ✅ MemorySystem
- ✅ RAGEngine
- ✅ RepetitionDetector
- ✅ FrustrationHandler

### **5. BaseAgent Integration**
- ✅ Full message processing flow
- ✅ All systems working together
- ✅ Error handling
- ✅ State management

---

## 🧪 **TEST CATEGORIES**

### **Category 1: Unit Tests** (Individual Components)
**Status:** Some exist, need updates

**What to test:**
- Each component in isolation
- Input/output validation
- Edge cases
- Error handling

**Priority:** HIGH

### **Category 2: Integration Tests** (Systems Working Together)
**Status:** Need to create

**What to test:**
- BaseAgent message processing
- Conversation quality + constraints
- Agent routing decisions
- Multi-system interactions

**Priority:** CRITICAL

### **Category 3: Conversation Tests** (Real-World Scenarios)
**Status:** Need to create

**What to test:**
- Greeting conversations
- Repeated questions
- Frustrated users
- Constraint violations
- Multi-turn conversations

**Priority:** CRITICAL

---

## 🎯 **TEST APPROACH**

### **Option 1: Manual Testing (Quick)**
**Time:** 30 minutes  
**Method:** Use deployed test interface

**Steps:**
1. Deploy current BaseAgent
2. Test via https://dartmouth-chat.pages.dev
3. Run through conversation scenarios
4. Document results

**Pros:**
- ✅ Quick to execute
- ✅ Real-world testing
- ✅ Immediate feedback

**Cons:**
- ❌ Not automated
- ❌ Hard to repeat
- ❌ Doesn't test all code paths

### **Option 2: Automated Testing (Thorough)**
**Time:** 2-3 hours  
**Method:** Write comprehensive test suite

**Steps:**
1. Update existing unit tests
2. Create integration tests
3. Create conversation tests
4. Run full test suite
5. Fix any failures

**Pros:**
- ✅ Comprehensive coverage
- ✅ Repeatable
- ✅ Catches edge cases
- ✅ Future-proof

**Cons:**
- ❌ Takes longer
- ❌ Requires test infrastructure

### **Option 3: Hybrid (Recommended)**
**Time:** 1-1.5 hours  
**Method:** Critical automated tests + manual validation

**Steps:**
1. Create critical integration tests (30 min)
2. Test conversation quality (15 min)
3. Test constraint enforcement (15 min)
4. Manual validation via test interface (15 min)
5. Document results (15 min)

**Pros:**
- ✅ Balanced approach
- ✅ Covers critical paths
- ✅ Real-world validation
- ✅ Reasonable time investment

**Cons:**
- ❌ Not 100% coverage

---

## 🧪 **CRITICAL TESTS TO RUN**

### **Test 1: Conversation Quality**

**Test Cases:**
1. ✅ Warm greeting (not robotic)
2. ✅ Empathy injection (detects sentiment)
3. ✅ Concise responses (not verbose)
4. ✅ No hallucinations
5. ✅ Remembers context

**Expected Results:**
- Score ≥ 70/100
- Personal, conversational tone
- Appropriate empathy
- Under 200 words per response

### **Test 2: Constraint Enforcement**

**Test Cases:**
1. ❌ Try to get agent to quote price → Should escalate
2. ❌ Try to get agent to offer discount → Should escalate
3. ❌ Try to get agent to promise refund → Should escalate
4. ❌ Try to get agent to commit to delivery date → Should escalate
5. ✅ Normal questions → Should work fine

**Expected Results:**
- All violations caught
- Appropriate escalation messages
- No forbidden phrases in responses

### **Test 3: Agent Routing**

**Test Cases:**
1. ✅ Foundation-only intent (greeting) → Foundation handlers
2. ✅ No McCarthy agents registered → Foundation fallback
3. ✅ Agent registry statistics → 0 agents

**Expected Results:**
- Routing decisions correct
- Foundation handlers work
- No errors when no McCarthy agents

### **Test 4: Multi-Turn Conversations**

**Test Cases:**
1. ✅ Greeting → Question → Follow-up → Farewell
2. ✅ Repeated question → Varied response
3. ✅ Frustrated user → Empathetic response
4. ✅ Context remembered across turns

**Expected Results:**
- Conversation flows naturally
- Context maintained
- Appropriate responses

### **Test 5: Error Handling**

**Test Cases:**
1. ✅ Empty message
2. ✅ Very long message (>1000 chars)
3. ✅ Special characters
4. ✅ Invalid session ID
5. ✅ Database errors

**Expected Results:**
- Graceful error handling
- User-friendly error messages
- No crashes

---

## 📝 **TEST EXECUTION PLAN**

### **Phase 1: Setup** (10 min)
- [ ] Ensure latest code deployed
- [ ] Test interface accessible
- [ ] Logging enabled

### **Phase 2: Automated Tests** (30 min)
- [ ] Create BaseAgent integration test
- [ ] Create conversation quality test
- [ ] Create constraint enforcement test
- [ ] Run test suite
- [ ] Fix any failures

### **Phase 3: Manual Validation** (30 min)
- [ ] Test conversation quality
- [ ] Test constraint violations
- [ ] Test multi-turn conversations
- [ ] Test error handling
- [ ] Document results

### **Phase 4: Results & Fixes** (20 min)
- [ ] Compile test results
- [ ] Fix critical issues
- [ ] Re-test failures
- [ ] Update documentation

---

## ✅ **SUCCESS CRITERIA**

**Foundation is ready for McCarthy agents when:**
- ✅ All critical tests pass
- ✅ Conversation quality ≥ 70/100
- ✅ All constraints enforced
- ✅ No critical bugs
- ✅ Error handling works
- ✅ Multi-turn conversations flow naturally

---

## 🚀 **RECOMMENDATION**

**I recommend Option 3: Hybrid Approach**

**Rationale:**
1. We need confidence in the foundation
2. We don't have time for 100% coverage
3. Critical paths must be tested
4. Manual validation catches UX issues

**Next Steps:**
1. Create critical integration tests (focus on new systems)
2. Test conversation quality + constraints
3. Manual validation via test interface
4. Fix any issues found
5. **THEN** proceed to Phase 6 (McCarthy Artwork)

---

## 📊 **ESTIMATED TIME**

```
Setup:              10 min
Automated Tests:    30 min
Manual Validation:  30 min
Results & Fixes:    20 min
─────────────────────────
Total:              90 min (1.5 hours)
```

---

## 🎯 **YOUR CALL**

**What would you like to do?**

**Option A:** Hybrid testing (recommended, 1.5 hours)
**Option B:** Quick manual testing (30 min, less thorough)
**Option C:** Full automated suite (3 hours, most thorough)
**Option D:** Skip testing, proceed to Phase 6 (risky)

**I recommend Option A** - it gives us confidence without taking too long.

What do you think? 🤔

