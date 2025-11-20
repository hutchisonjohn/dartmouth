# 🚀 Getting Started with Dartmouth OS

**Welcome! This guide will help you get up and running with Dartmouth OS.**

---

## 📋 Table of Contents

1. [What is Dartmouth OS?](#what-is-dartmouth-os)
2. [Quick Start (5 minutes)](#quick-start-5-minutes)
3. [For McCarthy PA Developer](#for-mccarthy-pa-developer)
4. [For Agent Developers](#for-agent-developers)
5. [For Project Integrators](#for-project-integrators)
6. [Next Steps](#next-steps)

---

## 🎯 What is Dartmouth OS?

**Dartmouth OS is the operating system for AI agents** - just like Windows manages applications, Dartmouth manages agents.

### **Key Concepts:**

**1. Platform Services (33 services across 9 layers)**
- Monitoring & Health
- Performance & Optimization
- Security & Compliance
- Integration & Communication
- Intelligence & Learning
- User Experience
- Voice & Audio Services ⭐ **NEW**
- Multi-Modal Intelligence ⭐ **NEW**
- Orchestration & Workflows ⭐ **NEW**

**2. Agents (specialized AI assistants)**
- **FAM** - Foundational Agent (base template)
- **McCarthy PA** - Personal Assistant (voice + text)
- **McCarthy Artwork Analyzer** - DPI calculations
- **McCarthy CustomerSupport** - Customer service
- **Future agents** - Lead Scraping, Cold Outreach, etc.

**3. Projects (integrated systems)**
- **PerfectPrint AI** - Artwork processing
- **AdFusion AI** - Multi-agent creative system

---

## ⚡ Quick Start (5 minutes)

### **Step 1: Choose Your Path**

**Are you:**
- 👨‍💻 **McCarthy PA Developer?** → [Go here](#for-mccarthy-pa-developer)
- 🤖 **Building a new agent?** → [Go here](#for-agent-developers)
- 🔗 **Integrating a project?** → [Go here](#for-project-integrators)
- 📚 **Just exploring?** → Keep reading!

### **Step 2: Read Core Documentation**

**Everyone should read:**
1. [README.md](README.md) - Project overview
2. [Dartmouth OS V2.0 Spec](docs/dartmouth-os/v2/DARTMOUTH_OS_V2_COMPLETE_SPECIFICATION.md) - Platform architecture

**Estimated time:** 20 minutes

### **Step 3: Set Up Your Environment**

```bash
# Clone repository
git clone https://github.com/[org]/dartmouth-os.git
cd dartmouth-os

# Install dependencies
npm install

# Set up environment variables
cp .env.example .dev.vars
# Edit .dev.vars with your API keys

# Start development server
npm run dev
```

---

## 👨‍💻 For McCarthy PA Developer

### **Your Mission:**
Migrate McCarthy PA Agent from Firebase (V7) to Dartmouth OS (V8)

### **Start Here (in order):**

1. **[McCarthy PA Architecture](docs/agents/mccarthy-pa/v8/MCCARTHY_PA_DARTMOUTH_ARCHITECTURE.md)** (15 min)
   - Understand the big picture
   - See cost savings (70%)
   - Review migration timeline

2. **[Developer Migration Guide](docs/agents/mccarthy-pa/v8/MCCARTHY_PA_DEVELOPER_GUIDE.md)** (30 min)
   - Step-by-step migration instructions
   - Code examples (V7 → V8)
   - Data migration process

3. **[Voice Implementation Guide](docs/agents/mccarthy-pa/v8/MCCARTHY_PA_VOICE_IMPLEMENTATION.md)** (20 min)
   - STT/TTS integration
   - F5-TTS setup
   - Audio streaming

4. **[API Reference](docs/agents/mccarthy-pa/v8/MCCARTHY_PA_API_REFERENCE.md)** (reference)
   - Complete API docs
   - Use during development

**Total Reading Time:** ~65 minutes

### **Quick Links:**
- [McCarthy PA V8 Docs](docs/agents/mccarthy-pa/v8/)
- [Dartmouth Voice Services](docs/dartmouth-os/v2/DARTMOUTH_VOICE_SERVICES_SPECIFICATION.md)
- [Dartmouth API V2](docs/dartmouth-os/v2/DARTMOUTH_API_V2_DOCUMENTATION.md)

### **Your Timeline:**
- **Week 2-3:** Parallel development (build V8)
- **Week 4:** Data migration
- **Week 5-6:** Gradual rollout
- **Week 7:** Decommission V7

---

## 🤖 For Agent Developers

### **Your Mission:**
Build a new AI agent on Dartmouth OS

### **Start Here (in order):**

1. **[FAM Complete Specification](docs/agents/fam/FAM_COMPLETE_SPECIFICATION.md)** (30 min)
   - Understand the base agent template
   - 14 core components
   - Architecture & design patterns

2. **[Agent Development Guide](docs/dartmouth-os/guides/AGENT_DEVELOPMENT_GUIDE.md)** (20 min)
   - How to build your first agent
   - Extend FAM
   - Best practices

3. **[Dartmouth API Documentation](docs/dartmouth-os/v2/DARTMOUTH_API_V2_DOCUMENTATION.md)** (reference)
   - All available services
   - API endpoints
   - Authentication

**Total Reading Time:** ~50 minutes

### **Quick Start Code:**

```typescript
// packages/agents/my-agent/src/MyAgent.ts
import { BaseAgent } from '@dartmouth/core';

export class MyAgent extends BaseAgent {
  constructor() {
    super({
      agentId: 'my-agent',
      name: 'My Agent',
      description: 'My awesome agent',
      systemPrompt: 'You are a helpful assistant...',
    });
  }

  async handleIntent(intent: string, entities: any): Promise<string> {
    // Your agent logic here
    return 'Response from my agent';
  }
}
```

### **Deploy Your Agent:**

```bash
# Test locally
npm run dev

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

---

## 🔗 For Project Integrators

### **Your Mission:**
Integrate an existing project (e.g., PerfectPrint AI, AdFusion AI) with Dartmouth OS

### **Start Here (in order):**

1. **[Dartmouth OS V2.0 Spec](docs/dartmouth-os/v2/DARTMOUTH_OS_V2_COMPLETE_SPECIFICATION.md)** (30 min)
   - Understand platform services
   - See what's available

2. **[Integration Guide](docs/integration/DARTMOUTH_PROJECT_INTEGRATION_MAP.md)** (20 min)
   - How projects integrate
   - Service dependencies
   - API usage

3. **[Your Project Docs](docs/projects/)** (varies)
   - PerfectPrint AI
   - AdFusion AI
   - etc.

**Total Reading Time:** ~50 minutes

### **Integration Patterns:**

**Option 1: Agent Integration**
- Build your project as a Dartmouth agent
- Use all platform services
- Example: McCarthy CustomerSupport AI

**Option 2: Service Integration**
- Expose your project as a Dartmouth service
- Other agents can call your service
- Example: PerfectPrint AI (artwork processing service)

**Option 3: Orchestration Integration**
- Use Dartmouth Orchestration for multi-agent workflows
- Example: AdFusion AI (multi-agent creative system)

---

## 🎯 Next Steps

### **After Reading Documentation:**

1. **Set up your development environment**
   ```bash
   git clone https://github.com/[org]/dartmouth-os.git
   cd dartmouth-os
   npm install
   cp .env.example .dev.vars
   npm run dev
   ```

2. **Run tests**
   ```bash
   npm run test
   npm run test:integration
   ```

3. **Build something!**
   - McCarthy PA Developer: Start migration
   - Agent Developer: Build your first agent
   - Project Integrator: Plan integration

### **Get Help:**

- **Slack:** #dartmouth-os-development
- **Email:** [Contact]
- **Docs:** [docs/](docs/)
- **GitHub Issues:** [Repository]

---

## 📚 Essential Documentation

### **Platform**
- [Dartmouth OS V2.0 Complete Spec](docs/dartmouth-os/v2/DARTMOUTH_OS_V2_COMPLETE_SPECIFICATION.md)
- [Voice Services Spec](docs/dartmouth-os/v2/DARTMOUTH_VOICE_SERVICES_SPECIFICATION.md)
- [Multi-Modal Services Spec](docs/dartmouth-os/v2/DARTMOUTH_MULTIMODAL_SERVICES_SPECIFICATION.md)
- [Orchestration Services Spec](docs/dartmouth-os/v2/DARTMOUTH_ORCHESTRATION_SERVICES_SPECIFICATION.md)
- [API V2 Documentation](docs/dartmouth-os/v2/DARTMOUTH_API_V2_DOCUMENTATION.md)

### **Agents**
- [FAM Complete Specification](docs/agents/fam/FAM_COMPLETE_SPECIFICATION.md)
- [McCarthy PA V8 Docs](docs/agents/mccarthy-pa/v8/)
- [McCarthy Artwork Analyzer](docs/agents/mccarthy-artwork/)
- [McCarthy CustomerSupport AI](docs/agents/mccarthy-customersupport/)

### **Guides**
- [Agent Development Guide](docs/dartmouth-os/guides/AGENT_DEVELOPMENT_GUIDE.md)
- [Deployment Guide](docs/dartmouth-os/guides/DEPLOYMENT_GUIDE_V2.md)
- [Cost Optimization Guide](docs/dartmouth-os/v1/COST_OPTIMIZATION_GUIDE.md)

### **UI/UX**
- [Tailwind UI Design System](docs/ui-design/TAILWIND_UI_DESIGN_SYSTEM.md)
- [Brand Guidelines](docs/ui-design/BRAND_GUIDELINES.md)
- [Component Library](docs/ui-design/COMPONENT_LIBRARY.md)

---

## 💡 Tips for Success

### **1. Start Small**
- Don't try to read everything at once
- Focus on your specific path (PA developer, agent developer, etc.)
- Build something simple first

### **2. Use Examples**
- Look at existing agents (FAM, McCarthy PA, Artwork Analyzer)
- Copy patterns that work
- Adapt to your needs

### **3. Ask Questions**
- Use Slack (#dartmouth-os-development)
- Check documentation first
- Share what you learn

### **4. Test Early, Test Often**
- Write tests as you build
- Use the test suite
- Deploy to staging first

---

## 🚀 Ready to Build?

**Choose your path:**
- 👨‍💻 [McCarthy PA Developer](#for-mccarthy-pa-developer)
- 🤖 [Agent Developer](#for-agent-developers)
- 🔗 [Project Integrator](#for-project-integrators)

**Or explore:**
- 📚 [Full Documentation](docs/)
- 🏗️ [Architecture Diagrams](docs/dartmouth-os/v2/DARTMOUTH_ARCHITECTURE_DIAGRAMS_V2.md)
- 💰 [Cost Model](docs/dartmouth-os/v2/DARTMOUTH_COST_MODEL_V2.md)

---

**Dartmouth OS - Build once, deploy everywhere. One platform, infinite agents.** 🚀

