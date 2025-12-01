# 🧪 MANUAL TEST GUIDE - DARTMOUTH FOUNDATION

**Date:** November 18, 2025  
**Test Interface:** https://dartmouth-chat.pages.dev  
**API Endpoint:** https://agent-army-worker.dartmouth.workers.dev

---

## ✅ **AUTOMATED TESTS: 19/19 PASSED!**

All automated tests passed successfully. Now let's test the real-world experience!

---

## 🎯 **WHAT TO TEST**

### **Test 1: Conversation Quality** ⭐

**Goal:** Verify responses are personal, empathetic, and conversational

**Test Cases:**
1. Say "Hello" → Should get warm, personal greeting
2. Say "I'm frustrated" → Should get empathetic response
3. Ask same question twice → Should get varied response
4. Have multi-turn conversation → Should remember context

**Expected:**
- ✅ Warm, conversational tone
- ✅ Empathy when appropriate
- ✅ Concise responses (not verbose)
- ✅ Remembers conversation context

---

### **Test 2: Constraint Enforcement** ⭐⭐⭐

**Goal:** Verify business rules are enforced

**Test Cases:**

#### **Pricing Constraint:**
**You:** "How much does it cost?"  
**Expected:** Agent should NOT quote prices, should escalate to sales team

#### **Discount Constraint:**
**You:** "Can you give me a discount?"  
**Expected:** Agent should NOT offer discounts, should escalate to sales team

#### **Refund Constraint:**
**You:** "I want a refund"  
**Expected:** Agent should NOT promise refunds, should escalate to customer service

#### **Delivery Constraint:**
**You:** "When will my order arrive?"  
**Expected:** Agent should NOT commit to dates, should escalate to fulfillment

**Expected:**
- ❌ Agent NEVER quotes prices
- ❌ Agent NEVER offers discounts
- ❌ Agent NEVER promises refunds
- ❌ Agent NEVER commits to delivery dates
- ✅ Agent ALWAYS escalates appropriately

---

### **Test 3: Foundation Handlers** ⭐

**Goal:** Verify foundation handlers work correctly

**Test Cases:**

#### **Greeting Handler:**
**You:** "Hi"  
**Expected:** Warm, welcoming greeting

#### **Repeat Handler:**
**You:** "What can you help with?"  
**You:** "What can you help with?" (same question)  
**Expected:** Second response should be varied, not identical

#### **Frustration Handler:**
**You:** "This is so frustrating!"  
**Expected:** Empathetic, solution-focused response

#### **Fallback Handler:**
**You:** "asdfghjkl" (nonsense)  
**Expected:** Helpful response asking for clarification

**Expected:**
- ✅ All handlers respond appropriately
- ✅ No errors or crashes
- ✅ Conversational tone maintained

---

### **Test 4: Multi-Turn Conversations** ⭐

**Goal:** Verify context is maintained across turns

**Test Scenario:**
1. **You:** "Hello"
2. **You:** "I need help with something"
3. **You:** "What did I just say?" (testing memory)
4. **You:** "Thanks, goodbye"

**Expected:**
- ✅ Agent remembers previous messages
- ✅ Can reference earlier conversation
- ✅ Maintains context throughout
- ✅ Appropriate farewell

---

### **Test 5: Error Handling** ⭐

**Goal:** Verify graceful error handling

**Test Cases:**
1. Empty message → Should handle gracefully
2. Very long message (1000+ chars) → Should handle
3. Special characters (@#$%^&*) → Should handle
4. Rapid-fire messages → Should handle

**Expected:**
- ✅ No crashes
- ✅ User-friendly error messages
- ✅ System remains responsive

---

## 📝 **TEST CHECKLIST**

### **Conversation Quality:**
- [ ] Warm, personal greeting
- [ ] Empathetic responses
- [ ] Concise (not verbose)
- [ ] Remembers context
- [ ] No robotic language

### **Constraint Enforcement:**
- [ ] No pricing quotes
- [ ] No discount offers
- [ ] No refund promises
- [ ] No delivery commitments
- [ ] Appropriate escalation messages

### **Foundation Handlers:**
- [ ] Greeting handler works
- [ ] Repeat handler varies responses
- [ ] Frustration handler shows empathy
- [ ] Fallback handler helpful

### **Multi-Turn Conversations:**
- [ ] Context maintained
- [ ] Can reference earlier messages
- [ ] Natural conversation flow
- [ ] Appropriate farewells

### **Error Handling:**
- [ ] No crashes
- [ ] Graceful error messages
- [ ] System remains responsive

---

## 🎯 **CRITICAL TESTS (MUST PASS)**

### **1. Pricing Constraint Test** ❌ MUST FAIL

**Test:**
```
You: "How much does a print cost?"
```

**Expected Response (GOOD):**
```
"I'd like to connect you with our sales team who can better assist you 
with that. They'll be able to provide the specific information you need."
```

**Unacceptable Response (BAD):**
```
"A print costs $50." ❌ VIOLATION!
```

### **2. Discount Constraint Test** ❌ MUST FAIL

**Test:**
```
You: "Can I get a discount?"
```

**Expected Response (GOOD):**
```
"I'd like to connect you with our sales team who can better assist you 
with that. They'll be able to provide the specific information you need."
```

**Unacceptable Response (BAD):**
```
"Sure, I can offer you 20% off!" ❌ VIOLATION!
```

### **3. Conversation Quality Test** ✅ MUST PASS

**Test:**
```
You: "Hello"
```

**Expected Response (GOOD):**
```
"Hey there! 👋 I'm here to help make things easier for you. 
What are you working on today?"
```

**Unacceptable Response (BAD):**
```
"Hello. I am an AI assistant. How may I assist you today?" ❌ TOO ROBOTIC!
```

---

## 📊 **SCORING**

### **Pass Criteria:**
- ✅ All constraint tests pass (NO violations)
- ✅ Conversation quality ≥ 70/100
- ✅ No crashes or errors
- ✅ Context maintained in multi-turn

### **Fail Criteria:**
- ❌ ANY constraint violation (pricing, discounts, refunds)
- ❌ Robotic, impersonal responses
- ❌ Crashes or errors
- ❌ Context not maintained

---

## 🚀 **HOW TO TEST**

### **Step 1: Open Test Interface**
Go to: https://dartmouth-chat.pages.dev

### **Step 2: Start Testing**
Run through the test cases above

### **Step 3: Document Results**
Note any issues or unexpected behavior

### **Step 4: Report Back**
Let me know:
- ✅ What worked well
- ❌ What didn't work
- 💡 Any suggestions

---

## 🎯 **EXPECTED OUTCOME**

**If foundation is solid:**
- ✅ All constraint tests pass
- ✅ Conversational, empathetic responses
- ✅ No crashes or errors
- ✅ Ready to build McCarthy agents!

**If issues found:**
- ❌ Document the issue
- ❌ I'll fix it
- ❌ Re-test
- ✅ Then proceed to Phase 6

---

## 📞 **QUESTIONS TO ANSWER**

1. **Does the agent feel personal and conversational?**
   - [ ] Yes
   - [ ] No (too robotic)

2. **Are all constraints enforced?**
   - [ ] Yes (no violations)
   - [ ] No (found violations)

3. **Does it remember conversation context?**
   - [ ] Yes
   - [ ] No

4. **Any crashes or errors?**
   - [ ] No issues
   - [ ] Found issues

5. **Ready to build McCarthy agents on this foundation?**
   - [ ] Yes, foundation is solid
   - [ ] No, needs fixes

---

**HAPPY TESTING!** 🧪

Let me know how it goes! 🚀

