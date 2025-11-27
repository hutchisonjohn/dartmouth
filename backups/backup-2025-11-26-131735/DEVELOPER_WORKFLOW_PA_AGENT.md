# 👨‍💻 DEVELOPER WORKFLOW - PA AGENT ON DARTMOUTH OS (OPTION B)

**Created:** 2025-11-22  
**Updated:** 2025-11-22 (Option B - Developer builds everything)  
**Purpose:** Complete workflow for PA Agent developer to work on Dartmouth OS  
**Status:** Active - Developer builds Voice Services + PA Agent

---

## 🎯 SITUATION SUMMARY

### **What We Have:**
- ✅ Dartmouth OS Core (Production) - Layers 1-6
- ✅ FAM (Foundational Agent McCarthy) - Base agent
- ✅ Voice Services **SPECIFIED** (Layer 7) - Not built yet
- ✅ PA Agent Week 1 complete (Firebase V7)

### **What We Need:**
- 🚧 **Voice Services BUILT** (Layer 7) - Developer builds
- 🚧 **Calendar/Email APIs** (Layer 4) - Developer builds
- 🚧 **JWT Auth** (Layer 3) - Developer builds
- 🚧 **PA Agent Backend** - Developer builds
- 🚧 **PA Agent Frontend** - Developer builds

### **The Solution (Option B):**
- ✅ Developer builds EVERYTHING (Voice, Calendar, Auth, PA Agent)
- ✅ Developer starts immediately (no waiting)
- ✅ You + AI review PRs and merge
- ✅ You + AI continue building other agents in parallel
- ✅ Faster overall delivery

---

## 🏗️ ARCHITECTURE ANSWER (Question 2)

### **YES! Layer 7 (Voice Services) is in the Architecture**

**Location:** `agent-army-system/docs/dartmouth-os/v2/DARTMOUTH_VOICE_SERVICES_SPECIFICATION.md`

**Status:** ✅ **FULLY SPECIFIED** but ❌ **NOT BUILT YET**

### **What Layer 7 Provides:**

```
DARTMOUTH VOICE SERVICES (Layer 7)
├── STT Service (Speech-to-Text)
│   ├── Native STT (iOS/Android) - PRIMARY (free)
│   ├── F5-TTS - BACKUP ($0.01/min)
│   └── Whisper - FALLBACK ($0.006/min)
│
├── TTS Service (Text-to-Speech)
│   ├── Native TTS (iOS/Android) - PRIMARY (free)
│   ├── F5-TTS - BACKUP ($0.01/min)
│   └── ElevenLabs - PREMIUM ($0.30/min)
│
├── Audio Streaming (WebRTC)
├── VAD (Voice Activity Detection)
└── Interrupt Handling
```

### **What PA Agent Builds On Top:**

```
PA AGENT (extends FAM + Voice Services)
├── Inherits from FAM (Foundational Agent)
│   ├── Intent Detection
│   ├── Handler Routing
│   ├── LLM Integration
│   ├── Memory Management
│   └── Response Validation
│
├── Uses Voice Services (Layer 7)
│   ├── STT for user voice input
│   ├── TTS for agent responses
│   ├── Streaming for real-time conversations
│   └── VAD for wake word detection
│
└── Adds PA-Specific Handlers
    ├── TaskHandler (create, list, complete tasks)
    ├── CalendarHandler (schedule, view events)
    ├── ReminderHandler (time + location based)
    ├── NoteHandler (voice notes, transcription)
    └── ShoppingListHandler (add, remove items)
```

---

## 🔀 GIT WORKFLOW (Question 3)

### **Repository Strategy: FORK + FEATURE BRANCHES**

```
Main Repo (hutchisonjohn/dartmouth)
    ├── main (production)
    ├── dev (staging)
    └── feature/* (our features)
    
Developer Fork (developer-username/dartmouth)
    ├── main (synced with upstream)
    ├── dev (synced with upstream)
    └── pa-agent/* (PA Agent work)
        ├── pa-agent/voice-services
        ├── pa-agent/task-handler
        ├── pa-agent/calendar-handler
        └── pa-agent/frontend
```

### **Step-by-Step Workflow:**

#### **1. Initial Setup (Developer - One Time)**

```bash
# 1. Fork the repo on GitHub
# Go to: https://github.com/hutchisonjohn/dartmouth
# Click "Fork" button

# 2. Clone the fork
git clone https://github.com/[developer-username]/dartmouth.git dartmouth-pa-agent
cd dartmouth-pa-agent

# 3. Add upstream remote
git remote add upstream https://github.com/hutchisonjohn/dartmouth.git

# 4. Create pa-agent branch
git checkout -b pa-agent/main

# 5. Install dependencies
npm install

# 6. Test local development
cd packages/worker
npx wrangler dev
```

#### **2. Daily Development (Developer)**

```bash
# Start of day: Sync with upstream
git checkout pa-agent/main
git fetch upstream
git merge upstream/main

# Create feature branch
git checkout -b pa-agent/voice-services

# Make changes, test locally
# ... code, code, code ...

# Commit changes
git add .
git commit -m "feat(voice): Implement STT service"

# Push to fork
git push origin pa-agent/voice-services

# Create Pull Request on GitHub
# From: developer-username/dartmouth (pa-agent/voice-services)
# To: hutchisonjohn/dartmouth (dev)
```

#### **3. Review & Merge (You + AI)**

```bash
# Review PR on GitHub
# Test changes locally
git fetch origin
git checkout -b test-pa-voice origin/pa-agent/voice-services

# Test
cd packages/worker
npx wrangler dev
# ... test the changes ...

# If approved, merge to dev
git checkout dev
git merge test-pa-voice
git push origin dev

# Test on staging
npx wrangler deploy --config wrangler.staging.toml

# If staging OK, merge to main
git checkout main
git merge dev
git push origin main
```

#### **4. Milestone Integration (Every 2 Weeks)**

```bash
# After major milestone (e.g., Voice Services complete)
# 1. Developer creates milestone PR
# 2. We review and test thoroughly
# 3. Merge to dev
# 4. Deploy to staging
# 5. Test integration with existing agents
# 6. If OK, merge to main
# 7. Deploy to production
```

---

## 🚀 DEPLOYMENT & TESTING (Question 4)

### **Environments:**

| Environment | URL | Purpose | Who Deploys | Who Tests |
|-------------|-----|---------|-------------|-----------|
| **Local** | `localhost:8787` | Development | Developer | Developer |
| **Dev Fork** | Developer's Cloudflare | Developer testing | Developer | Developer |
| **Staging** | `dartmouth-os-dev.dartmouth.workers.dev` | Integration testing | You/AI | Both |
| **Production** | `dartmouth-os-worker.dartmouth.workers.dev` | Live system | You/AI | Both |

### **Deployment Strategy:**

#### **Developer's Environment (Isolated)**

```bash
# Developer creates their own Cloudflare account (or we give access)
# Developer deploys to their own Worker for testing

# 1. Developer's wrangler.toml
[env.dev-pa]
name = "dartmouth-os-pa-dev"
account_id = "[developer-account-id]"

# 2. Deploy to developer's account
npx wrangler deploy --env dev-pa

# 3. Test PA Agent features
curl https://dartmouth-os-pa-dev.[developer].workers.dev/api/v2/health
```

#### **Our Staging Environment (Integration)**

```bash
# After PR approved, we deploy to our staging

# 1. Merge PR to dev branch
git checkout dev
git merge pa-agent/voice-services

# 2. Deploy to staging
cd packages/worker
npx wrangler deploy --config wrangler.staging.toml

# 3. Test integration
curl https://dartmouth-os-dev.dartmouth.workers.dev/api/v2/health
curl https://dartmouth-os-dev.dartmouth.workers.dev/api/v2/agents
# Should show: fam, mccarthy-artwork, mccarthy-pa

# 4. Test PA Agent specifically
curl -X POST https://dartmouth-os-dev.dartmouth.workers.dev/api/v2/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "mccarthy-pa",
    "message": "Create a task: Buy milk",
    "sessionId": "test-123"
  }'
```

#### **Production Deployment (After Testing)**

```bash
# After staging tests pass

# 1. Merge dev to main
git checkout main
git merge dev
git push origin main

# 2. Deploy to production
cd packages/worker
npx wrangler deploy

# 3. Verify production
curl https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/health
```

---

## 📋 DEVELOPER ACCESS & PERMISSIONS

### **What Developer Needs:**

1. **GitHub Access:**
   - ✅ Fork access (public repo, anyone can fork)
   - ✅ PR creation access (anyone can create PRs)
   - ❌ NO direct push access to main repo (protected)

2. **Cloudflare Access (Option A - Recommended):**
   - Developer uses their own Cloudflare account (free tier)
   - Developer deploys to their own Worker for testing
   - No risk to our production environment
   - Developer pays $0 (free tier sufficient)

3. **Cloudflare Access (Option B - Shared):**
   - We create a "Developer" API token with limited permissions
   - Developer can deploy to staging only
   - Higher risk (can affect staging)
   - We pay for usage

**RECOMMENDATION: Option A (Developer's own Cloudflare account)**

### **What Developer Gets:**

```
✅ Full read access to codebase (public fork)
✅ Can create feature branches in fork
✅ Can deploy to own Cloudflare account
✅ Can create PRs to our repo
✅ Can see CI/CD results
✅ Can comment on issues/PRs

❌ CANNOT push directly to main repo
❌ CANNOT deploy to our production
❌ CANNOT access our secrets/API keys
❌ CANNOT merge PRs (only we can)
```

---

## 🛡️ RISK MITIGATION

### **How We Protect Ourselves:**

1. **Branch Protection:**
   ```
   main branch:
   - Require PR approval
   - Require CI/CD pass
   - No direct pushes
   - Only you/AI can merge
   ```

2. **Code Review:**
   ```
   Every PR must:
   - Pass automated tests
   - Be reviewed by you/AI
   - Be tested on staging
   - Have no breaking changes
   ```

3. **Isolated Testing:**
   ```
   Developer tests on:
   - Local environment (localhost)
   - Their own Cloudflare account
   
   We test on:
   - Staging environment
   - Production (after approval)
   ```

4. **Secrets Management:**
   ```
   Developer NEVER gets:
   - OPENAI_API_KEY
   - Production API keys
   - Customer data access
   
   Developer uses:
   - Their own API keys (for testing)
   - Mock data
   - Staging credentials (if needed)
   ```

5. **Rollback Plan:**
   ```
   If something breaks:
   - Revert PR on GitHub
   - Rollback Cloudflare deployment
   - Fix issue in new PR
   - Re-deploy after testing
   ```

---

## 📅 DEVELOPMENT TIMELINE (OPTION B)

### **Phase 1: Voice Services (Week 2-3) - DEVELOPER BUILDS**

**Who:** Developer  
**What:** Build Layer 7 (Voice Services)  
**Where:** `packages/voice-services/` (new package)  
**Duration:** 2 weeks

```
Tasks:
- Implement STT service (Native, F5, Whisper)
- Implement TTS service (Native, F5, ElevenLabs)
- Implement Audio Streaming (WebRTC)
- Implement VAD (Voice Activity Detection)
- Implement Interrupt Handling
- Add API endpoints (/api/v2/voice/*)
- Test on staging
- Deploy to production
```

### **Phase 2: Integration APIs (Week 3-4) - DEVELOPER BUILDS**

**Who:** Developer  
**What:** Build Calendar/Email APIs (Layer 4) + JWT Auth (Layer 3)  
**Where:** `packages/integration-services/` (new package)  
**Duration:** 1-2 weeks

```
Tasks:
- Create McCarthyPAAgent (extends FAM)
- Implement TaskHandler
- Implement CalendarHandler
- Implement ReminderHandler
- Implement NoteHandler
- Implement ShoppingListHandler
- Register PA Agent in worker
- Test locally
- Create PR
```

### **Phase 3: PA Agent Backend (Week 5) - DEVELOPER BUILDS**

**Who:** Developer  
**What:** Build PA Agent handlers  
**Where:** `packages/mccarthy-pa/` (new package)  
**Duration:** 1 week

```
Tasks:
- Merge PA Agent backend PR
- Deploy to staging
- Test all PA Agent features
- Test voice integration
- Fix any issues
- Deploy to production
```

### **Phase 4: Frontend (Week 6-7) - DEVELOPER BUILDS**

**Who:** Developer  
**What:** React Native app connecting to Dartmouth API  
**Where:** `McCarthy PA Agent/` (existing project)  
**Duration:** 2 weeks

```
Tasks:
- Migrate from Firebase to Dartmouth API
- Implement voice UI
- Connect to Dartmouth Voice Services
- Test on iOS/Android
- Beta testing
```

### **Phase 5: Integration & Production (Week 8) - BOTH**

**Who:** Developer + You + AI  
**What:** Integration testing + Production rollout  
**Duration:** 1 week

```
Tasks:
- Final testing
- Production deployment
- Monitoring
- Bug fixes
- Documentation
```

---

## 🎯 IMMEDIATE NEXT STEPS

### **Step 1: WE BUILD VOICE SERVICES (This Week)**

```bash
# You + AI build Voice Services (Layer 7)
cd "D:\coding\agent-army-system\packages\dartmouth-core\src\services"

# Create VoiceService.ts
# Implement STT, TTS, Streaming, VAD, Interrupt Handling
# Add API routes in packages/worker/src/routes/voice.ts
# Test locally
# Deploy to staging
# Deploy to production
```

### **Step 2: DEVELOPER SETS UP (This Week)**

```bash
# Developer forks repo
# Developer clones fork
# Developer sets up local environment
# Developer tests local deployment
# Developer creates first branch: pa-agent/setup
# Developer creates PR with setup verification
```

### **Step 3: DEVELOPER BUILDS PA AGENT (Week 3-4)**

```bash
# Developer creates pa-agent package
# Developer implements handlers
# Developer tests locally
# Developer creates PRs for each handler
# We review and merge incrementally
```

---

## 📚 DOCUMENTATION FOR DEVELOPER

### **Developer Receives:**

1. ✅ **DEVELOPER_WORKFLOW_PA_AGENT.md** (this file)
2. ✅ **DARTMOUTH_VOICE_SERVICES_SPECIFICATION.md** (Voice Services spec)
3. ✅ **DARTMOUTH_API_V2_DOCUMENTATION.md** (API reference)
4. ✅ **MCCARTHY_PA_AGENT_BACKEND_SPEC.md** (PA Agent requirements)
5. ✅ **README_FIRST.md** (Project overview)

### **Developer Reads:**

```
Priority 1 (Read First):
- DEVELOPER_WORKFLOW_PA_AGENT.md (this file)
- README_FIRST.md (project overview)

Priority 2 (Read Before Coding):
- DARTMOUTH_VOICE_SERVICES_SPECIFICATION.md
- MCCARTHY_PA_AGENT_BACKEND_SPEC.md
- DARTMOUTH_API_V2_DOCUMENTATION.md

Priority 3 (Reference):
- ARCHITECTURE_AND_TECH_STACK.md
- PROGRESS_TO_DATE.md
- QUICK_REFERENCE.md
```

---

## ✅ CHECKLIST

### **Before Developer Starts:**

- [ ] Voice Services built (Layer 7)
- [ ] Developer has GitHub account
- [ ] Developer has Cloudflare account (optional, recommended)
- [ ] Developer receives all documentation
- [ ] Developer forks repo
- [ ] Developer sets up local environment
- [ ] Developer tests local deployment
- [ ] Developer creates first PR (setup verification)

### **During Development:**

- [ ] Developer works on fork (not main repo)
- [ ] Developer creates feature branches
- [ ] Developer tests locally before PR
- [ ] Developer creates PRs for review
- [ ] We review PRs within 24-48 hours
- [ ] We test on staging before merge
- [ ] We merge incrementally (not big bang)

### **After Milestone:**

- [ ] All PRs merged
- [ ] Staging tests pass
- [ ] Production deployment successful
- [ ] Documentation updated
- [ ] Backup created
- [ ] Developer paid (if applicable)

---

## 🆘 TROUBLESHOOTING

### **Developer Can't Deploy Locally:**

```bash
# Check Node version
node --version  # Should be 18+

# Check Wrangler
npx wrangler --version

# Re-install dependencies
rm -rf node_modules package-lock.json
npm install

# Try dev mode
cd packages/worker
npx wrangler dev
```

### **PR Conflicts:**

```bash
# Developer syncs with upstream
git fetch upstream
git checkout pa-agent/main
git merge upstream/main
git push origin pa-agent/main

# Rebase feature branch
git checkout pa-agent/voice-services
git rebase pa-agent/main
git push origin pa-agent/voice-services --force
```

### **Staging Tests Fail:**

```bash
# Rollback staging
npx wrangler rollback [previous-deployment-id]

# Fix issue in new PR
# Re-deploy after fix
```

---

**READY TO START!** 🚀

**Next:** Build Voice Services (Layer 7) this week, then developer can start PA Agent backend!

