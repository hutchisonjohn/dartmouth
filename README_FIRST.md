# 🎯 DARTMOUTH OS PROJECT - READ THIS FIRST

**Last Updated:** 2025-11-22  
**Status:** Active Development  
**Owner:** John Hutchison

---

## ⚡ START HERE (5-MINUTE READ)

This is the **single source of truth** for the entire Dartmouth OS project and all associated AI agents.

**If you're confused, lost, or just starting → YOU'RE IN THE RIGHT PLACE!**

---

## 🎯 WHAT IS DARTMOUTH OS?

**Dartmouth OS is an operating system for AI agents** - just like Windows manages applications, Dartmouth manages AI agents.

### **Core Concept:**
- **One Platform** → Multiple Specialized Agents
- **Shared Services** → Voice, LLM, Database, Auth, Analytics
- **Unified API** → All agents accessible via single endpoint
- **Cost Optimized** → 70% cheaper than separate systems

### **Think of it like:**
```
iOS/Android (Operating System)
    ↓
Apps (Instagram, WhatsApp, Gmail)

Dartmouth OS (AI Operating System)
    ↓
Agents (PA, Artwork, CustomerSupport, etc.)
```

---

## 📊 PROJECT OVERVIEW

### **What We're Building:**

| Component | Purpose | Status | Completion | Location |
|-----------|---------|--------|------------|----------|
| **Dartmouth OS Core** | Platform services (API, DB, Voice, etc.) | 🚧 47% Complete | See BUILD_STATUS_DETAILED.md | `agent-army-system/` |
| **McCarthy Artwork Agent** | DPI calculations, print prep | ✅ Production | `Artwork Analyser AI Agent/` |
| **McCarthy PA Agent** | Personal assistant (voice + text) | 🚧 Week 2 | `McCarthy PA Agent/` |
| **McCarthy CustomerSupport** | Customer service automation | 📋 Planned | `Customer Service AI Agent/` |
| **PerfectPrint AI** | Artwork processing pipeline | 📋 Planned | `PerfectPrint AI/` |
| **AdFusion AI** | Multi-agent creative system | 📋 Planned | `AdFusion AI/` |

**Legend:**
- ✅ Production = Live and working
- 🚧 In Progress = Actively being built
- 📋 Planned = Designed, not started

---

## 🗂️ WHERE IS EVERYTHING?

### **Project Structure:**
```
D:\coding\
├── DARTMOUTH_OS_PROJECT\              ← YOU ARE HERE (master docs)
│   ├── README_FIRST.md                ← This file
│   ├── ARCHITECTURE_AND_TECH_STACK.md ← System design
│   ├── PROGRESS_TO_DATE.md            ← Current status
│   ├── BACKUP_POLICY.md               ← Backup procedures
│   ├── AGENT_PROJECTS_MAP.md          ← All agent details
│   ├── QUICK_REFERENCE.md             ← URLs, commands, etc.
│   └── backup-all.ps1                 ← Automated backup script
│
├── agent-army-system\                 ← Dartmouth OS Core
│   ├── packages/
│   │   ├── dartmouth-core/            ← Core platform
│   │   ├── mccarthy-artwork/          ← Artwork agent
│   │   ├── worker/                    ← Cloudflare Worker
│   │   └── widget/                    ← Chat widget
│   └── docs/                          ← Platform documentation
│
├── Artwork Analyser AI Agent\         ← Artwork agent frontend
│   └── src/frontend/                  ← React app
│
├── McCarthy PA Agent\                 ← Personal assistant
│   ├── MVP_V1_Full_Developer_Specifications_v7.md
│   └── Dev progress/                  ← Current progress
│
├── Customer Service AI Agent\         ← Customer support
│
├── PerfectPrint AI\                   ← Artwork processing
│
├── AdFusion AI\                       ← Creative multi-agent
│
└── DARTMOUTH OS PROJECT FULL BACKUP\  ← Local backups
```

---

## 🚀 QUICK START (BASED ON YOUR ROLE)

### **👨‍💻 If You're a Developer:**

**Working on PA Agent?**
1. Read: `McCarthy PA Agent/MVP_V1_Full_Developer_Specifications_v7.md`
2. Check: `McCarthy PA Agent/Dev progress/WEEK_2_TASKS.md`
3. Start: Week 2 tasks (auth, chat, voice)

**Working on Dartmouth OS Core?**
1. Read: `agent-army-system/docs/dartmouth-os/v2/DARTMOUTH_OS_V2_COMPLETE_SPECIFICATION.md`
2. Check: `PROGRESS_TO_DATE.md` (this folder)
3. Start: See current sprint tasks

**Working on Other Agents?**
1. Read: `AGENT_PROJECTS_MAP.md` (this folder)
2. Find your agent's folder
3. Read its `PROJECT_STATUS.md`

### **🤖 If You're an AI Assistant (Cursor/Claude):**

**After any restart/reboot:**
1. ✅ Read this file first
2. ✅ Read `PROGRESS_TO_DATE.md`
3. ✅ Read `AGENT_PROJECTS_MAP.md`
4. ✅ Ask user which project they're working on
5. ✅ Read that project's specific docs

**If confused:**
1. Come back to this file
2. Check `PROGRESS_TO_DATE.md` for current status
3. Check `QUICK_REFERENCE.md` for URLs/commands

### **📊 If You're a Project Manager:**

1. Read: `PROGRESS_TO_DATE.md` (current status)
2. Read: `ARCHITECTURE_AND_TECH_STACK.md` (system design)
3. Check: Each agent's `PROJECT_STATUS.md`

---

## 🎯 CURRENT FOCUS (NOVEMBER 2025)

### **Active Work:**
1. **McCarthy PA Agent** - Week 2 of 8-week build
   - Building on Firebase (V7)
   - Auth, chat, voice features
   - Will migrate to Dartmouth OS (V8) in Week 3-4

2. **Dartmouth OS Core** - Production maintenance
   - Artwork Agent fully functional
   - Voice Services specified (not built yet)
   - Staging environment available

### **Recently Completed:**
- ✅ Artwork Analyser migration to Dartmouth OS
- ✅ All scroll/calculation bugs fixed
- ✅ Agent personality and conversation improved
- ✅ Knowledge base loaded and working

### **Next Up:**
- 🔜 PA Agent Week 2 completion (auth, chat, voice)
- 🔜 Voice Services implementation in Dartmouth OS
- 🔜 PA Agent migration to Dartmouth OS (Week 3-4)

---

## 🔗 DEPLOYED SYSTEMS

### **Production:**
- **Dartmouth OS Worker:** https://dartmouth-os-worker.dartmouth.workers.dev
- **Artwork Analyser:** https://artwork-analyser-ai-agent-1qo.pages.dev

### **Staging:**
- **Dartmouth OS Dev:** https://dartmouth-os-dev.dartmouth.workers.dev

### **API Endpoints:**
- **Chat:** `POST /api/v2/chat`
- **Health:** `GET /api/v2/health`
- **Agents:** `GET /api/v2/agents`

---

## 📚 KEY DOCUMENTS TO READ

### **Essential (Read First):**
1. ✅ This file (you're reading it)
2. ✅ `COMPLETE_SYSTEM_REVIEW.md` - **⭐ NEW: Full system review & agent routing**
3. ✅ `BUILD_STATUS_DETAILED.md` - **Detailed build status (47% complete)**
4. ✅ `PROGRESS_TO_DATE.md` - What's done, what's next
5. ✅ `AGENT_PROJECTS_MAP.md` - All agent details

### **Architecture (Read Second):**
1. `ARCHITECTURE_AND_TECH_STACK.md` - System design
2. `agent-army-system/docs/dartmouth-os/v2/DARTMOUTH_OS_V2_COMPLETE_SPECIFICATION.md`

### **Reference (As Needed):**
1. `QUICK_REFERENCE.md` - URLs, commands, cheat sheet
2. `BACKUP_POLICY.md` - How to backup/restore
3. Each agent's `PROJECT_STATUS.md` in their folder

---

## 🆘 EMERGENCY PROCEDURES

### **If Confused About Project Status:**
1. Read `PROGRESS_TO_DATE.md`
2. Check `AGENT_PROJECTS_MAP.md`
3. Read specific agent's `PROJECT_STATUS.md`

### **If Lost in Code:**
1. Check `ARCHITECTURE_AND_TECH_STACK.md`
2. Read agent's documentation in `agent-army-system/docs/agents/`
3. Look at working examples (Artwork Agent)

### **If Need to Restore/Backup:**
1. Read `BACKUP_POLICY.md`
2. Run `backup-all.ps1` from this folder
3. Check `DARTMOUTH OS PROJECT FULL BACKUP/` folder

### **If Starting Fresh (New AI Session):**
1. ✅ Read this file
2. ✅ Read `PROGRESS_TO_DATE.md`
3. ✅ Ask user: "Which project are you working on?"
4. ✅ Read that project's docs
5. ✅ Verify understanding before proceeding

---

## 🎯 SUCCESS CRITERIA

**This documentation is successful if:**
- ✅ Anyone can understand the project in 5 minutes
- ✅ AI assistants never lose context
- ✅ All code is backed up automatically
- ✅ New developers can onboard quickly
- ✅ Project status is always current

---

## 📞 CONTACTS & RESOURCES

### **Owner:**
- **John Hutchison** - Product Owner & Architect

### **Development:**
- **PA Agent Developer** - React Native mobile app
- **AI Assistant (Cursor/Claude Sonnet 4.5)** - Dartmouth OS development

### **Resources:**
- **GitHub:** https://github.com/hutchisonjohn/dartmouth
- **Cloudflare Account:** john@dtf.com.au
- **Documentation:** This folder + `agent-army-system/docs/`

---

## 🚀 NEXT STEPS

**Choose your path:**

1. **Working on PA Agent?**
   → Go to `McCarthy PA Agent/Dev progress/WEEK_2_TASKS.md`

2. **Working on Dartmouth OS?**
   → Read `PROGRESS_TO_DATE.md` then check current sprint

3. **Working on Other Agent?**
   → Read `AGENT_PROJECTS_MAP.md` to find your agent

4. **Just Exploring?**
   → Read `ARCHITECTURE_AND_TECH_STACK.md` next

5. **Need to Backup?**
   → Read `BACKUP_POLICY.md` and run `backup-all.ps1`

---

## ✅ CHECKLIST FOR AI ASSISTANTS

**Before starting ANY work:**
- [ ] Have you read this file?
- [ ] Have you read `PROGRESS_TO_DATE.md`?
- [ ] Do you know which project you're working on?
- [ ] Have you read that project's `PROJECT_STATUS.md`?
- [ ] Have you verified your understanding with the user?

**If you answered NO to any of these → STOP and read those documents first!**

---

**Last Updated:** 2025-11-22  
**Version:** 1.0.0  
**Next Review:** After each major milestone

---

**🎯 YOU NOW HAVE EVERYTHING YOU NEED TO UNDERSTAND THIS PROJECT!**

**Next:** Read `PROGRESS_TO_DATE.md` to see current status.

