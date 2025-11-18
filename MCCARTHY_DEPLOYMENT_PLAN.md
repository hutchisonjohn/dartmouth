# 🚀 McCarthy Artwork Agent - Deployment Plan

**Date:** November 18, 2025  
**Status:** Ready to Execute  
**Backup Policy:** ✅ Must backup after completion

---

## 📋 **EXECUTION PLAN**

### **Phase 1: Use Existing Widget UI** ✅
**Goal:** Use Artwork Analyser's production UI as the "skin" for Dartmouth McCarthy Agent

**Actions:**
1. Keep existing Dartmouth test interface at `https://dartmouth-chat.pages.dev`
2. NO CHANGES to widget needed - test interface already working
3. User will test via existing test interface

**Status:** ✅ COMPLETE - Test interface already deployed and working

---

### **Phase 2: Deploy McCarthy Artwork Agent** ⏳
**Goal:** Deploy McCarthy Artwork Agent to production Dartmouth worker

**Actions:**
1. Register McCarthy Artwork Agent with BaseAgent/routing system
2. Deploy worker to Cloudflare
3. Verify health endpoint
4. Test basic chat functionality

**Estimated Time:** 15-20 minutes

---

### **Phase 3: Automated Testing** ⏳
**Goal:** Create and run automated test suite

**Test Scenarios:**
1. **Greeting Tests**
   - "Hello!"
   - "Hi there!"
   - "Hey McCarthy!"

2. **Calculation Tests**
   - "What size can I print 4000x6000 pixels at 300 DPI?"
   - "If I have a 10x15 inch print at 150 DPI, how many pixels?"
   - "What's the DPI of 1920x1080 pixels printed at 8x10 inches?"

3. **How-To Tests**
   - "How do I prepare artwork for DTF printing?"
   - "What file format should I use?"
   - "How do I check if my artwork is high enough quality?"

4. **Information Tests**
   - "What is DTF printing?"
   - "What's the difference between DTF and UV DTF?"
   - "Tell me about DPI standards"

5. **Constraint Tests** (Should Refuse)
   - "How much does DTF printing cost?"
   - "Do you offer discounts?"
   - "Can I get a refund?"

6. **Memory Tests**
   - Multi-turn conversation with context
   - Name remembering
   - Topic tracking

7. **Frustration Tests**
   - Repeated questions
   - Confusion signals
   - Multi-question handling

**Estimated Time:** 30 minutes to build, 10 minutes to run

---

### **Phase 4: Manual Testing** ⏳
**Goal:** User tests manually with real-world scenarios

**Manual Test Plan for User:**
```
🧪 MANUAL TEST PLAN - McCarthy Artwork Agent

Test URL: https://dartmouth-chat.pages.dev

### Test 1: Basic Greeting
- Type: "Hello!"
- Expected: Warm, friendly greeting from McCarthy
- ✅ Pass / ❌ Fail

### Test 2: DPI Calculation
- Type: "I have an image that's 3000x2000 pixels. What size can I print it at 300 DPI?"
- Expected: Accurate calculation (10x6.67 inches), quality rating, recommendations
- ✅ Pass / ❌ Fail

### Test 3: Size to Pixels Calculation
- Type: "If I want to print at 12x18 inches at 150 DPI, how many pixels do I need?"
- Expected: Accurate calculation (1800x2700 pixels)
- ✅ Pass / ❌ Fail

### Test 4: DTF Knowledge (without RAG initially)
- Type: "What is the minimum text size for DTF printing?"
- Expected: Should try to answer or say it needs knowledge base
- ✅ Pass / ❌ Fail

### Test 5: Artwork Preparation
- Type: "How should I prepare my artwork for printing?"
- Expected: Helpful guidance on file format, resolution, color mode
- ✅ Pass / ❌ Fail

### Test 6: Constraint Enforcement (Pricing)
- Type: "How much does it cost to print?"
- Expected: Polite refusal, redirect to sales team/website
- ✅ Pass / ❌ Fail

### Test 7: Constraint Enforcement (Discounts)
- Type: "Can I get a discount?"
- Expected: Polite refusal, maybe mention bulk pricing exists but don't quote
- ✅ Pass / ❌ Fail

### Test 8: Memory & Context
- Type: "My name is John"
- Then: "What's my name?"
- Expected: Remembers "John"
- ✅ Pass / ❌ Fail

### Test 9: Multi-Turn Conversation
- Type: "I need help with artwork"
- Then: "What DPI should I use?"
- Then: "What about file format?"
- Expected: Maintains context, remembers you're asking about artwork
- ✅ Pass / ❌ Fail

### Test 10: Frustration Handling
- Type: "This is confusing"
- Expected: Empathetic response, offers to clarify
- ✅ Pass / ❌ Fail
```

**Estimated Time:** 20 minutes

---

### **Phase 5: Fix Issues** ⏳
**Goal:** Fix any bugs/issues found in testing

**Expected Issues:**
- None expected (foundation is solid from Phase 5.5)
- Possible: Handler registration issues
- Possible: Constraint enforcement edge cases

**Estimated Time:** 15-30 minutes (if issues found)

---

### **Phase 6: Load RAG Knowledge Base** ⏳
**Goal:** Load DTF knowledge documents to make McCarthy smarter

**Actions:**
1. Run knowledge base loader script
2. Verify embeddings created
3. Test RAG retrieval
4. Test McCarthy can answer specific DTF questions

**Documents to Load:**
- DTF_Artwork_Requirements.md (3,878 chars)
- UV_DTF_Artwork_Requirements.md (3,320 chars)
- DPI_QUALITY_STANDARDS.md (6,651 chars)

**Estimated Time:** 10-15 minutes

---

### **Phase 7: Re-Test with Knowledge** ⏳
**Goal:** Verify McCarthy is smarter with knowledge base

**Test Scenarios:**
- "What is the minimum text size for DTF?"
- "Can I use gradients in UV DTF?"
- "What DPI is recommended for banners?"
- "What color mode should I use for DTF?"
- "How do I handle transparent backgrounds?"

**Both automated and manual tests**

**Estimated Time:** 20 minutes

---

### **Phase 8: Fix RAG Issues** ⏳
**Goal:** Fix any RAG integration issues

**Potential Issues:**
- Retrieval not working
- Wrong context being returned
- Citations missing
- Relevance scoring too strict/loose

**Estimated Time:** 15-30 minutes (if issues found)

---

### **Phase 9: Backup to GitHub** ✅ **MANDATORY**
**Goal:** Backup all work per backup policy

**Actions:**
```bash
cd D:\coding\agent-army-system
git add .
git commit -m "Phase 6 COMPLETE: McCarthy Artwork Agent deployed and tested with knowledge base"
git push origin master
```

**Estimated Time:** 5 minutes

---

## 📊 **TOTAL ESTIMATED TIME**

**Minimum:** 1.5 hours (no issues)  
**Maximum:** 2.5 hours (with issue fixing)  
**Expected:** 2 hours

---

## ✅ **SUCCESS CRITERIA**

### **Phase Completion:**
- [⏳] Phase 1: UI Ready (already complete)
- [⏳] Phase 2: Agent Deployed
- [⏳] Phase 3: Automated Tests Pass (95%+)
- [⏳] Phase 4: Manual Tests Pass (90%+)
- [⏳] Phase 5: Issues Fixed
- [⏳] Phase 6: Knowledge Base Loaded
- [⏳] Phase 7: Re-Tests Pass (95%+)
- [⏳] Phase 8: RAG Issues Fixed
- [⏳] Phase 9: Backed Up to GitHub

### **Quality Criteria:**
- ✅ McCarthy responds with personality
- ✅ Calculations are accurate
- ✅ Constraints are enforced
- ✅ Memory works across turns
- ✅ Knowledge base provides relevant answers
- ✅ Citations included where appropriate
- ✅ No hallucinations on facts

---

## 🎯 **NEXT STEP**

**START HERE:** Phase 2 - Deploy McCarthy Artwork Agent

**Command:**
```bash
cd packages/worker
npm run deploy
```

---

**Ready to execute!** 🚀

