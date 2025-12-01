# 🎨 McCarthy Artwork Analyzer

**Version:** 1.0.0  
**Type:** Specialized McCarthy Agent  
**Built on:** Dartmouth Foundation

---

## 📖 **WHAT IS McCARTHY ARTWORK ANALYZER?**

McCarthy Artwork Analyzer is a specialized AI agent built on the Dartmouth foundation that helps with:
- **Print size calculations** (DPI, dimensions, quality ratings)
- **DTF printing requirements** (transparency, text size, line thickness)
- **UV DTF printing guidance** (ink stack, varnish, quality)
- **Artwork quality analysis** (resolution, color profiles, formats)
- **Technical print preparation** (how-to guides, best practices)

---

## 🏗️ **ARCHITECTURE**

### **Inherits from Dartmouth Foundation:**
- ✅ Conversation Quality System (personality, empathy, validation)
- ✅ Memory System (remembers conversations)
- ✅ RAG Engine (knowledge retrieval)
- ✅ Intent Detection
- ✅ Response Validation
- ✅ All foundation capabilities

### **Adds Specialized Components:**
- 🎨 **CalculationEngine** - Pre-computed DPI/size calculations
- 📚 **DTF Knowledge Base** - RAG documents for printing requirements
- 🔧 **Artwork Handlers** - Specialized handlers for artwork questions

---

## 🧩 **COMPONENTS**

### **CalculationEngine**
Pre-computes all DPI and size calculations to prevent LLM math errors.

**Features:**
- Calculate DPI at specific print sizes
- Calculate print sizes at specific DPI
- Quality ratings (Optimal, Good, Poor)
- Maximum sizes at different DPI levels
- Formula generation for transparency

### **Handlers**

**CalculationHandler:**
- Handles print size calculation questions
- Uses CalculationEngine for accurate results
- Formats responses in conversational style

**HowToHandler:**
- Provides step-by-step printing guidance
- Uses RAG to retrieve how-to documents
- Explains processes clearly

**InformationHandler:**
- Answers technical questions about printing
- Uses RAG to retrieve specifications
- Cites sources when appropriate

---

## 📚 **KNOWLEDGE BASE**

### **DTF_Artwork_Requirements.md**
Complete DTF printing requirements:
- Minimum text size (8pt / 2.5mm)
- Minimum line thickness (1mm)
- Transparency rules (100% opaque only)
- Resolution requirements (300 DPI)
- Color profiles (RGB/CMYK)
- Halftone guidance

### **UV_DTF_Artwork_Requirements.md**
UV DTF specific requirements:
- Ink stack (CMYK + White + Varnish)
- Transparency handling
- Minimum text/line sizes
- Edge quality considerations
- Varnish effects

### **DPI_QUALITY_STANDARDS.md**
Quality rating system:
- Optimal: ≥250 DPI (Green)
- Good: 200-249 DPI (Orange)
- Poor: <200 DPI (Red)
- Communication guidelines
- When to recommend what

---

## 🛡️ **CONSTRAINTS**

McCarthy Artwork Analyzer has specific business constraints:

### **Cannot Do:**
- ❌ Quote pricing
- ❌ Offer discounts
- ❌ Promise delivery dates
- ❌ Process orders
- ❌ Make financial decisions

### **Must Do:**
- ✅ Route pricing questions to sales team
- ✅ Provide accurate technical guidance
- ✅ Use RAG documents for answers
- ✅ Maintain conversational personality
- ✅ Never hallucinate information

---

## 💬 **CONVERSATION EXAMPLES**

### **Example 1: Print Size Calculation**

**User:** "What size can I print 4000x6000 at 300 DPI?"

**McCarthy Artwork:**
```
Hey! Your artwork is 4000x6000 pixels.

At 300 DPI, you can print up to 34cm x 51cm at perfect quality. 
That's roughly the size of a large poster!

What size were you thinking of printing?
```

### **Example 2: DTF Requirements**

**User:** "What are the requirements for DTF printing?"

**McCarthy Artwork:**
```
For DTF printing, here's what you need to know:

• Text should be at least 2.5mm tall (8pt)
• Lines need to be at least 1mm thick
• Avoid semi-transparent pixels - DTF needs 100% opacity
• 300 DPI is the sweet spot for quality

I noticed your design has some thin text - want me to show you 
which parts might need adjusting?
```

### **Example 3: Pricing Question (Constraint)**

**User:** "How much does it cost to print this?"

**McCarthy Artwork:**
```
I can help with the technical artwork requirements, but for pricing, 
let me connect you with our sales team who can give you an accurate 
quote based on your specific needs.

In the meantime, is there anything about the artwork quality or 
print preparation I can help you with?
```

---

## 🧪 **TESTING**

### **Unit Tests:**
- CalculationEngine accuracy
- Handler response quality
- RAG document retrieval
- Constraint enforcement

### **Integration Tests:**
- Full conversation flows
- Multi-turn conversations
- Constraint validation
- Quality scoring

---

## 📊 **METRICS**

### **Conversation Quality:**
- Score: 70+ (out of 100)
- Empathy: Detected and applied
- Verbosity: Under 200 words
- Hallucinations: Zero
- User Satisfaction: High

### **Technical Accuracy:**
- Calculation Errors: Zero (pre-computed)
- RAG Accuracy: 95%+
- Constraint Violations: Zero

---

## 🚀 **USAGE**

```typescript
import { McCarthyArtworkAgent } from '@agent-army/mccarthy-artwork';

// Create agent instance
const artworkAgent = new McCarthyArtworkAgent({
  agentId: 'mccarthy-artwork',
  tenantId: 'your-tenant-id',
  agentConfig: config,
  env: cloudflareEnv
});

// Process message
const response = await artworkAgent.processMessage(
  "What size can I print 4000x6000 at 300 DPI?",
  sessionId
);

console.log(response.content);
// "Hey! Your artwork is 4000x6000 pixels..."
```

---

## 🔗 **RELATED DOCUMENTATION**

- **DARTMOUTH_BLUEPRINT.md** - Understand the platform
- **CONVERSATION_QUALITY_REQUIREMENTS.md** - Quality guidelines
- **ARTWORK_ANALYZER_REVIEW.md** - Lessons learned
- **BUILD_PLAN_COMPLETE.md** - Build plan

---

## 📝 **VERSION HISTORY**

### **v1.0.0** (November 18, 2025)
- Initial creation
- CalculationEngine moved from foundation
- Handlers moved from foundation
- RAG documents added
- Constraints configured
- Tests written

---

**McCarthy Artwork Analyzer: Your specialized AI expert for print preparation and artwork analysis.** 🎨

