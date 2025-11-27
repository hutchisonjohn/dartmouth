# 💾 DARTMOUTH OS PROJECT - BACKUP POLICY

**Last Updated:** 2025-11-22  
**Status:** Active  
**Backup Frequency:** On-demand + Before major changes

---

## 🎯 BACKUP STRATEGY

### **What Gets Backed Up:**

1. ✅ **All Agent Projects:**
   - Dartmouth OS Core (`agent-army-system/`)
   - Artwork Analyser AI Agent
   - McCarthy PA Agent
   - Customer Service AI Agent
   - PerfectPrint AI
   - AdFusion AI

2. ✅ **All Documentation:**
   - Master docs (`DARTMOUTH_OS_PROJECT/`)
   - Project-specific docs
   - Progress tracking files
   - Architecture diagrams

3. ✅ **All Configuration:**
   - `wrangler.toml` files
   - `package.json` files
   - Environment configs
   - Database schemas

4. ✅ **All Code:**
   - Source code
   - Tests
   - Scripts
   - Build configurations

### **What's NOT Backed Up:**
- ❌ `node_modules/` (can be reinstalled)
- ❌ `dist/` or `build/` folders (can be rebuilt)
- ❌ `.env` files (contain secrets)
- ❌ Local caches

---

## 📦 BACKUP LOCATIONS

### **1. GitHub (Primary Backup)**

**Purpose:** Version control + cloud backup  
**Frequency:** After every significant change  
**Retention:** Unlimited (all history)

**Repositories:**
- `https://github.com/hutchisonjohn/dartmouth` (Dartmouth OS)
- `https://github.com/hutchisonjohn/artwork-analyser-ai-agent`
- Additional repos for other agents

### **2. Local Backup Folder (Secondary Backup)**

**Purpose:** Quick recovery without internet  
**Location:** `D:\coding\DARTMOUTH OS PROJECT FULL BACKUP\`  
**Frequency:** Before major changes + weekly  
**Retention:** Last 4 backups (monthly rotation)

**Format:** Timestamped ZIP files
- `DARTMOUTH_OS_BACKUP_2025-11-22_0840.zip`
- `ARTWORK_AGENT_BACKUP_2025-11-22_0840.zip`
- etc.

---

## 🚀 AUTOMATED BACKUP SCRIPT

### **Quick Start:**

```powershell
# Run from anywhere:
cd "D:\coding\DARTMOUTH_OS_PROJECT"
.\backup-all.ps1

# Or with options:
.\backup-all.ps1 -SkipGitHub  # Local backup only
.\backup-all.ps1 -GitHubOnly  # GitHub push only
```

### **What the Script Does:**

1. ✅ Updates all `PROJECT_STATUS.md` files
2. ✅ Updates `PROGRESS_TO_DATE.md`
3. ✅ Commits all changes to Git
4. ✅ Pushes to GitHub
5. ✅ Creates local ZIP backups
6. ✅ Verifies backups successful
7. ✅ Displays summary

---

## 📋 BACKUP SCHEDULE

### **Automatic Triggers:**

1. **Before Major Changes:**
   - Before deploying to production
   - Before database migrations
   - Before major refactoring
   - Before updating dependencies

2. **After Milestones:**
   - After completing a sprint
   - After fixing critical bugs
   - After adding new features
   - After documentation updates

3. **Before Risky Operations:**
   - Before laptop/PC reboot
   - Before Windows updates
   - Before disk cleanup
   - Before any "scary" operation

### **Manual Schedule:**

- **Daily:** If actively developing
- **Weekly:** Minimum (even if no changes)
- **Monthly:** Full system backup

---

## 🔄 BACKUP PROCEDURE

### **Method 1: Automated Script (Recommended)**

```powershell
cd "D:\coding\DARTMOUTH_OS_PROJECT"
.\backup-all.ps1
```

**Duration:** 2-5 minutes  
**Requires:** Internet connection for GitHub push

### **Method 2: Manual Backup**

```powershell
# 1. Commit all changes
cd "D:\coding\agent-army-system"
git add .
git commit -m "Backup: [description]"
git push origin main

# 2. Repeat for each project
cd "D:\coding\Artwork Analyser AI Agent"
git add .
git commit -m "Backup: [description]"
git push origin main

# 3. Create local backup
Compress-Archive -Path "D:\coding\agent-army-system" -DestinationPath "D:\coding\DARTMOUTH OS PROJECT FULL BACKUP\DARTMOUTH_OS_BACKUP_$(Get-Date -Format 'yyyy-MM-dd_HHmm').zip"
```

**Duration:** 10-15 minutes  
**Error-prone:** Easy to forget a project

---

## 🆘 DISASTER RECOVERY

### **Scenario 1: Lost Laptop / HDD Failure**

**Recovery Steps:**

1. **Get new machine**
2. **Install prerequisites:**
   ```powershell
   # Install Node.js 18+
   # Install Git
   # Install Wrangler CLI
   ```

3. **Clone from GitHub:**
   ```powershell
   cd D:\coding
   git clone https://github.com/hutchisonjohn/dartmouth.git agent-army-system
   git clone https://github.com/hutchisonjohn/artwork-analyser-ai-agent.git "Artwork Analyser AI Agent"
   # ... repeat for other repos
   ```

4. **Install dependencies:**
   ```powershell
   cd agent-army-system
   npm install
   
   cd "Artwork Analyser AI Agent"
   npm install
   ```

5. **Configure secrets:**
   ```powershell
   # Set up .dev.vars files
   # Set up Wrangler secrets
   npx wrangler secret put OPENAI_API_KEY
   ```

6. **Verify everything works:**
   ```powershell
   cd agent-army-system/packages/worker
   npx wrangler dev
   ```

**Recovery Time:** 1-2 hours

---

### **Scenario 2: Accidentally Deleted Files**

**Recovery Steps:**

1. **Check Git status:**
   ```powershell
   git status
   ```

2. **Restore from Git:**
   ```powershell
   git checkout -- [filename]
   # Or restore entire directory:
   git checkout -- .
   ```

3. **If already committed:**
   ```powershell
   git log  # Find commit before deletion
   git checkout [commit-hash] -- [filename]
   ```

**Recovery Time:** 1-5 minutes

---

### **Scenario 3: Corrupted Project**

**Recovery Steps:**

1. **Try Git reset first:**
   ```powershell
   git reset --hard HEAD
   ```

2. **If that doesn't work, re-clone:**
   ```powershell
   cd D:\coding
   mv agent-army-system agent-army-system-corrupted
   git clone https://github.com/hutchisonjohn/dartmouth.git agent-army-system
   cd agent-army-system
   npm install
   ```

3. **Copy any uncommitted work:**
   ```powershell
   # Copy from agent-army-system-corrupted if needed
   ```

**Recovery Time:** 10-30 minutes

---

### **Scenario 4: GitHub Account Compromised**

**Recovery Steps:**

1. **Use local backup:**
   ```powershell
   cd "D:\coding\DARTMOUTH OS PROJECT FULL BACKUP"
   # Extract latest backup ZIP
   ```

2. **Create new GitHub repo:**
   - Create new GitHub account or repo
   - Push local backup to new repo

3. **Update remote URLs:**
   ```powershell
   git remote set-url origin [new-repo-url]
   git push -u origin main
   ```

**Recovery Time:** 30-60 minutes

---

## ✅ BACKUP VERIFICATION

### **After Each Backup, Verify:**

1. ✅ **GitHub Push Successful:**
   ```powershell
   git log -1  # Check latest commit
   git remote show origin  # Verify remote
   ```

2. ✅ **Local Backup Created:**
   ```powershell
   ls "D:\coding\DARTMOUTH OS PROJECT FULL BACKUP"
   # Should see new ZIP file with today's date
   ```

3. ✅ **Backup Size Reasonable:**
   - Dartmouth OS: ~50-100 MB
   - Artwork Agent: ~20-50 MB
   - PA Agent: ~30-60 MB
   - (Excluding node_modules)

4. ✅ **Can Extract Backup:**
   ```powershell
   # Test extraction (in temp folder)
   Expand-Archive -Path "[backup-file].zip" -DestinationPath "C:\temp\test-restore"
   ```

---

## 🔒 BACKUP SECURITY

### **Sensitive Data:**

**DO NOT backup:**
- ❌ `.env` files (contain API keys)
- ❌ `.dev.vars` files (contain secrets)
- ❌ Private keys
- ❌ Passwords

**These should be:**
- Stored in password manager
- Set as Wrangler secrets
- Documented separately (encrypted)

### **GitHub Security:**

- ✅ Use SSH keys (not HTTPS)
- ✅ Enable 2FA on GitHub account
- ✅ Use `.gitignore` for sensitive files
- ✅ Never commit secrets

---

## 📊 BACKUP MONITORING

### **Check Backup Health:**

```powershell
# Run this weekly:
cd "D:\coding\DARTMOUTH_OS_PROJECT"
.\check-backup-health.ps1
```

**Checks:**
- ✅ All projects have recent commits
- ✅ All projects pushed to GitHub
- ✅ Local backups exist and are recent
- ✅ Backup sizes are reasonable
- ✅ No uncommitted changes

---

## 🎯 BEST PRACTICES

### **DO:**
- ✅ Backup before major changes
- ✅ Commit often (small, logical commits)
- ✅ Write clear commit messages
- ✅ Test backups periodically
- ✅ Keep local backups for 1 month

### **DON'T:**
- ❌ Wait until "later" to backup
- ❌ Commit secrets or API keys
- ❌ Delete old backups immediately
- ❌ Assume backups work without testing
- ❌ Ignore backup script errors

---

## 🚨 EMERGENCY CONTACTS

### **If Backup Fails:**

1. **Check error message** - Usually explains the issue
2. **Verify internet connection** - Required for GitHub
3. **Check disk space** - Need space for ZIP files
4. **Check Git status** - May have conflicts
5. **Contact John** - If still stuck

### **If Recovery Fails:**

1. **Don't panic** - Code is in GitHub
2. **Check GitHub first** - Most recent version
3. **Try local backup** - If GitHub unavailable
4. **Contact John** - For assistance

---

## 📝 BACKUP LOG

**Keep track of backups:**

| Date | Type | Projects | Status | Notes |
|------|------|----------|--------|-------|
| 2025-11-22 | Full | All 6 | ✅ Success | Initial backup system |
| ... | ... | ... | ... | ... |

---

## 🔄 POLICY UPDATES

**This policy will be reviewed:**
- After any backup failure
- After any recovery operation
- Quarterly (minimum)
- When adding new projects

**Last Review:** 2025-11-22  
**Next Review:** 2026-02-22

---

**💾 BACKUP REGULARLY - SLEEP PEACEFULLY!**

**Next Step:** Run `.\backup-all.ps1` now to create your first backup!

