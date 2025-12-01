# BACKUP POLICY
**Last Updated:** 2025-11-20  
**Applies To:** All projects in `D:\coding\`

---

## 🎯 POLICY OBJECTIVES

1. **Prevent Data Loss** - All code changes backed up to GitHub within 24 hours
2. **Version Control** - Complete history of all changes with meaningful commit messages
3. **Disaster Recovery** - Ability to restore any project to any point in time
4. **Cloudflare Backup** - Production deployments backed up separately from source code
5. **Knowledge Base Backup** - RAG data and D1 databases backed up regularly

---

## 📋 BACKUP SCHEDULE

### Daily Backups (Automated via GitHub)
- **When:** End of each coding session OR every 24 hours (whichever comes first)
- **What:** All source code changes
- **Where:** GitHub repositories
- **How:** Git commit + push

### Weekly Backups (Manual)
- **When:** Every Sunday 6:00 PM AEST
- **What:** 
  - Cloudflare D1 database exports
  - KV namespace exports
  - Environment variables documentation
  - Deployment configurations
- **Where:** Local backup folder + GitHub (separate backup branch)

### Monthly Backups (Archive)
- **When:** Last day of each month
- **What:** Complete project snapshots
- **Where:** External drive + Cloud storage (OneDrive/Google Drive)

---

## 🗂️ PROJECTS REQUIRING BACKUP

### 1. Dartmouth OS (agent-army-system)
**Repository:** `https://github.com/hutchisonjohn/dartmouth`  
**Account:** `john@dtf.com.au` (GitHub) + `john@dtf.com.au` (Cloudflare)

**Critical Files:**
- `packages/worker/wrangler.toml` - Worker configuration
- `packages/dartmouth-core/` - Core agent system
- `packages/mccarthy-artwork/` - McCarthy Artwork Agent
- `packages/worker/scripts/load-knowledge-base.js` - RAG ingestion script

**Cloudflare Resources:**
- Worker: `dartmouth-os-worker`
- D1 Database: `dartmouth-os-db` (contains RAG knowledge base)
- KV Namespaces: `APP_CONFIG`, `CACHE`

**Backup Frequency:** Daily commits, weekly D1 export

---

### 2. Artwork Analyser AI Agent
**Repository:** `https://github.com/hutchisonjohn/artwork-analyser` (to be created)  
**Account:** `john@dtf.com.au` (Cloudflare)

**Critical Files:**
- `wrangler.toml` - Worker configuration (OLD backup worker)
- `src/frontend/` - React frontend
- `src/frontend/.env.production` - Production environment variables
- `src/frontend/.env.development` - Development environment variables

**Cloudflare Resources:**
- Worker: `artwork-analyser-worker` (backup/legacy)
- Pages: `artwork-analyser-ai-agent-1qo`
- D1 Database: `artwork_ai_db` (ID: `f0c5a6a4-6fa7-4b1e-8a4e-b1aa3e8cfb38`)
- KV Namespace: `APP_CONFIG` (ID: `754a505c7130462697e83ee824529919`)

**Backup Frequency:** Daily commits, weekly D1 export

---

### 3. Customer Service AI Agent
**Repository:** `https://github.com/hutchisonjohn/customer-service-agent` (to be created)  
**Account:** `john@dtf.com.au` (Cloudflare)

**Status:** In development (not yet deployed)

**Critical Files:**
- All source code in `D:\coding\Customer Service AI Agent\`
- Architecture documents (TECHNICAL_ARCHITECTURE.md, BUILD_PLAN.md, etc.)

**Backup Frequency:** Daily commits during active development

---

## 🔄 GIT WORKFLOW

### Daily Commit Process

**Before Starting Work:**
```powershell
cd "D:\coding\[PROJECT_NAME]"
git status                    # Check current state
git pull origin main          # Get latest changes
```

**After Completing Work:**
```powershell
git status                    # Review changes
git add .                     # Stage all changes
git commit -m "[Descriptive message]"
git push origin main          # Push to GitHub
```

### Commit Message Format

**Use Australian English and follow this format:**

```
[Type]: [Brief description]

[Optional detailed explanation]
[Optional list of changes]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `config:` - Configuration changes (wrangler.toml, env vars)
- `refactor:` - Code refactoring
- `deploy:` - Deployment changes
- `backup:` - Backup/archive commit

**Examples:**
```
feat: Add McCarthy Artwork Agent to Dartmouth OS

- Created mccarthy-artwork package
- Integrated with FAM base agent
- Added DTF knowledge base documents
- Configured RAG system for artwork queries
```

```
fix: Resolve frontend 404 error on chat endpoint

- Added VITE_WORKER_URL to .env.production
- Updated ArtworkChat.tsx to use Dartmouth OS worker
- Rebuilt frontend with correct environment variables
```

```
config: Migrate to john@dtf.com.au Cloudflare account

- Updated account_id in wrangler.toml
- Created new KV namespace and D1 database
- Updated resource IDs in configuration
```

---

## 💾 CLOUDFLARE RESOURCE BACKUP

### D1 Database Backup

**Export Command:**
```powershell
# Dartmouth OS database
npx wrangler d1 export dartmouth-os-db --output="backups/dartmouth-os-db-$(Get-Date -Format 'yyyy-MM-dd').sql"

# Artwork Analyser database
npx wrangler d1 export artwork_ai_db --output="backups/artwork_ai_db-$(Get-Date -Format 'yyyy-MM-dd').sql"
```

**Storage:**
- Local: `D:\coding\backups\d1-exports\`
- GitHub: Commit to `backup` branch (NOT main - SQL files can be large)
- Cloud: Upload to OneDrive weekly

**Restore Command:**
```powershell
npx wrangler d1 execute dartmouth-os-db --file="backups/dartmouth-os-db-2025-11-20.sql"
```

---

### KV Namespace Backup

**Export Command:**
```powershell
# List all keys
npx wrangler kv:key list --namespace-id="754a505c7130462697e83ee824529919" > backups/kv-keys.json

# Export each key (manual process - KV doesn't have bulk export)
# Document critical keys in CLOUDFLARE_RESOURCES.md
```

**Storage:**
- Document all KV keys and values in `CLOUDFLARE_RESOURCES.md`
- Commit to GitHub main branch

---

### Environment Variables Backup

**Critical Variables to Document:**

Create `CLOUDFLARE_RESOURCES.md` in each project:

```markdown
# Cloudflare Resources

## Account
- Account ID: 4d9baa62ab7d5d4da1e8d658801e5b13
- Email: john@dtf.com.au

## Workers
- dartmouth-os-worker
- artwork-analyser-worker

## Environment Variables
- OPENAI_API_KEY: [stored in Cloudflare dashboard]
- ADMIN_TOKEN: [stored in Cloudflare dashboard]
- APP_SECRET_KEY: [stored in Cloudflare dashboard]

## KV Namespaces
- APP_CONFIG: 754a505c7130462697e83ee824529919
- CACHE: 4dde59b47cc34c9495aba50d7312df1d

## D1 Databases
- artwork_ai_db: f0c5a6a4-6fa7-4b1e-8a4e-b1aa3e8cfb38
- dartmouth-os-db: [existing ID]
```

**⚠️ SECURITY NOTE:** 
- **NEVER commit actual API keys or secrets to GitHub**
- Only document WHERE they are stored (e.g., "Cloudflare dashboard")
- Keep actual secrets in password manager (1Password, LastPass, etc.)

---

## 🚨 EMERGENCY RECOVERY PROCEDURES

### Scenario 1: Local Files Deleted
```powershell
# Clone from GitHub
cd D:\coding
git clone https://github.com/hutchisonjohn/dartmouth.git agent-army-system
cd agent-army-system
npm install
```

### Scenario 2: Cloudflare Worker Deleted
```powershell
# Redeploy from local code
cd "D:\coding\agent-army-system\packages\worker"
npx wrangler deploy
```

### Scenario 3: D1 Database Corrupted
```powershell
# Restore from backup
npx wrangler d1 execute dartmouth-os-db --file="backups/dartmouth-os-db-2025-11-20.sql"

# Reload knowledge base
cd "D:\coding\agent-army-system\packages\worker"
node scripts/load-knowledge-base.js
```

### Scenario 4: Frontend Deployment Broken
```powershell
# Rebuild and redeploy
cd "D:\coding\Artwork Analyser AI Agent\src\frontend"
npm run build
npx wrangler pages deploy dist --project-name=artwork-analyser-ai-agent-1qo
```

### Scenario 5: Complete System Loss
1. Restore from GitHub (all source code)
2. Restore D1 databases from SQL backups
3. Recreate KV namespaces and populate from documentation
4. Redeploy all Workers and Pages
5. Re-add environment variables from documentation
6. Reload knowledge bases

---

## 📊 BACKUP VERIFICATION

### Weekly Verification Checklist

**Every Sunday:**
- [ ] Verify all projects have been pushed to GitHub in the last 7 days
- [ ] Check GitHub repositories are accessible
- [ ] Export D1 databases to local backup folder
- [ ] Verify Cloudflare deployments are running
- [ ] Test one random restore (pick a file, delete locally, restore from GitHub)

### Monthly Verification Checklist

**Last day of each month:**
- [ ] Create complete project snapshots (zip all projects)
- [ ] Upload snapshots to OneDrive/Google Drive
- [ ] Verify external drive backup is accessible
- [ ] Test full project restore from GitHub
- [ ] Document any new Cloudflare resources in CLOUDFLARE_RESOURCES.md

---

## 🔐 SECURITY BEST PRACTICES

### What to Commit to GitHub
✅ Source code  
✅ Configuration files (wrangler.toml)  
✅ Documentation  
✅ Package.json / package-lock.json  
✅ Environment variable NAMES (not values)  
✅ Database schemas (not data)  

### What NOT to Commit to GitHub
❌ API keys  
❌ Secrets  
❌ Environment variable VALUES  
❌ `.env` files with real secrets  
❌ Customer data  
❌ Large binary files (images, videos)  
❌ `node_modules/` (use .gitignore)  
❌ `dist/` build folders (regenerate on deploy)  

### .gitignore Template
```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
.output/

# Environment variables
.env
.env.local
.env.production.local
.dev.vars

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Wrangler
.wrangler/
wrangler.toml.backup

# Backups (commit to backup branch instead)
backups/*.sql
backups/*.db
```

---

## 📞 BACKUP CONTACTS

**GitHub Account:** hutchisonjohn  
**Cloudflare Account:** john@dtf.com.au  
**Backup Storage:** OneDrive (john@dtf.com.au)  

**In Case of Emergency:**
1. Access GitHub via web browser
2. Access Cloudflare dashboard via web browser
3. Download backups from OneDrive
4. Follow emergency recovery procedures above

---

## 📅 BACKUP LOG

### Template Entry
```
Date: 2025-11-20
Projects Backed Up: Dartmouth OS, Artwork Analyser
Backup Type: Daily commit + D1 export
Status: ✅ Success
Notes: Loaded McCarthy knowledge base, all 20 chunks ingested
```

### Recent Backups

**2025-11-20:**
- ✅ Dartmouth OS - Daily commit
- ✅ Artwork Analyser - Daily commit  
- ✅ D1 export - dartmouth-os-db (20 RAG chunks)
- ✅ Status document created (CURRENT_STATUS_AND_NEXT_STEPS.md)
- ✅ Backup policy created (BACKUP_POLICY.md)

---

## 🎯 NEXT ACTIONS

### Immediate (Today)
1. ✅ Create BACKUP_POLICY.md (this document)
2. ⏳ Commit all current changes to GitHub
3. ⏳ Create CLOUDFLARE_RESOURCES.md for each project
4. ⏳ Export D1 databases to local backup folder

### This Week
1. ⏳ Set up GitHub repositories for all projects
2. ⏳ Create backup branch for SQL exports
3. ⏳ Set up OneDrive backup folder
4. ⏳ Document all environment variables

### Ongoing
1. ⏳ Daily commits at end of each coding session
2. ⏳ Weekly D1 exports every Sunday
3. ⏳ Monthly full backups last day of month
4. ⏳ Update BACKUP_LOG after each backup

---

**REMEMBER:** A backup you haven't tested is not a backup. Verify regularly! 🛡️

