# 🎼 Dartmouth OS
## The Operating System & Heart of the AI Agent Fleet

**Version:** 2.0.0  
**Status:** Production (V1.0) + Active Development (V2.0)  
**Purpose:** Unified platform for building, deploying, and managing AI agents

---

## 🚀 Quick Start

- **[Getting Started Guide](GETTING_STARTED.md)** - Start here!
- **[Dartmouth OS V2.0 Specification](docs/dartmouth-os/v2/DARTMOUTH_OS_V2_COMPLETE_SPECIFICATION.md)** - Complete platform docs
- **[Agent Development Guide](docs/dartmouth-os/guides/AGENT_DEVELOPMENT_GUIDE.md)** - Build your first agent

---

## 📚 Documentation

### **Dartmouth OS Core**
- [V2.0 Complete Specification](docs/dartmouth-os/v2/DARTMOUTH_OS_V2_COMPLETE_SPECIFICATION.md) ⭐ **NEW**
- [Voice Services](docs/dartmouth-os/v2/DARTMOUTH_VOICE_SERVICES_SPECIFICATION.md) ⭐ **NEW**
- [Multi-Modal Services](docs/dartmouth-os/v2/DARTMOUTH_MULTIMODAL_SERVICES_SPECIFICATION.md) ⭐ **NEW**
- [Orchestration Services](docs/dartmouth-os/v2/DARTMOUTH_ORCHESTRATION_SERVICES_SPECIFICATION.md) ⭐ **NEW**
- [API V2 Documentation](docs/dartmouth-os/v2/DARTMOUTH_API_V2_DOCUMENTATION.md)
- [V1.0 Documentation](docs/dartmouth-os/v1/) (Current Production)

### **Agents**
- **[McCarthy PA Agent](docs/agents/mccarthy-pa/v8/)** - Voice + Text Personal Assistant ⭐ **NEW V8**
- **[McCarthy CustomerSupport AI](docs/agents/mccarthy-customersupport/)** - Customer service agent ⭐ **NEW**
- **[McCarthy Artwork Analyzer](docs/agents/mccarthy-artwork/)** - DPI calculations & print prep
- **[FAM (Foundational Agent)](docs/agents/fam/)** - Base agent template

### **Projects**
- **[PerfectPrint AI](docs/projects/perfectprint-ai/)** - Artwork processing pipeline
- **[AdFusion AI](docs/projects/adfusion-ai/)** - Multi-agent creative system

### **UI/UX**
- **[Tailwind UI Design System](docs/ui-design/TAILWIND_UI_DESIGN_SYSTEM.md)** - Consistent design across all projects

---

## 🎯 What is Dartmouth OS?

**Dartmouth OS is the operating system for AI agents** - just like Windows manages applications, Dartmouth manages agents.

### **The Heart & OS Analogy**

**Like an Operating System:**
- Provides services (analytics, cache, security, integrations)
- Manages resources (CPU, memory, tokens, costs)
- Monitors health (SLA, uptime, performance)
- Orchestrates workflows (agent-to-agent communication)

**Like a Heart:**
- Pumps "blood" (data & context) to all agents
- Heartbeat keeps agents alive
- Event system distributes notifications
- Intelligence improves all agents
- Security protects the entire system

---

## 🏗️ Architecture

### **Dartmouth OS V2.0 (9 Layers, 33 Services)**

```
╔═══════════════════════════════════════════════════════════════╗
║                    DARTMOUTH OS V2.0                           ║
╠═══════════════════════════════════════════════════════════════╣
║  Layer 1: Monitoring & Health (3 services)                    ║
║  Layer 2: Performance & Optimization (3 services)              ║
║  Layer 3: Security & Compliance (3 services)                   ║
║  Layer 4: Integration & Communication (3 services)             ║
║  Layer 5: Intelligence & Learning (3 services)                 ║
║  Layer 6: User Experience (3 services)                         ║
║  Layer 7: Voice & Audio Services (6 services) ⭐ NEW          ║
║  Layer 8: Multi-Modal Intelligence (4 services) ⭐ NEW         ║
║  Layer 9: Orchestration & Workflows (5 services) ⭐ NEW        ║
╚═══════════════════════════════════════════════════════════════╝
         │
         │ PROVIDES SERVICES TO
         │
    ┌────▼────┐  ┌────▼────┐  ┌────▼────┐  ┌────▼────┐
    │McCarthy │  │McCarthy │  │McCarthy │  │  Future │
    │   PA    │  │ Artwork │  │Customer │  │ Agents  │
    │         │  │Analyzer │  │Support  │  │         │
    └─────────┘  └─────────┘  └─────────┘  └─────────┘
```

---

## 💰 Cost Efficiency

### **Unified vs Fragmented**

| Approach | Monthly Cost | Agents Supported |
|----------|--------------|------------------|
| **Fragmented** (separate systems) | $405 | 5 agents |
| **Dartmouth OS** (unified) | $185 | Unlimited |
| **Savings** | **$220/month (54%)** | **Scales better** |

**Key Optimizations:**
- Multi-layer caching (60%+ hit rate = 60%+ LLM cost savings)
- Shared infrastructure (no duplication)
- Smart context management (70% token reduction)
- Real-time cost tracking & alerts

---

## 🎤 Voice Agents

Dartmouth OS V2.0 adds full voice support:

- **Speech-to-Text** (Deepgram, OpenAI Whisper, Native)
- **Text-to-Speech** (F5-TTS, OpenAI TTS, ElevenLabs, Native)
- **Audio Streaming** (WebRTC, WebSockets)
- **Voice Activity Detection** (Silero VAD)
- **Interrupt Handling** (real-time conversation)

**Voice Agents:**
- McCarthy PA (Voice + Text Personal Assistant)
- Receptionist Agent (Planned)
- Sales Agent (Planned)
- Customer Service Agent (Voice capability planned)

---

## 🧠 Multi-Modal Intelligence

Process images, audio, video, and documents:

- **Vision-Language Models** (Qwen2-VL, GPT-4o, Claude 3)
- **Document Intelligence** (OCR, PDF parsing)
- **Audio-Text Context** (emotion detection from voice)
- **Multi-Modal Context Fusion** (combine text + voice + image + location)

---

## 🔄 Orchestration & Workflows

Coordinate multiple agents working together:

- **Agent-to-Agent Communication** (agents call each other)
- **Swarm Coordination** (AdFusion multi-agent workflows)
- **Workflow Engine** (sequential/parallel tasks)
- **Agent Registry** (discover and register agents)
- **Cross-Agent Memory** (share context between agents)

---

## 🚀 Getting Started

### **For Developers:**

1. **Read:** [Getting Started Guide](GETTING_STARTED.md)
2. **Explore:** [Agent Development Guide](docs/dartmouth-os/guides/AGENT_DEVELOPMENT_GUIDE.md)
3. **Build:** Extend [FAM](docs/agents/fam/) to create your agent
4. **Deploy:** Follow [Deployment Guide](docs/dartmouth-os/guides/DEPLOYMENT_GUIDE_V2.md)

### **For McCarthy PA Developer:**

1. **Read:** [McCarthy PA V8 Architecture](docs/agents/mccarthy-pa/v8/MCCARTHY_PA_DARTMOUTH_ARCHITECTURE.md)
2. **Migrate:** [Developer Migration Guide](docs/agents/mccarthy-pa/v8/MCCARTHY_PA_DEVELOPER_GUIDE.md)
3. **Voice:** [Voice Implementation Guide](docs/agents/mccarthy-pa/v8/MCCARTHY_PA_VOICE_IMPLEMENTATION.md)
4. **API:** [API Reference](docs/agents/mccarthy-pa/v8/MCCARTHY_PA_API_REFERENCE.md)

---

## 📦 Project Structure

```
dartmouth-os/
├── docs/                  ← All documentation
│   ├── dartmouth-os/     ← Platform docs (v1, v2)
│   ├── agents/           ← Agent docs (PA, Artwork, CustomerSupport, FAM)
│   ├── projects/         ← PerfectPrint, AdFusion
│   ├── integration/      ← Cross-project integration
│   └── ui-design/        ← Tailwind UI design system
│
├── packages/             ← Code (monorepo)
│   ├── dartmouth-core/   ← Dartmouth OS core
│   ├── agents/           ← Agent implementations
│   ├── mccarthy-pa/      ← McCarthy PA (React Native)
│   └── ui/               ← Shared UI components
│
└── tools/                ← Development tools & scripts
```

---

## 🎨 UI/UX Consistency

**All projects use the same Tailwind UI design system:**

- [Tailwind UI Design System](docs/ui-design/TAILWIND_UI_DESIGN_SYSTEM.md)
- [Brand Guidelines](docs/ui-design/BRAND_GUIDELINES.md)
- [Component Library](docs/ui-design/COMPONENT_LIBRARY.md)

**Ensures:**
- ✅ Consistent look & feel across all agents
- ✅ Reusable components
- ✅ Faster development
- ✅ Professional brand identity

---

## 📊 Current Status

### **Production (V1.0)**
- ✅ Dartmouth OS Core (18 services)
- ✅ FAM (Foundational Agent)
- ✅ McCarthy Artwork Analyzer
- ✅ Chat widget UI
- ✅ API Gateway
- ✅ Cost: $15-85/month

### **Active Development (V2.0)**
- 🚧 Voice Services (Layer 7)
- 🚧 Multi-Modal Services (Layer 8)
- 🚧 Orchestration Services (Layer 9)
- 🚧 McCarthy PA Agent V8 (Dartmouth-based)
- 🚧 McCarthy CustomerSupport AI
- 🚧 PerfectPrint AI Integration
- 🚧 AdFusion AI Integration

---

## 🤝 Contributing

This is a private project. For questions or collaboration:
- **Email:** [Contact info]
- **Documentation:** See [docs/](docs/)
- **Issues:** Track in project management system

---

## 📄 License

**Copyright © 2024 John Hutchison. All Rights Reserved.**

This project and all associated materials are proprietary and confidential.

---

## 🔗 Quick Links

- [Dartmouth OS V2.0 Spec](docs/dartmouth-os/v2/DARTMOUTH_OS_V2_COMPLETE_SPECIFICATION.md)
- [McCarthy PA V8 Docs](docs/agents/mccarthy-pa/v8/)
- [Voice Services Spec](docs/dartmouth-os/v2/DARTMOUTH_VOICE_SERVICES_SPECIFICATION.md)
- [API Documentation](docs/dartmouth-os/v2/DARTMOUTH_API_V2_DOCUMENTATION.md)
- [Agent Development Guide](docs/dartmouth-os/guides/AGENT_DEVELOPMENT_GUIDE.md)
- [Tailwind UI Design System](docs/ui-design/TAILWIND_UI_DESIGN_SYSTEM.md)

---

**Dartmouth OS - Build once, deploy everywhere. One platform, infinite agents.** 🚀
