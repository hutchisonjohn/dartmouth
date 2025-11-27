# 🧪 McCarthy Artwork Agent - Manual Testing Checklist

## 🎯 Quick Verification (5 minutes)

Use this checklist to verify the agent is working correctly after any changes.

**Test Site:** https://artwork-analyser-ai-agent-1qo.pages.dev

---

## ✅ PRE-TEST SETUP

- [ ] Open the site in a **fresh incognito/private window** (clears session)
- [ ] Have an artwork file ready (e.g., SUMMERVIBES.png or dots per inch 1.png)
- [ ] Upload the artwork

---

## 🎨 TEST 1: GREETING (Custom Handler)

**Test:** Type `hi`

**Expected:**
```
Hey! 👋 I'm McCarthy, your artwork assistant.

I can see your artwork is uploaded and analyzed.

What would you like to know about it?
• DPI and print sizes?
• Transparency or DTF issues?
• Colors and quality?
• Something else?
```

**✅ Pass Criteria:**
- [ ] Says "I'm McCarthy"
- [ ] Acknowledges artwork is uploaded
- [ ] Provides helpful options
- [ ] Friendly tone with emoji

---

## 🔢 TEST 2: DPI CALCULATION (Handler-Based, No LLM)

**Test:** Type `what dpi at 28.5 cm wide?`

**Expected (for SUMMERVIBES.png 2811×2539):**
```
At **28.5 × 25.7 cm** (11.22" × 10.13"), your DPI would be **251**. ✨ **Quality: Optimal**
```

**✅ Pass Criteria:**
- [ ] Shows exact dimensions (28.5 × 25.7 cm)
- [ ] Shows DPI = 251 (±1)
- [ ] Shows inches in parentheses
- [ ] Shows quality rating (Optimal ✨)
- [ ] Response is concise (1-2 sentences)

---

## 🔄 TEST 3: FOLLOW-UP QUESTION (Context Retention)

**Test:** Type `and if it was 29.2 cm wide?`

**Expected:**
```
At **29.2 × 26.4 cm** (11.5" × 10.38"), your DPI would be **245**. 👌 **Quality: Good**
```

**✅ Pass Criteria:**
- [ ] Understands "and if it was" (context)
- [ ] Calculates new DPI = 245 (±1)
- [ ] Shows quality rating (Good 👌)
- [ ] Doesn't ask "what artwork?"

---

## 🔄 TEST 4: ANOTHER FOLLOW-UP (No Context Loss)

**Test:** Type `and 35.8 cm wide?`

**Expected:**
```
At **35.8 × 32.3 cm** (14.09" × 12.73"), your DPI would be **199**. ⚠️ **Quality: Poor**
```

**✅ Pass Criteria:**
- [ ] Still understands context
- [ ] Calculates DPI = 199 (±1)
- [ ] Shows quality rating (Poor ⚠️)
- [ ] No confusion or errors

---

## 💬 TEST 5: NATURAL LANGUAGE (Pattern Matching)

**Test:** Type `if i change my artwork to be 30 cm wide, what will the DPI be?`

**Expected:**
```
At **30.0 × 27.1 cm** (11.81" × 10.67"), your DPI would be **238**. 👌 **Quality: Good**
```

**✅ Pass Criteria:**
- [ ] Understands natural language phrasing
- [ ] Extracts "30 cm wide"
- [ ] Calculates correct DPI = 238 (±1)
- [ ] Shows quality rating

---

## 🚫 TEST 6: CONSTRAINT ENFORCEMENT (No Pricing)

**Test:** Type `how much does this cost?`

**Expected:**
```
I can't discuss pricing directly. Please contact our sales team for a quote.
```

**✅ Pass Criteria:**
- [ ] Does NOT mention any prices
- [ ] Redirects to sales team
- [ ] Professional tone

---

## 📊 TEST 7: INFORMATION QUERY

**Test:** Type `what colors are in my artwork?`

**Expected:**
- Should list top colors with RGB and hex values
- Should reference artwork data from memory

**✅ Pass Criteria:**
- [ ] Provides color information
- [ ] Shows RGB and hex values
- [ ] References the uploaded artwork

---

## 👋 TEST 8: FAREWELL

**Test:** Type `thanks bye`

**Expected:**
```
Take care! I'm here anytime you need help with artwork. 🎨
```

**✅ Pass Criteria:**
- [ ] Friendly farewell
- [ ] Mentions artwork (stays in character)
- [ ] Appropriate emoji

---

## 📈 EXPECTED DPI RESULTS (for SUMMERVIBES.png 2811×2539)

| Width (cm) | Expected DPI | Quality | Emoji |
|------------|--------------|---------|-------|
| 10.0       | 713          | Optimal | ✨    |
| 20.0       | 357          | Optimal | ✨    |
| 23.8       | 300          | Optimal | ✨    |
| 25.0       | 285          | Optimal | ✨    |
| 28.5       | 251          | Optimal | ✨    |
| 29.2       | 245          | Good    | 👌    |
| 30.0       | 238          | Good    | 👌    |
| 35.0       | 204          | Good    | 👌    |
| 35.8       | 199          | Poor    | ⚠️    |
| 40.0       | 178          | Poor    | ⚠️    |
| 50.0       | 143          | Poor    | ⚠️    |

---

## 🐛 COMMON ISSUES & FIXES

### Issue: "I need artwork data to calculate DPI"
**Cause:** Artwork data not being stored in session  
**Check:** 
1. Is artwork actually uploaded?
2. Check Cloudflare Worker logs for JSON parsing errors
3. Verify `this.stateManager.saveSession()` is being called

### Issue: Generic response instead of calculation
**Cause:** Handler not being triggered  
**Check:**
1. Intent detection (should be 'calculation')
2. Handler's `canHandle()` method
3. Check if LLM fallback is being used

### Issue: Wrong DPI calculation
**Cause:** Incorrect formula or aspect ratio  
**Check:**
1. Artwork dimensions (should be 2811×2539)
2. Aspect ratio calculation
3. DPI formula: pixels / (cm / 2.54)

---

## ✅ QUICK PASS/FAIL

**ALL 8 TESTS PASSED?**
- ✅ **YES** → Agent is working correctly! 🎉
- ❌ **NO** → Review failed tests and check logs

---

## 🚀 DEPLOYMENT VERIFICATION

After deploying changes, run this checklist to verify:
1. ✅ Custom greeting works
2. ✅ DPI calculations are accurate
3. ✅ Follow-up questions work
4. ✅ Natural language is understood
5. ✅ Constraints are enforced
6. ✅ No errors or crashes

**Time:** ~5 minutes  
**Confidence:** High (real-world testing)

---

**Last Updated:** 2025-11-26  
**Version:** 1.0.0


