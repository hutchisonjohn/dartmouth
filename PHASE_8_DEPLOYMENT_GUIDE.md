# 🚀 Phase 8: Deployment Guide

**Deploy Dartmouth OS V2.0 to Cloudflare**

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

Before deploying, ensure:

- [x] All tests passing (100% - 43/43)
- [x] Backup created (Phase 7 complete)
- [x] `wrangler.toml` configured
- [ ] Cloudflare account ready
- [ ] API keys ready
- [ ] Cloudflare resources created

---

## 🔑 **STEP 1: PREPARE CLOUDFLARE RESOURCES**

### **1.1: Create D1 Database**

```bash
cd packages/worker

# Create production database
npx wrangler d1 create dartmouth-os-db

# Note the database_id and update wrangler.toml if different
```

### **1.2: Create KV Namespaces**

```bash
# Create APP_CONFIG namespace
npx wrangler kv:namespace create "APP_CONFIG"

# Create CACHE namespace
npx wrangler kv:namespace create "CACHE"

# Note the IDs and update wrangler.toml if different
```

### **1.3: Create R2 Buckets**

```bash
# Create production bucket
npx wrangler r2 bucket create dartmouth-os-files

# Create preview bucket
npx wrangler r2 bucket create dartmouth-os-files-preview
```

---

## 🔐 **STEP 2: SET CLOUDFLARE SECRETS**

### **Required Secrets:**

```bash
cd packages/worker

# OpenAI API Key (REQUIRED)
npx wrangler secret put OPENAI_API_KEY
# Enter your key when prompted: sk-proj-...

# JWT Secret (REQUIRED for auth)
npx wrangler secret put JWT_SECRET
# Enter a secure random string

# Optional: Anthropic API Key
npx wrangler secret put ANTHROPIC_API_KEY

# Optional: Google API Key
npx wrangler secret put GOOGLE_API_KEY
```

---

## 📦 **STEP 3: BUILD & DEPLOY**

### **3.1: Install Dependencies**

```bash
cd D:\coding\agent-army-system

# Install all dependencies
npm install

# Build TypeScript
npm run build
```

### **3.2: Deploy to Cloudflare**

```bash
cd packages/worker

# Deploy the worker
npm run deploy

# Or use wrangler directly
npx wrangler deploy
```

**Expected Output:**
```
⛅️ wrangler 3.x.x
-------------------------------------------------------
✨ Built successfully!
✨ Deployed dartmouth-os-worker
  https://dartmouth-os-worker.your-subdomain.workers.dev
```

---

## ✅ **STEP 4: VERIFY DEPLOYMENT**

### **4.1: Test Root Endpoint**

```bash
curl https://dartmouth-os-worker.your-subdomain.workers.dev/
```

**Expected Response:**
```json
{
  "name": "Dartmouth OS API",
  "version": "2.0.0",
  "status": "operational",
  "dartmouth": {
    "version": "2.0.0",
    "status": "active",
    "agents": ["fam", "mccarthy-artwork", "test-agent"]
  }
}
```

### **4.2: Test Health Endpoint**

```bash
curl https://dartmouth-os-worker.your-subdomain.workers.dev/api/v2/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "agents": [
    { "agentId": "fam", "status": "healthy" },
    { "agentId": "mccarthy-artwork", "status": "healthy" },
    { "agentId": "test-agent", "status": "healthy" }
  ]
}
```

### **4.3: Test Agents List**

```bash
curl https://dartmouth-os-worker.your-subdomain.workers.dev/api/v2/agents
```

**Expected Response:**
```json
{
  "total": 3,
  "healthy": 3,
  "unhealthy": 0,
  "agents": [...]
}
```

### **4.4: Test Chat Endpoint**

```bash
curl -X POST https://dartmouth-os-worker.your-subdomain.workers.dev/api/v2/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "fam",
    "message": "Hello!",
    "sessionId": "test-123",
    "userId": "test-user"
  }'
```

**Expected Response:**
```json
{
  "content": "Hey there! 👋 I'm here to help...",
  "type": "text",
  "metadata": {
    "timestamp": 1234567890,
    "processingTime": 1234
  }
}
```

---

## 🌐 **STEP 5: UPDATE UI FILES**

### **5.1: Update FAM Test UI**

**File:** `public/test-fam.html`

Change:
```javascript
const API_URL = 'http://localhost:8787/api/v2/chat';
```

To:
```javascript
const API_URL = 'https://dartmouth-os-worker.your-subdomain.workers.dev/api/v2/chat';
```

### **5.2: Update Artwork Analyzer UI**

**File:** `public/index.html`

Change:
```javascript
const API_URL = 'http://localhost:8787/api/v2/chat';
```

To:
```javascript
const API_URL = 'https://dartmouth-os-worker.your-subdomain.workers.dev/api/v2/chat';
```

### **5.3: Deploy UI to Cloudflare Pages**

```bash
cd D:\coding\agent-army-system

# Create Pages project
npx wrangler pages project create dartmouth-ui

# Deploy public folder
npx wrangler pages deploy public --project-name=dartmouth-ui
```

---

## 🧪 **STEP 6: RUN PRODUCTION TESTS**

### **6.1: Update Test Script**

**File:** `tools/scripts/test-dartmouth.js`

Change:
```javascript
const API_BASE = 'http://localhost:8787';
```

To:
```javascript
const API_BASE = 'https://dartmouth-os-worker.your-subdomain.workers.dev';
```

### **6.2: Run Tests**

```bash
node tools/scripts/test-dartmouth.js
```

**Expected:** 43/43 tests passing (100%)

---

## 📊 **STEP 7: MONITOR DEPLOYMENT**

### **7.1: Check Cloudflare Dashboard**

1. Go to https://dash.cloudflare.com/
2. Navigate to Workers & Pages
3. Click on `dartmouth-os-worker`
4. Check:
   - ✅ Status: Active
   - ✅ Invocations: Requests coming through
   - ✅ Errors: Should be 0
   - ✅ CPU Time: Should be reasonable

### **7.2: View Logs**

```bash
cd packages/worker

# Tail live logs
npx wrangler tail
```

### **7.3: Check Analytics**

- Requests per second
- Success rate
- Error rate
- P50/P95/P99 latency

---

## 🐛 **TROUBLESHOOTING**

### **Issue: "Database not found"**

**Solution:**
1. Verify database exists: `npx wrangler d1 list`
2. Check `database_id` in `wrangler.toml`
3. Recreate database if needed

### **Issue: "KV namespace not found"**

**Solution:**
1. Verify namespaces exist: `npx wrangler kv:namespace list`
2. Check IDs in `wrangler.toml`
3. Recreate namespaces if needed

### **Issue: "OpenAI API error"**

**Solution:**
1. Verify secret is set: `npx wrangler secret list`
2. Re-set secret: `npx wrangler secret put OPENAI_API_KEY`
3. Check API key is valid

### **Issue: "Agent not found"**

**Solution:**
1. Check agent initialization in worker logs
2. Verify Dartmouth OS is initializing
3. Check for startup errors

---

## ✅ **SUCCESS CRITERIA**

Deployment is successful when:

- [x] Worker deployed without errors
- [x] All endpoints respond (root, health, agents, chat)
- [x] All 3 agents registered
- [x] Health checks return "healthy"
- [x] Chat endpoint returns responses
- [x] UI files connect successfully
- [x] No errors in logs
- [x] 100% test pass rate in production

---

## 📝 **POST-DEPLOYMENT TASKS**

1. **Update Documentation**
   - Update README with live URLs
   - Update API docs with production endpoints
   - Update testing guides

2. **Configure Custom Domain (Optional)**
   - Add custom domain in Cloudflare
   - Update DNS records
   - Update UI files with custom domain

3. **Set Up Monitoring**
   - Enable Cloudflare Analytics
   - Set up alerts for errors/downtime
   - Configure health check monitoring

4. **Final Backup**
   - Git commit all changes
   - Push to GitHub
   - Tag release: `v2.0.0`

---

## 🎉 **DEPLOYMENT COMPLETE!**

Once all steps are complete and tests pass:

**Dartmouth OS V2.0 is LIVE!** 🚀

---

**Deployment Date:** November 20, 2024  
**Version:** 2.0.0  
**Status:** Production-Ready

---

**Next:** Phase 9 - Build Dartmouth Dashboard

