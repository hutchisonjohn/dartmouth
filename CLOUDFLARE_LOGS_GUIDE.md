# 📋 Cloudflare Worker Logs Guide

**Worker:** dartmouth-os-worker  
**Account:** john@dtf.com.au

---

## 🎯 Quick Start

### Option 1: Use the Helper Scripts (Easiest)

**PowerShell:**
```powershell
.\view-logs.ps1 -Live
```

**Batch File:**
```cmd
view-logs.bat
```

### Option 2: Direct Wrangler Commands

**Live streaming:**
```bash
cd packages/worker
npx wrangler tail dartmouth-os-worker --format pretty
```

**With filtering:**
```bash
npx wrangler tail dartmouth-os-worker --format pretty | Select-String "error"
```

---

## 📖 Understanding Cloudflare Logs

### ⚠️ Important Limitations

1. **No Historical Logs**: Cloudflare Workers do NOT store logs by default
2. **Real-time Only**: You can only see logs as they happen (streaming)
3. **1 Hour Limit**: Log streaming sessions expire after 1 hour
4. **Must Be Active**: You need to make requests to see logs

### What This Means

- You can't view "past" logs
- You must stream logs BEFORE making test requests
- Logs disappear after the streaming session ends

---

## 🔧 How to Use Logs for Debugging

### Step 1: Start Log Streaming

Open a terminal and run:
```powershell
.\view-logs.ps1 -Live
```

Or:
```bash
cd packages/worker
npx wrangler tail dartmouth-os-worker --format pretty
```

### Step 2: Make a Test Request

While logs are streaming, test your agent:

**Option A: Use the Artwork Analyser**
- Go to: https://artwork-analyser-ai-agent-1qo.pages.dev
- Upload artwork
- Ask: "how do I convert to sRGB?"
- Watch logs appear in terminal

**Option B: Use curl**
```powershell
curl -X POST https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/chat `
  -H "Content-Type: application/json" `
  -d '{
    "agentId": "mccarthy-artwork",
    "message": "hello",
    "sessionId": "test-123",
    "userId": "test-user"
  }'
```

**Option C: Use the test script**
```bash
node test-srgb-simple.js
```

### Step 3: Read the Logs

Look for:
- `[HowToHandler]` - How-to question processing
- `[BaseAgent]` - General agent processing
- `ERROR` - Error messages
- Stack traces - Crash information

### Step 4: Stop Streaming

Press `Ctrl+C` to stop the log stream.

---

## 🎨 Log Output Format

### What You'll See

```
GET https://dartmouth-os-worker.dartmouth.workers.dev/health 200 OK
  [INFO] Request completed in 15ms

POST https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/chat 200 OK
  [BaseAgent] Processing message: "hello"
  [HowToHandler] 🎯 HANDLING HOW-TO QUESTION
  [HowToHandler] Message: hello
  [INFO] Response generated in 1250ms
```

### Log Levels

- `[INFO]` - Normal operations
- `[WARN]` - Warnings (not critical)
- `[ERROR]` - Errors (something failed)
- `console.log()` - Custom debug messages

---

## 🔍 Filtering Logs

### Filter by Keyword

**PowerShell:**
```powershell
npx wrangler tail dartmouth-os-worker --format pretty | Select-String "error"
```

**Using helper script:**
```powershell
.\view-logs.ps1 -Live -Filter "error"
```

### Common Filters

**Find errors:**
```powershell
| Select-String "error"
| Select-String "ERROR"
| Select-String "failed"
```

**Find specific handler:**
```powershell
| Select-String "HowToHandler"
| Select-String "BaseAgent"
| Select-String "RAG"
```

**Find specific question:**
```powershell
| Select-String "sRGB"
| Select-String "convert"
```

---

## 🛠️ Advanced Options

### Wrangler Tail Options

```bash
npx wrangler tail [worker-name] [options]
```

**Options:**
- `--format pretty` - Human-readable format (recommended)
- `--format json` - JSON format (for parsing)
- `--status error` - Only show errors
- `--status ok` - Only show successful requests
- `--header "X-Custom-Header: value"` - Filter by header
- `--method POST` - Filter by HTTP method
- `--search "text"` - Search for text in logs

### Examples

**Only errors:**
```bash
npx wrangler tail dartmouth-os-worker --format pretty --status error
```

**Only POST requests:**
```bash
npx wrangler tail dartmouth-os-worker --format pretty --method POST
```

**Search for specific text:**
```bash
npx wrangler tail dartmouth-os-worker --format pretty --search "sRGB"
```

---

## 💡 Debugging Workflow

### Scenario 1: "Agent is crashing on a specific question"

1. **Start logs:**
   ```powershell
   .\view-logs.ps1 -Live
   ```

2. **Ask the question** in Artwork Analyser

3. **Look for:**
   - Error messages
   - Stack traces
   - Which handler is processing
   - Where it crashes

4. **Fix the code** based on error

5. **Deploy:**
   ```bash
   cd packages/worker
   npx wrangler deploy
   ```

6. **Test again** (logs still streaming)

### Scenario 2: "Agent gives wrong answer"

1. **Start logs with filter:**
   ```powershell
   npx wrangler tail dartmouth-os-worker --format pretty | Select-String "RAG"
   ```

2. **Ask the question**

3. **Look for:**
   - RAG query being made
   - What documents are retrieved
   - Confidence scores

4. **Adjust RAG logic** if needed

### Scenario 3: "Agent is slow"

1. **Start logs:**
   ```powershell
   .\view-logs.ps1 -Live
   ```

2. **Ask question**

3. **Look for:**
   - `processingTime` values
   - Which operations take longest
   - OpenAI API calls

4. **Optimize** slow operations

---

## 📊 Log Storage Options (Optional)

### If You Need Historical Logs

Cloudflare offers **Logpush** (paid feature) to store logs:

1. **Workers Paid Plan** ($5/month)
2. **Logpush** to:
   - Amazon S3
   - Google Cloud Storage
   - Azure Blob Storage
   - Cloudflare R2
   - HTTP endpoint

**Setup:**
```bash
npx wrangler logpush create
```

**Cost:** ~$0.50 per million log lines

---

## 🎯 Helper Scripts Reference

### view-logs.ps1 (PowerShell)

**Options:**
- `-Live` - Stream live logs
- `-Recent` - Show recent logs (60 seconds)
- `-Filter "text"` - Filter by text
- `-Help` - Show help

**Examples:**
```powershell
.\view-logs.ps1 -Live
.\view-logs.ps1 -Live -Filter "error"
.\view-logs.ps1 -Recent
.\view-logs.ps1 -Help
```

### view-logs.bat (Batch)

**Usage:**
```cmd
view-logs.bat
```

Simple live streaming (no options).

---

## 🚨 Troubleshooting

### "No logs appearing"

**Causes:**
1. Worker not receiving requests
2. Logs filtered out
3. Worker not deployed

**Solutions:**
1. Make a test request
2. Remove filters
3. Check worker is deployed: `npx wrangler deployments list`

### "Connection timeout"

**Causes:**
1. Not authenticated
2. Wrong worker name
3. Network issues

**Solutions:**
1. Login: `npx wrangler login`
2. Check worker name: `npx wrangler deployments list`
3. Check internet connection

### "Wrangler not found"

**Solution:**
```bash
npm install -g wrangler
```

Or use npx (no install needed):
```bash
npx wrangler tail dartmouth-os-worker
```

---

## 📝 Quick Reference Card

| Task | Command |
|------|---------|
| **Start live logs** | `.\view-logs.ps1 -Live` |
| **Filter errors** | `.\view-logs.ps1 -Live -Filter "error"` |
| **Stop logs** | Press `Ctrl+C` |
| **Deploy worker** | `cd packages/worker && npx wrangler deploy` |
| **Check deployment** | `npx wrangler deployments list` |
| **Login** | `npx wrangler login` |
| **Worker health** | `curl https://dartmouth-os-worker.dartmouth.workers.dev/health` |

---

## 🔗 Useful Links

- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Worker Logs**: Workers & Pages → dartmouth-os-worker → Logs
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/
- **Logpush Docs**: https://developers.cloudflare.com/logs/get-started/

---

## ✅ Best Practices

1. **Start logs BEFORE testing** - Logs are real-time only
2. **Use filters** - Reduce noise in logs
3. **Keep sessions short** - They expire after 1 hour
4. **Add console.log()** - In your code for debugging
5. **Deploy frequently** - Test changes immediately
6. **Use helper scripts** - Easier than remembering commands

---

**Last Updated:** 2025-11-27  
**Wrangler Version:** 4.46.0  
**Worker:** dartmouth-os-worker

