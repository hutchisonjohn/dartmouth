# 🎨 McCarthy Artwork Analyzer - Manual Test Plan

**Test Date:** November 18, 2025  
**Tester:** User  
**Test Interface:** https://dartmouth-chat.pages.dev  
**API Endpoint:** https://agent-army-worker.dartmouth.workers.dev

---

## 📋 **Test Instructions**

For each test below:
1. Visit the test interface: https://dartmouth-chat.pages.dev
2. Type the exact message shown
3. Observe the response
4. Mark ✅ if working correctly, ❌ if not working, ⚠️ if partially working
5. Note any issues or unexpected behavior

---

## ✅ **Test Category 1: Greeting & Basic Interaction**

### Test 1.1: Basic Greeting
**Message:** `Hello!`  
**Expected Response:** Warm greeting introducing McCarthy Artwork Analyzer  
**Result:** [ ]  
**Notes:**

### Test 1.2: Help Request
**Message:** `I need help with artwork`  
**Expected Response:** Offers assistance with artwork analysis, DPI, printing  
**Result:** [ ]  
**Notes:**

### Test 1.3: Casual Greeting
**Message:** `Hey there!`  
**Expected Response:** Friendly greeting maintaining professional tone  
**Result:** [ ]  
**Notes:**

---

## 🧮 **Test Category 2: DPI Calculations**

### Test 2.1: Standard DPI Calculation
**Message:** `What size can I print 4000x6000 pixels at 300 DPI?`  
**Expected Response:** List of printable sizes with dimensions in cm and inches  
**Result:** [ ]  
**Notes:**

### Test 2.2: Different DPI Value
**Message:** `I have 3000x4500 pixels at 150 DPI, what can I print?`  
**Expected Response:** Calculated print sizes at 150 DPI  
**Result:** [ ]  
**Notes:**

### Test 2.3: High Resolution Artwork
**Message:** `What about 6000x9000 pixels at 300 DPI?`  
**Expected Response:** Larger print sizes reflecting higher resolution  
**Result:** [ ]  
**Notes:**

### Test 2.4: Low Resolution Warning
**Message:** `Can I print 800x1200 pixels at 72 DPI?`  
**Expected Response:** Should mention poor quality or small print size  
**Result:** [ ]  
**Notes:**

### Test 2.5: Just Dimensions (Default DPI)
**Message:** `I have a 4000x6000 pixel image`  
**Expected Response:** Should ask for DPI or assume 300 DPI default  
**Result:** [ ]  
**Notes:**

---

## ❓ **Test Category 3: DTF Questions (Without RAG)**

### Test 3.1: DTF Preparation  
**Message:** `How do I prepare artwork for DTF printing?`  
**Expected Response:** General guidance (may be limited without RAG docs)  
**Result:** [ ]  
**Notes:**

### Test 3.2: Minimum Text Size
**Message:** `What is the minimum text size for DTF?`  
**Expected Response:** General answer or indication that specific info will come from knowledge base  
**Result:** [ ]  
**Notes:**

### Test 3.3: Color Requirements
**Message:** `What about colors in DTF printing?`  
**Expected Response:** General color guidance  
**Result:** [ ]  
**Notes:**

---

## 🚫 **Test Category 4: Constraint Testing (Business Rules)**

### Test 4.1: Pricing Question
**Message:** `How much does DTF printing cost?`  
**Expected Response:** Should refuse to provide pricing, suggest contacting sales  
**Result:** [ ]  
**Notes:**

### Test 4.2: Discount Request
**Message:** `Can I get a discount?`  
**Expected Response:** Should refuse to offer discounts, escalate to sales  
**Result:** [ ]  
**Notes:**

### Test 4.3: Refund Question
**Message:** `Can I get a refund if I'm not happy?`  
**Expected Response:** Should refuse to promise refunds, escalate to customer service  
**Result:** [ ]  
**Notes:**

### Test 4.4: Specific Price Quote
**Message:** `What's the price for 100 shirts?`  
**Expected Response:** Should refuse and direct to sales team  
**Result:** [ ]  
**Notes:**

---

## 💬 **Test Category 5: Conversation Flow**

### Test 5.1: Follow-up Question
**First Message:** `I have a 4000x6000 pixel image`  
**Second Message:** `What DPI should I use?`  
**Expected Response:** Should remember context from first message  
**Result:** [ ]  
**Notes:**

### Test 5.2: Clarification
**First Message:** `I need help with printing`  
**Second Message:** `I mean DTF printing`  
**Expected Response:** Should acknowledge clarification and provide DTF-specific help  
**Result:** [ ]  
**Notes:**

### Test 5.3: Topic Change
**First Message:** `What size can I print 4000x6000 at 300 DPI?`  
**Second Message:** `Actually, tell me about UV DTF instead`  
**Expected Response:** Should smoothly transition to UV DTF topic  
**Result:** [ ]  
**Notes:**

---

## 🎯 **Test Category 6: Edge Cases**

### Test 6.1: Invalid Dimensions
**Message:** `I have a -4000x6000 pixel image`  
**Expected Response:** Should handle gracefully, ask for valid dimensions  
**Result:** [ ]  
**Notes:**

### Test 6.2: Extremely Large Image
**Message:** `What about 50000x75000 pixels?`  
**Expected Response:** Should calculate correctly or note it's very large  
**Result:** [ ]  
**Notes:**

### Test 6.3: Nonsense Input
**Message:** `asdfghjkl`  
**Expected Response:** Should ask for clarification politely  
**Result:** [ ]  
**Notes:**

### Test 6.4: Empty Message
**Message:** ` ` (just spaces)  
**Expected Response:** Should handle gracefully  
**Result:** [ ]  
**Notes:**

---

## 🤖 **Test Category 7: Agent Personality**

### Test 7.1: Friendliness
**Observe:** Overall tone and warmth in responses  
**Expected:** Helpful, professional, friendly but not overly casual  
**Result:** [ ]  
**Notes:**

### Test 7.2: Clarity
**Observe:** Are calculations and explanations clear?  
**Expected:** Easy to understand, well-formatted  
**Result:** [ ]  
**Notes:**

### Test 7.3: Helpfulness
**Observe:** Does it anticipate needs and offer relevant info?  
**Expected:** Proactive suggestions, relevant context  
**Result:** [ ]  
**Notes:**

### Test 7.4: Consistency
**Observe:** Does personality remain consistent across different queries?  
**Expected:** Same tone and style throughout  
**Result:** [ ]  
**Notes:**

---

## 📱 **Test Category 8: UI/UX (Quick Visual Check)**

### Test 8.1: Message Display
**Check:** Are messages displayed correctly?  
**Expected:** Clear separation between user and bot messages  
**Result:** [ ]  
**Notes:**

### Test 8.2: Typing Indicator
**Check:** Does typing indicator show while processing?  
**Expected:** Animated dots while waiting  
**Result:** [ ]  
**Notes:**

### Test 8.3: Quick Test Buttons
**Check:** Do the quick test buttons work?  
**Expected:** Clicking button sends the test message  
**Result:** [ ]  
**Notes:**

### Test 8.4: Scrolling
**Check:** Does chat scroll smoothly to new messages?  
**Expected:** Auto-scrolls to bottom on new message  
**Result:** [ ]  
**Notes:**

---

## 📊 **Test Summary**

**Total Tests:** 33  
**Passed:** ___  
**Failed:** ___  
**Partially Working:** ___  
**Pass Rate:** ___%

---

## 🐛 **Issues Found**

### Issue 1:
**Test:** ___  
**Description:** ___  
**Severity:** High / Medium / Low  
**Steps to Reproduce:** ___

### Issue 2:
**Test:** ___  
**Description:** ___  
**Severity:** High / Medium / Low  
**Steps to Reproduce:** ___

### Issue 3:
**Test:** ___  
**Description:** ___  
**Severity:** High / Medium / Low  
**Steps to Reproduce:** ___

---

## 💡 **Additional Observations**

### What Worked Well:
-
-
-

### What Needs Improvement:
-
-
-

### Suggestions:
-
-
-

---

## ✅ **Sign-off**

**Tester Name:** ___  
**Test Date:** ___  
**Overall Assessment:** Pass / Fail / Needs Work  
**Ready for RAG Integration:** Yes / No  

**Comments:**

---

**NOTE:** This is Phase 1 testing WITHOUT the RAG knowledge base loaded. After RAG is integrated, we'll run these tests again plus additional knowledge-specific tests.

