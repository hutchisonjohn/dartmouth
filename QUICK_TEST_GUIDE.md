# ⚡ QUICK TEST GUIDE - FAM FIXES

**Site:** https://artwork-analyser-ai-agent-1qo.pages.dev  
**Time:** ~10 minutes  
**Status:** Ready to test

---

## 🚀 QUICK START

1. **Open:** https://artwork-analyser-ai-agent-1qo.pages.dev
2. **Upload:** `dots per inch 1.png` (from `d:\coding\Artwork Analyser AI Agent\`)
3. **Wait:** For analysis to complete
4. **Test:** Use chat widget

---

## ✅ 5 CRITICAL TESTS

### **1. GREETING** (30 seconds)
**Type:** `hi`  
**Expected:** "Hey! 👋 I'm McCarthy, your artwork assistant..."  
**Fail if:** "Hello! Ready to help you out..."

---

### **2. CALCULATIONS** (30 seconds)
**Type:** `what dpi at 28.5 cm wide?`  
**Expected:** "At **28.5 × 25.7 cm**, your DPI would be **251**"  
**Fail if:** "approximately 200 DPI" or any approximation

---

### **3. NATURAL LANGUAGE** (30 seconds)
**Type:** `I need my artwork bigger at least 28.5 wide. What will be the size and dpi?`  
**Expected:** Exact calculation (251 DPI)  
**Fail if:** "I'm not sure" or wrong calculation

---

### **4. CONTEXT** (2 minutes)
**Type sequence:**
1. `what about 35 cm?`
2. `and what about 40 cm?`
3. `which size would you recommend?`

**Expected:** Maintains context throughout  
**Fail if:** "I'm not sure what you're asking" at any point

---

### **5. BREVITY** (2 minutes)
**Type:** `tell me about the quality`  
**Then:** `please keep answers simple and brief`  
**Then:** `what sizes can I print at?`

**Expected:** 2-3 sentences max, adapts to "be brief"  
**Fail if:** Walls of text (5+ sentences)

---

## 📊 QUICK RESULTS

- [ ] Test 1: Greeting
- [ ] Test 2: Calculations
- [ ] Test 3: Natural Language
- [ ] Test 4: Context
- [ ] Test 5: Brevity

**Pass Rate:** ___/5

---

## 🎯 DECISION

- **5/5:** ✅ Production Ready - Proceed with DOS Infrastructure
- **3-4/5:** ⚠️ Minor Issues - Document and proceed with caution
- **0-2/5:** ❌ Critical Issues - Stop and fix immediately

---

## 📚 FULL DETAILS

See `FAM_FIXES_TEST_PLAN.md` for comprehensive test plan (10 tests total)

---

**Created:** 2025-11-25 AEDT  
**Version:** 1.0



