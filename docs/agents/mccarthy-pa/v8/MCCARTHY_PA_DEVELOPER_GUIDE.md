# McCarthy PA Agent - Developer Migration Guide (V7 → V8)

**Document Version:** 1.0  
**Date:** November 19, 2024  
**Audience:** McCarthy PA Developer  
**Purpose:** Step-by-step guide to migrate from Firebase (V7) to Dartmouth OS (V8)

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

1. **Frontend (React Native) stays mostly the same** - Only API calls change
2. **Backend moves from Firebase to Cloudflare** - Complete rewrite
3. **Voice integration becomes simpler** - Use Dartmouth Voice Services
4. **Database changes from Firestore to D1** - SQL instead of NoSQL
5. **Timeline: 3-4 weeks** - Parallel development, gradual rollout

### **High-Level Changes**

| Component | V7 (Firebase) | V8 (Dartmouth OS) | Change Required |
|-----------|---------------|-------------------|-----------------|
| **React Native App** | Existing | Update API calls | ⚠️ Minor |
| **Backend Functions** | Firebase Functions | Cloudflare Workers | 🔴 Complete rewrite |
| **Database** | Firestore | Cloudflare D1 | 🔴 Schema + queries |
| **Storage** | Firebase Storage | Cloudflare R2 | ⚠️ API change |
| **Auth** | Firebase Auth | Dartmouth Auth | ⚠️ API change |
| **Voice** | Custom | Dartmouth Voice | ✅ Simpler |

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

## 🗺️ Migration Roadmap

### **Week 2-3: Parallel Development**

**Goal:** Build V8 while V7 keeps running

#### **Backend Tasks**

1. ✅ Set up Cloudflare Workers environment
2. ✅ Create D1 database schema
3. ✅ Implement Dartmouth Auth integration
4. ✅ Migrate core handlers:
   - TaskHandler (tasks CRUD)
   - ReminderHandler (reminders CRUD)
   - NoteHandler (notes CRUD)
   - CalendarHandler (calendar events)
   - ContactHandler (contacts)
5. ✅ Integrate Voice Services (STT/TTS)
6. ✅ Set up caching (Cloudflare KV)
7. ✅ Implement analytics tracking

#### **Frontend Tasks**

1. ✅ Create new API client (`DartmouthClient.ts`)
2. ✅ Update API calls (Firebase → Dartmouth)
3. ✅ Update auth flow (Firebase Auth → Dartmouth Auth)
4. ✅ Update voice integration (use Dartmouth Voice Services)
5. ✅ Add feature flags (switch between V7/V8)

#### **Testing Tasks**

1. ✅ Unit tests for handlers
2. ✅ Integration tests for API endpoints
3. ✅ E2E tests for critical flows
4. ✅ Performance testing (latency, throughput)

### **Week 4: Data Migration**

**Goal:** Move user data from Firestore to D1

1. ✅ Export Firestore data
2. ✅ Transform data (NoSQL → SQL)
3. ✅ Import to D1
4. ✅ Verify data integrity
5. ✅ Test with real user data

### **Week 5-6: Gradual Rollout**

**Goal:** Transition users from V7 to V8

1. ✅ Deploy V8 to production
2. ✅ 10% of users → V8 (feature flag)
3. ✅ Monitor performance, errors, costs
4. ✅ 50% of users → V8
5. ✅ 100% of users → V8

### **Week 7: Decommission V7**

**Goal:** Shut down Firebase

1. ✅ Verify all users on V8
2. ✅ Shut down Firebase Functions
3. ✅ Delete Firebase project (after backup)
4. ✅ Archive V7 codebase

---

## 💻 Code Migration

### **1. API Client (Frontend)**

#### **V7 (Firebase)**

```typescript
// V7: FirebaseClient.ts
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Login
export async function login(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// Create task
export async function createTask(task: Task) {
  const docRef = await addDoc(collection(db, 'tasks'), task);
  return docRef.id;
}
```

#### **V8 (Dartmouth OS)**

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

#### **V7 (Firebase Auth)**

```typescript
// V7: useAuth.ts
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  return { user };
}
```

#### **V8 (Dartmouth Auth)**

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

#### **V7 (Custom Voice)**

```typescript
// V7: VoiceService.ts
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';

export class VoiceService {
  async startListening() {
    await Voice.start('en-US');
    Voice.onSpeechResults = (e) => {
      const transcript = e.value[0];
      // Send to backend
      this.sendToBackend(transcript);
    };
  }

  async speak(text: string) {
    await Tts.speak(text);
  }
}
```

#### **V8 (Dartmouth Voice Services)**

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

#### **V7 (Firebase Functions)**

```typescript
// V7: functions/src/tasks.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const createTask = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
  }

  const userId = context.auth.uid;
  const task = {
    ...data,
    userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await admin.firestore().collection('tasks').add(task);
  return { id: docRef.id };
});
```

#### **V8 (Cloudflare Workers)**

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

#### **V7 (Firestore)**

```typescript
// V7: Get user tasks
const tasksRef = collection(db, 'tasks');
const q = query(tasksRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
const querySnapshot = await getDocs(q);
const tasks = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
```

#### **V8 (D1 / SQL)**

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

## 🗄️ Data Migration

### **Step 1: Export Firestore Data**

```typescript
// export-firestore.ts
import * as admin from 'firebase-admin';
import * as fs from 'fs';

admin.initializeApp();
const db = admin.firestore();

async function exportCollection(collectionName: string) {
  const snapshot = await db.collection(collectionName).get();
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  fs.writeFileSync(`${collectionName}.json`, JSON.stringify(data, null, 2));
  console.log(`Exported ${data.length} documents from ${collectionName}`);
}

async function main() {
  await exportCollection('users');
  await exportCollection('tasks');
  await exportCollection('reminders');
  await exportCollection('notes');
  await exportCollection('calendar_events');
  await exportCollection('contacts');
}

main();
```

Run:

```bash
npm install firebase-admin
node export-firestore.ts
```

### **Step 2: Transform Data**

```typescript
// transform-data.ts
import * as fs from 'fs';

// Load Firestore exports
const users = JSON.parse(fs.readFileSync('users.json', 'utf-8'));
const tasks = JSON.parse(fs.readFileSync('tasks.json', 'utf-8'));

// Transform to SQL format
const usersSql = users.map((user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  created_at: user.createdAt?._seconds * 1000 || Date.now(),
  updated_at: user.updatedAt?._seconds * 1000 || Date.now(),
}));

const tasksSql = tasks.map((task) => ({
  id: task.id,
  user_id: task.userId,
  title: task.title,
  description: task.description || null,
  status: task.status || 'pending',
  priority: task.priority || null,
  due_date: task.dueDate?._seconds * 1000 || null,
  created_at: task.createdAt?._seconds * 1000 || Date.now(),
  updated_at: task.updatedAt?._seconds * 1000 || Date.now(),
}));

// Save as SQL
fs.writeFileSync('users.sql.json', JSON.stringify(usersSql, null, 2));
fs.writeFileSync('tasks.sql.json', JSON.stringify(tasksSql, null, 2));
```

### **Step 3: Import to D1**

```typescript
// import-to-d1.ts
import * as fs from 'fs';

const users = JSON.parse(fs.readFileSync('users.sql.json', 'utf-8'));
const tasks = JSON.parse(fs.readFileSync('tasks.sql.json', 'utf-8'));

// Generate SQL INSERT statements
let sql = '';

users.forEach((user) => {
  sql += `INSERT INTO users (id, email, name, created_at, updated_at) VALUES ('${user.id}', '${user.email}', '${user.name}', ${user.created_at}, ${user.updated_at});\n`;
});

tasks.forEach((task) => {
  sql += `INSERT INTO tasks (id, user_id, title, description, status, priority, due_date, created_at, updated_at) VALUES ('${task.id}', '${task.user_id}', '${task.title}', ${task.description ? `'${task.description}'` : 'NULL'}, '${task.status}', ${task.priority ? `'${task.priority}'` : 'NULL'}, ${task.due_date || 'NULL'}, ${task.created_at}, ${task.updated_at});\n`;
});

fs.writeFileSync('import.sql', sql);
console.log('Generated import.sql');
```

Run:

```bash
node transform-data.ts
node import-to-d1.ts
wrangler d1 execute mccarthy-pa-dev --file=./import.sql
```

### **Step 4: Verify Data**

```bash
# Check user count
wrangler d1 execute mccarthy-pa-dev --command="SELECT COUNT(*) FROM users;"

# Check task count
wrangler d1 execute mccarthy-pa-dev --command="SELECT COUNT(*) FROM tasks;"

# Sample data
wrangler d1 execute mccarthy-pa-dev --command="SELECT * FROM users LIMIT 5;"
wrangler d1 execute mccarthy-pa-dev --command="SELECT * FROM tasks LIMIT 5;"
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

