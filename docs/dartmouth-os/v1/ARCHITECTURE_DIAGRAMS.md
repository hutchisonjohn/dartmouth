# 🏗️ DARTMOUTH & FAM ARCHITECTURE DIAGRAMS
## Visual Reference for System Architecture

**Version:** 1.0.0  
**Date:** November 19, 2024

---

## 📖 TABLE OF CONTENTS

1. [The Big Picture - OS/Heart Model](#the-big-picture---osheart-model)
2. [Dartmouth OS Architecture](#dartmouth-os-architecture)
3. [FAM Agent Architecture](#fam-agent-architecture)
4. [Agent-to-Dartmouth Communication](#agent-to-dartmouth-communication)
5. [Request Flow](#request-flow)
6. [Caching Architecture](#caching-architecture)
7. [Cost Optimization Flow](#cost-optimization-flow)
8. [Deployment Architecture](#deployment-architecture)

---

## 🌍 **THE BIG PICTURE - OS/HEART MODEL**

### **Dartmouth OS = The Heart & Operating System**

```
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║                    ██████╗  █████╗ ██████╗ ████████╗███╗   ███╗ ██████╗     ║
║                    ██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝████╗ ████║██╔═══██╗    ║
║                    ██║  ██║███████║██████╔╝   ██║   ██╔████╔██║██║   ██║    ║
║                    ██║  ██║██╔══██║██╔══██╗   ██║   ██║╚██╔╝██║██║   ██║    ║
║                    ██████╔╝██║  ██║██║  ██║   ██║   ██║ ╚═╝ ██║╚██████╔╝    ║
║                    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝     ╚═╝ ╚═════╝     ║
║                                                                        ║
║              THE OPERATING SYSTEM & HEART OF THE AGENT FLEET          ║
║                                                                        ║
╠════════════════════════════════════════════════════════════════════════╣
║                                                                        ║
║  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  ║
║  ┃  LAYER 1: MONITORING & HEALTH                                  ┃  ║
║  ┃  Analytics | Telemetry | SLA Monitor | Health Checks          ┃  ║
║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ║
║                                                                        ║
║  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  ║
║  ┃  LAYER 2: PERFORMANCE & OPTIMIZATION                           ┃  ║
║  ┃  Cache Manager | Load Balancer | Resource Allocator           ┃  ║
║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ║
║                                                                        ║
║  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  ║
║  ┃  LAYER 3: SECURITY & COMPLIANCE                                ┃  ║
║  ┃  Auth Manager | Content Filter | Audit Logger                 ┃  ║
║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ║
║                                                                        ║
║  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  ║
║  ┃  LAYER 4: INTEGRATION & COMMUNICATION                          ┃  ║
║  ┃  Integration Hub | Event System | API Gateway                 ┃  ║
║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ║
║                                                                        ║
║  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  ║
║  ┃  LAYER 5: INTELLIGENCE & LEARNING                              ┃  ║
║  ┃  Learning System | A/B Testing | Multi-Language               ┃  ║
║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ║
║                                                                        ║
║  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  ║
║  ┃  LAYER 6: USER EXPERIENCE                                      ┃  ║
║  ┃  Goal Tracking | Formatting | Notification System             ┃  ║
║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ║
║                                                                        ║
╚════════════════════════════╦═══════════════════════════════════════════╝
                             ║
                             ║ PROVIDES SERVICES TO
                             ║
         ┌───────────────────╬─────────────────┬────────────┬───────────┐
         │                   ║                 │            │           │
    ┌────▼────┐        ┌────▼────┐      ┌────▼────┐  ┌────▼────┐ ┌────▼────┐
    │   FAM   │        │McCarthy │      │  Lead   │  │  Cold   │ │  Copy   │
    │  Agent  │        │ Artwork │      │ Scraper │  │Outreach │ │ Writer  │
    │         │        │  Agent  │      │  Agent  │  │  Agent  │ │  Agent  │
    │14 comps │        │FAM + Art│      │FAM+Leads│  │FAM+Email│ │FAM+Write│
    └─────────┘        └─────────┘      └─────────┘  └─────────┘ └─────────┘
     Lightweight        Lightweight      Lightweight  Lightweight  Lightweight
     Fast               Fast             Fast         Fast         Fast
     Focused            Focused          Focused      Focused      Focused
```

---

## 🎼 **DARTMOUTH OS ARCHITECTURE**

### **18 Platform Services in 6 Layers**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DARTMOUTH OS SERVICES                            │
└─────────────────────────────────────────────────────────────────────┘

╔═════════════════════════════════════════════════════════════════════╗
║  LAYER 1: MONITORING & HEALTH ❤️                                    ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║  ┌─────────────────────┐  ┌──────────────────┐  ┌───────────────┐ ║
║  │  Analytics &        │  │  SLA Monitoring  │  │  Health Check │ ║
║  │  Telemetry Engine   │  │  & Enforcement   │  │  System       │ ║
║  │                     │  │                  │  │               │ ║
║  │  • Event tracking   │  │  • P50/P95/P99   │  │  • Heartbeats │ ║
║  │  • Metrics          │  │  • Uptime track  │  │  • Status     │ ║
║  │  • Insights         │  │  • Alerts        │  │  • Recovery   │ ║
║  └─────────────────────┘  └──────────────────┘  └───────────────┘ ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝

╔═════════════════════════════════════════════════════════════════════╗
║  LAYER 2: PERFORMANCE & OPTIMIZATION ⚡                              ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║  ┌─────────────────────┐  ┌──────────────────┐  ┌───────────────┐ ║
║  │  Cache &            │  │  Load            │  │  Resource     │ ║
║  │  Performance Mgr    │  │  Balancer        │  │  Allocator    │ ║
║  │                     │  │                  │  │               │ ║
║  │  • Multi-layer      │  │  • Round-robin   │  │  • Quotas     │ ║
║  │  • Cache warming    │  │  • Health-based  │  │  • Limits     │ ║
║  │  • Hit rate 60%+    │  │  • Geo routing   │  │  • Throttling │ ║
║  └─────────────────────┘  └──────────────────┘  └───────────────┘ ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝

╔═════════════════════════════════════════════════════════════════════╗
║  LAYER 3: SECURITY & COMPLIANCE 🛡️                                  ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║  ┌─────────────────────┐  ┌──────────────────┐  ┌───────────────┐ ║
║  │  Security &         │  │  Safety &        │  │  Audit &      │ ║
║  │  Auth Manager       │  │  Content Filter  │  │  Compliance   │ ║
║  │                     │  │                  │  │               │ ║
║  │  • JWT/API Keys     │  │  • PII detection │  │  • Logs       │ ║
║  │  • RBAC             │  │  • Toxicity scan │  │  • GDPR/CCPA  │ ║
║  │  • Session mgmt     │  │  • Profanity     │  │  • SOC 2      │ ║
║  └─────────────────────┘  └──────────────────┘  └───────────────┘ ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝

╔═════════════════════════════════════════════════════════════════════╗
║  LAYER 4: INTEGRATION & COMMUNICATION 🔌                            ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║  ┌─────────────────────┐  ┌──────────────────┐  ┌───────────────┐ ║
║  │  Integration        │  │  Event &         │  │  API          │ ║
║  │  Hub                │  │  Notification    │  │  Gateway      │ ║
║  │                     │  │                  │  │               │ ║
║  │  • CRM (HubSpot)    │  │  • Event bus     │  │  • Routing    │ ║
║  │  • Email (SendGrid) │  │  • Pub/Sub       │  │  • Auth       │ ║
║  │  • Webhooks         │  │  • Push/Email    │  │  • Rate limit │ ║
║  └─────────────────────┘  └──────────────────┘  └───────────────┘ ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝

╔═════════════════════════════════════════════════════════════════════╗
║  LAYER 5: INTELLIGENCE & LEARNING 🧠                                ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║  ┌─────────────────────┐  ┌──────────────────┐  ┌───────────────┐ ║
║  │  Learning &         │  │  A/B Testing     │  │  Multi-       │ ║
║  │  Adaptation System  │  │  Framework       │  │  Language     │ ║
║  │                     │  │                  │  │               │ ║
║  │  • User prefs       │  │  • Variants      │  │  • Detect     │ ║
║  │  • Pattern analysis │  │  • Metrics       │  │  • Translate  │ ║
║  │  • Prompt optimize  │  │  • Auto-rollout  │  │  • 100+ langs │ ║
║  └─────────────────────┘  └──────────────────┘  └───────────────┘ ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝

╔═════════════════════════════════════════════════════════════════════╗
║  LAYER 6: USER EXPERIENCE 🎨                                        ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║  ┌─────────────────────┐  ┌──────────────────┐  ┌───────────────┐ ║
║  │  Goal & Task        │  │  Response        │  │  User Journey │ ║
║  │  Tracking           │  │  Formatting      │  │  Mapper       │ ║
║  │                     │  │                  │  │               │ ║
║  │  • Goal identify    │  │  • Markdown      │  │  • Track path │ ║
║  │  • Progress track   │  │  • Rich media    │  │  • Drop-offs  │ ║
║  │  • Completion       │  │  • Buttons       │  │  • Optimize   │ ║
║  └─────────────────────┘  └──────────────────┘  └───────────────┘ ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝
```

---

## 🤖 **FAM AGENT ARCHITECTURE**

### **14 Agent-Level Components**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FAM (Foundational Agent McCarthy)                │
│                    14 LEAN COMPONENTS                               │
└─────────────────────────────────────────────────────────────────────┘

╔═════════════════════════════════════════════════════════════════════╗
║  CONVERSATION CORE (7 components)                                   ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             ║
║  │ 1. Convo     │  │ 2. Intent    │  │ 3. Response  │             ║
║  │ State Mgr    │  │ Detector     │  │ Router       │             ║
║  └──────────────┘  └──────────────┘  └──────────────┘             ║
║                                                                     ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             ║
║  │ 4. Handler   │  │ 5. Constraint│  │ 6. LLM       │             ║
║  │ Registry     │  │ Validator    │  │ Service      │             ║
║  └──────────────┘  └──────────────┘  └──────────────┘             ║
║                                                                     ║
║  ┌──────────────┐                                                  ║
║  │ 7. Memory    │                                                  ║
║  │ System       │                                                  ║
║  └──────────────┘                                                  ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝

╔═════════════════════════════════════════════════════════════════════╗
║  INTELLIGENCE (4 components)                                        ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             ║
║  │ 8. Sentiment │  │ 9. Personal  │  │ 10. Context  │             ║
║  │ Analyzer ⭐  │  │ Engine ⭐    │  │ Window Mgr ⭐│             ║
║  └──────────────┘  └──────────────┘  └──────────────┘             ║
║                                                                     ║
║  ┌──────────────┐                                                  ║
║  │11. Frustrat  │                                                  ║
║  │ Handler      │                                                  ║
║  └──────────────┘                                                  ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝

╔═════════════════════════════════════════════════════════════════════╗
║  QUALITY (3 components)                                             ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             ║
║  │12. Response  │  │13. Quality   │  │14. RAG       │             ║
║  │ Validator    │  │ Validator    │  │ Infra        │             ║
║  └──────────────┘  └──────────────┘  └──────────────┘             ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝

         │
         │ CALLS DARTMOUTH OS SERVICES
         │
         ▼
    dartmouth.analytics.track()
    dartmouth.cache.get()
    dartmouth.security.scan()
    dartmouth.integrations.crm.sync()
    dartmouth.language.translate()
    etc.
```

---

## 🔄 **AGENT-TO-DARTMOUTH COMMUNICATION**

```
┌──────────────────────────────────────────────────────────────────┐
│                     USER REQUEST                                 │
│                "What size can I print?"                          │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                  DARTMOUTH API GATEWAY                           │
│  • Authentication                                                │
│  • Rate limiting                                                 │
│  • Request routing                                               │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                    FAM AGENT (or specialized)                    │
│                                                                  │
│  1. Check dartmouth.cache.get()           ← Layer 1             │
│     ✓ Hit? Return cached response                               │
│     ✗ Miss? Continue...                                         │
│                                                                  │
│  2. Call dartmouth.security.scan()        ← Layer 2             │
│     ✓ Safe? Continue...                                         │
│     ✗ Unsafe? Return blocked response                           │
│                                                                  │
│  3. Detect intent (internal)              ← Layer 3             │
│                                                                  │
│  4. Generate response (internal + LLM)    ← Layer 4             │
│                                                                  │
│  5. Call dartmouth.cache.set()            ← Layer 5             │
│     (Save for future requests)                                  │
│                                                                  │
│  6. Call dartmouth.analytics.track()      ← Layer 6             │
│     (Track metrics)                                             │
│                                                                  │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                  DARTMOUTH RESPONSE FORMATTER                    │
│  • Apply formatting                                              │
│  • Add buttons/media                                             │
│  • Translate if needed                                           │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                     USER RECEIVES RESPONSE                       │
│        "At 300 DPI, you can print 10cm x 15cm"                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🚀 **REQUEST FLOW**

### **End-to-End Request Processing**

```
USER
  │
  │  HTTP POST /api/v1/agents/fam/chat
  │  { "message": "Hello", "sessionId": "..." }
  │
  ▼
┌─────────────────────────────────────────┐
│  CLOUDFLARE EDGE (Global CDN)           │
│  • DDoS protection                      │
│  • CDN cache check                      │
│  • Route to nearest edge location       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  DARTMOUTH API GATEWAY (Worker)         │
│  ├─ Authenticate request                │
│  ├─ Check rate limits                   │
│  ├─ Validate request                    │
│  └─ Route to agent                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  DARTMOUTH CACHE MANAGER                │
│  ├─ Check CDN cache (FREE, <5ms)        │
│  ├─ Check KV cache (cheap, <10ms)       │
│  └─ Check D1 cache (cheap, <50ms)       │
└──────────────┬──────────────────────────┘
               │
               │ Cache Miss
               ▼
┌─────────────────────────────────────────┐
│  DARTMOUTH SECURITY FILTER              │
│  ├─ Scan for PII                        │
│  ├─ Check toxicity                      │
│  └─ Validate content                    │
└──────────────┬──────────────────────────┘
               │
               │ Safe
               ▼
┌─────────────────────────────────────────┐
│  FAM AGENT (Worker)                     │
│  ├─ Load conversation state (D1)        │
│  ├─ Detect intent                       │
│  ├─ Route to handler                    │
│  ├─ Generate response                   │
│  │   ├─ Check constraints               │
│  │   ├─ Call LLM if needed ($$$)        │
│  │   └─ Validate response               │
│  └─ Save state                          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  DARTMOUTH POST-PROCESSING              │
│  ├─ Cache response (all layers)         │
│  ├─ Track analytics                     │
│  ├─ Record SLA metrics                  │
│  └─ Format response                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  RESPONSE TO USER                       │
│  { "response": "Hello! ...",            │
│    "sessionId": "...",                  │
│    "metadata": {...} }                  │
└─────────────────────────────────────────┘
  │
  ▼
USER RECEIVES RESPONSE
```

**Typical Latency:**
- Cache Hit: **5-50ms** ⚡
- Cache Miss (simple): **200-500ms** ✅
- Cache Miss (complex): **500-2000ms** ⏱️

---

## 💾 **CACHING ARCHITECTURE**

### **4-Layer Cache Strategy**

```
┌────────────────────────────────────────────────────────────────────┐
│                          USER REQUEST                              │
│                     "What is DPI?"                                 │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
                               ▼
╔══════════════════════════════════════════════════════════════════╗
║  LAYER 1: CDN (Cloudflare Cache API)                             ║
║  • Cost: FREE                                                     ║
║  • Latency: <5ms                                                  ║
║  • Hit Rate: 20-30%                                               ║
║  • Storage: Unlimited                                             ║
║  • Best for: Static responses, FAQs                               ║
╚══════════════════════════════╦═══════════════════════════════════╝
                               │ MISS
                               ▼
╔══════════════════════════════════════════════════════════════════╗
║  LAYER 2: KV (Cloudflare Key-Value)                              ║
║  • Cost: $0.50 per GB/month                                       ║
║  • Latency: <10ms                                                 ║
║  • Hit Rate: 30-40%                                               ║
║  • Storage: 1GB free, then paid                                   ║
║  • Best for: LLM responses, user prefs                            ║
╚══════════════════════════════╦═══════════════════════════════════╝
                               │ MISS
                               ▼
╔══════════════════════════════════════════════════════════════════╗
║  LAYER 3: D1 (SQLite Database)                                   ║
║  • Cost: $0 (free tier)                                           ║
║  • Latency: <50ms                                                 ║
║  • Hit Rate: 10-20%                                               ║
║  • Storage: 5GB free                                              ║
║  • Best for: Session state, conversation history                  ║
╚══════════════════════════════╦═══════════════════════════════════╝
                               │ MISS
                               ▼
╔══════════════════════════════════════════════════════════════════╗
║  LAYER 4: LLM (Generate Response)                                ║
║  • Cost: $$$$ (expensive!)                                        ║
║  • Latency: 200-500ms                                             ║
║  • Hit Rate: N/A (fallback only)                                  ║
║  • Only called if all cache layers miss                           ║
╚════════════════════════════════════════════════════════════════════╝
                               │
                               ▼
                    ┌──────────────────────┐
                    │  CACHE RESULT        │
                    │  (all 3 layers)      │
                    └──────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  RETURN TO USER      │
                    └──────────────────────┘

╔══════════════════════════════════════════════════════════════════╗
║  CACHE PERFORMANCE TARGETS                                        ║
╠══════════════════════════════════════════════════════════════════╣
║  Total Hit Rate: 60-90%                                           ║
║  Cost Savings: 60-90% reduction in LLM costs                      ║
║  Avg Response Time: <100ms (with cache hits)                      ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 💰 **COST OPTIMIZATION FLOW**

```
┌────────────────────────────────────────────────────────────────┐
│                    INCOMING REQUEST                            │
└─────────────────────┬──────────────────────────────────────────┘
                      │
                      ▼
             ┌────────────────────┐
             │  Check Budget      │
             │  Still Available?  │
             └────────┬───────────┘
                      │
         ┌────────────┴────────────┐
         │ YES                     │ NO
         ▼                         ▼
┌─────────────────┐       ┌─────────────────────┐
│  Normal Mode    │       │  Cost-Saving Mode   │
│                 │       │                     │
│  • All features │       │  • Cache required   │
│  • Best quality │       │  • Cheaper models   │
│  • No limits    │       │  • Shorter outputs  │
└────────┬────────┘       └──────────┬──────────┘
         │                           │
         │                           │
         └──────────┬────────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  1. Check Cache     │←─────────┐
         │  (Multi-layer)      │          │
         └──────────┬──────────┘          │
                    │                     │
        ┌───────────┴────────────┐        │
        │ HIT                    │ MISS   │
        ▼                        ▼        │
┌──────────────┐      ┌──────────────────────┐
│  Return      │      │  2. Optimize Input   │
│  Cached      │      │  • Normalize message │
│  FREE!       │      │  • Compress context  │
└──────────────┘      │  • Remove redundancy │
                      └──────────┬───────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │  3. Select Model     │
                      │  Simple → gpt-4o-mini│
                      │  Complex → gpt-4     │
                      └──────────┬───────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │  4. Call LLM         │
                      │  • Track tokens      │
                      │  • Track cost        │
                      │  • Enforce limits    │
                      └──────────┬───────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │  5. Cache Result     │──┘
                      │  (All layers)        │
                      └──────────┬───────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │  6. Track Analytics  │
                      │  • Cost per request  │
                      │  • Running total     │
                      │  • Budget remaining  │
                      └──────────┬───────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │  7. Check Budget     │
                      │  Threshold           │
                      └──────────┬───────────┘
                                 │
                   ┌─────────────┴──────────────┐
                   │                            │
                   ▼                            ▼
        ┌──────────────────┐         ┌──────────────────┐
        │  < 90% Budget    │         │  > 90% Budget    │
        │  Continue normal │         │  Enable cost-    │
        │  operations      │         │  saving mode     │
        └──────────────────┘         └──────────────────┘
                   │                            │
                   │                            ▼
                   │                 ┌──────────────────┐
                   │                 │  Alert admin     │
                   │                 └──────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────┐
        │  Return Response to User         │
        └──────────────────────────────────┘
```

---

## 🌍 **DEPLOYMENT ARCHITECTURE**

### **Global Edge Deployment**

```
┌────────────────────────────────────────────────────────────────────┐
│                     CLOUDFLARE GLOBAL NETWORK                      │
│                     300+ Edge Locations Worldwide                  │
└────────────────────────────────────────────────────────────────────┘
                               │
           ┌───────────────────┼────────────────────┐
           │                   │                    │
           ▼                   ▼                    ▼
    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
    │  US-EAST     │    │  EUROPE      │    │  ASIA-PAC    │
    │  (New York)  │    │  (London)    │    │  (Singapore) │
    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
           │                   │                    │
           │   DARTMOUTH OS REPLICATED TO ALL EDGES│
           │                   │                    │
    ┌──────▼───────────────────▼────────────────────▼───────┐
    │                                                        │
    │  ┌──────────────────────────────────────────────┐    │
    │  │  Cloudflare Workers (Compute)                │    │
    │  │  • DARTMOUTH OS                              │    │
    │  │  • API Gateway                               │    │
    │  │  • All Agents (FAM, McCarthy, etc.)          │    │
    │  └──────────────────────────────────────────────┘    │
    │                                                        │
    │  ┌──────────────────────────────────────────────┐    │
    │  │  Cloudflare D1 (Database)                    │    │
    │  │  • Conversations                             │    │
    │  │  • User preferences                          │    │
    │  │  • Analytics                                 │    │
    │  └──────────────────────────────────────────────┘    │
    │                                                        │
    │  ┌──────────────────────────────────────────────┐    │
    │  │  Cloudflare KV (Cache)                       │    │
    │  │  • LLM responses                             │    │
    │  │  • Agent configs                             │    │
    │  │  • User sessions                             │    │
    │  └──────────────────────────────────────────────┘    │
    │                                                        │
    │  ┌──────────────────────────────────────────────┐    │
    │  │  Cloudflare R2 (Storage)                     │    │
    │  │  • Conversation archives                     │    │
    │  │  • RAG documents                             │    │
    │  │  • Backups                                   │    │
    │  └──────────────────────────────────────────────┘    │
    │                                                        │
    │  ┌──────────────────────────────────────────────┐    │
    │  │  Cloudflare Vectorize (Vector DB)            │    │
    │  │  • RAG embeddings                            │    │
    │  │  • Semantic search                           │    │
    │  └──────────────────────────────────────────────┘    │
    │                                                        │
    └────────────────────────────────────────────────────────┘
                               │
                               │ API Calls
                               │
                               ▼
                    ┌──────────────────────┐
                    │  External Services   │
                    ├──────────────────────┤
                    │  • OpenAI (LLM)      │
                    │  • HubSpot (CRM)     │
                    │  • SendGrid (Email)  │
                    └──────────────────────┘
```

---

## 📊 **SUMMARY DIAGRAM**

### **The Complete System**

```
                          🌐 USERS (Worldwide)
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │  CLOUDFLARE EDGE (300+ PoPs) │
                    │  • CDN                       │
                    │  • DDoS Protection           │
                    │  • SSL/TLS                   │
                    └─────────────┬────────────────┘
                                  │
                                  ▼
        ╔═════════════════════════════════════════════════════╗
        ║         DARTMOUTH OS (Operating System)             ║
        ║         THE HEART & BRAIN                           ║
        ╠═════════════════════════════════════════════════════╣
        ║  6 Layers | 18 Services                             ║
        ║  • Monitoring & Health                              ║
        ║  • Performance & Optimization                       ║
        ║  • Security & Compliance                            ║
        ║  • Integration & Communication                      ║
        ║  • Intelligence & Learning                          ║
        ║  • User Experience                                  ║
        ╚═══════════════════════╦═════════════════════════════╝
                                │
            ┌───────────────────┼────────────────────┐
            │                   │                    │
            ▼                   ▼                    ▼
    ┌───────────────┐   ┌───────────────┐   ┌──────────────┐
    │     FAM       │   │   McCarthy    │   │  Lead Scraper│
    │  (14 comps)   │   │   Artwork     │   │   Agent      │
    └───────────────┘   │  (FAM + Art)  │   │ (FAM + Leads)│
                        └───────────────┘   └──────────────┘
            │                   │                    │
            └───────────────────┴────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  EXTERNAL SERVICES    │
                    │  • OpenAI (LLM)       │
                    │  • HubSpot (CRM)      │
                    │  • SendGrid (Email)   │
                    └───────────────────────┘
```

---

## ✅ **KEY ARCHITECTURAL PRINCIPLES**

1. **Separation of Concerns**
   - Dartmouth = Infrastructure & Platform Services
   - Agents = Conversation Logic & Specialized Features

2. **Lean Agents**
   - Only 14 components
   - No infrastructure code
   - Fast and focused

3. **Centralized Intelligence**
   - All analytics in one place
   - Cross-agent learning
   - Unified monitoring

4. **Cost Efficiency**
   - Multi-layer caching
   - Smart resource allocation
   - Budget controls

5. **Global Scale**
   - Edge deployment (300+ locations)
   - Sub-100ms response times
   - Infinite scalability

6. **Security First**
   - PII detection
   - Content filtering
   - Audit logging

---

**These diagrams represent the complete Dartmouth & FAM architecture!** 🎯

