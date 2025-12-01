# 🏗️ DARTMOUTH OS ARCHITECTURE

**Version:** 3.0  
**Date:** November 28, 2025  
**Status:** Complete Architecture Definition  
**Purpose:** Crystal-clear separation of Dartmouth OS vs Applications

---

## 🎯 **THE KEY DISTINCTION**

### **Dartmouth OS = The Operating System**
Think: Windows, macOS, Linux

### **Applications = Programs That Run On It**
Think: Microsoft Word, Slack, Spotify

---

## 📊 **ARCHITECTURE OVERVIEW**

```
┌─────────────────────────────────────────────────────────────┐
│  APPLICATION LAYER (Agent-Specific Systems)                 │
│  ───────────────────────────────────────────────────────── │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐│
│  │ Customer Service│  │ Sales Agent     │  │ Production  ││
│  │ System          │  │ System          │  │ Agent       ││
│  │                 │  │                 │  │             ││
│  │ • Gmail         │  │ • Quote Gen     │  │ • Artwork   ││
│  │ • CS Agent      │  │ • Sales Agent   │  │ • Prod Mgmt ││
│  │ • CS Dashboard  │  │ • Sales Dash    │  │ • Prod Dash ││
│  │ • CS Handlers   │  │ • Sales Handlers│  │ • Handlers  ││
│  └─────────────────┘  └─────────────────┘  └─────────────┘│
│           ↓                    ↓                    ↓       │
└───────────┼────────────────────┼────────────────────┼───────┘
            │                    │                    │
            ↓                    ↓                    ↓
┌─────────────────────────────────────────────────────────────┐
│  DARTMOUTH OS (Shared Platform)                             │
│  ───────────────────────────────────────────────────────── │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  CORE FRAMEWORK (Agent Foundation)                   │  │
│  │  • BaseAgent                                         │  │
│  │  • AgentRegistry, AgentRouter, AgentOrchestrator    │  │
│  │  • Memory System (4 types)                          │  │
│  │  • RAG Engine                                        │  │
│  │  • Conversation Quality Validator                   │  │
│  │  • Intent Detection                                  │  │
│  │  • Empathy Injector, Frustration Handler            │  │
│  │  • Repetition Detector, Constraint Validator        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SHARED INTEGRATIONS (Multi-Agent Access)            │  │
│  │  • ShopifyIntegration    ← Sales, CS, Product use   │  │
│  │  • PERPIntegration       ← CS, Production, Artwork  │  │
│  │  • ProductKnowledgeSystem ← Sales, CS use           │  │
│  │  • CalendarScheduler     ← Multiple agents use      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SHARED SERVICES (Cross-Department)                  │  │
│  │  • TicketManager         ← All agents can create    │  │
│  │  • AuthenticationService ← All dashboards use       │  │
│  │  • InternalCommunicationSystem ← All staff use      │  │
│  │  • WebSocketService      ← All dashboards use       │  │
│  │  • AnalyticsService      ← All agents report        │  │
│  │  • AgentHandoffProtocol  ← All agents handoff       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  INFRASTRUCTURE (Cloudflare Workers)                 │  │
│  │  • D1 Database (SQLite)                             │  │
│  │  • KV Store (Key-Value)                             │  │
│  │  • Durable Objects (WebSockets)                     │  │
│  │  • Workers AI (Embeddings)                          │  │
│  │  • OpenAI GPT-4o-mini (LLM)                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 **WHAT IS DARTMOUTH OS?**

### **Definition:**
Dartmouth OS is a **unified AI agent operating system** that provides:
1. **Core Framework** - Foundation for building specialized agents
2. **Shared Integrations** - APIs used by multiple agents
3. **Shared Services** - Cross-department functionality
4. **Infrastructure** - Database, storage, compute

### **Analogy:**
- **Dartmouth OS** = iPhone iOS
- **Customer Service System** = WhatsApp app
- **Sales Agent System** = Uber app
- **McCarthy Artwork Agent** = Instagram app

All apps run on the same OS, but each does something different.

---

## 📦 **DARTMOUTH OS COMPONENTS**

### **1. CORE FRAMEWORK (100% Complete ✅)**

**Location:** `packages/dartmouth-core/`

| Component | Purpose | Status |
|-----------|---------|--------|
| **BaseAgent** | Foundation for all agents | ✅ Built |
| **AgentRegistry** | Register and discover agents | ✅ Built |
| **AgentRouter** | Route requests to agents | ✅ Built |
| **AgentOrchestrator** | Coordinate multiple agents | ✅ Built |
| **MemorySystem** | 4 types of memory | ✅ Built |
| **RAGEngine** | Knowledge base search | ✅ Built |
| **ConversationQualityValidator** | Ensure quality responses | ✅ Built |
| **IntentDetector** | Classify user intent | ✅ Built |
| **EmpathyInjector** | Add empathy to responses | ✅ Built |
| **FrustrationHandler** | Detect and handle frustration | ✅ Built |
| **RepetitionDetector** | Detect repetitive questions | ✅ Built |
| **ConstraintValidator** | Enforce agent constraints | ✅ Built |

**What It Provides:**
- Every agent extends `BaseAgent`
- Every agent gets memory, RAG, quality validation, empathy, etc.
- No agent needs to rebuild these features

---

### **2. SHARED INTEGRATIONS (100% Complete ✅)**

**Location:** `packages/worker/src/services/`

| Integration | Used By | Status |
|-------------|---------|--------|
| **ShopifyIntegration** | Sales Agent, CS Agent, Product Agent | ✅ Built |
| **PERPIntegration** | CS Agent, Production Agent, Artwork Agent | ✅ Built |
| **ProductKnowledgeSystem** | Sales Agent, CS Agent | ✅ Built |

**Why These Are In DOS:**
- **Multiple agents need them**
- **Shared data source** (Shopify, PERP)
- **Centralized caching** (avoid duplicate API calls)
- **Consistent data** (all agents see same product info)

**Example:**
```typescript
// Customer Service Agent
import { ShopifyIntegration, PERPIntegration } from '@/services';

class CustomerServiceAgent extends BaseAgent {
  private shopify: ShopifyIntegration;
  private perp: PERPIntegration;

  async handleOrderStatus(orderNumber: string) {
    // Get order from Shopify (DOS)
    const order = await this.shopify.getOrder(orderNumber);
    
    // Get production status from PERP (DOS)
    const production = await this.perp.getProductionOrder(orderNumber);
    
    return `Your order ${orderNumber} is ${production.status}...`;
  }
}
```

---

### **3. SHARED SERVICES (100% Complete ✅)**

**Location:** `packages/worker/src/services/`

| Service | Used By | Status |
|---------|---------|--------|
| **TicketManager** | CS Agent, Sales Agent, Production Agent | ✅ Built |
| **AuthenticationService** | All Dashboards | ✅ Built |
| **InternalCommunicationSystem** | All Staff | ✅ Built |
| **WebSocketService** | All Dashboards | ✅ Built |
| **AnalyticsService** | All Agents | ✅ Built |
| **AgentHandoffProtocol** | All Agents | ✅ Built |

**Why These Are In DOS:**
- **Cross-department functionality**
- **All staff use them** (not agent-specific)
- **Shared infrastructure** (database, WebSockets)

**Example:**
```typescript
// Sales Agent creates a ticket
import { TicketManager } from '@/services';

class SalesAgent extends BaseAgent {
  private ticketManager: TicketManager;

  async escalateToCS(customerId: string, reason: string) {
    // Create ticket in DOS (shared system)
    await this.ticketManager.createTicket({
      customerId,
      category: 'pricing_question',
      priority: 'high',
      assignedTo: 'customer-service-team'
    });
  }
}
```

---

### **4. INFRASTRUCTURE (100% Complete ✅)**

**Location:** Cloudflare Workers

| Component | Purpose | Status |
|-----------|---------|--------|
| **D1 Database** | SQLite database for persistent data | ✅ Configured |
| **KV Store** | Key-value store for caching | ✅ Configured |
| **Durable Objects** | Stateful WebSocket connections | ✅ Configured |
| **Workers AI** | Embeddings for RAG | ✅ Configured |
| **OpenAI GPT-4o-mini** | LLM for responses | ✅ Configured |

**What It Provides:**
- All agents share the same database
- All agents share the same cache
- All agents share the same compute

---

## 🎯 **WHAT IS AN APPLICATION?**

### **Definition:**
An **application** is a specialized system built **on top of** Dartmouth OS that:
1. **Extends BaseAgent** - Inherits all DOS features
2. **Uses DOS Services** - Leverages shared integrations and services
3. **Adds Specific Features** - Unique to that application

### **Example: Customer Service System**

```
Customer Service System (Application)
├── CustomerServiceAgent.ts       ← Extends BaseAgent (DOS)
├── handlers/
│   ├── OrderStatusHandler.ts     ← Uses ShopifyIntegration (DOS)
│   ├── ProductionStatusHandler.ts ← Uses PERPIntegration (DOS)
│   ├── InvoiceHandler.ts         ← Uses PERPIntegration (DOS)
│   └── GeneralInquiryHandler.ts  ← Uses RAGEngine (DOS)
├── GmailIntegration.ts           ← CS-specific (only CS uses email)
├── SnoozeManager.ts              ← CS-specific (only CS snoozes tickets)
└── CS Dashboard (React)          ← CS-specific UI
```

**What's CS-Specific:**
- ✅ Gmail Integration (only CS monitors email)
- ✅ Customer Service Agent (specific to CS inquiries)
- ✅ CS Handlers (order status, production, invoice)
- ✅ Snooze Manager (only CS snoozes tickets)
- ✅ CS Dashboard (UI for CS staff)

**What's From DOS:**
- ✅ BaseAgent (foundation)
- ✅ ShopifyIntegration (shared)
- ✅ PERPIntegration (shared)
- ✅ TicketManager (shared)
- ✅ AgentHandoffProtocol (shared)
- ✅ InternalCommunicationSystem (shared)
- ✅ AuthenticationService (shared)
- ✅ AnalyticsService (shared)

---

## 📋 **DECISION MATRIX: DOS vs APPLICATION**

### **When to put something in Dartmouth OS:**

| Question | If YES → DOS | If NO → Application |
|----------|--------------|---------------------|
| Will **multiple agents** use this? | ✅ DOS | ❌ Application |
| Will **multiple departments** use this? | ✅ DOS | ❌ Application |
| Is it a **shared resource** (API, database)? | ✅ DOS | ❌ Application |
| Is it **infrastructure**? | ✅ DOS | ❌ Application |

### **Examples:**

| Component | Multiple Agents? | Multiple Departments? | Location |
|-----------|------------------|----------------------|----------|
| **ShopifyIntegration** | ✅ Yes (Sales, CS, Product) | ✅ Yes | **DOS** |
| **PERPIntegration** | ✅ Yes (CS, Production, Artwork) | ✅ Yes | **DOS** |
| **ProductKnowledgeSystem** | ✅ Yes (Sales, CS) | ✅ Yes | **DOS** |
| **TicketManager** | ✅ Yes (CS, Sales, Production) | ✅ Yes | **DOS** |
| **InternalCommunicationSystem** | ✅ Yes (All staff) | ✅ Yes | **DOS** |
| **AuthenticationService** | ✅ Yes (All dashboards) | ✅ Yes | **DOS** |
| **AnalyticsService** | ✅ Yes (All agents) | ✅ Yes | **DOS** |
| **CalendarScheduler** | ✅ Yes (Sales, CS, Production) | ✅ Yes | **DOS** |
| **GmailIntegration** | ❌ No (Only CS) | ❌ No | **CS System** |
| **CustomerServiceAgent** | ❌ No (Only CS) | ❌ No | **CS System** |
| **CS Dashboard** | ❌ No (Only CS) | ❌ No | **CS System** |

---

## 🔄 **REAL-WORLD WORKFLOW EXAMPLE**

### **Scenario: "Where's my order?"**

```
1. Email arrives
   ↓
2. GmailIntegration (CS-specific) fetches email
   ↓
3. TicketManager (DOS) creates ticket
   ↓
4. AgentRouter (DOS) routes to CustomerServiceAgent
   ↓
5. CustomerServiceAgent processes:
   ├─ ShopifyIntegration (DOS) → Get customer & order
   ├─ PERPIntegration (DOS) → Get production status
   ├─ ProductKnowledgeSystem (DOS) → Get product details
   └─ RAGEngine (DOS) → Search knowledge base
   ↓
6. If needs Sales help:
   └─ AgentHandoffProtocol (DOS) → Handoff to Sales Agent
   ↓
7. InternalCommunicationSystem (DOS) → Notify staff
   ↓
8. AnalyticsService (DOS) → Log interaction
   ↓
9. Response sent back to customer
```

**See how:**
- **CS-specific** components (Gmail, CS Agent) handle the unique parts
- **DOS** components (Shopify, PERP, Tickets, Handoff, Analytics) do the heavy lifting

---

## 📂 **PROJECT STRUCTURE**

```
D:\coding\DARTMOUTH_OS_PROJECT\
├── packages\
│   ├── dartmouth-core\              # ✅ DARTMOUTH OS (Core Framework)
│   │   ├── BaseAgent.ts
│   │   ├── AgentRegistry.ts
│   │   ├── AgentRouter.ts
│   │   ├── AgentOrchestrator.ts
│   │   └── components\
│   │       ├── MemorySystem.ts
│   │       ├── RAGEngine.ts
│   │       ├── ConversationQualityValidator.ts
│   │       ├── IntentDetector.ts
│   │       ├── EmpathyInjector.ts
│   │       ├── FrustrationHandler.ts
│   │       ├── RepetitionDetector.ts
│   │       └── ConstraintValidator.ts
│   │
│   ├── worker\                      # ✅ DARTMOUTH OS (Services + Infrastructure)
│   │   ├── src\
│   │   │   ├── services\
│   │   │   │   ├── ShopifyIntegration.ts      # ✅ DOS (shared)
│   │   │   │   ├── PERPIntegration.ts         # ✅ DOS (shared)
│   │   │   │   ├── ProductKnowledgeSystem.ts  # ✅ DOS (shared)
│   │   │   │   ├── TicketManager.ts           # ✅ DOS (shared)
│   │   │   │   ├── AgentHandoffProtocol.ts    # ✅ DOS (shared)
│   │   │   │   ├── AuthenticationService.ts   # ✅ DOS (shared)
│   │   │   │   ├── InternalCommunicationSystem.ts # ✅ DOS (shared)
│   │   │   │   ├── WebSocketService.ts        # ✅ DOS (shared)
│   │   │   │   └── AnalyticsService.ts        # ✅ DOS (shared)
│   │   │   └── index.ts
│   │   └── wrangler.toml
│   │
│   ├── mccarthy-artwork\            # 🎨 APPLICATION (Artwork Agent)
│   │   ├── src\
│   │   │   ├── McCarthyArtworkAgent.ts  # Extends BaseAgent (DOS)
│   │   │   └── handlers\
│   │   │       ├── DPIHandler.ts        # Artwork-specific
│   │   │       ├── SizeHandler.ts       # Artwork-specific
│   │   │       └── HowToHandler.ts      # Artwork-specific
│   │
│   ├── customer-service-agent\      # 🔴 APPLICATION (To Build)
│   │   ├── src\
│   │   │   ├── CustomerServiceAgent.ts  # Extends BaseAgent (DOS)
│   │   │   ├── handlers\
│   │   │   │   ├── OrderStatusHandler.ts     # CS-specific
│   │   │   │   ├── ProductionStatusHandler.ts # CS-specific
│   │   │   │   ├── InvoiceHandler.ts         # CS-specific
│   │   │   │   └── GeneralInquiryHandler.ts  # CS-specific
│   │   │   └── services\
│   │   │       ├── GmailIntegration.ts       # CS-specific
│   │   │       └── SnoozeManager.ts          # CS-specific
│   │
│   └── customer-service-dashboard\  # 🔴 APPLICATION (To Build)
│       └── src\
│           ├── components\
│           │   ├── TicketList.tsx
│           │   ├── TicketDetail.tsx
│           │   └── CustomerPanel.tsx
│           └── App.tsx
```

---

## 📊 **STATUS SUMMARY**

### **Dartmouth OS (Platform) - 85% Complete**

| Component | Status | Notes |
|-----------|--------|-------|
| **Core Framework** | ✅ 100% | BaseAgent, Memory, RAG, Quality, etc. |
| **Shared Integrations** | ✅ 100% | Shopify, PERP, Product Knowledge |
| **Shared Services** | ✅ 100% | Tickets, Auth, Comms, WebSocket, Analytics |
| **Infrastructure** | ✅ 100% | D1, KV, Durable Objects, Workers AI |
| **Optional Features** | ⏳ 15% | Calendar, Advanced Analytics, More Integrations |

### **Applications - 32% Complete**

| Application | Status | Notes |
|-------------|--------|-------|
| **McCarthy Artwork Agent** | ✅ 95% | Deployed, tested, working |
| **Customer Service System** | 🔴 0% | Planning complete, not built |
| **Sales Agent** | 🔴 0% | Not started |
| **Production Agent** | 🔴 0% | Not started |

---

## 🎯 **KEY TAKEAWAYS**

### **1. Dartmouth OS is the Foundation**
- ✅ Provides BaseAgent, Memory, RAG, Quality, etc.
- ✅ Provides Shopify, PERP, Product Knowledge
- ✅ Provides Tickets, Auth, Comms, Analytics
- ✅ 85% complete, production-ready

### **2. Applications are Thin Layers**
- ✅ Extend BaseAgent (inherit all DOS features)
- ✅ Use DOS services (Shopify, PERP, Tickets, etc.)
- ✅ Add application-specific features (Gmail, CS Handlers, Dashboard)
- ✅ Customer Service System is 0% complete (planning done)

### **3. The Rule**
- **Shared by 2+ agents?** → Dartmouth OS
- **Used by 1 agent only?** → Application

### **4. Examples**
- **Shopify, PERP, Product Knowledge** → DOS (multiple agents use)
- **Tickets, Auth, Internal Comms** → DOS (all departments use)
- **Gmail, CS Agent, CS Dashboard** → CS System (only CS uses)

---

## 📝 **NEXT STEPS**

### **Immediate:**
1. ✅ Complete McCarthy Artwork Agent testing (95% → 100%)
2. 🔴 Start Customer Service System (0% → 100%)

### **Customer Service System Build Order:**
1. **Week 1-2:** Gmail Integration, Email-to-Ticket, AI Agent, Snooze, Mentions
2. **Week 3-4:** Backend APIs, Staff Group Chat
3. **Week 5-8:** Dashboard Frontend
4. **Week 9-10:** Testing, Deployment

---

**Document Version:** 3.0  
**Last Updated:** November 28, 2025  
**Status:** Complete Architecture Definition  
**Author:** AI Assistant + John Hutchison


