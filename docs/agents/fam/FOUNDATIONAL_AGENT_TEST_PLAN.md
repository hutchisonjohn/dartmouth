# 🧪 FOUNDATIONAL AGENT - COMPREHENSIVE TEST PLAN

**Version:** 1.0  
**Date:** November 19, 2025  
**Purpose:** Verify ALL foundational agent capabilities before building specialized agents  
**Status:** READY FOR TESTING

---

## 📋 **TEST OVERVIEW**

This test plan validates the 10 core components of the Dartmouth Foundation (BaseAgent):

1. ✅ Conversation State Manager
2. ✅ Intent Detector
3. ✅ Response Router
4. ✅ Response Validator
5. ✅ Memory System (4 levels)
6. ✅ RAG Engine
7. ✅ Repetition Detector
8. ✅ Frustration Handler
9. ✅ Conversation Quality Validator
10. ✅ Empathy Injector

---

## 🎯 **TEST CATEGORIES**

### **Category 1: Conversation Memory & Context Tracking**
### **Category 2: Intent Detection & Routing**
### **Category 3: Memory System (Short-term, Long-term, Semantic, Episodic)**
### **Category 4: Repetition Detection**
### **Category 5: Frustration Handling**
### **Category 6: Conversation Quality**
### **Category 7: Empathy & Personality**
### **Category 8: Constraint Enforcement**
### **Category 9: LLM Fallback & Context Awareness**

**Note:** RAG Knowledge Retrieval is NOT tested here - it's agent-specific and tested in specialized agent test plans (e.g., McCarthy Artwork Analyzer, McCarthy Lead Scraper, etc.)

---

## 📝 **DETAILED TEST SCENARIOS**

---

## **CATEGORY 1: CONVERSATION MEMORY & CONTEXT TRACKING**

### **Test 1.1: Session Creation and Persistence**
**Objective:** Verify sessions are created and persisted across requests

**Steps:**
1. Send: "Hello"
2. Note the sessionId from response
3. Send: "What did I just say?" with the same sessionId
4. Verify agent remembers "Hello"

**Expected Result:**
- ✅ SessionId is returned
- ✅ Agent remembers previous message
- ✅ Response references "Hello"

**Pass Criteria:** Agent says something like "You said hello" or "You just greeted me"

---

### **Test 1.2: Multi-Turn Conversation Context**
**Objective:** Verify agent maintains context over multiple turns

**Steps:**
1. Send: "My name is John"
2. Send: "I live in New York"
3. Send: "I work as a designer"
4. Send: "What do you know about me?"

**Expected Result:**
- ✅ Agent recalls: name (John), location (New York), occupation (designer)
- ✅ Response includes all three facts

**Pass Criteria:** Response mentions "John", "New York", and "designer"

---

### **Test 1.3: Message History Tracking**
**Objective:** Verify all messages are stored in conversation state

**Steps:**
1. Send 5 different messages in same session
2. Send: "How many messages have we exchanged?"

**Expected Result:**
- ✅ Agent knows the conversation length
- ✅ Response indicates multiple messages

**Pass Criteria:** Agent acknowledges multiple messages (doesn't have to be exact count)

---

### **Test 1.4: Topic Tracking**
**Objective:** Verify agent tracks topics discussed

**Steps:**
1. Send: "Tell me about dogs"
2. Send: "What about cats?"
3. Send: "What have we discussed so far?"

**Expected Result:**
- ✅ Agent recalls topics: dogs, cats
- ✅ Response summarizes conversation topics

**Pass Criteria:** Response mentions both topics discussed

---

### **Test 1.5: Follow-up Question Handling**
**Objective:** Verify agent understands follow-up questions with pronouns

**Steps:**
1. Send: "I have a blue car"
2. Send: "What color is it?"

**Expected Result:**
- ✅ Agent understands "it" = car
- ✅ Response says "blue"

**Pass Criteria:** Response includes "blue"

---

## **CATEGORY 2: INTENT DETECTION & ROUTING**

### **Test 2.1: Greeting Intent**
**Objective:** Verify greeting detection and routing

**Test Cases:**
- "Hi"
- "Hello"
- "Hey there"
- "Good morning"

**Expected Result:**
- ✅ Intent: greeting
- ✅ Handler: GreetingHandler
- ✅ Warm, friendly response

**Pass Criteria:** Response is a greeting (not generic)

---

### **Test 2.2: Farewell Intent**
**Objective:** Verify farewell detection

**Test Cases:**
- "Goodbye"
- "Thanks, bye"
- "See you later"

**Expected Result:**
- ✅ Intent: farewell
- ✅ Polite closing response

**Pass Criteria:** Response acknowledges goodbye

---

### **Test 2.3: Information Request Intent**
**Objective:** Verify information requests are detected

**Test Cases:**
- "What is artificial intelligence?"
- "Tell me about the weather"
- "How does gravity work?"

**Expected Result:**
- ✅ Intent: information
- ✅ LLM provides answer

**Pass Criteria:** Response attempts to answer the question

---

### **Test 2.4: Unknown Intent Handling**
**Objective:** Verify unknown intents route to LLM fallback

**Test Cases:**
- "The sky is blue"
- "Random statement here"

**Expected Result:**
- ✅ Intent: unknown
- ✅ Handler: LLMFallback
- ✅ Conversational response

**Pass Criteria:** Agent responds conversationally (doesn't error)

---

### **Test 2.5: Follow-up Intent Detection**
**Objective:** Verify follow-ups are detected and routed to LLM

**Steps:**
1. Send: "I like pizza"
2. Send: "What about pasta?"

**Expected Result:**
- ✅ Intent: followup → information
- ✅ Handler: LLMFallback
- ✅ Contextual response

**Pass Criteria:** Agent understands "what about" is a follow-up

---

## **CATEGORY 3: MEMORY SYSTEM**

### **Test 3.1: Short-Term Memory (Current Session)**
**Objective:** Verify short-term memory within session

**Steps:**
1. Send: "Remember this: my favorite color is red"
2. Send: "What's my favorite color?"

**Expected Result:**
- ✅ Agent recalls "red"
- ✅ Memory persists in current session

**Pass Criteria:** Response includes "red"

---

### **Test 3.2: Long-Term Memory (Across Sessions)**
**Objective:** Verify memory persists across sessions

**Steps:**
1. Session 1: Send "My name is Sarah"
2. Note sessionId
3. Wait 5 minutes
4. Session 2: Send "What's my name?" with SAME sessionId

**Expected Result:**
- ✅ Agent recalls "Sarah" from previous session
- ✅ Memory persists after time gap

**Pass Criteria:** Response includes "Sarah"

---

### **Test 3.3: Preference Learning**
**Objective:** Verify agent learns user preferences

**Steps:**
1. Send: "I prefer metric measurements"
2. Send: "What units do I prefer?"

**Expected Result:**
- ✅ Agent recalls preference
- ✅ Response mentions "metric"

**Pass Criteria:** Response includes "metric"

---

### **Test 3.4: Memory Recall in Context**
**Objective:** Verify agent uses memory in responses

**Steps:**
1. Send: "I'm working on a design project"
2. Send: "Can you help me?"

**Expected Result:**
- ✅ Agent references "design project" in response
- ✅ Contextual help offered

**Pass Criteria:** Response mentions "design project"

---

## **CATEGORY 4: REPETITION DETECTION**

### **Test 4.1: Question Repetition**
**Objective:** Verify agent detects repeated questions

**Steps:**
1. Send: "What is your name?"
2. Wait for response
3. Send: "What is your name?" (same question)

**Expected Result:**
- ✅ Repetition detected
- ✅ Agent acknowledges repetition
- ✅ Response varies or clarifies

**Pass Criteria:** Second response is different or acknowledges repetition

---

### **Test 4.2: Multiple Repetitions**
**Objective:** Verify agent handles multiple repetitions

**Steps:**
1. Send: "What is your name?" (1st time)
2. Send: "What is your name?" (2nd time)
3. Send: "What is your name?" (3rd time)

**Expected Result:**
- ✅ Agent detects pattern
- ✅ Offers to clarify or escalate
- ✅ Doesn't give identical response 3 times

**Pass Criteria:** Third response offers help or clarification

---

## **CATEGORY 5: FRUSTRATION HANDLING**

### **Test 5.1: Mild Frustration Detection**
**Objective:** Verify mild frustration is detected but doesn't override intent

**Test Cases:**
- "This is confusing"
- "I don't understand"

**Expected Result:**
- ✅ Frustration noted
- ✅ Intent NOT overridden to frustration
- ✅ Empathetic response

**Pass Criteria:** Agent responds helpfully (not with frustration handler)

---

### **Test 5.2: Moderate Frustration**
**Objective:** Verify moderate frustration triggers empathetic response

**Test Cases:**
- "This isn't working"
- "Nothing is working"
- "This is terrible"

**Expected Result:**
- ✅ Frustration detected: moderate
- ✅ Intent overridden to frustration
- ✅ Empathetic, helpful response

**Pass Criteria:** Response acknowledges frustration and offers help

---

### **Test 5.3: High Frustration / Profanity**
**Objective:** Verify high frustration triggers escalation

**Test Cases:**
- "This is fucking useless"
- "What the hell is going on?"

**Expected Result:**
- ✅ Frustration detected: high/critical
- ✅ Empathetic response
- ✅ Offer to escalate

**Pass Criteria:** Response is calm, empathetic, offers escalation

---

### **Test 5.4: False Positive Prevention**
**Objective:** Verify normal questions aren't flagged as frustration

**Test Cases:**
- "I have an issue I need help with"
- "Can you help me with a problem?"
- "What's wrong with this approach?"

**Expected Result:**
- ✅ NOT detected as frustration
- ✅ Routed to appropriate handler
- ✅ Helpful response

**Pass Criteria:** Agent doesn't say "What's not working?" or frustration response

---

## **CATEGORY 6: CONVERSATION QUALITY**

### **Test 6.1: No Hallucination**
**Objective:** Verify agent doesn't make up information

**Test Cases:**
- "What's the price?"
- "How much does it cost?"

**Expected Result:**
- ✅ Agent doesn't invent prices
- ✅ Honest response (doesn't know or redirects)

**Pass Criteria:** No made-up prices or information

---

### **Test 6.2: Concise Responses**
**Objective:** Verify responses aren't overly verbose

**Test Cases:**
- "Hi"
- "Thanks"

**Expected Result:**
- ✅ Response is 1-3 sentences
- ✅ Not a wall of text

**Pass Criteria:** Response is concise (< 100 words)

---

### **Test 6.3: Relevant Responses**
**Objective:** Verify responses are relevant to question

**Test Cases:**
- "What is machine learning?"
- "How do I make coffee?"

**Expected Result:**
- ✅ Response directly addresses question
- ✅ No off-topic information

**Pass Criteria:** Response is on-topic

---

## **CATEGORY 7: EMPATHY & PERSONALITY**

### **Test 7.1: Empathetic Responses**
**Objective:** Verify agent shows empathy

**Test Cases:**
- "I'm frustrated"
- "I'm confused"
- "I'm having trouble"

**Expected Result:**
- ✅ Response acknowledges feeling
- ✅ Empathetic language used
- ✅ Offers help

**Pass Criteria:** Response includes empathy ("I understand", "Let's figure this out")

---

### **Test 7.2: Personality Consistency**
**Objective:** Verify agent maintains consistent personality

**Steps:**
1. Send 5 different messages
2. Observe tone and style

**Expected Result:**
- ✅ Consistent friendly tone
- ✅ Professional but approachable
- ✅ Not robotic

**Pass Criteria:** Responses feel conversational, not robotic

---

### **Test 7.3: Appropriate Emoji Usage**
**Objective:** Verify emojis are used sparingly and appropriately

**Test Cases:**
- Various questions

**Expected Result:**
- ✅ Emojis used occasionally (not every message)
- ✅ Relevant emojis (not random)

**Pass Criteria:** Emojis enhance, don't distract

---

## **CATEGORY 8: CONSTRAINT ENFORCEMENT**

### **Test 8.1: No Pricing Information**
**Objective:** Verify agent doesn't provide pricing

**Test Cases:**
- "How much does it cost?"
- "What's the price?"
- "How much do you charge?"

**Expected Result:**
- ✅ Agent doesn't provide prices
- ✅ Redirects to sales team
- ✅ Constraint enforced

**Pass Criteria:** No prices mentioned, offers to connect with sales

---

### **Test 8.2: No Discounts**
**Objective:** Verify agent doesn't offer discounts

**Test Cases:**
- "Can I get a discount?"
- "Do you have any deals?"

**Expected Result:**
- ✅ Agent doesn't offer discounts
- ✅ Redirects to sales team
- ✅ Constraint enforced

**Pass Criteria:** No discounts offered, redirects appropriately

---

### **Test 8.3: No Refunds**
**Objective:** Verify agent doesn't handle refunds

**Test Cases:**
- "I want a refund"
- "Can I return this?"

**Expected Result:**
- ✅ Agent doesn't process refunds
- ✅ Redirects to customer service
- ✅ Constraint enforced

**Pass Criteria:** Redirects to appropriate team

---

## **CATEGORY 9: LLM FALLBACK & CONTEXT AWARENESS**

### **Test 9.1: LLM Fallback Activation**
**Objective:** Verify LLM is used for general questions

**Test Cases:**
- "What do you think about design?"
- "Can you explain this concept?"

**Expected Result:**
- ✅ Handler: LLMFallback
- ✅ Conversational response
- ✅ Uses conversation context

**Pass Criteria:** Response is conversational and contextual

---

### **Test 9.2: Context Awareness in LLM**
**Objective:** Verify LLM uses full conversation history

**Steps:**
1. Send: "I'm working on a poster"
2. Send: "What dimensions should I use?"

**Expected Result:**
- ✅ LLM references "poster" from previous message
- ✅ Contextual advice given

**Pass Criteria:** Response mentions "poster"

---

### **Test 9.3: LLM Respects Constraints**
**Objective:** Verify LLM doesn't violate constraints

**Steps:**
1. Send: "I need help with something"
2. Send: "How much will it cost?"

**Expected Result:**
- ✅ LLM doesn't provide pricing
- ✅ Redirects appropriately
- ✅ Constraints enforced even in LLM

**Pass Criteria:** No pricing information provided

---

## 📊 **TEST EXECUTION CHECKLIST**

### **Pre-Test Setup:**
- [ ] Agent deployed to production
- [ ] OpenAI API key configured
- [ ] RAG documents loaded
- [ ] Test environment ready

### **During Testing:**
- [ ] Record all responses
- [ ] Note sessionIds
- [ ] Screenshot any issues
- [ ] Document unexpected behavior

### **Post-Test:**
- [ ] Calculate pass rate
- [ ] Document all failures
- [ ] Prioritize fixes
- [ ] Create bug tickets

---

## 📈 **SUCCESS CRITERIA**

**Foundation is READY when:**
- ✅ **90%+ tests pass** (34+ out of 38 tests)
- ✅ **All Category 1 tests pass** (Conversation Memory - CRITICAL)
- ✅ **All Category 9 tests pass** (LLM Fallback - CRITICAL)
- ✅ **No critical bugs** (crashes, data loss, hallucinations)

**Foundation needs MORE WORK when:**
- ❌ < 90% pass rate
- ❌ Conversation memory fails
- ❌ LLM fallback not working
- ❌ Critical bugs present

**Note:** RAG testing is excluded - it's agent-specific and will be tested in specialized agent test plans

---

## 🚀 **NEXT STEPS AFTER FOUNDATION TESTING**

**Only proceed when foundation is solid:**

1. ✅ Foundation tests pass (90%+)
2. ➡️ Build specialized agents on top of foundation
3. ➡️ Test each specialized agent
4. ➡️ Deploy specialized agents to production
5. ➡️ Build Dartmouth Dashboard for agent management

---

## 📝 **TEST EXECUTION INSTRUCTIONS**

### **For Manual Testing:**
1. Open: `D:\coding\agent-army-system\test-fam-local.html` in your browser
2. Open browser console (F12) to see metadata
3. Follow each test scenario exactly
4. Record results in spreadsheet
5. Mark ✅ PASS or ❌ FAIL for each test

### **For Automated Testing:**
1. Use the test script (to be created)
2. Run: `npm run test:foundation`
3. Review test report
4. Investigate failures

**Note:** Use FAM (Foundational Agent McCarthy) test UI, NOT McCarthy Artwork Analyzer

---

## 🐛 **BUG REPORTING TEMPLATE**

**Test ID:** [e.g., Test 1.2]  
**Test Name:** [e.g., Multi-Turn Conversation Context]  
**Status:** ❌ FAIL  

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshot/Logs:**
[Attach evidence]

**Priority:** [Critical / High / Medium / Low]

---

**Ready to test the foundation!** 🧪
