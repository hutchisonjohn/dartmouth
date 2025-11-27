# 🚨 MCCARTHY AGENT - CRITICAL FIXES REQUIRED (SUMMARY)

**Date:** 2025-11-27  
**Status:** 🔴 NOT PRODUCTION READY  
**Estimated Fix Time:** 8-12 hours  
**Priority:** URGENT

---

## 📊 WHAT HAPPENED

**Testing Results:**
- ✅ **Sections 11.1-11.3:** PASSED (greeting, forward DPI calculations, follow-ups)
- ❌ **Sections 11.4+:** FAILED (11 critical issues discovered)

**Key Failures:**
1. Agent is **hallucinating** (making up ICC profile information)
2. Agent is **not consulting RAG** (not reading knowledge base documents)
3. Agent is giving **wrong information** (UV DTF for apparel - it's ONLY hard substrates)
4. Agent is **inconsistent** (same question, different answers)
5. Agent **can't handle reverse calculations** ("What size at 300 DPI?" doesn't work)

**User Feedback:**
```
"OMG!! UV DTF is for hard substrates... not textiles, not apparel... 
THIS IS SO WRONG!!"

"Why are you not using the information provided in the RAG for UV DTF?"

"you just told a lot of lies"

"its need you to actuall share what the data actually says"
```

---

## 🎯 PRIORITY 1 FIXES (MUST DO BEFORE PRODUCTION)

### **1. Integrate RAG into FallbackHandler** (2-3 hours)

**Problem:** FallbackHandler doesn't query knowledge base - just returns generic "could you clarify?" responses.

**Fix:**
```typescript
// Current (WRONG):
private async generateContextualResponse(message: string, context: HandlerContext): Promise<string> {
  return `I understand we're discussing ${this.extractTopic(conversationContext)}. 
          Could you clarify what you'd like to know about that?`;
}

// Fixed (CORRECT):
private async generateContextualResponse(message: string, context: HandlerContext): Promise<string> {
  // 1. Query RAG for relevant information
  const ragResults = await this.ragEngine.retrieve(message, context.state?.agentId, 5);
  
  // 2. If RAG has answer, use it
  if (ragResults && ragResults.length > 0) {
    return this.formatRAGResponse(ragResults);
  }
  
  // 3. If RAG doesn't have answer, call LLM with strict constraints
  if (this.llmService) {
    const systemPrompt = `You are McCarthy, an artwork assistant. 
    CRITICAL RULES:
    - NEVER make up information
    - ONLY answer from the conversation context provided
    - If you don't know, say "I don't have that information in my knowledge base"
    - NEVER invent technical specifications
    - Always cite your source`;
    
    return await this.llmService.generate(message, systemPrompt, context);
  }
  
  // 4. If no LLM, say we don't know
  return "I don't have that information in my knowledge base. Could you ask about something else?";
}
```

**Files to Modify:**
- `packages/worker/src/handlers/FallbackHandler.ts`

---

### **2. Fix LLM System Prompt** (1 hour)

**Problem:** LLM is making up information instead of saying "I don't know".

**Fix:**
```typescript
// Add to system prompt:
CRITICAL CONSTRAINTS:
1. NEVER make up information not in the provided context
2. If you don't know something, say "I don't have that information"
3. ALWAYS cite your source (RAG document name or artwork data field)
4. For technical specifications, ONLY use information from RAG documents
5. If asked about something not in your knowledge base, admit it

EXAMPLES OF CORRECT BEHAVIOR:
User: "Does my artwork have an ICC profile?"
✅ CORRECT: "According to the artwork analysis, there is no embedded ICC profile."
❌ WRONG: "Yes, your artwork has an sRGB ICC profile." (when data says NO)

User: "What can UV DTF be used for?"
✅ CORRECT: "According to the UV DTF requirements document, UV DTF is for hard substrates like wood, metal, glass, and ceramics - NOT for textiles or apparel."
❌ WRONG: "UV DTF can be used for t-shirts and hoodies." (completely wrong)
```

**Files to Modify:**
- `packages/mccarthy-artwork/src/McCarthyArtworkAgent.ts` (system prompt)
- `packages/worker/src/BaseAgent.ts` (base system prompt)

---

### **3. Expand Handler Pattern Matching** (3-4 hours)

**Problem:** Handlers only match exact phrasings - missing common variations.

**Fixes Needed:**

#### **A. SizeCalculationHandler - Add Reverse Calculation**
```typescript
// Add patterns:
- "what size can I print at {dpi} DPI"
- "what size at {dpi} DPI"
- "show me sizes for {dpi} DPI"
- "max size at {dpi} DPI"
- "how big can I print at {dpi} DPI"

// Add logic:
private calculateSizeForDPI(dpi: number, artworkData: any): string {
  const widthInches = artworkData.width / dpi;
  const heightInches = artworkData.height / dpi;
  const widthCm = widthInches * 2.54;
  const heightCm = heightInches * 2.54;
  
  return `At ${dpi} DPI, you can print up to ${widthCm.toFixed(1)} × ${heightCm.toFixed(1)} cm 
          (${widthInches.toFixed(2)}" × ${heightInches.toFixed(2)}")`;
}
```

#### **B. InformationHandler - Add File Info Patterns**
```typescript
// Add patterns:
- "how big is my file"
- "what's the file size"
- "file size"
- "how many MB"
- "file dimensions"

// Add logic to distinguish from print size:
if (message.includes("file") && (message.includes("size") || message.includes("big"))) {
  // Return file size info
} else if (message.includes("size") || message.includes("dimension")) {
  // Return print size info
}
```

#### **C. InformationHandler - Add UV DTF Patterns**
```typescript
// Add patterns:
- "what can UV DTF be used for"
- "what is UV DTF used for"
- "UV DTF applications"
- "UV DTF uses"
- "what can I use UV DTF on"

// Ensure RAG is queried for UV_DTF_Artwork_Requirements.md
```

#### **D. HowToHandler - Add Common Patterns**
```typescript
// Add patterns:
- "how do I resize"
- "how to resize"
- "how do I change DPI"
- "how to change DPI"
- "how do I fix transparency"
- "how to fix transparency"
- "how do I convert to sRGB"
- "how to convert to sRGB"
- "how do I prepare"
- "how to prepare"
```

**Files to Modify:**
- `packages/mccarthy-artwork/src/handlers/SizeCalculationHandler.ts`
- `packages/mccarthy-artwork/src/handlers/InformationHandler.ts`
- `packages/mccarthy-artwork/src/handlers/HowToHandler.ts`

---

### **4. Add Response Validation** (2 hours)

**Problem:** Agent can say anything without checking if it's correct.

**Fix:**
```typescript
// Add validation before returning response:
class ResponseValidator {
  async validateAgainstRAG(response: string, question: string, ragEngine: RAGEngine): Promise<ValidationResult> {
    // 1. Extract claims from response
    const claims = this.extractClaims(response);
    
    // 2. Check each claim against RAG
    for (const claim of claims) {
      const ragResults = await ragEngine.retrieve(claim, agentId, 3);
      
      // 3. If claim contradicts RAG, flag it
      if (this.contradicts(claim, ragResults)) {
        return {
          valid: false,
          issue: `Claim "${claim}" contradicts knowledge base`,
          correction: ragResults[0].text
        };
      }
    }
    
    return { valid: true };
  }
  
  private extractClaims(response: string): string[] {
    // Extract factual claims (e.g., "UV DTF is for apparel")
    // Use simple keyword matching for now
    const claims = [];
    
    if (response.includes("ICC profile")) {
      claims.push("ICC profile status");
    }
    if (response.includes("UV DTF")) {
      claims.push("UV DTF usage");
    }
    if (response.includes("DPI")) {
      claims.push("DPI quality threshold");
    }
    
    return claims;
  }
}
```

**Files to Create:**
- `packages/worker/src/components/ResponseValidator.ts` (enhance existing)

---

## 🎯 PRIORITY 2 FIXES (THIS WEEK)

### **5. Improve Intent Detection** (1-2 hours)

**Add Intent Types:**
- `file_info` - Questions about file size, format, dimensions
- `reverse_calculation` - "What size at X DPI?"
- `correction` - User says "wrong", "no", "incorrect"

**Files to Modify:**
- `packages/worker/src/components/IntentDetector.ts`

---

### **6. Add Feedback Loop** (1 hour)

**Detect Corrections:**
```typescript
if (message.toLowerCase().includes("wrong") || 
    message.toLowerCase().includes("no") || 
    message.toLowerCase().includes("incorrect")) {
  // User is correcting us - re-query RAG with correction context
  const correctionContext = `The user said our previous answer was wrong. 
                             Previous answer: ${lastResponse}
                             User's correction: ${message}
                             What is the correct answer?`;
  
  const ragResults = await ragEngine.retrieve(correctionContext, agentId, 5);
  return formatCorrectedResponse(ragResults);
}
```

---

### **7. Add Consistency Checking** (1 hour)

**Remember Previous Answers:**
```typescript
// Store in memory:
memory.set('previous_answers', {
  'dpi_quality_good': '200-249 DPI',
  'dpi_quality_optimal': '≥250 DPI',
  'uv_dtf_usage': 'hard substrates only'
});

// Before responding, check consistency:
if (memory.has('previous_answers', topic)) {
  const previousAnswer = memory.get('previous_answers', topic);
  if (newAnswer !== previousAnswer) {
    // Flag inconsistency
    console.warn(`Inconsistent answer detected for ${topic}`);
    // Use previous answer (it came from RAG)
    return previousAnswer;
  }
}
```

---

## 📋 TESTING CHECKLIST

**Before Deploying, Test These Questions:**

### **RAG Integration:**
- [ ] "does it have an ICC profile?" → Should say NO (from artwork data)
- [ ] "what can UV DTF be used for?" → Should say "hard substrates" (from RAG)
- [ ] "what's the minimum line thickness for UV DTF?" → Should say "0.5-1mm, lines below 0.5mm may flake" (from RAG)

### **DPI Quality:**
- [ ] "when is DPI considered optimal?" → Should say "≥250 DPI"
- [ ] "when is DPI considered good?" → Should say "200-249 DPI"
- [ ] "when is DPI considered poor?" → Should say "<200 DPI"
- [ ] Ask same question 3 times → Should get SAME answer each time

### **Reverse Calculations:**
- [ ] "what size can I print at 300 DPI?" → Should calculate and show size
- [ ] "what size at 250 DPI?" → Should calculate and show size
- [ ] "show me sizes for 300, 250, and 200 DPI" → Should show all three

### **File Information:**
- [ ] "how big is my file?" → Should show file size in MB
- [ ] "what's the file size?" → Should show file size
- [ ] "what are the dimensions?" → Should show pixel dimensions

### **How-To Questions:**
- [ ] "how do I resize my artwork?" → Should provide steps
- [ ] "how do I change DPI in Photoshop?" → Should provide steps
- [ ] "how do I fix transparency issues?" → Should provide guidance

### **Corrections:**
- [ ] Give wrong answer, user says "wrong" → Should re-query RAG and correct

---

## 📊 SUCCESS CRITERIA

**Agent MUST:**
1. ✅ NEVER hallucinate or make up information
2. ✅ ALWAYS consult RAG before answering technical questions
3. ✅ Give consistent answers to the same question
4. ✅ Say "I don't know" when information not available
5. ✅ Cite sources for technical facts
6. ✅ Handle reverse calculations (DPI → size)
7. ✅ Distinguish file size from print size
8. ✅ Provide correct UV DTF information
9. ✅ Handle common "how do I..." questions
10. ✅ Pass 100% of RAG validation tests

---

## 🚀 IMPLEMENTATION PLAN

### **Day 1 (4 hours):**
1. Integrate RAG into FallbackHandler (2-3 hours)
2. Fix LLM system prompt (1 hour)

### **Day 2 (4 hours):**
3. Expand SizeCalculationHandler patterns (reverse calculation) (2 hours)
4. Expand InformationHandler patterns (file info, UV DTF) (1 hour)
5. Expand HowToHandler patterns (1 hour)

### **Day 3 (4 hours):**
6. Add response validation (2 hours)
7. Improve intent detection (1 hour)
8. Add feedback loop (1 hour)

### **Day 4 (2 hours):**
9. Add consistency checking (1 hour)
10. Comprehensive testing (1 hour)

**Total: 14 hours** (conservative estimate)

---

## 📁 FILES TO MODIFY

**Priority 1:**
1. `packages/worker/src/handlers/FallbackHandler.ts` - Add RAG integration
2. `packages/mccarthy-artwork/src/McCarthyArtworkAgent.ts` - Fix system prompt
3. `packages/mccarthy-artwork/src/handlers/SizeCalculationHandler.ts` - Add reverse calculation
4. `packages/mccarthy-artwork/src/handlers/InformationHandler.ts` - Add file info + UV DTF patterns
5. `packages/mccarthy-artwork/src/handlers/HowToHandler.ts` - Add common patterns
6. `packages/worker/src/components/ResponseValidator.ts` - Add RAG validation

**Priority 2:**
7. `packages/worker/src/components/IntentDetector.ts` - Add new intent types
8. `packages/worker/src/components/MemorySystem.ts` - Add consistency checking

---

**Status:** 🔴 URGENT - Must fix before production  
**Estimated Time:** 8-14 hours  
**Next Step:** Start with Priority 1 fixes

**See Also:**
- `MCCARTHY_CRITICAL_FAILURES_ANALYSIS.md` - Full failure analysis
- `PROGRESS_TO_DATE.md` - Updated project status

