# McCarthy PA Agent - Dartmouth OS Architecture (V8)

**Document Version:** 8.0  
**Date:** November 19, 2024  
**Status:** Active Development (Migration from Firebase V7)  
**Purpose:** Complete architectural specification for McCarthy PA Agent on Dartmouth OS

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Migration from Firebase (V7 → V8)](#migration-from-firebase-v7--v8)
4. [Voice Architecture](#voice-architecture)
5. [Dartmouth OS Integration](#dartmouth-os-integration)
6. [Technical Stack](#technical-stack)
7. [Data Flow](#data-flow)
8. [Security & Privacy](#security--privacy)
9. [Cost Analysis](#cost-analysis)
10. [Deployment Strategy](#deployment-strategy)
11. [Timeline & Milestones](#timeline--milestones)

---

## 🎯 Executive Summary

### **What is McCarthy PA?**

McCarthy PA is a **voice-first + text AI personal assistant** that helps users manage tasks, schedules, reminders, notes, and daily workflows through natural conversation.

### **Why Migrate to Dartmouth OS?**

| Current (V7 - Firebase) | Future (V8 - Dartmouth OS) |
|-------------------------|----------------------------|
| Firebase Functions (cold starts) | Cloudflare Workers (instant) |
| Firestore (expensive) | Cloudflare D1 + R2 (90% cheaper) |
| Custom auth | Dartmouth Auth Service |
| No analytics | Built-in analytics & monitoring |
| No caching | Multi-layer caching (60% cost savings) |
| Custom voice integration | Native voice services (STT/TTS) |
| **$45-120/month** | **$15-45/month** |

### **Key Benefits:**

✅ **70% cost reduction** ($45-120 → $15-45/month)  
✅ **10x faster response times** (no cold starts)  
✅ **Built-in voice services** (STT, TTS, streaming)  
✅ **Multi-modal intelligence** (voice + text + location + images)  
✅ **Agent-to-agent communication** (PA can call other agents)  
✅ **Unified monitoring & analytics**  
✅ **Automatic scaling** (handles 1 or 1M users)

---

## 🏗️ Architecture Overview

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                  MCCARTHY PA AGENT V8                        │
│                  (React Native App)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Voice Input  │  │ Text Input   │  │ Quick Actions│     │
│  │ (STT)        │  │ (Chat)       │  │ (Buttons)    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                            ▼                                 │
│                 ┌──────────────────────┐                    │
│                 │   Dartmouth Client   │                    │
│                 │   SDK (React Native) │                    │
│                 └──────────┬───────────┘                    │
└────────────────────────────┼────────────────────────────────┘
                             │
                             │ HTTPS/WebSocket
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    DARTMOUTH OS V2.0                         │
│                  (Cloudflare Workers)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 7: Voice & Audio Services                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   STT    │  │   TTS    │  │ Streaming│  │   VAD    │  │
│  │(Deepgram)│  │ (F5-TTS) │  │ (WebRTC) │  │ (Silero) │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                              │
│  Layer 8: Multi-Modal Intelligence                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │  Vision  │  │  Audio   │  │ Context  │                 │
│  │(Qwen2-VL)│  │ Analysis │  │  Fusion  │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
│                                                              │
│  Layer 9: Orchestration & Workflows                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ Agent-to │  │ Workflow │  │  Agent   │                 │
│  │  Agent   │  │  Engine  │  │ Registry │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
│                                                              │
│  Layers 1-6: Core Platform Services                         │
│  (Analytics, Cache, Security, Integrations, etc.)           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
├─────────────────────────────────────────────────────────────┤
│  Cloudflare D1 (SQLite)    │  Cloudflare R2 (S3)           │
│  - User profiles            │  - Voice recordings           │
│  - Tasks & reminders        │  - Attachments                │
│  - Conversation history     │  - Backups                    │
│  - Settings                 │  - Logs                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Fresh Build on Dartmouth OS

### **Building from Scratch (V8)**

McCarthy PA Agent V8 is being built **fresh from the ground up** on Dartmouth OS. This is NOT a migration - it's a new build.

**Current Status:**
- ✅ Week 1: React Native app foundation complete
- 🚧 Week 2: Starting backend development on Dartmouth OS
- 📅 Week 3-4: Core features + voice integration
- 📅 Week 5-6: Testing & refinement
- 📅 Week 7-8: Production rollout

### **Technology Stack**

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React Native | iOS + Android app |
| **Backend** | Dartmouth OS (Cloudflare Workers) | Platform services |
| **Database** | Cloudflare D1 (SQLite) | User data storage |
| **Storage** | Cloudflare R2 (S3) | File storage |
| **Auth** | Dartmouth Auth Service | User authentication |
| **Voice** | Dartmouth Voice Services | STT/TTS/streaming |
| **LLM** | OpenAI GPT-4o-mini | Conversational AI |
| **Cost** | $15-45/month | Estimated |

### **Development Phases**

#### **Phase 1: Dartmouth OS Foundation (Week 2)**
- Build core Dartmouth OS services
- API Gateway, Agent Registry, Health Monitoring
- Auth Service (JWT tokens)
- Voice Services (STT/TTS/streaming/VAD)
- Database Service (D1 wrapper)

#### **Phase 2: PA Agent Backend (Week 3-4)**
- Build PA Agent on FAM foundation
- TaskHandler, ReminderHandler, NoteHandler
- CalendarHandler, ContactHandler
- Voice integration
- React Native integration

#### **Phase 3: Testing & Refinement (Week 5-6)**
- Internal testing
- Bug fixes
- Performance optimization
- UI/UX polish

#### **Phase 4: Production Rollout (Week 7-8)**
- Beta testing (10% of users)
- Monitor performance
- Gradual rollout (50% → 100%)
- Full production

---

## 🎤 Voice Architecture

### **Voice Flow**

```
┌─────────────────────────────────────────────────────────────┐
│  USER SPEAKS                                                 │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  1. VOICE ACTIVITY DETECTION (VAD)                          │
│     - Silero VAD detects speech                             │
│     - Filters out background noise                          │
│     - Detects speech start/end                              │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  2. SPEECH-TO-TEXT (STT)                                    │
│     - Deepgram (primary, real-time streaming)               │
│     - OpenAI Whisper (fallback)                             │
│     - Native (offline mode)                                 │
│     → Transcription: "Remind me to call John at 3pm"       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  3. AUDIO ANALYSIS (Emotion Detection)                      │
│     - Analyze tone, pitch, energy                           │
│     - Detect emotion (happy, frustrated, urgent)            │
│     - Feed into context                                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  4. INTENT DETECTION & ROUTING                              │
│     - Intent: "create_reminder"                             │
│     - Entities: {contact: "John", time: "3pm"}             │
│     - Route to TaskHandler                                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  5. HANDLER EXECUTION                                       │
│     - TaskHandler creates reminder                          │
│     - Stores in D1 database                                 │
│     - Generates response                                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  6. TEXT-TO-SPEECH (TTS)                                    │
│     - F5-TTS (primary, self-hosted, high quality)           │
│     - OpenAI TTS (fallback)                                 │
│     - Native (offline mode)                                 │
│     → Audio: "Got it! I'll remind you to call John at 3pm" │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  7. AUDIO STREAMING                                         │
│     - Stream audio back to app                              │
│     - WebRTC for real-time                                  │
│     - Handle interrupts (user can interrupt mid-response)   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  USER HEARS RESPONSE                                        │
└─────────────────────────────────────────────────────────────┘
```

### **Voice Providers**

#### **Speech-to-Text (STT)**

| Provider | Use Case | Cost | Latency |
|----------|----------|------|---------|
| **Deepgram** | Primary (real-time streaming) | $0.0043/min | 300ms |
| **OpenAI Whisper** | Fallback (batch) | $0.006/min | 1-2s |
| **Native (iOS/Android)** | Offline mode | Free | 500ms |

**Recommendation:** Deepgram for production (best quality + speed)

#### **Text-to-Speech (TTS)**

| Provider | Use Case | Cost | Quality |
|----------|----------|------|---------|
| **F5-TTS** | Primary (self-hosted) | $0.001/min | ⭐⭐⭐⭐⭐ |
| **OpenAI TTS** | Fallback | $0.015/min | ⭐⭐⭐⭐ |
| **Native (iOS/Android)** | Offline mode | Free | ⭐⭐⭐ |

**Recommendation:** F5-TTS for production (highest quality + lowest cost)

### **F5-TTS Integration**

**Why F5-TTS?**
- ✅ **Open-source** (no vendor lock-in)
- ✅ **Self-hostable** (control costs)
- ✅ **High quality** (natural, emotional voice)
- ✅ **Fast** (real-time streaming)
- ✅ **Cost-effective** ($0.001/min vs $0.015/min for OpenAI)

**Deployment Options:**

1. **Cloudflare Workers AI** (easiest, managed)
   - Deploy F5-TTS model to Workers AI
   - Pay-per-use pricing
   - Auto-scaling

2. **Self-Hosted (Hetzner/AWS)** (cheapest for high volume)
   - GPU instance: $50-100/month
   - Unlimited TTS generations
   - Full control

3. **Hybrid** (recommended for MVP)
   - Start with Cloudflare Workers AI
   - Move to self-hosted when volume justifies it

**See:** [MCCARTHY_PA_VOICE_IMPLEMENTATION.md](MCCARTHY_PA_VOICE_IMPLEMENTATION.md) for full implementation details.

---

## 🔗 Dartmouth OS Integration

### **Services Used by McCarthy PA**

McCarthy PA leverages **15 of 33 Dartmouth OS services:**

#### **Layer 1: Monitoring & Health**
- ✅ **Health Monitoring** - Track PA agent uptime & performance
- ✅ **SLA Tracking** - Ensure <500ms response times
- ✅ **Analytics Engine** - User behavior, feature usage

#### **Layer 2: Performance & Optimization**
- ✅ **Caching Service** - Cache frequent queries (60% hit rate)
- ✅ **Rate Limiting** - Prevent abuse
- ✅ **Context Window Manager** - Optimize conversation history

#### **Layer 3: Security & Compliance**
- ✅ **Authentication Service** - User login, JWT tokens
- ✅ **Authorization Service** - Role-based access
- ✅ **Data Privacy** - GDPR compliance, data encryption

#### **Layer 4: Integration & Communication**
- ✅ **Webhook System** - Integrate with calendar, email, etc.
- ✅ **Event Bus** - Real-time notifications

#### **Layer 5: Intelligence & Learning**
- ✅ **Sentiment Analyzer** - Detect user emotion
- ✅ **Personality Engine** - Consistent PA personality

#### **Layer 7: Voice & Audio Services**
- ✅ **STT Service** - Speech-to-text
- ✅ **TTS Service** - Text-to-speech
- ✅ **Audio Streaming** - Real-time voice
- ✅ **VAD Service** - Voice activity detection
- ✅ **Interrupt Handling** - User can interrupt PA
- ✅ **Audio Processing** - Noise reduction, emotion detection

#### **Layer 8: Multi-Modal Intelligence**
- ✅ **Vision-Language Models** - Analyze images (e.g., "What's in this photo?")
- ✅ **Audio-Text Context** - Combine voice emotion + text intent
- ✅ **Multi-Modal Context Manager** - Fuse voice + text + location + images

#### **Layer 9: Orchestration & Workflows**
- ✅ **Agent-to-Agent Communication** - PA can call other agents (e.g., "Ask Artwork Analyzer about this image")
- ✅ **Workflow Engine** - Multi-step tasks (e.g., "Book flight, add to calendar, set reminder")

### **API Endpoints**

McCarthy PA uses these Dartmouth OS endpoints:

```
POST   /api/v2/agents/mccarthy-pa/chat          # Text chat
POST   /api/v2/agents/mccarthy-pa/voice         # Voice input
GET    /api/v2/agents/mccarthy-pa/tasks         # Get tasks
POST   /api/v2/agents/mccarthy-pa/tasks         # Create task
PUT    /api/v2/agents/mccarthy-pa/tasks/:id     # Update task
DELETE /api/v2/agents/mccarthy-pa/tasks/:id     # Delete task
GET    /api/v2/agents/mccarthy-pa/reminders     # Get reminders
POST   /api/v2/agents/mccarthy-pa/reminders     # Create reminder
GET    /api/v2/agents/mccarthy-pa/notes         # Get notes
POST   /api/v2/agents/mccarthy-pa/notes         # Create note
GET    /api/v2/agents/mccarthy-pa/calendar      # Get calendar events
POST   /api/v2/agents/mccarthy-pa/calendar      # Create event
GET    /api/v2/agents/mccarthy-pa/contacts      # Get contacts
POST   /api/v2/agents/mccarthy-pa/contacts      # Create contact
GET    /api/v2/agents/mccarthy-pa/settings      # Get settings
PUT    /api/v2/agents/mccarthy-pa/settings      # Update settings
POST   /api/v2/auth/login                       # User login
POST   /api/v2/auth/register                    # User registration
POST   /api/v2/auth/refresh                     # Refresh token
```

**See:** [MCCARTHY_PA_API_REFERENCE.md](MCCARTHY_PA_API_REFERENCE.md) for full API documentation.

---

## 🛠️ Technical Stack

### **Frontend (React Native)**

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | React Native 0.72+ | Cross-platform (iOS + Android) |
| **UI Library** | React Native Paper | Material Design components |
| **Navigation** | React Navigation 6 | Screen routing |
| **State Management** | Zustand | Global state |
| **Voice Input** | react-native-voice | STT integration |
| **Voice Output** | react-native-tts | TTS integration |
| **Audio Streaming** | react-native-webrtc | Real-time voice |
| **Notifications** | react-native-push-notification | Reminders |
| **Storage** | AsyncStorage | Local cache |
| **HTTP Client** | Axios | API calls |
| **WebSocket** | Socket.io-client | Real-time updates |

### **Backend (Dartmouth OS)**

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Runtime** | Cloudflare Workers | Serverless compute |
| **Database** | Cloudflare D1 (SQLite) | Relational data |
| **Storage** | Cloudflare R2 (S3) | File storage |
| **Cache** | Cloudflare KV | Key-value cache |
| **Queue** | Cloudflare Queues | Background jobs |
| **Analytics** | Cloudflare Analytics | Usage metrics |
| **Voice (STT)** | Deepgram | Speech-to-text |
| **Voice (TTS)** | F5-TTS | Text-to-speech |
| **LLM** | OpenAI GPT-4o-mini | Conversational AI |
| **Vision** | Qwen2-VL | Image analysis |

### **Development Tools**

| Tool | Purpose |
|------|---------|
| **TypeScript** | Type safety |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Jest** | Unit testing |
| **Detox** | E2E testing (React Native) |
| **Wrangler** | Cloudflare CLI |
| **GitHub Actions** | CI/CD |

---

## 🔄 Data Flow

### **Example: "Remind me to call John at 3pm"**

```
1. USER SPEAKS
   └─> "Remind me to call John at 3pm"

2. REACT NATIVE APP
   └─> react-native-voice captures audio
   └─> Send audio to Dartmouth OS

3. DARTMOUTH OS - VOICE SERVICES
   └─> VAD detects speech
   └─> STT (Deepgram) transcribes: "Remind me to call John at 3pm"
   └─> Audio Analysis detects tone: "neutral"

4. DARTMOUTH OS - MCCARTHY PA AGENT
   └─> Intent Detection: "create_reminder"
   └─> Entity Extraction: {contact: "John", time: "15:00"}
   └─> TaskHandler.createReminder()
   └─> Store in D1: reminders table
   └─> Generate response: "Got it! I'll remind you to call John at 3pm"

5. DARTMOUTH OS - VOICE SERVICES
   └─> TTS (F5-TTS) generates audio
   └─> Stream audio back to app

6. REACT NATIVE APP
   └─> react-native-tts plays audio
   └─> Show notification: "Reminder set for 3pm"

7. USER HEARS
   └─> "Got it! I'll remind you to call John at 3pm"
```

### **Database Schema (Cloudflare D1)**

```sql
-- Users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Tasks
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL, -- 'pending', 'completed', 'cancelled'
  priority TEXT, -- 'low', 'medium', 'high'
  due_date INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Reminders
CREATE TABLE reminders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  remind_at INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'sent', 'dismissed'
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Notes
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  tags TEXT, -- JSON array
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Calendar Events
CREATE TABLE calendar_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time INTEGER NOT NULL,
  end_time INTEGER NOT NULL,
  location TEXT,
  attendees TEXT, -- JSON array
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Contacts
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

-- Conversation History
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  role TEXT NOT NULL, -- 'user', 'assistant'
  intent TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Settings
CREATE TABLE settings (
  user_id TEXT PRIMARY KEY,
  voice_enabled INTEGER DEFAULT 1,
  voice_provider TEXT DEFAULT 'deepgram',
  tts_provider TEXT DEFAULT 'f5-tts',
  language TEXT DEFAULT 'en-US',
  timezone TEXT DEFAULT 'UTC',
  notifications_enabled INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🔒 Security & Privacy

### **Authentication**

- **JWT Tokens** (issued by Dartmouth Auth Service)
- **Refresh Tokens** (7-day expiry)
- **Device Fingerprinting** (detect suspicious logins)

### **Data Encryption**

- **In Transit:** TLS 1.3 (all API calls)
- **At Rest:** AES-256 (D1 database, R2 storage)
- **Voice Recordings:** Encrypted, auto-deleted after 30 days

### **Privacy**

- **GDPR Compliant** (data export, deletion)
- **No Third-Party Sharing** (all data stays in Dartmouth OS)
- **User Control** (users can delete all data anytime)

### **Rate Limiting**

- **100 requests/minute per user** (prevent abuse)
- **1000 voice minutes/month per user** (prevent cost overruns)

---

## 💰 Cost Analysis

### **V7 (Firebase) Costs**

| Service | Monthly Cost |
|---------|--------------|
| Firebase Functions | $15-30 |
| Firestore | $20-50 |
| Firebase Storage | $5-15 |
| Firebase Auth | $0 (free tier) |
| Custom Voice Integration | $5-25 |
| **Total** | **$45-120/month** |

### **V8 (Dartmouth OS) Costs**

| Service | Monthly Cost |
|---------|--------------|
| Cloudflare Workers | $5 (5M requests) |
| Cloudflare D1 | $0.75 (5M reads) |
| Cloudflare R2 | $0.50 (10GB) |
| Cloudflare KV | $0.50 (1M reads) |
| Deepgram (STT) | $4.30 (1000 mins) |
| F5-TTS (self-hosted) | $1.00 (1000 mins) |
| OpenAI (LLM) | $3-10 (GPT-4o-mini) |
| **Total** | **$15-45/month** |

### **Savings**

- **Monthly:** $30-75 saved (67% reduction)
- **Annual:** $360-900 saved
- **3-Year:** $1,080-2,700 saved

---

## 🚀 Deployment Strategy

### **Environments**

1. **Development** (`dev.dartmouth-os.com`)
   - Local testing
   - Cloudflare Workers dev environment
   - Test database

2. **Staging** (`staging.dartmouth-os.com`)
   - Pre-production testing
   - Real Cloudflare infrastructure
   - Separate database

3. **Production** (`api.dartmouth-os.com`)
   - Live users
   - Full monitoring
   - Production database

### **CI/CD Pipeline**

```
┌─────────────────────────────────────────────────────────────┐
│  1. DEVELOPER PUSHES CODE                                   │
│     └─> git push origin main                                │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  2. GITHUB ACTIONS TRIGGERED                                │
│     └─> Run tests (Jest, Detox)                            │
│     └─> Run linting (ESLint, TypeScript)                   │
│     └─> Build React Native app                             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  3. DEPLOY TO STAGING                                       │
│     └─> wrangler deploy --env staging                      │
│     └─> Run E2E tests                                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  4. MANUAL APPROVAL (for production)                        │
│     └─> Review staging results                             │
│     └─> Approve deployment                                 │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  5. DEPLOY TO PRODUCTION                                    │
│     └─> wrangler deploy --env production                   │
│     └─> Health check                                        │
│     └─> Notify team (Slack)                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📅 Timeline & Milestones

### **Week 2 (Current - Nov 18-24)**
- ✅ Architecture review & planning
- ✅ Documentation (this document)
- 🚧 Set up Dartmouth OS V2.0 environment
- 🚧 Create McCarthy PA agent skeleton

### **Week 3 (Nov 25 - Dec 1)**
- 🎯 Implement core features (tasks, reminders, notes)
- 🎯 Integrate Dartmouth Auth Service
- 🎯 Set up D1 database schema
- 🎯 Basic voice integration (STT/TTS)

### **Week 4 (Dec 2-8)**
- 🎯 Advanced voice features (streaming, interrupts)
- 🎯 Multi-modal intelligence (image analysis)
- 🎯 Agent-to-agent communication
- 🎯 Data migration from Firebase

### **Week 5 (Dec 9-15)**
- 🎯 Internal testing (10% rollout)
- 🎯 Bug fixes & optimization
- 🎯 Performance tuning

### **Week 6 (Dec 16-22)**
- 🎯 Gradual rollout (50% → 100%)
- 🎯 Monitor performance & costs
- 🎯 User feedback & iteration

### **Week 7 (Dec 23-29)**
- 🎯 Full production (100% users on V8)
- 🎯 Decommission Firebase V7
- 🎯 Post-launch monitoring

---

## 📚 Related Documentation

- **[Developer Migration Guide](MCCARTHY_PA_DEVELOPER_GUIDE.md)** - Step-by-step migration instructions
- **[Voice Implementation Guide](MCCARTHY_PA_VOICE_IMPLEMENTATION.md)** - STT/TTS integration details
- **[API Reference](MCCARTHY_PA_API_REFERENCE.md)** - Complete API documentation
- **[Dartmouth OS V2.0 Spec](../../dartmouth-os/v2/DARTMOUTH_OS_V2_COMPLETE_SPECIFICATION.md)** - Full platform documentation
- **[Voice Services Spec](../../dartmouth-os/v2/DARTMOUTH_VOICE_SERVICES_SPECIFICATION.md)** - Voice architecture details

---

## 🤝 Support

For questions or issues:
- **Developer Meeting:** Today (Nov 19, 2024)
- **Documentation:** This folder (`docs/agents/mccarthy-pa/v8/`)
- **Slack:** #mccarthy-pa-development

---

**McCarthy PA V8 - Voice-first AI assistant, powered by Dartmouth OS.** 🎤🚀

