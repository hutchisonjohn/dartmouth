# 🐛 Critical Bugs Fixed - Session 2

**Date:** November 18, 2025  
**Time:** After initial deployment testing  
**Status:** ✅ FIXED & DEPLOYED

---

## 🚨 **Bug #1: LLM Overriding CalculationHandler**

### **Problem:**
User asks: "What size can I print 4000x6000 pixels at 300 DPI?"  
Expected: CalculationHandler provides exact calculations  
Got: LLM says "approximately 13.33 x 20 inches"

### **Root Cause:**
`BaseAgent.shouldUseLLMFallback()` was allowing LLM to override calculation handler responses.

### **Solution:**
Added `noLLMIntents` list to prevent fallback for:
- `calculation`
- `greeting`
- `farewell`
- `frustration`

### **Fix Location:**
`packages/worker/src/BaseAgent.ts` line 614-617

### **Status:** ✅ FIXED & DEPLOYED

---

## 🚨 **Bug #2: Intent Detection Missing Calculations**

### **Problem:**
User asks: "What about 6000x9000 pixels at 300 DPI?"  
Expected: Detected as `calculation`  
Got: Detected as `unknown` or `information`, triggered frustration loop

### **Root Cause:**
Intent detector didn't have pattern for "what about" + pixels

### **Solution:**
1. Added high-priority check: if message has "pixels x pixels" AND "DPI", ALWAYS = calculation
2. Added pattern: `/(what about|can i print).*(pixels|x\d+)/i`

### **Fix Location:**
`packages/worker/src/components/IntentDetector.ts` lines 210-221

### **Status:** ✅ FIXED & DEPLOYED

---

## 🚨 **Bug #3: Response Format (Inches First)**

### **Problem:**
Response showed inches first: "13.33 x 20 inches"  
Expected: CM first, inches in parentheses

### **Solution:**
Changed response formatting in CalculationHandler to use `maxSizes` and format as:
"33.87cm x 50.80cm (13.33" x 20") at 300 DPI"

### **Fix Location:**
`packages/mccarthy-artwork/src/handlers/CalculationHandler.ts` lines 100-108

### **Status:** ✅ FIXED & DEPLOYED

---

## 📝 **Note for Future: Dashboard Setting**

User requested ability to configure units in Dartmouth Dashboard:
- Option 1: CM first (default)
- Option 2: Inches first
- Option 3: Show both

**TODO:** Add this to Dashboard Phase (Phase 7+)

---

## ✅ **Deployment Status**

**Commit:** `578d152`  
**Message:** "CRITICAL FIX: Prevent LLM fallback from overriding calculation handler responses"  
**Deployed:** ✅ Yes - Version `cc965f1b-8d52-4317-86b5-cd70215fbf6a`  
**GitHub Push:** ⏳ Pending (GitHub API issues 502/500 errors)

---

## 🧪 **Ready for Re-Testing**

Please test these scenarios again:

1. **"What size can I print 4000x6000 pixels at 300 DPI?"**
   - Expected: CM first format with precise calculations

2. **"What about 6000x9000 pixels at 300 DPI?"**
   - Expected: Calculation response, NO frustration loop

3. **"I have 3000x4500 pixels at 150 DPI, what can I print?"**
   - Expected: Calculation response with sizes

4. **"Can I print 800x1200 pixels at 72 DPI?"**
   - Expected: Calculation response (small/poor quality)

---

**All fixes deployed and ready for testing!** 🚀

