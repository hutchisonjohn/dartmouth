# 🐛 Known Issues & Blockers

**Last Updated:** November 18, 2025, 10:15 PM

---

## 🚨 CRITICAL BLOCKERS

### 1. Widget Deployment Not Working
**Status:** BLOCKING  
**Priority:** HIGH  
**Discovered:** November 18, 2025

**Problem:**
- Cloudflare Pages deployment attempted for widget
- URL `mccarthy-widget.pages.dev` returns `DNS_PROBE_FINISHED_NXDOMAIN`
- Widget not accessible at any URL
- Localhost testing also showed nothing

**Impact:**
- Cannot test widget functionality
- Cannot demonstrate McCarthy Artwork Agent with chat UI
- Phase 6 blocked at 75% completion

**Attempted Solutions:**
- Tried deploying with `npx wrangler pages deploy dist --project-name mccarthy-widget`
- Created test.html file in dist folder
- Build process works fine, deployment is the issue

**Workarounds:**
1. Use existing Artwork Analyser chat widget instead
2. Deploy to existing `dartmouth-chat.pages.dev` project
3. Test via API calls without UI

**Next Steps:**
- Check if Pages project was actually created in Cloudflare dashboard
- Try deploying to existing Pages project instead
- Consider using existing working widget from Artwork Analyser

---

### 2. AI Assistant Hanging/Blocking
**Status:** RECURRING  
**Priority:** HIGH  
**Discovered:** November 18, 2025

**Problem:**
- AI assistant gets stuck in loops trying to solve the same problem
- Requires manual intervention (user stopping the process)
- Wasted significant time in last session (over 1 hour on file creation issues)
- Happened multiple times in same session

**Impact:**
- Significant time waste
- User frustration
- Incomplete tasks
- Need to restart sessions

**Root Causes Identified:**
1. File creation issues - tool reported success but files didn't persist
2. Path confusion - writing to wrong locations
3. Repeating same failed approach instead of pivoting
4. No time limits or circuit breakers

**Solutions Implemented:**
- Document clear time limits (30 min max per issue)
- Create pivot strategies (use existing code, ask user for help)
- Better documentation for next session

**Prevention:**
- Set 30-minute time limit on any single debugging task
- After 3 failed attempts, pivot to different approach
- Use existing working code as reference
- Ask user for manual intervention sooner

---

## ⚠️ MEDIUM PRIORITY ISSUES

### 3. Knowledge Base Not Loaded
**Status:** NOT STARTED  
**Priority:** MEDIUM  
**Discovered:** Throughout Phase 6

**Problem:**
- McCarthy Artwork Agent has no RAG documents loaded
- Cannot answer domain-specific questions about DTF, UV DTF, DPI standards
- 3 markdown documents ready but not ingested

**Impact:**
- Agent can only use base knowledge, not specialized artwork knowledge
- Cannot provide accurate technical guidance
- Core functionality incomplete

**Files Ready:**
- `packages/mccarthy-artwork/src/knowledge/DTF_Artwork_Requirements.md`
- `packages/mccarthy-artwork/src/knowledge/UV_DTF_Artwork_Requirements.md`
- `packages/mccarthy-artwork/src/knowledge/DPI_QUALITY_STANDARDS.md`

**Next Steps:**
1. Ingest documents into RAG engine
2. Create embeddings with Workers AI
3. Test knowledge retrieval
4. Verify citations working

---

### 4. No Integration Testing
**Status:** NOT STARTED  
**Priority:** MEDIUM

**Problem:**
- Widget not tested with live Dartmouth worker
- No HTML integration example
- No React integration example
- No mobile testing

**Impact:**
- Unknown if widget actually works end-to-end
- Cannot provide integration examples to users
- May have hidden bugs

**Next Steps:**
1. Create simple HTML test page
2. Create React integration example
3. Test on mobile devices
4. Document integration process

---

### 5. No Unit Tests for Phase 6
**Status:** NOT STARTED  
**Priority:** MEDIUM

**Problem:**
- CalculationEngine has no tests
- Artwork handlers have no tests
- Widget components have no tests
- No E2E tests

**Impact:**
- Cannot verify functionality
- Risk of regressions
- No confidence in code quality

**Next Steps:**
1. Write CalculationEngine tests
2. Write handler tests
3. Write widget component tests
4. Write E2E integration tests

---

## 🔧 MINOR ISSUES

### 6. Build Warnings
**Status:** MINOR  
**Priority:** LOW

**Problem:**
- Vite shows CJS deprecation warning
- PostCSS config warning about module type
- Entry module using named and default exports

**Impact:**
- Cosmetic only, build still works
- May cause issues in future Vite versions

**Solution:**
- Add `"type": "module"` to package.json
- Update export strategy in index.tsx

---

### 7. Escaped Quotes in PowerShell
**Status:** RESOLVED  
**Priority:** LOW (for reference)

**Problem:**
- PowerShell `Out-File` command escaped quotes in JSX
- Caused build errors with `className=\"...\"` instead of `className="..."`

**Solution:**
- Use `write` tool instead of PowerShell for file creation
- Or manually fix escaped quotes after creation

**Lesson Learned:**
- PowerShell string handling can break JSX syntax
- Always verify file contents after creation

---

## 📋 ISSUE TRACKING

### By Priority:
- **CRITICAL (2):** Widget deployment, AI assistant hanging
- **MEDIUM (3):** Knowledge base, integration testing, unit tests
- **MINOR (2):** Build warnings, PowerShell escaping (resolved)

### By Status:
- **BLOCKING (1):** Widget deployment
- **RECURRING (1):** AI assistant hanging
- **NOT STARTED (3):** Knowledge base, testing, integration
- **RESOLVED (1):** Escaped quotes

---

## 🎯 RESOLUTION PLAN

### Immediate (Next Session):
1. Fix widget deployment OR use existing Artwork Analyser widget
2. Load knowledge base (high priority)
3. Create simple test to verify McCarthy Agent works

### Short Term (This Week):
4. Complete integration testing
5. Write critical unit tests
6. Fix build warnings

### Long Term (Next Week):
7. Comprehensive E2E testing
8. Performance testing
9. Mobile testing

---

**This document should be updated as issues are discovered and resolved.**

