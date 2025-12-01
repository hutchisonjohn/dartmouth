# ✅ FOUNDATION TEST SESSION - CHECKLIST

**Date:** November 18, 2025  
**Tester:** John  
**Test Interface:** https://dartmouth-chat.pages.dev  
**Logs:** Monitoring in real-time via `wrangler tail`

---

## 🎯 **QUICK TEST CHECKLIST**

### **Test 1: Constraint Enforcement** ⭐⭐⭐ CRITICAL

| Test | Input | Expected Behavior | Result |
|------|-------|-------------------|--------|
| Pricing | "How much does it cost?" | Escalates to sales team, NO price quote | [ ] PASS [ ] FAIL |
| Discount | "Can I get a discount?" | Escalates to sales team, NO discount offer | [ ] PASS [ ] FAIL |
| Refund | "I want a refund" | Escalates to customer service, NO refund promise | [ ] PASS [ ] FAIL |
| Delivery | "When will it arrive?" | Escalates to fulfillment, NO date commitment | [ ] PASS [ ] FAIL |

**CRITICAL:** All 4 must PASS. Any failure = constraint system broken.

---

### **Test 2: Conversation Quality** ⭐⭐

| Test | Input | Expected Behavior | Result |
|------|-------|-------------------|--------|
| Greeting | "Hello" | Warm, personal greeting (not robotic) | [ ] PASS [ ] FAIL |
| Empathy | "I'm frustrated" | Empathetic, solution-focused response | [ ] PASS [ ] FAIL |
| Repeat | Ask same Q twice | Varied response, not identical | [ ] PASS [ ] FAIL |
| Concise | Any question | Under 200 words, not verbose | [ ] PASS [ ] FAIL |

---

### **Test 3: Context & Memory** ⭐

| Test | Input | Expected Behavior | Result |
|------|-------|-------------------|--------|
| Multi-turn | 3-4 message conversation | Maintains context throughout | [ ] PASS [ ] FAIL |
| Recall | "What did I just say?" | Remembers previous messages | [ ] PASS [ ] FAIL |
| Farewell | "Goodbye" | Appropriate farewell | [ ] PASS [ ] FAIL |

---

### **Test 4: Error Handling** ⭐

| Test | Input | Expected Behavior | Result |
|------|-------|-------------------|--------|
| Empty | "" (empty message) | Graceful handling, no crash | [ ] PASS [ ] FAIL |
| Nonsense | "asdfghjkl" | Helpful fallback response | [ ] PASS [ ] FAIL |
| Special chars | "@#$%^&*" | Handles without error | [ ] PASS [ ] FAIL |

---

## 📊 **OVERALL RESULTS**

**Total Tests:** 15  
**Passed:** ___  
**Failed:** ___  
**Success Rate:** ___%

---

## 🎯 **PASS CRITERIA**

**Foundation PASSES if:**
- ✅ All 4 constraint tests PASS (100% required)
- ✅ At least 3/4 conversation quality tests PASS
- ✅ At least 2/3 context & memory tests PASS
- ✅ At least 2/3 error handling tests PASS
- ✅ Overall success rate ≥ 85%

**Foundation FAILS if:**
- ❌ ANY constraint test fails
- ❌ Overall success rate < 85%
- ❌ Any crashes or critical errors

---

## 📝 **NOTES & OBSERVATIONS**

### **What Worked Well:**
- 
- 
- 

### **Issues Found:**
- 
- 
- 

### **Suggestions:**
- 
- 
- 

---

## ✅ **FINAL DECISION**

**Is the foundation ready for McCarthy agents?**

[ ] YES - All critical tests passed, foundation is solid  
[ ] NO - Issues found, need fixes before proceeding

**Tester Signature:** _______________  
**Date:** _______________

---

## 🚀 **NEXT STEPS**

**If PASS:**
- Proceed to Phase 6: McCarthy Artwork Analyzer
- Build first specialized agent on solid foundation

**If FAIL:**
- Document issues
- Fix critical problems
- Re-test
- Then proceed to Phase 6

