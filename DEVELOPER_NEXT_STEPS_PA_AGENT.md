# McCarthy PA Agent - Developer Next Steps
**Date:** 2025-11-21  
**Status:** Week 2 - Backend Development Starting  
**Your Task:** Build McCarthy PA Agent Backend on Dartmouth OS

---

## 🎯 CURRENT STATUS

### ✅ What's Already Done
1. **React Native App (Week 1)** - Frontend foundation complete
2. **Dartmouth OS Core** - Platform running in production
   - Agent Registry ✅
   - API Gateway ✅
   - Health Monitoring ✅
   - D1 Database ✅
   - R2 Storage ✅
3. **Documentation** - Complete V8 specs provided
4. **Staging Environment** - `https://dartmouth-os-dev.dartmouth.workers.dev`

### 🚧 What Needs to Be Built (Your Job)
1. **Voice Services (Layer 7)** - STT, TTS, Audio Streaming
2. **McCarthy PA Agent Backend** - Handlers for tasks, reminders, calendar, etc.
3. **Database Schemas** - D1 tables for PA data
4. **API Endpoints** - REST/WebSocket for mobile app
5. **React Native Integration** - Connect app to Dartmouth OS

---

## 📋 YOUR DEVELOPMENT PLAN

### **PHASE 1: Foundation (Week 2 - Days 1-3)**

#### Day 1-2: Voice Services Infrastructure
**Goal:** Build Dartmouth Voice Services (Layer 7)

**Tasks:**
1. Create `packages/worker/src/services/VoiceService.ts`
   - STT integration (Deepgram primary, Whisper fallback)
   - TTS integration (F5-TTS primary, OpenAI fallback)
   - Audio streaming (WebSocket)
   - VAD (Voice Activity Detection)

2. Create voice API endpoints:
   - `POST /api/v2/voice/stt` - Speech-to-Text
   - `POST /api/v2/voice/tts` - Text-to-Speech
   - `WS /api/v2/voice/stream` - Real-time streaming

3. Test voice services locally

**Reference Docs:**
- `DARTMOUTH_VOICE_SERVICES_SPECIFICATION.md`
- `MCCARTHY_PA_VOICE_IMPLEMENTATION.md`

**Deliverable:** Voice services working locally

---

#### Day 3: Database Schemas
**Goal:** Create D1 database tables for PA data

**Tasks:**
1. Create migration file: `packages/worker/migrations/0002_pa_agent_schema.sql`

```sql
-- Users table (PA-specific data)
CREATE TABLE IF NOT EXISTS pa_users (
  user_id TEXT PRIMARY KEY,
  timezone TEXT NOT NULL DEFAULT 'Australia/Sydney',
  locale TEXT NOT NULL DEFAULT 'en-AU',
  currency TEXT NOT NULL DEFAULT 'AUD',
  default_group_id TEXT,
  default_shopping_list_id TEXT,
  settings TEXT, -- JSON
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Tasks table
CREATE TABLE IF NOT EXISTS pa_tasks (
  task_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  group_id TEXT, -- NULL = personal task
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high
  due_date TEXT,
  reminder_date TEXT,
  location TEXT, -- JSON: {lat, lng, radius, name}
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES pa_users(user_id)
);

-- Reminders table
CREATE TABLE IF NOT EXISTS pa_reminders (
  reminder_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  task_id TEXT, -- NULL if standalone reminder
  title TEXT NOT NULL,
  description TEXT,
  reminder_time TEXT NOT NULL,
  repeat_pattern TEXT, -- NULL, daily, weekly, monthly
  location_trigger TEXT, -- JSON: {lat, lng, radius}
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, cancelled
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES pa_users(user_id),
  FOREIGN KEY (task_id) REFERENCES pa_tasks(task_id)
);

-- Notes table
CREATE TABLE IF NOT EXISTS pa_notes (
  note_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'text', -- text, voice, image
  audio_url TEXT, -- R2 URL for voice notes
  tags TEXT, -- JSON array
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES pa_users(user_id)
);

-- Calendar events (cache from external calendars)
CREATE TABLE IF NOT EXISTS pa_calendar_events (
  event_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  external_id TEXT, -- Google Calendar event ID
  title TEXT NOT NULL,
  description TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  location TEXT,
  attendees TEXT, -- JSON array
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES pa_users(user_id)
);

-- Shopping lists
CREATE TABLE IF NOT EXISTS pa_shopping_lists (
  list_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  group_id TEXT, -- NULL = personal list
  name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES pa_users(user_id)
);

-- Shopping list items
CREATE TABLE IF NOT EXISTS pa_shopping_items (
  item_id TEXT PRIMARY KEY,
  list_id TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity TEXT,
  category TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT 0,
  added_by TEXT NOT NULL, -- user_id
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (list_id) REFERENCES pa_shopping_lists(list_id)
);

-- Conversation history (for context)
CREATE TABLE IF NOT EXISTS pa_conversations (
  message_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL, -- user, assistant
  content TEXT NOT NULL,
  audio_url TEXT, -- R2 URL if voice message
  metadata TEXT, -- JSON: intent, entities, etc.
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES pa_users(user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON pa_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON pa_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON pa_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_time ON pa_reminders(reminder_time);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON pa_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_user_id ON pa_calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_start_time ON pa_calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON pa_shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_list_id ON pa_shopping_items(list_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON pa_conversations(session_id);
```

2. Run migration:
```bash
cd packages/worker
npx wrangler d1 migrations apply dartmouth-os-db --local
npx wrangler d1 migrations apply dartmouth-os-db --remote
```

**Deliverable:** Database schema created

---

### **PHASE 2: PA Agent Handlers (Week 2 - Days 4-7)**

#### Day 4-5: Core Handlers
**Goal:** Build main PA Agent handlers

**Tasks:**
1. Create `packages/mccarthy-pa/src/handlers/TaskHandler.ts`
```typescript
import type { Handler, Intent, Response, HandlerContext } from '@agent-army/shared';

export class TaskHandler implements Handler {
  name = 'TaskHandler';
  version = '1.0.0';

  canHandle(intent: Intent): boolean {
    return intent.type === 'task' || 
           intent.action?.startsWith('task_');
  }

  async handle(
    message: string,
    intent: Intent,
    context: HandlerContext
  ): Promise<Response> {
    const { action, entities } = intent;
    
    switch (action) {
      case 'task_create':
        return await this.createTask(entities, context);
      case 'task_list':
        return await this.listTasks(entities, context);
      case 'task_complete':
        return await this.completeTask(entities, context);
      case 'task_update':
        return await this.updateTask(entities, context);
      default:
        return this.getGenericTaskResponse();
    }
  }

  private async createTask(entities: any, context: HandlerContext): Promise<Response> {
    // Extract task details from entities
    const title = entities.title || entities.task;
    const dueDate = entities.due_date;
    const priority = entities.priority || 'medium';
    
    // Save to D1
    const taskId = `task_${Date.now()}`;
    await context.env.DB.prepare(`
      INSERT INTO pa_tasks (task_id, user_id, title, priority, due_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      taskId,
      context.userId,
      title,
      priority,
      dueDate,
      new Date().toISOString(),
      new Date().toISOString()
    ).run();
    
    return {
      content: `✅ Task created: "${title}"${dueDate ? ` due ${dueDate}` : ''}`,
      metadata: {
        handlerName: this.name,
        taskId,
        action: 'task_create'
      }
    };
  }

  // Implement other methods...
}
```

2. Create `packages/mccarthy-pa/src/handlers/ReminderHandler.ts` (similar pattern)
3. Create `packages/mccarthy-pa/src/handlers/NoteHandler.ts` (similar pattern)
4. Create `packages/mccarthy-pa/src/handlers/CalendarHandler.ts` (similar pattern)
5. Create `packages/mccarthy-pa/src/handlers/ShoppingListHandler.ts` (similar pattern)

**Deliverable:** All core handlers implemented

---

#### Day 6-7: PA Agent Integration
**Goal:** Wire up handlers to McCarthy PA Agent

**Tasks:**
1. Update `packages/mccarthy-pa/src/McCarthyPAAgent.ts`:
```typescript
import { BaseAgent } from '@agent-army/dartmouth-core';
import { TaskHandler } from './handlers/TaskHandler';
import { ReminderHandler } from './handlers/ReminderHandler';
import { NoteHandler } from './handlers/NoteHandler';
import { CalendarHandler } from './handlers/CalendarHandler';
import { ShoppingListHandler } from './handlers/ShoppingListHandler';

export class McCarthyPAAgent extends BaseAgent {
  constructor(config: any) {
    super({
      ...config,
      agentId: 'mccarthy-pa',
      name: 'McCarthy PA',
      version: '1.0.0',
      systemPrompt: `You are McCarthy, a helpful personal assistant...`
    });
    
    // Register handlers
    this.registerHandler(new TaskHandler());
    this.registerHandler(new ReminderHandler());
    this.registerHandler(new NoteHandler());
    this.registerHandler(new CalendarHandler());
    this.registerHandler(new ShoppingListHandler());
  }
}
```

2. Register PA Agent in worker:
```typescript
// packages/worker/src/index.ts
import { McCarthyPAAgent } from '../../mccarthy-pa/src';

// In initializeDartmouth():
const paAgent = new McCarthyPAAgent({
  ...baseConfig,
  agentId: 'mccarthy-pa',
});
dartmouth.registerAgent(paAgent);
```

3. Test locally:
```bash
cd packages/worker
npx wrangler dev
```

4. Test API:
```bash
curl -X POST http://localhost:8787/api/v2/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "mccarthy-pa",
    "message": "Create a task to buy groceries",
    "sessionId": "test-123",
    "userId": "user-456"
  }'
```

**Deliverable:** PA Agent responding to requests

---

### **PHASE 3: React Native Integration (Week 3)**

#### Day 1-3: API Client
**Goal:** Connect React Native app to Dartmouth OS

**Tasks:**
1. Create `DartmouthClient.ts` in React Native app:
```typescript
import axios from 'axios';

export class DartmouthClient {
  private baseURL = 'https://dartmouth-os-dev.dartmouth.workers.dev';
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async sendMessage(message: string, userId: string, sessionId: string) {
    const response = await axios.post(`${this.baseURL}/api/v2/chat`, {
      agentId: 'mccarthy-pa',
      message,
      userId,
      sessionId
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  }
  
  async sendVoice(audioBlob: Blob, userId: string, sessionId: string) {
    // 1. Convert speech to text
    const formData = new FormData();
    formData.append('audio', audioBlob);
    
    const sttResponse = await axios.post(`${this.baseURL}/api/v2/voice/stt`, formData, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    const transcript = sttResponse.data.transcript;
    
    // 2. Send to agent
    const agentResponse = await this.sendMessage(transcript, userId, sessionId);
    
    // 3. Convert response to speech
    const ttsResponse = await axios.post(`${this.baseURL}/api/v2/voice/tts`, {
      text: agentResponse.response,
      voice: 'alloy'
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      },
      responseType: 'blob'
    });
    
    return {
      transcript,
      response: agentResponse.response,
      audio: ttsResponse.data
    };
  }
}
```

2. Integrate into React Native app
3. Test voice flow end-to-end

**Deliverable:** React Native app connected to Dartmouth OS

---

## 🧪 TESTING CHECKLIST

### Voice Services
- [ ] STT converts speech to text accurately
- [ ] TTS converts text to natural-sounding speech
- [ ] Audio streaming works in real-time
- [ ] VAD detects speech start/end correctly

### PA Agent Handlers
- [ ] TaskHandler creates/lists/updates/completes tasks
- [ ] ReminderHandler sets/lists/cancels reminders
- [ ] NoteHandler creates/retrieves voice/text notes
- [ ] CalendarHandler reads/creates calendar events
- [ ] ShoppingListHandler manages shopping lists

### React Native Integration
- [ ] App connects to Dartmouth OS
- [ ] Voice input works end-to-end
- [ ] Text chat works
- [ ] Tasks sync with backend
- [ ] Reminders trigger correctly

---

## 📞 GETTING HELP

### When Stuck
1. Check the docs: `docs/agents/mccarthy-pa/v8/`
2. Look at existing agents: `packages/mccarthy-artwork/`
3. Test with curl/Postman first
4. Create GitHub Issue if needed

### Resources
- **Staging Worker:** https://dartmouth-os-dev.dartmouth.workers.dev
- **Production Worker:** https://dartmouth-os-worker.dartmouth.workers.dev
- **Docs:** `D:\coding\agent-army-system\docs\`
- **Examples:** `packages/mccarthy-artwork/` (working agent)

---

## 🎯 SUCCESS CRITERIA

### Week 2 Complete When:
- [ ] Voice Services deployed and working
- [ ] Database schemas created
- [ ] All PA handlers implemented
- [ ] PA Agent registered in Dartmouth OS
- [ ] Local testing passing

### Week 3 Complete When:
- [ ] React Native app connected
- [ ] Voice flow working end-to-end
- [ ] Text chat working
- [ ] Tasks/reminders/notes functional
- [ ] Deployed to staging

---

## 🚀 NEXT ACTIONS (START HERE)

1. **Read the architecture doc** (30 min)
   - `MCCARTHY_PA_DARTMOUTH_ARCHITECTURE.md`

2. **Set up local environment** (15 min)
   ```bash
   cd D:\coding\agent-army-system
   git pull origin main
   cd packages/worker
   npm install
   npx wrangler dev
   ```

3. **Start with Voice Services** (Day 1-2)
   - Create `VoiceService.ts`
   - Implement STT/TTS
   - Test locally

4. **Create database schemas** (Day 3)
   - Write migration file
   - Run migrations
   - Test with sample data

5. **Build handlers** (Day 4-5)
   - TaskHandler first (simplest)
   - Then ReminderHandler
   - Then others

6. **Integrate & test** (Day 6-7)
   - Wire up PA Agent
   - Test all endpoints
   - Deploy to staging

---

**YOU HAVE EVERYTHING YOU NEED TO START!** 🚀

**Questions?** Create a GitHub Issue or contact John.

**Last Updated:** 2025-11-21  
**Version:** 1.0.0

