# 🗺️ ISSUE LOCATION MAPPING
## Where Do The 11 Critical Issues Actually Exist?

**Date:** 2025-11-27  
**Purpose:** Map each discovered issue to its actual location in the codebase

---

## 🏗️ ARCHITECTURE OVERVIEW

```
Dartmouth OS (Platform)
├── packages/worker/src/
│   ├── BaseAgent.ts ..................... FAM (Foundational Agent McCarthy)
│   ├── handlers/
│   │   ├── FallbackHandler.ts ........... 🔴 ISSUE #11 HERE
│   │   ├── GreetingHandler.ts
│   │   └── RepeatHandler.ts
│   ├── components/
│   │   ├── IntentDetector.ts ............ 🔴 ISSUE #5, #6 HERE
│   │   ├── ResponseRouter.ts
│   │   ├── RAGEngine.ts
│   │   └── LLMService.ts ................ 🔴 ISSUE #10 HERE (system prompt)
│   └── services/
│       └── LLMService.ts
│
└── packages/mccarthy-artwork/src/
    ├── McCarthyArtworkAgent.ts .......... 🔴 ISSUE #10 HERE (system prompt)
    ├── handlers/
    │   ├── SizeCalculationHandler.ts .... 🔴 ISSUE #7 HERE
    │   ├── InformationHandler.ts ........ 🔴 ISSUE #1, #3, #4 HERE
    │   └── HowToHandler.ts .............. 🔴 ISSUE #8 HERE
    ├── knowledge/
    │   ├── DPI_QUALITY_STANDARDS.md ..... ✅ RAG document (correct info)
    │   ├── DTF_Artwork_Requirements.md .. ✅ RAG document (correct info)
    │   └── UV_DTF_Artwork_Requirements.md ✅ RAG document (correct info)
    └── constraints.ts
```

---

## 📍 ISSUE-BY-ISSUE BREAKDOWN

### **ISSUE #1: Hallucinating ICC Profile Information** 🔴
**Symptom:** Agent says "Yes, your artwork has an ICC profile" when data says "No"

**Location:** 
- **Primary:** `packages/worker/src/handlers/FallbackHandler.ts`
- **Secondary:** `packages/worker/src/services/LLMService.ts` (system prompt)

**Why:**
- FallbackHandler doesn't query RAG or artwork data
- LLM is making up information not in context
- No validation against artwork analysis data

**Fix Required:**
1. FallbackHandler: Add RAG query before LLM call
2. LLMService: Strengthen system prompt constraints
3. Add response validation against artwork data

**Layer:** FAM (Foundational Agent McCarthy) - Platform Level

---

### **ISSUE #2: Inconsistent DPI Quality Ratings** 🔴
**Symptom:** Same question, different answers ("200-300 DPI" then "200-250 DPI")

**Location:**
- **Primary:** `packages/mccarthy-artwork/src/handlers/InformationHandler.ts`
- **Secondary:** `packages/worker/src/handlers/FallbackHandler.ts`

**Why:**
- InformationHandler not being triggered for DPI quality questions
- FallbackHandler generating responses without consulting RAG
- No consistency checking across responses

**Fix Required:**
1. InformationHandler: Add patterns for DPI quality questions
2. FallbackHandler: Query RAG for DPI_QUALITY_STANDARDS.md
3. Add memory-based consistency checking

**Layer:** Artwork Analyzer Agent (Agent-Specific) + FAM (Platform)

---

### **ISSUE #3: Not Consulting RAG Documents** 🔴
**Symptom:** Agent makes up answers instead of reading knowledge base

**Location:**
- **Primary:** `packages/worker/src/handlers/FallbackHandler.ts`
- **Secondary:** `packages/mccarthy-artwork/src/handlers/InformationHandler.ts`

**Why:**
- FallbackHandler doesn't have RAG integration
- InformationHandler pattern matching too narrow (doesn't catch questions)
- Questions fall through to fallback, which doesn't query RAG

**Fix Required:**
1. FallbackHandler: Add RAG query before responding
2. InformationHandler: Expand pattern matching
3. Ensure RAG is always consulted for technical questions

**Layer:** FAM (Platform Level) - affects ALL agents

---

### **ISSUE #4: Wrong UV DTF Information** 🔴
**Symptom:** Says UV DTF for apparel when it's ONLY hard substrates

**Location:**
- **Primary:** `packages/mccarthy-artwork/src/handlers/InformationHandler.ts`
- **Secondary:** `packages/worker/src/handlers/FallbackHandler.ts`

**Why:**
- InformationHandler not triggered for "what can UV DTF be used for?"
- FallbackHandler LLM making up plausible-sounding but wrong answer
- RAG document `UV_DTF_Artwork_Requirements.md` has correct info but not being read

**Fix Required:**
1. InformationHandler: Add pattern for UV DTF usage questions
2. FallbackHandler: Query RAG before LLM
3. Validate responses against RAG

**Layer:** Artwork Analyzer Agent (Agent-Specific) + FAM (Platform)

---

### **ISSUE #5: Ignoring User Corrections** 🔴
**Symptom:** Continues giving wrong answers after user says "wrong"

**Location:**
- **Primary:** `packages/worker/src/components/IntentDetector.ts`
- **Secondary:** `packages/worker/src/handlers/FallbackHandler.ts`

**Why:**
- IntentDetector doesn't have "correction" intent type
- No feedback loop to re-query RAG when corrected
- Agent doesn't understand "wrong", "no", "incorrect" as correction signals

**Fix Required:**
1. IntentDetector: Add "correction" intent type
2. FallbackHandler: Detect correction language, re-query RAG
3. Add feedback loop mechanism

**Layer:** FAM (Platform Level) - affects ALL agents

---

### **ISSUE #6: Confusing Size vs File Size** 🔴
**Symptom:** "How big is my file?" triggers size calculator instead of file info

**Location:**
- **Primary:** `packages/worker/src/components/IntentDetector.ts`
- **Secondary:** `packages/mccarthy-artwork/src/handlers/InformationHandler.ts`

**Why:**
- IntentDetector can't distinguish "file size" from "print size"
- Both contain word "size" so pattern matching fails
- No "file_info" intent type

**Fix Required:**
1. IntentDetector: Add "file_info" intent type
2. IntentDetector: Improve disambiguation logic
3. InformationHandler: Add file information patterns

**Layer:** FAM (Platform Level) + Artwork Analyzer Agent (Agent-Specific)

---

### **ISSUE #7: Can't Answer "What size for X DPI"** 🔴
**Symptom:** Reverse calculation not working (DPI → size)

**Location:**
- **Primary:** `packages/mccarthy-artwork/src/handlers/SizeCalculationHandler.ts`

**Why:**
- SizeCalculationHandler only handles forward calculation (size → DPI)
- Pattern matching doesn't include reverse calculation patterns
- Missing logic to calculate size from DPI

**Fix Required:**
1. SizeCalculationHandler: Add reverse calculation patterns
2. SizeCalculationHandler: Implement calculateSizeForDPI() method
3. Add "reverse_calculation" intent type

**Layer:** Artwork Analyzer Agent (Agent-Specific)

---

### **ISSUE #8: Generic Responses to Specific Questions** 🔴
**Symptom:** "How do I resize?" → "I need more information"

**Location:**
- **Primary:** `packages/mccarthy-artwork/src/handlers/HowToHandler.ts`
- **Secondary:** `packages/worker/src/handlers/FallbackHandler.ts`

**Why:**
- HowToHandler pattern matching too narrow
- Missing common "how do I..." patterns
- Questions fall through to fallback

**Fix Required:**
1. HowToHandler: Add common patterns (resize, change DPI, fix transparency, etc.)
2. HowToHandler: Query RAG for how-to instructions
3. Expand pattern matching

**Layer:** Artwork Analyzer Agent (Agent-Specific)

---

### **ISSUE #9: Handler Pattern Matching Too Narrow** 🔴
**Symptom:** Many common questions not recognized by handlers

**Location:**
- **Primary:** `packages/mccarthy-artwork/src/handlers/SizeCalculationHandler.ts`
- **Primary:** `packages/mccarthy-artwork/src/handlers/InformationHandler.ts`
- **Primary:** `packages/mccarthy-artwork/src/handlers/HowToHandler.ts`

**Why:**
- Handlers only match exact phrasings
- Missing common variations
- No fuzzy matching or semantic understanding

**Fix Required:**
1. All handlers: Expand pattern matching
2. Add more natural language variations
3. Consider semantic matching (future)

**Layer:** Artwork Analyzer Agent (Agent-Specific)

---

### **ISSUE #10: LLM Fallback Making Things Up** 🔴
**Symptom:** Inventing "industry standards" instead of citing RAG

**Location:**
- **Primary:** `packages/worker/src/services/LLMService.ts` (system prompt)
- **Secondary:** `packages/mccarthy-artwork/src/McCarthyArtworkAgent.ts` (agent-specific prompt)

**Why:**
- System prompt not strict enough
- Allows LLM to generate plausible-sounding answers
- No "NEVER make up information" constraint

**Fix Required:**
1. LLMService: Add strict system prompt constraints
2. McCarthyArtworkAgent: Override with stricter constraints
3. Add validation against RAG before returning

**Layer:** FAM (Platform Level) - affects ALL agents

---

### **ISSUE #11: No RAG Integration in Fallback** 🔴
**Symptom:** FallbackHandler doesn't query knowledge base

**Location:**
- **Primary:** `packages/worker/src/handlers/FallbackHandler.ts`

**Why:**
- FallbackHandler just returns generic "could you clarify?" response
- No RAG query implementation
- No LLM call with context

**Fix Required:**
1. FallbackHandler: Add RAG query
2. FallbackHandler: Call LLM with RAG context + strict prompt
3. FallbackHandler: Validate response against RAG

**Layer:** FAM (Platform Level) - affects ALL agents

---

## 📊 SUMMARY BY LAYER

### **🏢 Dartmouth OS (Platform) - 6 Issues**
Issues that affect ALL agents (FAM level):

| Issue | File | Priority |
|-------|------|----------|
| #11 | `packages/worker/src/handlers/FallbackHandler.ts` | 🔴 CRITICAL |
| #10 | `packages/worker/src/services/LLMService.ts` | 🔴 CRITICAL |
| #5 | `packages/worker/src/components/IntentDetector.ts` | 🟡 HIGH |
| #6 | `packages/worker/src/components/IntentDetector.ts` | 🟡 HIGH |
| #3 | `packages/worker/src/handlers/FallbackHandler.ts` | 🔴 CRITICAL |
| #1 | `packages/worker/src/handlers/FallbackHandler.ts` | 🔴 CRITICAL |

**Impact:** Fixing these will improve ALL future agents

---

### **🎨 Artwork Analyzer Agent - 5 Issues**
Issues specific to McCarthy Artwork Agent:

| Issue | File | Priority |
|-------|------|----------|
| #7 | `packages/mccarthy-artwork/src/handlers/SizeCalculationHandler.ts` | 🟡 HIGH |
| #8 | `packages/mccarthy-artwork/src/handlers/HowToHandler.ts` | 🟡 HIGH |
| #9 | `packages/mccarthy-artwork/src/handlers/*` (all handlers) | 🟡 HIGH |
| #4 | `packages/mccarthy-artwork/src/handlers/InformationHandler.ts` | 🔴 CRITICAL |
| #2 | `packages/mccarthy-artwork/src/handlers/InformationHandler.ts` | 🔴 CRITICAL |

**Impact:** Fixing these will improve Artwork Agent only

---

## 🎯 FIX PRIORITY

### **Priority 1: Platform (FAM) Fixes** 🔴 (6-8 hours)
**Fix these FIRST - they affect ALL agents:**

1. **FallbackHandler RAG Integration** (2-3 hours)
   - File: `packages/worker/src/handlers/FallbackHandler.ts`
   - Fixes: Issues #1, #3, #11
   - Impact: ALL agents

2. **LLM System Prompt** (1 hour)
   - File: `packages/worker/src/services/LLMService.ts`
   - Fixes: Issue #10
   - Impact: ALL agents

3. **Intent Detection** (2 hours)
   - File: `packages/worker/src/components/IntentDetector.ts`
   - Fixes: Issues #5, #6
   - Impact: ALL agents

4. **Response Validation** (2 hours)
   - New file: `packages/worker/src/components/ResponseValidator.ts`
   - Fixes: Validation for all issues
   - Impact: ALL agents

---

### **Priority 2: Artwork Agent Fixes** 🟡 (4-6 hours)
**Fix these SECOND - they affect Artwork Agent only:**

1. **SizeCalculationHandler** (2 hours)
   - File: `packages/mccarthy-artwork/src/handlers/SizeCalculationHandler.ts`
   - Fixes: Issue #7
   - Add reverse calculation

2. **InformationHandler** (2 hours)
   - File: `packages/mccarthy-artwork/src/handlers/InformationHandler.ts`
   - Fixes: Issues #2, #4, #9
   - Expand pattern matching

3. **HowToHandler** (1 hour)
   - File: `packages/mccarthy-artwork/src/handlers/HowToHandler.ts`
   - Fixes: Issues #8, #9
   - Add common patterns

---

## 🚀 RECOMMENDED APPROACH

### **Phase 1: Fix Platform (FAM) - Week 1**
**Time:** 6-8 hours  
**Impact:** Improves ALL agents (current + future)

1. Fix FallbackHandler RAG integration
2. Fix LLM system prompt
3. Fix Intent Detection
4. Add Response Validation

**Result:** 
- ✅ No more hallucinations
- ✅ All agents consult RAG
- ✅ Better intent detection
- ✅ Response validation

---

### **Phase 2: Fix Artwork Agent - Week 1**
**Time:** 4-6 hours  
**Impact:** Improves Artwork Agent specifically

1. Fix SizeCalculationHandler (reverse calculation)
2. Fix InformationHandler (pattern matching)
3. Fix HowToHandler (common patterns)

**Result:**
- ✅ Reverse calculations work
- ✅ UV DTF info correct
- ✅ DPI quality consistent
- ✅ How-to questions answered

---

### **Phase 3: Comprehensive Testing - Week 1**
**Time:** 2-3 hours  
**Impact:** Verify all fixes working

1. Run comprehensive test suite (80 tests)
2. Manual testing on live site
3. Verify all 11 issues fixed

**Result:**
- ✅ 80+ tests passing
- ✅ Production ready
- ✅ Confidence to proceed

---

## 📁 FILES TO MODIFY

### **Platform (FAM) Files:**
1. `packages/worker/src/handlers/FallbackHandler.ts` - Add RAG integration
2. `packages/worker/src/services/LLMService.ts` - Fix system prompt
3. `packages/worker/src/components/IntentDetector.ts` - Add intent types
4. `packages/worker/src/components/ResponseValidator.ts` - Create (new file)

### **Artwork Agent Files:**
5. `packages/mccarthy-artwork/src/handlers/SizeCalculationHandler.ts` - Add reverse calc
6. `packages/mccarthy-artwork/src/handlers/InformationHandler.ts` - Expand patterns
7. `packages/mccarthy-artwork/src/handlers/HowToHandler.ts` - Add patterns
8. `packages/mccarthy-artwork/src/McCarthyArtworkAgent.ts` - Update system prompt

**Total:** 8 files (4 platform, 4 agent-specific)

---

## 💡 KEY INSIGHTS

### **Good News:**
1. ✅ **Most issues are in FAM (platform)** - fixing them improves ALL agents
2. ✅ **RAG documents are correct** - no need to update knowledge base
3. ✅ **Architecture is sound** - just need to wire things up properly
4. ✅ **Fixes are straightforward** - no major refactoring needed

### **Bad News:**
1. ❌ **FallbackHandler is broken** - affects all agents
2. ❌ **LLM system prompt too weak** - allows hallucinations
3. ❌ **Handler patterns too narrow** - missing common questions

### **The Real Problem:**
**FallbackHandler was supposed to be the safety net, but it has no net!**

When a handler doesn't match:
- ❌ FallbackHandler doesn't query RAG
- ❌ FallbackHandler doesn't call LLM properly
- ❌ FallbackHandler just returns generic response
- ❌ Result: Agent makes up answers or says "I don't understand"

**Fixing FallbackHandler fixes 6 out of 11 issues!**

---

## 🎯 MY PLAN

### **Immediate (Today):**
1. Fix FallbackHandler RAG integration (2-3 hours)
2. Fix LLM system prompt (1 hour)
3. Test on live site (30 minutes)

### **Tomorrow:**
4. Fix Intent Detection (2 hours)
5. Fix SizeCalculationHandler (2 hours)
6. Fix InformationHandler (2 hours)
7. Fix HowToHandler (1 hour)

### **Day 3:**
8. Add Response Validation (2 hours)
9. Comprehensive testing (2 hours)
10. Deploy and verify (1 hour)

**Total Time:** 14-16 hours over 3 days

---

**Status:** 🎯 Clear plan, ready to execute  
**Next Step:** Start with FallbackHandler RAG integration  
**Expected Result:** All 11 issues fixed, agent production-ready

---

**Created:** 2025-11-27  
**See Also:**
- `MCCARTHY_CRITICAL_FAILURES_ANALYSIS.md` - Detailed failure analysis
- `MCCARTHY_FIXES_REQUIRED_SUMMARY.md` - Fix implementation details

