# System Prompt Configuration Guide

**Last Updated:** November 19, 2024  
**Status:** ✅ Implemented & Documented

---

## 📋 **Overview**

System prompts are the core instructions that define an AI agent's personality, expertise, and behavior. In the Dartmouth Agent Army System, system prompts are **fully configurable** and can be customized per agent.

---

## 🎯 **Where System Prompts Are Defined**

### **1. Foundational Agent (Default)**
**Location:** `packages/worker/src/routes/chat.ts`

**Purpose:** Provides default conversational skills for generic agents

**Current Prompt:**
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

---

### **2. Specialized Agents (Custom)**
**Example:** `packages/mccarthy-artwork/src/McCarthyArtworkAgent.ts`

**Purpose:** Overrides the foundational prompt with agent-specific expertise

**How It Works:**
```typescript
constructor(config: AgentConfig) {
    // Override system prompt BEFORE calling super()
    config.systemPrompt = `[Custom specialized prompt here]`;
    
    // Initialize foundation with custom prompt
    super(config);
}
```

**Current McCarthy Prompt:**
```
You are McCarthy, an expert artwork analysis assistant specializing in DTF and UV DTF printing.

Your expertise includes:
- DPI calculations and print size recommendations
- Artwork quality assessment
- DTF/UV DTF technical requirements
- Print preparation guidance
- File format and resolution advice

CRITICAL CONVERSATION RULES:
- ALWAYS read the full conversation history before responding
- If the user says "it", "that", "this size", etc., refer to what was JUST discussed
- If you just provided a calculation, and they ask a follow-up, USE that calculation data
- NEVER ask for information you already have from previous messages
- Maintain context throughout the conversation
- Be conversational and reference what was said before

PERSONALITY:
- Friendly and professional
- Use emojis sparingly (📐, 🎨, ✨, 💡)
- Acknowledge previous messages ("Based on your 800x1200 at 72 DPI artwork...")
- Be helpful and proactive

CONSTRAINTS:
- NEVER discuss pricing, discounts, or refunds - those are handled by the sales team
- ALWAYS provide accurate technical information
- If you don't know something, say so and offer to escalate
```

---

## 🔧 **Future: Dartmouth Dashboard Configuration**

### **Planned Features:**

#### **1. Visual Prompt Editor**
- Web-based UI for editing system prompts
- Syntax highlighting and validation
- Preview mode to test prompts
- Version history and rollback

#### **2. Prompt Templates**
- Pre-built templates for common agent types:
  - Customer Support Agent
  - Technical Support Agent
  - Sales Agent
  - Product Expert Agent
  - General Assistant Agent

#### **3. Prompt Components**
- Modular sections that can be mixed and matched:
  - Core Conversational Skills (standard)
  - Domain Expertise (customizable)
  - Personality Traits (selectable)
  - Constraints (configurable)
  - Response Guidelines (customizable)

#### **4. Per-Agent Configuration**
- Each agent can have its own unique system prompt
- Prompts stored in database (D1)
- Hot-reload without redeployment
- A/B testing support

#### **5. Prompt Variables**
- Dynamic insertion of:
  - Agent name
  - Company name
  - Contact information
  - Business hours
  - Product catalog
  - Current promotions

---

## 📊 **System Prompt Architecture**

```
┌─────────────────────────────────────────┐
│     Dartmouth Dashboard (Future)        │
│  - Visual Prompt Editor                 │
│  - Template Library                     │
│  - Version Control                      │
└─────────────┬───────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────┐
│         Database (D1)                   │
│  - Agent Configurations                 │
│  - System Prompts                       │
│  - Prompt History                       │
└─────────────┬───────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────┐
│      Worker (Runtime)                   │
│  - Loads prompt from DB                 │
│  - Falls back to code default           │
│  - Passes to LLM                        │
└─────────────────────────────────────────┘
```

---

## 🎯 **Current Implementation**

### **How to Change System Prompts Now:**

#### **For Foundational Agent:**
1. Edit `packages/worker/src/routes/chat.ts`
2. Modify the `systemPrompt` field in `getBaseAgentConfig()`
3. Deploy to Cloudflare Workers

#### **For Specialized Agents:**
1. Edit the agent's constructor (e.g., `McCarthyArtworkAgent.ts`)
2. Modify `config.systemPrompt` before calling `super()`
3. Deploy to Cloudflare Workers

---

## ✅ **Best Practices**

### **1. Prompt Structure**
```
[WHO YOU ARE]
Brief identity statement

[EXPERTISE]
List of capabilities and knowledge areas

[CONVERSATION RULES]
How to maintain context and handle follow-ups

[PERSONALITY]
Tone, style, and communication preferences

[CONSTRAINTS]
What NOT to do or discuss
```

### **2. Context Awareness**
Always include instructions to:
- Read full conversation history
- Reference previous messages
- Use context from earlier in conversation
- Never ask for information already provided

### **3. Constraints**
Clearly define:
- Topics to avoid (pricing, medical advice, legal advice)
- Actions agent cannot perform
- When to escalate to humans

### **4. Testing**
After changing prompts:
- Test conversation memory
- Test constraint enforcement
- Test personality consistency
- Test domain expertise accuracy

---

## 🚀 **Roadmap**

### **Phase 1: Current (✅ Complete)**
- Hardcoded system prompts in code
- Override mechanism for specialized agents
- Enhanced foundational prompt

### **Phase 2: Database Storage (🔄 Planned)**
- Store prompts in D1 database
- Load at runtime
- Hot-reload capability

### **Phase 3: Dashboard UI (📋 Planned)**
- Visual prompt editor
- Template library
- Version control
- A/B testing

### **Phase 4: Advanced Features (💡 Future)**
- Prompt variables and templating
- Multi-language support
- Prompt optimization suggestions
- Performance analytics

---

## 📝 **Notes**

- System prompts are **critical** to agent behavior
- Changes should be tested thoroughly
- Keep prompts focused and clear
- Avoid overly long prompts (LLM token limits)
- Document all changes to prompts
- Consider backward compatibility

---

## 🔗 **Related Documentation**

- [Agent Architecture](./DARTMOUTH_BLUEPRINT.md)
- [McCarthy Artwork Analyzer](./packages/mccarthy-artwork/README.md)
- [Constraint System](./FOUNDATION_TESTING_SUMMARY.md)
- [Deployment Guide](./MCCARTHY_DEPLOYMENT_SUMMARY.md)

---

**End of Document**

