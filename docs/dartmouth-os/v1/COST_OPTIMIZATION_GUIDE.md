# 💰 COST OPTIMIZATION & RESOURCE EFFICIENCY GUIDE
## Maximize Performance While Minimizing Waste

**Version:** 1.0.0  
**Date:** November 19, 2024  
**Purpose:** Comprehensive guide to running Dartmouth OS and agents efficiently

---

## 📖 TABLE OF CONTENTS

1. [Cost Optimization Philosophy](#cost-optimization-philosophy)
2. [The 80/20 Rule](#the-8020-rule)
3. [LLM Cost Optimization](#llm-cost-optimization)
4. [Caching Strategies](#caching-strategies)
5. [Context Management](#context-management)
6. [Database Optimization](#database-optimization)
7. [Resource Monitoring](#resource-monitoring)
8. [Auto-Scaling Strategies](#auto-scaling-strategies)
9. [Cost Alert System](#cost-alert-system)
10. [Emergency Cost Controls](#emergency-cost-controls)

---

## 🎯 **COST OPTIMIZATION PHILOSOPHY**

### **Core Principles**

1. **Pay Only for Value** - Every dollar spent must deliver user value
2. **Cache Aggressively** - Computation is expensive, storage is cheap
3. **Monitor Everything** - You can't optimize what you don't measure
4. **Fail Gracefully** - Degrade service before breaking the budget
5. **Automate Controls** - Don't rely on human intervention

### **The Cost Hierarchy**

```
Most Expensive → Least Expensive

1. LLM API Calls ($$$)           - $0.15-$60 per 1M tokens
2. External Integrations ($$)    - Variable API costs
3. Compute/Workers ($)           - $5-50/month
4. Database Operations ($)       - $0-10/month
5. Caching (¢)                   - Pennies per GB
6. Static Storage (¢)            - $0.015/GB/month
```

**Strategy:** Move workload DOWN the hierarchy whenever possible!

---

## 📊 **THE 80/20 RULE**

### **80% of Costs Come From 20% of Operations**

Identify and optimize your "expensive 20%":

#### **Typical Cost Breakdown**

```
LLM Calls:           80-90%  ← FOCUS HERE
Integrations:        5-10%
Infrastructure:      5-10%
```

### **The 80/20 Optimization Strategy**

1. **Identify** the 20% of requests causing 80% of costs
2. **Cache** those expensive operations aggressively
3. **Optimize** prompts to reduce token usage
4. **Monitor** cost per request in real-time
5. **Alert** when anomalies detected

### **Implementation**

```typescript
// Track cost per request
const costTracking = {
  async trackRequest(requestId: string, cost: number) {
    await analytics.track({
      event: 'request_cost',
      requestId,
      cost,
      timestamp: Date.now()
    });
    
    // Identify expensive requests
    if (cost > COST_THRESHOLD) {
      await alerts.send({
        level: 'warning',
        message: `High-cost request: $${cost}`,
        requestId
      });
    }
  },
  
  async getTopExpensiveRequests(limit = 20) {
    // Get top 20% most expensive requests
    return await analytics.query({
      metric: 'request_cost',
      sort: 'desc',
      limit
    });
  }
};
```

---

## 🤖 **LLM COST OPTIMIZATION**

### **1. Model Selection**

Choose the right model for the task:

| Task Complexity | Model | Cost/1M Tokens | When to Use |
|----------------|-------|----------------|-------------|
| Simple | GPT-4o-mini | $0.15-0.60 | Greetings, simple Q&A |
| Medium | GPT-4o | $2.50-10.00 | Most conversations |
| Complex | GPT-4 | $30-60 | Complex analysis, code |

**Strategy:**
```typescript
function selectModel(intent: string, complexity: number): string {
  if (intent === 'greeting' || intent === 'farewell') {
    return 'gpt-4o-mini'; // Cheapest
  }
  
  if (complexity > 0.8) {
    return 'gpt-4'; // Most capable
  }
  
  return 'gpt-4o-mini'; // Default: cheap and fast
}
```

**Savings:** 20-50x cost reduction for simple tasks!

---

### **2. Prompt Optimization**

Shorter prompts = lower costs:

#### **Bad Prompt (1,500 tokens, $0.225 per 1000 requests)**
```
You are McCarthy, an expert artwork analysis assistant. You specialize in DTF and UV DTF printing.
You have deep expertise in DPI calculations, print size recommendations, artwork quality assessment...
[500 more words of instructions]
```

#### **Good Prompt (300 tokens, $0.045 per 1000 requests)**
```
You are McCarthy, artwork analyst. Expertise: DPI, print sizes, DTF/UV DTF.
Be concise, friendly, technical.
NEVER discuss pricing.
```

**Savings:** 80% reduction in system prompt cost!

#### **Prompt Engineering Tips**

```typescript
// ❌ BAD: Verbose, repetitive
const badPrompt = `
You should always be very friendly and helpful. 
When users ask questions, make sure you always 
respond in a friendly and helpful manner...
`;

// ✅ GOOD: Concise, clear
const goodPrompt = `
Be friendly and helpful.
Respond concisely.
`;

// Measure token usage
const tokens = estimateTokens(prompt);
if (tokens > 500) {
  console.warn('Prompt too long! Consider reducing.');
}
```

---

### **3. Response Length Control**

Limit output tokens:

```typescript
const llmConfig = {
  maxTokens: 150,  // ← Enforce limit
  temperature: 0.7
};

// ❌ No limit: User gets 2000 token essay
// Cost: $1.20 per 1000 responses

// ✅ With limit: User gets 150 token response
// Cost: $0.09 per 1000 responses
// Savings: 92%!
```

**Implementation:**
```typescript
async function generateResponse(message: string): Promise<string> {
  const complexity = analyzeComplexity(message);
  
  const maxTokens = {
    simple: 100,    // Greeting, farewell
    medium: 200,    // Regular Q&A
    complex: 500    // Detailed analysis
  }[complexity];
  
  return await llm.generate(message, { maxTokens });
}
```

---

### **4. Streaming for Better UX**

Start responding immediately (no extra cost):

```typescript
// User sees response in <100ms (feels instant!)
// Same LLM cost, massively better UX
async function* streamResponse(message: string) {
  const stream = await llm.generateStream(message);
  
  for await (const chunk of stream) {
    yield chunk; // Send immediately
  }
}
```

---

### **5. Prompt Caching (OpenAI)**

Cache system prompts (50% cost reduction):

```typescript
// OpenAI Prompt Caching (Beta)
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    {
      role: 'system',
      content: systemPrompt,
      cache_control: { type: 'ephemeral' } // ← Cache this!
    },
    { role: 'user', content: userMessage }
  ]
});

// First call: Full cost
// Subsequent calls (within 5 min): 50% off system prompt tokens!
```

**Savings:** 30-50% reduction in total LLM costs!

---

## 🚀 **CACHING STRATEGIES**

### **Multi-Layer Cache Architecture**

```
┌─────────────────────────────────────────┐
│  Layer 1: CDN (Cloudflare Cache API)   │  ← FREE, instant
│  Hit Rate: 20-30%                       │
└─────────────────┬───────────────────────┘
                  │ Miss
┌─────────────────▼───────────────────────┐
│  Layer 2: KV (Edge Key-Value)          │  ← <10ms, cheap
│  Hit Rate: 30-40%                       │
└─────────────────┬───────────────────────┘
                  │ Miss
┌─────────────────▼───────────────────────┐
│  Layer 3: D1 (SQLite Database)         │  ← <50ms, cheap
│  Hit Rate: 10-20%                       │
└─────────────────┬───────────────────────┘
                  │ Miss
┌─────────────────▼───────────────────────┐
│  Layer 4: LLM (Generate Response)      │  ← 200-500ms, $$$
│  Only if cache miss!                    │
└─────────────────────────────────────────┘

Total Cache Hit Rate: 60-90%
LLM Cost Reduction: 60-90%!
```

### **Intelligent Cache Keys**

```typescript
// ❌ BAD: Cache by exact message (low hit rate)
const badKey = message; // "Hello!" vs "Hello!!" = different keys

// ✅ GOOD: Normalize and hash
function createCacheKey(message: string, systemPrompt: string): string {
  // Normalize
  const normalized = message
    .toLowerCase()
    .trim()
    .replace(/[!?.]+$/, ''); // Remove punctuation
  
  // Create stable hash
  const hash = sha256(`${systemPrompt}:${normalized}`);
  
  return `llm:${hash}`;
}

// "Hello!", "hello!!", "HELLO" → Same cache key!
```

### **Smart TTL (Time To Live)**

```typescript
const cacheTTL = {
  // Static responses (almost never change)
  greeting: 7 * 24 * 3600,        // 7 days
  farewell: 7 * 24 * 3600,        // 7 days
  faq: 24 * 3600,                 // 24 hours
  
  // Dynamic responses (change more often)
  calculation: 3600,              // 1 hour
  information: 1800,              // 30 minutes
  
  // Personalized (short-lived)
  conversation: 300,              // 5 minutes
};

// Set TTL based on content type
function getTTL(intent: string, personalized: boolean): number {
  if (personalized) return cacheTTL.conversation;
  return cacheTTL[intent] || 3600; // Default 1 hour
}
```

### **Cache Warming**

Preload popular queries:

```typescript
// Identify top queries from analytics
const topQueries = [
  "What is DPI?",
  "How do I prepare artwork?",
  "What size can I print?"
];

// Warm cache during off-peak hours
async function warmCache() {
  for (const query of topQueries) {
    const response = await agent.processMessage(query);
    await cache.set(createCacheKey(query), response, { ttl: 86400 });
  }
}

// Schedule: Daily at 2am
cron.schedule('0 2 * * *', warmCache);
```

**Result:** 80%+ cache hit rate for common queries!

---

### **Cache Invalidation**

When to invalidate:

```typescript
// Invalidate when data changes
async function updateKnowledgeBase(document: Document) {
  await ragEngine.addDocument(document);
  
  // Invalidate related cache
  await cache.invalidate('llm:*information*');
  
  console.log('Cache invalidated for information queries');
}

// Invalidate when agent updated
async function updateAgent(agentId: string, config: AgentConfig) {
  await db.update('agents', agentId, config);
  
  // Invalidate all responses from this agent
  await cache.invalidate(`llm:${agentId}:*`);
}
```

---

## 🧠 **CONTEXT MANAGEMENT**

### **The Problem**

Sending full conversation history is EXPENSIVE:

```
Conversation with 20 messages:
- Full history: 3,000 tokens
- Cost per request: $0.45 per 1000

Conversation with 100 messages:
- Full history: 15,000 tokens
- Cost per request: $2.25 per 1000
```

### **The Solution: Smart Context Windows**

```typescript
class ContextWindowManager {
  optimizeContext(
    conversationHistory: Message[],
    currentQuery: string
  ): OptimizedContext {
    
    // 1. Always include: User facts & preferences (50 tokens)
    const pinnedFacts = this.extractPinnedFacts(conversationHistory);
    
    // 2. Summarize old messages (30-50 messages ago)
    const oldSummary = this.summarizeOldContext(
      conversationHistory.slice(0, -10)
    ); // 200 tokens
    
    // 3. Include recent messages (last 5)
    const recentMessages = conversationHistory.slice(-5); // 500 tokens
    
    // 4. Extract relevant context for current query
    const relevantContext = this.extractRelevantContext(
      currentQuery,
      conversationHistory
    ); // 250 tokens
    
    return {
      pinned: pinnedFacts,      // 50 tokens
      summary: oldSummary,      // 200 tokens
      recent: recentMessages,   // 500 tokens
      relevant: relevantContext // 250 tokens
      // TOTAL: 1,000 tokens (vs 3,000+)
    };
  }
  
  private summarizeOldContext(messages: Message[]): string {
    // Use cheap model to summarize
    return await llm.generate({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Summarize this conversation in 2-3 sentences.'
        },
        { role: 'user', content: JSON.stringify(messages) }
      ],
      maxTokens: 100
    });
  }
}
```

**Savings:** 70% reduction in input tokens = 70% cost savings!

---

### **Relevance Scoring**

Only include relevant messages:

```typescript
function calculateRelevance(
  message: Message,
  currentQuery: string
): number {
  let score = 0;
  
  // Recent messages more relevant
  const age = Date.now() - message.timestamp;
  score += Math.max(0, 1 - (age / (24 * 3600 * 1000))); // Decay over 24h
  
  // Keyword overlap
  const queryWords = new Set(currentQuery.toLowerCase().split(' '));
  const messageWords = new Set(message.content.toLowerCase().split(' '));
  const overlap = [...queryWords].filter(w => messageWords.has(w)).length;
  score += overlap / queryWords.size;
  
  // Same topic
  if (message.metadata.topic === detectTopic(currentQuery)) {
    score += 0.5;
  }
  
  return score;
}

// Only include messages with relevance > 0.3
const relevantMessages = conversationHistory
  .map(msg => ({ msg, relevance: calculateRelevance(msg, currentQuery) }))
  .filter(({ relevance }) => relevance > 0.3)
  .sort((a, b) => b.relevance - a.relevance)
  .slice(0, 10) // Top 10 most relevant
  .map(({ msg }) => msg);
```

---

## 💾 **DATABASE OPTIMIZATION**

### **1. Query Optimization**

#### **Bad: N+1 Queries**
```typescript
// ❌ BAD: 101 queries for 100 conversations
const conversations = await db.getAll('conversations');
for (const conv of conversations) {
  conv.messages = await db.getMessages(conv.id); // N queries!
}
```

#### **Good: Batch Queries**
```typescript
// ✅ GOOD: 2 queries for 100 conversations
const conversations = await db.getAll('conversations');
const conversationIds = conversations.map(c => c.id);
const allMessages = await db.getMessagesBatch(conversationIds); // 1 query

// Group messages by conversation
conversations.forEach(conv => {
  conv.messages = allMessages.filter(m => m.conversationId === conv.id);
});
```

**Savings:** 99% reduction in database queries!

---

### **2. Indexing**

Create indexes for common queries:

```sql
-- ❌ Slow: Full table scan
SELECT * FROM conversations WHERE userId = 'user-123';

-- ✅ Fast: Index scan
CREATE INDEX idx_conversations_userId ON conversations(userId);
SELECT * FROM conversations WHERE userId = 'user-123'; -- Uses index!
```

**Index Strategy:**
```sql
-- User lookups
CREATE INDEX idx_conversations_userId ON conversations(userId);
CREATE INDEX idx_messages_sessionId ON messages(sessionId);

-- Time-range queries
CREATE INDEX idx_conversations_createdAt ON conversations(createdAt);

-- Composite indexes
CREATE INDEX idx_messages_session_time ON messages(sessionId, timestamp);
```

---

### **3. Data Archival**

Move old data to cheap storage:

```typescript
// Daily cleanup job
async function archiveOldConversations() {
  // Get conversations older than 30 days
  const oldConversations = await db.query(`
    SELECT * FROM conversations
    WHERE last_activity < datetime('now', '-30 days')
  `);
  
  // Archive to R2 (cheap storage)
  for (const conv of oldConversations) {
    await r2.put(
      `archives/${conv.id}.json`,
      JSON.stringify(conv),
      { compression: 'gzip' }
    );
  }
  
  // Delete from D1 (expensive storage)
  await db.execute(`
    DELETE FROM conversations
    WHERE last_activity < datetime('now', '-30 days')
  `);
  
  console.log(`Archived ${oldConversations.length} conversations`);
}

// Schedule: Daily at 3am
cron.schedule('0 3 * * *', archiveOldConversations);
```

**Savings:** Stay within D1 free tier = $5-10/month saved!

---

### **4. Batch Writes**

Buffer writes to reduce operations:

```typescript
class AnalyticsBuffer {
  private buffer: Event[] = [];
  private flushSize = 100;
  private flushInterval = 60000; // 1 minute
  
  constructor() {
    // Auto-flush every minute
    setInterval(() => this.flush(), this.flushInterval);
  }
  
  async track(event: Event) {
    this.buffer.push(event);
    
    // Flush if buffer full
    if (this.buffer.length >= this.flushSize) {
      await this.flush();
    }
  }
  
  private async flush() {
    if (this.buffer.length === 0) return;
    
    // Batch insert (single write operation)
    await db.batch(
      'INSERT INTO analytics (event, data, timestamp) VALUES (?, ?, ?)',
      this.buffer.map(e => [e.event, JSON.stringify(e.data), e.timestamp])
    );
    
    this.buffer = [];
  }
}
```

**Savings:** 99% reduction in write operations!

---

## 📈 **RESOURCE MONITORING**

### **Real-Time Cost Tracking**

```typescript
class CostTracker {
  private dailyCost = 0;
  private monthlyCost = 0;
  private costBreakdown = {
    llm: 0,
    infrastructure: 0,
    integrations: 0
  };
  
  async trackLLMCall(inputTokens: number, outputTokens: number, model: string) {
    const cost = this.calculateLLMCost(inputTokens, outputTokens, model);
    
    this.dailyCost += cost;
    this.monthlyCost += cost;
    this.costBreakdown.llm += cost;
    
    // Check budget
    await this.checkBudget();
    
    // Log to analytics
    await analytics.track({
      event: 'llm_cost',
      cost,
      inputTokens,
      outputTokens,
      model
    });
  }
  
  private calculateLLMCost(input: number, output: number, model: string): number {
    const pricing = {
      'gpt-4o-mini': { input: 0.15, output: 0.60 },
      'gpt-4o': { input: 2.50, output: 10.00 },
      'gpt-4': { input: 30.00, output: 60.00 }
    };
    
    const prices = pricing[model] || pricing['gpt-4o-mini'];
    return (input * prices.input + output * prices.output) / 1_000_000;
  }
  
  private async checkBudget() {
    const budget = await this.getBudget();
    
    if (this.dailyCost > budget.daily * 0.9) {
      await alerts.send({
        level: 'critical',
        message: `Daily budget 90% exceeded: $${this.dailyCost.toFixed(2)} / $${budget.daily}`
      });
      
      // Enable cost-saving mode
      await this.enableCostSavingMode();
    }
  }
  
  async getDailyCost(): Promise<number> {
    return this.dailyCost;
  }
  
  async getMonthlyCost(): Promise<number> {
    return this.monthlyCost;
  }
  
  async getBreakdown() {
    return this.costBreakdown;
  }
}
```

---

### **Budget Alerts**

```typescript
// Configure alerts
const budgetConfig = {
  daily: 50,
  monthly: 1000,
  alerts: [
    { threshold: 0.5, level: 'info', action: 'notify' },
    { threshold: 0.8, level: 'warning', action: 'notify' },
    { threshold: 0.9, level: 'critical', action: 'enable_cost_saving_mode' },
    { threshold: 1.0, level: 'emergency', action: 'pause_non_critical' }
  ]
};

// Real-time monitoring
setInterval(async () => {
  const currentCost = await costTracker.getDailyCost();
  const percentUsed = currentCost / budgetConfig.daily;
  
  for (const alert of budgetConfig.alerts) {
    if (percentUsed >= alert.threshold && !alert.triggered) {
      await handleBudgetAlert(alert, currentCost);
      alert.triggered = true;
    }
  }
}, 60000); // Check every minute
```

---

## 🚨 **EMERGENCY COST CONTROLS**

### **Cost-Saving Mode**

Activated when budget threshold exceeded:

```typescript
async function enableCostSavingMode() {
  console.log('⚠️ COST-SAVING MODE ENABLED');
  
  const controls = {
    // 1. Aggressive caching (require cache hit)
    cacheHitRequired: true,
    
    // 2. Use cheaper models
    llmModel: 'gpt-4o-mini',
    
    // 3. Reduce max tokens
    maxOutputTokens: 100,
    
    // 4. Disable non-critical features
    disableRAG: true,
    disableIntegrations: true,
    
    // 5. Rate limiting (reduce load)
    requestsPerMinute: 10
  };
  
  await config.set('costSavingMode', controls);
  
  // Notify team
  await alerts.send({
    level: 'critical',
    message: 'Cost-saving mode enabled due to budget threshold',
    channels: ['email', 'slack']
  });
}
```

---

### **Circuit Breaker Pattern**

Prevent runaway costs:

```typescript
class CostCircuitBreaker {
  private failures = 0;
  private state = 'closed'; // closed, open, half-open
  private threshold = 10;
  private timeout = 60000; // 1 minute
  
  async execute(fn: Function, cost: number): Promise<any> {
    // If circuit open, reject immediately
    if (this.state === 'open') {
      throw new Error('Circuit breaker open - too expensive');
    }
    
    // Check cost
    if (cost > COST_THRESHOLD) {
      this.failures++;
      
      if (this.failures >= this.threshold) {
        this.openCircuit();
      }
      
      throw new Error('Request too expensive');
    }
    
    // Execute
    try {
      const result = await fn();
      this.reset();
      return result;
    } catch (error) {
      this.failures++;
      throw error;
    }
  }
  
  private openCircuit() {
    this.state = 'open';
    console.log('⛔ Circuit breaker OPEN - rejecting expensive requests');
    
    // Auto-reset after timeout
    setTimeout(() => {
      this.state = 'half-open';
      console.log('Circuit breaker HALF-OPEN - testing...');
    }, this.timeout);
  }
  
  private reset() {
    this.failures = 0;
    if (this.state === 'half-open') {
      this.state = 'closed';
      console.log('✅ Circuit breaker CLOSED - normal operation');
    }
  }
}
```

---

## 📊 **COST OPTIMIZATION CHECKLIST**

### **Daily**
- [ ] Review daily costs
- [ ] Check for cost anomalies
- [ ] Review cache hit rate
- [ ] Check for expensive queries

### **Weekly**
- [ ] Analyze top expensive requests
- [ ] Optimize slow queries
- [ ] Review LLM model selection
- [ ] Update cache warming list

### **Monthly**
- [ ] Full cost analysis
- [ ] Identify optimization opportunities
- [ ] Update budgets
- [ ] Review SLA compliance vs cost

---

## ✅ **QUICK WINS**

### **Immediate (Today)**
1. ✅ Enable response caching (60% savings)
2. ✅ Set max output tokens (20% savings)
3. ✅ Use GPT-4o-mini for simple tasks (50% savings)
4. ✅ Implement budget alerts

### **This Week**
5. ✅ Optimize system prompts (30% savings)
6. ✅ Implement context window manager (40% savings)
7. ✅ Add database indexes
8. ✅ Set up cache warming

### **This Month**
9. ✅ Implement prompt caching (30% savings)
10. ✅ Add batch operations
11. ✅ Set up data archival
12. ✅ Implement A/B testing for prompts

**Total Potential Savings: 70-90% cost reduction!** 💰

---

## 🎯 **SUMMARY**

**Key Takeaways:**

1. **Cache Everything** - 60%+ hit rate = 60%+ savings
2. **Optimize Prompts** - Shorter = cheaper
3. **Smart Context** - Don't send full history
4. **Right Model** - Use cheapest model that works
5. **Monitor Costs** - Track every dollar
6. **Automate Controls** - Don't rely on humans

**With these optimizations, you can run Dartmouth OS and multiple agents for $15-30/month at MVP scale, scaling efficiently as you grow!** 🚀

