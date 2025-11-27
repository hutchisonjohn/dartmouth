# 🏗️ DARTMOUTH OS - INFRASTRUCTURE REQUIREMENTS

**Date:** 2025-11-23  
**Purpose:** Define minimum DOS infrastructure needed for PA Agent + Sales Agent  
**Status:** Requirements Complete, Ready to Build

---

## 🎯 OVERVIEW

This document defines the **minimum infrastructure** that must be built into Dartmouth OS to support:
1. **McCarthy PA Agent** (voice-first personal assistant)
2. **McCarthy Sales Agent** (pricing, quotes, sales intelligence)
3. **All future agents** (shared infrastructure)

---

## 📊 INFRASTRUCTURE PRIORITY

### **Critical Path Analysis:**

| Infrastructure | Blocks Which Agents | Priority | Effort |
|----------------|---------------------|----------|--------|
| **Knowledge Domains** | ALL 14 agents (100%) | 🔴 CRITICAL | 10h |
| **Shopify Integration** | 8 agents (57%) | 🔴 CRITICAL | 15h |
| **Voice Services** | PA Agent only | 🔴 CRITICAL | Developer |
| **Agent Context Passing** | Multi-agent workflows | 🟡 HIGH | 3h |
| **Calendar/Email** | PA Agent only | 🟡 HIGH | Developer |

---

## 🔴 CRITICAL: KNOWLEDGE DOMAIN SYSTEM

### **What It Is:**

A system that allows multiple agents to share knowledge across different domains, with access control.

### **Why It's Critical:**

- **100% of agents need this!**
- Currently, RAG is agent-specific (isolated knowledge)
- Agents need to share knowledge (products, policies, etc.)
- Different agents need different access levels

### **Current State:**

```typescript
// CURRENT: Agent-specific RAG
RAGEngine.retrieve(agentId: 'sales-agent', query: 'DTF products')
// Only searches knowledge for 'sales-agent'
// Cannot access knowledge from other domains
```

### **Required State:**

```typescript
// REQUIRED: Multi-domain RAG
RAGEngine.retrieveFromDomains(
  agentId: 'sales-agent',
  query: 'DTF products',
  domains: ['products', 'pricing', 'policies']
)
// Searches across multiple knowledge domains
// Access controlled by agent permissions
```

### **Implementation:**

**1. Database Schema Changes:**

```sql
-- Add to existing tables
ALTER TABLE documents 
  ADD COLUMN knowledge_domain TEXT DEFAULT 'agent-specific';

ALTER TABLE rag_chunks 
  ADD COLUMN knowledge_domain TEXT DEFAULT 'agent-specific';

-- New table: Knowledge domains
CREATE TABLE knowledge_domains (
  name TEXT PRIMARY KEY,
  description TEXT,
  access_level TEXT DEFAULT 'public',
  sync_source TEXT,        -- 'shopify', 'manual', 'api'
  sync_frequency INTEGER,  -- Hours (24, 12, 8, 4, 2)
  last_sync_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- New table: Agent permissions
CREATE TABLE agent_domain_permissions (
  agent_id TEXT NOT NULL,
  domain_name TEXT NOT NULL,
  permission TEXT DEFAULT 'read',
  granted_at TEXT NOT NULL,
  PRIMARY KEY (agent_id, domain_name)
);
```

**2. RAGEngine Enhancement:**

```typescript
// Extend existing RAGEngine class
class RAGEngine {
  
  // EXISTING METHOD (keep for backward compatibility)
  async retrieve(
    agentId: string,
    query: string,
    topK?: number
  ): Promise<RAGResult>
  
  // NEW METHOD: Multi-domain search
  async retrieveFromDomains(
    agentId: string,
    query: string,
    domains: string[],
    topK?: number
  ): Promise<RAGResult> {
    // 1. Check agent permissions for each domain
    // 2. Search across all accessible domains
    // 3. Combine results by relevance
    // 4. Return unified RAGResult
  }
  
  // NEW METHOD: Ingest to domain
  async ingestToDomain(
    domain: string,
    documents: Document[]
  ): Promise<void> {
    // Store documents in specific domain
    // Generate embeddings
    // Make searchable
  }
  
  // NEW METHOD: Grant access
  async grantDomainAccess(
    agentId: string,
    domain: string,
    permission: 'read' | 'write'
  ): Promise<void>
}
```

**3. Initial Domains:**

```typescript
// Domain setup for MVP
const domains = [
  {
    name: 'products',
    description: 'Product catalog from Shopify',
    access_level: 'public',
    sync_source: 'shopify',
    sync_frequency: 24, // hours
    agents: ['sales', 'customer-service', 'artwork', 'copywriter', 
             'content-creator', 'social-media', 'creativestudio', 'adfusion']
  },
  {
    name: 'pricing',
    description: 'Pricing rules and discounts',
    access_level: 'sales-marketing',
    sync_source: 'shopify',
    sync_frequency: 24,
    agents: ['sales', 'content-creator', 'adfusion']
  },
  {
    name: 'policies',
    description: 'Business policies and rules',
    access_level: 'public',
    sync_source: 'manual',
    agents: ['sales', 'customer-service', 'pa']
  },
  {
    name: 'dtf-printing',
    description: 'DTF/UV DTF technical specs',
    access_level: 'public',
    sync_source: 'manual',
    agents: ['artwork', 'sales', 'customer-service']
  }
];
```

### **Build Effort:** 10 hours

### **Files to Create/Modify:**

- ✅ `packages/worker/src/components/RAGEngine.ts` (modify)
- 🆕 `packages/worker/src/services/KnowledgeDomainService.ts` (new)
- 🆕 `packages/worker/migrations/0002_knowledge_domains.sql` (new)

---

## 🔴 CRITICAL: SHOPIFY INTEGRATION SERVICE

### **What It Is:**

A service that connects to Shopify stores, syncs product/pricing data, and makes it available to agents.

### **Why It's Critical:**

- **57% of agents need e-commerce data!**
- Sales Agent needs products/pricing
- Customer Service needs order status
- Content Creator needs product info
- 8 out of 14 agents require this

### **Current State:**

- ❌ No Shopify integration
- ❌ No e-commerce data available
- ❌ Agents cannot access product catalog

### **Required State:**

```typescript
// Agents can access Shopify data via Knowledge Domains
const products = await ragEngine.retrieveFromDomains(
  'sales-agent',
  'UV DTF stickers',
  ['products', 'pricing']
);
// Returns: Product info + pricing from Shopify
```

### **Implementation:**

**1. Database Schema:**

```sql
-- New table: Shopify connections
CREATE TABLE shopify_connections (
  tenant_id TEXT PRIMARY KEY,
  shop_url TEXT NOT NULL,
  access_token TEXT NOT NULL, -- Encrypted
  webhook_secret TEXT,
  connected_at TEXT NOT NULL,
  last_sync_at TEXT,
  sync_enabled INTEGER DEFAULT 1,
  sync_frequency INTEGER DEFAULT 24, -- Hours
  metadata TEXT -- JSON
);

-- New table: Sync jobs
CREATE TABLE shopify_sync_jobs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  job_type TEXT NOT NULL, -- 'products', 'pricing', 'inventory'
  status TEXT NOT NULL, -- 'pending', 'running', 'completed', 'failed'
  started_at TEXT,
  completed_at TEXT,
  items_synced INTEGER,
  error_message TEXT
);
```

**2. ShopifyIntegrationService:**

```typescript
class ShopifyIntegrationService {
  
  // 1. Connection Management
  async connect(
    shopUrl: string,
    accessToken: string,
    tenantId: string
  ): Promise<void>
  
  async disconnect(tenantId: string): Promise<void>
  
  async testConnection(tenantId: string): Promise<boolean>
  
  // 2. Product Sync
  async syncProducts(tenantId: string): Promise<{
    productsSync: number,
    pricingSync: number
  }> {
    // 1. Fetch all products from Shopify API
    // 2. Transform to standard format
    // 3. Upload to 'products' knowledge domain
    // 4. Upload pricing to 'pricing' knowledge domain
    // 5. Update last_sync_at
  }
  
  // 3. Inventory Check
  async checkInventory(
    productId: string
  ): Promise<{
    available: boolean,
    quantity: number,
    leadTime?: string
  }>
  
  // 4. Webhook Handling
  async handleProductUpdate(webhook: any): Promise<void>
  async handleInventoryUpdate(webhook: any): Promise<void>
  async handlePriceUpdate(webhook: any): Promise<void>
  
  // 5. Scheduled Sync (using Cloudflare Cron)
  async scheduledSync(tenantId: string): Promise<void> {
    // Called by Cron trigger every X hours
    await this.syncProducts(tenantId);
  }
}
```

**3. Shopify API Integration:**

```typescript
// Shopify REST Admin API
const shopifyAPI = {
  baseUrl: `https://${shopUrl}/admin/api/2024-01`,
  endpoints: {
    products: '/products.json',
    variants: '/variants.json',
    inventory: '/inventory_levels.json',
    webhooks: '/webhooks.json'
  },
  auth: {
    headers: {
      'X-Shopify-Access-Token': accessToken
    }
  }
};
```

**4. Sync Schedule:**

```typescript
// Cloudflare Cron Trigger
// wrangler.toml
[triggers]
crons = ["0 */24 * * *"]  // Every 24 hours (default)

// Options available:
// - Every 24 hours: "0 */24 * * *"
// - Every 12 hours: "0 */12 * * *"
// - Every 8 hours: "0 */8 * * *"
// - Every 4 hours: "0 */4 * * *"
// - Every 2 hours: "0 */2 * * *"
```

### **Build Effort:** 15 hours

### **Files to Create:**

- 🆕 `packages/worker/src/services/ShopifyIntegrationService.ts` (new)
- 🆕 `packages/worker/src/utils/shopifyAPI.ts` (new)
- 🆕 `packages/worker/migrations/0003_shopify_integration.sql` (new)

---

## 🟡 HIGH: AGENT CONTEXT PASSING

### **What It Is:**

Enhancement to AgentRouter to pass full conversation context when routing between agents.

### **Why It's Important:**

- Enables seamless multi-agent collaboration
- User doesn't know they're talking to multiple agents
- Context preserved across agent handoffs

### **Current State:**

```typescript
// CURRENT: Basic routing (works but no context passing)
AgentRouter.route(message, intent, context)
// Routes to agent but doesn't pass conversation history
```

### **Required State:**

```typescript
// REQUIRED: Context-aware routing
AgentRouter.routeWithContext(
  message,
  intent,
  context,
  previousAgent: {
    agentId: 'customer-service',
    conversationHistory: [...],
    extractedData: { artwork: analyzed, issues: [low DPI] }
  }
)
// New agent receives full context
```

### **Implementation:**

```typescript
// Enhance existing AgentRouter
class AgentRouter {
  
  // EXISTING (keep for backward compatibility)
  async route(
    message: string,
    intent: Intent,
    context: HandlerContext
  ): Promise<Response>
  
  // NEW: Context-aware routing
  async routeWithContext(
    message: string,
    intent: Intent,
    context: HandlerContext,
    previousAgent?: {
      agentId: string,
      conversationHistory: Message[],
      extractedData: any
    }
  ): Promise<Response> {
    // 1. Find target agent
    const targetAgent = await this.decide(intent, context);
    
    // 2. Prepare context for new agent
    const enhancedContext = {
      ...context,
      previousAgent,
      conversationHistory: previousAgent?.conversationHistory || [],
      extractedData: previousAgent?.extractedData || {}
    };
    
    // 3. Route to target agent with full context
    return await this.routeToAgent(targetAgent, message, enhancedContext);
  }
}
```

### **Build Effort:** 3 hours

### **Files to Modify:**

- ✅ `packages/worker/src/services/AgentRouter.ts` (modify)
- ✅ `packages/worker/src/types/shared.ts` (add types)

---

## 🔴 CRITICAL (Developer): VOICE SERVICES

### **What It Is:**

Speech-to-Text (STT) and Text-to-Speech (TTS) services for voice-first agents.

### **Why It's Critical:**

- **PA Agent is voice-first!**
- Cannot function without voice capabilities
- Blocks PA Agent development

### **Status:**

- ✅ Specified (DARTMOUTH_VOICE_SERVICES_SPECIFICATION.md)
- ❌ Not built yet
- 🚧 Developer building (Week 2-3)

### **Not blocking Sales Agent** - Sales Agent is text-based

---

## 🟡 HIGH (Developer): CALENDAR/EMAIL INTEGRATION

### **What It Is:**

Google Calendar API and Email integration for PA Agent.

### **Why It's Important:**

- PA Agent needs calendar access
- PA Agent needs email notifications
- Core PA Agent features

### **Status:**

- ❌ Not built yet
- 🚧 Developer building (Week 3-4)

### **Not blocking Sales Agent** - Sales Agent uses existing EmailService

---

## 📊 BUILD PRIORITY FOR SALES AGENT

### **Must Build (Blocks Sales Agent):**

1. 🔴 **Knowledge Domain System** (10h) - CRITICAL
2. 🔴 **Shopify Integration Service** (15h) - CRITICAL

### **Should Build (Recommended):**

3. 🟡 **Agent Context Passing** (3h) - HIGH

### **Not Needed (Developer building for PA Agent):**

4. ⚪ Voice Services - Not needed for Sales Agent
5. ⚪ Calendar/Email - Not needed for Sales Agent

---

## 🎯 TOTAL BUILD EFFORT

### **For Sales Agent to work:**

| Component | Effort | Who Builds |
|-----------|--------|------------|
| Knowledge Domain System | 10h | YOU |
| Shopify Integration Service | 15h | YOU |
| Agent Context Passing | 3h | YOU |
| **TOTAL DOS Infrastructure** | **28h** | **YOU** |
| | |
| Sales Agent Implementation | 15h | YOU |
| **TOTAL** | **43h** | **YOU** |

### **For PA Agent to work:**

| Component | Effort | Who Builds |
|-----------|--------|------------|
| Voice Services | 20h | Developer |
| Calendar/Email Integration | 15h | Developer |
| JWT Auth | 10h | Developer |
| PA Agent Implementation | 40h | Developer |
| **TOTAL** | **85h** | **Developer** |

---

## 📅 TIMELINE

### **Week 2-3 (YOU):**
- Day 1-2: Knowledge Domain System (10h)
- Day 3-4: Shopify Integration Service (15h)
- Day 5: Agent Context Passing (3h)
- Day 6-7: Sales Agent Implementation (15h)

**Total: 43 hours (5-6 days)**

### **Week 2-4 (Developer):**
- Week 2-3: Voice Services (20h)
- Week 3-4: Calendar/Email (15h)
- Week 4: JWT Auth (10h)
- Week 5-7: PA Agent (40h)

**Total: 85 hours (10-11 days)**

---

## ✅ SUCCESS CRITERIA

**DOS Infrastructure is successful if:**

1. ✅ Multiple agents can share knowledge across domains
2. ✅ Agents can access Shopify product/pricing data
3. ✅ Agents can seamlessly hand off conversations
4. ✅ No latency increase (single query with IN clause)
5. ✅ Access control works (agents only see permitted domains)
6. ✅ Auto-sync works (Shopify data updates daily)

---

## 🚀 NEXT STEPS

1. ✅ Requirements defined
2. 🔴 Build Knowledge Domain System
3. 🔴 Build Shopify Integration Service
4. 🟡 Build Agent Context Passing
5. 🔴 Build Sales Agent
6. 🟢 Test multi-agent workflows
7. 🟢 Deploy to production

---

**Status:** Ready to build! 🚀



