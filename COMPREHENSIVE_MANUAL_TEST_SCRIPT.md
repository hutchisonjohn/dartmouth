# 🧪 COMPREHENSIVE MANUAL TEST SCRIPT
## McCarthy Artwork Agent - All Features

**URL:** https://artwork-analyser-ai-agent-1qo.pages.dev  
**Prerequisites:** Upload an artwork file (PNG or PDF, preferably 2811x2539 pixels at 300 DPI)

---

## 1️⃣ GREETING & PERSONALITY (5 tests)

### Test 1.1: Basic Greeting
**Input:** `Hi`  
**Expected:** "Hey! 👋 I'm McCarthy, your artwork assistant. I can see your artwork is uploaded and analyzed. What would you like to know about it?"  
**Result:** ___________

### Test 1.2: Formal Greeting
**Input:** `Good morning`  
**Expected:** Friendly McCarthy greeting with personality  
**Result:** ___________

### Test 1.3: Casual Greeting
**Input:** `hey there`  
**Expected:** McCarthy introduces himself, mentions artwork is uploaded  
**Result:** ___________

### Test 1.4: Multiple Greetings
**Input:** `hello hello`  
**Expected:** McCarthy greeting (should not repeat)  
**Result:** ___________

### Test 1.5: Greeting After Conversation
**Input:** (After asking other questions) `hi again`  
**Expected:** Brief acknowledgment, not full introduction  
**Result:** ___________

---

## 2️⃣ DPI CALCULATIONS - WIDTH ONLY (5 tests)

### Test 2.1: Standard Width (CM)
**Input:** `if i change my artwork to be 28.5 cm wide, what will the DPI be?`  
**Expected:** "At **28.5 × 25.7 cm** (11.22" × 10.13"), your DPI would be **251**. ✨ **Quality: Optimal**"  
**Result:** ___________

### Test 2.2: Different Width (CM)
**Input:** `what if it was 29.2 cm wide?`  
**Expected:** "At **29.2 × 26.4 cm**, your DPI would be **245**. 👌 **Quality: Good**"  
**Result:** ___________

### Test 2.3: Large Width (CM)
**Input:** `and 35.8 cm wide?`  
**Expected:** "At **35.8 × 32.3 cm**, your DPI would be **199**. ⚠️ **Quality: Poor**"  
**Result:** ___________

### Test 2.4: Small Width (CM)
**Input:** `what about 20 cm wide?`  
**Expected:** DPI calculation with "Optimal" quality (should be >250 DPI)  
**Result:** ___________

### Test 2.5: Width in Inches
**Input:** `if the width is 11 inches, what's the DPI?`  
**Expected:** DPI calculation with dimensions in both CM and inches  
**Result:** ___________

---

## 3️⃣ DPI CALCULATIONS - FULL DIMENSIONS (5 tests)

### Test 3.1: Both Dimensions (CM)
**Input:** `what's the DPI if my artwork is 30 cm wide by 27 cm high?`  
**Expected:** DPI calculation for 30x27 cm with quality rating  
**Result:** ___________

### Test 3.2: Both Dimensions (Inches)
**Input:** `what if it's 12 inches by 10 inches?`  
**Expected:** DPI calculation with both CM and inches shown  
**Result:** ___________

### Test 3.3: Square Dimensions
**Input:** `what about 25 cm by 25 cm?`  
**Expected:** DPI calculation (note: will distort aspect ratio)  
**Result:** ___________

### Test 3.4: Very Large Dimensions
**Input:** `what if it's 50 cm wide by 45 cm high?`  
**Expected:** Low DPI with "Poor" quality warning  
**Result:** ___________

### Test 3.5: Very Small Dimensions
**Input:** `what about 15 cm by 13.5 cm?`  
**Expected:** High DPI with "Optimal" quality  
**Result:** ___________

---

## 4️⃣ STANDARD DPI LOOKUPS (5 tests)

### Test 4.1: 300 DPI Size
**Input:** `what size can I print at 300 DPI?`  
**Expected:** "At 300 DPI: 23.8 × 21.5 cm (9.37" × 8.46")"  
**Result:** ___________

### Test 4.2: 250 DPI Size
**Input:** `what about 250 DPI?`  
**Expected:** "At 250 DPI: 28.6 × 25.8 cm (11.24" × 10.16")"  
**Result:** ___________

### Test 4.3: 200 DPI Size
**Input:** `and 200 DPI?`  
**Expected:** "At 200 DPI: 35.7 × 32.2 cm (14.06" × 12.70")"  
**Result:** ___________

### Test 4.4: 150 DPI Size
**Input:** `what size at 150 DPI?`  
**Expected:** "At 150 DPI: 47.6 × 43.0 cm (18.74" × 16.93")"  
**Result:** ___________

### Test 4.5: Multiple DPI Query
**Input:** `show me sizes for 300, 250, and 200 DPI`  
**Expected:** List of all three sizes with quality ratings  
**Result:** ___________

---

## 5️⃣ TRANSPARENCY ANALYSIS (5 tests)

### Test 5.1: Basic Transparency Query
**Input:** `does my artwork have transparency?`  
**Expected:** "No" or "Yes" with percentage details  
**Result:** ___________

### Test 5.2: Alpha Channel Query
**Input:** `is there an alpha channel?`  
**Expected:** Alpha channel status with transparency stats  
**Result:** ___________

### Test 5.3: DTF Transparency Check
**Input:** `is my artwork transparent enough for DTF?`  
**Expected:** Transparency analysis + DTF requirement (100% opaque)  
**Result:** ___________

### Test 5.4: Semi-Transparent Pixels
**Input:** `are there any semi-transparent pixels?`  
**Expected:** Count/percentage of semi-transparent pixels  
**Result:** ___________

### Test 5.5: Opacity Percentage
**Input:** `what percentage of my artwork is opaque?`  
**Expected:** Opacity percentage (should be from alphaStats)  
**Result:** ___________

---

## 6️⃣ COLOR INFORMATION (5 tests)

### Test 6.1: Top Colors
**Input:** `what are the main colors in my artwork?`  
**Expected:** List of top 5 colors with RGB, hex, and percentages  
**Result:** ___________

### Test 6.2: Specific Color Query
**Input:** `what's the most common color?`  
**Expected:** Top color with RGB, hex, and percentage  
**Result:** ___________

### Test 6.3: Color Palette
**Input:** `show me the color palette`  
**Expected:** List of colors with hex codes  
**Result:** ___________

### Test 6.4: Color Percentages
**Input:** `what percentage is each color?`  
**Expected:** Colors with their percentages  
**Result:** ___________

### Test 6.5: RGB Values
**Input:** `give me the RGB values of the main colors`  
**Expected:** Colors with RGB values  
**Result:** ___________

---

## 7️⃣ FILE INFORMATION (5 tests)

### Test 7.1: File Size
**Input:** `how big is my file?`  
**Expected:** File size (e.g., "10.37 MB")  
**Result:** ___________

### Test 7.2: Dimensions
**Input:** `what are the dimensions?`  
**Expected:** "2811 × 2539 pixels" or similar  
**Result:** ___________

### Test 7.3: File Type
**Input:** `what type of file is this?`  
**Expected:** "PNG" or "PDF" or file type  
**Result:** ___________

### Test 7.4: Bit Depth
**Input:** `what's the bit depth?`  
**Expected:** "8-bit" or bit depth value  
**Result:** ___________

### Test 7.5: ICC Profile
**Input:** `does it have an ICC profile?`  
**Expected:** ICC profile status (embedded or not)  
**Result:** ___________

---

## 8️⃣ DTF KNOWLEDGE BASE (5 tests)

### Test 8.1: Minimum Text Size
**Input:** `what is the minimum text size for DTF?`  
**Expected:** "8pt or 2.5mm" from knowledge base  
**Result:** ___________

### Test 8.2: Minimum Line Thickness
**Input:** `what's the minimum line thickness?`  
**Expected:** "1mm" from knowledge base  
**Result:** ___________

### Test 8.3: DTF Requirements
**Input:** `what are the DTF requirements?`  
**Expected:** List of requirements (DPI, transparency, text size, etc.)  
**Result:** ___________

### Test 8.4: Transparency Rules
**Input:** `what are the transparency rules for DTF?`  
**Expected:** "100% opaque required" from knowledge base  
**Result:** ___________

### Test 8.5: Recommended DPI
**Input:** `what DPI is recommended for DTF printing?`  
**Expected:** "300 DPI" from knowledge base  
**Result:** ___________

---

## 9️⃣ UV DTF KNOWLEDGE BASE (5 tests)

### Test 9.1: UV DTF vs Regular DTF
**Input:** `what's the difference between UV DTF and regular DTF?`  
**Expected:** Explanation from knowledge base  
**Result:** ___________

### Test 9.2: UV DTF Text Size
**Input:** `what's the minimum text size for UV DTF?`  
**Expected:** "2mm" from knowledge base  
**Result:** ___________

### Test 9.3: UV DTF Line Thickness
**Input:** `what's the minimum line thickness for UV DTF?`  
**Expected:** "0.5-1mm" from knowledge base  
**Result:** ___________

### Test 9.4: UV DTF Applications
**Input:** `what can UV DTF be used for?`  
**Expected:** Applications from knowledge base  
**Result:** ___________

### Test 9.5: UV DTF Requirements
**Input:** `what are UV DTF artwork requirements?`  
**Expected:** List of UV DTF specific requirements  
**Result:** ___________

---

## 🔟 DPI QUALITY STANDARDS (5 tests)

### Test 10.1: Optimal Quality
**Input:** `what DPI is considered optimal quality?`  
**Expected:** "250 DPI or higher" from knowledge base  
**Result:** ___________

### Test 10.2: Good Quality
**Input:** `what's good quality DPI?`  
**Expected:** "200-249 DPI" from knowledge base  
**Result:** ___________

### Test 10.3: Poor Quality
**Input:** `when is DPI considered poor?`  
**Expected:** "Below 200 DPI" from knowledge base  
**Result:** ___________

### Test 10.4: Quality Explanation
**Input:** `why does DPI matter for print quality?`  
**Expected:** Explanation from knowledge base  
**Result:** ___________

### Test 10.5: DPI Recommendation
**Input:** `what DPI should I use for professional printing?`  
**Expected:** "300 DPI" recommendation  
**Result:** ___________

---

## 1️⃣1️⃣ HOW-TO INSTRUCTIONS (5 tests)

### Test 11.1: Resize Artwork
**Input:** `how do I resize my artwork?`  
**Expected:** Step-by-step instructions for resizing  
**Result:** ___________

### Test 11.2: Change DPI
**Input:** `how do I change the DPI in Photoshop?`  
**Expected:** Photoshop DPI change instructions  
**Result:** ___________

### Test 11.3: Fix Transparency
**Input:** `how do I fix transparency issues?`  
**Expected:** Instructions for fixing transparency  
**Result:** ___________

### Test 11.4: Convert Color Profile
**Input:** `how do I convert to sRGB?`  
**Expected:** Color profile conversion instructions  
**Result:** ___________

### Test 11.5: Prepare for DTF
**Input:** `how do I prepare my artwork for DTF printing?`  
**Expected:** DTF preparation checklist/steps  
**Result:** ___________

---

## 1️⃣2️⃣ CONSTRAINT ENFORCEMENT (5 tests)

### Test 12.1: Pricing Question
**Input:** `how much does this cost?`  
**Expected:** "Please contact our sales team" (NO pricing info)  
**Result:** ___________

### Test 12.2: Discount Request
**Input:** `can I get a discount?`  
**Expected:** "Please contact our sales team" (NO discount info)  
**Result:** ___________

### Test 12.3: Refund Question
**Input:** `how do I get a refund?`  
**Expected:** "Please contact support" (NO refund processing)  
**Result:** ___________

### Test 12.4: Payment Question
**Input:** `what payment methods do you accept?`  
**Expected:** Redirect to sales/website (NO payment info)  
**Result:** ___________

### Test 12.5: Order Status
**Input:** `where is my order?`  
**Expected:** Redirect to support (stays in scope - artwork only)  
**Result:** ___________

---

## 1️⃣3️⃣ CONTEXT RETENTION (5 tests)

### Test 13.1: Follow-up Without Context
**Input:** (After DPI question) `and what about 30 cm?`  
**Expected:** Understands "30 cm" refers to width, calculates DPI  
**Result:** ___________

### Test 13.2: Pronoun Reference
**Input:** (After transparency question) `is that good for DTF?`  
**Expected:** Understands "that" refers to transparency status  
**Result:** ___________

### Test 13.3: Multiple Follow-ups
**Input:** Ask 3 DPI questions in a row with "and", "also", "what about"  
**Expected:** All answers correctly with context maintained  
**Result:** ___________

### Test 13.4: Topic Switch
**Input:** Ask about DPI, then colors, then back to DPI  
**Expected:** Remembers previous DPI context  
**Result:** ___________

### Test 13.5: Artwork Memory
**Input:** (Close chat, reopen) `what's my artwork's DPI?`  
**Expected:** Remembers artwork data from session  
**Result:** ___________

---

## 1️⃣4️⃣ NATURAL LANGUAGE UNDERSTANDING (5 tests)

### Test 14.1: Casual Language
**Input:** `yo, what's the dpi if i make it like 28 cm wide?`  
**Expected:** Understands and calculates DPI  
**Result:** ___________

### Test 14.2: Incomplete Sentence
**Input:** `28.5 cm wide dpi?`  
**Expected:** Understands and calculates DPI  
**Result:** ___________

### Test 14.3: Multiple Questions
**Input:** `what's the DPI at 28 cm and also what are the colors?`  
**Expected:** Answers both questions  
**Result:** ___________

### Test 14.4: Typos
**Input:** `waht is teh dpi at 28cm wdie?`  
**Expected:** Understands despite typos  
**Result:** ___________

### Test 14.5: Colloquial Phrasing
**Input:** `if i wanna print this at like 30 cm, what dpi am i looking at?`  
**Expected:** Understands and calculates DPI  
**Result:** ___________

---

## 1️⃣5️⃣ ERROR HANDLING (5 tests)

### Test 15.1: Invalid Dimension
**Input:** `what's the DPI at -5 cm wide?`  
**Expected:** Error message or clarification request  
**Result:** ___________

### Test 15.2: Nonsense Query
**Input:** `asdfghjkl qwerty`  
**Expected:** "I'm not sure what you're asking" or similar  
**Result:** ___________

### Test 15.3: Off-Topic Question
**Input:** `what's the weather like?`  
**Expected:** Politely redirects to artwork topics  
**Result:** ___________

### Test 15.4: Empty Message
**Input:** (Send blank message)  
**Expected:** Handles gracefully or prompts for input  
**Result:** ___________

### Test 15.5: Very Long Message
**Input:** (Send 500+ word message)  
**Expected:** Handles gracefully, extracts intent  
**Result:** ___________

---

## 1️⃣6️⃣ RESPONSE QUALITY (5 tests)

### Test 16.1: Conciseness
**Input:** `what's the DPI at 28.5 cm wide?`  
**Expected:** 2-3 sentences MAX  
**Result:** ___________

### Test 16.2: Formatting
**Input:** (Any calculation question)  
**Expected:** Bold numbers, emojis for quality, proper markdown  
**Result:** ___________

### Test 16.3: Accuracy
**Input:** `what's the DPI at 28.5 cm wide?`  
**Expected:** Exactly 251 DPI (±1 tolerance)  
**Result:** ___________

### Test 16.4: Completeness
**Input:** `what's the DPI at 28.5 cm wide?`  
**Expected:** Includes CM, inches, DPI, and quality rating  
**Result:** ___________

### Test 16.5: Personality
**Input:** (Any question)  
**Expected:** Friendly, helpful, professional but approachable  
**Result:** ___________

---

## 📊 SCORING

**Total Tests:** 80 tests  
**Passed:** _____ / 80  
**Failed:** _____ / 80  
**Pass Rate:** _____ %

### Pass Rate Interpretation:
- **90-100%:** ✅ Excellent - Production ready
- **80-89%:** ✅ Good - Minor issues only
- **70-79%:** ⚠️ Fair - Some issues need fixing
- **60-69%:** ⚠️ Poor - Multiple issues need fixing
- **<60%:** ❌ Critical - Major issues, not production ready

---

## 🎯 CRITICAL FEATURES (Must Pass)

These 10 tests MUST pass for production:
1. Test 1.1 - Basic Greeting ✅/❌
2. Test 2.1 - DPI Calculation (Width) ✅/❌
3. Test 3.1 - DPI Calculation (Full) ✅/❌
4. Test 4.1 - Standard DPI Lookup ✅/❌
5. Test 5.1 - Transparency Check ✅/❌
6. Test 6.1 - Color Information ✅/❌
7. Test 8.3 - DTF Requirements ✅/❌
8. Test 12.1 - Pricing Constraint ✅/❌
9. Test 13.1 - Context Retention ✅/❌
10. Test 16.3 - Calculation Accuracy ✅/❌

**Critical Pass Rate:** _____ / 10

---

**Date:** __________  
**Tester:** __________  
**Artwork Used:** __________  
**Notes:** __________


