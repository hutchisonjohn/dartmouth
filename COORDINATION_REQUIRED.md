# ⚠️ COORDINATION REQUIRED

**Date:** December 1, 2025  
**Developers:** 
- Building Email System V2 in `packages/worker/`
- Building PerfectPrint AI in `packages/perfectprint-ai/`

---

## 🚨 PROTECTED FILES - COORDINATE BEFORE EDITING

These files require coordination between both developers:

### ⚠️ `package.json` (root)
- **Why:** Shared dependencies for all packages
- **Action:** Announce before editing, wait for confirmation

### ⚠️ `pnpm-workspace.yaml` (root)
- **Why:** Defines workspace packages
- **Action:** Announce before editing, wait for confirmation

### ⚠️ `tsconfig.json` (root)
- **Why:** Shared TypeScript configuration
- **Action:** Announce before editing, wait for confirmation

---

## ✅ CONFLICT-FREE ZONES

### Email System V2 Developer:
- `packages/worker/` ✅
- `packages/customer-service-dashboard/` ✅
- `packages/worker/migrations/` ✅
- `packages/worker/src/services/` ✅

### PerfectPrint AI Developer:
- `packages/perfectprint-ai/` ✅
- All PerfectPrint-specific files ✅

---

## 🤖 AI REMINDER

**BEFORE editing any protected file, I MUST:**

1. ⚠️ **STOP immediately**
2. 🗣️ **Announce**: "⚠️ COORDINATION NEEDED! I need to edit [filename]. Have you coordinated with the other developer?"
3. ⏸️ **WAIT** for explicit user confirmation
4. ✅ **Only proceed** after user says "yes" or "go ahead"

**DO NOT:**
- ❌ Edit protected files without warning
- ❌ Assume it's okay to proceed
- ❌ Make changes and ask for forgiveness later

---

## 📋 COORDINATION PROTOCOL

When you need to edit a protected file:

1. Check with the other developer in chat
2. Agree on who edits first
3. Make your changes
4. Commit and push
5. Notify the other developer
6. Other developer pulls changes
7. Other developer makes their changes

---

## 🎯 CURRENT STATUS

- ✅ Email System V2: Migration applied, building services
- ✅ PerfectPrint AI: In development
- ✅ Both developers aware of coordination requirements

---

**Last Updated:** December 1, 2025

