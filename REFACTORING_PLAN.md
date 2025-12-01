# 🔨 DARTMOUTH REFACTORING PLAN

**Date:** November 18, 2025  
**Goal:** Transform current implementation into correct Dartmouth/McCarthy architecture  
**Estimated Time:** 11-15 hours

---

## 🎯 **WHY WE'RE REFACTORING**

### **Current Problem:**
The Foundational Agent has domain-specific components (artwork calculations, printing guidance) that should be in a specialized McCarthy agent.

### **Correct Architecture:**
- **Dartmouth Foundation** = Domain-agnostic orchestration layer
- **McCarthy Agents** = Specialized agents with domain knowledge

---

## 📋 **REFACTORING PHASES**

### **Phase 1: Update Documentation** ✅ 50% COMPLETE
**Time:** 30 minutes (15 min remaining)

**Completed:**
- [x] DARTMOUTH_ARCHITECTURE_CLARITY.md created
- [x] Agent Routing System defined
- [x] Agent Constraints System defined

**Remaining:**
- [ ] Update WHERE_WE_ARE_NOW.md
- [ ] Update PROJECT_STATUS.md
- [ ] Create REFACTORING_PLAN.md (this document)
- [ ] Commit all docs to GitHub

---

### **Phase 2: Refactor Foundation** 🔲 NEXT (2-3 hours)

#### **Step 2.1: Create McCarthy Artwork Package**
```bash
mkdir -p packages/mccarthy-artwork/src/{components,handlers,knowledge}
cd packages/mccarthy-artwork
npm init -y
```

**Files to create:**
- `packages/mccarthy-artwork/package.json`
- `packages/mccarthy-artwork/tsconfig.json`
- `packages/mccarthy-artwork/src/index.ts`
- `packages/mccarthy-artwork/src/McCarthyArtworkAgent.ts`

---

#### **Step 2.2: Move Components**

**Move CalculationEngine:**
```
FROM: packages/worker/src/components/CalculationEngine.ts
TO:   packages/mccarthy-artwork/src/components/CalculationEngine.ts
```

**Update imports in:**
- Remove from BaseAgent
- Add to McCarthyArtworkAgent

---

#### **Step 2.3: Move Handlers**

**Move CalculationHandler:**
```
FROM: packages/worker/src/handlers/CalculationHandler.ts
TO:   packages/mccarthy-artwork/src/handlers/CalculationHandler.ts
```

**Move HowToHandler:**
```
FROM: packages/worker/src/handlers/HowToHandler.ts
TO:   packages/mccarthy-artwork/src/handlers/HowToHandler.ts
```

**Move InformationHandler:**
```
FROM: packages/worker/src/handlers/InformationHandler.ts
TO:   packages/mccarthy-artwork/src/handlers/InformationHandler.ts
```

**Update handler index:**
```
FROM: packages/worker/src/handlers/index.ts
- Remove exports for moved handlers
- Keep: GreetingHandler, FallbackHandler, RepeatHandler, FrustrationHandlerImpl
```

---

#### **Step 2.4: Update BaseAgent**

**File:** `packages/worker/src/BaseAgent.ts`

**Remove:**
```typescript
// Remove import
import { CalculationEngine } from './components/CalculationEngine';

// Remove from constructor
this.calculationEngine = new CalculationEngine();

// Remove from handler registration
import { CalculationHandler, HowToHandler, InformationHandler } from './handlers';
this.responseRouter.registerHandler(new CalculationHandler(this.calculationEngine));
this.responseRouter.registerHandler(new HowToHandler(this.ragEngine));
this.responseRouter.registerHandler(new InformationHandler(this.ragEngine));
```

**Keep:**
```typescript
// Keep these handlers
import { GreetingHandler, FallbackHandler, RepeatHandler, FrustrationHandlerImpl } from './handlers';
this.responseRouter.registerHandler(new GreetingHandler());
this.responseRouter.registerHandler(new FallbackHandler());
this.responseRouter.registerHandler(new RepeatHandler(this.repetitionDetector));
this.responseRouter.registerHandler(new FrustrationHandlerImpl(this.frustrationHandler));
```

---

#### **Step 2.5: Update Tests**

**Move test files:**
```
FROM: packages/worker/src/handlers/__tests__/CalculationHandler.test.ts
TO:   packages/mccarthy-artwork/src/handlers/__tests__/CalculationHandler.test.ts
```

**Update BaseAgent tests:**
- Remove tests for moved handlers
- Keep foundation component tests
- Update integration tests to use McCarthy Artwork

---

### **Phase 3: Build Agent Orchestration** 🔲 PENDING (3-4 hours)

#### **Step 3.1: Create AgentRouter**

**File:** `packages/worker/src/services/AgentRouter.ts`

```typescript
export class AgentRouter {
  private registry: AgentRegistry;
  private orchestrator: AgentOrchestrator;
  
  constructor(registry: AgentRegistry, orchestrator: AgentOrchestrator) {
    this.registry = registry;
    this.orchestrator = orchestrator;
  }
  
  async routeToAgent(
    intent: Intent, 
    context: HandlerContext
  ): Promise<Response> {
    // Find capable agents
    const agents = this.registry.findCapableAgents(intent);
    
    if (agents.length === 0) {
      return this.handleNoAgentAvailable(intent);
    }
    
    if (agents.length === 1) {
      // Single agent handles it
      return await agents[0].handle(intent, context);
    }
    
    // Multiple agents - orchestrate collaboration
    return await this.orchestrator.collaborate(agents, intent, context);
  }
  
  private handleNoAgentAvailable(intent: Intent): Response {
    return {
      content: `I can help with general questions, but for ${intent.type} 
                tasks, you'll need a specialized McCarthy agent (coming soon!)`,
      metadata: {
        handlerName: 'ComingSoonHandler',
        agentNeeded: this.suggestAgentType(intent)
      }
    };
  }
}
```

---

#### **Step 3.2: Create AgentRegistry**

**File:** `packages/worker/src/services/AgentRegistry.ts`

```typescript
export class AgentRegistry {
  private agents: Map<string, McCarthyAgent> = new Map();
  
  registerAgent(agent: McCarthyAgent): void {
    this.agents.set(agent.type, agent);
  }
  
  getAgent(agentType: string): McCarthyAgent | null {
    return this.agents.get(agentType) || null;
  }
  
  findCapableAgents(intent: Intent): McCarthyAgent[] {
    return Array.from(this.agents.values()).filter(agent =>
      agent.canHandle(intent) || agent.canContribute(intent)
    );
  }
  
  listAgents(): McCarthyAgent[] {
    return Array.from(this.agents.values());
  }
  
  isAgentAvailable(agentType: string): boolean {
    return this.agents.has(agentType);
  }
}
```

---

#### **Step 3.3: Create AgentOrchestrator**

**File:** `packages/worker/src/services/AgentOrchestrator.ts`

```typescript
export class AgentOrchestrator {
  async collaborate(
    agents: McCarthyAgent[],
    intent: Intent,
    context: HandlerContext
  ): Promise<Response> {
    // Determine collaboration strategy
    const strategy = this.planCollaboration(agents, intent);
    
    switch (strategy.type) {
      case 'sequential':
        return await this.sequentialCollaboration(agents, intent, context);
      case 'parallel':
        return await this.parallelCollaboration(agents, intent, context);
      case 'hierarchical':
        return await this.hierarchicalCollaboration(agents, intent, context);
    }
  }
  
  private async sequentialCollaboration(
    agents: McCarthyAgent[],
    intent: Intent,
    context: HandlerContext
  ): Promise<Response> {
    const [primary, ...support] = agents;
    
    // Primary agent identifies needs
    const needs = await primary.assessNeeds(intent);
    
    // Support agents provide information
    const supportInfo = await Promise.all(
      support.map(agent => agent.provide(needs, context))
    );
    
    // Primary agent synthesizes response
    return await primary.synthesize(intent, supportInfo, context);
  }
}
```

---

#### **Step 3.4: Create ConstraintsValidator**

**File:** `packages/worker/src/services/ConstraintsValidator.ts`

```typescript
export class ConstraintsValidator {
  async validate(
    response: string,
    agent: McCarthyAgent,
    context: HandlerContext
  ): Promise<ValidationResult> {
    const violations: Violation[] = [];
    
    // Check global constraints
    violations.push(...this.checkGlobalConstraints(response));
    
    // Check tenant constraints
    violations.push(...this.checkTenantConstraints(response, context.tenantId));
    
    // Check agent constraints
    violations.push(...this.checkAgentConstraints(response, agent));
    
    if (violations.length > 0) {
      return {
        passed: false,
        violations,
        action: 'regenerate',
        suggestedResponse: this.generateCompliantResponse(response, violations)
      };
    }
    
    return { passed: true };
  }
  
  private checkGlobalConstraints(response: string): Violation[] {
    const violations: Violation[] = [];
    const forbiddenPhrases = [
      "I'll get back to you later",
      "I don't know",
      "That's not my department",
    ];
    
    for (const phrase of forbiddenPhrases) {
      if (response.toLowerCase().includes(phrase.toLowerCase())) {
        violations.push({
          type: 'forbidden_phrase',
          phrase,
          severity: 'high'
        });
      }
    }
    
    return violations;
  }
}
```

---

### **Phase 4: Build McCarthy Artwork Agent** 🔲 PENDING (2-3 hours)

#### **Step 4.1: Create McCarthyArtworkAgent**

**File:** `packages/mccarthy-artwork/src/McCarthyArtworkAgent.ts`

```typescript
import { BaseAgent } from '@agent-army/worker/BaseAgent';
import { CalculationEngine } from './components/CalculationEngine';
import { CalculationHandler } from './handlers/CalculationHandler';
import { HowToHandler } from './handlers/HowToHandler';
import { InformationHandler } from './handlers/InformationHandler';

export class McCarthyArtworkAgent extends BaseAgent {
  type = 'artwork_analyzer';
  name = 'McCarthy Artwork Analyzer';
  version = '1.0.0';
  
  private calculationEngine: CalculationEngine;
  
  constructor(config: AgentConfig) {
    super(config);
    
    // Add artwork-specific components
    this.calculationEngine = new CalculationEngine();
    
    // Register artwork-specific handlers
    this.registerHandler(new CalculationHandler(this.calculationEngine));
    this.registerHandler(new HowToHandler(this.ragEngine));
    this.registerHandler(new InformationHandler(this.ragEngine));
    
    // Load DTF knowledge base
    this.loadKnowledgeBase();
  }
  
  canHandle(intent: Intent): boolean {
    return ['calculation', 'howto', 'information'].includes(intent.type);
  }
  
  canContribute(intent: Intent): boolean {
    // Can provide artwork expertise to other agents
    return intent.requiresArtworkKnowledge === true;
  }
  
  async assessNeeds(intent: Intent): Promise<InformationNeeds> {
    // What information does this agent need from others?
    return {
      needsPricing: intent.type === 'quote',
      needsInventory: intent.type === 'availability',
    };
  }
  
  async provide(needs: InformationNeeds, context: HandlerContext): Promise<any> {
    // Provide artwork expertise to other agents
    if (needs.artworkAnalysis) {
      return await this.analyzeArtwork(context.artwork);
    }
    if (needs.printQuality) {
      return await this.assessPrintQuality(context.dimensions);
    }
    return null;
  }
  
  private async loadKnowledgeBase(): Promise<void> {
    // Load DTF/UV DTF requirements into RAG
    const documents = [
      { path: './knowledge/dtf-requirements.md', type: 'dtf' },
      { path: './knowledge/uv-dtf-requirements.md', type: 'uv-dtf' },
    ];
    
    for (const doc of documents) {
      await this.ragEngine.ingestDocument(doc.path, this.agentId);
    }
  }
}
```

---

#### **Step 4.2: Configure Constraints**

**File:** `packages/mccarthy-artwork/src/constraints.ts`

```typescript
export const ARTWORK_AGENT_CONSTRAINTS: AgentConstraints = {
  forbiddenActions: [
    'offer_discount',
    'offer_refund',
    'quote_pricing',
    'promise_delivery_date',
  ],
  
  forbiddenPhrases: [
    'it will cost',
    'the price is',
    'I can give you a discount',
  ],
  
  requiredResponses: [
    {
      trigger: 'how much|price|cost|quote',
      requiredResponse: 'I can help with the technical artwork requirements. For pricing, let me connect you with our sales team.',
      cannotSay: ['it will cost', 'the price is']
    },
    {
      trigger: 'when will it be ready|delivery date',
      requiredResponse: 'I can analyze your artwork, but for production timelines, let me connect you with our production team.',
      cannotSay: ['it will be ready', 'delivery date is']
    }
  ]
};
```

---

#### **Step 4.3: Add Knowledge Base**

**File:** `packages/mccarthy-artwork/src/knowledge/dtf-requirements.md`

```markdown
# DTF Printing Requirements

## Resolution Requirements
- Minimum: 250 DPI
- Recommended: 300 DPI
- Optimal: 300-600 DPI

## Color Mode
- Required: CMYK or RGB
- Profile: sRGB IEC61966-2.1 (for RGB)

## File Formats
- Preferred: PNG, TIFF, PDF
- Accepted: JPG (high quality)
- Vector: AI, EPS, PDF

## Transparency
- Alpha channel supported
- No semi-transparent pixels
- 100% opaque or 100% transparent

... (full DTF requirements)
```

---

### **Phase 5: Integration & Testing** 🔲 PENDING (2-3 hours)

#### **Step 5.1: Register McCarthy Artwork**

**File:** `packages/worker/src/index.ts`

```typescript
import { McCarthyArtworkAgent } from '@agent-army/mccarthy-artwork';

// Initialize registry
const registry = new AgentRegistry();

// Register McCarthy Artwork Analyzer
const artworkAgent = new McCarthyArtworkAgent({
  agentId: 'mccarthy-artwork',
  tenantId: context.tenantId,
  agentConfig: artworkAgentConfig,
  env: context.env
});

registry.registerAgent(artworkAgent);

// Initialize router with registry
const router = new AgentRouter(registry, orchestrator);

// Update BaseAgent to use router
baseAgent.setAgentRouter(router);
```

---

#### **Step 5.2: Write Integration Tests**

**File:** `packages/worker/src/__tests__/integration/agent-routing.test.ts`

```typescript
describe('Agent Routing Integration', () => {
  test('routes artwork questions to McCarthy Artwork', async () => {
    const message = 'What size can I print 4000x6000 at 300 DPI?';
    const response = await baseAgent.processMessage(message, sessionId);
    
    expect(response.metadata.agentType).toBe('artwork_analyzer');
    expect(response.content).toContain('13.33');
  });
  
  test('routes general questions to foundation', async () => {
    const message = 'Hello!';
    const response = await baseAgent.processMessage(message, sessionId);
    
    expect(response.metadata.handlerName).toBe('GreetingHandler');
  });
  
  test('enforces constraints on McCarthy Artwork', async () => {
    const message = 'How much does it cost?';
    const response = await baseAgent.processMessage(message, sessionId);
    
    expect(response.content).not.toContain('it will cost');
    expect(response.content).toContain('sales team');
  });
});
```

---

### **Phase 6: Deploy & Validate** 🔲 PENDING (1 hour)

#### **Step 6.1: Build & Deploy**

```bash
# Build McCarthy Artwork package
cd packages/mccarthy-artwork
npm run build

# Build worker with new architecture
cd ../worker
npm run build

# Deploy to Cloudflare
npx wrangler deploy
```

---

#### **Step 6.2: Test on Production**

```bash
# Test health endpoint
curl https://agent-army-worker.dartmouth.workers.dev/health

# Test artwork question (should route to McCarthy Artwork)
curl -X POST https://agent-army-worker.dartmouth.workers.dev/test/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What size can I print 4000x6000 at 300 DPI?"}'

# Test general question (should use foundation)
curl -X POST https://agent-army-worker.dartmouth.workers.dev/test/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello!"}'
```

---

## 📊 **PROGRESS TRACKING**

### **Checklist:**
- [ ] Phase 1: Documentation (50% complete)
- [ ] Phase 2: Refactor Foundation
- [ ] Phase 3: Agent Orchestration
- [ ] Phase 4: McCarthy Artwork
- [ ] Phase 5: Integration & Testing
- [ ] Phase 6: Deploy & Validate

### **Estimated Timeline:**
- Phase 1: 15 minutes remaining
- Phase 2: 2-3 hours
- Phase 3: 3-4 hours
- Phase 4: 2-3 hours
- Phase 5: 2-3 hours
- Phase 6: 1 hour

**Total:** 11-15 hours

---

## 🎯 **SUCCESS CRITERIA**

**Refactoring is complete when:**
1. ✅ Foundation has no domain-specific code
2. ✅ McCarthy Artwork handles all artwork questions
3. ✅ Agent routing works correctly
4. ✅ Multi-agent collaboration works
5. ✅ Constraints are enforced
6. ✅ All tests pass
7. ✅ Deployed to production
8. ✅ Test interface works

---

## 🚀 **READY TO START**

**Next Action:** Finish documentation, then start Phase 2 (Refactoring)

**Question:** Should I proceed with finishing docs and then start refactoring?

