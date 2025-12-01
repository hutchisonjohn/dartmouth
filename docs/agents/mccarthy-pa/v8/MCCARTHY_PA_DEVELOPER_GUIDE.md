# McCarthy PA Agent - Developer Build Guide (V8)

**Document Version:** 1.0  
**Date:** November 19, 2024  
**Audience:** McCarthy PA Developer  
**Purpose:** Step-by-step guide to build PA Agent on Dartmouth OS (fresh build)

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Migration Roadmap](#migration-roadmap)
5. [Code Migration](#code-migration)
6. [Data Migration](#data-migration)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### **What You Need to Know**

1. **Week 1 Complete** - React Native foundation built (Firebase config, screens, navigation)
2. **Week 2 Starting** - Build backend on Dartmouth OS
3. **Fresh Build** - No migration, building from scratch
4. **Voice-First** - Dartmouth Voice Services (STT/TTS/streaming)
5. **Timeline: 7-8 weeks** - Backend build, integration, testing, production

### **What's Built (Week 1)**

| Component | Status | Details |
|-----------|--------|---------|
| **React Native App** | ✅ Complete | Foundation, navigation, Firebase config |
| **UI Screens** | ✅ Stubs | 8 screens created (need implementation) |
| **Firebase Config** | ✅ Complete | Auth, Firestore, Storage initialized |
| **State Management** | ✅ Complete | React Context API configured |
| **Navigation** | ✅ Complete | React Navigation configured |
| **Backend** | ❌ Not Started | Needs to be built on Dartmouth OS |
| **Voice** | ❌ Not Started | Needs Dartmouth Voice Services |
| **Handlers** | ❌ Not Started | Tasks, reminders, notes, calendar, contacts |

---

## ✅ Prerequisites

### **Required Tools**

```bash
# Node.js & npm
node --version  # v18+ required
npm --version   # v9+ required

# Cloudflare CLI (Wrangler)
npm install -g wrangler
wrangler --version

# Git
git --version

# React Native CLI
npm install -g react-native-cli

# TypeScript
npm install -g typescript
```

### **Required Accounts**

1. **Cloudflare Account** (provided by project owner)
   - Workers access
   - D1 database access
   - R2 storage access
   - KV namespace access

2. **GitHub Access** (provided by project owner)
   - `dartmouth-os` repository
   - `mccarthy-pa` package

3. **API Keys** (provided by project owner)
   - OpenAI API key (for LLM)
   - Deepgram API key (for STT)
   - F5-TTS endpoint (for TTS)

### **Required Knowledge**

- ✅ TypeScript
- ✅ React Native
- ✅ REST APIs
- ⚠️ SQL (if new to you, see [SQL Primer](#sql-primer))
- ⚠️ Cloudflare Workers (if new to you, see [Workers Primer](#workers-primer))

---

## 🛠️ Environment Setup

### **Step 1: Clone Repository**

```bash
# Clone the dartmouth-os repository
git clone https://github.com/[org]/dartmouth-os.git
cd dartmouth-os

# Install dependencies
npm install

# Install React Native dependencies (if working on mobile app)
cd packages/mccarthy-pa
npm install
cd ios && pod install && cd ..  # iOS only
```

### **Step 2: Configure Environment**

Create `.dev.vars` file in project root:

```bash
# .dev.vars (for local development)
OPENAI_API_KEY=sk-...
DEEPGRAM_API_KEY=...
F5_TTS_ENDPOINT=https://...
JWT_SECRET=your-secret-key
ENVIRONMENT=development
```

Create `wrangler.toml` for Cloudflare configuration:

```toml
name = "mccarthy-pa-agent"
main = "packages/worker/src/index.ts"
compatibility_date = "2024-01-01"

[env.development]
name = "mccarthy-pa-dev"
vars = { ENVIRONMENT = "development" }

[[env.development.d1_databases]]
binding = "DB"
database_name = "mccarthy-pa-dev"
database_id = "..."

[[env.development.r2_buckets]]
binding = "STORAGE"
bucket_name = "mccarthy-pa-dev"

[[env.development.kv_namespaces]]
binding = "CACHE"
id = "..."

[env.production]
name = "mccarthy-pa"
vars = { ENVIRONMENT = "production" }

[[env.production.d1_databases]]
binding = "DB"
database_name = "mccarthy-pa"
database_id = "..."

[[env.production.r2_buckets]]
binding = "STORAGE"
bucket_name = "mccarthy-pa"

[[env.production.kv_namespaces]]
binding = "CACHE"
id = "..."
```

### **Step 3: Set Up Database**

```bash
# Create D1 database
wrangler d1 create mccarthy-pa-dev

# Run migrations
wrangler d1 execute mccarthy-pa-dev --file=./packages/worker/migrations/001_initial_schema.sql

# Verify
wrangler d1 execute mccarthy-pa-dev --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### **Step 4: Test Local Development**

```bash
# Start Cloudflare Workers dev server
npm run dev

# In another terminal, start React Native
cd packages/mccarthy-pa
npm run ios  # or npm run android
```

---

## 🗺️ Development Roadmap

### **Week 2: Dartmouth OS Core + Voice**

**Goal:** Build Dartmouth OS services for PA Agent

#### **Dartmouth OS Tasks (You + AI)**

1. ✅ Build API Gateway (routing)
2. ✅ Build Agent Registry
3. ✅ Build Auth Service (JWT tokens)
4. ✅ Build Voice Services (STT/TTS/streaming/VAD)
5. ✅ Build Database Service (D1 wrapper)
6. ✅ Build Health Monitoring
7. ✅ Deploy to Cloudflare

#### **PA Agent Tasks (Your Developer)**

1. ✅ Implement UI screens (tasks, reminders, notes, calendar, contacts)
2. ✅ Use mock data for now
3. ✅ Prepare for Dartmouth integration
4. ⏸️ Wait for Dartmouth services (auth, voice, database)

#### **Testing Tasks**

1. ✅ Unit tests for handlers
2. ✅ Integration tests for API endpoints
3. ✅ E2E tests for critical flows
4. ✅ Performance testing (latency, throughput)

### **Week 3-4: PA Agent Backend**

**Goal:** Build PA Agent handlers on Dartmouth OS

1. ✅ Build TaskHandler (CRUD for tasks)
2. ✅ Build ReminderHandler (CRUD + scheduling)
3. ✅ Build NoteHandler (CRUD + search)
4. ✅ Build CalendarHandler (CRUD + integration)
5. ✅ Build ContactHandler (CRUD)
6. ✅ Integrate Voice Services
7. ✅ Connect React Native app to Dartmouth

### **Week 5-6: Testing & Refinement**

**Goal:** Full testing and bug fixes

1. ✅ Internal testing (voice + text)
2. ✅ Bug fixes
3. ✅ Performance optimization
4. ✅ UI/UX polish

### **Week 7-8: Production Rollout**

**Goal:** Launch to production

1. ✅ Beta testing (10% of users)
2. ✅ Monitor performance
3. ✅ Gradual rollout (50% → 100%)
4. ✅ Full production

---

## 💻 Code Examples

### **1. API Client (Frontend)**

#### **Current (Week 1 - Firebase Stubs)**

```typescript
// Week 1: Firebase configured but not used for backend yet
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// These are stubs - backend not built yet
```

#### **Week 3 (Dartmouth OS)**

```typescript
// V8: DartmouthClient.ts
import axios from 'axios';

const API_BASE_URL = 'https://api.dartmouth-os.com/api/v2';

// Login
export async function login(email: string, password: string) {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password,
  });
  return response.data; // { accessToken, refreshToken, user }
}

// Create task
export async function createTask(task: Task, accessToken: string) {
  const response = await axios.post(
    `${API_BASE_URL}/agents/mccarthy-pa/tasks`,
    task,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return response.data; // { id, ...task }
}
```

### **2. Authentication (Frontend)**

#### **Current (Week 1 - React Context)**

```typescript
// Week 1: AppContext with Firebase Auth (to be replaced)
import { AppContext } from './context/AppContext';

export function useAuth() {
  const { user, setUser } = useContext(AppContext);
  // Currently using Firebase Auth
  // Will switch to Dartmouth Auth in Week 3
  return { user };
}
```

#### **Week 3 (Dartmouth Auth)**

```typescript
// V8: useAuth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DartmouthClient } from './DartmouthClient';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    // Load token from storage
    AsyncStorage.getItem('accessToken').then((token) => {
      if (token) {
        setAccessToken(token);
        // Verify token & get user
        DartmouthClient.getUser(token).then(setUser);
      }
    });
  }, []);

  const login = async (email: string, password: string) => {
    const { accessToken, refreshToken, user } = await DartmouthClient.login(email, password);
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    setAccessToken(accessToken);
    setUser(user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    setAccessToken(null);
    setUser(null);
  };

  return { user, accessToken, login, logout };
}
```

### **3. Voice Integration (Frontend)**

#### **Current (Week 1 - Not Implemented)**

```typescript
// Week 1: Voice not implemented yet
// Expo AV configured for microphone access
// Will implement in Week 3 with Dartmouth Voice Services
```

#### **Week 3 (Dartmouth Voice Services)**

```typescript
// V8: VoiceService.ts
import { DartmouthVoiceClient } from './DartmouthVoiceClient';

export class VoiceService {
  private voiceClient: DartmouthVoiceClient;

  constructor(accessToken: string) {
    this.voiceClient = new DartmouthVoiceClient(accessToken);
  }

  async startListening() {
    // Start streaming audio to Dartmouth
    await this.voiceClient.startVoiceStream({
      onTranscript: (transcript) => {
        console.log('Transcript:', transcript);
      },
      onResponse: (audioChunk) => {
        // Play audio response
        this.playAudio(audioChunk);
      },
      onError: (error) => {
        console.error('Voice error:', error);
      },
    });
  }

  async speak(text: string) {
    // Use Dartmouth TTS
    const audioUrl = await this.voiceClient.textToSpeech(text);
    await this.playAudio(audioUrl);
  }
}
```

### **4. Backend Handlers**

#### **Current (Week 1 - Firebase Functions Stubs)**

```typescript
// Week 1: Firebase Functions created but not deployed
// functions/src/llm/processMessage.js - Stub
// functions/src/tasks/reminders.js - Stub
// functions/src/location/geofencing.js - Stub
// functions/src/notifications/notifications.js - Stub

// These will be replaced with Dartmouth OS handlers in Week 3
```

#### **Week 3 (Dartmouth OS Handlers)**

```typescript
// V8: packages/worker/src/handlers/TaskHandler.ts
import { BaseHandler } from '@dartmouth/core';

export class TaskHandler extends BaseHandler {
  async createTask(request: Request, env: Env): Promise<Response> {
    // Verify JWT token
    const user = await this.verifyAuth(request, env);
    if (!user) {
      return this.unauthorized();
    }

    // Parse request body
    const task = await request.json();

    // Insert into D1
    const result = await env.DB.prepare(
      'INSERT INTO tasks (id, user_id, title, description, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(
        this.generateId(),
        user.id,
        task.title,
        task.description,
        'pending',
        Date.now(),
        Date.now()
      )
      .run();

    return this.json({ id: result.meta.last_row_id });
  }
}
```

### **5. Database Queries**

#### **Current (Week 1 - Firestore Configured)**

```typescript
// Week 1: Firestore initialized but not used yet
// Data models created (User, Group, Message, Task, ShoppingList)
// Will switch to Cloudflare D1 in Week 3
```

#### **Week 3 (D1 / SQL)**

```typescript
// V8: Get user tasks
const result = await env.DB.prepare(
  'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC'
)
  .bind(userId)
  .all();

const tasks = result.results;
```

---

## 🗄️ Database Setup (Fresh Start)

### **Week 3: Create D1 Database Schema**

**NO DATA MIGRATION NEEDED** - This is a fresh build, no existing data.

```sql
-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Create tasks table
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

-- Create reminders table
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

-- Create notes table
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

-- Create calendar_events table
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

-- Create contacts table
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
```

Run:

```bash
# Create database
wrangler d1 create mccarthy-pa-dev

# Run schema
wrangler d1 execute mccarthy-pa-dev --file=./schema.sql
```

---

## 🧪 Testing

### **Unit Tests**

```typescript
// packages/worker/src/handlers/__tests__/TaskHandler.test.ts
import { TaskHandler } from '../TaskHandler';
import { mockEnv, mockRequest } from '../../test-utils';

describe('TaskHandler', () => {
  let handler: TaskHandler;
  let env: Env;

  beforeEach(() => {
    handler = new TaskHandler();
    env = mockEnv();
  });

  test('createTask - success', async () => {
    const request = mockRequest({
      method: 'POST',
      body: { title: 'Test task', description: 'Test description' },
      headers: { Authorization: 'Bearer valid-token' },
    });

    const response = await handler.createTask(request, env);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.id).toBeDefined();
  });

  test('createTask - unauthorized', async () => {
    const request = mockRequest({
      method: 'POST',
      body: { title: 'Test task' },
      headers: {}, // No auth header
    });

    const response = await handler.createTask(request, env);
    expect(response.status).toBe(401);
  });
});
```

Run:

```bash
npm run test
```

### **Integration Tests**

```typescript
// packages/worker/src/__tests__/integration/tasks.test.ts
import { testClient } from '../../test-utils';

describe('Tasks API', () => {
  let accessToken: string;

  beforeAll(async () => {
    // Login to get token
    const response = await testClient.post('/api/v2/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });
    accessToken = response.data.accessToken;
  });

  test('Create, read, update, delete task', async () => {
    // Create
    const createResponse = await testClient.post(
      '/api/v2/agents/mccarthy-pa/tasks',
      { title: 'Test task', description: 'Test description' },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    expect(createResponse.status).toBe(200);
    const taskId = createResponse.data.id;

    // Read
    const readResponse = await testClient.get(
      `/api/v2/agents/mccarthy-pa/tasks/${taskId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    expect(readResponse.status).toBe(200);
    expect(readResponse.data.title).toBe('Test task');

    // Update
    const updateResponse = await testClient.put(
      `/api/v2/agents/mccarthy-pa/tasks/${taskId}`,
      { status: 'completed' },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    expect(updateResponse.status).toBe(200);

    // Delete
    const deleteResponse = await testClient.delete(
      `/api/v2/agents/mccarthy-pa/tasks/${taskId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    expect(deleteResponse.status).toBe(200);
  });
});
```

Run:

```bash
npm run test:integration
```

### **E2E Tests (React Native)**

```typescript
// packages/mccarthy-pa/e2e/tasks.e2e.ts
import { device, element, by, expect as detoxExpect } from 'detox';

describe('Tasks', () => {
  beforeAll(async () => {
    await device.launchApp();
    // Login
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await detoxExpect(element(by.id('home-screen'))).toBeVisible();
  });

  test('Create task', async () => {
    await element(by.id('add-task-button')).tap();
    await element(by.id('task-title-input')).typeText('Test task');
    await element(by.id('task-description-input')).typeText('Test description');
    await element(by.id('save-task-button')).tap();
    await detoxExpect(element(by.text('Test task'))).toBeVisible();
  });
});
```

Run:

```bash
npm run test:e2e:ios
npm run test:e2e:android
```

---

## 🚀 Deployment

### **Development Deployment**

```bash
# Deploy to development environment
wrangler deploy --env development

# Test
curl https://mccarthy-pa-dev.dartmouth-os.workers.dev/health
```

### **Staging Deployment**

```bash
# Deploy to staging
wrangler deploy --env staging

# Run E2E tests against staging
npm run test:e2e:staging
```

### **Production Deployment**

```bash
# Deploy to production (requires approval)
wrangler deploy --env production

# Verify health
curl https://api.dartmouth-os.com/agents/mccarthy-pa/health
```

### **Rollback (if needed)**

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback [deployment-id]
```

---

## 🐛 Troubleshooting

### **Common Issues**

#### **1. "Unauthorized" errors**

**Problem:** JWT token expired or invalid

**Solution:**
```typescript
// Refresh token
const { accessToken } = await DartmouthClient.refreshToken(refreshToken);
await AsyncStorage.setItem('accessToken', accessToken);
```

#### **2. "Database locked" errors**

**Problem:** D1 database concurrent writes

**Solution:**
```typescript
// Add retry logic
async function executeWithRetry(query, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await query.run();
    } catch (error) {
      if (error.message.includes('database is locked') && i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100 * (i + 1)));
      } else {
        throw error;
      }
    }
  }
}
```

#### **3. Voice not working**

**Problem:** Microphone permissions or API key issues

**Solution:**
```typescript
// Check permissions
import { check, request, PERMISSIONS } from 'react-native-permissions';

const status = await check(PERMISSIONS.IOS.MICROPHONE);
if (status !== 'granted') {
  await request(PERMISSIONS.IOS.MICROPHONE);
}

// Verify API keys
console.log('Deepgram API key:', env.DEEPGRAM_API_KEY?.substring(0, 10) + '...');
```

#### **4. Cold start latency**

**Problem:** First request slow

**Solution:**
```typescript
// Use Cloudflare Workers warming
// Add a cron trigger to keep worker warm
// wrangler.toml
[triggers]
crons = ["*/5 * * * *"]  # Every 5 minutes
```

### **Debugging Tips**

```typescript
// Enable debug logging
const DEBUG = env.ENVIRONMENT === 'development';

if (DEBUG) {
  console.log('Request:', request.method, request.url);
  console.log('Headers:', request.headers);
  console.log('Body:', await request.text());
}
```

### **Performance Monitoring**

```typescript
// Track request duration
const start = Date.now();
const response = await handler.handle(request, env);
const duration = Date.now() - start;

// Log slow requests
if (duration > 1000) {
  console.warn('Slow request:', request.url, duration + 'ms');
}
```

---

## 📚 Additional Resources

### **Documentation**

- [Dartmouth OS V2.0 Spec](../../dartmouth-os/v2/DARTMOUTH_OS_V2_COMPLETE_SPECIFICATION.md)
- [Voice Implementation Guide](MCCARTHY_PA_VOICE_IMPLEMENTATION.md)
- [API Reference](MCCARTHY_PA_API_REFERENCE.md)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)

### **Primers**

#### **SQL Primer**

```sql
-- SELECT (read)
SELECT * FROM tasks WHERE user_id = 'user123';

-- INSERT (create)
INSERT INTO tasks (id, user_id, title, status, created_at, updated_at)
VALUES ('task123', 'user123', 'Test task', 'pending', 1700000000, 1700000000);

-- UPDATE (update)
UPDATE tasks SET status = 'completed', updated_at = 1700000001 WHERE id = 'task123';

-- DELETE (delete)
DELETE FROM tasks WHERE id = 'task123';

-- JOIN (combine tables)
SELECT tasks.*, users.name
FROM tasks
JOIN users ON tasks.user_id = users.id
WHERE users.email = 'test@example.com';
```

#### **Workers Primer**

```typescript
// Cloudflare Worker structure
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // 1. Parse request
    const url = new URL(request.url);
    const path = url.pathname;

    // 2. Route request
    if (path === '/health') {
      return new Response('OK', { status: 200 });
    }

    // 3. Handle request
    const handler = new TaskHandler();
    return handler.handle(request, env);
  },
};
```

---

## 🤝 Support

For questions or issues:
- **Slack:** #mccarthy-pa-development
- **Email:** [Contact]
- **Meeting:** Today (Nov 19, 2024)

---

**Good luck with the migration! 🚀**

