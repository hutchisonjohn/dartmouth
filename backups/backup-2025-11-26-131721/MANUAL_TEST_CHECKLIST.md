# ✅ MANUAL TEST CHECKLIST - McCarthy Artwork Agent

**Site:** https://artwork-analyser-ai-agent-1qo.pages.dev  
**Date:** 2025-11-25 AEDT  
**Purpose:** Verify all 5 FAM fixes are working in production

---

## 🎯 SETUP

1. Open: https://artwork-analyser-ai-agent-1qo.pages.dev
2. Upload test image: `d:\coding\Artwork Analyser AI Agent\dots per inch 1.png` (or dots per inch 2.png)
3. Wait for analysis to complete
4. Open chat widget

---

## TEST 1: CUSTOM GREETING ✅

**What We Fixed:**
- Agents can now use custom personalities for greetings
- McCarthy should introduce himself, not use generic FAM greeting

**Test Steps:**
1. Type: `hi`
2. Press Enter

**✅ EXPECTED (FIXED):**
```
Hey! 👋 I'm McCarthy, your artwork assistant.

I can see your artwork is uploaded and analyzed.

What would you like to know about it?
• DPI and print sizes?
• Transparency or DTF issues?
• Colors and quality?
• Something else?
```

**❌ FAIL IF:**
```
Hello! Ready to help you out. What's on your mind?
```
(Generic FAM greeting - no personality)

**Result:** [ ] PASS [ ] FAIL

**Notes:**
_______________________________________________________

---

## TEST 2: EXACT CALCULATIONS (No Approximations) ✅

**What We Fixed:**
- Agent uses handlers, never does its own math
- No more "approximately" or wrong calculations

**Test Steps:**
1. Type: `what dpi at 28.5 cm wide?`
2. Press Enter

**✅ EXPECTED (FIXED):**
```
At **28.5 × 25.7 cm** (11.22" × 10.13"), your DPI would be **251**. ✨ **Quality: Optimal**
```

**Key Requirements:**
- ✅ Exact DPI value (251, not "approximately 200")
- ✅ No words like "approximately", "around", "roughly"
- ✅ Includes dimensions in both cm and inches
- ✅ Includes quality assessment

**❌ FAIL IF:**
- Says "approximately 200 DPI" or any approximation
- Does its own calculation (wrong value)
- Says "let me calculate that for you"

**Result:** [ ] PASS [ ] FAIL

**Notes:**
_______________________________________________________

---

## TEST 3: NATURAL LANGUAGE PATTERNS ✅

**What We Fixed:**
- Handlers catch flexible natural language
- "I need my artwork bigger at least 28.5 wide" should trigger calculation handler

**Test Steps:**
1. Type: `I need my artwork bigger at least 28.5 wide. What will be the size and dpi?`
2. Press Enter

**✅ EXPECTED (FIXED):**
```
At **28.5 × 25.7 cm** (11.22" × 10.13"), your DPI would be **251**. ✨ **Quality: Optimal**
```

**Key Requirements:**
- ✅ Handler triggers (doesn't fall through to LLM)
- ✅ Exact calculation provided
- ✅ No approximations

**❌ FAIL IF:**
- Says "I'm not sure what you're asking"
- Does its own calculation (wrong answer)
- Doesn't recognize the size request

**Result:** [ ] PASS [ ] FAIL

**Notes:**
_______________________________________________________

---

## TEST 4: CONTEXT RETENTION ✅

**What We Fixed:**
- Agent maintains conversation context throughout
- No more "I'm not sure what you're asking" mid-conversation

**Test Steps:**
1. Type: `what about 35 cm?`
2. Press Enter
3. Type: `and what about 40 cm?`
4. Press Enter
5. Type: `which size would you recommend?`
6. Press Enter

**✅ EXPECTED (FIXED):**
- ✅ Responds to "what about 35 cm?" with DPI calculation
- ✅ Responds to "and what about 40 cm?" with DPI calculation
- ✅ Responds to "which size would you recommend?" with contextual advice
- ✅ NO "I'm not sure what you're asking" at any point

**❌ FAIL IF:**
- Says "Hmm, I'm not quite sure what you're asking"
- Loses context mid-conversation
- Doesn't understand follow-up questions

**Result:** [ ] PASS [ ] FAIL

**Notes:**
_______________________________________________________

---

## TEST 5: BRIEF RESPONSES ✅

**What We Fixed:**
- Agent follows "2-3 sentences MAX" constraint
- Adapts when user says "be brief"

**Test Steps:**
1. Type: `tell me about the quality`
2. Press Enter
3. Count sentences in response
4. Type: `please keep answers simple and brief`
5. Press Enter
6. Type: `what sizes can I print at?`
7. Press Enter
8. Count sentences in response

**✅ EXPECTED (FIXED):**
- ✅ Responses are 2-3 sentences (not walls of text)
- ✅ After user says "simple and brief", responses get even shorter
- ✅ No unprompted listing of all DPI options
- ✅ Agent adapts to user preference

**❌ FAIL IF:**
- Walls of text (5+ sentences)
- Lists all DPI options unprompted
- Doesn't adapt when user says "be brief"
- Over-explains everything

**Result:** [ ] PASS [ ] FAIL

**Notes:**
_______________________________________________________

---

## BONUS TEST: SLIDER POSITION AWARENESS ✅

**What We Fixed:**
- Agent knows current slider position

**Test Steps:**
1. Move the size slider to a specific position (e.g., 30 cm)
2. Type: `what's the current size?` or `tell me about this size`
3. Press Enter

**✅ EXPECTED (FIXED):**
```
You're currently at **30.0 × 27.1 cm** (11.81" × 10.67"), **DPI 238**. ✨ **Quality: Optimal**
```

**Key Requirements:**
- ✅ Reports exact slider position
- ✅ Matches what's shown on slider
- ✅ Includes DPI and quality

**❌ FAIL IF:**
- Doesn't know slider position
- Reports wrong values
- Says "I don't have that information"

**Result:** [ ] PASS [ ] FAIL

**Notes:**
_______________________________________________________

---

## 📊 OVERALL RESULTS

| Test | Result | Notes |
|------|--------|-------|
| 1. Custom Greeting | [ ] PASS [ ] FAIL | |
| 2. Exact Calculations | [ ] PASS [ ] FAIL | |
| 3. Natural Language | [ ] PASS [ ] FAIL | |
| 4. Context Retention | [ ] PASS [ ] FAIL | |
| 5. Brief Responses | [ ] PASS [ ] FAIL | |
| Bonus: Slider Awareness | [ ] PASS [ ] FAIL | |

**Pass Rate:** ___/6 (___%)

---

## 🎯 DECISION

### **If ALL Tests Pass (6/6):**
✅ **FAM fixes are working in production!**
- Proceed with DOS Infrastructure + Sales Agent
- No need to fix integration tests right now

### **If Some Tests Fail (3-5/6):**
⚠️ **Minor issues found**
- Document specific failures
- Assess if they're blockers
- May need quick fixes

### **If Most Tests Fail (0-2/6):**
❌ **Critical issues found**
- FAM fixes may not be deployed correctly
- Need to investigate and re-deploy
- Fix before proceeding

---

## 📝 NOTES

**Testing Environment:**
- Browser: _______________________
- Date/Time: _______________________
- Artwork File Used: _______________________

**Issues Found:**
_______________________________________________________
_______________________________________________________
_______________________________________________________

**Additional Observations:**
_______________________________________________________
_______________________________________________________
_______________________________________________________

---

**Created:** 2025-11-25 AEDT  
**Status:** Ready for manual testing  
**Next:** Based on results, decide to proceed or fix issues



