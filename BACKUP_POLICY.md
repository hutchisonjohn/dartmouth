# 🔒 DARTMOUTH BACKUP POLICY

**Version:** 1.0  
**Date:** November 18, 2025  
**Status:** MANDATORY

---

## 📋 **POLICY STATEMENT**

**EVERY PHASE BUILD MUST BE BACKED UP TO GITHUB IMMEDIATELY AFTER COMPLETION.**

This is **NON-NEGOTIABLE** and ensures:
- ✅ Work is never lost
- ✅ Progress can be resumed from any point
- ✅ Changes are tracked and reversible
- ✅ Collaboration is possible
- ✅ Code is secure in private repository

---

## 🎯 **WHEN TO BACKUP**

### **MANDATORY Backups:**
1. **After EVERY Phase Completion** ✅
   - Phase 1: Documentation ✅ BACKED UP
   - Phase 2: Conversation Quality ✅ BACKED UP
   - Phase 3: Foundation Refactor ✅ BACKED UP
   - Phase 4: Agent Routing → MUST BACKUP
   - Phase 5: Constraints System → MUST BACKUP
   - Phase 6: McCarthy Artwork → MUST BACKUP
   - Phase 7: Integration & Testing → MUST BACKUP
   - Phase 8: Deploy & Validate → MUST BACKUP

2. **After Major Milestones**
   - New component created
   - Major refactoring complete
   - Bug fixes applied
   - Documentation updates

3. **Before Risky Changes**
   - Large refactoring
   - Breaking changes
   - Experimental features

### **OPTIONAL (but recommended) Backups:**
- After each work session
- Before taking a break
- When switching tasks
- After fixing critical bugs

---

## 📝 **HOW TO BACKUP**

### **Standard Backup Process:**

```bash
# 1. Navigate to project directory
cd D:\coding\agent-army-system

# 2. Stage all changes
git add .

# 3. Commit with descriptive message
git commit -m "Phase X: [Description of what was completed]"

# 4. Push to GitHub
git push origin master
```

### **Phase Completion Backup Template:**

```bash
# Example for Phase 4:
git add .
git commit -m "Phase 4 COMPLETE: Agent Routing System - AgentRouter, AgentRegistry, AgentOrchestrator built and tested"
git push origin master
```

### **What to Include in Commit Messages:**

**Good commit messages:**
- ✅ "Phase 3 COMPLETE: Foundation Refactor - Removed domain-specific code, created McCarthy Artwork package"
- ✅ "Add ConversationQualityValidator - Validates all responses for personality and accuracy"
- ✅ "Fix: Update HandlerContext type to remove calculationEngine"
- ✅ "Docs: Update BUILD_PLAN_COMPLETE.md with Phase 3 completion"

**Bad commit messages:**
- ❌ "Update files"
- ❌ "Changes"
- ❌ "WIP"
- ❌ "Fix stuff"

---

## ✅ **VERIFICATION CHECKLIST**

After each backup, verify:

- [ ] All files staged (`git status` shows clean)
- [ ] Commit message is descriptive
- [ ] Push successful (no errors)
- [ ] GitHub shows latest commit
- [ ] No uncommitted changes remain

---

## 🔒 **GITHUB REPOSITORY**

**Repository:** https://github.com/hutchisonjohn/dartmouth  
**Visibility:** 🔒 **PRIVATE**  
**Branch:** master  
**Access:** Owner only

---

## 📊 **BACKUP HISTORY**

### **Phase 1: Documentation** ✅
- **Date:** November 18, 2025
- **Commits:** 3
- **Files:** 7 documentation files
- **Status:** ✅ Backed up

### **Phase 2: Conversation Quality System** ✅
- **Date:** November 18, 2025
- **Commits:** 5
- **Files:** 3 new components, 4 updated handlers
- **Status:** ✅ Backed up

### **Phase 3: Foundation Refactor** ✅
- **Date:** November 18, 2025
- **Commits:** 5
- **Files:** McCarthy Artwork package, refactored BaseAgent
- **Status:** ✅ Backed up

### **Phase 4: Agent Routing** ⏭️
- **Status:** Not started yet
- **Reminder:** MUST BACKUP AFTER COMPLETION

### **Phase 5: Constraints System** ⏭️
- **Status:** Not started yet
- **Reminder:** MUST BACKUP AFTER COMPLETION

### **Phase 6: McCarthy Artwork** ⏭️
- **Status:** Not started yet
- **Reminder:** MUST BACKUP AFTER COMPLETION

### **Phase 7: Integration & Testing** ⏭️
- **Status:** Not started yet
- **Reminder:** MUST BACKUP AFTER COMPLETION

### **Phase 8: Deploy & Validate** ⏭️
- **Status:** Not started yet
- **Reminder:** MUST BACKUP AFTER COMPLETION

---

## 🚨 **WHAT IF BACKUP FAILS?**

### **Common Issues:**

#### **1. Merge Conflicts**
```bash
# Pull latest changes first
git pull origin master

# Resolve conflicts manually
# Then commit and push
git add .
git commit -m "Resolve merge conflicts"
git push origin master
```

#### **2. Authentication Issues**
```bash
# Check GitHub credentials
git config --list

# Re-authenticate if needed
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

#### **3. Large Files**
```bash
# Check file sizes
git ls-files -s | awk '{print $4, $2}' | sort -n -r | head -10

# Remove large files from staging
git rm --cached <large-file>

# Add to .gitignore
echo "<large-file>" >> .gitignore
```

#### **4. Network Issues**
- Wait and retry
- Check internet connection
- Try again in a few minutes

---

## 📈 **BENEFITS OF THIS POLICY**

### **For Development:**
- ✅ Never lose work
- ✅ Easy to revert mistakes
- ✅ Track progress over time
- ✅ Resume from any point

### **For Collaboration:**
- ✅ Share code with team
- ✅ Review changes
- ✅ Merge contributions
- ✅ Maintain code quality

### **For Documentation:**
- ✅ Commit history = project timeline
- ✅ See what changed and why
- ✅ Understand decision-making
- ✅ Learn from past work

---

## 🎯 **ENFORCEMENT**

**This policy is MANDATORY.**

- ❌ **DO NOT** proceed to next phase without backing up current phase
- ❌ **DO NOT** skip backups "to save time"
- ❌ **DO NOT** commit without descriptive messages
- ✅ **DO** backup after every phase
- ✅ **DO** verify backup success
- ✅ **DO** write clear commit messages

---

## 📞 **QUESTIONS?**

If you're unsure about:
- When to backup → **Backup now!**
- What to commit → **Commit everything!**
- How to write message → **Be descriptive!**

**When in doubt, backup more often, not less.**

---

**REMEMBER: A backup today saves hours tomorrow!** 🔒✅

