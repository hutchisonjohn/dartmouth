# 🗺️ AGENT PROJECTS MAP

**Last Updated:** 2025-11-23 AEDT  
**Total Agents Planned:** 14 (see AGENT_SKILLS_INVENTORY.md)  
**Active:** 2 | In Progress:** 2 | Planned: 10

**🎉 NEW:** Sales Agent specification complete! See `SALES_AGENT_SPECIFICATION.md`  
**🎉 NEW:** DOS Infrastructure requirements defined! See `DOS_INFRASTRUCTURE_REQUIREMENTS.md`

---

## 📊 QUICK OVERVIEW

| # | Agent | Status | Platform | Location | Docs |
|---|-------|--------|----------|----------|------|
| 1 | Dartmouth OS Core | ✅ Production | Cloudflare Workers | `agent-army-system/` | [Link](#1-dartmouth-os-core) |
| 2 | McCarthy Artwork | ✅ Production | Web + Cloudflare | `Artwork Analyser AI Agent/` | [Link](#2-mccarthy-artwork-agent) |
| 3 | McCarthy PA | 🚧 Week 2 | React Native | `McCarthy PA Agent/` | [Link](#3-mccarthy-pa-agent) |
| 4 | **McCarthy Sales** 💰 | 🚧 **Week 2-3** | Dartmouth OS | `agent-army-system/packages/` | [Link](#4-mccarthy-sales-agent) |
| 5 | McCarthy CustomerSupport | 📋 Week 4+ | Web Widget | `Customer Service AI Agent/` | [Link](#5-mccarthy-customersupport-agent) |
| 6 | PerfectPrint AI | 📋 Phase 3 | API/Pipeline | `PerfectPrint AI/` | [Link](#6-perfectprint-ai) |
| 7 | AdFusion AI | 📋 Phase 3 | Multi-Agent | `AdFusion AI/` | [Link](#7-adfusion-ai) |
| 8-14 | Research, Copywriter, Outreach, Content, Social, Workflow | 📋 Phase 2-3 | Dartmouth OS | `agent-army-system/packages/` | See AGENT_SKILLS_INVENTORY.md |

---

## 1. DARTMOUTH OS CORE

### **Overview:**
The platform that powers all AI agents. Provides shared services like LLM, database, voice, auth, analytics.

### **Details:**
- **Status:** ✅ Production
- **Version:** 2.0
- **Platform:** Cloudflare Workers
- **Language:** TypeScript
- **Location:** `D:\coding\agent-army-system\`

### **Key Components:**
- `packages/dartmouth-core/` - Core platform services
- `packages/worker/` - Cloudflare Worker (main API)
- `packages/shared/` - Shared types
- `packages/widget/` - Embeddable chat widget
- `docs/` - Complete documentation

### **URLs:**
- **Production:** https://dartmouth-os-worker.dartmouth.workers.dev
- **Staging:** https://dartmouth-os-dev.dartmouth.workers.dev
- **GitHub:** https://github.com/hutchisonjohn/dartmouth

### **API Endpoints:**
- `POST /api/v2/chat` - Chat with any agent
- `GET /api/v2/health` - Health check
- `GET /api/v2/agents` - List all agents

### **Documentation:**
- `docs/dartmouth-os/v2/DARTMOUTH_OS_V2_COMPLETE_SPECIFICATION.md`
- `docs/dartmouth-os/v2/DARTMOUTH_API_V2_DOCUMENTATION.md`
- `docs/dartmouth-os/v2/DARTMOUTH_VOICE_SERVICES_SPECIFICATION.md`

### **Status File:**
- `PROJECT_STATUS.md` (in root)

### **Cost:**
- $15-45/month (all agents combined)

---

## 2. MCCARTHY ARTWORK AGENT

### **Overview:**
AI agent for DTF printing businesses. Analyzes artwork files, calculates DPI, provides print preparation guidance.

### **Details:**
- **Status:** ✅ Production
- **Version:** 1.0 (Dartmouth OS V2)
- **Platform:** React (frontend) + Cloudflare Workers (backend)
- **Language:** TypeScript + React
- **Location:** `D:\coding\Artwork Analyser AI Agent\`

### **Key Components:**
- `src/frontend/` - React app (Vite)
- Backend: Part of Dartmouth OS (`packages/mccarthy-artwork/`)

### **URLs:**
- **Production:** https://artwork-analyser-ai-agent-1qo.pages.dev
- **Backend:** https://dartmouth-os-worker.dartmouth.workers.dev
- **GitHub:** https://github.com/hutchisonjohn/artwork-analyser-ai-agent

### **Features:**
- ✅ Artwork upload and analysis
- ✅ DPI calculations
- ✅ Color palette extraction
- ✅ Print quality assessment
- ✅ AI chat (McCarthy)
- ✅ DTF/UV DTF requirements knowledge base

### **Documentation:**
- `PROJECT_STATUS.md` (in project root)
- `agent-army-system/docs/agents/mccarthy-artwork/`

### **Status File:**
- `PROJECT_STATUS.md`

### **Cost:**
- $10-15/month

---

## 4. MCCARTHY SALES AGENT

### **Overview:**
Sales intelligence agent that handles pricing, quotes, product recommendations, and customer qualification. Seamlessly collaborates with other agents.

### **Details:**
- **Status:** 🚧 Definition complete, ready to build (Week 2-3)
- **Version:** 1.0
- **Platform:** Dartmouth OS (Cloudflare Workers)
- **Language:** TypeScript
- **Location:** `D:\coding\agent-army-system\packages\mccarthy-sales\`

### **Core Smart Skills:**
- Pricing Intelligence (calculate prices, discounts, tax)
- Sales Strategy (upsell, cross-sell, bundles)
- Quote Builder (generate quotes, PDFs)
- Customer Qualification (discovery questions, lead scoring)
- Negotiation (within business rules)

### **Knowledge Domains:**
- `products` (read) - Product catalog from Shopify
- `pricing` (read) - Pricing rules, discounts
- `policies` (read) - Business policies, payment terms

### **Integrations:**
- ShopifyIntegrationService (products, pricing, inventory)
- RAGEngine (multi-domain knowledge search)
- EmailService (send quotes)
- AgentRouter (seamless agent handoff)

### **Dependencies:**
- ❌ Knowledge Domain System (10h) - CRITICAL
- ❌ Shopify Integration Service (15h) - CRITICAL
- 🚧 Agent Context Passing (3h) - HIGH

### **Build Effort:**
- DOS Infrastructure: 28 hours
- Sales Agent: 15 hours
- **Total: 43 hours**

### **Documentation:**
- `SALES_AGENT_SPECIFICATION.md` - Complete specification
- `DOS_INFRASTRUCTURE_REQUIREMENTS.md` - Infrastructure requirements

### **Status File:**
- `SALES_AGENT_SPECIFICATION.md`

### **Timeline:**
- Week 2-3: Build DOS Infrastructure + Sales Agent
- Week 3: Test with Artwork Agent (pricing questions)
- Week 3: Test with Customer Service (quote generation)
- Week 4: Deploy to production

---

## 3. MCCARTHY PA AGENT

### **Overview:**
Voice-first personal assistant for busy families. Manages tasks, calendar, reminders, notes, shopping lists.

### **Details:**
- **Status:** 🚧 Week 2 of 8-week build
- **Version:** V7 (Firebase) → V8 (Dartmouth OS) migration in Week 3-4
- **Platform:** React Native (iOS + Android)
- **Language:** JavaScript + React Native
- **Location:** `D:\coding\McCarthy PA Agent\`

### **Key Components:**
- React Native app (mobile)
- Firebase backend (V7 - current)
- Will migrate to Dartmouth OS (V8 - Week 3-4)

### **URLs:**
- **Production:** Not deployed yet (in development)
- **Backend (V7):** Firebase
- **Backend (V8):** Will use Dartmouth OS

### **Features (Planned):**
- 📅 Task management
- 🗓️ Calendar integration
- 🔔 Reminders (time + location based)
- 📝 Voice notes
- 🛒 Shopping lists
- 🗣️ Voice interaction ("Hey McCarthy")
- 💬 Text chat
- 📍 Location awareness

### **Documentation:**
- `MVP_V1_Full_Developer_Specifications_v7.md` (V7 - current)
- `agent-army-system/docs/agents/mccarthy-pa/v8/` (V8 - future)
- `Dev progress/WEEK_2_TASKS.md` (current tasks)

### **Status File:**
- `Dev progress/WEEK1_COMPLETE_VERIFICATION.md`
- `Dev progress/WEEK_2_TASKS.md`

### **Cost:**
- V7 (Firebase): $45-120/month
- V8 (Dartmouth OS): $15-45/month (70% savings)

### **Timeline:**
- Week 1: ✅ Complete (foundation)
- Week 2: 🚧 In Progress (auth, chat, voice)
- Week 3-4: 📅 Dartmouth OS migration
- Week 5-6: 📅 Core features
- Week 7-8: 📅 Testing, production

---

## 5. MCCARTHY CUSTOMERSUPPORT AGENT

### **Overview:**
AI-powered customer support agent for businesses. Handles inquiries, creates tickets, provides knowledge base answers.

### **Details:**
- **Status:** 📋 Planned (not started)
- **Version:** 1.0 (planned)
- **Platform:** React (web widget) + Dartmouth OS
- **Language:** TypeScript + React
- **Location:** `D:\coding\Customer Service AI Agent\`

### **Key Components:**
- Web widget (embeddable)
- Backend: Dartmouth OS
- Knowledge base integration
- Ticket system integration

### **Features (Planned):**
- 💬 Chat widget for websites
- 📚 Knowledge base search
- 🎫 Ticket creation
- ✉️ Email notifications
- 📊 Analytics dashboard
- 🔗 CRM integration

### **Documentation:**
- `PROJECT_STATUS.md` (basic)
- Design docs (to be created)

### **Status File:**
- `PROJECT_STATUS.md`

### **Cost:**
- Estimated: $20-35/month

### **Timeline:**
- Start: After PA Agent Week 4
- Duration: 4-6 weeks
- Target: Q1 2026

---

## 6. PERFECTPRINT AI

### **Overview:**
Automated artwork processing pipeline. Converts artwork files to print-ready formats with color separation, halftones, etc.

### **Details:**
- **Status:** 📋 Planned (not started)
- **Version:** 1.0 (planned)
- **Platform:** Cloudflare Workers + GCP + Modal
- **Language:** Python + TypeScript
- **Location:** `D:\coding\PerfectPrint AI\`

### **Key Components:**
- Processing pipeline (Modal.com)
- API layer (Cloudflare Workers)
- Storage (GCP Cloud Storage)
- Integration with Artwork Analyzer

### **Features (Planned):**
- 🎨 Automated color separation
- 🖨️ Halftone conversion
- 📐 Resize and optimize
- 🔄 Batch processing
- 📦 Export to print formats
- 🔗 API for other agents

### **Documentation:**
- Architecture docs (in folder)
- API specs (to be created)

### **Status File:**
- None yet

### **Cost:**
- Estimated: $50-150/month (compute-intensive)

### **Timeline:**
- Start: Q1 2026
- Duration: 6-8 weeks

---

## 7. ADFUSION AI

### **Overview:**
Multi-agent creative system for generating marketing content. Orchestrates multiple specialized agents to create ads, social posts, etc.

### **Details:**
- **Status:** 📋 Planned (not started)
- **Version:** 1.0 (planned)
- **Platform:** Dartmouth OS (multi-agent orchestration)
- **Language:** TypeScript
- **Location:** `D:\coding\AdFusion AI\`

### **Key Components:**
- Director Agent (orchestrator)
- Analyzer Agent (vision-language model)
- Copywriter Agent (text generation)
- Creative Agent (image generation)
- Compliance Agent (brand consistency)
- Safe-Zone Agent (export formatting)

### **Features (Planned):**
- 🎨 Multi-agent creative workflow
- 📝 AI copywriting
- 🖼️ Image generation
- 🎯 Brand compliance
- 📊 A/B testing
- 🔄 Iterative refinement

### **Documentation:**
- `AdFusion_Overview.md`
- `AdFusion_Modular_AI_Creative_Engine.md`
- `AdFusion_MVP_Lean_Build.md`

### **Status File:**
- None yet

### **Cost:**
- Estimated: $100-300/month (multiple LLMs + image generation)

### **Timeline:**
- Start: Q2 2026
- Duration: 12+ weeks

---

## 🔗 QUICK LINKS

### **Production URLs:**
- Dartmouth OS: https://dartmouth-os-worker.dartmouth.workers.dev
- Artwork Agent: https://artwork-analyser-ai-agent-1qo.pages.dev
- Staging: https://dartmouth-os-dev.dartmouth.workers.dev

### **GitHub Repos:**
- Dartmouth OS: https://github.com/hutchisonjohn/dartmouth
- Artwork Agent: https://github.com/hutchisonjohn/artwork-analyser-ai-agent

### **Documentation:**
- Master Docs: `D:\coding\DARTMOUTH_OS_PROJECT\`
- Dartmouth OS Docs: `agent-army-system/docs/`
- Agent-Specific Docs: In each project folder

---

## 📊 PROJECT STATISTICS

### **By Status:**
- ✅ Production: 2 (Dartmouth OS, Artwork)
- 🚧 In Progress: 1 (PA Agent)
- 📋 Planned: 3 (CustomerSupport, PerfectPrint, AdFusion)

### **By Platform:**
- Cloudflare Workers: 3
- React Native: 1
- Web (React): 2
- Multi-Agent: 1

### **Total Cost (When All Built):**
- Estimated: $200-500/month
- Current: $25-60/month

---

## 🎯 DEVELOPMENT PRIORITIES

### **Priority 1 (Current):**
1. McCarthy PA Agent (Week 2)
2. Dartmouth OS maintenance

### **Priority 2 (Next 3 Months):**
1. PA Agent completion (Week 3-8)
2. Voice Services implementation
3. Customer Support Agent

### **Priority 3 (Q1-Q2 2026):**
1. PerfectPrint AI
2. AdFusion AI
3. Multi-tenancy features

---

**Last Updated:** 2025-11-22  
**Next Review:** After each new agent added

---

**🗺️ USE THIS MAP TO NAVIGATE ALL PROJECTS!**

