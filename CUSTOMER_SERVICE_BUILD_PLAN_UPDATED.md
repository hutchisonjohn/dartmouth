# 🚀 CUSTOMER SERVICE AGENT - COMPLETE BUILD PLAN (UPDATED)

**Version:** 2.0.0  
**Date:** November 28, 2025  
**Status:** Planning Complete, Ready to Build  
**Total Estimated Time:** 18 weeks (~4.5 months)

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Dartmouth OS Extensions](#phase-1-dartmouth-os-extensions)
4. [Phase 2: Sales Agent](#phase-2-sales-agent)
5. [Phase 3: Customer Service Agent](#phase-3-customer-service-agent)
6. [Phase 4: Beta Testing](#phase-4-beta-testing)
7. [Phase 5: Production Launch](#phase-5-production-launch)
8. [Timeline Summary](#timeline-summary)
9. [Resource Requirements](#resource-requirements)
10. [Risk Management](#risk-management)

---

## 1. OVERVIEW

### **1.1 What We're Building**

A complete **Customer Service AI Agent** system that includes:
- 🤖 **AI Agent** - Handles 70-80% of customer inquiries automatically
- 📱 **Omnichannel** - Email, Chat, WhatsApp, Instagram, Facebook, Phone
- 🎫 **Ticketing System** - Auto-categorization, priority detection, assignment
- 👥 **Staff Dashboard** - Dual-view interface (customer chat + staff panel)
- 🛒 **Shopify Integration** - Orders, customers, products, inventory
- 🖨️ **PERP Integration** - Production status, artwork, VIP wallet, invoices
- ⚠️ **Escalation System** - Phrase, confidence, sentiment, VIP triggers
- 💬 **Internal Communication** - Group channels, @mentions, threads
- 📊 **Analytics Dashboard** - Metrics, performance, CSAT

### **1.2 Dependencies**

**Customer Service Agent depends on:**
1. ✅ **Dartmouth Foundation** - Already built (BaseAgent, orchestration)
2. 🔜 **Dartmouth OS Extensions** - Need to build (agent handoff, product knowledge, etc.)
3. 🔜 **Sales Agent** - Need to build (handles pricing questions)

**Build Order:**
```
Dartmouth OS Extensions → Sales Agent → Customer Service Agent
```

---

## 2. PREREQUISITES

### **2.1 What's Already Built**

✅ **Dartmouth Foundation (100% complete):**
- BaseAgent with 14 components
- AgentRegistry, AgentRouter, AgentOrchestrator
- Memory System, RAG Engine, Constraint Validator
- LLM Service, Database Manager, Config Manager

✅ **Infrastructure (100% complete):**
- Cloudflare Workers
- Cloudflare D1 (SQLite)
- Cloudflare KV
- OpenAI GPT-4o-mini
- Workers AI (embeddings)

✅ **McCarthy Artwork Agent (95% complete):**
- Working example of specialized agent
- Demonstrates RAG, constraints, handlers

### **2.2 What Needs to Be Built**

🔜 **Dartmouth OS Extensions (0% complete):**
- Agent Handoff Protocol
- Product Knowledge System
- Internal Communication System
- Authentication Service
- Analytics Service
- WebSocket Service

🔜 **Sales Agent (0% complete):**
- Quote Handler
- Pricing Engine
- Product Recommender
- Order Placement

🔜 **Customer Service Agent (0% complete):**
- Everything (see Phase 3)

---

## 3. PHASE 1: DARTMOUTH OS EXTENSIONS

**Duration:** 3-4 weeks  
**Effort:** 29-40 hours  
**Goal:** Extend Dartmouth OS with services needed for Customer Service

### **3.1 Week 1: Core Services (13-18 hours)**

#### **Task 1.1: Agent Handoff Protocol (4-6 hours)**

**What:** Enable Customer Service Agent to hand off to Sales Agent

**Implementation:**
```typescript
// New component
class AgentHandoffProtocol {
  async handoff(
    fromAgent: string,
    toAgent: string,
    context: HandoffContext
  ): Promise<HandoffResult> {
    // 1. Prepare context for target agent
    // 2. Notify target agent
    // 3. Transfer conversation state
    // 4. Return handoff result
  }
}

interface HandoffContext {
  customerId: string;
  conversationHistory: Message[];
  reason: string;
  priority: 'normal' | 'high' | 'critical';
  metadata: any;
}
```

**Tasks:**
- [ ] Create `AgentHandoffProtocol` class
- [ ] Implement context preparation
- [ ] Implement conversation transfer
- [ ] Add to AgentOrchestrator
- [ ] Write unit tests
- [ ] Test CS → Sales handoff

**Deliverable:** CS Agent can hand off pricing questions to Sales Agent

---

#### **Task 1.2: Product Knowledge System (6-8 hours)**

**What:** Sync Shopify products to RAG for product search/recommendations

**Implementation:**
```typescript
// New component
class ProductKnowledgeSystem {
  async syncShopifyProducts(): Promise<void> {
    // 1. Fetch products from Shopify API
    // 2. Convert to RAG documents
    // 3. Generate embeddings
    // 4. Store in KV
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    // 1. Search RAG for products
    // 2. Return matching products
  }
  
  async checkInventory(productId: string): Promise<number> {
    // 1. Query Shopify for stock
    // 2. Return stock level
  }
}
```

**Tasks:**
- [ ] Create `ProductKnowledgeSystem` class
- [ ] Implement Shopify product sync
- [ ] Convert products to RAG documents
- [ ] Implement product search
- [ ] Implement inventory check
- [ ] Schedule daily sync (cron)
- [ ] Write unit tests

**Deliverable:** Agents can search products and check inventory

---

#### **Task 1.3: Authentication Service (3-4 hours)**

**What:** JWT authentication for staff dashboard

**Implementation:**
```typescript
// New component
class AuthenticationService {
  async login(email: string, password: string): Promise<AuthResult> {
    // 1. Verify credentials
    // 2. Generate JWT token
    // 3. Return token + user info
  }
  
  async verifyToken(token: string): Promise<StaffUser> {
    // 1. Verify JWT signature
    // 2. Check expiration
    // 3. Return staff user
  }
  
  async refreshToken(token: string): Promise<string> {
    // 1. Verify old token
    // 2. Generate new token
    // 3. Return new token
  }
}
```

**Tasks:**
- [ ] Create `AuthenticationService` class
- [ ] Implement password hashing (bcrypt)
- [ ] Implement JWT generation/verification
- [ ] Implement refresh token logic
- [ ] Add role-based access control (RBAC)
- [ ] Create auth middleware
- [ ] Write unit tests

**Deliverable:** Staff can log in to dashboard securely

---

### **3.2 Week 2: Communication & Real-time (12-16 hours)**

#### **Task 2.1: Internal Communication System (8-10 hours)**

**What:** Group channels, @mentions, threads for staff collaboration

**Implementation:**
```typescript
// New components
class ChannelManager {
  async createChannel(data: CreateChannelData): Promise<Channel>
  async addMembers(channelId: string, staffIds: string[]): Promise<void>
  async sendMessage(channelId: string, message: string): Promise<Message>
}

class MentionDetector {
  detectMentions(message: string): string[] // Returns staff IDs
  createMentions(messageId: string, mentions: string[]): Promise<void>
}

class ThreadManager {
  async createThread(parentMessageId: string): Promise<Thread>
  async addReply(threadId: string, message: string): Promise<Message>
}
```

**Tasks:**
- [ ] Create database schema (7 tables)
- [ ] Create `ChannelManager` class
- [ ] Create `MentionDetector` class
- [ ] Create `ThreadManager` class
- [ ] Implement channel CRUD
- [ ] Implement @mention detection
- [ ] Implement thread creation/replies
- [ ] Write unit tests

**Deliverable:** Staff can create channels, @mention each other, create threads

---

#### **Task 2.2: WebSocket Service (4-6 hours)**

**What:** Real-time updates for dashboard

**Implementation:**
```typescript
// New component
class WebSocketService {
  async broadcast(channelId: string, message: any): Promise<void>
  async sendToUser(staffId: string, message: any): Promise<void>
  async trackPresence(staffId: string, status: 'online' | 'away' | 'offline'): Promise<void>
}
```

**Tasks:**
- [ ] Create `WebSocketService` class
- [ ] Implement Cloudflare Durable Objects for WebSocket
- [ ] Implement broadcast to channel
- [ ] Implement send to specific user
- [ ] Implement presence tracking
- [ ] Add typing indicators
- [ ] Write unit tests

**Deliverable:** Real-time updates in dashboard

---

### **3.3 Week 3: Analytics & Testing (10-14 hours)**

#### **Task 3.1: Analytics Service (4-6 hours)**

**What:** Track metrics for dashboard

**Implementation:**
```typescript
// New component
class AnalyticsService {
  async trackConversation(data: ConversationMetrics): Promise<void>
  async trackResolution(data: ResolutionMetrics): Promise<void>
  async getMetrics(timeRange: string): Promise<Metrics>
}
```

**Tasks:**
- [ ] Create `AnalyticsService` class
- [ ] Create analytics database tables
- [ ] Implement metric tracking
- [ ] Implement metric aggregation
- [ ] Create dashboard API endpoints
- [ ] Write unit tests

**Deliverable:** Dashboard shows metrics (AI resolution rate, response time, etc.)

---

#### **Task 3.2: Integration Testing (6-8 hours)**

**Tasks:**
- [ ] Test agent handoff (CS → Sales)
- [ ] Test product knowledge system
- [ ] Test authentication flow
- [ ] Test internal communication
- [ ] Test WebSocket real-time updates
- [ ] Test analytics tracking
- [ ] Fix any bugs
- [ ] Performance optimization

**Deliverable:** All Dartmouth OS extensions working together

---

## 4. PHASE 2: SALES AGENT

**Duration:** 2-3 weeks  
**Effort:** 56 hours  
**Goal:** Build Sales Agent to handle pricing/quotes

### **4.1 Week 1: Core Sales Agent (24-30 hours)**

#### **Task 4.1: Sales Agent Class (4 hours)**

**What:** Create Sales Agent that extends BaseAgent

**Tasks:**
- [ ] Create `SalesAgent` class (extends BaseAgent)
- [ ] Register with AgentRegistry
- [ ] Define capabilities (quotes, pricing, products)
- [ ] Define constraints (no refunds, no discounts without approval)
- [ ] Write unit tests

---

#### **Task 4.2: Quote Handler (12 hours)**

**What:** Handle quote requests

**Implementation:**
```typescript
class QuoteHandler implements Handler {
  async handle(message: string, intent: Intent, context: HandlerContext): Promise<Response> {
    // 1. Extract quote requirements (product, quantity, colors, etc.)
    // 2. Search products
    // 3. Calculate pricing
    // 4. Apply bulk discounts
    // 5. Generate quote
    // 6. Return formatted quote
  }
}
```

**Tasks:**
- [ ] Create `QuoteHandler` class
- [ ] Implement requirement extraction
- [ ] Implement product search
- [ ] Implement pricing calculation
- [ ] Implement quote generation
- [ ] Add quote formatting
- [ ] Write unit tests

---

#### **Task 4.3: Pricing Engine (10 hours)**

**What:** Calculate product pricing with bulk discounts

**Implementation:**
```typescript
class PricingEngine {
  calculatePrice(product: Product, quantity: number, options: PricingOptions): Price {
    // 1. Base price
    // 2. Quantity discounts
    // 3. VIP discounts
    // 4. Setup fees
    // 5. Shipping
    // 6. Tax
  }
}
```

**Tasks:**
- [ ] Create `PricingEngine` class
- [ ] Implement base pricing
- [ ] Implement bulk discount tiers
- [ ] Implement VIP discounts
- [ ] Implement setup fees
- [ ] Implement shipping calculation
- [ ] Write unit tests

---

### **4.2 Week 2: Product Recommender & Testing (16-20 hours)**

#### **Task 4.4: Product Recommender (8 hours)**

**What:** Recommend products based on customer needs

**Tasks:**
- [ ] Create `ProductRecommender` class
- [ ] Implement need extraction (from conversation)
- [ ] Implement product matching
- [ ] Implement recommendation ranking
- [ ] Add product comparison
- [ ] Write unit tests

---

#### **Task 4.5: Order Placement (8 hours)**

**What:** Create Shopify orders

**Tasks:**
- [ ] Create `OrderPlacer` class
- [ ] Implement Shopify order creation
- [ ] Implement order validation
- [ ] Implement error handling
- [ ] Write unit tests

---

#### **Task 4.6: Testing & Integration (8-12 hours)**

**Tasks:**
- [ ] Test quote generation
- [ ] Test pricing calculations
- [ ] Test product recommendations
- [ ] Test order placement
- [ ] Test handoff from CS Agent
- [ ] Fix bugs
- [ ] Performance optimization

**Deliverable:** Sales Agent working, integrated with CS Agent

---

## 5. PHASE 3: CUSTOMER SERVICE AGENT

**Duration:** 7-8 weeks  
**Effort:** 160 hours  
**Goal:** Build complete Customer Service system

### **5.1 Week 1-2: Backend Core (34 hours)**

#### **Sprint 1: OmnichannelRouter (18 hours)**

**What:** Route messages from all channels

**Tasks:**
- [ ] Create `OmnichannelRouter` class
- [ ] Implement Email integration (SendGrid)
- [ ] Implement Live Chat widget
- [ ] Implement WhatsApp integration (Twilio)
- [ ] Implement Instagram integration (Meta API)
- [ ] Implement Facebook integration (Meta API)
- [ ] Implement Phone integration (Twilio)
- [ ] Implement message normalization
- [ ] Write unit tests

---

#### **Sprint 2: TicketManager (16 hours)**

**What:** Manage tickets (CRUD, assignment, escalation)

**Tasks:**
- [ ] Create `TicketManager` class
- [ ] Create database schema (12 tables)
- [ ] Implement ticket CRUD
- [ ] Implement `PriorityDetector`
- [ ] Implement `CategoryClassifier`
- [ ] Implement `AssignmentEngine`
- [ ] Write unit tests

---

### **5.2 Week 3-4: Integrations (36 hours)**

#### **Sprint 3: Shopify Integration (16 hours)**

**What:** Integrate with Shopify for orders/customers

**Tasks:**
- [ ] Create `ShopifyConnector` class
- [ ] Implement customer profile sync
- [ ] Implement order status retrieval
- [ ] Implement product catalog sync
- [ ] Implement caching layer (5min TTL)
- [ ] Handle rate limits (2 req/sec)
- [ ] Write unit tests

---

#### **Sprint 4: PERP Integration (20 hours)**

**What:** Integrate with PERP for production/artwork/VIP wallet

**Tasks:**
- [ ] Create `PERPConnector` class
- [ ] Implement direct database access (MySQL/PostgreSQL)
- [ ] Implement production status queries
- [ ] Implement artwork approval status
- [ ] Implement VIP wallet balance
- [ ] Implement invoice retrieval
- [ ] Implement caching layer (2min TTL)
- [ ] Write unit tests

---

### **5.3 Week 5: Escalation & CS Handlers (22 hours)**

#### **Sprint 5: Escalation System (10 hours)**

**What:** Detect when to escalate to human

**Tasks:**
- [ ] Create `EscalationDetector` class
- [ ] Implement phrase detection
- [ ] Implement confidence thresholds
- [ ] Implement sentiment triggers
- [ ] Implement VIP prioritization
- [ ] Implement warm handoff messages
- [ ] Write unit tests

---

#### **Sprint 6: CS Handlers (12 hours)**

**What:** Create CS-specific handlers

**Tasks:**
- [ ] Create `OrderStatusHandler`
- [ ] Create `ProductionStatusHandler`
- [ ] Create `InvoiceHandler`
- [ ] Create `VIPWalletHandler`
- [ ] Create `ArtworkHandler`
- [ ] Create `ShippingHandler`
- [ ] Write unit tests

---

### **5.4 Week 6-7: Staff Dashboard Backend (30 hours)**

#### **Sprint 7: Dashboard Backend APIs (16 hours)**

**What:** Create APIs for dashboard

**Tasks:**
- [ ] Create ticket APIs (CRUD, assign, escalate)
- [ ] Create message APIs (send, receive, history)
- [ ] Create customer APIs (profile, orders, notes)
- [ ] Create internal note APIs
- [ ] Create mention APIs
- [ ] Create analytics APIs
- [ ] Add authentication middleware
- [ ] Write unit tests

---

#### **Sprint 8: Real-time Features (14 hours)**

**What:** Add real-time features

**Tasks:**
- [ ] Implement real-time ticket updates
- [ ] Implement real-time message delivery
- [ ] Implement presence detection
- [ ] Implement typing indicators
- [ ] Implement notification delivery
- [ ] Write unit tests

---

### **5.5 Week 8-9: Staff Dashboard Frontend (38 hours)**

#### **Sprint 9: Dashboard UI (24 hours)**

**What:** Build full dashboard UI from mockup

**Tasks:**
- [ ] Set up React + Vite + Tailwind
- [ ] Create sidebar navigation
- [ ] Create AI Chat view (left: customer chats, right: staff panel)
- [ ] Create ticket list view
- [ ] Create customer list view
- [ ] Create staff list view
- [ ] Create channel list view
- [ ] Create mentions inbox
- [ ] Create notification center
- [ ] Add responsive design

---

#### **Sprint 10: Dashboard Features (14 hours)**

**What:** Add advanced features

**Tasks:**
- [ ] Implement customer context panel
- [ ] Implement order history panel
- [ ] Implement Shopify integration panel
- [ ] Implement PERP integration panel
- [ ] Implement internal notes
- [ ] Implement @mention autocomplete
- [ ] Implement thread panel
- [ ] Implement templates/macros
- [ ] Implement quick inserts
- [ ] Add file upload (future)

---

### **5.6 Week 10: Testing & Bug Fixes (16 hours)**

**Tasks:**
- [ ] Integration testing (all components)
- [ ] End-to-end testing (user flows)
- [ ] Load testing (1,000 conversations/day)
- [ ] Security testing
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Documentation

**Deliverable:** Complete Customer Service Agent ready for beta

---

## 6. PHASE 4: BETA TESTING

**Duration:** 2 weeks  
**Effort:** 20-30 hours  
**Goal:** Internal testing with team

### **6.1 Week 1: Internal Testing**

**Tasks:**
- [ ] Deploy to staging environment
- [ ] Onboard team members
- [ ] Test all channels (email, chat, WhatsApp, etc.)
- [ ] Test escalation workflows
- [ ] Test internal communication
- [ ] Gather feedback
- [ ] Log bugs

### **6.2 Week 2: Bug Fixes & Iteration**

**Tasks:**
- [ ] Fix critical bugs
- [ ] Fix high-priority bugs
- [ ] Implement feedback
- [ ] Performance optimization
- [ ] Final testing
- [ ] Prepare for production

**Deliverable:** Production-ready Customer Service Agent

---

## 7. PHASE 5: PRODUCTION LAUNCH

**Duration:** 1 week  
**Effort:** 10-15 hours  
**Goal:** Launch to production

### **7.1 Production Deployment**

**Tasks:**
- [ ] Deploy to production
- [ ] Set up monitoring (Sentry, Cloudflare Analytics)
- [ ] Set up alerts (critical errors, high load)
- [ ] Configure backups
- [ ] Document deployment process

### **7.2 Post-Launch Monitoring**

**Tasks:**
- [ ] Monitor for errors
- [ ] Monitor performance
- [ ] Gather customer feedback
- [ ] Iterate based on feedback
- [ ] Celebrate! 🎉

**Deliverable:** Customer Service Agent live in production

---

## 8. TIMELINE SUMMARY

| Phase | Duration | Effort | Deliverable |
|-------|----------|--------|-------------|
| **Phase 1: Dartmouth OS** | 3-4 weeks | 29-40 hours | Agent handoff, Product Knowledge, Internal Comms |
| **Phase 2: Sales Agent** | 2-3 weeks | 56 hours | Sales Agent (quotes, pricing) |
| **Phase 3: Customer Service** | 7-8 weeks | 160 hours | Full CS system with dashboard |
| **Phase 4: Beta Testing** | 2 weeks | 20-30 hours | Testing, bug fixes |
| **Phase 5: Production** | 1 week | 10-15 hours | Production launch |

**Total:** 15-18 weeks (~4-4.5 months)  
**Total Effort:** 275-301 hours

---

## 9. RESOURCE REQUIREMENTS

### **9.1 Team**
- **John Hutchison** - Product Owner, Developer
- **AI Assistant (Claude Sonnet 4.5)** - Co-Developer via Cursor

### **9.2 External Services**

**Required:**
- Shopify API credentials
- PERP database credentials (read-only)
- SendGrid account (free tier)
- Twilio account (WhatsApp, Phone)
- Meta Business account (Instagram, Facebook)

**Optional (Post-MVP):**
- Twitter/X API
- TikTok API
- Threads API

### **9.3 Budget**

**Development:** $0 (internal development)

**Monthly Operational Costs:**
- Cloudflare: $5-50/month
- OpenAI: $600-1,200/month
- Twilio: $50/month
- SendGrid: Free
- **Total:** $655-1,300/month

**Cost Savings:** $2,700-7,345/month (vs hiring 2 support agents)

---

## 10. RISK MANAGEMENT

### **10.1 Technical Risks**

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **PERP database access issues** | Medium | High | Get credentials early, test connection |
| **Shopify rate limits** | Low | Medium | Implement caching, respect rate limits |
| **WebSocket scaling** | Low | Medium | Use Cloudflare Durable Objects |
| **LLM costs exceed budget** | Medium | High | Monitor usage, optimize prompts |

### **10.2 Business Risks**

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Team adoption resistance** | Low | High | Involve team early, gather feedback |
| **Customer dissatisfaction** | Low | High | Beta test thoroughly, monitor CSAT |
| **Integration failures** | Medium | Medium | Test integrations early, have fallbacks |

---

## 11. SUCCESS CRITERIA

### **11.1 Technical Success**
- ✅ AI resolution rate: 70-80%
- ✅ Average response time: <1 minute
- ✅ API response time: <500ms
- ✅ Uptime: 99.9%
- ✅ Zero data breaches

### **11.2 Business Success**
- ✅ Cost savings: $2,700-7,345/month
- ✅ Customer satisfaction: 4.5+ / 5.0
- ✅ Team adoption: 100% of staff using system
- ✅ Reduced email volume: 70-80%

---

## 12. NEXT STEPS

### **Immediate (This Week):**
1. ✅ Complete McCarthy Artwork testing
2. ✅ Review and approve this build plan
3. ✅ Get PERP database credentials
4. ✅ Get Shopify API credentials

### **Week 1 (Start Dartmouth OS Extensions):**
1. Build Agent Handoff Protocol
2. Build Product Knowledge System
3. Build Authentication Service

### **Week 2-4 (Continue Dartmouth OS):**
1. Build Internal Communication System
2. Build WebSocket Service
3. Build Analytics Service

### **Week 5-7 (Build Sales Agent):**
1. Build Sales Agent core
2. Build Quote Handler
3. Build Pricing Engine
4. Test integration with CS Agent

### **Week 8-15 (Build Customer Service Agent):**
1. Build backend (OmnichannelRouter, TicketManager, Integrations)
2. Build dashboard (backend APIs + frontend UI)
3. Test everything

### **Week 16-18 (Beta + Production):**
1. Beta test with team
2. Fix bugs
3. Launch to production

---

**Document Version:** 2.0.0  
**Last Updated:** November 28, 2025  
**Status:** Complete - Ready to Execute  
**Author:** AI Assistant + John Hutchison

