# 🚀 DARTMOUTH OS V2.0 - Tech Stack & Infrastructure
## Ultra-Lean, Cost-Optimized Architecture

**Version:** 2.0.0  
**Date:** November 19, 2024  
**Status:** Active Development  
**Purpose:** Complete tech stack specification for Dartmouth OS V2.0

---

## 📖 TABLE OF CONTENTS

1. [Design Principles](#design-principles)
2. [Cost Targets](#cost-targets)
3. [Tech Stack Overview](#tech-stack-overview)
4. [Compute Layer](#compute-layer)
5. [Database Layer](#database-layer)
6. [Storage Layer](#storage-layer)
7. [Cache Layer](#cache-layer)
8. [Voice & Audio](#voice--audio)
9. [LLM & AI](#llm--ai)
10. [Integrations](#integrations)
11. [Monitoring & Analytics](#monitoring--analytics)
12. [Development Tools](#development-tools)

---

## 🎯 **DESIGN PRINCIPLES**

1. **Zero Waste** - Only pay for what you use
2. **Serverless First** - No idle servers burning money
3. **Edge Computing** - Fast, distributed, cheap
4. **Aggressive Caching** - Minimize expensive operations
5. **Smart Rate Limiting** - Prevent runaway costs
6. **Resource Pooling** - Share infrastructure across agents
7. **Graceful Degradation** - Scale down under low load
8. **Cost Monitoring** - Real-time spend tracking
9. **Voice-First Optimization** - Free native, cheap fallback
10. **Multi-Modal Ready** - Prepared for vision/audio

---

## 💰 **COST TARGETS**

### **MVP (Month 1)**

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

---

## 🏗️ **TECH STACK OVERVIEW**

```
┌─────────────────────────────────────────────────────────────┐
│                    DARTMOUTH OS V2.0                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  COMPUTE:       Cloudflare Workers (serverless)             │
│  DATABASE:      Cloudflare D1 (SQLite at edge)              │
│  STORAGE:       Cloudflare R2 (object storage)              │
│  CACHE:         Cloudflare KV (key-value store)             │
│  VOICE:         Native STT/TTS + F5-TTS + Whisper           │
│  LLM:           OpenAI GPT-4o-mini + Claude 3.5 Sonnet      │
│  INTEGRATIONS:  Twilio, SendGrid, Google Calendar           │
│  MONITORING:    Cloudflare Analytics + Custom Dashboards    │
│  CI/CD:         GitHub Actions + Wrangler                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ **COMPUTE LAYER**

### **Cloudflare Workers** (Primary Compute)

**Why Cloudflare Workers?**
- ✅ Pay per request (no idle costs)
- ✅ Global edge network (300+ cities)
- ✅ 100,000 requests/day FREE
- ✅ $5/month for 10M+ requests
- ✅ Sub-50ms response times
- ✅ No cold starts
- ✅ Built-in DDoS protection
- ✅ TypeScript support

**Cost Structure:**
```
FREE TIER:
- 100,000 requests/day
- 10ms CPU time per request
- 128MB memory per request

PAID ($5/month):
- Unlimited requests
- $0.50 per million requests
- $0.02 per million GB-seconds CPU time
- 30-second timeout
```

**What Runs on Workers:**
- ✅ DARTMOUTH OS Core
- ✅ API Gateway
- ✅ All Agents (FAM, Artwork, PA, CustomerSupport)
- ✅ Voice Gateway
- ✅ Auth Service
- ✅ Request validation
- ✅ Rate limiting

**Resource Limits (enforced for cost control):**
- Max 50ms CPU time per request
- Max 128MB memory per request
- Timeout after 30 seconds (prevents runaway)

**Example Worker:**
```typescript
// packages/worker/src/index.ts

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const dartmouth = new DartmouthOS(env);
    
    // Route to appropriate service
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/api/v2/chat')) {
      return await dartmouth.chat(request);
    }
    
    if (url.pathname.startsWith('/api/v2/voice')) {
      return await dartmouth.voice(request);
    }
    
    return new Response('Not Found', { status: 404 });
  }
};
```

---

## 💾 **DATABASE LAYER**

### **Cloudflare D1** (SQL Database)

**Why D1?**
- ✅ SQLite at the edge (fast)
- ✅ 5GB storage FREE
- ✅ 5 million reads/day FREE
- ✅ 100,000 writes/day FREE
- ✅ Low-latency (edge locations)
- ✅ No connection pooling needed
- ✅ SQL (familiar, powerful)

**Cost Structure:**
```
FREE TIER:
- 5GB storage
- 5 million reads/day
- 100,000 writes/day

PAID:
- $0.50 per million reads
- $1.00 per million writes
- $0.75/GB/month storage
```

**Schema:**
```sql
-- Users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Messages
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Tasks (PA Agent)
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  priority TEXT,
  due_date INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Reminders (PA Agent)
CREATE TABLE reminders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  remind_at INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Notes (PA Agent)
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  tags TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Calendar Events (PA Agent)
CREATE TABLE calendar_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time INTEGER NOT NULL,
  end_time INTEGER NOT NULL,
  location TEXT,
  attendees TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Contacts (PA Agent)
CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Agent Health
CREATE TABLE agent_health (
  agent_id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  last_check INTEGER NOT NULL,
  response_time INTEGER,
  error_count INTEGER,
  success_count INTEGER
);

-- Analytics
CREATE TABLE analytics (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data TEXT,
  created_at INTEGER NOT NULL
);
```

**Usage:**
```typescript
// Query D1
const result = await env.DB.prepare(
  'SELECT * FROM users WHERE email = ?'
).bind(email).first();

// Insert
await env.DB.prepare(
  'INSERT INTO users (id, email, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
).bind(id, email, name, now, now).run();

// Update
await env.DB.prepare(
  'UPDATE users SET name = ?, updated_at = ? WHERE id = ?'
).bind(name, now, id).run();
```

---

## 📦 **STORAGE LAYER**

### **Cloudflare R2** (Object Storage)

**Why R2?**
- ✅ S3-compatible API
- ✅ 10GB storage FREE
- ✅ No egress fees (huge savings)
- ✅ $0.015/GB/month (cheap)
- ✅ Global replication
- ✅ Fast edge access

**Cost Structure:**
```
FREE TIER:
- 10GB storage
- 1 million Class A operations/month (writes)
- 10 million Class B operations/month (reads)

PAID:
- $0.015/GB/month storage
- $4.50 per million Class A operations
- $0.36 per million Class B operations
- $0.00 egress (FREE!)
```

**What's Stored:**
- ✅ TTS audio files
- ✅ User uploads (images, documents)
- ✅ Artwork images (Artwork Analyzer)
- ✅ Voice recordings
- ✅ Backups

**Usage:**
```typescript
// Upload file
await env.R2.put('audio/abc123.mp3', audioBuffer, {
  httpMetadata: {
    contentType: 'audio/mpeg'
  }
});

// Get file
const object = await env.R2.get('audio/abc123.mp3');
const audioBuffer = await object.arrayBuffer();

// Delete file
await env.R2.delete('audio/abc123.mp3');

// List files
const list = await env.R2.list({ prefix: 'audio/' });
```

---

## 🚀 **CACHE LAYER**

### **Cloudflare KV** (Key-Value Store)

**Why KV?**
- ✅ Sub-millisecond reads
- ✅ Global replication
- ✅ 1GB storage FREE
- ✅ 10 million reads/day FREE
- ✅ Perfect for caching
- ✅ Edge-optimized

**Cost Structure:**
```
FREE TIER:
- 1GB storage
- 10 million reads/day
- 1 million writes/day
- 1 million deletes/day

PAID:
- $0.50/GB/month storage
- $0.50 per million reads
- $5.00 per million writes
```

**What's Cached:**
- ✅ LLM responses (90% hit rate)
- ✅ TTS audio (50% hit rate)
- ✅ RAG results
- ✅ User sessions
- ✅ Rate limit counters
- ✅ Agent health status

**Usage:**
```typescript
// Set cache
await env.KV.put('llm:hash123', JSON.stringify(response), {
  expirationTtl: 3600 // 1 hour
});

// Get cache
const cached = await env.KV.get('llm:hash123');
if (cached) {
  return JSON.parse(cached);
}

// Delete cache
await env.KV.delete('llm:hash123');
```

---

## 🎤 **VOICE & AUDIO**

### **Native STT/TTS (iOS/Android)** - PRIMARY

**Cost:** FREE  
**Quality:** Good  
**Latency:** Low (on-device)  
**Use:** 90% of requests

**iOS:**
- `AVSpeechSynthesizer` (TTS)
- `SFSpeechRecognizer` (STT)

**Android:**
- `TextToSpeech` (TTS)
- `SpeechRecognizer` (STT)

---

### **F5-TTS (Self-Hosted)** - BACKUP

**Cost:** $0.01/min  
**Quality:** Excellent  
**Latency:** Medium  
**Use:** 8% of requests

**Deployment:**
- Cloudflare Workers AI
- Or self-hosted GPU server

---

### **OpenAI Whisper** - FALLBACK STT

**Cost:** $0.006/min  
**Quality:** Excellent  
**Latency:** Low  
**Use:** 2% of requests

---

### **ElevenLabs** - PREMIUM TTS

**Cost:** $0.30/min  
**Quality:** Exceptional  
**Latency:** Low  
**Use:** 0.1% of requests (premium users)

---

## 🧠 **LLM & AI**

### **OpenAI GPT-4o-mini** - PRIMARY

**Cost:**
- Input: $0.15/1M tokens
- Output: $0.60/1M tokens
- Cached: $0.075/1M tokens (50% discount)

**Why GPT-4o-mini?**
- ✅ Cheap (10x cheaper than GPT-4)
- ✅ Fast (<1s response)
- ✅ Good quality
- ✅ 128K context window
- ✅ Function calling

**Usage:**
```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
    max_tokens: 500
  })
});
```

---

### **Anthropic Claude 3.5 Sonnet** - FALLBACK

**Cost:**
- Input: $3/1M tokens
- Output: $15/1M tokens

**Why Claude?**
- ✅ Excellent reasoning
- ✅ Long context (200K)
- ✅ Good for complex tasks
- ✅ Fallback when OpenAI down

**Usage:**
```typescript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'claude-3-5-sonnet-20241022',
    messages: [
      { role: 'user', content: userMessage }
    ],
    system: systemPrompt,
    max_tokens: 500
  })
});
```

---

### **Cloudflare Vectorize** - EMBEDDINGS

**Cost:** FREE (beta)  
**Use:** RAG, semantic search

**Usage:**
```typescript
// Generate embeddings
const embeddings = await env.VECTORIZE.insert([
  { id: 'doc1', values: [0.1, 0.2, ...], metadata: { text: 'Hello' } }
]);

// Search
const results = await env.VECTORIZE.query([0.1, 0.2, ...], { topK: 5 });
```

---

## 🔗 **INTEGRATIONS**

### **Twilio** - SMS

**Cost:** $0.0079/message  
**Use:** SMS notifications, 2FA

---

### **SendGrid** - Email

**Cost:** 100/day FREE, then $0.0001/email  
**Use:** Email notifications, newsletters

---

### **Google Calendar API** - Calendar

**Cost:** FREE  
**Use:** PA Agent calendar integration

---

## 📊 **MONITORING & ANALYTICS**

### **Cloudflare Analytics** - FREE

**Features:**
- Request metrics
- Error rates
- Response times
- Geographic distribution

---

### **Custom Dashboards** - Self-Hosted

**Features:**
- Agent health
- Cost tracking
- Usage analytics
- SLA monitoring

---

## 🛠️ **DEVELOPMENT TOOLS**

### **TypeScript** - Language

**Why TypeScript?**
- ✅ Type safety
- ✅ Great IDE support
- ✅ Catch errors early
- ✅ Better refactoring

---

### **Wrangler** - Cloudflare CLI

**Usage:**
```bash
# Deploy
wrangler deploy

# Run locally
wrangler dev

# Tail logs
wrangler tail

# Manage D1
wrangler d1 execute DB --command="SELECT * FROM users"
```

---

### **GitHub Actions** - CI/CD

**Workflow:**
```yaml
name: Deploy

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npx wrangler deploy
```

---

### **Jest** - Testing

**Usage:**
```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

---

## 💰 **COST OPTIMIZATION**

### **1. Aggressive Caching**
- Cache LLM responses (90% hit rate = 90% cost savings)
- Cache TTS audio (50% hit rate = 50% cost savings)
- Cache RAG results

### **2. Native Voice First**
- Use free native STT/TTS (90% of requests)
- Fallback to paid APIs only when needed (10%)

### **3. Prompt Compression**
- Remove unnecessary context
- Use shorter system prompts
- Reduce token usage by 50%

### **4. Smart Rate Limiting**
- Prevent abuse
- Enforce per-user limits
- Alert on unusual usage

### **5. Resource Pooling**
- Share infrastructure across agents
- Reuse connections
- Batch operations

### **6. Graceful Degradation**
- Scale down under low load
- Use cheaper models when possible
- Reduce quality for non-critical tasks

### **7. Real-time Monitoring**
- Alert on cost spikes
- Track per-agent costs
- Identify expensive operations

---

## 📚 **DOCUMENTATION**

- [DARTMOUTH_OS_V2_COMPLETE_SPECIFICATION.md](./DARTMOUTH_OS_V2_COMPLETE_SPECIFICATION.md) - Complete architecture
- [DARTMOUTH_VOICE_SERVICES_SPECIFICATION.md](./DARTMOUTH_VOICE_SERVICES_SPECIFICATION.md) - Voice services
- [DARTMOUTH_API_V2_DOCUMENTATION.md](./DARTMOUTH_API_V2_DOCUMENTATION.md) - API reference
- [DARTMOUTH_OS_MVP_BUILD_PLAN.md](../../DARTMOUTH_OS_MVP_BUILD_PLAN.md) - Build plan

---

**STATUS: READY TO BUILD** 🚀

All tech stack specifications complete. Ready for implementation.

