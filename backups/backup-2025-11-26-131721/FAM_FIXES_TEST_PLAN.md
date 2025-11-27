# 🧪 FAM FIXES - COMPREHENSIVE TEST PLAN

**Date Created:** 2025-11-25 AEDT  
**Purpose:** Verify all 5 FAM architectural fixes are working in production  
**Test Site:** https://artwork-analyser-ai-agent-1qo.pages.dev  
**Status:** Ready to Execute

---

## 📋 TEST OVERVIEW

### **What We're Testing:**
1. ✅ **Custom Greeting** - McCarthy introduces himself with personality (not generic FAM greeting)
2. ✅ **Exact Calculations** - Agent uses handlers, never does its own math
3. ✅ **Context Retention** - Agent maintains conversation context throughout
4. ✅ **Brief Responses** - Agent follows "2-3 sentences MAX" constraint
5. ✅ **Natural Language** - Handlers catch flexible language patterns

### **Test Environment:**
- **Site:** https://artwork-analyser-ai-agent-1qo.pages.dev
- **Backend:** Dartmouth OS Worker (deployed 2025-11-23)
- **Agent:** McCarthy Artwork Agent v1.0
- **Test Images:** Available in `d:\coding\Artwork Analyser AI Agent\`

---

## 🧪 TEST EXECUTION STEPS

### **SETUP:**
1. Open browser to https://artwork-analyser-ai-agent-1qo.pages.dev
2. Upload test image: `dots per inch 1.png` or `dots per inch 2.png`
3. Wait for artwork analysis to complete
4. Open chat widget (should appear after upload)

---

## TEST 1: CUSTOM GREETING ✅

### **Objective:**
Verify McCarthy uses custom greeting with personality (not generic FAM greeting)

### **Test Steps:**
1. After artwork is uploaded and analyzed, type: **"hi"**
2. Press Enter

### **EXPECTED RESULT:**
```
Hey! 👋 I'm McCarthy, your artwork assistant.

I can see your artwork is uploaded and analyzed.

What would you like to know about it?
• DPI and print sizes?
• Transparency or DTF issues?
• Colors and quality?
• Something else?
```

### **FAIL CRITERIA:**
- ❌ Generic greeting: "Hello! Ready to help you out. What's on your mind?"
- ❌ No mention of artwork being uploaded
- ❌ No personality or options offered

### **Result:** [ ] PASS [ ] FAIL

**Notes:**
_______________________________________________________

---

## TEST 2: EXACT CALCULATIONS (No Approximations) ✅

### **Objective:**
Verify agent uses SizeCalculationHandler and never does its own math

### **Test Steps:**
1. Type: **"what dpi at 28.5 cm wide?"**
2. Press Enter
3. Observe response

### **EXPECTED RESULT:**
```
At **28.5 × 25.7 cm** (11.22" × 10.13"), your DPI would be **251**. ✨ **Quality: Optimal**
```

**Key Requirements:**
- ✅ Exact DPI value (251, not "approximately 200")
- ✅ No words like "approximately", "around", "roughly"
- ✅ Includes dimensions in both cm and inches
- ✅ Includes quality assessment

### **FAIL CRITERIA:**
- ❌ Says "approximately 200 DPI" or any approximation
- ❌ Does its own calculation
- ❌ Wrong DPI value
- ❌ Says "let me calculate that for you"

### **Result:** [ ] PASS [ ] FAIL

**Notes:**
_______________________________________________________

---

## TEST 3: NATURAL LANGUAGE PATTERNS ✅

### **Objective:**
Verify SizeCalculationHandler catches flexible natural language

### **Test Steps:**
1. Type: **"I need my artwork bigger at least 28.5 wide. What will be the size and dpi?"**
2. Press Enter
3. Observe response

### **EXPECTED RESULT:**
```
At **28.5 × 25.7 cm** (11.22" × 10.13"), your DPI would be **251**. ✨ **Quality: Optimal**
```

**Key Requirements:**
- ✅ Handler triggers (doesn't fall through to LLM)
- ✅ Exact calculation provided
- ✅ No approximations

### **FAIL CRITERIA:**
- ❌ Says "I'm not sure what you're asking"
- ❌ Does its own calculation (wrong answer)
- ❌ Doesn't recognize the size request

### **Result:** [ ] PASS [ ] FAIL

**Notes:**
_______________________________________________________

---

## TEST 4: CONTEXT RETENTION ✅

### **Objective:**
Verify agent maintains conversation context throughout

### **Test Steps:**
1. Type: **"what about 35 cm?"**
2. Press Enter
3. Type: **"and what about 40 cm?"**
4. Press Enter
5. Type: **"which size would you recommend?"**
6. Press Enter

### **EXPECTED RESULT:**
- ✅ Responds to "what about 35 cm?" with DPI calculation
- ✅ Responds to "and what about 40 cm?" with DPI calculation
- ✅ Responds to "which size would you recommend?" with contextual advice
- ✅ NO "I'm not sure what you're asking" at any point

### **FAIL CRITERIA:**
- ❌ Says "Hmm, I'm not quite sure what you're asking"
- ❌ Loses context mid-conversation
- ❌ Doesn't understand follow-up questions

### **Result:** [ ] PASS [ ] FAIL

**Notes:**
_______________________________________________________

---

## TEST 5: BRIEF RESPONSES ✅

### **Objective:**
Verify agent follows "2-3 sentences MAX" constraint

### **Test Steps:**
1. Type: **"tell me about the quality"**
2. Press Enter
3. Count sentences in response
4. Type: **"please keep answers simple and brief"**
5. Press Enter
6. Type: **"what sizes can I print at?"**
7. Press Enter
8. Count sentences in response

### **EXPECTED RESULT:**
- ✅ Responses are 2-3 sentences (not walls of text)
- ✅ After user says "simple and brief", responses get even shorter
- ✅ No unprompted listing of all DPI options
- ✅ Agent adapts to user preference

### **FAIL CRITERIA:**
- ❌ Walls of text (5+ sentences)
- ❌ Lists all DPI options unprompted
- ❌ Doesn't adapt when user says "be brief"
- ❌ Over-explains everything

### **Result:** [ ] PASS [ ] FAIL

**Notes:**
_______________________________________________________

---

## TEST 6: SLIDER POSITION AWARENESS ✅

### **Objective:**
Verify agent knows current slider position

### **Test Steps:**
1. Move the size slider to a specific position (e.g., 30 cm)
2. Type: **"what's the current size?"** or **"tell me about this size"**
3. Press Enter

### **EXPECTED RESULT:**
```
You're currently at **30.0 × 27.1 cm** (11.81" × 10.67"), **DPI 238**. ✨ **Quality: Optimal**
```

**Key Requirements:**
- ✅ Reports exact slider position
- ✅ Matches what's shown on slider
- ✅ Includes DPI and quality

### **FAIL CRITERIA:**
- ❌ Doesn't know slider position
- ❌ Reports wrong values
- ❌ Says "I don't have that information"

### **Result:** [ ] PASS [ ] FAIL

**Notes:**
_______________________________________________________

---

## TEST 7: MULTIPLE SIZE QUERIES ✅

### **Objective:**
Verify agent handles multiple size calculations correctly

### **Test Steps:**
1. Type: **"what dpi at 20 cm?"**
2. Press Enter
3. Type: **"what about 25 cm?"**
4. Press Enter
5. Type: **"and 30 cm?"**
6. Press Enter

### **EXPECTED RESULT:**
- ✅ Each response has exact DPI for that size
- ✅ No approximations
- ✅ Values are consistent
- ✅ Agent doesn't get confused

### **FAIL CRITERIA:**
- ❌ Wrong DPI values
- ❌ Approximations
- ❌ Inconsistent answers
- ❌ Gets confused between sizes

### **Result:** [ ] PASS [ ] FAIL

**Notes:**
_______________________________________________________

---

## TEST 8: INFORMATION QUERIES (RAG) ✅

### **Objective:**
Verify RAG system still works (not broken by fixes)

### **Test Steps:**
1. Type: **"what is DTF printing?"**
2. Press Enter
3. Type: **"what's the difference between DTF and UV DTF?"**
4. Press Enter

### **EXPECTED RESULT:**
- ✅ Provides accurate information from knowledge base
- ✅ Responses are brief and conversational
- ✅ No calculation attempts

### **FAIL CRITERIA:**
- ❌ Says "I don't know"
- ❌ Provides incorrect information
- ❌ Tries to calculate something

### **Result:** [ ] PASS [ ] FAIL

**Notes:**
_______________________________________________________

---

## TEST 9: EDGE CASES ✅

### **Objective:**
Test edge cases and error handling

### **Test Steps:**
1. Type: **"what dpi at 200 cm?"** (very large size)
2. Press Enter
3. Type: **"what about 5 cm?"** (very small size)
4. Press Enter
5. Type: **"asdfghjkl"** (gibberish)
6. Press Enter

### **EXPECTED RESULT:**
- ✅ Large size: Provides DPI (will be very low, with quality warning)
- ✅ Small size: Provides DPI (will be very high, excellent quality)
- ✅ Gibberish: Polite "I don't understand" with context awareness

### **FAIL CRITERIA:**
- ❌ Crashes or errors
- ❌ Provides nonsensical answers
- ❌ Loses context after gibberish

### **Result:** [ ] PASS [ ] FAIL

**Notes:**
_______________________________________________________

---

## TEST 10: CONVERSATION FLOW ✅

### **Objective:**
Test natural conversation flow

### **Test Steps:**
1. Type: **"hi"**
2. Type: **"I want to print this at 30 cm wide"**
3. Type: **"is that good quality?"**
4. Type: **"what if I go bigger?"**
5. Type: **"ok what about 35 cm?"**
6. Type: **"perfect, thanks!"**

### **EXPECTED RESULT:**
- ✅ Natural conversation flow
- ✅ Context maintained throughout
- ✅ Appropriate responses to each message
- ✅ Polite farewell at end

### **FAIL CRITERIA:**
- ❌ Context loss at any point
- ❌ Inappropriate responses
- ❌ Doesn't understand follow-ups

### **Result:** [ ] PASS [ ] FAIL

**Notes:**
_______________________________________________________

---

## 📊 TEST RESULTS SUMMARY

### **Overall Results:**

| Test | Status | Notes |
|------|--------|-------|
| 1. Custom Greeting | [ ] PASS [ ] FAIL | |
| 2. Exact Calculations | [ ] PASS [ ] FAIL | |
| 3. Natural Language | [ ] PASS [ ] FAIL | |
| 4. Context Retention | [ ] PASS [ ] FAIL | |
| 5. Brief Responses | [ ] PASS [ ] FAIL | |
| 6. Slider Awareness | [ ] PASS [ ] FAIL | |
| 7. Multiple Sizes | [ ] PASS [ ] FAIL | |
| 8. Information Queries | [ ] PASS [ ] FAIL | |
| 9. Edge Cases | [ ] PASS [ ] FAIL | |
| 10. Conversation Flow | [ ] PASS [ ] FAIL | |

### **Pass Rate:** ___/10 (___%)

---

## 🐛 ISSUES DISCOVERED

### **Critical Issues:**
_______________________________________________________
_______________________________________________________

### **High Priority:**
_______________________________________________________
_______________________________________________________

### **Medium Priority:**
_______________________________________________________
_______________________________________________________

### **Low Priority:**
_______________________________________________________
_______________________________________________________

---

## ✅ SIGN-OFF

### **Tester:** _______________________
### **Date:** _______________________
### **Time:** _______________________

### **Overall Assessment:**
- [ ] ✅ All fixes working as expected - PRODUCTION READY
- [ ] ⚠️ Minor issues found - Can proceed with caution
- [ ] ❌ Critical issues found - Needs immediate attention

### **Recommendation:**
_______________________________________________________
_______________________________________________________
_______________________________________________________

---

## 📚 REFERENCE DOCUMENTS

- `FAM_FIXES_COMPLETED.md` - What was fixed
- `CRITICAL_FIXES_REQUIRED.md` - Original fix plan
- `PROGRESS_TO_DATE.md` - Current project status

---

**Test Plan Version:** 1.0  
**Created:** 2025-11-25 AEDT  
**Status:** Ready for Execution



