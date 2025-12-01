# 🎓 DARTMOUTH ARCHITECTURE - COMPLETE CLARITY

**Date:** November 18, 2025  
**Status:** Architecture Defined - Ready for Refactoring

---

## 🎯 **WHAT IS DARTMOUTH?**

**Dartmouth is the PLATFORM, ORCHESTRATOR, and DASHBOARD** for an army of specialized AI agents.

### **Named After:**
The 1956 Dartmouth Conference - birthplace of Artificial Intelligence

### **Core Purpose:**
Help small businesses automate, systemize, and grow by deploying specialized "McCarthy" AI agents that work together in harmony.

---

## 🏗️ **THE ARCHITECTURE**

```
┌────────────────────────────────────────────────────────────┐
│                        DARTMOUTH                            │
│          (Platform / Orchestrator / Dashboard)              │
│                                                             │
│  USER FUNCTIONS:                                            │
│  • Create & Configure McCarthy Agents                       │
│  • Manage Knowledge Bases                                   │
│  • Connect Agents Together                                  │
│  • Monitor Performance                                      │
│  • Billing & Authentication                                 │
│                                                             │
│  FOUNDATIONAL AGENT (Base Layer):                           │
│  ✅ ConversationStateManager - Track conversations          │
│  ✅ IntentDetector - Understand user intent                 │
│  ✅ ResponseRouter - Route to McCarthy agents               │
│  ✅ ResponseValidator - Ensure quality                      │
│  ✅ MemorySystem - Remember everything                      │
│  ✅ RAGEngine - Knowledge retrieval                         │
│  ✅ RepetitionDetector - Prevent loops                      │
│  ✅ FrustrationHandler - Empathetic responses               │
│  ✅ FocusManager - UI management                            │
│                                                             │
│  BASIC HANDLERS (Non-domain-specific):                      │
│  ✅ GreetingHandler - Welcome users                         │
│  ✅ FallbackHandler - Handle unknowns                       │
│  ✅ RepeatHandler - Handle repetition                       │
│  ✅ FrustrationHandler - Handle frustration                 │
│                                                             │
│  NEW COMPONENTS NEEDED:                                     │
│  ⚠️  AgentRouter - Route to McCarthy agents                 │
│  ⚠️  AgentRegistry - Register available agents              │
│  ⚠️  AgentOrchestrator - Multi-agent workflows              │
└────────────────────────────────────────────────────────────┘
                           │
                           │ Routes to
                           ▼
┌────────────────────────────────────────────────────────────┐
│                    McCARTHY AGENTS                          │
│              (Specialized Super Agents)                     │
│                                                             │
│  Each McCarthy agent:                                       │
│  • Built on Dartmouth foundation                            │
│  • Has specific skill sets                                  │
│  • Has domain knowledge                                     │
│  • Works independently OR collaboratively                   │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │  McCarthy Artwork Analyzer                    │          │
│  │  • CalculationEngine (DPI, sizes)             │          │
│  │  • DTF/UV DTF Knowledge Base                  │          │
│  │  • Image Analysis                             │          │
│  │  • CalculationHandler                         │          │
│  │  • HowToHandler (printing guidance)           │          │
│  │  • InformationHandler (printing info)         │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │  McCarthy Content Researcher                  │          │
│  │  • Web Search Integration                     │          │
│  │  • Content Analysis                           │          │
│  │  • Source Validation                          │          │
│  │  • Research Knowledge Base                    │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │  McCarthy Content Librarian                   │          │
│  │  • Information Management                     │          │
│  │  • Content Organization                       │          │
│  │  • Search & Retrieval                         │          │
│  │  • Tagging & Categorization                   │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │  McCarthy Copywriter                          │          │
│  │  • Email Writing                              │          │
│  │  • Article Writing                            │          │
│  │  • Social Post Creation                       │          │
│  │  • Ad Copy Generation                         │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │  McCarthy Content Publisher                   │          │
│  │  • Post Scheduling                            │          │
│  │  • Multi-platform Publishing                  │          │
│  │  • Analytics Tracking                         │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │  McCarthy Customer Service                    │          │
│  │  • Ticket Management                          │          │
│  │  • Order Lookup                               │          │
│  │  • Refund Processing                          │          │
│  │  • Support Knowledge Base                     │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │  McCarthy Personal Assistant (PA)             │          │
│  │  • Task Management                            │          │
│  │  • Calendar & Scheduling                      │          │
│  │  • Email Management                           │          │
│  │  • Reminders & Follow-ups                     │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │  McCarthy Web Browser Automation              │          │
│  │  • Web Scraping                               │          │
│  │  • Form Filling                               │          │
│  │  • Data Extraction                            │          │
│  │  • Automated Testing                          │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  ... UNLIMITED MORE McCARTHY AGENTS ...                     │
└────────────────────────────────────────────────────────────┘
```

---

## 🎯 **THE END GOAL**

**Dartmouth helps small businesses who:**
- ❌ Don't have time for everything
- ❌ Are wearing too many hats
- ❌ Have things slipping through the cracks
- ❌ Lack specialized skills
- ❌ Lack resources to hire staff
- ❌ Lack finances for full-time employees

**By providing:**
- ✅ Modular McCarthy agents for specific tasks
- ✅ Easy configuration without coding
- ✅ Agents that work together in harmony
- ✅ Better efficiency and performance
- ✅ Better customer experience
- ✅ Business growth without hiring

---

## 🔧 **WHAT'S WRONG WITH CURRENT IMPLEMENTATION**

### **Problem:**
The Foundational Agent has domain-specific components that belong in McCarthy agents:

❌ **CalculationEngine** - Artwork-specific (should be in McCarthy Artwork Analyzer)  
❌ **CalculationHandler** - Artwork-specific (should be in McCarthy Artwork Analyzer)  
❌ **HowToHandler** - Domain-specific (should be in specialized McCarthy agents)  
❌ **InformationHandler** - Domain-specific (should be in specialized McCarthy agents)

### **Why This is Wrong:**
- The Foundational Agent should be **domain-agnostic**
- It's a **base layer** that all McCarthy agents are built on
- It should **route** to specialists, not BE a specialist
- Domain knowledge belongs in McCarthy agents, not Dartmouth

---

## ✅ **WHAT THE FOUNDATIONAL AGENT SHOULD DO**

### **Core Responsibilities:**

1. **Conversation Management**
   - Track conversation state
   - Manage message history
   - Maintain context across sessions

2. **Intent Detection & Routing**
   - Detect what user wants
   - Route to appropriate McCarthy agent
   - Handle multi-agent workflows

3. **Memory Management**
   - Short-term memory (current session)
   - Long-term memory (across sessions)
   - Semantic memory (learned facts)
   - Episodic memory (past interactions)

4. **Quality Assurance**
   - Repetition detection
   - Frustration handling
   - Response validation
   - Zero hallucination enforcement

5. **Basic Conversation**
   - Greetings & farewells
   - Fallback for unknowns
   - Handle repetition
   - Handle frustration

6. **Agent Orchestration** (NEW)
   - Route to McCarthy agents
   - Coordinate multi-agent workflows
   - Manage agent registry

### **What it should NOT do:**
❌ Domain-specific tasks (artwork, content, customer service, etc.)  
❌ Specialized calculations  
❌ Technical guidance  
❌ Industry-specific knowledge

---

## 🔨 **REFACTORING PLAN**

### **Phase 1: Remove Domain-Specific Components**

**Remove from Foundational Agent:**
1. ❌ `CalculationEngine.ts` → Move to McCarthy Artwork Analyzer
2. ❌ `CalculationHandler.ts` → Move to McCarthy Artwork Analyzer
3. ❌ `HowToHandler.ts` → Move to McCarthy agents (domain-specific)
4. ❌ `InformationHandler.ts` → Move to McCarthy agents (domain-specific)

**Keep in Foundational Agent:**
1. ✅ `ConversationStateManager.ts`
2. ✅ `IntentDetector.ts`
3. ✅ `ResponseRouter.ts`
4. ✅ `ResponseValidator.ts`
5. ✅ `MemorySystem.ts`
6. ✅ `RAGEngine.ts`
7. ✅ `RepetitionDetector.ts`
8. ✅ `FrustrationHandler.ts`
9. ✅ `FocusManager.ts`
10. ✅ `GreetingHandler.ts`
11. ✅ `FallbackHandler.ts`
12. ✅ `RepeatHandler.ts`
13. ✅ `FrustrationHandlerImpl.ts`

---

### **Phase 2: Add Agent Routing System**

**New Components to Build:**

1. **AgentRouter** (`src/services/AgentRouter.ts`)
   ```typescript
   class AgentRouter {
     // Route intent to appropriate McCarthy agent
     async routeToAgent(intent: Intent, context: Context): Promise<Response>
     
     // Check if agent is available
     isAgentAvailable(agentType: string): boolean
     
     // Get agent capabilities
     getAgentCapabilities(agentType: string): Capability[]
   }
   ```

2. **AgentRegistry** (`src/services/AgentRegistry.ts`)
   ```typescript
   class AgentRegistry {
     // Register a McCarthy agent
     registerAgent(agent: McCarthyAgent): void
     
     // Get agent by type
     getAgent(agentType: string): McCarthyAgent | null
     
     // List all available agents
     listAgents(): McCarthyAgent[]
     
     // Check agent status
     getAgentStatus(agentType: string): AgentStatus
   }
   ```

3. **AgentOrchestrator** (`src/services/AgentOrchestrator.ts`)
   ```typescript
   class AgentOrchestrator {
     // Coordinate multi-agent workflows
     async orchestrateWorkflow(workflow: Workflow): Promise<WorkflowResult>
     
     // Handle agent-to-agent communication
     async routeBetweenAgents(from: string, to: string, message: Message): Promise<Response>
     
     // Manage agent dependencies
     resolveAgentDependencies(agentType: string): string[]
   }
   ```

4. **"Coming Soon" Handler** (`src/handlers/ComingSoonHandler.ts`)
   ```typescript
   class ComingSoonHandler implements Handler {
     // Handle requests for agents that don't exist yet
     async handle(intent: Intent, context: Context): Promise<Response> {
       return {
         content: "I can help with general questions, but for [specific task], 
                   you'll need our McCarthy [Agent Name] (coming soon!)",
         metadata: { handlerName: 'ComingSoonHandler' }
       }
     }
   }
   ```

---

### **Phase 3: Create McCarthy Artwork Analyzer**

**New Package:** `packages/mccarthy-artwork/`

**Structure:**
```
packages/mccarthy-artwork/
├── src/
│   ├── components/
│   │   └── CalculationEngine.ts      (moved from foundation)
│   ├── handlers/
│   │   ├── CalculationHandler.ts     (moved from foundation)
│   │   ├── HowToHandler.ts           (moved from foundation)
│   │   └── InformationHandler.ts     (moved from foundation)
│   ├── knowledge/
│   │   ├── dtf-requirements.md
│   │   └── uv-dtf-requirements.md
│   ├── McCarthyArtworkAgent.ts       (main class)
│   └── index.ts
├── package.json
└── tsconfig.json
```

**McCarthyArtworkAgent:**
```typescript
class McCarthyArtworkAgent extends BaseAgent {
  private calculationEngine: CalculationEngine
  
  constructor(config: AgentConfig) {
    super(config)  // Inherit from Dartmouth foundation
    
    // Add artwork-specific components
    this.calculationEngine = new CalculationEngine()
    
    // Register artwork-specific handlers
    this.registerHandler(new CalculationHandler(this.calculationEngine))
    this.registerHandler(new HowToHandler(this.ragEngine))
    this.registerHandler(new InformationHandler(this.ragEngine))
  }
  
  // Artwork-specific methods
  async analyzeArtwork(image: File): Promise<ArtworkAnalysis>
  async calculatePrintSize(params: CalculationParams): Promise<CalculationResult>
  async providePrintingGuidance(topic: string): Promise<string>
}
```

---

### **Phase 4: Update BaseAgent**

**Modified BaseAgent Flow:**
```typescript
class BaseAgent {
  async processMessage(message: string, sessionId: string): Promise<Response> {
    // 1. Load session
    const state = await this.stateManager.loadSession(sessionId)
    
    // 2. Detect intent
    const intent = await this.intentDetector.detect(message, state)
    
    // 3. Check for repetition/frustration
    const repetition = this.repetitionDetector.detect(message, state)
    const frustration = this.frustrationHandler.detect(message, state)
    
    // 4. Route to handler OR McCarthy agent
    let response
    
    if (this.canHandleLocally(intent)) {
      // Handle with basic handlers (greeting, fallback, etc.)
      response = await this.responseRouter.route(message, intent, context)
    } else {
      // Route to McCarthy agent
      response = await this.agentRouter.routeToAgent(intent, context)
    }
    
    // 5. Validate response
    const validation = await this.responseValidator.validate(response)
    
    // 6. Update state & memory
    await this.stateManager.saveSession(state)
    await this.memorySystem.consolidate(sessionId)
    
    return response
  }
  
  private canHandleLocally(intent: Intent): boolean {
    // Only handle non-domain-specific intents
    return ['greeting', 'farewell', 'repeat', 'frustration', 'unknown'].includes(intent.type)
  }
}
```

---

## 📊 **COMPARISON: BEFORE vs AFTER**

### **BEFORE (Current - Wrong):**
```
User: "What size can I print 4000x6000 at 300 DPI?"
  ↓
Dartmouth BaseAgent
  ↓
IntentDetector → "calculation"
  ↓
CalculationHandler (IN FOUNDATION - WRONG!)
  ↓
CalculationEngine (IN FOUNDATION - WRONG!)
  ↓
Returns calculation
```

### **AFTER (Correct):**
```
User: "What size can I print 4000x6000 at 300 DPI?"
  ↓
Dartmouth BaseAgent
  ↓
IntentDetector → "calculation"
  ↓
AgentRouter → "This needs McCarthy Artwork Analyzer"
  ↓
McCarthy Artwork Analyzer
  ↓
CalculationHandler (IN McCARTHY - CORRECT!)
  ↓
CalculationEngine (IN McCARTHY - CORRECT!)
  ↓
Returns calculation
```

---

## 🎯 **SUCCESS CRITERIA**

**Dartmouth Foundational Agent is correct when:**
1. ✅ It has NO domain-specific knowledge
2. ✅ It routes to McCarthy agents for specialized tasks
3. ✅ It handles only basic conversation (greetings, fallback, etc.)
4. ✅ It orchestrates multi-agent workflows
5. ✅ It provides the foundation ALL McCarthy agents are built on

**McCarthy Agents are correct when:**
1. ✅ They inherit from Dartmouth foundation
2. ✅ They add domain-specific components
3. ✅ They have specialized knowledge bases
4. ✅ They can work independently OR collaboratively
5. ✅ They are managed through Dartmouth dashboard

---

## 📝 **NEXT STEPS**

1. **Discuss & Confirm** - Make sure this architecture is correct
2. **Refactor Foundation** - Remove domain-specific components
3. **Add Agent Routing** - Build AgentRouter, AgentRegistry, AgentOrchestrator
4. **Create McCarthy Artwork** - First specialized agent
5. **Test Architecture** - Verify routing works correctly
6. **Update Documentation** - Reflect new architecture

---

**Is this architecture correct? Should we proceed with the refactoring?** 🎯

