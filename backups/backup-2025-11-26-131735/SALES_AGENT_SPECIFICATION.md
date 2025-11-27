# 💰 MCCARTHY SALES AGENT - COMPLETE SPECIFICATION

**Date:** 2025-11-23  
**Version:** 1.0  
**Status:** Definition Complete, Ready to Build  
**Platform:** Dartmouth OS (Cloudflare Workers)

---

## 🎯 OVERVIEW

### **What is the Sales Agent?**

The McCarthy Sales Agent is a specialized AI agent that handles pricing, quotes, product recommendations, and customer qualification. It seamlessly integrates with other agents to provide sales intelligence across the entire Dartmouth OS ecosystem.

### **Key Principle:**

**"The Sales Agent is the sales EXPERT, not a product database."**

- Product knowledge comes from **Knowledge Domains** (shared with all agents)
- Product data comes from **Shopify Integration** (shared service)
- Sales Agent adds **sales intelligence** on top of that knowledge

---

## 🧠 CORE SMART SKILLS

### **McCarthy Sales Agent extends FAM with 5 specialized skills:**

```typescript
1. PRICING INTELLIGENCE
   - Calculate product prices from catalog
   - Apply volume discounts (buy more, save more)
   - Apply tiered pricing (different price levels)
   - Regional pricing (different locations/currencies)
   - Calculate tax/GST based on customer location
   - Apply coupon/promotion codes
   - Custom calculations (per-unit, per-measurement, subscription)
   - Explain pricing breakdown ("Why is this $X?")
   - Handle price objections ("That's too expensive")

2. SALES STRATEGY & RECOMMENDATIONS
   - Upsell recommendations (suggest premium options)
   - Cross-sell suggestions (frequently bought together)
   - Bundle deals (package discounts)
   - Product alternatives (different options to close sale)
   - Increase order value intelligently
   - "Customers who bought X also bought Y"

3. QUOTE BUILDER
   - Structure quotes (line items, descriptions, quantities)
   - Calculate subtotal, tax, total
   - Add payment terms (Net 30, 50% deposit, etc.)
   - Set validity period (quote expires in X days)
   - Optional items / add-ons
   - Notes / special instructions
   - Custom quote requests

4. CUSTOMER QUALIFICATION
   - Ask discovery questions (What do you need? When? Budget?)
   - Conditional logic (if they say X, ask Y)
   - Understand needs, budget, timeline
   - Identify urgency/intent (hot lead vs browsing)
   - Customer segmentation (tag as wholesale, retail, etc.)
   - Lead qualification (is this a good prospect?)

5. NEGOTIATION (within business rules)
   - Handle objections ("Too expensive", "Need it faster", etc.)
   - Offer alternatives to close sale
   - Know when to escalate to human
   - Stay within guardrails (never discount below X%)
   - Suggest payment plans/options
   - Create urgency (limited time offer, stock running low)
```

---

## 🔗 KNOWLEDGE DOMAINS

### **Sales Agent accesses these domains:**

```typescript
// DOMAIN 1: Products (shared with 8 agents)
domain: 'products'
access: 'read'
source: Shopify
content: {
  - Product catalog
  - Product descriptions
  - Product specifications
  - Product images
  - Product categories
}

// DOMAIN 2: Pricing (restricted to sales/marketing)
domain: 'pricing'
access: 'read'
source: Shopify + Custom Rules
content: {
  - Base pricing
  - Volume discounts
  - Tiered pricing
  - Regional pricing
  - Promotion codes
  - Discount rules
}

// DOMAIN 3: Policies (shared with multiple agents)
domain: 'policies'
access: 'read'
source: Manual upload
content: {
  - Payment terms
  - Shipping policies
  - Return policies
  - Business rules (never discount below X%)
  - Lead time estimates
}
```

---

## 🔌 INTEGRATIONS

### **Sales Agent uses these Dartmouth OS services:**

```typescript
1. ShopifyIntegrationService (Layer 4)
   - Get product catalog
   - Get pricing information
   - Check inventory availability
   - Get product images
   
2. RAGEngine (Layer 5)
   - Search across multiple knowledge domains
   - Product knowledge
   - Pricing rules
   - Business policies
   
3. EmailService (Layer 4 - already exists)
   - Send quotes to customers
   - Send follow-up emails
   
4. AgentRouter (Layer 9 - already exists)
   - Receive routing from other agents
   - Route to other agents when needed
   
5. PDF Library (agent-specific, not DOS service)
   - Generate quote PDFs (using jsPDF or similar)
```

---

## 🔄 AGENT COLLABORATION

### **How Sales Agent works with other agents:**

```
PATTERN 1: Pricing Questions
├── ANY Agent detects "pricing" intent
├── Routes to Sales Agent
├── Sales Agent calculates price
└── Returns to original agent

Examples:
- Artwork Analyser: "How much to fix this?" → Sales Agent
- Customer Service: "What's the cost for rush printing?" → Sales Agent
- PerfectPrint: "How much for background removal?" → Sales Agent

PATTERN 2: Technical Questions
├── Sales Agent receives technical question
├── Routes to appropriate technical agent
├── Technical agent answers
└── Returns to Sales Agent to complete quote

Example:
- User: "Can you print on metal?"
- Sales Agent → Artwork Analyser (technical question)
- Artwork Analyser: "Yes, UV DTF works on metal"
- Back to Sales Agent: "Yes! UV DTF on metal is $X per piece"

PATTERN 3: Complete Workflow
├── Artwork Analyser: Finds artwork issues
├── Routes to PerfectPrint AI: "Fix this artwork"
├── PerfectPrint: "Fixed! Cost to fix: $15"
├── Routes to Sales Agent: "Total quote?"
└── Sales Agent: "Fixing $15 + Printing $25 = $40 total"
```

---

## 🚫 WHAT SALES AGENT DOES NOT DO

**NOT Sales Agent responsibilities (other agents or services):**

- ❌ Process payments (separate payment service)
- ❌ Manage orders (Customer Service Agent)
- ❌ Track shipments (Customer Service Agent)
- ❌ Analyze artwork (Artwork Analyser Agent)
- ❌ Fix artwork (PerfectPrint AI Agent)
- ❌ Create designs (CreativeStudio AI Agent)
- ❌ Manage CRM (external CRM system)
- ❌ Generate product descriptions (Copywriter Agent)

**Sales Agent ONLY does sales intelligence!**

---

## 🏗️ IMPLEMENTATION STRUCTURE

### **File Structure:**

```
packages/mccarthy-sales/
├── src/
│   ├── McCarthySalesAgent.ts          # Main agent class (extends FAM)
│   ├── handlers/
│   │   ├── PricingHandler.ts          # Calculate prices, discounts, tax
│   │   ├── QuoteHandler.ts            # Build quotes, generate PDFs
│   │   ├── SalesStrategyHandler.ts    # Upsell, cross-sell, bundles
│   │   └── QualificationHandler.ts    # Discovery questions, lead scoring
│   ├── knowledge/
│   │   ├── PRICING_RULES.md           # Pricing logic documentation
│   │   └── SALES_POLICIES.md          # Business rules, guardrails
│   └── utils/
│       ├── pdfGenerator.ts            # PDF generation (using library)
│       └── priceCalculator.ts         # Pricing calculation utilities
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📊 BUILD EFFORT

### **Sales Agent Implementation:**

| Component | Description | Effort | Priority |
|-----------|-------------|--------|----------|
| **PricingHandler** | Calculate prices, discounts, tax | 5h | 🔴 CRITICAL |
| **QuoteHandler** | Build quotes, generate PDF | 5h | 🔴 CRITICAL |
| **SalesStrategyHandler** | Upsell/cross-sell logic | 3h | 🟡 HIGH |
| **QualificationHandler** | Discovery questions | 2h | 🟡 HIGH |

**Total: 15 hours**

---

## 🔗 DEPENDENCIES

### **Dartmouth OS Infrastructure Required:**

| Service | Status | Effort | Blocks Sales Agent? |
|---------|--------|--------|---------------------|
| **Knowledge Domain System** | ❌ Not built | 10h | 🔴 YES |
| **Shopify Integration Service** | ❌ Not built | 15h | 🔴 YES |
| **Agent Context Passing** | 🚧 Partial | 3h | 🟡 Recommended |

**Total DOS Infrastructure: 28 hours**

**Sales Agent cannot function without:**
1. Knowledge Domains (needs product/pricing data)
2. Shopify Integration (source of product/pricing data)

---

## 🎯 USE CASES

### **Use Case 1: Simple Pricing Question**

```
User: "How much for 100 custom t-shirts?"

Sales Agent:
├── Searches 'products' domain for "custom t-shirts"
├── Searches 'pricing' domain for volume pricing
├── Calculates: 100 units × $15 = $1,500
├── Applies volume discount: -10% = $1,350
├── Calculates tax (10% GST): +$135 = $1,485
└── Response: "100 custom t-shirts: $1,485 (inc GST). 
    Includes 10% volume discount. Want a formal quote?"
```

### **Use Case 2: Complex Quote with Multiple Products**

```
User: "Quote for 50 tumblers with custom wrap + 100 stickers"

Sales Agent:
├── Product 1: 50 tumblers with wrap
│   ├── Tumblers: 50 × $8 = $400
│   └── Custom wrap: 50 × $5 = $250
├── Product 2: 100 UV DTF stickers
│   └── Stickers: 100 × $2 = $200
├── Subtotal: $850
├── Tax (10% GST): $85
├── Total: $935
└── Generates PDF quote, emails to customer
```

### **Use Case 3: Upsell Opportunity**

```
User: "How much for 10 t-shirts?"

Sales Agent:
├── Calculates: 10 × $20 = $200
├── Detects: Close to volume discount threshold (20 units)
├── Upsell strategy: Suggest buying 20 for better price
└── Response: "10 t-shirts: $200 ($20 each). 
    But if you order 20, you get 15% off = $340 ($17 each).
    Save $60! Interested?"
```

### **Use Case 4: Route to Technical Agent**

```
User: "Can you print my artwork on metal?"

Sales Agent:
├── Detects: Technical question (not pricing)
├── Routes to Artwork Analyser Agent
├── Artwork Agent: "Yes, UV DTF works on metal. Your artwork is 150 DPI..."
├── Returns to Sales Agent with context
└── Sales Agent: "Yes! UV DTF on metal. Based on your artwork size:
    - 10cm × 10cm stickers: $3 each
    - Minimum order: 10 pieces = $30
    Want a quote?"
```

---

## 🔒 PERMISSIONS

### **What Sales Agent CAN access:**

- ✅ Read: Product catalog
- ✅ Read: Pricing information
- ✅ Read: Inventory levels
- ✅ Read: Business policies
- ✅ Create: Quotes
- ✅ Send: Emails (quotes)

### **What Sales Agent CANNOT access:**

- ❌ Customer payment information
- ❌ Process payments
- ❌ Modify orders
- ❌ Access customer personal data (beyond what's shared in conversation)
- ❌ Modify product catalog
- ❌ Modify pricing rules

---

## 🎯 SUCCESS CRITERIA

**Sales Agent is successful if:**

1. ✅ Can calculate accurate prices with discounts and tax
2. ✅ Can generate professional quotes (text + PDF)
3. ✅ Can recommend upsells/cross-sells intelligently
4. ✅ Can qualify leads with discovery questions
5. ✅ Can handle price objections within guardrails
6. ✅ Can seamlessly collaborate with other agents
7. ✅ Never violates business rules (discount limits, etc.)
8. ✅ Provides clear, accurate pricing explanations

---

## 📅 TIMELINE

### **Week 2-3 (Current):**

**Phase 1: DOS Infrastructure (28 hours)**
- Knowledge Domain System
- Shopify Integration Service
- Agent Context Passing

**Phase 2: Sales Agent (15 hours)**
- PricingHandler
- QuoteHandler
- SalesStrategyHandler
- QualificationHandler

**Total: 43 hours (5-6 days of focused work)**

---

## 🚀 NEXT STEPS

1. ✅ Specification complete
2. 🔴 Build DOS Infrastructure (Knowledge Domains, Shopify)
3. 🔴 Build Sales Agent handlers
4. 🟡 Test with Artwork Agent (pricing questions)
5. 🟡 Test with Customer Service Agent (quote generation)
6. 🟢 Deploy to production

---

**Status:** Ready to build! 🚀



