# 🎯 DARTMOUTH - THE COMPLETE BLUEPRINT

**Version:** 1.0.0  
**Date:** November 18, 2025  
**Status:** Foundation Build In Progress

---

## 📖 **TABLE OF CONTENTS**

1. [What is Dartmouth?](#what-is-dartmouth)
2. [The Vision](#the-vision)
3. [Core Architecture](#core-architecture)
4. [How It Works](#how-it-works)
5. [Key Components](#key-components)
6. [The Conversation Quality System](#the-conversation-quality-system)
7. [McCarthy Agents](#mccarthy-agents)
8. [Agent Constraints](#agent-constraints)
9. [System Prompt Configuration](#system-prompt-configuration)
10. [Multi-Agent Orchestration](#multi-agent-orchestration)
11. [Technical Stack](#technical-stack)
12. [Deployment](#deployment)
13. [What Makes Dartmouth Different](#what-makes-dartmouth-different)

---

## 🎯 **WHAT IS DARTMOUTH?**

**Dartmouth** is a foundational platform for building, deploying, and orchestrating an "army" of specialized AI agents (called **McCarthy agents**) that work together to help small businesses automate tasks, improve efficiency, and deliver exceptional customer experiences.

### **In Simple Terms:**

Think of Dartmouth as:
- **The Foundation** - Like a building's foundation that every agent is built on
- **The Orchestrator** - Like a conductor managing an orchestra of specialized agents
- **The Dashboard** - Where users create, configure, and manage their agents
- **The Quality Controller** - Ensures every agent is personal, helpful, and accurate

### **What It Does:**

1. **Provides a Foundation** - Every McCarthy agent starts with Dartmouth's core capabilities
2. **Routes Conversations** - Directs user requests to the right specialized agent
3. **Orchestrates Collaboration** - Enables multiple agents to work together seamlessly
4. **Enforces Quality** - Ensures all agents are conversational, empathetic, and accurate
5. **Manages Memory** - Remembers conversations across all agents
6. **Prevents Errors** - Stops hallucinations, repetition, and broken promises

---

## 🌟 **THE VISION**

### **The Problem:**

Small businesses struggle with:
- ❌ Too many tasks, not enough time
- ❌ Wearing too many hats
- ❌ Things slipping through the cracks
- ❌ Can't afford to hire staff
- ❌ Lack specialized skills
- ❌ Poor customer experience due to overwhelm

### **The Solution:**

**Dartmouth + McCarthy Agents** = Your AI workforce

Instead of hiring:
- A customer service rep
- A personal assistant
- A content researcher
- A copywriter
- An artwork specialist
- A social media manager

You get **McCarthy agents** that:
- ✅ Work 24/7
- ✅ Never forget anything
- ✅ Cost pennies to run
- ✅ Work together seamlessly
- ✅ Learn and improve
- ✅ Feel personal and helpful

### **The End Goal:**

Help small businesses automate tasks they don't have time/skills/staff for, so they can focus on what they do best while their McCarthy agents handle the rest.

---

## 🏗️ **CORE ARCHITECTURE**

### **The Three Layers:**

```
┌─────────────────────────────────────────────────────────┐
│ LAYER 1: DARTMOUTH FOUNDATION                           │
│ (Domain-Agnostic Core - All Agents Start Here)          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ❤️ Conversation Quality System                          │
│   ├── Personality & Empathy                             │
│   ├── Conversation Validation                           │
│   └── Quality Scoring (0-100)                           │
│                                                          │
│ 🧠 Core Intelligence                                     │
│   ├── Conversation State Manager                        │
│   ├── Intent Detector                                   │
│   ├── Memory System (4 types)                           │
│   ├── RAG Engine                                        │
│   └── Response Validator                                │
│                                                          │
│ 🎯 Agent Orchestration                                  │
│   ├── Agent Router                                      │
│   ├── Agent Registry                                    │
│   ├── Agent Orchestrator                                │
│   └── Constraints Validator                             │
│                                                          │
│ 🛡️ Safety & Quality                                     │
│   ├── Repetition Detector                               │
│   ├── Frustration Handler                               │
│   ├── Hallucination Prevention                          │
│   └── Promise Tracking                                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ LAYER 2: McCARTHY AGENTS                                │
│ (Specialized Agents - Built on Foundation)              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 🎨 McCarthy Artwork Analyzer                            │
│   ├── Inherits: All Foundation capabilities             │
│   ├── Adds: Calculation Engine                          │
│   ├── Adds: DTF/UV DTF Knowledge                        │
│   ├── Adds: Artwork-specific handlers                   │
│   └── Constraints: No pricing, no discounts             │
│                                                          │
│ 📅 McCarthy Personal Assistant (Future)                 │
│   ├── Inherits: All Foundation capabilities             │
│   ├── Adds: Task management                             │
│   ├── Adds: Calendar integration                        │
│   └── Constraints: No financial decisions               │
│                                                          │
│ 📝 McCarthy Content Researcher (Future)                 │
│ ✍️ McCarthy Copywriter (Future)                         │
│ 📱 McCarthy Social Media Manager (Future)               │
│ 🤝 McCarthy Customer Service (Future)                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ LAYER 3: DARTMOUTH DASHBOARD                            │
│ (User Interface - Manage Everything)                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 🎛️ Agent Management                                     │
│   ├── Create new McCarthy agents                        │
│   ├── Configure agent settings                          │
│   ├── Set constraints & rules                           │
│   └── Monitor agent performance                         │
│                                                          │
│ 💬 Unified Chat Interface                               │
│   ├── Talk to any agent                                 │
│   ├── Seamless agent handoffs                           │
│   ├── View conversation history                         │
│   └── Agent collaboration visible                       │
│                                                          │
│ 📊 Analytics & Insights                                 │
│   ├── Conversation quality scores                       │
│   ├── Agent performance metrics                         │
│   ├── User satisfaction tracking                        │
│   └── Cost & usage monitoring                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ **HOW IT WORKS**

### **Conversation Flow:**

```
1. USER SENDS MESSAGE
   ↓
2. DARTMOUTH FOUNDATION RECEIVES IT
   ├── Load conversation state
   ├── Detect user's intent
   ├── Detect user's sentiment (frustrated? confused? excited?)
   └── Check conversation history
   ↓
3. ROUTE TO APPROPRIATE AGENT
   ├── Is this an artwork question? → McCarthy Artwork
   ├── Is this a scheduling request? → McCarthy PA
   ├── Is this a general question? → Foundation handlers
   └── Is this complex? → Multi-agent collaboration
   ↓
4. AGENT PROCESSES REQUEST
   ├── Use specialized knowledge (RAG documents)
   ├── Perform calculations (if needed)
   ├── Access memory (remember past conversations)
   └── Generate response
   ↓
5. CONVERSATION QUALITY SYSTEM VALIDATES
   ├── Add empathy based on user sentiment
   ├── Check for verbosity (max 200 words)
   ├── Check for hallucinations (CRITICAL)
   ├── Check for technical jargon
   ├── Check for repetition
   ├── Score 0-100 (must pass 70+)
   └── Block if critical issues found
   ↓
6. CONSTRAINTS VALIDATOR CHECKS
   ├── Check forbidden phrases ("I'll get back to you")
   ├── Check forbidden actions (offer discount)
   ├── Check business rules
   └── Escalate if needed
   ↓
7. RESPONSE SENT TO USER
   ├── Store in memory
   ├── Update conversation state
   ├── Log quality metrics
   └── Track sentiment
```

---

## 🧩 **KEY COMPONENTS**

### **1. Conversation Quality System** ❤️ (THE HEART)

**Purpose:** Ensures every agent is personal, conversational, and helpful.

**Components:**
- **ConversationQualityValidator** - Validates every response (0-100 score)
- **EmpathyInjector** - Adds empathy based on user sentiment
- **PersonalityPrompt** - Defines Dartmouth personality for all agents

**What It Checks:**
- ✅ Verbosity (max 200 words)
- ✅ Technical jargon (must explain)
- ✅ Hallucinations (CRITICAL - never make up info)
- ✅ Repetition (don't loop)
- ✅ Broken promises (no "I'll get back to you")
- ✅ Tone (friendly, not robotic)
- ✅ Empathy (based on user sentiment)

**Example:**

**Before (Robotic):**
```
Your artwork resolution is below the recommended 300 DPI standard.
```

**After (With Conversation Quality):**
```
Hey! I checked your artwork - it's looking good! At 28cm wide, 
you'll get 245 DPI which is still really nice quality.
```

---

### **2. Agent Router**

**Purpose:** Routes user requests to the right McCarthy agent.

**How It Works:**
1. Analyzes user's intent
2. Finds capable agents
3. Routes to single agent OR orchestrates multi-agent collaboration
4. Handles "coming soon" agents gracefully

**Example:**
```
User: "What size can I print 4000x6000 at 300 DPI?"
→ Routes to: McCarthy Artwork Analyzer

User: "Schedule a meeting to review artwork guidelines"
→ Routes to: McCarthy PA + McCarthy Artwork (collaboration)

User: "How much does it cost?"
→ Routes to: Sales team (escalation)
```

---

### **3. Agent Orchestrator**

**Purpose:** Coordinates multiple agents working together.

**Collaboration Types:**

**Sequential:**
```
User asks complex question
  ↓
Agent A handles part 1
  ↓
Agent A asks Agent B for help
  ↓
Agent B provides expertise
  ↓
Agent A synthesizes final answer
```

**Parallel:**
```
User asks multi-faceted question
  ↓
Agent A + Agent B + Agent C work simultaneously
  ↓
Dartmouth combines responses
  ↓
User gets comprehensive answer
```

**Hierarchical:**
```
Manager Agent creates plan
  ↓
Worker Agent 1 executes step 1
  ↓
Worker Agent 2 executes step 2
  ↓
Manager Agent finalizes result
```

---

### **4. Constraints Validator**

**Purpose:** Enforces business rules and prevents unauthorized actions.

**Three Levels:**

**Global Constraints (All Agents):**
- ❌ Never offer discounts
- ❌ Never offer refunds
- ❌ Never share customer data
- ❌ Never promise "I'll get back to you" without follow-through

**Tenant Constraints (Business-Specific):**
- ❌ Never waive setup fees
- ❌ Never promise rush orders without fee
- ✅ Always mention "no minimum orders"

**Agent Constraints (Agent-Specific):**
- McCarthy Artwork: ❌ Can't quote pricing
- McCarthy PA: ❌ Can't make financial decisions
- McCarthy Sales: ✅ CAN offer discounts (exception)

---

### **5. Memory System**

**Purpose:** Remember everything across all conversations and agents.

**Four Types:**

**Short-Term Memory:**
- Current conversation
- Lasts for session duration
- Fast access

**Long-Term Memory:**
- Past conversations
- User preferences
- Historical data
- Persists forever

**Semantic Memory:**
- Facts and knowledge
- Business information
- Product details
- Policies

**Episodic Memory:**
- Specific events
- "Last time you ordered..."
- "You usually prefer..."
- Patterns and trends

---

### **6. RAG Engine**

**Purpose:** Provide accurate, sourced answers from knowledge base.

**How It Works:**
1. User asks question
2. RAG searches knowledge base
3. Retrieves relevant documents
4. Injects into agent's context
5. Agent uses info to answer
6. Cites sources when appropriate

**Example:**
```
User: "What are DTF printing requirements?"

RAG Engine:
  → Searches: DTF_Artwork_Requirements.md
  → Retrieves: "Minimum text 2.5mm, lines 1mm, no transparency"
  → Injects into context

Agent Response:
"For DTF printing, here's what you need:
• Text should be at least 2.5mm tall (8pt)
• Lines need to be at least 1mm thick
• Avoid semi-transparent pixels - DTF needs 100% opacity
• 300 DPI is the sweet spot"
```

---

## ❤️ **THE CONVERSATION QUALITY SYSTEM**

### **The 6 Non-Negotiables:**

1. **NEVER HALLUCINATE**
   - Only use provided data
   - Say "I don't know" rather than guess
   - Be transparent about confidence

2. **NEVER IGNORE RAG/CONTEXT**
   - Use ALL provided information
   - Reference specific details
   - Cite sources

3. **NEVER FORGET CONVERSATION HISTORY**
   - Remember everything said
   - Never ask for info already provided
   - Build on previous exchanges

4. **NEVER REPEAT THE SAME RESPONSE**
   - If previous response didn't help, try different approach
   - Don't get stuck in loops
   - Escalate if truly can't help

5. **NEVER MAKE PROMISES YOU CAN'T KEEP**
   - Don't say "I'll get back to you" unless you will
   - Either help NOW or escalate
   - Be honest about capabilities

6. **ALWAYS PUT THE CUSTOMER FIRST**
   - Focus on solving their problem
   - Be helpful, not just informative
   - Provide actionable next steps

### **Personality Traits:**

Every Dartmouth agent is:
- ✅ Warm and welcoming (like a helpful friend)
- ✅ Empathetic and understanding
- ✅ Positive and encouraging
- ✅ Professional but friendly
- ✅ Concise (2-4 sentences ideal)
- ✅ Clear and actionable

---

## 🎨 **McCARTHY AGENTS**

### **What Are McCarthy Agents?**

McCarthy agents are **specialized super agents** built on the Dartmouth foundation. Each agent:
- ✅ Inherits ALL foundation capabilities
- ✅ Adds domain-specific knowledge
- ✅ Has specialized tools/engines
- ✅ Follows specific constraints
- ✅ Maintains Dartmouth personality

### **Current McCarthy Agents:**

#### **1. McCarthy Artwork Analyzer** (In Development)

**Purpose:** Analyze artwork for printing (DTF, UV DTF)

**Capabilities:**
- Calculate DPI and print sizes
- Analyze artwork quality
- Provide DTF/UV DTF guidance
- Explain technical requirements
- Suggest improvements

**Specialized Components:**
- CalculationEngine (pre-computed math)
- DTF Knowledge Base (RAG documents)
- Artwork-specific handlers

**Constraints:**
- ❌ Cannot quote pricing
- ❌ Cannot offer discounts
- ❌ Cannot promise delivery dates
- ✅ Must route pricing to sales

**System Prompt:** Fully configurable (see [System Prompt Configuration](#system-prompt-configuration))

**Example Conversation:**
```
User: "What size can I print 4000x6000 at 300 DPI?"

McCarthy Artwork:
"Hey! Your artwork is 4000x6000 pixels.

At 300 DPI, you can print up to 34cm x 51cm at perfect quality. 
That's roughly the size of a large poster!

What size were you thinking of printing?"
```

---

### **Future McCarthy Agents:**

#### **2. McCarthy Personal Assistant**
- Task management
- Calendar scheduling
- Email handling
- Reminders & follow-ups

#### **3. McCarthy Content Researcher**
- Information gathering
- Fact-checking
- Source verification
- Topic discovery

#### **4. McCarthy Copywriter**
- Email writing
- Social media posts
- Ad copy
- Article drafts

#### **5. McCarthy Customer Service**
- Order tracking
- Issue resolution
- Product information
- Returns & refunds (with approval)

#### **6. McCarthy Social Media Manager**
- Post scheduling
- Content planning
- Engagement monitoring
- Analytics tracking

---

## 🛡️ **AGENT CONSTRAINTS**

### **Why Constraints Matter:**

Without constraints, agents could:
- ❌ Offer unauthorized discounts
- ❌ Promise things they can't deliver
- ❌ Make financial decisions
- ❌ Share private information
- ❌ Break business rules

### **How Constraints Work:**

```
User: "Can you give me a discount?"
  ↓
Agent attempts: "Sure! I can give you 15% off!"
  ↓
Constraints Validator: ❌ VIOLATION DETECTED
  - Forbidden action: "offer_discount"
  - Agent: McCarthy Artwork
  ↓
Force regenerate with constraint guidance
  ↓
Agent regenerates: "I don't have access to create discounts, 
but I can connect you with our sales team who can discuss 
special pricing. Would you like me to do that?"
  ↓
✅ SAFE - Helpful but doesn't violate business rules
```

---

## 🎨 **SYSTEM PROMPT CONFIGURATION**

### **What Are System Prompts?**

System prompts are the **core instructions** that define an AI agent's:
- Identity and expertise
- Personality and tone
- Conversation rules
- Constraints and limitations

### **Configurability**

✅ **Fully Configurable** - System prompts can be customized per agent  
✅ **Dashboard Editable** (Future) - Visual editor in Dartmouth Dashboard  
✅ **Template Library** (Planned) - Pre-built prompts for common agent types  
✅ **Version Control** (Planned) - Track changes and rollback if needed

### **Current Implementation**

#### **Foundational Agent (Default)**
All agents inherit a base prompt with:
- Core conversational skills
- Context awareness
- Professional personality
- Response guidelines

#### **Specialized Agents (Custom)**
Each specialized agent can override with:
- Domain-specific expertise
- Specialized personality traits
- Custom constraints
- Unique conversation rules

### **Example: McCarthy Artwork Analyzer**

```
You are McCarthy, an expert artwork analysis assistant 
specializing in DTF and UV DTF printing.

EXPERTISE:
- DPI calculations and print size recommendations
- Artwork quality assessment
- DTF/UV DTF technical requirements

CONVERSATION RULES:
- ALWAYS read full conversation history
- Reference previous messages
- Maintain context throughout conversation

PERSONALITY:
- Friendly and professional
- Use emojis sparingly (📐, 🎨, ✨)
- Acknowledge previous messages

CONSTRAINTS:
- NEVER discuss pricing, discounts, or refunds
- ALWAYS provide accurate technical information
```

### **Future Dashboard Features**

- 🎨 Visual prompt editor with syntax highlighting
- 📚 Template library for common agent types
- 🔄 Version control and rollback
- 🧪 A/B testing for prompt optimization
- 📊 Performance analytics per prompt version

**Full Documentation:** [System Prompt Configuration Guide](./SYSTEM_PROMPT_CONFIGURATION.md)

---

## 🤝 **MULTI-AGENT ORCHESTRATION**

### **Example: Customer Service + Artwork Collaboration**

```
User: "I ordered 50 shirts but the logo looks pixelated"

McCarthy Customer Service (Primary Agent):
  1. Checks order: Order #5678, logo was 800x600px
  2. Recognizes: This needs artwork expertise
  3. Consults McCarthy Artwork: "Is 800x600 enough for 4-inch logo?"
  
McCarthy Artwork Analyzer (Support Agent):
  4. Calculates: "No, that's only 150 DPI - needs 1200x900 minimum"
  5. Provides: Technical explanation and solution
  
McCarthy Customer Service (Synthesizes):
  6. Responds to user:
  
"I'm sorry about the pixelation! I checked your order and found 
the issue - your logo (800x600px) is too small for a 4-inch print.

For sharp results, you need at least 1200x900px (300 DPI).

I can help you:
1. Reprint with a larger logo file (if you have one)
2. Reduce the logo size to 2.67 inches (will be sharp)
3. Process a refund

What would you prefer?"
```

**User Experience:**
- ✅ Seamless (didn't know two agents worked together)
- ✅ Expert (got technical + customer service help)
- ✅ Actionable (clear options provided)
- ✅ Empathetic (acknowledged frustration)

---

## 💻 **TECHNICAL STACK**

### **Backend (Cloudflare Workers):**
- **Language:** TypeScript
- **Framework:** Hono (lightweight web framework)
- **Runtime:** Cloudflare Workers (serverless)
- **Database:** Cloudflare D1 (SQL)
- **Cache:** Cloudflare KV (key-value store)
- **AI:** Cloudflare Workers AI (embeddings)
- **LLM:** OpenAI GPT-4 / Anthropic Claude

### **Frontend (Dartmouth Dashboard):**
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Hosting:** Cloudflare Pages

### **Infrastructure:**
- **Deployment:** Cloudflare (Workers + Pages)
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Monitoring:** Cloudflare Analytics

---

## 🚀 **DEPLOYMENT**

### **Architecture:**

```
User Browser
  ↓
Cloudflare CDN (Global Edge Network)
  ↓
┌─────────────────────────────────────┐
│ Cloudflare Pages (Frontend)         │
│ - React Dashboard                   │
│ - Static Assets                     │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ Cloudflare Workers (Backend)        │
│ - Dartmouth Foundation              │
│ - McCarthy Agents                   │
│ - API Endpoints                     │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ Cloudflare D1 (Database)            │
│ - Conversation history              │
│ - Memory storage                    │
│ - RAG documents                     │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ Cloudflare KV (Cache)               │
│ - Configuration                     │
│ - API keys (encrypted)              │
│ - Session data                      │
└─────────────────────────────────────┘
```

### **Cost:**

**Free Tier (Cloudflare):**
- 100,000 requests/day (Workers)
- 10GB storage (D1)
- 1GB storage (KV)
- Unlimited bandwidth (Pages)

**Paid Tier (if needed):**
- $5/month (Workers)
- $0.50/million requests
- $0.75/GB storage

**LLM Costs:**
- OpenAI: ~$0.01-0.03 per conversation
- Anthropic: ~$0.02-0.04 per conversation

**Total:** ~$10-50/month for small business

---

## ⭐ **WHAT MAKES DARTMOUTH DIFFERENT**

### **vs. Traditional Chatbots:**

| Feature | Traditional Chatbot | Dartmouth |
|---------|-------------------|-----------|
| Personality | Robotic | Personal & conversational |
| Memory | Forgets after session | Remembers forever |
| Accuracy | Hallucinates | Never makes up info |
| Specialization | One-size-fits-all | Specialized McCarthy agents |
| Collaboration | Single agent | Multi-agent orchestration |
| Quality Control | None | Every response validated |
| Business Rules | Hardcoded | Flexible constraints |
| Empathy | None | Sentiment-aware responses |

### **vs. Building Custom Agents:**

| Aspect | Custom Build | Dartmouth |
|--------|-------------|-----------|
| Time to Build | Months | Days |
| Cost | $50k-200k | $0-50/month |
| Conversation Quality | Hit or miss | Guaranteed |
| Memory System | Build from scratch | Built-in |
| Multi-Agent | Complex | Built-in |
| Maintenance | Ongoing effort | Minimal |
| Scalability | Difficult | Easy (add agents) |

### **vs. Other AI Platforms:**

**Dartmouth is:**
- ✅ **Modular** - Start with one agent, add more as needed
- ✅ **Affordable** - Serverless = pay only for what you use
- ✅ **Personal** - Conversation quality is built-in
- ✅ **Flexible** - Customize constraints per business
- ✅ **Collaborative** - Agents work together seamlessly
- ✅ **Safe** - Prevents hallucinations and unauthorized actions

---

## 🎯 **SUCCESS METRICS**

### **Conversation Quality:**
- Score: 70+ (out of 100)
- Empathy: Detected and applied
- Verbosity: Under 200 words
- Hallucinations: Zero
- User Satisfaction: High

### **Agent Performance:**
- Response Time: <2 seconds
- Accuracy: 95%+
- Escalation Rate: <5%
- User Retention: High

### **Business Impact:**
- Time Saved: 10-20 hours/week
- Cost Savings: $2k-5k/month vs. hiring
- Customer Satisfaction: Improved
- Revenue: Increased (24/7 availability)

---

## 📚 **RELATED DOCUMENTS**

- `BUILD_PLAN.md` - Complete build plan with phases
- `WHERE_WE_ARE.md` - Current progress and status
- `CONVERSATION_QUALITY_REQUIREMENTS.md` - Quality guidelines
- `AGENT_ARMY_SYSTEM.md` - Technical specification
- `REFACTORING_PLAN.md` - Refactoring strategy
- `ARTWORK_ANALYZER_REVIEW.md` - Lessons learned

---

**Last Updated:** November 18, 2025  
**Version:** 1.0.0  
**Status:** Foundation Build In Progress 🚀

---

**Dartmouth: Building the future of AI-powered small business automation, one McCarthy agent at a time.** ❤️

