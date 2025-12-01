# Developer Onboarding Guide: PA AI Agent Development
**Project:** Dartmouth OS - McCarthy PA Agent  
**Last Updated:** 2025-11-21  
**Your Role:** PA Agent Developer  
**Team:** John (Product Owner), AI Assistant (Architecture/Support)

---

## 🎯 YOUR MISSION

Build the **McCarthy PA (Personal Assistant) Agent** within the Dartmouth OS framework. This agent will handle:
- 📅 Calendar management
- ✉️ Email drafting and management
- ✅ Task tracking and reminders
- 🗓️ Meeting scheduling
- 📝 Note-taking and organization

---

## 🏗️ ARCHITECTURE OVERVIEW

```
Dartmouth OS (Agent Operating System)
├── dartmouth-core/          ← Core OS (DON'T EDIT)
├── mccarthy-artwork/        ← Artwork Agent (DON'T EDIT)
├── mccarthy-pa/             ← YOUR WORKSPACE ✅
└── worker/                  ← Main API (MINIMAL EDITS)
```

**Key Principle:** Each agent is a **self-contained package**. You work in `mccarthy-pa/` only!

---

## 📋 STEP 1: ENVIRONMENT SETUP

### 1.1 Prerequisites
- ✅ Node.js 18+ installed
- ✅ Git installed
- ✅ GitHub account with repo access
- ✅ Cloudflare account access (for secrets)
- ✅ OpenAI API key (will be provided)

### 1.2 Clone Repository
```bash
git clone https://github.com/hutchisonjohn/dartmouth.git
cd dartmouth
npm install
```

### 1.3 Create Your Branch
```bash
git checkout -b feature/pa-agent-initial
```

**Branch Naming Convention:**
- `feature/pa-agent-[description]` - New features
- `fix/pa-agent-[description]` - Bug fixes
- `docs/pa-agent-[description]` - Documentation

### 1.4 Set Up Local Secrets
Create `packages/worker/.dev.vars`:
```bash
cd packages/worker
```

Create file `.dev.vars` with:
```
OPENAI_API_KEY=sk-proj-... (will be provided)
ENVIRONMENT=development
```

**⚠️ NEVER commit `.dev.vars` to Git!** (Already in `.gitignore`)

---

## 🚀 STEP 2: LOCAL DEVELOPMENT

### 2.1 Run Worker Locally
```bash
cd packages/worker
npx wrangler dev
```

**Output:**
```
⛅️ wrangler 4.47.0
Your worker is running at http://localhost:8787
```

### 2.2 Test API
Open another terminal:
```bash
curl http://localhost:8787/api/v2/agents
```

**Expected Response:**
```json
{
  "agents": ["fam", "mccarthy-artwork", "mccarthy-pa"],
  "count": 3
}
```

### 2.3 Test Chat Endpoint
```bash
curl -X POST http://localhost:8787/api/v2/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "mccarthy-pa",
    "message": "Schedule a meeting for tomorrow at 2pm",
    "sessionId": "dev-session-123",
    "userId": "dev-user"
  }'
```

---

## 📦 STEP 3: YOUR PACKAGE STRUCTURE

Your workspace: `packages/mccarthy-pa/`

```
mccarthy-pa/
├── src/
│   ├── McCarthyPAAgent.ts          ← Main agent class
│   ├── handlers/
│   │   ├── CalendarHandler.ts     ← Handle calendar requests
│   │   ├── EmailHandler.ts        ← Handle email drafting
│   │   ├── TaskHandler.ts         ← Handle task management
│   │   └── ScheduleHandler.ts     ← Handle scheduling
│   ├── components/
│   │   ├── CalendarIntegration.ts ← Google Calendar API
│   │   ├── EmailComposer.ts       ← Email generation
│   │   └── TaskManager.ts         ← Task tracking
│   ├── knowledge/
│   │   └── PA_GUIDELINES.md        ← PA best practices
│   └── index.ts                    ← Package exports
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔧 STEP 4: AGENT DEVELOPMENT TEMPLATE

### 4.1 Main Agent Class (`McCarthyPAAgent.ts`)

```typescript
import { BaseAgent } from '@agent-army/dartmouth-core';
import type { AgentConfig, Intent, Response } from '@agent-army/shared';

export class McCarthyPAAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({
      ...config,
      agentId: 'mccarthy-pa',
      name: 'McCarthy PA',
      version: '1.0.0',
      description: 'Personal Assistant for calendar, email, and task management',
      systemPrompt: `You are McCarthy, a professional personal assistant...`
    });
  }

  // Override methods as needed
  async processIntent(intent: Intent): Promise<Response> {
    // Your custom logic here
    return super.processIntent(intent);
  }
}
```

### 4.2 Handler Example (`CalendarHandler.ts`)

```typescript
import type { Handler, Intent, Response, HandlerContext } from '@agent-army/shared';

export class CalendarHandler implements Handler {
  name = 'CalendarHandler';
  version = '1.0.0';

  canHandle(intent: Intent): boolean {
    return intent.type === 'calendar' || 
           intent.action === 'schedule_meeting';
  }

  async handle(
    message: string,
    intent: Intent,
    context: HandlerContext
  ): Promise<Response> {
    // Extract meeting details from message
    // Call Google Calendar API
    // Return formatted response
    
    return {
      content: 'Meeting scheduled for tomorrow at 2pm!',
      metadata: {
        handlerName: this.name,
        handlerVersion: this.version,
        processingTime: Date.now() - startTime,
        confidence: 0.95
      }
    };
  }
}
```

---

## 🔌 STEP 5: REGISTER YOUR AGENT

### 5.1 Export Your Agent
In `packages/mccarthy-pa/src/index.ts`:
```typescript
export { McCarthyPAAgent } from './McCarthyPAAgent';
export * from './handlers';
export * from './components';
```

### 5.2 Register in Worker
In `packages/worker/src/index.ts`, add ONE line:

```typescript
import { McCarthyPAAgent } from '@agent-army/mccarthy-pa';

// Register agents
agentRegistry.register('fam', famAgent);
agentRegistry.register('mccarthy-artwork', artworkAgent);
agentRegistry.register('mccarthy-pa', new McCarthyPAAgent(paConfig)); // ← ADD THIS
```

**That's it!** Your agent is now live.

---

## 🧪 STEP 6: TESTING

### 6.1 Local Testing
```bash
# Terminal 1: Run worker
cd packages/worker
npx wrangler dev

# Terminal 2: Test your agent
curl -X POST http://localhost:8787/api/v2/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "mccarthy-pa",
    "message": "What meetings do I have today?",
    "sessionId": "test-123",
    "userId": "test-user"
  }'
```

### 6.2 Staging Testing
Once your PR is merged to `dev` branch:
```bash
curl -X POST https://dartmouth-os-dev.dartmouth.workers.dev/api/v2/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "mccarthy-pa",
    "message": "Schedule a meeting",
    "sessionId": "staging-test",
    "userId": "staging-user"
  }'
```

---

## 📤 STEP 7: SUBMITTING YOUR WORK

### 7.1 Commit Your Changes
```bash
git add packages/mccarthy-pa/
git commit -m "feat(pa-agent): Add calendar scheduling handler"
git push origin feature/pa-agent-initial
```

### 7.2 Create Pull Request
1. Go to: https://github.com/hutchisonjohn/dartmouth
2. Click "Pull Requests" → "New Pull Request"
3. Base: `dev` ← Compare: `feature/pa-agent-initial`
4. Title: `[PA Agent] Calendar scheduling implementation`
5. Description:
   ```
   ## What's Changed
   - Added CalendarHandler for meeting scheduling
   - Integrated Google Calendar API
   - Added tests for calendar functionality
   
   ## Testing
   - ✅ Local testing passed
   - ✅ Handles "schedule meeting" intent
   - ✅ Returns formatted calendar response
   
   ## Screenshots
   (Add if applicable)
   ```
6. Click "Create Pull Request"

### 7.3 Code Review Process
1. John or AI Assistant will review your PR
2. You may receive feedback/change requests
3. Make changes and push to same branch
4. Once approved, we'll merge to `dev`
5. We'll deploy to staging for final testing
6. When stable, we'll merge to `main` (production)

---

## 🚫 IMPORTANT: WHAT NOT TO EDIT

### ❌ DO NOT EDIT:
- `packages/dartmouth-core/` (Core OS)
- `packages/mccarthy-artwork/` (Other agent)
- `packages/worker/src/routes/` (API routes)
- `packages/worker/src/components/` (Core components)
- `packages/worker/wrangler.toml` (Worker config)

### ✅ YOU CAN EDIT:
- `packages/mccarthy-pa/` (Your entire package)
- `packages/worker/src/index.ts` (ONE line to register agent)
- `packages/worker/package.json` (Add dependencies if needed)

---

## 🔑 API REFERENCE

### Chat Endpoint
**POST** `/api/v2/chat`

**Request:**
```json
{
  "agentId": "mccarthy-pa",
  "message": "Schedule a meeting for tomorrow at 2pm",
  "sessionId": "unique-session-id",
  "userId": "user-123",
  "metadata": {
    "timezone": "Australia/Sydney",
    "calendarId": "primary"
  }
}
```

**Response:**
```json
{
  "response": "I've scheduled a meeting for tomorrow at 2pm!",
  "metadata": {
    "agentId": "mccarthy-pa",
    "handlerName": "CalendarHandler",
    "processingTime": 234,
    "confidence": 0.95
  },
  "sessionId": "unique-session-id"
}
```

### Health Check
**GET** `/api/v2/health?agentId=mccarthy-pa`

**Response:**
```json
{
  "status": "healthy",
  "agentId": "mccarthy-pa",
  "version": "1.0.0",
  "responseTime": 45
}
```

---

## 🐛 TROUBLESHOOTING

### Issue: "Module not found: @agent-army/mccarthy-pa"
**Solution:**
```bash
cd packages/mccarthy-pa
npm link
cd ../worker
npm link @agent-army/mccarthy-pa
```

### Issue: "OPENAI_API_KEY is not defined"
**Solution:** Check `.dev.vars` file exists in `packages/worker/`

### Issue: "Agent not responding"
**Solution:** Check worker logs:
```bash
npx wrangler tail
```

### Issue: "TypeScript errors"
**Solution:**
```bash
npm run type-check
```

---

## 📞 GETTING HELP

### Daily Questions
- Create GitHub Issue with `[PA Agent]` prefix
- Tag: `@hutchisonjohn` or `@ai-assistant`

### Weekly Sync
- Review progress
- Discuss blockers
- Plan next sprint

### Emergency
- Slack/Email John directly
- Include error logs and steps to reproduce

---

## 📅 DEVELOPMENT TIMELINE

### Week 1-2: Setup & Core Structure
- [ ] Environment setup
- [ ] Create McCarthyPAAgent class
- [ ] Basic intent detection
- [ ] First PR: Agent skeleton

### Week 3-4: Calendar Integration
- [ ] CalendarHandler implementation
- [ ] Google Calendar API integration
- [ ] Meeting scheduling logic
- [ ] Second PR: Calendar features

### Week 5-6: Email & Tasks
- [ ] EmailHandler implementation
- [ ] TaskHandler implementation
- [ ] Email composition with AI
- [ ] Task tracking system
- [ ] Third PR: Email & tasks

### Week 7: Testing & Polish
- [ ] End-to-end testing
- [ ] Bug fixes
- [ ] Documentation
- [ ] Final PR: Production ready

### Week 8: Production Deployment
- [ ] Merge to main
- [ ] Deploy to production
- [ ] Monitor and support

---

## 🎓 LEARNING RESOURCES

### Dartmouth OS Docs
- Architecture: `D:\coding\agent-army-system\ARCHITECTURE.md`
- API Docs: `D:\coding\agent-army-system\API_DOCUMENTATION.md`
- Build Plan: `D:\coding\agent-army-system\SAAS_DELIVERY_BUILD_PLAN.md`

### Cloudflare Workers
- Docs: https://developers.cloudflare.com/workers/
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler/

### TypeScript
- Handbook: https://www.typescriptlang.org/docs/

---

## ✅ CHECKLIST: BEFORE YOU START

- [ ] Repository cloned
- [ ] Node.js 18+ installed
- [ ] Git configured with your name/email
- [ ] GitHub access confirmed
- [ ] `.dev.vars` file created with API key
- [ ] `npx wrangler dev` runs successfully
- [ ] Feature branch created
- [ ] Read this entire document
- [ ] Asked any questions you have

---

## 🚀 READY TO START?

1. Complete the checklist above
2. Create your feature branch
3. Start with `McCarthyPAAgent.ts` skeleton
4. Test locally with `wrangler dev`
5. Commit and create your first PR
6. We'll review and provide feedback

**Welcome to the team! Let's build something amazing! 🎉**

---

**Questions?** Create a GitHub issue or contact John directly.

**Last Updated:** 2025-11-21  
**Version:** 1.0.0

