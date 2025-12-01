# 🔥 RETEST: Failed & Untested Questions
## McCarthy Artwork Agent - Post-Fix Validation

**URL:** https://artwork-analyser-ai-agent-1qo.pages.dev  
**Prerequisites:** Upload an artwork file (PNG or PDF, preferably 2811x2539 pixels at 300 DPI)  
**Date:** November 27, 2025  
**Status:** Ready for testing after deployment

---

## ✅ FIXES APPLIED

1. **RAG Parameter Order** - Fixed in InformationHandler and HowToHandler (10 failures)
2. **Reverse DPI Calculation** - Added to SizeCalculationHandler (4 failures)
3. **File Size Intent Detection** - Fixed in IntentDetector (1 failure)
4. **ICC Profile Check** - Added artwork data check to InformationHandler (1 failure)
5. **Intent Pattern Improvements** - Enhanced pattern matching (1 failure)

---

## 🔴 SECTION A: 17 FAILED QUESTIONS (Must All Pass)

### A1. Reverse DPI Calculation - 300 DPI
**Test ID:** 4.1  
**Input:** `what size can I print at 300 DPI?`  
**Expected:** "At 300 DPI: 23.8 × 21.5 cm (9.37" × 8.46")"  
**Previous Result:** ❌ "I couldn't understand the size you mentioned"  
**Root Cause:** Missing reverse calculation logic in SizeCalculationHandler  
**Fix Applied:** Added `calculateSizeForDPI()` function  
**Retest Result:** ___________

---

### A2. Reverse DPI Calculation - 250 DPI
**Test ID:** 4.2  
**Input:** `what about 250 DPI?`  
**Expected:** "At 250 DPI: 28.6 × 25.8 cm (11.24" × 10.16")"  
**Previous Result:** ❌ "I couldn't understand the size you mentioned"  
**Root Cause:** Missing reverse calculation logic in SizeCalculationHandler  
**Fix Applied:** Added `calculateSizeForDPI()` function  
**Retest Result:** ___________

---

### A3. Reverse DPI Calculation - 200 DPI
**Test ID:** 4.3  
**Input:** `and 200 DPI?`  
**Expected:** "At 200 DPI: 35.7 × 32.2 cm (14.06" × 12.70")"  
**Previous Result:** ❌ "I couldn't understand the size you mentioned"  
**Root Cause:** Missing reverse calculation logic in SizeCalculationHandler  
**Fix Applied:** Added `calculateSizeForDPI()` function  
**Retest Result:** ___________

---

### A4. Reverse DPI Calculation - Multiple DPI
**Test ID:** 4.5  
**Input:** `show me sizes for 300, 250, and 200 DPI`  
**Expected:** List of all three sizes with quality ratings  
**Previous Result:** ❌ "I couldn't understand the size you mentioned"  
**Root Cause:** Missing reverse calculation logic in SizeCalculationHandler  
**Fix Applied:** Added `calculateSizeForDPI()` function  
**Retest Result:** ___________

---

### A5. File Size vs Print Size Confusion
**Test ID:** 7.1  
**Input:** `how big is my file?`  
**Expected:** File size (e.g., "10.37 MB")  
**Previous Result:** ❌ Triggered calculation handler instead of file information  
**Root Cause:** IntentDetector pattern `/how (big|large)/i` too broad  
**Fix Applied:** Added `isFileInformation()` method, reordered intent checks  
**Retest Result:** ___________

---

### A6. UV DTF Applications - Wrong Info
**Test ID:** 9.4  
**Input:** `rrrr`  
**Expected:** "Hard substrates (glass, metal, wood, plastic, ceramics, acrylic)"  
**Previous Result:** ❌ Said "apparel and textiles" (COMPLETELY WRONG)  
**Root Cause:** RAG parameters backwards in InformationHandler  
**Fix Applied:** Corrected parameter order: `retrieve(agentId, query, topK)`  
**Retest Result:** ___________

---

### A7. UV DTF Line Thickness - Wrong Info
**Test ID:** 9.3  
**Input:** `what's the minimum line thickness for UV DTF?`  
**Expected:** "0.5-1mm. Lines below 0.5mm may not release cleanly"  
**Previous Result:** ❌ Incorrect information  
**Root Cause:** RAG parameters backwards in InformationHandler  
**Fix Applied:** Corrected parameter order: `retrieve(agentId, query, topK)`  
**Retest Result:** ___________

---

### A8. DPI Quality - "Good" Definition (First Ask)
**Test ID:** 10.2  
**Input:** `what's good quality DPI?`  
**Expected:** "200-249 DPI"  
**Previous Result:** ❌ Inconsistent answer  
**Root Cause:** RAG parameters backwards in InformationHandler  
**Fix Applied:** Corrected parameter order: `retrieve(agentId, query, topK)`  
**Retest Result:** ___________

---

### A9. DPI Quality - "Good" Definition (Second Ask)
**Test ID:** 10.2 (repeated)  
**Input:** `when is DPI considered good?`  
**Expected:** "200-249 DPI"  
**Previous Result:** ❌ Said "200-300 DPI" (wrong upper bound)  
**Root Cause:** RAG parameters backwards in InformationHandler  
**Fix Applied:** Corrected parameter order: `retrieve(agentId, query, topK)`  
**Retest Result:** ___________

---

### A10. DPI Quality - "Optimal" Definition
**Test ID:** 10.1  
**Input:** `when is DPI considered optimal?`  
**Expected:** "250 DPI or higher"  
**Previous Result:** ❌ Inconsistent answer  
**Root Cause:** RAG parameters backwards in InformationHandler  
**Fix Applied:** Corrected parameter order: `retrieve(agentId, query, topK)`  
**Retest Result:** ___________

---

### A11. DPI Quality - "Poor" Definition
**Test ID:** 10.3  
**Input:** `when is DPI considered poor?`  
**Expected:** "Below 200 DPI"  
**Previous Result:** ❌ Inconsistent answer  
**Root Cause:** RAG parameters backwards in InformationHandler  
**Fix Applied:** Corrected parameter order: `retrieve(agentId, query, topK)`  
**Retest Result:** ___________

---

### A12. How-To: Resize Artwork (CRASH)
**Test ID:** 11.1  
**Input:** `how do I resize my artwork?`  
**Expected:** Step-by-step instructions for resizing  
**Previous Result:** ❌ "Sorry, I encountered an error" (CRASH)  
**Root Cause:** RAG parameters backwards in HowToHandler  
**Fix Applied:** Corrected parameter order: `retrieve(agentId, query, topK)`  
**Retest Result:** ___________

---

### A13. How-To: Change DPI in Photoshop (CRASH)
**Test ID:** 11.2  
**Input:** `how do I change the DPI in Photoshop?`  
**Expected:** Photoshop DPI change instructions  
**Previous Result:** ❌ "Sorry, I encountered an error" (CRASH)  
**Root Cause:** RAG parameters backwards in HowToHandler  
**Fix Applied:** Corrected parameter order: `retrieve(agentId, query, topK)`  
**Retest Result:** ___________

---

### A14. How-To: Fix Transparency (CRASH)
**Test ID:** 11.3  
**Input:** `how do I fix transparency issues?`  
**Expected:** Instructions for fixing transparency  
**Previous Result:** ❌ "Sorry, I encountered an error" (CRASH)  
**Root Cause:** RAG parameters backwards in HowToHandler  
**Fix Applied:** Corrected parameter order: `retrieve(agentId, query, topK)`  
**Retest Result:** ___________

---

### A15. How-To: Convert to sRGB (CRASH)
**Test ID:** 11.4  
**Input:** `how do I convert to sRGB?`  
**Expected:** Color profile conversion instructions  
**Previous Result:** ❌ "Sorry, I encountered an error" (CRASH)  
**Root Cause:** RAG parameters backwards in HowToHandler  
**Fix Applied:** Corrected parameter order: `retrieve(agentId, query, topK)`  
**Retest Result:** ___________

---

### A16. How-To: Prepare for DTF (CRASH)
**Test ID:** 11.5  
**Input:** `how do I prepare my artwork for DTF printing?`  
**Expected:** DTF preparation checklist/steps  
**Previous Result:** ❌ "Sorry, I encountered an error" (CRASH)  
**Root Cause:** RAG parameters backwards in HowToHandler  
**Fix Applied:** Corrected parameter order: `retrieve(agentId, query, topK)`  
**Retest Result:** ___________

---

### A17. ICC Profile - Hallucination
**Test ID:** 7.5  
**Input:** `does it have an ICC profile?`  
**Expected:** "No, there is no embedded ICC profile" (if artworkData.iccProfile is false/null)  
**Previous Result:** ❌ Said "Yes, sRGB ICC profile" when none existed  
**Root Cause:** InformationHandler only checked RAG, not artworkData  
**Fix Applied:** Added check for `context.state?.metadata?.artworkData.iccProfile` first  
**Retest Result:** ___________

---

## 🟡 SECTION B: UNTESTED SECTIONS (Never Tested)

### Section 12: CONSTRAINT ENFORCEMENT (5 tests)

#### B1. Pricing Question
**Test ID:** 12.1  
**Input:** `how much does this cost?`  
**Expected:** "Please contact our sales team" (NO pricing info)  
**Result:** ___________

---

#### B2. Discount Request
**Test ID:** 12.2  
**Input:** `can I get a discount?`  
**Expected:** "Please contact our sales team" (NO discount info)  
**Result:** ___________

---

#### B3. Refund Question
**Test ID:** 12.3  
**Input:** `how do I get a refund?`  
**Expected:** "Please contact support" (NO refund processing)  
**Result:** ___________

---

#### B4. Payment Question
**Test ID:** 12.4  
**Input:** `what payment methods do you accept?`  
**Expected:** Redirect to sales/website (NO payment info)  
**Result:** ___________

---

#### B5. Order Status
**Test ID:** 12.5  
**Input:** `where is my order?`  
**Expected:** Redirect to support (stays in scope - artwork only)  
**Result:** ___________

---

### Section 13: CONTEXT RETENTION (5 tests)

#### B6. Follow-up Without Context
**Test ID:** 13.1  
**Input:** (After DPI question) `and what about 30 cm?`  
**Expected:** Understands "30 cm" refers to width, calculates DPI  
**Result:** ___________

---

#### B7. Pronoun Reference
**Test ID:** 13.2  
**Input:** (After transparency question) `is that good for DTF?`  
**Expected:** Understands "that" refers to transparency status  
**Result:** ___________

---

#### B8. Multiple Follow-ups
**Test ID:** 13.3  
**Input:** Ask 3 DPI questions in a row with "and", "also", "what about"  
**Expected:** All answers correctly with context maintained  
**Result:** ___________

---

#### B9. Topic Switch
**Test ID:** 13.4  
**Input:** Ask about DPI, then colors, then back to DPI  
**Expected:** Remembers previous DPI context  
**Result:** ___________

---

#### B10. Artwork Memory
**Test ID:** 13.5  
**Input:** (Close chat, reopen) `what's my artwork's DPI?`  
**Expected:** Remembers artwork data from session  
**Result:** ___________

---

### Section 14: NATURAL LANGUAGE UNDERSTANDING (5 tests)

#### B11. Casual Language
**Test ID:** 14.1  
**Input:** `yo, what's the dpi if i make it like 28 cm wide?`  
**Expected:** Understands and calculates DPI  
**Result:** ___________

---

#### B12. Incomplete Sentence
**Test ID:** 14.2  
**Input:** `28.5 cm wide dpi?`  
**Expected:** Understands and calculates DPI  
**Result:** ___________

---

#### B13. Multiple Questions
**Test ID:** 14.3  
**Input:** `what's the DPI at 28 cm and also what are the colors?`  
**Expected:** Answers both questions  
**Result:** ___________

---

#### B14. Typos
**Test ID:** 14.4  
**Input:** `waht is teh dpi at 28cm wdie?`  
**Expected:** Understands despite typos  
**Result:** ___________

---

#### B15. Colloquial Phrasing
**Test ID:** 14.5  
**Input:** `if i wanna print this at like 30 cm, what dpi am i looking at?`  
**Expected:** Understands and calculates DPI  
**Result:** ___________

---

### Section 15: ERROR HANDLING (5 tests)

#### B16. Invalid Dimension
**Test ID:** 15.1  
**Input:** `what's the DPI at -5 cm wide?`  
**Expected:** Error message or clarification request  
**Result:** ___________

---

#### B17. Nonsense Query
**Test ID:** 15.2  
**Input:** `asdfghjkl qwerty`  
**Expected:** "I'm not sure what you're asking" or similar  
**Result:** ___________

---

#### B18. Off-Topic Question
**Test ID:** 15.3  
**Input:** `what's the weather like?`  
**Expected:** Politely redirects to artwork topics  
**Result:** ___________

---

#### B19. Empty Message
**Test ID:** 15.4  
**Input:** (Send blank message)  
**Expected:** Handles gracefully or prompts for input  
**Result:** ___________

---

#### B20. Very Long Message
**Test ID:** 15.5  
**Input:** (Send 500+ word message)  
**Expected:** Handles gracefully, extracts intent  
**Result:** ___________

---

### Section 16: RESPONSE QUALITY (5 tests)

#### B21. Conciseness
**Test ID:** 16.1  
**Input:** `what's the DPI at 28.5 cm wide?`  
**Expected:** 2-3 sentences MAX  
**Result:** ___________

---

#### B22. Formatting
**Test ID:** 16.2  
**Input:** (Any calculation question)  
**Expected:** Bold numbers, emojis for quality, proper markdown  
**Result:** ___________

---

#### B23. Accuracy
**Test ID:** 16.3  
**Input:** `what's the DPI at 28.5 cm wide?`  
**Expected:** Exactly 251 DPI (±1 tolerance)  
**Result:** ___________

---

#### B24. Completeness
**Test ID:** 16.4  
**Input:** `what's the DPI at 28.5 cm wide?`  
**Expected:** Includes CM, inches, DPI, and quality rating  
**Result:** ___________

---

#### B25. Personality
**Test ID:** 16.5  
**Input:** (Any question)  
**Expected:** Friendly, helpful, professional but approachable  
**Result:** ___________

---

## 📊 SCORING

### Section A: Failed Questions (CRITICAL)
**Total:** 17 tests  
**Passed:** _____ / 17  
**Failed:** _____ / 17  
**Pass Rate:** _____ %

**Status:** ✅ All must pass to proceed

---

### Section B: Untested Questions
**Total:** 25 tests  
**Passed:** _____ / 25  
**Failed:** _____ / 25  
**Pass Rate:** _____ %

---

### Overall Retest Results
**Total Tests:** 42 tests  
**Passed:** _____ / 42  
**Failed:** _____ / 42  
**Pass Rate:** _____ %

### Pass Rate Interpretation:
- **95-100%:** ✅ Excellent - Production ready
- **85-94%:** ✅ Good - Minor issues only
- **75-84%:** ⚠️ Fair - Some issues need fixing
- **<75%:** ❌ Not acceptable - More fixes required

---

## 🎯 CRITICAL SUCCESS CRITERIA

**For Production Readiness:**
1. ✅ All 17 failed questions (Section A) MUST pass
2. ✅ All 5 "how-to" questions (A12-A16) MUST NOT crash
3. ✅ UV DTF information (A6, A7) MUST be correct
4. ✅ DPI quality standards (A8-A11) MUST be consistent
5. ✅ Reverse DPI calculations (A1-A4) MUST work
6. ✅ ICC profile (A17) MUST NOT hallucinate

**Minimum Acceptable:**
- Section A: 100% pass rate (17/17)
- Section B: 80% pass rate (20/25)
- Overall: 88% pass rate (37/42)

---

## 📝 TESTING NOTES

**Tester:** __________  
**Date:** __________  
**Artwork Used:** __________  
**Browser:** __________  

**Issues Found:**
- 
- 
- 

**Additional Observations:**
- 
- 
- 

---

## 🚀 NEXT STEPS

If Section A passes 100%:
1. ✅ Complete Section B testing
2. ✅ Document any new issues
3. ✅ Update PROGRESS_TO_DATE.md
4. ✅ Mark agent as "PRODUCTION READY" if overall pass rate ≥88%

If Section A has failures:
1. ❌ Stop testing
2. ❌ Document exact failures
3. ❌ Investigate root causes
4. ❌ Apply additional fixes
5. ❌ Redeploy and retest

---

**END OF RETEST SCRIPT**

