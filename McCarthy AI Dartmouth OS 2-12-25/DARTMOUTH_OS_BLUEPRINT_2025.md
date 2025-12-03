# 🏛️ MCCARTHY AI DARTMOUTH OS - COMPLETE BLUEPRINT

**Version:** 2.1  
**Date:** December 4, 2025  
**Status:** Active Development  
**Document Type:** Comprehensive System Blueprint

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [What is Dartmouth OS?](#2-what-is-dartmouth-os)
3. [Core Philosophy & Vision](#3-core-philosophy--vision)
4. [System Architecture](#4-system-architecture)
5. [The 9-Layer Stack](#5-the-9-layer-stack)
6. [Agent Architecture (FAM)](#6-agent-architecture-fam)
7. [Current Agents](#7-current-agents)
8. [Integration Ecosystem](#8-integration-ecosystem)
9. [Customer Service System](#9-customer-service-system)
10. [Technical Capabilities](#10-technical-capabilities)
11. [Security & Compliance](#11-security--compliance)
12. [Deployment & Infrastructure](#12-deployment--infrastructure)
13. [Multi-Tenant Configuration](#13-multi-tenant-configuration) ← **NEW**
14. [Business Model](#14-business-model)
15. [Roadmap & Timeline](#15-roadmap--timeline)

---

## 1. EXECUTIVE SUMMARY

### What We're Building

**McCarthy AI Dartmouth OS** is an enterprise-grade, multi-agent AI platform built on Cloudflare's edge infrastructure. It provides a foundation for deploying specialized AI agents that never hallucinate, maintain true memory, and collaborate seamlessly.

### Key Differentiators

| Feature | Traditional Chatbots | McCarthy AI Dartmouth OS |
|---------|---------------------|--------------------------|
| **Memory** | Session only | 4-level persistent memory |
| **Hallucination** | Common | Zero (RAG-verified responses) |
| **Repetition** | Frequent | Detected & prevented |
| **Context** | Limited | Full conversation history |
| **Multi-Agent** | None | Seamless agent collaboration |
| **Speed** | 2-5 seconds | <1 second (cached) |
| **Deployment** | Complex | Cloudflare Workers (edge) |
| **Cost** | $100-500/month | $12-20/month |

### Current Status

- **Overall Completion:** 85%
- **Dartmouth OS Core:** 70% complete
- **Production Agents:** 1 (McCarthy Artwork Agent)
- **In Development:** Customer Service Agent, Sales Agent, PA Agent, PerfectPrint AI
- **Infrastructure:** Cloudflare Workers, D1, KV, Workers AI

---

## 2. WHAT IS DARTMOUTH OS?

### The Foundation for All Agents

Dartmouth OS is **not a single AI agent** - it's an **operating system for AI agents**. Think of it like:

- **iOS/Android** for mobile apps
- **Windows/macOS** for desktop applications
- **Dartmouth OS** for AI agents

### What It Provides

```
┌─────────────────────────────────────────────────────────────┐
│                    DARTMOUTH OS CORE                         │
│                  (The Foundation)                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Universal Capabilities (All Agents Get These)          │ │
│  │  • Conversation Quality System ❤️                       │ │
│  │  • 4-Level Memory System                                │ │
│  │  • RAG Engine (Zero Hallucination)                      │ │
│  │  • Intent Detection                                     │ │
│  │  • Agent Orchestration                                  │ │
│  │  • Security & Compliance                                │ │
│  │  • Monitoring & Analytics                               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ McCarthy        │ │ Customer        │ │ Sales           │
│ Artwork Agent   │ │ Service Agent   │ │ Agent           │
│                 │ │                 │ │                 │
│ Specialized:    │ │ Specialized:    │ │ Specialized:    │
│ • DPI calc      │ │ • Order status  │ │ • Pricing       │
│ • Color analysis│ │ • Production    │ │ • Quotes        │
│ • Quality check │ │ • Escalation    │ │ • Upselling     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### The Analogy

**Building an AI agent without Dartmouth OS is like:**
- Building a mobile app without iOS/Android
- Building a website without a web framework
- Building a car without a chassis

**You'd have to build:**
- Memory system from scratch
- Security from scratch
- Monitoring from scratch
- Agent routing from scratch
- RAG system from scratch
- Quality control from scratch

**With Dartmouth OS, you just build:**
- Your agent's specialized skills (handlers)
- Your agent's personality (system prompt)
- Your agent's knowledge (domain-specific docs)

---

## 3. CORE PHILOSOPHY & VISION

### Our Philosophy

> **"Build the foundation once, deploy infinite agents"**

**Key Principles:**

1. **Zero Hallucination**
   - All facts verified through RAG
   - No free-form generation without sources
   - Citation validation before response

2. **True Memory**
   - Short-term (conversation)
   - Long-term (customer history)
   - Semantic (learned knowledge)
   - Episodic (past interactions)

3. **Conversation Quality**
   - Repetition detection
   - Frustration handling
   - Empathy injection
   - Natural tone

4. **Multi-Agent Collaboration**
   - Seamless handoffs
   - Context preservation
   - Unified experience
   - No "agent ping-pong"

5. **Edge-First Architecture**
   - Deploy to Cloudflare's global network
   - <50ms latency worldwide
   - Infinite scale
   - Zero infrastructure management

### The Vision

**Short-term (2025):**
- 3 production agents (Artwork, Customer Service, Sales)
- Customer Service Dashboard operational
- Email System V2 with AI integration
- 70-80% automation rate

**Mid-term (2026):**
- 10+ specialized agents
- Multi-tenant SaaS platform
- Admin dashboard for self-service
- Voice & multi-modal capabilities

**Long-term (2027+):**
- Agent marketplace
- White-label platform
- Industry-specific agent packs
- Global agent network

---

## 4. SYSTEM ARCHITECTURE

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMER CHANNELS                         │
│  Email │ Live Chat │ WhatsApp │ Instagram │ Facebook │ SMS  │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────▼──────────────┐
         │  OMNICHANNEL ROUTER          │
         │  (Cloudflare Worker)         │
         └───────────────┬──────────────┘
                         │
         ┌───────────────▼──────────────┐
         │  DARTMOUTH OS CORE           │
         │  • Agent Registry            │
         │  • Agent Router              │
         │  • RAG Engine                │
         │  • Memory System             │
         │  • Quality Control           │
         └───────────────┬──────────────┘
                         │
         ┌───────────────▼──────────────┐
         │  AGENT ORCHESTRATOR          │
         │  (Routes to correct agent)   │
         └───────────────┬──────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
    ▼                    ▼                    ▼
┌─────────┐        ┌─────────┐        ┌─────────┐
│Artwork  │        │Customer │        │ Sales   │
│ Agent   │        │Service  │        │ Agent   │
└────┬────┘        └────┬────┘        └────┬────┘
     │                  │                   │
     └──────────────────┼───────────────────┘
                        │
         ┌──────────────▼─────────────┐
         │  INTEGRATION LAYER         │
         │  • Shopify                 │
         │  • PERP                    │
         │  • Stripe                  │
         │  • Twilio                  │
         │  • Resend                  │
         └────────────────────────────┘
```

### Technology Stack

**Platform:**
- **Cloudflare Workers** - Serverless compute (edge)
- **Cloudflare D1** - SQLite database (edge-replicated)
- **Cloudflare KV** - Key-value store (caching)
- **Cloudflare Workers AI** - Embeddings generation
- **Cloudflare R2** - Object storage (files, images)

**AI/ML:**
- **Anthropic Claude** - Primary LLM (Sonnet 4.5)
- **OpenAI GPT-4** - Fallback LLM
- **Workers AI** - Embeddings (@cf/baai/bge-base-en-v1.5)

**Frontend:**
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **TanStack Query** - Data fetching

**Backend:**
- **TypeScript** - Language
- **Hono** - Web framework (Cloudflare Workers)
- **Zod** - Schema validation
- **JWT** - Authentication

**Email:**
- **Cloudflare Email Routing** - Inbound email
- **Resend** - Outbound email (threading support)

**Monitoring:**
- **Cloudflare Analytics** - Performance metrics
- **Sentry** - Error tracking (planned)
- **Custom Analytics** - Agent performance

---

## 5. THE 9-LAYER STACK

### Layer 1: Monitoring & Health (90% Complete)

**Purpose:** System health, performance tracking, SLA monitoring

**Components:**
- ✅ Health Monitoring Service
- ✅ SLA Tracking
- ✅ Analytics Engine
- ✅ Performance Metrics

**Status:** Production-ready

---

### Layer 2: Performance & Optimization (80% Complete)

**Purpose:** Speed, caching, rate limiting

**Components:**
- ✅ Multi-tier Caching Service (KV + in-memory)
- ✅ Rate Limiting (per user, per IP)
- 🟡 Context Window Manager (partial)

**Caching Strategy:**
```typescript
// 3-tier caching
1. In-memory (Worker) - <1ms
2. KV Store (Edge) - ~5ms
3. D1 Database (Edge) - ~20ms
```

**Status:** Production-ready, optimization ongoing

---

### Layer 3: Security & Compliance (70% Complete)

**Purpose:** Authentication, authorization, data privacy

**Components:**
- ✅ JWT Authentication (70%)
- ✅ Role-Based Access Control (RBAC)
- ✅ Data Encryption (at rest & in transit)
- 🟡 Multi-user support (partial)
- ❌ GDPR compliance tools (planned)

**Security Features:**
- JWT tokens with refresh
- Password hashing (bcrypt)
- HTTPS only
- CORS protection
- Rate limiting
- SQL injection prevention
- XSS protection

**Status:** Core security working, advanced features pending

---

### Layer 4: Integration & Communication (10% Complete)

**Purpose:** External integrations, webhooks, event bus

**Components:**
- ✅ Email Integration (30% - Resend working)
- ❌ Shopify Integration (0%)
- ❌ PERP Integration (0%)
- ❌ Webhook System (0%)
- ❌ Event Bus (0%)
- ❌ Calendar Integration (0%)

**Critical Gap:** Blocks multiple agents

**Status:** Major work needed (Phase 3)

---

### Layer 5: Intelligence & Learning (95% Complete)

**Purpose:** RAG, sentiment analysis, intent detection

**Components:**
- ✅ RAG Engine (100%)
  - Document ingestion
  - Embedding generation
  - Semantic search
  - Citation validation
- ✅ Sentiment Analyzer (100%)
- ✅ Intent Detection (100%)
- ✅ Personality Engine (100%)
- 🟡 Learning System (85% - memory working, learning pending)

**RAG Architecture:**
```typescript
// Document → Chunks → Embeddings → Vector Search
1. Ingest document (Markdown, PDF, TXT)
2. Split into chunks (500 chars)
3. Generate embeddings (Workers AI)
4. Store in D1 with agent_id tag
5. Query: Generate query embedding
6. Cosine similarity search
7. Return top-K chunks (default: 5)
8. Validate citations in response
```

**Status:** Excellent, core intelligence working

---

### Layer 6: User Experience (20% Complete)

**Purpose:** Conversation quality, response formatting

**Components:**
- ✅ Conversation Quality System (100%)
  - Repetition detection
  - Frustration handling
  - Empathy injection
  - Response validation
- 🟡 Response Formatting (20%)
- ❌ Multi-language Support (0%)

**Conversation Quality:**
```typescript
// Before sending response:
1. Check for repetition (last 3 messages)
2. Detect frustration in user message
3. Inject empathy if needed
4. Validate response quality
5. Check word count (not too long)
6. Verify facts (RAG citations)
7. Add personality touches
```

**Status:** Quality system excellent, formatting needs work

---

### Layer 7: Voice & Audio Services (0% Complete)

**Purpose:** Speech-to-text, text-to-speech, audio streaming

**Components:**
- ❌ Speech-to-Text (STT)
- ❌ Text-to-Speech (TTS)
- ❌ Audio Streaming
- ❌ Voice Activity Detection (VAD)
- ❌ Interrupt Handling
- ❌ Audio Processing

**Blockers:** PA Agent (voice is primary interface)

**Status:** Not started (separate developer building)

---

### Layer 8: Multi-Modal Intelligence (0% Complete)

**Purpose:** Vision, document intelligence, audio analysis

**Components:**
- ❌ Vision-Language Models
- ❌ Document Intelligence
- ❌ Audio Analysis
- ❌ Multi-Modal Context Fusion

**Status:** Future phase, not blocking current agents

---

### Layer 9: Orchestration & Workflows (60% Complete)

**Purpose:** Agent routing, multi-agent collaboration

**Components:**
- ✅ Agent Registry (100%)
- ✅ Agent Router (100%)
- ✅ Agent Orchestrator (100%)
- ❌ Workflow Engine (0%)
- 🟡 Cross-Agent Memory (20%)

**Agent Routing:**
```typescript
// How agents collaborate:
1. Customer asks question
2. Router detects intent
3. Routes to appropriate agent
4. Agent processes with context
5. If needed, hand off to another agent
6. Return unified response
```

**Status:** Core routing working, advanced workflows pending

---

## 6. AGENT ARCHITECTURE (FAM)

### FAM: Foundational Agent Model

**What is FAM?**

FAM (Foundational Agent Model) is the base class that all agents extend. It provides:

- Conversation management
- Memory system
- RAG integration
- Intent detection
- Response validation
- Quality control
- Agent handoffs

### BaseAgent Architecture

```typescript
class BaseAgent {
  // Universal capabilities
  protected memory: MemorySystem
  protected rag: RAGEngine
  protected quality: ConversationQuality
  protected intents: IntentDetector
  protected router: ResponseRouter
  
  // Agent metadata
  public readonly type: string
  public readonly name: string
  public readonly version: string
  
  // Core methods
  async processMessage(message: string, sessionId: string): Promise<Response>
  async detectIntent(message: string): Promise<Intent>
  async retrieveContext(query: string): Promise<RAGResult>
  async validateResponse(response: string): Promise<boolean>
  async handoffToAgent(targetAgent: string, context: Context): Promise<Response>
}
```

### How Agents Extend FAM

```typescript
class McCarthyArtworkAgent extends BaseAgent {
  // Agent-specific metadata
  public readonly type = 'artwork_analyzer'
  public readonly name = 'McCarthy Artwork Agent'
  public readonly version = '1.0.0'
  
  // Agent-specific handlers
  private handlers = [
    new SizeCalculationHandler(),
    new InformationHandler(),
    new HowToHandler(),
    new ArtworkAnalysisHandler(),
    new GeneralInquiryHandler()
  ]
  
  // Minimal override - most logic in BaseAgent
  async processMessage(message: string, sessionId: string): Promise<Response> {
    // 1. BaseAgent detects intent
    const intent = await this.detectIntent(message)
    
    // 2. Route to appropriate handler
    const handler = this.findHandler(intent)
    
    // 3. Handler processes with BaseAgent services
    const response = await handler.handle(message, intent, {
      memory: this.memory,
      rag: this.rag,
      quality: this.quality
    })
    
    // 4. BaseAgent validates response
    await this.validateResponse(response)
    
    return response
  }
}
```

### Handler Pattern

```typescript
interface Handler {
  canHandle(intent: string): boolean
  handle(message: string, intent: Intent, context: Context): Promise<Response>
}

class SizeCalculationHandler implements Handler {
  canHandle(intent: string): boolean {
    return intent === 'calculate_size' || intent === 'calculate_dpi'
  }
  
  async handle(message: string, intent: Intent, context: Context): Promise<Response> {
    // 1. Extract parameters from message
    const { width, height, unit } = this.extractDimensions(message)
    
    // 2. Perform calculation (pre-computed lookup)
    const dpi = this.calculateDPI(width, height, unit)
    
    // 3. Format response
    return {
      content: `At ${width}${unit} wide: ${dpi} DPI (${this.getQuality(dpi)})`,
      metadata: { intent, handler: 'SizeCalculationHandler', confidence: 1.0 }
    }
  }
}
```

---

## 7. CURRENT AGENTS

### 7.1 McCarthy Artwork Agent (100% Built, 85% Tested)

**Purpose:** Artwork analysis for DTF/UV DTF printing

**Status:** ✅ Production-ready (pending final testing)

**Capabilities:**
- DPI calculations (forward & reverse)
- Color palette extraction
- Transparency detection
- ICC profile checking
- File format validation
- Print size recommendations
- Quality assessment
- How-to guidance (YouTube tutorials)

**Handlers:**
1. **SizeCalculationHandler** - DPI calculations
2. **InformationHandler** - DTF/UV DTF knowledge (RAG)
3. **HowToHandler** - Step-by-step guides
4. **ArtworkAnalysisHandler** - Color, transparency, format
5. **GeneralInquiryHandler** - Catch-all with RAG

**Knowledge Base:**
- DPI Quality Standards
- DTF Artwork Requirements
- UV DTF Artwork Requirements
- DTF vs UV DTF Applications
- How-to guides (resize, DPI, transparency, ICC profiles)

**Deployment:**
- URL: https://artwork-analyser-ai-agent-1qo.pages.dev
- Platform: Cloudflare Pages + Workers
- Status: Live, pending final testing

**Testing Status:**
- 17 critical fixes applied (Nov 27)
- 42 tests to run (17 failed + 25 untested)
- Target: 88% pass rate for production-ready

---

### 7.2 Customer Service Agent (100% Built, 0% Integrated)

**Purpose:** Customer service automation for e-commerce

**Status:** ✅ Code complete, ❌ Not integrated

**Capabilities:**
- Order status inquiries (Shopify)
- Production status updates (PERP)
- Invoice retrieval (PERP)
- General customer support
- Auto-escalation (confidence, sentiment, VIP)
- Auto-reply or draft-for-approval modes

**Handlers:**
1. **OrderStatusHandler** - Shopify order lookups
2. **ProductionStatusHandler** - PERP production tracking
3. **InvoiceHandler** - PERP invoice retrieval
4. **GeneralInquiryHandler** - RAG + empathy

**Integration Points:**
- Shopify API (orders, customers, products)
- PERP Database (production, artwork, invoices)
- Email System V2 (Resend)
- Customer Service Dashboard

**What's Missing:**
- Not integrated into ticket workflow
- No AI draft response UI in dashboard
- Shopify/PERP credentials not configured

**Timeline:** Phase 1 (35 hours)

---

### 7.3 Sales Agent (5% Complete - Spec Only)

**Purpose:** Sales intelligence, pricing, quotes

**Status:** 📋 Specification complete, ❌ Not built

**Capabilities:**
- Price calculations (volume discounts, tax, regional)
- Quote generation (text + PDF)
- Upsell/cross-sell recommendations
- Customer qualification (discovery questions)
- Inventory checks
- Multi-currency support
- Payment plan options
- Quote follow-up

**Handlers:**
1. **PricingHandler** - Calculate prices, discounts, tax
2. **QuoteHandler** - Build quotes, generate PDF
3. **SalesStrategyHandler** - Upsell, cross-sell, bundles
4. **QualificationHandler** - Discovery questions, lead scoring

**Dependencies:**
- Dartmouth OS Core (Knowledge Domains, Shopify Integration)
- Cannot start until Phase 3 complete

**Timeline:** Phase 4 (27 hours)

---

### 7.4 PA Agent (20% Complete - Separate Developer)

**Purpose:** Personal assistant (calendar, email, tasks)

**Status:** 🚧 In development (Week 2 of 8)

**Capabilities:**
- Calendar management (Google Calendar)
- Email assistance (drafting, sending)
- Task management (reminders)
- Meeting scheduling
- Note-taking

**Status:** Separate developer, not part of current plan

---

### 7.5 PerfectPrint AI (5% Complete - Active Development)

**Purpose:** Automated artwork preparation for DTF/UV DTF printing

**Status:** 🚧 Phase 0 complete, Week 1 starting

**Capabilities:**
- AI upscaling (2x-8x) using Real-ESRGAN/SwinIR
- Background removal (98-99% accuracy) using BRIA-RMBG-2.0/SAM
- Drop shadow detection and removal
- Transparency fixing for DTF printing
- Image classification (logo, artwork, photo, text)
- Smart vectorization routing (VTracer/StarVector/Potrace)
- 7 halftoning styles
- Fade-to-fabric effects
- Line thickness detection
- Color knockout (garment matching)
- ICC color correction
- Batch processing

**Architecture:**
- Frontend: Next.js (Cloudflare Pages)
- API: Cloudflare Worker (Hono)
- Processing: Python FastAPI (Google Cloud Run)
- GPU: StarVector (Modal.com)
- Storage: R2, D1, KV

**Integration with Dartmouth OS:**
- McCarthy Artwork Agent can call PerfectPrint AI API
- Automated artwork fixes before DPI analysis
- Seamless workflow integration

**Timeline:**
- Phase 0: 85% complete (Nov 19, 2025)
- Week 1 (API Layer): Starting
- Week 2-4 (Processing Pipeline): Dec 2025
- Week 5-6 (Frontend): Dec 2025
- Week 7 (MVP 2 Features): Jan 2026
- Launch: Late January 2026

**Cost:** $0/month for up to 10,000 images (free tiers)

**Repository:** `D:\coding\PerfectPrint AI\`

---

## 8. INTEGRATION ECOSYSTEM

### Current Integrations

**Email (100% Complete):**
- **Inbound:** Cloudflare Email Routing
- **Outbound:** Resend API
- **Features:** Threading, MIME parsing, scheduled sending
- **Status:** ✅ Production-ready

**Authentication (70% Complete):**
- **Method:** JWT tokens
- **Features:** Login, logout, refresh, RBAC
- **Status:** ✅ Working, multi-user pending

### Planned Integrations (Phase 3)

**Shopify (0% Complete):**
- **Purpose:** E-commerce data
- **Endpoints:** Products, orders, customers, inventory, pricing
- **Agents:** Customer Service, Sales
- **Status:** ❌ Not started

**PERP (0% Complete):**
- **Purpose:** Production management
- **Endpoints:** Production status, artwork approval, invoices
- **Agents:** Customer Service
- **Status:** ❌ Not started

**Stripe (0% Complete):**
- **Purpose:** Payments
- **Endpoints:** Payment links, invoices, subscriptions
- **Agents:** Sales
- **Status:** ❌ Not started

**Twilio (0% Complete):**
- **Purpose:** SMS, WhatsApp, Voice
- **Endpoints:** Send SMS, WhatsApp messages, voice calls
- **Agents:** Customer Service, Sales
- **Status:** ❌ Not started

### Integration Architecture

```typescript
// Shared integration service
class ShopifyIntegration {
  constructor(
    private tenantId: string,
    private agentId: string,
    private config: ShopifyConfig
  ) {}
  
  // Permission-checked methods
  async getProduct(productId: string) {
    await this.checkPermission('products:read')
    // ...
  }
  
  async getOrders(customerId: string) {
    await this.checkPermission('orders:read')
    // ...
  }
}

// Permission matrix
const permissions = {
  'customer-service': ['products:read', 'orders:read', 'customers:read'],
  'sales-agent': ['products:read', 'pricing:read', 'inventory:read'],
  'artwork-agent': ['products:read']
}
```

---

## 9. CUSTOMER SERVICE SYSTEM

### Overview

The Customer Service System is a complete omnichannel customer support platform with AI automation.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMER CHANNELS                         │
│  Email │ Live Chat │ WhatsApp │ Instagram │ Facebook        │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────▼──────────────┐
         │  EMAIL SYSTEM V2             │
         │  • Cloudflare Email Routing  │
         │  • MIME parsing              │
         │  • Email threading           │
         │  • Resend outbound           │
         └───────────────┬──────────────┘
                         │
         ┌───────────────▼──────────────┐
         │  TICKET MANAGER              │
         │  • Create/update tickets     │
         │  • Priority detection        │
         │  • Sentiment detection       │
         │  • Category detection        │
         └───────────────┬──────────────┘
                         │
         ┌───────────────▼──────────────┐
         │  AI AGENT PROCESSOR          │
         │  • Invoke Customer Service   │
         │  • Generate draft response   │
         │  • Calculate confidence      │
         │  • Escalate if needed        │
         └───────────────┬──────────────┘
                         │
         ┌───────────────▼──────────────┐
         │  CUSTOMER SERVICE DASHBOARD  │
         │  • Ticket list               │
         │  • Ticket detail             │
         │  • AI draft response panel   │
         │  • Reply functionality       │
         │  • Schedule messages         │
         └──────────────────────────────┘
```

### Email System V2 (100% Complete)

**Why we built it:**
- Gmail API didn't support proper email threading
- Needed full control over threading headers
- Wanted serverless, edge-based solution

**Features:**
- ✅ Cloudflare Email Routing (inbound)
- ✅ MIME parsing (multipart, base64, quoted-printable)
- ✅ Email threading (In-Reply-To, References headers)
- ✅ Conversation tracking
- ✅ Automatic ticket creation
- ✅ Resend integration (outbound)
- ✅ Scheduled message sending (cron job every 5 minutes)
- ✅ Threading tested in Gmail, Outlook, Proton

**Status:** ✅ Production-ready

### Customer Service Dashboard (98% Complete)

**Features:**
- ✅ Ticket list view with filters
  - Platform, status, priority, sentiment, assignment, time
  - Sticky header (stays visible on scroll)
  - Responsive table (no horizontal scroll)
- ✅ Ticket detail view
  - Full conversation history
  - Customer information panel
  - Reply functionality
  - Schedule reply (defaults to tomorrow @ 9 AM)
  - Internal notes
  - Scheduled message indicator (blue clock icon)
- ✅ Ticket management
  - Auto-detect priority (5 levels)
  - Auto-detect sentiment (4 levels)
  - Auto-detect category (10+ categories)
  - Assign to staff
  - Update status/priority
  - Snooze tickets
  - Resolve/close tickets

**What's Missing:**
- ❌ AI Draft Response panel (Phase 1)
- ❌ Bulk ticket reassignment (Phase 2)
- ❌ Email signatures (Phase 2)
- ❌ Merge tickets (Phase 2)

**Status:** ✅ Production-ready, missing AI integration

### Ticket Manager (100% Complete)

**Purpose:** Centralized service for ticket lifecycle management

**Features:**
- ✅ Create tickets from normalized messages
- ✅ Auto-detect priority (urgent, critical, high, normal, low)
- ✅ Auto-detect sentiment (angry, negative, neutral, positive)
- ✅ Auto-detect category (order_status, artwork_issue, etc.)
- ✅ Add messages to tickets
- ✅ Add internal notes
- ✅ Assign/reassign tickets
- ✅ Escalate tickets
- ✅ Snooze tickets
- ✅ Resolve/close tickets
- ✅ SLA calculation

**Detection Algorithms:**

```typescript
// Priority detection
const priorityKeywords = {
  urgent: ['urgent', 'asap', 'immediately', 'emergency'],
  critical: ['critical', 'broken', 'down', 'not working'],
  high: ['important', 'soon', 'quickly', 'priority'],
  normal: ['when', 'could', 'would like'],
  low: ['whenever', 'no rush', 'eventually']
}

// Sentiment detection
const sentimentKeywords = {
  angry: ['furious', 'angry', 'ridiculous', 'unacceptable'],
  negative: ['disappointed', 'unhappy', 'frustrated', 'problem'],
  neutral: ['question', 'inquiry', 'wondering', 'asking'],
  positive: ['thank', 'great', 'excellent', 'appreciate']
}
```

**Status:** ✅ Production-ready

---

## 10. TECHNICAL CAPABILITIES

### Zero Hallucination System

**How it works:**

```typescript
// 1. User asks question
const query = "What's the minimum line thickness for UV DTF?"

// 2. Generate query embedding
const queryEmbedding = await workersAI.generateEmbedding(query)

// 3. Search knowledge base (RAG)
const ragResult = await ragEngine.retrieve('mccarthy-artwork', query, 5)
// Returns top 5 most relevant chunks with similarity scores

// 4. Build context from RAG chunks
const context = ragResult.chunks.map(c => c.text).join('\n\n')

// 5. Generate response with LLM
const response = await llm.generate({
  system: "You are an expert. Use ONLY the provided context.",
  context: context,
  query: query
})

// 6. Validate citations
const validation = ragEngine.validateCitations(response, ragResult)
if (!validation.valid) {
  throw new Error('Response contains uncited information')
}

// 7. Return verified response
return response
```

**Key Points:**
- All facts must come from RAG chunks
- No free-form generation without sources
- Citations validated before sending
- If no relevant chunks found, agent says "I don't know"

### 4-Level Memory System

**1. Short-Term Memory (In-Memory)**
```typescript
// Current conversation only
// Stored in Worker memory
// Lifetime: Duration of conversation
// Use case: Context within session

{
  sessionId: 'sess_123',
  messages: [
    { role: 'user', content: 'What DPI at 28cm?' },
    { role: 'assistant', content: '251 DPI' },
    { role: 'user', content: 'And at 30cm?' } // Uses context
  ]
}
```

**2. Long-Term Memory (KV Store)**
```typescript
// Customer preferences, history
// Stored in Cloudflare KV
// Lifetime: Permanent (or until forgotten)
// Use case: Customer profile, preferences

{
  userId: 'user_456',
  preferences: {
    preferredUnits: 'cm',
    timezone: 'Australia/Sydney',
    lastArtworkSize: '28.5cm x 25.7cm'
  },
  history: {
    totalConversations: 15,
    lastSeen: '2025-12-01T10:00:00Z'
  }
}
```

**3. Semantic Memory (D1 Database)**
```typescript
// Learned knowledge, facts
// Stored in D1 with embeddings
// Lifetime: Permanent
// Use case: Learned patterns, insights

{
  fact: 'Customer prefers UV DTF for hard substrates',
  embedding: [0.123, 0.456, ...],
  confidence: 0.95,
  learnedFrom: ['sess_123', 'sess_456']
}
```

**4. Episodic Memory (D1 Database)**
```typescript
// Conversation history
// Stored in D1
// Lifetime: Permanent (GDPR compliant deletion)
// Use case: "What did we discuss last time?"

{
  sessionId: 'sess_123',
  userId: 'user_456',
  agentId: 'mccarthy-artwork',
  startedAt: '2025-12-01T10:00:00Z',
  endedAt: '2025-12-01T10:15:00Z',
  messageCount: 12,
  topicsDiscussed: ['DPI', 'UV DTF', 'transparency'],
  summary: 'Customer asked about DPI calculations...',
  goalAchieved: true
}
```

### Conversation Quality System

**Repetition Detection:**
```typescript
// Check last 3 messages for repetition
const lastMessages = memory.getLastMessages(3)
const isRepetitive = lastMessages.some(msg => 
  similarity(msg.content, currentResponse) > 0.8
)

if (isRepetitive) {
  // Rephrase or add new information
  currentResponse = await rephrase(currentResponse)
}
```

**Frustration Handling:**
```typescript
// Detect frustration in user message
const frustrationKeywords = [
  'frustrated', 'annoyed', 'confused', 'not working',
  'doesn\'t make sense', 'why isn\'t', 'still not'
]

const isFrustrated = frustrationKeywords.some(keyword =>
  message.toLowerCase().includes(keyword)
)

if (isFrustrated) {
  // Add empathy to response
  response = injectEmpathy(response, 'frustration')
  // Example: "I understand this is frustrating. Let me help..."
}
```

**Response Validation:**
```typescript
// Before sending response
const validation = {
  wordCount: response.split(' ').length,
  hasCitations: ragResult.chunks.length > 0,
  isPolite: checkTone(response),
  isAccurate: validateFacts(response, ragResult)
}

if (validation.wordCount > 150) {
  response = summarize(response) // Too long
}

if (!validation.hasCitations && intent === 'information') {
  throw new Error('Information response without citations')
}
```

### Intent Detection

**Pattern Matching + Semantic:**
```typescript
class IntentDetector {
  // 1. Pattern matching (fast)
  detectByPattern(message: string): Intent | null {
    const patterns = {
      calculate_size: /(\d+\.?\d*)\s*(cm|inch|in|"|mm)/i,
      calculate_dpi: /what.*dpi|dpi.*at|print.*at/i,
      information: /what is|tell me about|explain/i,
      howto: /how (do|can) i|how to|guide|tutorial/i
    }
    
    for (const [intent, pattern] of Object.entries(patterns)) {
      if (pattern.test(message)) {
        return { intent, confidence: 0.9 }
      }
    }
    
    return null
  }
  
  // 2. Semantic detection (slower, more accurate)
  async detectBySemantic(message: string): Promise<Intent> {
    const embedding = await generateEmbedding(message)
    
    // Compare with known intent embeddings
    const intents = await this.db.query(`
      SELECT intent, embedding FROM intent_examples
    `)
    
    const scored = intents.map(i => ({
      intent: i.intent,
      similarity: cosineSimilarity(embedding, i.embedding)
    }))
    
    const best = scored.sort((a, b) => b.similarity - a.similarity)[0]
    
    return {
      intent: best.intent,
      confidence: best.similarity
    }
  }
  
  // 3. Combined approach
  async detect(message: string): Promise<Intent> {
    // Try pattern first (fast)
    const patternIntent = this.detectByPattern(message)
    if (patternIntent && patternIntent.confidence > 0.8) {
      return patternIntent
    }
    
    // Fall back to semantic (accurate)
    return await this.detectBySemantic(message)
  }
}
```

---

## 11. SECURITY & COMPLIANCE

### Authentication & Authorization

**JWT-Based Authentication:**
```typescript
// Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}

// All subsequent requests
Authorization: Bearer {accessToken}
```

**Role-Based Access Control (RBAC):**
```typescript
const roles = {
  admin: {
    permissions: ['*'] // All permissions
  },
  manager: {
    permissions: [
      'tickets:read',
      'tickets:write',
      'tickets:assign',
      'staff:read',
      'settings:read'
    ]
  },
  agent: {
    permissions: [
      'tickets:read',
      'tickets:write',
      'tickets:own' // Only own tickets
    ]
  }
}

// Check permission
if (!user.hasPermission('tickets:assign')) {
  throw new Error('Forbidden')
}
```

### Data Privacy

**Encryption:**
- ✅ HTTPS only (TLS 1.3)
- ✅ Database encryption at rest (Cloudflare D1)
- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ JWT signing (HS256)

**Data Retention:**
- Conversation history: 90 days (configurable)
- Ticket data: Permanent (until customer requests deletion)
- Logs: 30 days
- Analytics: Aggregated only (no PII)

**GDPR Compliance (Planned):**
- Right to access (export user data)
- Right to deletion (delete all user data)
- Right to portability (export in JSON)
- Consent management
- Data processing agreements

### Rate Limiting

```typescript
// Per user
const userLimit = {
  requests: 100,
  window: 60 // 100 requests per minute
}

// Per IP
const ipLimit = {
  requests: 1000,
  window: 3600 // 1000 requests per hour
}

// Per agent
const agentLimit = {
  requests: 10,
  window: 60 // 10 agent calls per minute
}
```

---

## 12. DEPLOYMENT & INFRASTRUCTURE

### Cloudflare Workers Architecture

**Why Cloudflare Workers?**

1. **Edge Computing**
   - Deploy to 300+ locations worldwide
   - <50ms latency globally
   - Automatic failover

2. **Serverless**
   - No infrastructure management
   - Infinite scale
   - Pay per request ($0.50 per million requests)

3. **Integrated Platform**
   - Workers (compute)
   - D1 (database)
   - KV (cache)
   - R2 (storage)
   - Workers AI (embeddings)
   - Email Routing

4. **Cost Effective**
   - Free tier: 100,000 requests/day
   - Paid: $5/month + usage
   - No idle costs

### Deployment Process

```bash
# 1. Build frontend
cd packages/customer-service-dashboard
npm run build

# 2. Deploy worker
cd packages/worker
npx wrangler deploy

# 3. Run migrations
npx wrangler d1 migrations apply dartmouth-os-db --remote

# 4. Deploy frontend
cd packages/customer-service-dashboard
npx wrangler pages deploy dist

# 5. Configure secrets
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put JWT_SECRET
```

### Environments

**Development:**
- Local: `npm run dev` (Wrangler local mode)
- Database: Local D1 (`.wrangler/state/v3/d1`)
- Logs: Console

**Staging:**
- URL: `https://staging.dartmouth-os.com`
- Database: Staging D1
- Logs: Cloudflare Dashboard

**Production:**
- URL: `https://api.dartmouth-os.com`
- Database: Production D1
- Logs: Cloudflare Dashboard + Sentry

### Monitoring

**Cloudflare Analytics:**
- Request count
- Error rate
- Response time (p50, p95, p99)
- Cache hit rate
- Bandwidth usage

**Custom Metrics:**
- Agent performance (response time, accuracy)
- Ticket metrics (created, resolved, escalated)
- AI automation rate
- Customer satisfaction (CSAT)

---

## 13. MULTI-TENANT CONFIGURATION

### Overview

Dartmouth OS is designed as a **multi-tenant SaaS platform** that can be deployed for any country or region. Regional settings are configurable at two levels:

1. **Tenant Level (Dartmouth OS Settings)** - Default settings for all agents
2. **Agent Level (Overrides)** - Per-agent customization for different markets

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    TENANT SETTINGS (DEFAULTS)                    │
│                                                                  │
│  Business: Direct To Film Australia                              │
│  Timezone: Australia/Brisbane                                    │
│  Language: Australian English (en-AU)                            │
│  Measurement: Metric (cm, kg, km)                                │
│  Currency: AUD ($)                                               │
│  Date Format: DD/MM/YYYY                                         │
│  Time Format: 12-hour                                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ CS Agent AU     │ │ CS Agent US     │ │ Sales Agent     │
│                 │ │                 │ │                 │
│ (inherits all   │ │ OVERRIDES:      │ │ (inherits all   │
│  tenant         │ │ • Timezone: EST │ │  tenant         │
│  defaults)      │ │ • Lang: en-US   │ │  defaults)      │
│                 │ │ • Imperial      │ │                 │
│                 │ │ • Currency: USD │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Tenant-Level Settings

| Setting | Default | Options | Description |
|---------|---------|---------|-------------|
| **Timezone** | Australia/Brisbane | All IANA timezones | Used for scheduling, timestamps |
| **Language** | en-AU | en-AU, en-GB, en-US, en-CA | Spelling & terminology |
| **Measurement** | Metric | Metric, Imperial | Units in responses |
| **Currency** | AUD | AUD, USD, GBP, EUR, NZD, CAD | Price formatting |
| **Date Format** | DD/MM/YYYY | DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD | Date display |
| **Time Format** | 12-hour | 12-hour, 24-hour | Time display |
| **Business Name** | (required) | Text | Company name |
| **Business Email** | (required) | Email | Contact email |
| **Business Phone** | (optional) | Phone | Contact phone |
| **Business Website** | (optional) | URL | Company website |

### Agent-Level Overrides

Each agent can override any tenant setting:
- If agent setting is **NULL** → inherits from tenant
- If agent setting is **SET** → uses agent value

This enables:
- Different agents for different regions (US, UK, AU)
- Different agents for different brands
- Localized responses without code changes

### Language Settings Detail

| Code | Name | Spelling Examples |
|------|------|-------------------|
| en-AU | Australian English | colour, metre, organisation, favour |
| en-GB | British English | colour, metre, organisation, favour |
| en-US | American English | color, meter, organization, favor |
| en-CA | Canadian English | colour, metre, organization, favour |

### Database Schema

```sql
-- Tenant Settings Table
CREATE TABLE tenant_settings (
  tenant_id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  business_email TEXT,
  business_phone TEXT,
  business_address TEXT,
  business_website TEXT,
  timezone TEXT DEFAULT 'Australia/Brisbane',
  language TEXT DEFAULT 'en-AU',
  measurement_system TEXT DEFAULT 'metric',
  currency TEXT DEFAULT 'AUD',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  time_format TEXT DEFAULT '12h',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Agent Override Columns
ALTER TABLE agents ADD COLUMN timezone TEXT; -- NULL = inherit
ALTER TABLE agents ADD COLUMN language TEXT; -- NULL = inherit
ALTER TABLE agents ADD COLUMN measurement_system TEXT; -- NULL = inherit
ALTER TABLE agents ADD COLUMN currency TEXT; -- NULL = inherit
ALTER TABLE agents ADD COLUMN date_format TEXT; -- NULL = inherit
ALTER TABLE agents ADD COLUMN time_format TEXT; -- NULL = inherit
```

### UI Location

```
Settings (sidebar)
├── Dartmouth OS Settings ← Tenant-level configuration
│   ├── Business Information
│   │   ├── Business Name
│   │   ├── Business Email
│   │   ├── Business Phone
│   │   └── Business Website
│   │
│   └── Regional Settings
│       ├── Timezone
│       ├── Language/Spelling
│       ├── Measurement System
│       ├── Currency
│       ├── Date Format
│       └── Time Format
│
└── AI Agent
    └── Regional Overrides ← Per-agent customization
        ├── Timezone (or inherit)
        ├── Language (or inherit)
        ├── Measurement (or inherit)
        └── Currency (or inherit)
```

### Integration with KnowledgeService

The KnowledgeService loads tenant/agent settings and injects them into AI prompts:

```
# Regional Settings (injected into system prompt)
- Timezone: Australia/Brisbane
- Language: Australian English
  • Use: colour, metre, organisation, favour
  • Avoid: color, meter, organization, favor
- Measurement: Metric (cm, kg, km)
- Currency: AUD ($)
- Date Format: DD/MM/YYYY (e.g., 04/12/2025)
- Time Format: 12-hour (e.g., 2:30 PM)
```

### Implementation Status

| Component | Status |
|-----------|--------|
| Database Schema | 🔜 Planned |
| Tenant Settings API | 🔜 Planned |
| Dartmouth OS Settings UI | 🔜 Planned |
| Agent Overrides API | 🔜 Planned |
| Agent Overrides UI | 🔜 Planned |
| KnowledgeService Integration | 🔜 Planned |

---

## 14. BUSINESS MODEL

### Target Market

**Primary:**
- Print shops (DTF, UV DTF, screen printing)
- E-commerce businesses
- SaaS companies
- Customer support teams

**Secondary:**
- Marketing agencies
- Consulting firms
- Educational institutions

### Pricing Strategy

**Tier 1: Starter ($49/month)**
- 1 agent
- 1,000 conversations/month
- Email support
- Basic analytics

**Tier 2: Professional ($149/month)**
- 3 agents
- 10,000 conversations/month
- Priority support
- Advanced analytics
- Custom knowledge base

**Tier 3: Enterprise (Custom)**
- Unlimited agents
- Unlimited conversations
- Dedicated support
- White-label option
- Custom integrations
- SLA guarantee

### Revenue Model

1. **SaaS Subscriptions** - Monthly/annual recurring
2. **Usage-Based** - Per conversation overage
3. **Professional Services** - Custom agent development
4. **White-Label** - Platform licensing

---

## 15. ROADMAP & TIMELINE

### Q4 2025 (Current)

**December:**
- ✅ Email System V2 complete
- ✅ Customer Service Dashboard complete
- ✅ Live Chat System (Widget + Dashboard)
- ✅ AI Agent Configuration (RAG + System Message)
- ✅ KnowledgeService (AI Learning Pipeline)
- ⏳ Multi-Tenant Regional Settings
- ⏳ McCarthy Artwork Agent testing

### Q1 2026

**January:**
- Sales Agent complete
- Admin Dashboard (Phase 5)
- Multi-tenant support
- Billing system

**February:**
- Analytics & Reporting (Phase 6)
- Live Chat widget
- WhatsApp integration

**March:**
- Instagram DMs integration
- Facebook Messenger integration
- SMS integration (Twilio)

### Q2 2026

**April-June:**
- Voice capabilities (Layer 7)
- PA Agent integration
- Multi-modal intelligence (Layer 8)
- Agent marketplace (beta)

### Q3-Q4 2026

**July-December:**
- White-label platform
- Industry-specific agent packs
- Advanced workflows
- Global expansion

---

## 📊 CURRENT STATUS SUMMARY

### What's Complete (85%)

✅ **Dartmouth OS Core** (70%)
- Layers 1, 2, 3, 5, 6, 9 (partial)
- RAG Engine, Memory System, Quality Control
- Agent Registry, Router, Orchestrator

✅ **Email System V2** (100%)
- Cloudflare Email Routing + Resend
- MIME parsing, threading, scheduled sending

✅ **Customer Service Dashboard** (98%)
- Ticket list, detail, filters, reply, schedule

✅ **Ticket Manager** (100%)
- Auto-detection, lifecycle management

✅ **McCarthy Artwork Agent** (100% built, 85% tested)
- 5 handlers, RAG integration, deployed

✅ **Customer Service Agent** (100% built, 0% integrated)
- 4 handlers, auto-escalation, all tests passing

### What's Missing (15%)

❌ **Layer 4: Integrations** (10%)
- Shopify, PERP, Calendar, Webhooks

❌ **Layer 7: Voice** (0%)
- STT, TTS, Audio Streaming

❌ **AI Agent Integration** (0%)
- AI Draft Response UI
- AIAgentProcessor service

❌ **Sales Agent** (5%)
- Specification complete, not built

❌ **Admin Dashboard** (0%)
- Integration management, permissions, settings

---

## 🎯 NEXT STEPS

### Immediate (This Week)

1. **McCarthy Artwork Agent Testing**
   - Run 42 tests from `RETEST_FAILED_AND_UNTESTED.md`
   - Document results
   - Fix any remaining issues
   - Declare production-ready

2. **Customer Service Agent Integration (Phase 1)**
   - Add AI Agent as staff member
   - Build AIAgentProcessor service
   - Create AI Draft Response UI
   - Integrate into ticket workflow

### Short-term (This Month)

3. **Dartmouth OS Core (Phase 3)**
   - Knowledge Domain System
   - Shopify Integration Service
   - Agent Context Passing

4. **Sales Agent (Phase 4)**
   - Build all handlers
   - Test with real data
   - Deploy to production

### Mid-term (Q1 2026)

5. **Admin Dashboard (Phase 5)**
6. **Analytics & Reporting (Phase 6)**
7. **Omnichannel Expansion (Phase 7)**

---

## 📚 ADDITIONAL RESOURCES

### Documentation

- **API Documentation:** See `MASTER_API_ARCHITECTURE.md`
- **Build Plan:** See `MASTER_BUILD_PLAN_DEC_2_2025.md`
- **Big Picture:** See `BIG_PICTURE_DEC_2_2025.md`
- **Sales Agent Spec:** See `D:\coding\Sales Agent\SALES_AGENT_SPECIFICATION.md`

### Code Repositories

- **Main Repo:** `D:\coding\DARTMOUTH_OS_PROJECT`
- **Packages:**
  - `packages/worker` - Cloudflare Worker (API)
  - `packages/customer-service-dashboard` - React dashboard
  - `packages/customer-service-agent` - CS Agent
  - `packages/mccarthy-artwork` - Artwork Agent
  - `packages/dartmouth-core` - Core services
  - `packages/shared` - Shared types
  - `packages/widget` - Chat widget

### Contact & Support

- **Project Lead:** John Hutchison
- **Email:** john@directtofilm.com.au
- **Platform:** Dartmouth OS
- **Version:** 2.0

---

**Document Version:** 2.0  
**Created:** December 2, 2025  
**Author:** AI Assistant  
**Status:** Living Document (Updated as system evolves)

---

**🏛️ MCCARTHY AI DARTMOUTH OS - THE FOUNDATION FOR INTELLIGENT AGENTS**

