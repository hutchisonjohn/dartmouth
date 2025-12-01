# 🎼 DARTMOUTH OS V2.0 - Complete Technical Specification
## The Operating System & Heart of the AI Agent Fleet

**Version:** 2.0.0  
**Date:** November 19, 2024  
**Status:** Active Development  
**Purpose:** Next-generation platform services for all McCarthy AI agents with voice, multi-modal, and orchestration capabilities

---

## 📖 TABLE OF CONTENTS

1. [What is Dartmouth OS V2.0?](#what-is-dartmouth-os-v20)
2. [What's New in V2.0](#whats-new-in-v20)
3. [Architecture Overview](#architecture-overview)
4. [9-Layer Architecture](#9-layer-architecture)
5. [Platform Services (33 Total)](#platform-services-33-total)
6. [Tech Stack](#tech-stack)
7. [Agent Integration](#agent-integration)
8. [Cost Management](#cost-management)
9. [Security & Compliance](#security--compliance)
10. [Deployment](#deployment)
11. [Scaling Strategy](#scaling-strategy)
12. [API Reference](#api-reference)

---

## 🎯 **WHAT IS DARTMOUTH OS V2.0?**

### **Definition**

**Dartmouth OS V2.0** is the next-generation platform operating system that provides infrastructure, services, and orchestration for all McCarthy AI agents. It's the **Operating System and Heart** of the entire agent fleet.

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

| Operating System | DARTMOUTH OS V2.0 |
|-----------------|-------------------|
| Runs applications | Runs agents |
| Manages memory | Manages context & cache |
| Handles file I/O | Handles integrations (CRM, email) |
| Provides security | Provides auth & compliance |
| Monitors performance | Monitors SLAs & analytics |
| Schedules processes | Orchestrates agent tasks |
| Updates applications | Learns & adapts agents |
| API for apps | API for agents |
| **NEW: Audio I/O** | **Voice Services (STT/TTS)** |
| **NEW: Multi-tasking** | **Agent Orchestration & Swarms** |
| **NEW: Sensors** | **Multi-Modal Intelligence** |

---

## 🆕 **WHAT'S NEW IN V2.0**

### **Major Additions**

| Feature | V1.0 | V2.0 | Impact |
|---------|------|------|--------|
| **Voice & Audio** | ❌ None | ✅ Full Layer (STT/TTS/streaming/VAD) | Voice-first agents (PA Agent) |
| **Multi-Modal** | ❌ None | ✅ Full Layer (vision/audio/docs) | Image analysis, document processing |
| **Orchestration** | ❌ None | ✅ Full Layer (agent-to-agent/swarms) | Complex multi-agent workflows |
| **Agent Registry** | ⚠️ Basic | ✅ Advanced (discovery, health) | Dynamic agent management |
| **Cross-Agent Memory** | ❌ None | ✅ Shared context | Agents learn from each other |
| **Workflow Engine** | ❌ None | ✅ Visual workflows | No-code agent automation |
| **Advanced Analytics** | ⚠️ Basic | ✅ Real-time dashboards | Business intelligence |
| **Cost Optimization** | ⚠️ Manual | ✅ Automated | AI-driven cost reduction |

### **V1.0 → V2.0 Migration Path**

**Existing Agents (FAM, Artwork Analyzer):**
- ✅ **No changes required** - V1 API still supported
- ✅ **Opt-in upgrades** - Add voice/multi-modal when ready
- ✅ **Backward compatible** - All V1 endpoints work in V2

**New Agents (PA Agent, CustomerSupport AI):**
- ✅ **Built on V2** - Use new voice/orchestration features
- ✅ **Full platform access** - All 33 services available

---

## 🏗️ **ARCHITECTURE OVERVIEW**

### **High-Level Architecture**

```
╔═══════════════════════════════════════════════════════════════════╗
║                    DARTMOUTH OS V2.0 (The Heart)                  ║
╚═══════════════════════════════════════════════════════════════════╝
║                                                                    ║
║  ┌──────────────────────────────────────────────────────────────┐ ║
║  │  LAYER 9: ORCHESTRATION & WORKFLOWS (NEW V2.0)              │ ║
║  │  Agent-to-Agent | Swarms | Workflow Engine | Cross-Memory   │ ║
║  └──────────────────────────────────────────────────────────────┘ ║
║                                                                    ║
║  ┌──────────────────────────────────────────────────────────────┐ ║
║  │  LAYER 8: MULTI-MODAL INTELLIGENCE (NEW V2.0)               │ ║
║  │  Vision-Language | Document Intelligence | Audio Analysis    │ ║
║  └──────────────────────────────────────────────────────────────┘ ║
║                                                                    ║
║  ┌──────────────────────────────────────────────────────────────┐ ║
║  │  LAYER 7: VOICE & AUDIO SERVICES (NEW V2.0)                 │ ║
║  │  STT | TTS | Audio Streaming | VAD | Interrupt Handling     │ ║
║  └──────────────────────────────────────────────────────────────┘ ║
║                                                                    ║
║  ┌──────────────────────────────────────────────────────────────┐ ║
║  │  LAYER 6: MONITORING & HEALTH                               │ ║
║  │  Analytics | Telemetry | SLA Monitoring | Health Checks     │ ║
║  └──────────────────────────────────────────────────────────────┘ ║
║                                                                    ║
║  ┌──────────────────────────────────────────────────────────────┐ ║
║  │  LAYER 5: PERFORMANCE & OPTIMIZATION                         │ ║
║  │  Cache Manager | Load Balancer | Resource Allocator         │ ║
║  └──────────────────────────────────────────────────────────────┘ ║
║                                                                    ║
║  ┌──────────────────────────────────────────────────────────────┐ ║
║  │  LAYER 4: SECURITY & COMPLIANCE                              │ ║
║  │  Auth Manager | Content Filter | Audit Logger               │ ║
║  └──────────────────────────────────────────────────────────────┘ ║
║                                                                    ║
║  ┌──────────────────────────────────────────────────────────────┐ ║
║  │  LAYER 3: INTEGRATION & COMMUNICATION                        │ ║
║  │  Integration Hub | Event System | API Gateway               │ ║
║  └──────────────────────────────────────────────────────────────┘ ║
║                                                                    ║
║  ┌──────────────────────────────────────────────────────────────┐ ║
║  │  LAYER 2: INTELLIGENCE & LEARNING                            │ ║
║  │  LLM Services | RAG | Sentiment | Intent Detection          │ ║
║  └──────────────────────────────────────────────────────────────┘ ║
║                                                                    ║
║  ┌──────────────────────────────────────────────────────────────┐ ║
║  │  LAYER 1: CORE PLATFORM                                      │ ║
║  │  Database | Storage | Auth | Rate Limiting | Logging        │ ║
║  └──────────────────────────────────────────────────────────────┘ ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
                                  ↓
╔════════════════════════════════════════════════════════════════════╗
║                         LEAN AGENTS                                ║
║  FAM | Artwork Analyzer | PA Agent | CustomerSupport AI           ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## 🏛️ **9-LAYER ARCHITECTURE**

### **LAYER 1: CORE PLATFORM** 🔧

**Purpose:** Foundation services for all agents

**Services (6):**
1. **Database Service** - D1 wrapper for SQL operations
2. **Storage Service** - R2 for files, images, audio
3. **Auth Service** - JWT authentication & authorization
4. **Rate Limiting** - Prevent abuse, control costs
5. **Logging Service** - Centralized logging
6. **Error Handling** - Standardized error responses

**Tech Stack:**
- Cloudflare D1 (SQLite at edge)
- Cloudflare R2 (object storage)
- JWT tokens (stateless auth)
- Cloudflare KV (rate limit counters)

---

### **LAYER 2: INTELLIGENCE & LEARNING** 🧠

**Purpose:** AI/ML services for agent intelligence

**Services (4):**
1. **LLM Service** - OpenAI, Anthropic, Google integration
2. **RAG Engine** - Knowledge base & document retrieval
3. **Sentiment Analysis** - Emotion detection
4. **Intent Detection** - User goal classification

**Tech Stack:**
- OpenAI GPT-4o-mini (primary LLM)
- Anthropic Claude (fallback)
- Cloudflare Vectorize (embeddings)
- Custom sentiment models

---

### **LAYER 3: INTEGRATION & COMMUNICATION** 🔗

**Purpose:** Connect agents to external systems

**Services (5):**
1. **API Gateway** - Route requests to agents
2. **Event System** - Pub/sub for agent events
3. **Webhook Manager** - Receive external events
4. **Integration Hub** - CRM, email, calendar, SMS
5. **Notification Service** - Push, email, SMS notifications

**Tech Stack:**
- Cloudflare Workers (API gateway)
- Cloudflare Queues (event system)
- Twilio (SMS)
- SendGrid (email)
- Google Calendar API

---

### **LAYER 4: SECURITY & COMPLIANCE** 🔒

**Purpose:** Protect agents and user data

**Services (4):**
1. **Auth Manager** - User authentication
2. **Content Filter** - Block harmful content
3. **Audit Logger** - Compliance logging
4. **Encryption Service** - Data encryption

**Tech Stack:**
- JWT + refresh tokens
- OpenAI Moderation API
- Cloudflare D1 (audit logs)
- Web Crypto API

---

### **LAYER 5: PERFORMANCE & OPTIMIZATION** ⚡

**Purpose:** Keep agents fast and cost-effective

**Services (4):**
1. **Cache Manager** - Multi-layer caching (KV, memory)
2. **Load Balancer** - Distribute requests
3. **Resource Allocator** - CPU/memory management
4. **Cost Optimizer** - AI-driven cost reduction

**Tech Stack:**
- Cloudflare KV (edge cache)
- In-memory cache (Workers)
- Cloudflare Load Balancing
- Custom cost analytics

---

### **LAYER 6: MONITORING & HEALTH** 📊

**Purpose:** Keep agents healthy and performant

**Services (5):**
1. **Health Monitor** - Agent health checks
2. **Analytics Service** - Usage analytics
3. **Telemetry** - Performance metrics
4. **SLA Monitor** - Track SLA compliance
5. **Alert Manager** - Incident alerts

**Tech Stack:**
- Cloudflare Analytics
- Custom health checks
- Cloudflare Durable Objects (metrics)
- PagerDuty (alerts)

---

### **LAYER 7: VOICE & AUDIO SERVICES** 🎤 **(NEW V2.0)**

**Purpose:** Enable voice-first agents

**Services (5):**
1. **Speech-to-Text (STT)** - Convert voice to text
2. **Text-to-Speech (TTS)** - Convert text to voice
3. **Audio Streaming** - Real-time audio processing
4. **Voice Activity Detection (VAD)** - Detect speech
5. **Interrupt Handling** - Handle user interruptions

**Tech Stack:**
- **Native STT/TTS** (iOS/Android) - Primary (free)
- **F5-TTS** (self-hosted) - High-quality, cost-effective
- **OpenAI Whisper** (fallback) - $0.006/min
- **ElevenLabs** (premium) - $0.30/1K chars
- WebRTC (audio streaming)
- Cloudflare Stream (audio storage)

**Cost Optimization:**
```
Native (iOS/Android):  $0.00/min  ← Primary
F5-TTS (self-hosted):  $0.01/min  ← Secondary
OpenAI Whisper:        $0.006/min ← Fallback
ElevenLabs:            $0.30/min  ← Premium only
```

---

### **LAYER 8: MULTI-MODAL INTELLIGENCE** 👁️ **(NEW V2.0)**

**Purpose:** Process images, audio, documents

**Services (4):**
1. **Vision-Language Models** - Image understanding
2. **Document Intelligence** - PDF/doc processing
3. **Audio Analysis** - Music, sound classification
4. **Multi-Modal Context** - Combine text/image/audio

**Tech Stack:**
- GPT-4 Vision (image analysis)
- Claude 3 Opus (document analysis)
- Cloudflare AI (image classification)
- Custom audio models

**Use Cases:**
- Artwork Analyzer: Analyze uploaded artwork images
- PA Agent: Process receipts, business cards
- CustomerSupport AI: Analyze product photos

---

### **LAYER 9: ORCHESTRATION & WORKFLOWS** 🎭 **(NEW V2.0)**

**Purpose:** Coordinate multiple agents

**Services (5):**
1. **Agent-to-Agent Communication** - Agents talk to each other
2. **Swarm Coordination** - Multiple agents work together
3. **Workflow Engine** - Visual workflow builder
4. **Agent Registry** - Discover and route to agents
5. **Cross-Agent Memory** - Shared context between agents

**Tech Stack:**
- Cloudflare Durable Objects (agent state)
- Cloudflare Queues (agent messaging)
- Custom workflow engine
- Shared KV store (cross-agent memory)

**Use Cases:**
- **Lead Scraping Agent** → **Cold Outreach Agent** → **PA Agent** (follow-up)
- **Content Research Agent** → **Copywriter Agent** → **AdFusion AI** (ad creation)
- **CustomerSupport AI** → **Artwork Analyzer** → **PerfectPrint AI** (order processing)

---

## 📦 **PLATFORM SERVICES (33 TOTAL)**

### **Core Platform (6)**
1. Database Service
2. Storage Service
3. Auth Service
4. Rate Limiting
5. Logging Service
6. Error Handling

### **Intelligence & Learning (4)**
7. LLM Service
8. RAG Engine
9. Sentiment Analysis
10. Intent Detection

### **Integration & Communication (5)**
11. API Gateway
12. Event System
13. Webhook Manager
14. Integration Hub
15. Notification Service

### **Security & Compliance (4)**
16. Auth Manager
17. Content Filter
18. Audit Logger
19. Encryption Service

### **Performance & Optimization (4)**
20. Cache Manager
21. Load Balancer
22. Resource Allocator
23. Cost Optimizer

### **Monitoring & Health (5)**
24. Health Monitor
25. Analytics Service
26. Telemetry
27. SLA Monitor
28. Alert Manager

### **Voice & Audio (5)** *(NEW V2.0)*
29. Speech-to-Text (STT)
30. Text-to-Speech (TTS)
31. Audio Streaming
32. Voice Activity Detection (VAD)
33. Interrupt Handling

### **Multi-Modal Intelligence (4)** *(NEW V2.0)*
34. Vision-Language Models
35. Document Intelligence
36. Audio Analysis
37. Multi-Modal Context

### **Orchestration & Workflows (5)** *(NEW V2.0)*
38. Agent-to-Agent Communication
39. Swarm Coordination
40. Workflow Engine
41. Agent Registry
42. Cross-Agent Memory

**Total: 42 Services** (33 MVP + 9 Future)

---

## 🛠️ **TECH STACK**

### **Compute**
- **Cloudflare Workers** - Serverless compute at edge
  - 100K requests/day FREE
  - $5/month for 10M+ requests
  - Sub-50ms response times globally

### **Database**
- **Cloudflare D1** - SQLite at edge
  - 5GB storage FREE
  - 5M reads/day FREE
  - 100K writes/day FREE

### **Storage**
- **Cloudflare R2** - Object storage
  - 10GB storage FREE
  - No egress fees
  - $0.015/GB/month

### **Cache**
- **Cloudflare KV** - Key-value store
  - 1GB FREE
  - Sub-millisecond reads
  - Global replication

### **Voice**
- **Native STT/TTS** (iOS/Android) - FREE
- **F5-TTS** (self-hosted) - $0.01/min
- **OpenAI Whisper** - $0.006/min (fallback)
- **ElevenLabs** - $0.30/min (premium)

### **LLM**
- **OpenAI GPT-4o-mini** - $0.15/1M input, $0.60/1M output
- **Anthropic Claude 3.5 Sonnet** - $3/1M input, $15/1M output (fallback)

### **Integrations**
- **Twilio** - SMS ($0.0079/msg)
- **SendGrid** - Email (100/day FREE)
- **Google Calendar API** - FREE

### **Monitoring**
- **Cloudflare Analytics** - FREE
- **Custom dashboards** - Self-hosted

---

## 💰 **COST MANAGEMENT**

### **MVP Costs (Month 1)**

| Service | Cost | Notes |
|---------|------|-------|
| Cloudflare Workers | $5-15 | 1M-10M requests |
| Cloudflare D1 | $0-5 | Under free tier |
| Cloudflare R2 | $0-5 | Under free tier |
| Cloudflare KV | $0-5 | Under free tier |
| OpenAI (LLM) | $10-30 | GPT-4o-mini + caching |
| Voice (Native) | $0 | iOS/Android native |
| Voice (F5-TTS) | $5-15 | Self-hosted backup |
| Integrations | $5-10 | Twilio, SendGrid |
| **TOTAL** | **$25-85** | **Ultra-lean MVP** |

### **Growth Scaling**

| Usage | Monthly Cost | Notes |
|-------|--------------|-------|
| 100 conversations/day | $30-50 | Hobby project |
| 1,000 conversations/day | $100-200 | Small business |
| 10,000 conversations/day | $500-1,000 | Growing business |
| 100,000 conversations/day | $3,000-5,000 | Enterprise |

### **Cost Optimization Strategies**

1. **Aggressive Caching** - Cache LLM responses (90% hit rate = 90% cost savings)
2. **Native Voice First** - Use free native STT/TTS before paid APIs
3. **Prompt Compression** - Reduce token usage by 50%
4. **Smart Rate Limiting** - Prevent abuse
5. **Resource Pooling** - Share infrastructure across agents
6. **Graceful Degradation** - Scale down under low load
7. **Real-time Monitoring** - Alert on cost spikes

---

## 🔐 **SECURITY & COMPLIANCE**

### **Authentication**
- JWT tokens (access + refresh)
- Token expiry: 1 hour (access), 7 days (refresh)
- Secure token storage (httpOnly cookies)

### **Authorization**
- Role-based access control (RBAC)
- Agent-level permissions
- API key authentication for agents

### **Data Protection**
- Encryption at rest (R2, D1)
- Encryption in transit (TLS 1.3)
- PII redaction in logs

### **Compliance**
- GDPR compliant (data deletion, export)
- CCPA compliant (data privacy)
- SOC 2 ready (audit logs)

### **Content Moderation**
- OpenAI Moderation API
- Custom content filters
- User reporting system

---

## 🚀 **DEPLOYMENT**

### **Infrastructure**
- **Cloudflare Workers** - Global edge network (300+ cities)
- **GitHub Actions** - CI/CD pipeline
- **Wrangler** - Cloudflare CLI for deployment

### **Environments**
- **Development** - `dev.dartmouth-os.com`
- **Staging** - `staging.dartmouth-os.com`
- **Production** - `api.dartmouth-os.com`

### **Deployment Process**
```bash
# 1. Run tests
npm test

# 2. Build
npm run build

# 3. Deploy to staging
wrangler deploy --env staging

# 4. Test staging
npm run test:e2e -- --env staging

# 5. Deploy to production
wrangler deploy --env production
```

### **Rollback**
```bash
# Rollback to previous version
wrangler rollback --env production
```

---

## 📈 **SCALING STRATEGY**

### **Horizontal Scaling**
- Cloudflare Workers auto-scale globally
- No manual scaling required
- Handles millions of requests/second

### **Vertical Scaling**
- Increase CPU time per request (up to 50ms)
- Increase memory per request (up to 128MB)
- Use Durable Objects for stateful workloads

### **Database Scaling**
- D1 read replicas (automatic)
- Sharding by agent ID (manual)
- Caching layer (KV) reduces DB load

### **Cost Scaling**
- Pay-per-request model (no idle costs)
- Free tier covers 100K requests/day
- Linear cost scaling with usage

---

## 📚 **API REFERENCE**

**Full API documentation:**
- [DARTMOUTH_API_V2_DOCUMENTATION.md](./DARTMOUTH_API_V2_DOCUMENTATION.md) - 30,000+ words, 150+ endpoints

**Quick Links:**
- [Authentication](#) - JWT, OAuth, API keys
- [Agent Management](#) - Register, discover, health
- [Voice Services](#) - STT, TTS, streaming
- [Multi-Modal](#) - Vision, audio, documents
- [Orchestration](#) - Agent-to-agent, workflows
- [Database](#) - CRUD operations
- [Storage](#) - File upload/download
- [Analytics](#) - Usage metrics

---

## 🎯 **AGENT INTEGRATION**

### **How Agents Use Dartmouth OS**

```typescript
// Example: PA Agent using Dartmouth OS

import { DartmouthClient } from '@dartmouth/client';

const dartmouth = new DartmouthClient({
  apiKey: process.env.DARTMOUTH_API_KEY,
  agentId: 'mccarthy-pa',
});

// 1. Authenticate user
const { user, token } = await dartmouth.auth.login({
  email: 'user@example.com',
  password: 'password',
});

// 2. Use voice services
const transcript = await dartmouth.voice.transcribe({
  audioUrl: 'https://example.com/audio.mp3',
  language: 'en-US',
});

// 3. Process with LLM
const response = await dartmouth.llm.chat({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: transcript },
  ],
  model: 'gpt-4o-mini',
});

// 4. Convert to speech
const audioUrl = await dartmouth.voice.synthesize({
  text: response.content,
  voice: 'alloy',
  format: 'mp3',
});

// 5. Save to database
await dartmouth.db.insert('tasks', {
  userId: user.id,
  title: 'Follow up with client',
  dueDate: Date.now() + 86400000, // Tomorrow
});

// 6. Send notification
await dartmouth.notifications.push({
  userId: user.id,
  title: 'New task created',
  body: 'Follow up with client',
});
```

---

## 🏁 **GETTING STARTED**

### **For Developers**

1. **Read the docs:**
   - [DARTMOUTH_OS_START_HERE_NOV19.md](../../DARTMOUTH_OS_START_HERE_NOV19.md) - Quick start (2 min)
   - [DARTMOUTH_OS_MVP_BUILD_PLAN.md](../../DARTMOUTH_OS_MVP_BUILD_PLAN.md) - Build plan
   - [DARTMOUTH_API_V2_DOCUMENTATION.md](./DARTMOUTH_API_V2_DOCUMENTATION.md) - API reference

2. **Install the client:**
   ```bash
   npm install @dartmouth/client
   ```

3. **Get API key:**
   ```bash
   # Contact admin for API key
   ```

4. **Build your agent:**
   ```typescript
   import { DartmouthClient } from '@dartmouth/client';
   
   const dartmouth = new DartmouthClient({
     apiKey: process.env.DARTMOUTH_API_KEY,
     agentId: 'my-agent',
   });
   
   // Start building!
   ```

---

## 📞 **SUPPORT**

- **Documentation:** [docs/dartmouth-os/v2/](.)
- **API Reference:** [DARTMOUTH_API_V2_DOCUMENTATION.md](./DARTMOUTH_API_V2_DOCUMENTATION.md)
- **Build Plan:** [DARTMOUTH_OS_MVP_BUILD_PLAN.md](../../DARTMOUTH_OS_MVP_BUILD_PLAN.md)
- **GitHub:** [github.com/hutchisonjohn/dartmouth](https://github.com/hutchisonjohn/dartmouth)

---

## 📝 **VERSION HISTORY**

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | Nov 19, 2024 | Initial V2.0 release with voice, multi-modal, orchestration |
| 1.0.0 | Nov 15, 2024 | Initial V1.0 release with core platform services |

---

**STATUS: READY TO BUILD** 🚀

All specifications complete. Ready to start development.

**Next Step:** Open [DARTMOUTH_OS_MVP_BUILD_PLAN.md](../../DARTMOUTH_OS_MVP_BUILD_PLAN.md) and start Phase 1!

