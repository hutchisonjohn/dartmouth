# 🚀 Cloudflare Logs - Quick Start

## ⚡ Super Quick

**Start watching logs:**
```powershell
.\view-logs.ps1 -Live
```

**Then test your agent** (in another window):
- Go to: https://artwork-analyser-ai-agent-1qo.pages.dev
- Ask a question
- Watch logs appear!

**Stop logs:**
- Press `Ctrl+C`

---

## 📋 Common Commands

```powershell
# Watch all logs
.\view-logs.ps1 -Live

# Watch only errors
.\view-logs.ps1 -Live -Filter "error"

# Watch for specific text
.\view-logs.ps1 -Live -Filter "sRGB"

# Show help
.\view-logs.ps1 -Help
```

---

## 🐛 Debug a Crash

1. **Start logs:**
   ```powershell
   .\view-logs.ps1 -Live
   ```

2. **Reproduce the crash** (ask the question that crashes)

3. **Look for** `ERROR` or stack traces

4. **Fix the code**

5. **Deploy:**
   ```powershell
   cd packages\worker
   npx wrangler deploy
   ```

6. **Test again** (logs still running)

---

## ⚠️ Important

- **Logs are real-time only** - No history
- **Start logs BEFORE testing** - Can't see past logs
- **Logs expire after 1 hour** - Need to restart

---

## 📖 Full Guide

See `CLOUDFLARE_LOGS_GUIDE.md` for complete documentation.

