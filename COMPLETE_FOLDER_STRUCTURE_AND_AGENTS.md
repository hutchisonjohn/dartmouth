# 📂 COMPLETE FOLDER STRUCTURE & AGENT INVENTORY

**Date:** 2025-11-22  
**Purpose:** Map all projects, agents, and documentation  
**Status:** Complete inventory

---

## 📁 D:\CODING FOLDER STRUCTURE

```
D:\coding\
├── 📦 DARTMOUTH_OS_PROJECT\              ← Master documentation hub
│   ├── README_FIRST.md
│   ├── ARCHITECTURE_AND_TECH_STACK.md
│   ├── PROGRESS_TO_DATE.md
│   ├── BUILD_STATUS_DETAILED.md
│   ├── BACKUP_POLICY.md
│   ├── WORK_DISTRIBUTION_ANALYSIS.md
│   ├── YOUR_DARTMOUTH_ROADMAP.md
│   ├── YOUR_IMMEDIATE_ACTION_PLAN.md
│   ├── DEVELOPER_WORKFLOW_PA_AGENT.md
│   └── ... (all master docs)
│
├── 📦 DEVELOPER_PACKAGE_PA_AGENT\        ← Package for PA developer
│   ├── PA_Agent_Developer_Package.zip    ← Ready to send!
│   ├── README_FIRST.md
│   ├── 01-07 (Developer docs)
│   └── Templates
│
├── 💾 DARTMOUTH OS PROJECT FULL BACKUP\  ← Automated backups
│   ├── DARTMOUTH_OS_BACKUP_*.zip
│   ├── ARTWORK_AGENT_BACKUP_*.zip
│   ├── PA_AGENT_BACKUP_*.zip
│   └── ... (all project backups)
│
├── 🏗️ agent-army-system\                 ← DARTMOUTH OS (Main codebase)
│   ├── packages\
│   │   ├── dartmouth-core\               ← Core platform
│   │   ├── shared\                       ← Shared types
│   │   ├── mccarthy-artwork\             ← Artwork Agent
│   │   └── worker\                       ← Main worker
│   ├── docs\                             ← All Dartmouth docs
│   ├── PROJECT_STATUS.md
│   └── ... (all build docs)
│
├── 🎨 Artwork Analyser AI Agent\         ← Live agent
│   ├── src\
│   │   ├── frontend\                     ← React frontend
│   │   └── worker\                       ← Old worker (migrated)
│   ├── wrangler.toml
│   ├── PROJECT_STATUS.md
│   └── ... (agent files)
│
├── 🤖 McCarthy PA Agent\                 ← React Native mobile app
│   ├── src\                              ← Mobile app code
│   ├── ios\                              ← iOS specific
│   ├── android\                          ← Android specific
│   └── ... (V7 Firebase version)
│
├── 📞 Customer Service AI Agent\         ← Planned agent
│   └── (empty - to be built)
│
├── 🖨️ PerfectPrint AI\                   ← Image processing system
│   ├── packages\
│   │   ├── worker\                       ← Cloudflare Worker
│   │   ├── processor-mvp1\               ← Basic processing
│   │   ├── processor-mvp2\               ← Advanced processing
│   │   ├── starvector-gpu\               ← GPU vectorization
│   │   └── frontend\                     ← UI
│   ├── PERFECTPRINT_AI_MASTER_PLAN.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   └── ... (all specs)
│
├── 📢 AdFusion AI\                       ← Creative intelligence system
│   ├── AdFusion_Overview.md
│   ├── AdFusion_Modular_AI_Creative_Engine.md
│   ├── AdFusion_MVP_Lean_Build.md
│   ├── AdFusion_Cloud_Expansion_Full_Version.md
│   └── AdFusion_UI_Wireframes.md
│
├── 🎨 CreativeStudio AI\                 ← Design automation
│   ├── ai_creative_studio_overview.md
│   ├── # AI Creative Studio – Foundations.md
│   ├── # AI Creative Studio – PART 2.md
│   └── # AI Creative Studio – Web App.md
│
├── 🎨 Swatch Creator\                    ← (Unknown - to investigate)
│   └── ...
│
├── 📦 packages\                          ← (Duplicate? To investigate)
│   └── ...
│
└── 📦 src\                               ← (Duplicate? To investigate)
    └── ...
```

---

## 🤖 COMPLETE AGENT INVENTORY

### **✅ DOCUMENTED & IN PROGRESS:**

#### **1. McCarthy PA Agent** 🤖
- **Status:** Developer building (Weeks 2-8)
- **Location:** `D:\coding\McCarthy PA Agent\` (V7 Firebase)
- **New Location:** `D:\coding\agent-army-system\packages\mccarthy-pa\` (V8 Dartmouth - developer building)
- **Type:** React Native mobile app (iOS + Android)
- **Purpose:** Voice-first personal assistant
- **Features:**
  - Task management
  - Calendar integration
  - Reminders
  - Notes
  - Shopping lists
  - Voice input/output
- **Backend:** Migrating from Firebase to Dartmouth OS
- **Priority:** 🔴 HIGH (Developer working now)

---

#### **2. Artwork Analyser AI Agent** 🎨
- **Status:** ✅ Live in production
- **Location:** `D:\coding\Artwork Analyser AI Agent\`
- **Dartmouth Location:** `D:\coding\agent-army-system\packages\mccarthy-artwork\`
- **Type:** Web-based agent
- **Purpose:** Artwork analysis for print preparation
- **Features:**
  - DPI calculation
  - Print size recommendations
  - UV DTF requirements check
  - Color analysis
  - File format validation
  - Knowledge base (DTF, UV DTF, printing)
- **Frontend:** React (Cloudflare Pages)
- **Backend:** Dartmouth OS Worker
- **URL:** https://artwork-analyser-ai-agent-1qo.pages.dev
- **Priority:** 🟢 LIVE (Improvements ongoing)

---

#### **3. Customer Service AI Agent** 📞
- **Status:** ⏸️ Planned (Week 3-4)
- **Location:** `D:\coding\Customer Service AI Agent\` (empty)
- **Dartmouth Location:** `D:\coding\agent-army-system\packages\mccarthy-customersupport\` (to be created)
- **Type:** Web-based agent + embeddable widget
- **Purpose:** Customer support automation
- **Features:**
  - Ticket creation
  - FAQ responses
  - Escalation logic
  - Knowledge base search
  - Multi-channel (chat, email)
- **Integrations:** Zendesk, Intercom
- **Priority:** 🟡 MEDIUM (Week 3-4)

---

#### **4. PerfectPrint AI** 🖨️
- **Status:** ⚠️ Partially built (architecture complete)
- **Location:** `D:\coding\PerfectPrint AI\`
- **Type:** Image processing system
- **Purpose:** Artwork preparation for printing
- **Features:**
  - **Background removal** ⭐
  - **Image scaling** ⭐
  - **Vectorization** ⭐
  - Color separation
  - Halftone conversion
  - Format conversion
  - DPI optimization
  - Print-ready export
- **Architecture:**
  - Cloudflare Workers (API)
  - GCP Cloud Functions (processing)
  - Modal.com (GPU tasks - vectorization)
  - R2 Storage (files)
- **Priority:** 🟡 MEDIUM (Week 7+)
- **Note:** ⭐ = Core services needed by multiple agents

---

#### **5. AdFusion AI** 📢
- **Status:** ⚠️ Documented (not built)
- **Location:** `D:\coding\AdFusion AI\`
- **Type:** Creative intelligence system
- **Purpose:** AI-powered ad creation & optimization
- **Features:**
  - Ad analysis (visual + copy)
  - Creative generation
  - Multi-format output
  - Psychology-based copywriting
  - Brand voice matching
  - Performance prediction
  - Safe-zone compliance
- **Sub-Agents:**
  - AdFusion Core (Director)
  - Analyzer Agent
  - Copywriter Agent
  - Creative Agent
  - Compliance Agent
  - Safe-Zone Agent
- **Models:** Qwen-VL, CLIP, LLMs
- **Priority:** 🟡 MEDIUM (After PerfectPrint)

---

#### **6. CreativeStudio AI** 🎨
- **Status:** ⚠️ Partially documented
- **Location:** `D:\coding\CreativeStudio AI\`
- **Type:** Design automation platform
- **Purpose:** AI-driven design for promotional merchandise
- **Features:**
  - Pattern generation
  - Wrap engine (300 DPI)
  - Mockup engine
  - QC engine
  - DREA (Design Reverse-Engineering Agent)
  - Customer personalization
- **Two Platforms:**
  - Main SaaS (Studio)
  - Shopify App (Customer-facing)
- **Priority:** 🟡 MEDIUM (After AdFusion)

---

### **❌ NOT DOCUMENTED (Need Specs!):**

#### **7. Research AI Agent** 🔍
- **Status:** ❌ Not documented
- **Location:** None
- **Purpose:** ??? (Need details)
- **Features:** ??? (Need details)
- **Integrations:** ??? (Need details)
- **Priority:** ??? (Need details)

---

#### **8. Copywriter AI Agent** ✍️
- **Status:** ❌ Not documented
- **Location:** None
- **Purpose:** ??? (Need details)
- **Features:** ??? (Need details)
- **Integrations:** ??? (Need details)
- **Priority:** ??? (Need details)
- **Note:** Might overlap with AdFusion's Copywriter Agent?

---

#### **9. Cold Outreach AI Agent** 📧
- **Status:** ❌ Not documented
- **Location:** None
- **Purpose:** ??? (Need details)
- **Features:** ??? (Need details)
- **Integrations:** ??? (Need details)
- **Priority:** ??? (Need details)

---

#### **10. Content Creator AI Agent** 📝
- **Status:** ❌ Not documented
- **Location:** None
- **Purpose:** ??? (Need details)
- **Features:** ??? (Need details)
- **Integrations:** ??? (Need details)
- **Priority:** ??? (Need details)
- **Note:** Might overlap with AdFusion or CreativeStudio?

---

#### **11. Social Media Publisher AI Agent** 📱
- **Status:** ❌ Not documented
- **Location:** None
- **Purpose:** ??? (Need details)
- **Features:** ??? (Need details)
- **Integrations:** ??? (Need details)
- **Priority:** ??? (Need details)

---

## 🔧 SHARED SERVICES NEEDED IN DARTMOUTH OS

Based on documented agents, these services are needed by MULTIPLE agents:

### **🎨 Image Processing Service** (CRITICAL!)
**Used by:** PerfectPrint, Artwork Analyser, CreativeStudio, AdFusion, Social Media Publisher

**Features:**
- ✅ Background removal
- ✅ Image scaling
- ✅ Vectorization
- ✅ Format conversion
- ✅ DPI optimization
- ✅ Color separation
- ✅ Compression/optimization

**Priority:** 🔴 HIGH (Build FIRST - shared by 5+ agents)

---

### **🧠 Vision/Analysis Service**
**Used by:** AdFusion, CreativeStudio, Artwork Analyser, Content Creator

**Features:**
- Image analysis (Qwen-VL, CLIP)
- OCR (text extraction)
- Object detection
- Style analysis
- Color palette extraction
- Composition analysis

**Priority:** 🔴 HIGH (Build FIRST - shared by 4+ agents)

---

### **✍️ Content Generation Service**
**Used by:** AdFusion, Copywriter, Content Creator, Social Media Publisher, Cold Outreach

**Features:**
- Copywriting (ads, emails, posts)
- Content templates
- Brand voice matching
- SEO optimization
- Multi-format output

**Priority:** 🟡 MEDIUM (Build after image services)

---

### **🔍 Research/Scraping Service**
**Used by:** Research Agent, Cold Outreach, AdFusion

**Features:**
- Web scraping
- Data extraction
- API integrations
- Search capabilities
- Data structuring

**Priority:** 🟡 MEDIUM

---

### **📱 Social Media Integration Service**
**Used by:** Social Media Publisher, AdFusion, Content Creator

**Features:**
- Platform APIs (Facebook, Instagram, LinkedIn, Twitter, TikTok)
- Post scheduling
- Analytics
- Media upload
- Engagement tracking

**Priority:** 🟡 MEDIUM

---

### **📧 Email/Outreach Service**
**Used by:** Cold Outreach, Customer Service, PA Agent

**Features:**
- Email sending (SMTP, APIs)
- Email templates
- Personalization
- Tracking
- CRM integration

**Priority:** 🟢 LOW (PA Agent already building email)

---

### **📊 Analytics Service**
**Used by:** All agents

**Features:**
- Usage tracking
- Performance metrics
- User analytics
- Cost tracking
- Reporting

**Priority:** 🟡 MEDIUM

---

## 🎯 WHAT I NEED FROM YOU

To create your complete build plan, I need specs for the 5 undocumented agents:

**Quick format (copy/paste and fill in):**

```
Research AI Agent:
- Purpose: [What does it do?]
- Features: [Top 3-5 features]
- Integrations: [What external services?]
- Shared Services: [Image processing? Content gen? Research?]
- Priority: [High/Medium/Low]
- When needed: [Now? Q1 2026? Q2 2026?]

Copywriter AI Agent:
- Purpose: [What does it do?]
- Features: [Top 3-5 features]
- Integrations: [What external services?]
- Shared Services: [Content gen? Research?]
- Priority: [High/Medium/Low]
- When needed: [Now? Q1 2026? Q2 2026?]
- Note: Is this different from AdFusion's Copywriter Agent?

Cold Outreach AI Agent:
- Purpose: [What does it do?]
- Features: [Top 3-5 features]
- Integrations: [Email? CRM? LinkedIn?]
- Shared Services: [Email? Research? Content gen?]
- Priority: [High/Medium/Low]
- When needed: [Now? Q1 2026? Q2 2026?]

Content Creator AI Agent:
- Purpose: [What does it do?]
- Features: [Top 3-5 features]
- Integrations: [What external services?]
- Shared Services: [Image processing? Content gen? Vision?]
- Priority: [High/Medium/Low]
- When needed: [Now? Q1 2026? Q2 2026?]
- Note: Is this different from AdFusion or CreativeStudio?

Social Media Publisher AI Agent:
- Purpose: [What does it do?]
- Features: [Top 3-5 features]
- Integrations: [Which platforms?]
- Shared Services: [Social media? Image processing? Content gen?]
- Priority: [High/Medium/Low]
- When needed: [Now? Q1 2026? Q2 2026?]
```

---

## 📋 NEXT STEPS

### **Option 1: You Provide Specs (30 min)**
Fill in the template above for the 5 undocumented agents.

### **Option 2: I Analyze & Propose (1 hour)**
Based on common patterns, I propose what these agents likely do, and you confirm/adjust.

### **Option 3: We Build Core Services First (NOW)**
We start building the shared services (Image Processing, Vision, Content Gen) that we KNOW are needed by documented agents, and add the 5 new agents later.

---

## 🚀 MY RECOMMENDATION

**PHASE 1 (Weeks 2-4): Build Core Shared Services**
1. Image Processing Service (background removal, scaling, vectorization)
2. Vision/Analysis Service (Qwen-VL, CLIP, OCR)
3. Content Generation Service (copywriting, templates)

**PHASE 2 (Weeks 5-8): Build Documented Agents**
1. Customer Support Agent (Week 3-4)
2. PerfectPrint AI first agent (Week 7+)
3. Platform improvements (analytics, multi-tenancy)

**PHASE 3 (Q1 2026): Build Remaining Agents**
1. Get specs for 5 undocumented agents
2. Build in priority order
3. Reuse all core services

**This way:**
- ✅ Core services built once, used everywhere
- ✅ Developer not blocked (PA Agent independent)
- ✅ You can use agents as they're built
- ✅ Scalable architecture

---

**What do you prefer?**

1. Provide specs now (30 min)
2. I propose specs (1 hour)
3. Build core services first, specs later (START NOW)

---

**Last Updated:** 2025-11-22  
**Status:** Awaiting your input on 5 undocumented agents

