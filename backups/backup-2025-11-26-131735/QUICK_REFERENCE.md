# ⚡ QUICK REFERENCE - CHEAT SHEET

**Last Updated:** 2025-11-22  
**Purpose:** Fast access to URLs, commands, credentials

---

## 🔗 PRODUCTION URLS

```
Dartmouth OS (Production):
https://dartmouth-os-worker.dartmouth.workers.dev

Dartmouth OS (Staging):
https://dartmouth-os-dev.dartmouth.workers.dev

Artwork Analyser:
https://artwork-analyser-ai-agent-1qo.pages.dev

GitHub (Dartmouth OS):
https://github.com/hutchisonjohn/dartmouth

GitHub (Artwork Agent):
https://github.com/hutchisonjohn/artwork-analyser-ai-agent
```

---

## 🚀 COMMON COMMANDS

### **Dartmouth OS Worker**

```powershell
# Navigate to worker
cd "D:\coding\agent-army-system\packages\worker"

# Start local development
npx wrangler dev

# Deploy to production
npx wrangler deploy

# Deploy to staging
npx wrangler deploy --config wrangler.staging.toml

# Check health
curl https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/health

# List agents
curl https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/agents

# View logs
npx wrangler tail

# Set secret
npx wrangler secret put OPENAI_API_KEY
```

### **Artwork Analyser Frontend**

```powershell
# Navigate to frontend
cd "D:\coding\Artwork Analyser AI Agent\src\frontend"

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare Pages
cd "D:\coding\Artwork Analyser AI Agent"
npx wrangler pages deploy src/frontend/dist --project-name=artwork-analyser-ai-agent
```

### **Knowledge Base Management**

```powershell
# Load knowledge base
cd "D:\coding\agent-army-system\packages\worker"
node scripts/load-knowledge-base.js

# Verify RAG working
curl -X POST https://dartmouth-os-worker.dartmouth.workers.dev/test/rag \
  -H "Content-Type: application/json" \
  -d '{"query": "What are DTF printing requirements?"}'
```

### **Database Management**

```powershell
# List D1 databases
npx wrangler d1 list

# Execute SQL
npx wrangler d1 execute artwork_ai_db --command="SELECT * FROM knowledge_base LIMIT 5"

# Run migrations
npx wrangler d1 migrations apply artwork_ai_db
```

### **Git Commands**

```powershell
# Check status
git status

# Commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push origin main

# Pull latest
git pull origin main

# View commit history
git log --oneline -10

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes
git reset --hard HEAD
```

---

## 🔑 CREDENTIALS & ACCOUNTS

### **Cloudflare Account**

```
Email: john@dtf.com.au
Account ID: 4d9baa62ab7d5d4da1e8d658801e5b13
```

**Login:** https://dash.cloudflare.com

### **GitHub Account**

```
Username: hutchisonjohn
```

**Login:** https://github.com/login

### **API Keys (Stored in Wrangler Secrets)**

```
OPENAI_API_KEY - Set via: npx wrangler secret put OPENAI_API_KEY
ADMIN_TOKEN - artwork-admin-abc123xyz789def456ghi (old system)
```

---

## 📦 PROJECT LOCATIONS

```
Master Documentation:
D:\coding\DARTMOUTH_OS_PROJECT\

Dartmouth OS Core:
D:\coding\agent-army-system\

Artwork Analyser:
D:\coding\Artwork Analyser AI Agent\

McCarthy PA Agent:
D:\coding\McCarthy PA Agent\

Customer Service AI:
D:\coding\Customer Service AI Agent\

PerfectPrint AI:
D:\coding\PerfectPrint AI\

AdFusion AI:
D:\coding\AdFusion AI\

Local Backups:
D:\coding\DARTMOUTH OS PROJECT FULL BACKUP\
```

---

## 🧪 TESTING COMMANDS

### **Test Agent Chat**

```powershell
# Test Artwork Agent
curl -X POST https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "mccarthy-artwork",
    "message": "What are DTF printing requirements?",
    "sessionId": "test-session-123"
  }'

# Test FAM (base agent)
curl -X POST https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "fam",
    "message": "Hello, who are you?",
    "sessionId": "test-session-456"
  }'
```

### **Test Health Endpoints**

```powershell
# Overall health
curl https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/health

# Specific agent health
curl "https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/health?agentId=mccarthy-artwork"

# List all agents
curl https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/agents
```

---

## 💾 BACKUP COMMANDS

### **Automated Backup (Recommended)**

```powershell
cd "D:\coding\DARTMOUTH_OS_PROJECT"
.\backup-all.ps1
```

### **Manual Backup**

```powershell
# Dartmouth OS
cd "D:\coding\agent-army-system"
git add .
git commit -m "Backup: [description]"
git push origin main

# Artwork Agent
cd "D:\coding\Artwork Analyser AI Agent"
git add .
git commit -m "Backup: [description]"
git push origin main

# Create local ZIP
Compress-Archive -Path "D:\coding\agent-army-system" -DestinationPath "D:\coding\DARTMOUTH OS PROJECT FULL BACKUP\DARTMOUTH_OS_BACKUP_$(Get-Date -Format 'yyyy-MM-dd_HHmm').zip"
```

---

## 🔧 TROUBLESHOOTING

### **Worker Not Responding**

```powershell
# Check deployment status
npx wrangler deployments list

# View recent logs
npx wrangler tail

# Rollback to previous version
npx wrangler rollback [deployment-id]
```

### **Frontend Build Errors**

```powershell
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check

# Build with verbose output
npm run build -- --debug
```

### **Authentication Errors**

```powershell
# Re-login to Wrangler
npx wrangler logout
npx wrangler login

# Verify login
npx wrangler whoami

# Check API token
curl "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer [YOUR_TOKEN]"
```

### **Database Issues**

```powershell
# Check D1 database exists
npx wrangler d1 list

# Test query
npx wrangler d1 execute artwork_ai_db --command="SELECT 1"

# Re-run migrations
npx wrangler d1 migrations apply artwork_ai_db
```

---

## 📚 KEY DOCUMENTATION FILES

```
Start Here:
D:\coding\DARTMOUTH_OS_PROJECT\README_FIRST.md

Current Status:
D:\coding\DARTMOUTH_OS_PROJECT\PROGRESS_TO_DATE.md

Architecture:
D:\coding\DARTMOUTH_OS_PROJECT\ARCHITECTURE_AND_TECH_STACK.md

All Agents:
D:\coding\DARTMOUTH_OS_PROJECT\AGENT_PROJECTS_MAP.md

Backup Procedures:
D:\coding\DARTMOUTH_OS_PROJECT\BACKUP_POLICY.md

Dartmouth OS Complete Spec:
D:\coding\agent-army-system\docs\dartmouth-os\v2\DARTMOUTH_OS_V2_COMPLETE_SPECIFICATION.md

API Documentation:
D:\coding\agent-army-system\docs\dartmouth-os\v2\DARTMOUTH_API_V2_DOCUMENTATION.md

Voice Services Spec:
D:\coding\agent-army-system\docs\dartmouth-os\v2\DARTMOUTH_VOICE_SERVICES_SPECIFICATION.md
```

---

## 🎯 COMMON WORKFLOWS

### **Deploying a Change**

```powershell
# 1. Make changes locally
cd "D:\coding\agent-army-system\packages\worker"

# 2. Test locally
npx wrangler dev

# 3. Commit changes
git add .
git commit -m "Description of change"

# 4. Deploy to staging
npx wrangler deploy --config wrangler.staging.toml

# 5. Test on staging
curl https://dartmouth-os-dev.dartmouth.workers.dev/api/v2/health

# 6. Deploy to production
npx wrangler deploy

# 7. Push to GitHub
git push origin main
```

### **Adding a New Agent**

```powershell
# 1. Create agent package
cd "D:\coding\agent-army-system\packages"
mkdir mccarthy-[agent-name]

# 2. Implement agent (extend BaseAgent)
# See packages/mccarthy-artwork/ for example

# 3. Register agent in worker
# Edit packages/worker/src/index.ts

# 4. Deploy
cd packages/worker
npx wrangler deploy

# 5. Test
curl -X POST https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/chat \
  -H "Content-Type: application/json" \
  -d '{"agentId": "[agent-name]", "message": "Hello"}'
```

### **Updating Knowledge Base**

```powershell
# 1. Edit knowledge files
cd "D:\coding\agent-army-system\packages\mccarthy-artwork\knowledge"
# Edit .md files

# 2. Load into database
cd "D:\coding\agent-army-system\packages\worker"
node scripts/load-knowledge-base.js

# 3. Test RAG
curl -X POST https://dartmouth-os-worker.dartmouth.workers.dev/test/rag \
  -H "Content-Type: application/json" \
  -d '{"query": "Your test question"}'
```

---

## 🆘 EMERGENCY PROCEDURES

### **Site Down**

```powershell
# 1. Check status
curl https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/health

# 2. View logs
npx wrangler tail

# 3. Rollback if needed
npx wrangler deployments list
npx wrangler rollback [previous-deployment-id]
```

### **Lost Work**

```powershell
# 1. Check Git status
git status

# 2. Restore from Git
git checkout -- [filename]

# 3. Or restore from GitHub
git fetch origin
git reset --hard origin/main
```

### **Need to Restore Everything**

```powershell
# 1. Clone from GitHub
cd D:\coding
git clone https://github.com/hutchisonjohn/dartmouth.git agent-army-system

# 2. Install dependencies
cd agent-army-system
npm install

# 3. Configure secrets
cd packages/worker
npx wrangler secret put OPENAI_API_KEY

# 4. Test
npx wrangler dev
```

---

## 📞 SUPPORT CONTACTS

### **Cloudflare Support**

- Dashboard: https://dash.cloudflare.com
- Docs: https://developers.cloudflare.com
- Community: https://community.cloudflare.com

### **GitHub Support**

- Help: https://docs.github.com
- Support: https://support.github.com

---

## 🔄 UPDATE FREQUENCY

This document is updated:
- When URLs change
- When commands change
- When new projects added
- Monthly review (minimum)

**Last Updated:** 2025-11-22  
**Next Review:** 2025-12-22

---

**⚡ BOOKMARK THIS PAGE FOR QUICK ACCESS!**

