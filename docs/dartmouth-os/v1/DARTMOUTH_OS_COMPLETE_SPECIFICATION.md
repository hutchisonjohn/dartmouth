# 🎼 DARTMOUTH OS - Complete Technical Specification
## The Operating System & Heart of the AI Agent Fleet

**Version:** 1.0.0  
**Date:** November 19, 2024  
**Status:** Production Architecture  
**Purpose:** Platform services and infrastructure for all McCarthy AI agents

---

## 📖 TABLE OF CONTENTS

1. [What is Dartmouth OS?](#what-is-dartmouth-os)
2. [Architecture Overview](#architecture-overview)
3. [Platform Services](#platform-services)
4. [Service Catalog](#service-catalog)
5. [Agent Integration](#agent-integration)
6. [API Specification](#api-specification)
7. [Cost Management](#cost-management)
8. [Monitoring & Analytics](#monitoring--analytics)
9. [Security & Compliance](#security--compliance)
10. [Deployment](#deployment)
11. [Scaling Strategy](#scaling-strategy)
12. [Best Practices](#best-practices)

---

## 🎯 **WHAT IS DARTMOUTH OS?**

### **Definition**

**Dartmouth OS** is the platform operating system that provides infrastructure, services, and orchestration for all McCarthy AI agents. Like Windows or Linux manages applications, Dartmouth manages agents.

### **The Heart Analogy** ❤️

Just as the **heart** pumps blood to every organ:
- **Blood = Data & Context** (flows to all agents)
- **Heartbeat = Health Monitoring** (keeps agents alive)
- **Circulation = Event System** (distributes notifications)
- **Oxygen = Intelligence** (learning, analytics, insights)
- **Immune System = Security** (protects all agents)

**Without the heart, organs die.**  
**Without Dartmouth, agents can't function.**

### **The OS Analogy** 🖥️

Just as an **operating system** manages applications:

| Operating System | DARTMOUTH OS |
|-----------------|--------------|
| Runs applications | Runs agents |
| Manages memory | Manages context & cache |
| Handles file I/O | Handles integrations (CRM, email) |
| Provides security | Provides auth & compliance |
| Monitors performance | Monitors SLAs & analytics |
| Schedules processes | Orchestrates agent tasks |
| Updates applications | Learns & adapts agents |
| API for apps | API for agents |

---

## 🏗️ **ARCHITECTURE OVERVIEW**

### **High-Level Architecture**

```
╔═══════════════════════════════════════════════════════════════╗
║                    DARTMOUTH OS (The Heart)                    ║
╚═══════════════════════════════════════════════════════════════╝
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │         MONITORING & HEALTH LAYER                       │  ║
║  │  Analytics | Telemetry | SLA Monitoring | Health Checks │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │         PERFORMANCE & OPTIMIZATION LAYER                │  ║
║  │  Cache Manager | Load Balancer | Resource Allocator    │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │         SECURITY & COMPLIANCE LAYER                     │  ║
║  │  Auth Manager | Content Filter | Audit Logger          │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │         INTEGRATION & COMMUNICATION LAYER               │  ║
║  │  Integration Hub | Event System | API Gateway          │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │         INTELLIGENCE & LEARNING LAYER                   │  ║
║  │  Learning System | A/B Testing | Multi-Language        │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │         USER EXPERIENCE LAYER                           │  ║
║  │  Goal Tracking | Formatting | Notification System      │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
╚════════════════════════╦═══════════════════════════════════════╝
                         ║
         ┌───────────────╬───────────────┬────────────┐
         │               ║               │            │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐  ┌────▼────┐
    │   FAM   │    │McCarthy │    │  Lead   │  │  Copy   │
    │  Agent  │    │ Artwork │    │ Scraper │  │ Writer  │
    │         │    │  Agent  │    │  Agent  │  │  Agent  │
    └─────────┘    └─────────┘    └─────────┘  └─────────┘
```

### **Technology Stack**

- **Platform:** Cloudflare Workers (Global edge network)
- **Language:** TypeScript
- **Database:** Cloudflare D1 (SQLite at edge)
- **Cache:** Cloudflare KV + Cache API
- **Storage:** Cloudflare R2 (S3-compatible)
- **Vectors:** Cloudflare Vectorize
- **Queues:** Cloudflare Queues
- **Frontend:** Cloudflare Pages
- **DNS/CDN:** Cloudflare

**Why Cloudflare?**
- ✅ Global edge network (300+ locations)
- ✅ Generous free tiers
- ✅ Integrated ecosystem
- ✅ Excellent performance
- ✅ Cost-effective at scale

---

## 🛠️ **PLATFORM SERVICES**

### **Service Layers**

Dartmouth OS provides **6 service layers** with **18 platform services**:

#### **Layer 1: Monitoring & Health (3 services)**
1. Analytics & Telemetry Engine
2. SLA Monitoring & Enforcement
3. Health Check System

#### **Layer 2: Performance & Optimization (3 services)**
4. Cache & Performance Manager
5. Load Balancer
6. Resource Allocator

#### **Layer 3: Security & Compliance (3 services)**
7. Security & Auth Manager
8. Safety & Content Filter
9. Audit & Compliance Logger

#### **Layer 4: Integration & Communication (3 services)**
10. Integration Hub
11. Event & Notification System
12. API Gateway

#### **Layer 5: Intelligence & Learning (3 services)**
13. Learning & Adaptation System
14. A/B Testing Framework
15. Multi-Language Support

#### **Layer 6: User Experience (3 services)**
16. Goal & Task Tracking
17. Response Formatting Engine
18. User Journey Mapper

---

## 📚 **SERVICE CATALOG**

### **1. Analytics & Telemetry Engine** 📊

**Purpose:** Deep insights into agent performance and user behavior

**Capabilities:**
- Real-time metrics collection
- Conversation analytics
- User journey tracking
- Performance monitoring
- Error tracking & alerting
- Usage pattern analysis
- Cost tracking
- Success metric calculation

**Key Metrics:**
```typescript
interface AnalyticsMetrics {
  // Performance
  avgResponseTime: number;          // ms
  p95ResponseTime: number;          // ms
  errorRate: number;                // %
  uptime: number;                   // %
  
  // Usage
  totalConversations: number;
  totalMessages: number;
  activeUsers: number;
  avgMessagesPerConversation: number;
  
  // Quality
  avgSatisfactionScore: number;     // 1-5
  intentDetectionAccuracy: number;  // %
  constraintViolationRate: number;  // %
  
  // Cost
  llmCost: number;                  // $
  totalCost: number;                // $
  costPerConversation: number;      // $
}
```

**API:**
```typescript
// Track event
await dartmouth.analytics.track({
  event: 'message_sent',
  agentId: 'fam',
  userId: 'user-123',
  metadata: { intent: 'greeting', responseTime: 245 }
});

// Query metrics
const metrics = await dartmouth.analytics.getMetrics({
  agentId: 'fam',
  timeRange: '24h',
  metrics: ['avgResponseTime', 'totalConversations']
});

// Generate insights
const insights = await dartmouth.analytics.generateInsights('fam');
```

**Storage:**
- Hot data (last 7 days): D1 database
- Cold data (historical): R2 storage (compressed)

**Visualization:**
- Real-time dashboard (Cloudflare Analytics + custom)
- Grafana integration (optional)

---

### **2. SLA Monitoring & Enforcement** ⏱️

**Purpose:** Ensure service level agreements are met

**SLA Targets:**
```typescript
interface SLATargets {
  responseTime: {
    p50: 500,    // ms - 50th percentile
    p95: 2000,   // ms - 95th percentile
    p99: 5000    // ms - 99th percentile
  },
  availability: 99.9,           // % uptime
  errorRate: 1.0,               // % max error rate
  successRate: 95.0             // % successful responses
}
```

**Monitoring:**
```typescript
// Record response time
await dartmouth.sla.recordResponseTime(agentId, duration);

// Check health
const health = await dartmouth.sla.getAgentHealth(agentId);
// Returns: { healthy: boolean, violations: [], uptime: 99.95 }

// Get SLA compliance
const compliance = await dartmouth.sla.getCompliance('30d');
// Returns: { met: true, violations: [], percentile: 99.2 }
```

**Alerts:**
```typescript
// Auto-alert on violations
if (responseTime > SLA.p99) {
  await dartmouth.alerts.send({
    level: 'critical',
    message: 'SLA violation: Response time exceeded P99',
    agentId: agentId
  });
}
```

---

### **3. Health Check System** 🏥

**Purpose:** Continuous agent health monitoring

**Health Checks:**
```typescript
interface HealthCheck {
  // Agent health
  agentStatus: 'healthy' | 'degraded' | 'down',
  lastHeartbeat: timestamp,
  errorRate: number,
  
  // Dependencies
  llmServiceStatus: 'healthy' | 'down',
  databaseStatus: 'healthy' | 'down',
  cacheStatus: 'healthy' | 'down',
  
  // Resources
  cpuUsage: number,      // % (Worker CPU time)
  memoryUsage: number,   // MB
  activeConnections: number
}
```

**API:**
```typescript
// Heartbeat
await dartmouth.health.heartbeat(agentId);

// Get status
const status = await dartmouth.health.getStatus(agentId);

// Check all agents
const overview = await dartmouth.health.getOverview();
```

**Auto-Recovery:**
```typescript
// If agent unhealthy, auto-restart
if (health.status === 'down') {
  await dartmouth.orchestrator.restartAgent(agentId);
  await dartmouth.alerts.send('Agent restarted automatically');
}
```

---

### **4. Cache & Performance Manager** 🚀

**Purpose:** Optimize performance and reduce costs through intelligent caching

**Cache Layers:**
```
Layer 1: Cloudflare Cache API (CDN, FREE, instant)
Layer 2: Cloudflare KV (Edge, cheap, <10ms)
Layer 3: D1 Database (SQLite, cheap, <50ms)
Layer 4: R2 Storage (Archive, cheapest, <200ms)
```

**Cache Strategy:**
```typescript
interface CacheStrategy {
  llmResponse: { ttl: 3600 },      // 1 hour
  ragEmbedding: { ttl: 86400 },    // 24 hours
  agentConfig: { ttl: 600 },       // 10 minutes
  userPrefs: { ttl: 1800 },        // 30 minutes
  staticContent: { ttl: 604800 },  // 7 days
}
```

**API:**
```typescript
// Get from cache (checks all layers)
const value = await dartmouth.cache.get(key);

// Set with TTL
await dartmouth.cache.set(key, value, { ttl: 3600 });

// Invalidate
await dartmouth.cache.invalidate(pattern);

// Warm cache (preload)
await dartmouth.cache.warm(['popular-key-1', 'popular-key-2']);

// Get stats
const stats = await dartmouth.cache.getStats();
// Returns: { hitRate: 0.65, missRate: 0.35, savings: '$45.23' }
```

**Smart Caching:**
```typescript
// Cache LLM responses with content hash
const cacheKey = `llm:${hash(systemPrompt + userMessage)}`;
const cached = await dartmouth.cache.get(cacheKey);
if (cached) return cached; // Save LLM call!

await llm.generate(message);
await dartmouth.cache.set(cacheKey, response, { ttl: 3600 });
```

**Target:** 60%+ cache hit rate = 60% cost savings

---

### **5. Load Balancer** ⚖️

**Purpose:** Distribute requests across agents efficiently

**Features:**
- Round-robin distribution
- Least-connections routing
- Health-based routing (avoid unhealthy agents)
- Geographic routing (edge optimization)
- Rate limiting per agent

**API:**
```typescript
// Route request to best agent instance
const agent = await dartmouth.loadBalancer.route({
  agentType: 'fam',
  userId: 'user-123',
  geo: 'US-East'
});
```

---

### **6. Resource Allocator** 💾

**Purpose:** Manage and allocate resources efficiently

**Resource Management:**
```typescript
interface ResourceAllocation {
  // CPU (Worker CPU time)
  maxCPUTimeMs: 50,           // per request
  
  // Memory
  maxMemoryMB: 128,           // per request
  
  // LLM tokens
  maxInputTokens: 4000,
  maxOutputTokens: 2000,
  
  // Database
  maxDbReadsPerRequest: 50,
  maxDbWritesPerRequest: 10,
  
  // Rate limits
  requestsPerMinute: 100,     // per user
  requestsPerHour: 1000
}
```

**API:**
```typescript
// Check quota
const allowed = await dartmouth.resources.checkQuota(userId, 'requests');

// Allocate resources
await dartmouth.resources.allocate(agentId, resourceType, amount);

// Monitor usage
const usage = await dartmouth.resources.getUsage(agentId, '24h');
```

---

### **7. Security & Auth Manager** 🔐

**Purpose:** Secure all agent interactions

**Features:**
- User authentication (JWT, API keys, OAuth)
- Role-based access control (RBAC)
- Agent-to-agent auth
- Session management
- API key rotation
- Rate limiting
- IP whitelisting/blacklisting

**Authentication:**
```typescript
// Authenticate user
const user = await dartmouth.auth.authenticate(token);

// Check permissions
const allowed = await dartmouth.auth.checkPermission(user, 'agent:use:fam');

// Create session
const session = await dartmouth.auth.createSession(userId, { ttl: 3600 });

// Revoke session
await dartmouth.auth.revokeSession(sessionId);
```

**RBAC:**
```typescript
const roles = {
  admin: ['agent:*', 'dashboard:*', 'analytics:*'],
  user: ['agent:use', 'profile:read'],
  guest: ['agent:use:fam']  // Limited access
};
```

---

### **8. Safety & Content Filter** 🛡️

**Purpose:** Prevent harmful, inappropriate, or unsafe content

**Filters:**
- Toxicity detection (hate speech, harassment)
- PII detection (email, phone, SSN, credit cards)
- Profanity filtering (optional)
- Harmful content blocking
- Bias detection (gender, race, religion)
- Misinformation prevention

**API:**
```typescript
// Scan content
const scan = await dartmouth.security.scanContent(message);
// Returns: { safe: false, violations: ['pii_detected'], piiFound: ['email'] }

// Detect PII
const pii = await dartmouth.security.detectPII(message);
// Returns: { found: true, types: ['email', 'phone'], redacted: 'Contact me at [REDACTED]' }

// Check toxicity
const toxicity = await dartmouth.security.checkToxicity(message);
// Returns: { toxic: true, score: 0.89, categories: ['hate_speech'] }
```

**Auto-Block:**
```typescript
// If critical violation, block automatically
if (scan.violations.includes('hate_speech')) {
  return dartmouth.security.getBlockedResponse();
}
```

---

### **9. Audit & Compliance Logger** 📝

**Purpose:** Track all actions for compliance (GDPR, CCPA, SOC 2)

**Logged Events:**
- User authentication attempts
- Data access (read/write)
- Agent actions
- Configuration changes
- Security events
- Data deletions

**API:**
```typescript
// Log event
await dartmouth.audit.log({
  event: 'user_data_accessed',
  userId: 'user-123',
  agentId: 'fam',
  action: 'read',
  resource: 'conversation_history',
  timestamp: Date.now()
});

// Query logs
const logs = await dartmouth.audit.query({
  userId: 'user-123',
  timeRange: '30d',
  events: ['data_accessed', 'data_deleted']
});

// Export for compliance
const export = await dartmouth.audit.export({
  format: 'csv',
  timeRange: '1y'
});
```

**Retention:**
- Hot logs (30 days): D1
- Cold logs (7 years): R2 (compliance requirement)

---

### **10. Integration Hub** 🔌

**Purpose:** Connect to external systems and APIs

**Supported Integrations:**

#### **CRM:**
- HubSpot
- Salesforce
- Pipedrive
- Zoho CRM

#### **Email:**
- SendGrid
- Mailgun
- AWS SES

#### **Calendar:**
- Google Calendar
- Microsoft Outlook

#### **Payments:**
- Stripe
- PayPal
- Square

#### **Support:**
- Zendesk
- Intercom
- Freshdesk

#### **Custom:**
- Webhooks
- REST APIs
- GraphQL

**API:**
```typescript
// CRM - Create contact
await dartmouth.integrations.crm.createContact({
  provider: 'hubspot',
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    source: 'chat_widget'
  }
});

// Email - Send notification
await dartmouth.integrations.email.send({
  provider: 'sendgrid',
  to: 'user@example.com',
  subject: 'Order Confirmation',
  body: '...'
});

// Calendar - Schedule appointment
await dartmouth.integrations.calendar.schedule({
  provider: 'google',
  start: '2024-11-20T10:00:00Z',
  duration: 30,
  attendees: ['user@example.com']
});

// Custom webhook
await dartmouth.integrations.webhook.call({
  url: 'https://api.example.com/callback',
  method: 'POST',
  body: { event: 'conversation_complete' }
});
```

---

### **11. Event & Notification System** 🔔

**Purpose:** Real-time event distribution and notifications

**Event Bus:**
```typescript
// Publish event
await dartmouth.events.publish('agent:escalate', {
  agentId: 'fam',
  userId: 'user-123',
  reason: 'critical_frustration',
  urgency: 'high'
});

// Subscribe to events
dartmouth.events.subscribe('agent:*', async (event) => {
  console.log('Agent event:', event);
});

// Event types
const eventTypes = [
  'agent:started',
  'agent:stopped',
  'agent:error',
  'agent:escalate',
  'conversation:started',
  'conversation:complete',
  'user:frustrated',
  'sla:violation'
];
```

**Notifications:**
```typescript
// Send to user
await dartmouth.notifications.send({
  userId: 'user-123',
  type: 'email',
  subject: 'Your inquiry has been received',
  body: '...'
});

// Push notification
await dartmouth.notifications.push({
  userId: 'user-123',
  title: 'Agent Response Ready',
  body: 'Your artwork analysis is complete'
});

// SMS (optional)
await dartmouth.notifications.sms({
  to: '+1234567890',
  message: 'Your order has shipped!'
});
```

---

### **12. API Gateway** 🚪

**Purpose:** Single entry point for all agent requests

**Features:**
- Request routing
- Authentication & authorization
- Rate limiting
- Request/response transformation
- API versioning
- CORS handling
- Error handling

**Routes:**
```
POST /api/v1/agents/{agentId}/chat
POST /api/v1/agents/{agentId}/stream
GET  /api/v1/agents/{agentId}/status
GET  /api/v1/agents/{agentId}/health
POST /api/v1/agents/{agentId}/config
GET  /api/v1/analytics/{agentId}/metrics
GET  /api/v1/users/{userId}/conversations
```

---

### **13. Learning & Adaptation System** 🧠

**Purpose:** Learn from conversations to improve over time

**Capabilities:**
- User preference learning
- Conversation pattern analysis
- Response effectiveness tracking
- Automatic prompt optimization
- Continuous improvement

**API:**
```typescript
// Track feedback
await dartmouth.learning.recordFeedback({
  sessionId: 'session-123',
  messageId: 'msg-456',
  rating: 5,
  comment: 'Very helpful!'
});

// Get insights
const insights = await dartmouth.learning.getInsights('fam');
// Returns: { 
//   topSuccessPatterns: ['greeting->calculation->goodbye'],
//   avgSatisfaction: 4.5,
//   improvementAreas: ['followup_questions']
// }

// Optimize prompt
const optimizedPrompt = await dartmouth.learning.optimizePrompt('fam');
```

---

### **14. A/B Testing Framework** 🧪

**Purpose:** Continuously optimize responses

**API:**
```typescript
// Create experiment
const experiment = await dartmouth.experiments.create({
  name: 'greeting_tone',
  variants: [
    { id: 'friendly', prompt: '...' },
    { id: 'professional', prompt: '...' }
  ],
  metric: 'user_satisfaction',
  traffic: 0.5  // 50% of users
});

// Get variant for user
const variant = await dartmouth.experiments.getVariant(experimentId, userId);

// Track success
await dartmouth.experiments.trackSuccess(experimentId, userId, metric);

// Get results
const results = await dartmouth.experiments.getResults(experimentId);
// Returns: { winner: 'friendly', confidence: 0.95, lift: 0.15 }
```

---

### **15. Multi-Language Support** 🌍

**Purpose:** Support conversations in any language

**Features:**
- Auto language detection
- Translation (100+ languages)
- Locale-specific formatting
- Cultural context awareness

**API:**
```typescript
// Detect language
const lang = await dartmouth.language.detect(message);
// Returns: { language: 'es', confidence: 0.98 }

// Translate
const translated = await dartmouth.language.translate({
  text: 'Hello, how can I help?',
  from: 'en',
  to: 'es'
});
// Returns: '¡Hola! ¿Cómo puedo ayudarte?'

// Format for locale
const formatted = await dartmouth.language.formatLocale({
  number: 1234.56,
  date: Date.now(),
  currency: 99.99,
  locale: 'de-DE'
});
// Returns: { number: '1.234,56', date: '19.11.2024', currency: '99,99 €' }
```

---

### **16. Goal & Task Tracking** 🎯

**Purpose:** Track user goals across multiple conversations and agents

**API:**
```typescript
// Identify goal
const goal = await dartmouth.goals.identify({
  userId: 'user-123',
  conversation: ['I need to create artwork', 'What size should it be?'],
  currentMessage: 'How much will it cost?'
});
// Returns: { goal: 'artwork_order', confidence: 0.92, steps: ['design', 'size', 'quote', 'order'] }

// Track progress
await dartmouth.goals.trackProgress({
  userId: 'user-123',
  goalId: 'goal-789',
  completedStep: 'size',
  nextStep: 'quote'
});

// Get user journey
const journey = await dartmouth.goals.getJourney('user-123');
// Returns: { goals: [...], completionRate: 0.75, avgTime: '15m' }
```

---

### **17. Response Formatting Engine** 🎨

**Purpose:** Format responses with rich content

**Capabilities:**
- Markdown formatting
- Rich media embedding
- Interactive buttons
- Tables and charts
- Code syntax highlighting

**API:**
```typescript
// Format as Markdown
const formatted = await dartmouth.formatting.toMarkdown(text);

// Create buttons
const buttons = await dartmouth.formatting.createButtons([
  { label: 'Yes', action: 'confirm', style: 'primary' },
  { label: 'No', action: 'cancel', style: 'secondary' }
]);

// Create table
const table = await dartmouth.formatting.createTable({
  headers: ['Size', 'DPI', 'Quality'],
  rows: [
    ['10x15cm', '300', 'Excellent'],
    ['20x30cm', '200', 'Good']
  ]
});

// Embed media
const media = await dartmouth.formatting.embedMedia({
  type: 'image',
  url: 'https://example.com/artwork.jpg',
  alt: 'Your artwork preview'
});
```

---

### **18. User Journey Mapper** 🗺️

**Purpose:** Visualize and optimize user journeys

**API:**
```typescript
// Track journey
await dartmouth.journey.track({
  userId: 'user-123',
  event: 'page_view',
  page: 'chat',
  agentId: 'fam'
});

// Get journey map
const map = await dartmouth.journey.getMap('user-123');
// Returns: {
//   steps: ['landing', 'chat_start', 'artwork_question', 'escalate', 'order'],
//   duration: '18m',
//   touchpoints: ['website', 'fam', 'artwork_analyzer', 'sales']
// }

// Find drop-offs
const dropoffs = await dartmouth.journey.analyzeDropoffs();
// Returns: { commonDropoffPoint: 'pricing_question', rate: 0.35 }
```

---

## 🔗 **AGENT INTEGRATION**

### **How Agents Use Dartmouth OS**

Agents call Dartmouth services like applications call OS APIs:

```typescript
// In agent code (e.g., FAM, McCarthy Artwork)

export class BaseAgent {
  async processMessage(message: string): Promise<Response> {
    // 1. Track analytics
    await dartmouth.analytics.track({
      event: 'message_received',
      agentId: this.agentId,
      metadata: { length: message.length }
    });
    
    // 2. Check cache
    const cacheKey = `response:${hash(message)}`;
    const cached = await dartmouth.cache.get(cacheKey);
    if (cached) return cached;
    
    // 3. Scan for security
    const scan = await dartmouth.security.scanContent(message);
    if (!scan.safe) {
      return dartmouth.security.getBlockedResponse();
    }
    
    // 4. Detect language
    const lang = await dartmouth.language.detect(message);
    if (lang.language !== 'en') {
      message = await dartmouth.language.translate(message, lang.language, 'en');
    }
    
    // 5. Generate response (agent-specific logic)
    const response = await this.generateResponse(message);
    
    // 6. Format response
    const formatted = await dartmouth.formatting.toRichText(response);
    
    // 7. Cache response
    await dartmouth.cache.set(cacheKey, formatted, { ttl: 3600 });
    
    // 8. Track success
    await dartmouth.analytics.track({
      event: 'response_sent',
      agentId: this.agentId,
      metadata: { responseTime: Date.now() - startTime }
    });
    
    return formatted;
  }
}
```

### **Agent Lifecycle**

```typescript
// 1. Registration
await dartmouth.agents.register({
  agentId: 'fam',
  type: 'foundational',
  version: '2.0.0',
  capabilities: ['conversation', 'intent_detection', 'constraints']
});

// 2. Health checks
setInterval(async () => {
  await dartmouth.health.heartbeat('fam');
}, 30000); // Every 30 seconds

// 3. Deregistration
await dartmouth.agents.deregister('fam');
```

---

## 📡 **API SPECIFICATION**

### **Base URL**

```
https://agent-army-worker.dartmouth.workers.dev/api/v1
```

### **Authentication**

```typescript
// API Key (header)
Authorization: Bearer sk-dartmouth-...

// JWT Token (header)
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### **Core Endpoints**

#### **Analytics**
```
POST   /analytics/track
GET    /analytics/metrics/{agentId}
GET    /analytics/insights/{agentId}
```

#### **Cache**
```
GET    /cache/{key}
PUT    /cache/{key}
DELETE /cache/{key}
GET    /cache/stats
```

#### **Security**
```
POST   /security/scan
POST   /security/detect-pii
POST   /security/check-toxicity
```

#### **Integrations**
```
POST   /integrations/crm/{provider}/contacts
POST   /integrations/email/send
POST   /integrations/webhooks/call
```

#### **Events**
```
POST   /events/publish
GET    /events/subscribe/{pattern}
```

For complete API docs, see: `DARTMOUTH_API_DOCUMENTATION.md`

---

## 💰 **COST MANAGEMENT**

### **Cost Tracking**

```typescript
// Real-time cost tracking
const costs = await dartmouth.costs.getCurrent();
// Returns: {
//   today: { llm: 12.50, total: 15.75 },
//   month: { llm: 245.00, total: 312.50 },
//   projected: { month: 425.00 }
// }

// Set budget alerts
await dartmouth.costs.setBudget({
  daily: 50,
  monthly: 1000,
  alertThreshold: 0.8  // Alert at 80%
});
```

### **Cost Optimization**

```typescript
// Enable cost-saving mode
if (await dartmouth.costs.exceeds Threshold(0.9)) {
  await dartmouth.costs.enableSavingMode({
    aggressiveCaching: true,
    useCheaperModels: true,
    reduceMaxTokens: true
  });
}
```

### **Cost Breakdown**

```typescript
const breakdown = await dartmouth.costs.getBreakdown('30d');
// Returns: {
//   llm: { openai: 245.00, anthropic: 0 },
//   infrastructure: { workers: 5.00, d1: 0, kv: 1.50, r2: 2.00 },
//   integrations: { sendgrid: 0, hubspot: 15.00 },
//   total: 268.50
// }
```

---

## 📊 **MONITORING & ANALYTICS**

### **Real-Time Dashboard**

Access at: `https://dartmouth.workers.dev/dashboard`

**Panels:**
1. **Agent Health** - Status of all agents
2. **Performance** - Response times, error rates
3. **Usage** - Conversations, messages, users
4. **Costs** - Real-time spend tracking
5. **SLA Compliance** - SLA metrics and violations
6. **Security** - Threats detected, PII found

### **Alerts**

```typescript
// Configure alerts
await dartmouth.alerts.configure({
  channels: ['email', 'slack', 'pagerduty'],
  rules: [
    { condition: 'responseTime > 5000', severity: 'critical' },
    { condition: 'errorRate > 5', severity: 'high' },
    { condition: 'dailyCost > 100', severity: 'medium' }
  ]
});
```

---

## 🔐 **SECURITY & COMPLIANCE**

### **Data Privacy**

- **Encryption:** All data encrypted at rest (AES-256) and in transit (TLS 1.3)
- **Data Retention:** Configurable (default: 90 days)
- **Right to Erasure:** User data can be deleted on request
- **Data Export:** Users can export all their data

### **Compliance**

- ✅ **GDPR** compliant (EU data protection)
- ✅ **CCPA** compliant (California privacy)
- ✅ **SOC 2 Type II** ready
- ✅ **HIPAA** ready (for healthcare agents)

### **Audit Logs**

All actions logged for compliance:
```typescript
const logs = await dartmouth.audit.query({
  userId: 'user-123',
  action: 'data_deleted',
  timeRange: '1y'
});
```

---

## 🚀 **DEPLOYMENT**

### **Production Environment**

- **Platform:** Cloudflare Workers
- **Regions:** Global (300+ edge locations)
- **Deployment:** GitHub Actions (CI/CD)

### **Deploy Command**

```bash
cd packages/worker
npm run deploy
```

### **Environment Variables**

```bash
# LLM Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
GOOGLE_API_KEY=...

# Integrations
HUBSPOT_API_KEY=...
SENDGRID_API_KEY=...

# Config
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
ENVIRONMENT=production
```

---

## 📈 **SCALING STRATEGY**

### **Horizontal Scaling**

Cloudflare Workers scale automatically:
- No configuration needed
- Infinite scalability
- Global distribution
- Auto load balancing

### **Performance Targets**

| Load | Response Time | Cost |
|------|--------------|------|
| 100 req/day | <500ms | $15/mo |
| 1K req/day | <500ms | $60/mo |
| 10K req/day | <500ms | $500/mo |
| 100K req/day | <500ms | $3K/mo |
| 1M req/day | <500ms | $20K/mo |

---

## ✅ **BEST PRACTICES**

### **For Dartmouth Administrators**

1. **Monitor costs daily** - Set budget alerts
2. **Review SLA compliance weekly** - Track violations
3. **Analyze agent performance** - Optimize slow agents
4. **Security audits monthly** - Review logs
5. **Update agents regularly** - Deploy improvements

### **For Agent Developers**

1. **Use caching aggressively** - Check cache before LLM
2. **Track all events** - Enable monitoring
3. **Handle errors gracefully** - Use Dartmouth error handlers
4. **Respect rate limits** - Don't overload services
5. **Test with Dartmouth services** - Integration testing

---

## 🎯 **SUMMARY**

**Dartmouth OS is:**
- ✅ The operating system for AI agents
- ✅ The heart pumping life to all agents
- ✅ The infrastructure layer (agents stay lean)
- ✅ The intelligence layer (learning, analytics)
- ✅ The security layer (protect all agents)
- ✅ The integration layer (connect to world)

**Benefits:**
- ✅ Agents stay lightweight and fast
- ✅ Shared infrastructure (no duplication)
- ✅ Centralized monitoring and control
- ✅ Cost optimization (caching, resource management)
- ✅ Enterprise-ready (security, compliance)
- ✅ Easy to scale (infinite capacity)

**Dartmouth OS enables the entire McCarthy AI agent fleet to operate efficiently, securely, and cost-effectively.** 🚀

---

**For API Reference:** See `DARTMOUTH_API_DOCUMENTATION.md`  
**For Cost Optimization:** See `COST_OPTIMIZATION_GUIDE.md`  
**For Architecture Diagrams:** See `ARCHITECTURE_DIAGRAMS.md`

