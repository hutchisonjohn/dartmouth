# 🎯 FAM - Foundational Agent McCarthy
## Complete Technical Specification

**Version:** 2.0.0  
**Date:** November 19, 2024  
**Status:** Production Ready  
**Purpose:** The universal foundation for all McCarthy AI agents  
**Runs On:** DARTMOUTH OS (The Operating System for AI Agents)

---

## 📖 TABLE OF CONTENTS

1. [What is FAM?](#what-is-fam)
2. [Architecture Overview](#architecture-overview)
3. [Core Components](#core-components)
4. [Capabilities](#capabilities)
5. [System Prompt](#system-prompt)
6. [Technical Implementation](#technical-implementation)
7. [API Specification](#api-specification)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Building Specialized Agents](#building-specialized-agents)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 **WHAT IS FAM?**

### **Definition**

**FAM (Foundational Agent McCarthy)** is the core conversational AI framework that provides essential capabilities for all McCarthy agents. It is domain-agnostic, containing NO specialized knowledge or features.

### **Purpose**

FAM serves as the **universal template** from which all specialized McCarthy agents are built. Every McCarthy agent (Artwork Analyzer, Lead Scraper, Copywriter, etc.) inherits FAM's capabilities and adds their own specialized features on top.

### **Key Characteristics**

- ✅ **Domain-Agnostic** - No specialized knowledge
- ✅ **Conversational** - Natural, human-like interactions
- ✅ **Context-Aware** - Remembers conversation history
- ✅ **Constraint-Enforced** - Business rules compliance
- ✅ **Quality-Validated** - Response quality checks
- ✅ **Production-Ready** - Battle-tested and reliable

---

## 🏗️ **ARCHITECTURE OVERVIEW**

### **The Big Picture: FAM runs ON Dartmouth OS**

```
╔═══════════════════════════════════════════════════════════════╗
║                    DARTMOUTH OS & HEART                        ║
║          (Analytics, Cache, Security, Integrations)            ║
╚═══════════════════════════════════════════════════════════════╝
         │
         │ Provides Platform Services (like an OS)
         │
    ┌────▼──────────────────────────────────────────────┐
    │                                                    │
    │             FAM (BaseAgent)                        │
    │       Foundational Agent McCarthy                  │
    │                                                    │
    │  ┌───────────────────────────────────────┐        │
    │  │   14 Agent-Level Components           │        │
    │  │   (Lightweight, Fast, Focused)        │        │
    │  └───────────────────────────────────────┘        │
    │                                                    │
    └────────────────────────────────────────────────────┘
```

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    FAM (BaseAgent)                          │
│              Foundational Agent McCarthy                     │
│                    14 COMPONENTS                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ 1. Conversation  │  │ 2. Intent        │               │
│  │ State Manager    │  │ Detector         │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ 3. Response      │  │ 4. Handler       │               │
│  │ Router           │  │ Registry         │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ 5. Constraint    │  │ 6. LLM           │               │
│  │ Validator        │  │ Service          │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ 7. Memory        │  │ 8. Sentiment     │               │
│  │ System           │  │ Analyzer         │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ 9. Personality   │  │ 10. Context      │               │
│  │ Engine           │  │ Window Manager   │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ 11. Frustration  │  │ 12. Response     │               │
│  │ Handler          │  │ Validator        │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ 13. Quality      │  │ 14. RAG          │               │
│  │ Validator        │  │ Infrastructure   │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         │
         │ Calls Dartmouth OS Services
         │
         ▼
    dartmouth.analytics.track()
    dartmouth.cache.get()
    dartmouth.security.scan()
    dartmouth.integrations.crm.sync()
    etc.
```

### **What FAM Does NOT Include**

FAM is **LEAN** and focused. Infrastructure is handled by Dartmouth OS:

- ❌ **NO Analytics** (Dartmouth provides)
- ❌ **NO Global Caching** (Dartmouth provides)
- ❌ **NO Authentication** (Dartmouth provides)
- ❌ **NO External Integrations** (Dartmouth provides)
- ❌ **NO Multi-Language Translation** (Dartmouth provides)
- ❌ **NO Cross-Agent Learning** (Dartmouth provides)
- ❌ **NO SLA Monitoring** (Dartmouth provides)
- ❌ **NO Event System** (Dartmouth provides)

**FAM stays lightweight, fast, and focused on conversation!** ⚡

### **Technology Stack**

- **Runs On:** DARTMOUTH OS (Cloudflare Workers)
- **Language:** TypeScript
- **LLM:** OpenAI GPT-4o-mini (via Dartmouth)
- **Database:** D1 (via Dartmouth)
- **Cache:** KV (via Dartmouth)
- **Deployment:** Cloudflare Workers

---

## 🧩 **CORE COMPONENTS**

### **1. Conversation State Manager**

**Purpose:** Tracks conversation state across multiple turns

**Capabilities:**
- Session management
- Message history tracking
- Topic tracking
- Question/answer logging
- User preference storage
- Conversation metadata

**Key Methods:**
```typescript
- addMessage(role, content, metadata)
- getLastNMessages(n)
- updateUserPreferences(prefs)
- trackTopic(topic)
- getConversationLength()
```

---

### **2. Intent Detector**

**Purpose:** Identifies what the user wants from their message

**Supported Intents:**
- `greeting` - Hello, hi, good morning
- `farewell` - Goodbye, bye, see you later
- `information` - Questions, information requests
- `followup` - Follow-up questions with context
- `unknown` - Unclassified intents (route to LLM)
- `frustration` - User frustration indicators

**Key Features:**
- Pattern matching with regex
- Context-aware classification
- Confidence scoring
- Entity extraction
- Multi-intent detection

---

### **3. Response Router**

**Purpose:** Routes intents to appropriate handlers

**Routing Logic:**
```typescript
greeting → GreetingHandler
farewell → FarewellHandler
information → InformationHandler
followup → LLMFallback
frustration → FrustrationHandler
unknown → LLMFallback
```

**Features:**
- Dynamic handler registration
- Fallback mechanisms
- Error handling
- Response logging

---

### **4. Handler Registry**

**Purpose:** Manages all available handlers

**Core Handlers:**
- **GreetingHandler** - Warm, friendly greetings
- **FarewellHandler** - Polite goodbyes
- **InformationHandler** - General information requests
- **FrustrationHandler** - Empathetic frustration responses
- **LLMFallback** - General conversational fallback

**Handler Interface:**
```typescript
interface Handler {
  canHandle(intent: Intent): boolean;
  handle(message: string, context: HandlerContext): Promise<Response>;
}
```

---

### **5. Constraint Validator**

**Purpose:** Enforces business rules and constraints

**Core Constraints:**
- ❌ No pricing information
- ❌ No discounts or promotions
- ❌ No refunds or returns processing
- ❌ No unauthorized commitments
- ❌ No legal/medical advice

**Validation Process:**
```
1. Check user message for constraint triggers
2. Check agent response for violations
3. If violation detected:
   - Use custom suggestedResponse
   - Or use generic fallback
4. Return validated/corrected response
```

---

### **6. LLM Service**

**Purpose:** Interface with Large Language Models

**Supported Providers:**
- OpenAI (GPT-4o-mini, GPT-4, etc.)
- Anthropic (Claude)
- Google (Gemini)

**Features:**
- Conversation history integration
- System prompt injection
- Constraint enforcement
- Streaming support (future)
- Error handling and retries

**Key Methods:**
```typescript
- generate(messages, systemPrompt, constraints)
- validateApiKey()
- estimateTokens()
```

---

### **7. Memory System**

**Purpose:** Store and recall information across conversations

**Memory Types:**
- **Short-term** - Current session (names, preferences)
- **Long-term** - Across sessions (user profile)
- **Working** - Immediate context (last 5-10 messages)

**Storage:**
- Session state (in-memory, session-level)
- User preferences (tracked in conversation state)
- Conversation history (tracked in conversation state)

**Key Methods:**
```typescript
- rememberFact(key, value)
- recallFact(key)
- getUserPreference(key)
- setUserPreference(key, value)
```

---

### **8. Sentiment Analyzer** ⭐ NEW

**Purpose:** Centralized emotional intelligence for the agent

**Capabilities:**
- **Sentiment Detection:** Positive, Negative, Neutral
- **Emotion Classification:** Joy, Anger, Frustration, Confusion, Excitement, Fear
- **Intensity Measurement:** Mild, Moderate, High, Critical
- **Tone Analysis:** Formal, Casual, Aggressive, Friendly, Professional
- **Sarcasm Detection:** Identify sarcastic messages
- **Mood Tracking:** Track emotional trajectory across conversation

**Key Methods:**
```typescript
- analyzeSentiment(message): { sentiment, confidence }
- detectEmotion(message): { emotions[], primaryEmotion }
- measureIntensity(message): { level, score }
- analyzeTone(message): { tone, formality }
- detectSarcasm(message): boolean
- trackMood(conversationHistory): { trend, currentMood }
```

**Used By:**
- FrustrationHandler (detect frustration levels)
- IntentDetector (context for intent classification)
- ResponseValidator (tone matching)
- QualityValidator (empathy scoring)

**Implementation:**
```typescript
class SentimentAnalyzer {
  analyze(message: string): SentimentAnalysis {
    return {
      sentiment: 'positive' | 'negative' | 'neutral',
      emotion: 'joy' | 'anger' | 'frustration' | ...,
      intensity: 0-100,
      tone: 'formal' | 'casual' | 'aggressive' | ...,
      sarcasm: boolean,
      confidence: 0-1
    };
  }
}
```

---

### **9. Personality Engine** ⭐ NEW

**Purpose:** Ensure consistent personality and brand voice across all responses

**Capabilities:**
- **Personality Traits:** Friendliness, Formality, Enthusiasm, Empathy, Humor, Assertiveness (each 0-100)
- **Brand Voice Enforcement:** Professional, Casual, Technical
- **Adaptive Personality:** Match user's communication style
- **Multi-Persona Support:** Switch between formal/casual modes
- **Personality Consistency Scoring:** Measure adherence to defined personality

**Configuration:**
```typescript
interface PersonalityConfig {
  traits: {
    friendliness: 80,      // 0-100
    formality: 50,         // 0-100
    enthusiasm: 70,        // 0-100
    empathy: 90,           // 0-100
    humor: 30,             // 0-100
    assertiveness: 60      // 0-100
  },
  brandVoice: 'professional' | 'casual' | 'technical',
  adaptToUser: boolean,    // Match user's style
  emojiUsage: 'none' | 'minimal' | 'moderate' | 'frequent'
}
```

**Key Methods:**
```typescript
- applyPersonality(response): string
- checkConsistency(response): { score, violations }
- adaptToUserStyle(userMessage): PersonalityAdjustment
- getPersonalityPrompt(): string
```

**Benefits:**
- ✅ Consistent brand experience
- ✅ User preference matching
- ✅ Context-appropriate tone (formal vs casual)
- ✅ Enhanced emotional intelligence

---

### **10. Context Window Manager** ⭐ NEW

**Purpose:** Intelligently manage conversation history for optimal LLM performance and cost efficiency

**Capabilities:**
- **Smart Summarization:** Compress old messages without losing key information
- **Relevant Context Extraction:** Pull only relevant history for current query
- **Context Compression:** Reduce token usage while maintaining quality
- **Important Info Pinning:** Keep critical facts available
- **Context Decay:** Reduce weight of older messages
- **Token Optimization:** Stay within LLM context limits

**Key Methods:**
```typescript
- summarizeOldContext(messages): string
- extractRelevantContext(query, history): Message[]
- pinImportantFact(fact): void
- calculateRelevance(message, currentQuery): number
- optimizeForTokenLimit(messages, limit): Message[]
- compressHistory(messages): CompressedContext
```

**Strategy:**
```typescript
// Example: 50-message conversation
const context = {
  pinned: [userFacts, preferences],        // Always include (50 tokens)
  summary: summarizeLast30Messages(),       // Compressed (200 tokens)
  recent: last5Messages(),                  // Full detail (500 tokens)
  relevant: extractRelevantTo(currentQuery) // Context-specific (250 tokens)
  // Total: ~1000 tokens vs 3000+ for full history
};
```

**Benefits:**
- ✅ Long conversations don't break (100+ messages supported)
- ✅ Token efficiency = 60-80% cost savings
- ✅ Better context retention (focused relevance)
- ✅ Scalability (handles any conversation length)

---

### **11. Frustration Handler**

**Purpose:** Detect and respond to user frustration

**Detection Levels:**
- **Mild** - "This is confusing"
- **Moderate** - "This isn't working"
- **High** - "This is terrible"
- **Critical** - Profanity, extreme frustration

**Uses:** Sentiment Analyzer for emotion detection

**Response Strategy:**
```typescript
Mild → Empathy + Clarification
Moderate → Empathy + Help Offer
High → Empathy + Escalation Offer
Critical → Apology + Immediate Escalation
```

---

### **12. Response Validator**

**Purpose:** Ensure response quality before sending

**Validation Checks:**
- ✅ Not empty
- ✅ Not too long (< 500 words default)
- ✅ Relevant to question
- ✅ No repetition of previous responses
- ✅ No hallucinations
- ✅ Appropriate tone (uses Sentiment Analyzer)

---

### **13. Quality Validator**

**Purpose:** Score conversation quality

**Quality Metrics:**
- Conversation flow score
- Empathy score (uses Sentiment Analyzer)
- Relevance score
- Conciseness score
- Context retention score
- Personality consistency score (uses Personality Engine)

**Scoring:**
```
100-90: Excellent
89-75:  Good
74-60:  Acceptable
<60:    Needs Improvement
```

---

### **14. RAG Infrastructure**

**Purpose:** Enable knowledge retrieval (when needed by specialized agents)

**Components:**
- Embedding service (via Dartmouth OS)
- Vector storage (via Dartmouth OS)
- Semantic search
- Document chunking
- Context injection

**Note:** FAM provides the infrastructure but has NO documents loaded. Specialized agents add their own knowledge bases.

**Integration:**
```typescript
// Specialized agents add documents
await ragEngine.addDocument(document);
await ragEngine.buildIndex();

// Query at runtime
const context = await ragEngine.query(userQuestion);
```

---

## 💪 **CAPABILITIES**

### **What FAM Can Do**

#### **1. Conversation Management**
- ✅ Remember names, preferences, context
- ✅ Track conversation history
- ✅ Reference previous messages
- ✅ Maintain context across 10+ turns
- ✅ Handle multi-topic conversations

#### **2. Intent Understanding**
- ✅ Detect greetings, farewells
- ✅ Identify information requests
- ✅ Recognize follow-up questions
- ✅ Detect frustration signals
- ✅ Route to appropriate handlers

#### **3. Response Generation**
- ✅ Natural, conversational responses
- ✅ Context-aware answers
- ✅ Empathetic communication
- ✅ Personality consistency
- ✅ Appropriate tone matching

#### **4. Constraint Enforcement**
- ✅ Block pricing information
- ✅ Prevent discount offers
- ✅ Refuse refund processing
- ✅ Avoid unauthorized commitments
- ✅ Stay within business rules

#### **5. Quality Assurance**
- ✅ Validate response quality
- ✅ Prevent repetition
- ✅ Check relevance
- ✅ Ensure conciseness
- ✅ Monitor conversation health

#### **6. Error Handling**
- ✅ Graceful LLM failures
- ✅ API timeout handling
- ✅ Fallback mechanisms
- ✅ Error logging
- ✅ User-friendly error messages

---

### **What FAM Cannot Do (By Design)**

#### **Domain-Specific Tasks:**
- ❌ DPI calculations (→ McCarthy Artwork Analyzer)
- ❌ Lead scraping (→ McCarthy Lead Scraper)
- ❌ Content research (→ McCarthy Content Research)
- ❌ Copywriting (→ McCarthy Copywriter)
- ❌ Any specialized knowledge retrieval

#### **Business Actions:**
- ❌ Quote prices
- ❌ Offer discounts
- ❌ Process refunds
- ❌ Modify orders
- ❌ Access customer data

---

## 📝 **SYSTEM PROMPT**

### **Current FAM System Prompt**

```
You are a professional AI assistant designed to have natural, helpful conversations.

CORE CONVERSATIONAL SKILLS:
- ALWAYS read the full conversation history before responding
- Remember what the user has told you (name, preferences, context)
- When users say "it", "that", "this", refer to what was just discussed
- NEVER ask for information you already have from previous messages
- Maintain context throughout the conversation
- Be conversational and acknowledge previous messages

PERSONALITY:
- Friendly and professional
- Clear and concise
- Helpful and proactive
- Honest when you don't know something

RESPONSE GUIDELINES:
- Keep responses focused and relevant
- If you don't understand, ask for clarification
- If you can't help with something, explain why and suggest alternatives
- Avoid repetition - don't say the same thing multiple times

CONSTRAINTS:
- Be honest about your limitations
- Don't make promises you can't keep
- Don't pretend to have capabilities you don't have
- Stay on topic unless the user changes the subject
```

### **System Prompt Architecture**

```
┌─────────────────────────────────────────┐
│     FAM System Prompt (Foundation)      │
│  - Core conversational skills           │
│  - Personality guidelines               │
│  - Basic constraints                    │
└─────────────┬───────────────────────────┘
              │ Inherited by
              ↓
┌─────────────────────────────────────────┐
│   Specialized Agent System Prompt       │
│  - Extends FAM prompt                   │
│  - Adds domain expertise                │
│  - Adds specialized constraints         │
│  - Adds custom personality traits       │
└─────────────────────────────────────────┘
```

---

## 🔧 **TECHNICAL IMPLEMENTATION**

### **File Structure**

```
packages/worker/src/
├── BaseAgent.ts              # FAM core implementation
├── types/
│   └── shared.ts             # Type definitions
├── components/
│   ├── IntentDetector.ts     # Intent detection
│   ├── ConstraintValidator.ts # Constraint enforcement
│   ├── FrustrationHandler.ts # Frustration detection
│   ├── LLMService.ts         # LLM integration
│   └── ResponseValidator.ts  # Response validation
├── handlers/
│   ├── GreetingHandler.ts    # Greeting responses
│   ├── FarewellHandler.ts    # Farewell responses
│   ├── InformationHandler.ts # Information requests
│   └── FrustrationHandlerImpl.ts # Frustration responses
├── services/
│   └── DatabaseManager.ts    # D1 database interface
└── routes/
    ├── chat.ts               # Chat API endpoint
    └── test.ts               # Test endpoint
```

### **BaseAgent Class Structure**

```typescript
export class BaseAgent {
  // Core Components
  protected conversationState: ConversationState;
  protected intentDetector: IntentDetector;
  protected constraintValidator: ConstraintValidator;
  protected llmService: LLMService;
  protected frustrationHandler: FrustrationHandler;
  protected handlers: Map<string, Handler>;

  // Configuration
  protected agentId: string;
  protected tenantId: string;
  protected agentConfig: AgentConfig;
  protected env: Env;

  // Main Methods
  async processMessage(message: string, sessionId?: string): Promise<Response>
  protected async detectIntent(message: string): Promise<Intent>
  protected async routeToHandler(intent: Intent, message: string): Promise<Response>
  protected async validateResponse(response: Response): Promise<Response>
  protected async enforceConstraints(response: Response): Promise<Response>
  
  // Helper Methods
  protected async loadConversationState(sessionId: string): Promise<void>
  protected async saveConversationState(): Promise<void>
  protected async generateLLMResponse(message: string): Promise<Response>
  
  // Extensibility
  protected registerHandler(intentType: string, handler: Handler): void
  protected getConstraintValidator(): ConstraintValidator
}
```

---

## 🌐 **API SPECIFICATION**

### **Chat Endpoint**

**URL:** `POST /api/v1/agents/{agentId}/chat`

**Request Body:**
```json
{
  "message": "Hello!",
  "sessionId": "session-123" (optional),
  "userId": "user-456" (optional),
  "agentId": "test-agent"
}
```

**Response:**
```json
{
  "response": "Hello! How can I help you today?",
  "sessionId": "session-123",
  "messageId": "msg-789",
  "timestamp": "2024-11-19T10:00:00Z",
  "metadata": {
    "intent": "greeting",
    "confidence": 0.95,
    "handler": "GreetingHandler",
    "processingTime": 245
  }
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-11-19T10:00:00Z"
}
```

---

## 🧪 **TESTING**

### **Test Plan**

**Document:** `FOUNDATIONAL_AGENT_TEST_PLAN.md`

**38 Tests Across 9 Categories:**
1. Conversation Memory (5 tests)
2. Intent Detection (5 tests)
3. Memory System (4 tests)
4. Repetition Detection (2 tests)
5. Frustration Handling (4 tests)
6. Conversation Quality (3 tests)
7. Empathy & Personality (3 tests)
8. Constraint Enforcement (3 tests)
9. LLM Fallback (3 tests)

**Success Criteria:** 90%+ pass rate (34+ out of 38)

### **Test Environment**

**Local Testing:**
```
File: D:\coding\agent-army-system\test-fam-local.html
Open in browser and follow test plan
```

**API Testing:**
```bash
curl -X POST https://agent-army-worker.dartmouth.workers.dev/api/v1/agents/test-agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "agentId": "test-agent"
  }'
```

---

## 🚀 **DEPLOYMENT**

### **Production Deployment**

**Worker URL:** https://agent-army-worker.dartmouth.workers.dev

**Deployment Command:**
```bash
cd packages/worker
npm run deploy
```

**Environment Variables:**
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
GOOGLE_API_KEY=...
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
```

### **Configuration**

**Default Configuration:**
```typescript
{
  llmProvider: 'openai',
  llmModel: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt: '...' (see System Prompt section)
}
```

---

## 🎨 **BUILDING SPECIALIZED AGENTS**

### **How to Create a McCarthy Agent**

#### **Step 1: Extend BaseAgent**

```typescript
import { BaseAgent } from '../worker/src/BaseAgent';
import type { AgentConfig } from '../worker/src/types/shared';

export class McCarthyYourAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    // Override system prompt with specialized one
    config.systemPrompt = `Your specialized prompt here`;
    
    // Initialize foundation
    super(config);
    
    // Add specialized components
    this.initializeSpecializedFeatures();
  }
  
  private initializeSpecializedFeatures(): void {
    // Add custom handlers
    // Load RAG documents
    // Register constraints
  }
}
```

#### **Step 2: Add System Prompt**

```typescript
config.systemPrompt = `You are McCarthy [Your Domain Expert].

EXPERTISE:
- [Domain knowledge area 1]
- [Domain knowledge area 2]
- [Domain knowledge area 3]

CONVERSATION RULES:
- ALWAYS read full conversation history
- Reference previous messages
- Maintain context

PERSONALITY:
- [Your tone]
- [Your style]

CONSTRAINTS:
- NEVER [forbidden action 1]
- NEVER [forbidden action 2]
- ALWAYS [required action]
`;
```

#### **Step 3: Add RAG Documents (Optional)**

```typescript
// Load domain-specific knowledge
const ragDocuments = [
  { title: 'Guide 1', content: '...' },
  { title: 'Guide 2', content: '...' }
];

// Ingest into database
await ingestDocuments(ragDocuments, this.agentId);
```

#### **Step 4: Add Specialized Handlers (Optional)**

```typescript
// Example: Calculation Handler
class CalculationHandler implements Handler {
  canHandle(intent: Intent): boolean {
    return intent.type === 'calculation';
  }
  
  async handle(message: string, context: HandlerContext): Promise<Response> {
    // Your specialized logic
    return { content: '...' };
  }
}

// Register handler
this.registerHandler('calculation', new CalculationHandler());
```

#### **Step 5: Add Constraints**

```typescript
const YOUR_AGENT_CONSTRAINTS: Constraint[] = [
  {
    id: 'no-xyz',
    type: 'forbidden-phrase',
    severity: 'critical',
    pattern: /forbidden pattern/i,
    description: 'Cannot do XYZ',
    suggestedResponse: 'Custom response here'
  }
];

// Register constraints
this.getConstraintValidator().registerAgentConstraints(
  this.agentId,
  YOUR_AGENT_CONSTRAINTS
);
```

---

## ✅ **BEST PRACTICES**

### **Do's**

✅ **Always extend BaseAgent** - Never modify it directly  
✅ **Override system prompt** - Add domain expertise  
✅ **Register custom handlers** - For specialized intents  
✅ **Use constraint validator** - Enforce business rules  
✅ **Test thoroughly** - Use test plan template  
✅ **Document changes** - Update architecture docs  
✅ **Version control** - Commit to GitHub regularly

### **Don'ts**

❌ **Don't modify FAM core** - Extend, don't edit  
❌ **Don't bypass constraints** - Always enforce  
❌ **Don't skip testing** - Foundation must be solid  
❌ **Don't add domain knowledge to FAM** - Keep it generic  
❌ **Don't hardcode values** - Use configuration  
❌ **Don't ignore errors** - Handle gracefully

---

## 🐛 **TROUBLESHOOTING**

### **Common Issues**

#### **1. Agent Not Remembering Context**
```
Problem: Agent forgets previous messages
Cause: Session not persisting
Fix: Verify sessionId is being passed correctly
```

#### **2. Constraints Not Enforcing**
```
Problem: Agent violates business rules
Cause: Constraints not registered
Fix: Call registerAgentConstraints() in constructor
```

#### **3. LLM Not Responding**
```
Problem: Empty or generic responses
Cause: API key missing or invalid
Fix: Check environment variables
```

#### **4. Repetitive Responses**
```
Problem: Agent repeats same answer
Cause: Repetition detector not working
Fix: Verify conversation state is tracking messages
```

---

## 📊 **METRICS & MONITORING**

### **Key Metrics to Track**

- **Response Time** - Average processing time per message
- **Intent Accuracy** - Correct intent detection rate
- **Constraint Violations** - Number of business rule violations caught
- **User Satisfaction** - Implicit/explicit feedback
- **Conversation Length** - Average turns per session
- **Error Rate** - API errors, timeouts, failures

### **Logging**

```typescript
console.log('[FAM] Component initialized');
console.log('[FAM] Intent detected:', intent.type);
console.log('[FAM] Constraint violation:', violation.ruleId);
console.warn('[FAM] Warning:', message);
console.error('[FAM] Error:', error);
```

---

## 🎓 **TRAINING & ONBOARDING**

### **For Developers**

1. Read this specification completely
2. Review BaseAgent.ts implementation
3. Study one specialized agent (e.g., McCarthy Artwork Analyzer)
4. Run test plan against FAM
5. Build a simple test agent
6. Deploy to staging
7. Build production agent

### **For Product Teams**

1. Understand FAM capabilities
2. Review constraints and limitations
3. Define specialized agent requirements
4. Write system prompt
5. Gather domain knowledge (RAG documents)
6. Work with developers to implement
7. Test thoroughly
8. Deploy to production

---

## 📚 **RELATED DOCUMENTATION**

- **Test Plan:** `FOUNDATIONAL_AGENT_TEST_PLAN.md`
- **Testing Guide:** `FAM_TESTING_GUIDE.md`
- **Agent Roadmap:** `AGENT_ARMY_ROADMAP.md`
- **Architecture:** `DARTMOUTH_BLUEPRINT.md`
- **System Prompts:** `SYSTEM_PROMPT_CONFIGURATION.md`

---

## 🔄 **VERSION HISTORY**

### **Version 1.0.0** (November 19, 2024)
- Initial release
- Core components implemented
- Production-ready
- 38-test validation suite
- Complete documentation

---

## 📞 **SUPPORT**

- **GitHub:** https://github.com/hutchisonjohn/dartmouth
- **Worker API:** https://agent-army-worker.dartmouth.workers.dev
- **Test UI:** D:\coding\agent-army-system\test-fam-local.html

---

**FAM is the foundation. Build your army on solid ground.** 🎯

---

**End of Specification**

