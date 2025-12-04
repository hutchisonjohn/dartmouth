# Vector RAG System - Test Results

**Test Date:** December 5, 2025
**Test Time:** 9:15 AM AEST
**Environment:** Production (dartmouth-os-worker.dartmouth.workers.dev)

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Tests** | 20 |
| **Passed** | 20 |
| **Failed** | 0 |
| **Pass Rate** | **100%** ✅ |

---

## Test Results by Category

### 1. DTF Transfers (5/5 PASSED) ✅

| Question | Expected Keywords | Result |
|----------|------------------|--------|
| What temperature should I use for DTF transfers? | 150, 160 | ✅ PASS (2/2) |
| How long should I press DTF transfers? | 8, 12, seconds | ✅ PASS (3/3) |
| Should I hot peel or cold peel DTF? | hot, peel | ✅ PASS (2/2) |
| What fabrics work with DTF? | cotton, polyester | ✅ PASS (2/2) |
| How many washes do DTF transfers last? | 50, 52, wash | ✅ PASS (2/3) |

### 2. UV DTF Transfers (3/3 PASSED) ✅

| Question | Expected Keywords | Result |
|----------|------------------|--------|
| Do UV DTF transfers need a heat press? | no, peel, stick | ✅ PASS (2/3) |
| What surfaces work with UV DTF? | glass, metal, plastic | ✅ PASS (3/3) |
| Are UV DTF transfers waterproof? | waterproof, water, resistant | ✅ PASS (3/3) |

### 3. Shipping (2/2 PASSED) ✅

| Question | Expected Keywords | Result |
|----------|------------------|--------|
| How long to dispatch orders? | 24, hour, business | ✅ PASS (3/3) |
| Do you provide tracking? | tracking, number | ✅ PASS (2/2) |

### 4. Returns & Refunds (2/2 PASSED) ✅

| Question | Expected Keywords | Result |
|----------|------------------|--------|
| Can I return if I change my mind? | no, refund, custom | ✅ PASS (3/3) |
| How long to report faulty product? | 7, day | ✅ PASS (2/2) |

### 5. Terms & Conditions (2/2 PASSED) ✅

| Question | Expected Keywords | Result |
|----------|------------------|--------|
| Can you print neon colors? | no, neon, CMYK | ✅ PASS (3/3) |
| What are the sizing tolerances? | 1cm, 2.5cm, tolerance | ✅ PASS (3/3) |

### 6. Ordering Process (3/3 PASSED) ✅

| Question | Expected Keywords | Result |
|----------|------------------|--------|
| What file formats do you accept? | PNG, PDF | ✅ PASS (2/2) |
| Do you have minimum orders? | no, minimum | ✅ PASS (2/2) |
| Do you offer colour matching? | colour, match, 30 | ✅ PASS (3/3) |

### 7. FAQ & Company Info (3/3 PASSED) ✅

| Question | Expected Keywords | Result |
|----------|------------------|--------|
| Where is Amazing Transfers located? | Coolum, Beach, QLD | ✅ PASS (3/3) |
| What is the contact email? | info@amazingtransfers.com.au, email | ✅ PASS (2/2) |
| Do you offer free samples? | free, sample | ✅ PASS (2/2) |

---

## Sample AI Responses

### DTF Temperature Question
**Q:** "What temperature should I use for DTF transfers?"

**A:** "Hey! G'day! For applying DTF transfers, you'll want to set your heat press to a temperature between **150-160°C**. If you have any more questions on the application..."

✅ **Correct!** The AI correctly uses the RAG document value (150-160°C) instead of generic LLM knowledge (160-170°C).

---

## Technical Details

### RAG System Configuration
- **Embedding Model:** OpenAI `text-embedding-3-small` (1536 dimensions)
- **Vector Database:** Cloudflare Vectorize
- **Similarity Metric:** Cosine similarity
- **Top-K Results:** 5 chunks per query

### Document Processing Stats
- **Total Documents:** 9
- **Total Chunks:** 53
- **Total Vectors:** 53
- **Average Chunk Size:** ~300-500 tokens

### Knowledge Base Documents
1. DTF Transfers - Direct to Film Technology
2. UV DTF Transfers - UV Direct to Film Technology
3. Shipping and Delivery Policy
4. Returns and Refunds Policy
5. Terms and Conditions
6. Ordering Process Guide
7. FAQ - Frequently Asked Questions
8. Company Information
9. Privacy Policy

---

## Conclusion

The Vector Embeddings RAG system is working correctly. The AI now:

1. ✅ **Uses correct information** from the knowledge base
2. ✅ **Prioritizes RAG content** over generic LLM knowledge
3. ✅ **Provides accurate answers** across all document categories
4. ✅ **Maintains conversational tone** while being factually correct

The system successfully eliminates hallucinations for questions that can be answered from the knowledge base.

---

*Test script: `packages/worker/scripts/test-vector-rag.ps1`*

