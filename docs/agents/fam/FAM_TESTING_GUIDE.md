# 🎯 FAM (Foundational Agent McCarthy) Testing Guide

**Last Updated:** November 19, 2024  
**Purpose:** Test the pure Dartmouth Foundation without any specialized role

---

## 🎯 **WHAT IS FAM?**

**FAM = Foundational Agent McCarthy**

- **NOT specialized** - No artwork analysis, no lead scraping, no specific domain
- **Pure foundation** - Only core conversational capabilities
- **Generic McCarthy** - The template all specialized agents build from

---

## 🔗 **WHERE TO TEST FAM**

### **Production URL:**
https://master.dartmouth-chat.pages.dev/test-fam.html

### **API Endpoint:**
```
POST https://agent-army-worker.dartmouth.workers.dev/api/v1/agents/test-agent/chat
```

### **Agent ID:**
```javascript
agentId: 'test-agent'  // Uses BaseAgent, not McCarthy Artwork
```

---

## 📊 **FAM VS McCARTHY ARTWORK ANALYZER**

| Feature | FAM (Foundation) | McCarthy Artwork Analyzer |
|---------|------------------|---------------------------|
| **Agent Type** | BaseAgent (generic) | Specialized (artwork) |
| **System Prompt** | Generic conversational | DTF/UV DTF expert |
| **RAG Documents** | None | 3 docs (DTF, UV DTF, DPI) |
| **Handlers** | Core only | + CalculationHandler, HowToHandler |
| **Constraints** | Core (pricing, refunds) | + Artwork-specific |
| **Purpose** | Testing foundation | Production artwork analysis |
| **UI** | test-fam.html | index.html |

---

## 🧪 **WHAT TO TEST IN FAM**

### **✅ Should Work (Foundation):**
- Conversation memory (name, preferences)
- Context tracking across messages
- Intent detection (greeting, farewell, information)
- LLM fallback for general questions
- Constraint enforcement (pricing, discounts, refunds)
- Frustration handling
- Repetition detection
- Empathy and personality

### **❌ Should NOT Work (Specialized):**
- DPI calculations
- DTF/UV DTF knowledge
- Artwork analysis
- Print size recommendations
- Specialized handlers

---

## 📝 **TEST PLAN FOR FAM**

Use: **FOUNDATIONAL_AGENT_TEST_PLAN.md**

**38 Tests Across 9 Categories:**
1. Conversation Memory (5 tests)
2. Intent Detection (5 tests)
3. Memory System (4 tests)
4. Repetition Detection (2 tests)
5. Frustration Handling (4 tests)
6. Conversation Quality (3 tests)
7. Empathy & Personality (3 tests)
8. Constraint Enforcement (3 tests)
9. LLM Fallback (3 tests)

**Success Criteria:** 34+ tests pass (90%)

---

## 🎨 **TESTING McCARTHY ARTWORK ANALYZER**

### **URL:**
https://master.dartmouth-chat.pages.dev

### **What to Test:**
- Everything in FAM test plan ✅
- PLUS specialized features:
  - DPI calculations
  - RAG knowledge (DTF, UV DTF)
  - Artwork-specific responses
  - Calculation accuracy
  - Quality ratings

---

## 🔄 **WORKFLOW**

```
1. Test FAM (Foundation)
   ↓
2. Verify 90%+ pass rate
   ↓
3. Foundation is SOLID
   ↓
4. Test McCarthy Artwork Analyzer
   ↓
5. Verify foundation + specialization both work
   ↓
6. Deploy to production
```

---

## 📊 **EXPECTED RESPONSES**

### **FAM (Foundation):**
```
User: "How much does it cost?"
FAM: "I can't provide pricing information. Please contact our 
     sales team. Is there anything else I can help you with?"
```
**Note:** Generic, no mention of "artwork technical requirements"

### **McCarthy Artwork Analyzer:**
```
User: "How much does it cost?"
McCarthy: "I focus on artwork technical requirements and can't 
          provide pricing. For quotes and pricing information, 
          please contact our sales team. Is there anything else 
          I can help you with?"
```
**Note:** Mentions "artwork technical requirements" (specialized)

---

## 🐛 **KNOWN ISSUES (To Fix)**

### **From Previous Testing:**
1. **Repetition Detection** - Same response repeated 3+ times
2. **Frustration Responses** - Not varying enough
3. **Context Loss** - Some follow-up questions lose context

---

## 🚀 **GETTING STARTED**

### **Step 1: Open FAM Test UI**
https://master.dartmouth-chat.pages.dev/test-fam.html

### **Step 2: Run Test 1.1**
1. Type: "Hello"
2. Wait for response
3. Type: "What did I just say?"
4. Verify: Agent remembers "Hello"

### **Step 3: Continue Testing**
Follow FOUNDATIONAL_AGENT_TEST_PLAN.md

### **Step 4: Report Results**
- ✅ PASS - It worked as expected
- ❌ FAIL - Something went wrong (describe what)

---

## 📞 **SUPPORT**

- **Test Plan:** FOUNDATIONAL_AGENT_TEST_PLAN.md
- **Agent Roadmap:** AGENT_ARMY_ROADMAP.md
- **Project Status:** PROJECT_STATUS_NOV19_2024.md

---

**Ready to test the pure foundation!** 🎯

---

**End of Guide**

