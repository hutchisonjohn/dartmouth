# 🏗️ Dartmouth OS MVP - Build Plan

**Version:** 1.0.0  
**Date:** November 19, 2024  
**Status:** Active Development - STARTING TODAY  
**Goal:** Build minimal Dartmouth OS to support FAM, Artwork Analyzer, and PA Agent

---

## 🎯 **MVP SCOPE**

### **What We're Building (6 Core Services):**

1. ✅ **API Gateway** - Route requests to agents
2. ✅ **Agent Registry** - Register and discover agents
3. ✅ **Auth Service** - JWT authentication
4. ✅ **Voice Services** - STT/TTS/streaming (Layer 7)
5. ✅ **Database Service** - Wrapper for D1 operations
6. ✅ **Health Monitoring** - Track agent health

### **What We're NOT Building (Yet):**

- ⏸️ Advanced Analytics
- ⏸️ Multi-layer Caching (use basic KV for now)
- ⏸️ Multi-modal Services (vision, audio analysis)
- ⏸️ Orchestration (agent-to-agent, workflows)
- ⏸️ Swarms
- ⏸️ Advanced integrations

---

## 📅 **TIMELINE**

### **TODAY (Nov 19) - 3-4 hours:**
- Build Dartmouth OS core structure
- API Gateway
- Agent Registry
- Health Monitoring
- Deploy & test

### **Week 2 (Nov 20-24) - 20-25 hours:**
- Auth Service
- Voice Services (STT/TTS/streaming/VAD)
- Database Service
- Complete FAM testing
- Complete Artwork Analyzer testing

### **Week 3 (Nov 25-29) - 25-30 hours:**
- PA Agent backend (handlers)
- Database schema for PA data
- Voice integration
- React Native integration

---

## 🏗️ **TODAY'S BUILD PLAN (3-4 hours)**

### **Phase 1: Project Structure (30 min)**

**Create Dartmouth OS core:**

```
packages/dartmouth-core/
├── src/
│   ├── index.ts                    # Main entry point
│   ├── DartmouthOS.ts              # Core OS class
│   ├── services/
│   │   ├── APIGateway.ts           # Route requests
│   │   ├── AgentRegistry.ts        # Register agents
│   │   ├── HealthMonitor.ts        # Monitor health
│   │   ├── AuthService.ts          # JWT auth (stub for now)
│   │   ├── VoiceService.ts         # Voice (stub for now)
│   │   └── DatabaseService.ts      # D1 wrapper (stub for now)
│   ├── types/
│   │   ├── Agent.ts                # Agent interface
│   │   ├── Request.ts              # Request types
│   │   └── Response.ts             # Response types
│   └── utils/
│       ├── logger.ts               # Logging
│       └── errors.ts               # Error handling
├── package.json
└── tsconfig.json
```

**Tasks:**
1. Create folder structure
2. Set up TypeScript config
3. Create package.json
4. Install dependencies

**Time:** 30 minutes

---

### **Phase 2: Core OS Class (45 min)**

**Create `DartmouthOS.ts`:**

```typescript
// packages/dartmouth-core/src/DartmouthOS.ts
import { APIGateway } from './services/APIGateway';
import { AgentRegistry } from './services/AgentRegistry';
import { HealthMonitor } from './services/HealthMonitor';
import { AuthService } from './services/AuthService';
import { VoiceService } from './services/VoiceService';
import { DatabaseService } from './services/DatabaseService';

export class DartmouthOS {
  private apiGateway: APIGateway;
  private agentRegistry: AgentRegistry;
  private healthMonitor: HealthMonitor;
  private authService: AuthService;
  private voiceService: VoiceService;
  private databaseService: DatabaseService;

  constructor(env: Env) {
    // Initialize services
    this.agentRegistry = new AgentRegistry();
    this.healthMonitor = new HealthMonitor();
    this.authService = new AuthService(env);
    this.voiceService = new VoiceService(env);
    this.databaseService = new DatabaseService(env);
    this.apiGateway = new APIGateway(
      this.agentRegistry,
      this.authService,
      this.healthMonitor
    );
  }

  async handleRequest(request: Request, env: Env): Promise<Response> {
    return this.apiGateway.route(request, env);
  }

  registerAgent(agent: Agent): void {
    this.agentRegistry.register(agent);
  }

  getHealth(): HealthStatus {
    return this.healthMonitor.getStatus();
  }
}
```

**Tasks:**
1. Create DartmouthOS class
2. Initialize all services
3. Expose public methods
4. Add error handling

**Time:** 45 minutes

---

### **Phase 3: API Gateway (60 min)**

**Create `APIGateway.ts`:**

```typescript
// packages/dartmouth-core/src/services/APIGateway.ts
export class APIGateway {
  constructor(
    private agentRegistry: AgentRegistry,
    private authService: AuthService,
    private healthMonitor: HealthMonitor
  ) {}

  async route(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Health check
    if (path === '/health') {
      return this.handleHealth();
    }

    // Agent routes: /api/v2/agents/:agentId/chat
    if (path.startsWith('/api/v2/agents/')) {
      return this.handleAgentRequest(request, env);
    }

    // Auth routes: /api/v2/auth/*
    if (path.startsWith('/api/v2/auth/')) {
      return this.handleAuthRequest(request, env);
    }

    return new Response('Not Found', { status: 404 });
  }

  private async handleHealth(): Promise<Response> {
    const health = this.healthMonitor.getStatus();
    return new Response(JSON.stringify(health), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async handleAgentRequest(request: Request, env: Env): Promise<Response> {
    // Extract agentId from path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const agentId = pathParts[4]; // /api/v2/agents/:agentId/...

    // Get agent from registry
    const agent = this.agentRegistry.getAgent(agentId);
    if (!agent) {
      return new Response('Agent not found', { status: 404 });
    }

    // Verify auth (if required)
    const authHeader = request.headers.get('Authorization');
    if (agent.requiresAuth && !authHeader) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Route to agent
    return agent.handleRequest(request, env);
  }

  private async handleAuthRequest(request: Request, env: Env): Promise<Response> {
    return this.authService.handleRequest(request, env);
  }
}
```

**Tasks:**
1. Create routing logic
2. Extract agentId from path
3. Get agent from registry
4. Route to agent
5. Handle auth
6. Handle health checks

**Time:** 60 minutes

---

### **Phase 4: Agent Registry (30 min)**

**Create `AgentRegistry.ts`:**

```typescript
// packages/dartmouth-core/src/services/AgentRegistry.ts
export class AgentRegistry {
  private agents: Map<string, Agent> = new Map();

  register(agent: Agent): void {
    this.agents.set(agent.id, agent);
    console.log(`Agent registered: ${agent.id}`);
  }

  unregister(agentId: string): void {
    this.agents.delete(agentId);
    console.log(`Agent unregistered: ${agentId}`);
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getAgentsByCapability(capability: string): Agent[] {
    return this.getAllAgents().filter((agent) =>
      agent.capabilities.includes(capability)
    );
  }
}
```

**Tasks:**
1. Create registry map
2. Register/unregister methods
3. Get agent by ID
4. Get all agents
5. Filter by capability

**Time:** 30 minutes

---

### **Phase 5: Health Monitoring (30 min)**

**Create `HealthMonitor.ts`:**

```typescript
// packages/dartmouth-core/src/services/HealthMonitor.ts
export class HealthMonitor {
  private agentHealth: Map<string, AgentHealth> = new Map();

  trackAgent(agentId: string): void {
    this.agentHealth.set(agentId, {
      agentId,
      status: 'healthy',
      lastCheck: Date.now(),
      uptime: 0,
      requestCount: 0,
      errorCount: 0,
    });
  }

  recordRequest(agentId: string, success: boolean): void {
    const health = this.agentHealth.get(agentId);
    if (health) {
      health.requestCount++;
      if (!success) {
        health.errorCount++;
      }
      health.lastCheck = Date.now();
    }
  }

  getStatus(): HealthStatus {
    const agents = Array.from(this.agentHealth.values());
    const healthyAgents = agents.filter((a) => a.status === 'healthy').length;
    const totalAgents = agents.length;

    return {
      status: healthyAgents === totalAgents ? 'healthy' : 'degraded',
      version: '2.0.0',
      uptime: process.uptime ? process.uptime() : 0,
      timestamp: Date.now(),
      agents: {
        total: totalAgents,
        healthy: healthyAgents,
        unhealthy: totalAgents - healthyAgents,
      },
    };
  }

  getAgentHealth(agentId: string): AgentHealth | undefined {
    return this.agentHealth.get(agentId);
  }
}
```

**Tasks:**
1. Track agent health
2. Record requests/errors
3. Get overall status
4. Get agent-specific health

**Time:** 30 minutes

---

### **Phase 6: Integration with Existing Agents (45 min)**

**Update `packages/worker/src/index.ts`:**

```typescript
// packages/worker/src/index.ts
import { DartmouthOS } from '@dartmouth/core';
import { BaseAgent } from './BaseAgent';
import { McCarthyArtworkAgent } from '@agent-army/mccarthy-artwork';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Initialize Dartmouth OS
    const dartmouth = new DartmouthOS(env);

    // Register FAM (BaseAgent)
    const famAgent = new BaseAgent({
      agentId: 'fam',
      name: 'FAM (Foundational Agent McCarthy)',
      description: 'Base conversational agent',
      capabilities: ['conversation', 'intent-detection', 'sentiment-analysis'],
      requiresAuth: false,
      env,
    });
    dartmouth.registerAgent(famAgent);

    // Register McCarthy Artwork Analyzer
    const artworkAgent = new McCarthyArtworkAgent({
      agentId: 'mccarthy-artwork',
      name: 'McCarthy Artwork Analyzer',
      description: 'DPI calculations and print preparation',
      capabilities: ['dpi-calculation', 'print-analysis', 'artwork-optimization'],
      requiresAuth: false,
      env,
    });
    dartmouth.registerAgent(artworkAgent);

    // Route request through Dartmouth OS
    return dartmouth.handleRequest(request, env);
  },
};
```

**Tasks:**
1. Initialize Dartmouth OS
2. Register FAM
3. Register Artwork Analyzer
4. Route all requests through Dartmouth
5. Test existing agents still work

**Time:** 45 minutes

---

### **Phase 7: Deploy & Test (30 min)**

**Deploy:**
```bash
cd packages/worker
npm run deploy
```

**Test:**
```bash
# Health check
curl https://agent-army-worker.dartmouth.workers.dev/health

# FAM
curl -X POST https://agent-army-worker.dartmouth.workers.dev/api/v2/agents/fam/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'

# Artwork Analyzer
curl -X POST https://agent-army-worker.dartmouth.workers.dev/api/v2/agents/mccarthy-artwork/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What size can I print 4000x6000 at 300 DPI?"}'
```

**Tasks:**
1. Deploy to Cloudflare
2. Test health endpoint
3. Test FAM
4. Test Artwork Analyzer
5. Verify routing works
6. Check logs

**Time:** 30 minutes

---

## ✅ **TODAY'S SUCCESS CRITERIA**

By end of today, we should have:

- ✅ Dartmouth OS core structure created
- ✅ API Gateway routing requests
- ✅ Agent Registry managing agents
- ✅ Health Monitoring tracking status
- ✅ FAM registered and working
- ✅ Artwork Analyzer registered and working
- ✅ Deployed to Cloudflare
- ✅ All tests passing

---

## 📊 **WEEK 2 PREVIEW (Nov 20-24)**

### **Day 1-2: Auth Service (8 hours)**
- JWT token generation
- Token verification
- User registration/login
- Password hashing
- Refresh tokens

### **Day 3-4: Voice Services (12 hours)**
- STT integration (Deepgram)
- TTS integration (F5-TTS)
- Audio streaming (WebSocket)
- VAD (Voice Activity Detection)
- Test voice flow

### **Day 5: Database Service + Testing (5 hours)**
- Database wrapper for D1
- CRUD operations
- Complete FAM testing (40 scenarios)
- Complete Artwork Analyzer testing (33 scenarios)

---

## 📊 **WEEK 3 PREVIEW (Nov 25-29)**

### **PA Agent Backend:**
- TaskHandler (CRUD)
- ReminderHandler (CRUD + scheduling)
- NoteHandler (CRUD + search)
- CalendarHandler (CRUD + integration)
- ContactHandler (CRUD)
- Voice integration
- React Native integration

---

## 🎯 **DEPENDENCIES**

### **What FAM Needs:**
- ✅ API Gateway (routing)
- ✅ Agent Registry (registration)
- ✅ Health Monitoring (tracking)
- ⏸️ Nothing else (already has everything)

### **What Artwork Analyzer Needs:**
- ✅ API Gateway (routing)
- ✅ Agent Registry (registration)
- ✅ Health Monitoring (tracking)
- ⏸️ Nothing else (already has everything)

### **What PA Agent Needs:**
- ✅ API Gateway (routing)
- ✅ Agent Registry (registration)
- ✅ Auth Service (user login)
- ✅ Voice Services (STT/TTS/streaming)
- ✅ Database Service (tasks/reminders/notes/calendar/contacts)
- ✅ Health Monitoring (tracking)

---

## 🚀 **LET'S START BUILDING!**

**Next Step:** Create `packages/dartmouth-core/` and start Phase 1

**Ready?** Let's go! 🎯

---

**Build Plan Created By:** AI Assistant  
**Date:** November 19, 2024  
**Status:** ✅ Ready to Execute - STARTING NOW

