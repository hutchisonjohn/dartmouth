# 🚀 Deployment Guide - Dartmouth Agent Army

Complete step-by-step guide to deploy the Agent Army system to Cloudflare Workers.

---

## 📋 Prerequisites

1. **Cloudflare Account** - Sign up at https://dash.cloudflare.com
2. **Wrangler CLI** - Already installed in project
3. **API Keys** - OpenAI, Anthropic, and/or Google API keys

---

## 🔧 Step 1: Authenticate with Cloudflare

```bash
cd packages/worker
npx wrangler login
```

This will open your browser to authenticate.

---

## 🗄️ Step 2: Create D1 Database

```bash
# Create the database
npx wrangler d1 create agent-army-db
```

**Output will look like:**
```
✅ Successfully created DB 'agent-army-db'!

[[d1_databases]]
binding = "DB"
database_name = "agent-army-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Copy the `database_id` and update `wrangler.toml`:**
```toml
[[d1_databases]]
binding = "DB"
database_name = "agent-army-db"
database_id = "YOUR-DATABASE-ID-HERE"  # ← Paste here
```

---

## 📊 Step 3: Run Database Migration

```bash
# Run the migration locally first (test)
npx wrangler d1 execute agent-army-db --local --file=./migrations/0001_initial_schema.sql

# Run the migration on production
npx wrangler d1 execute agent-army-db --remote --file=./migrations/0001_initial_schema.sql
```

**Verify tables were created:**
```bash
npx wrangler d1 execute agent-army-db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"
```

**Expected output:**
- sessions
- messages
- semantic_memory
- episodic_memory
- documents
- rag_chunks
- agent_analytics
- feedback
- agent_configs

---

## 🗂️ Step 4: Create KV Namespaces

```bash
# Create APP_CONFIG namespace
npx wrangler kv:namespace create "APP_CONFIG"

# Create CACHE namespace
npx wrangler kv:namespace create "CACHE"
```

**Each command will output an ID. Update `wrangler.toml`:**
```toml
[[kv_namespaces]]
binding = "APP_CONFIG"
id = "YOUR-APP-CONFIG-ID"  # ← Paste here

[[kv_namespaces]]
binding = "CACHE"
id = "YOUR-CACHE-ID"  # ← Paste here
```

---

## 🪣 Step 5: Create R2 Bucket

```bash
npx wrangler r2 bucket create agent-army-files
```

---

## 🔐 Step 6: Set Secrets

```bash
# Set API keys (you'll be prompted to enter each value)
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put GOOGLE_API_KEY

# Optional: Set other secrets if needed
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put CLERK_SECRET_KEY
npx wrangler secret put JWT_SECRET
```

**Note:** Secrets are encrypted and not visible in wrangler.toml

---

## 🚀 Step 7: Deploy!

```bash
# Deploy to production
npx wrangler deploy
```

**Output will show:**
```
✨ Built successfully
✨ Uploaded successfully
✨ Deployed successfully
🌍 https://agent-army-worker.YOUR-SUBDOMAIN.workers.dev
```

**Copy your worker URL!**

---

## ✅ Step 8: Verify Deployment

### Test Health Check
```bash
curl https://agent-army-worker.YOUR-SUBDOMAIN.workers.dev/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-17T...",
  "version": "1.0.0",
  "services": {
    "database": "up",
    "cache": "up",
    "llm": "up"
  }
}
```

### Test Root Endpoint
```bash
curl https://agent-army-worker.YOUR-SUBDOMAIN.workers.dev/
```

**Expected response:**
```json
{
  "name": "Dartmouth Agent Army API",
  "version": "1.0.0",
  "status": "operational",
  "endpoints": { ... }
}
```

### Test Chat Endpoint
```bash
curl -X POST https://agent-army-worker.YOUR-SUBDOMAIN.workers.dev/test/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```

**Expected response:**
```json
{
  "content": "Hello! How can I help you today?",
  "metadata": {
    "sessionId": "...",
    "messageId": "...",
    "processingTimeMs": 123
  }
}
```

---

## 🔍 Step 9: Monitor Logs

```bash
# View real-time logs
npx wrangler tail
```

---

## 📊 Step 10: View Dashboard

Visit: https://dash.cloudflare.com/

Navigate to:
- **Workers & Pages** → Your worker
- **D1** → agent-army-db
- **KV** → Your namespaces
- **R2** → agent-army-files

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check database exists
npx wrangler d1 list

# Check tables
npx wrangler d1 execute agent-army-db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### KV Namespace Issues
```bash
# List namespaces
npx wrangler kv:namespace list

# Test write/read
npx wrangler kv:key put --namespace-id=YOUR-ID "test" "value"
npx wrangler kv:key get --namespace-id=YOUR-ID "test"
```

### Secret Issues
```bash
# List secrets (names only, not values)
npx wrangler secret list

# Update a secret
npx wrangler secret put ANTHROPIC_API_KEY
```

### Deployment Issues
```bash
# Check wrangler version
npx wrangler --version

# Validate wrangler.toml
npx wrangler deploy --dry-run

# View detailed logs
npx wrangler tail --format=pretty
```

---

## 🔄 Updating After Changes

```bash
# After making code changes
cd packages/worker

# Check TypeScript
npm run lint

# Deploy updated code
npx wrangler deploy
```

---

## 🌍 Custom Domain (Optional)

1. Go to Cloudflare Dashboard
2. Navigate to Workers & Pages → Your worker
3. Click "Triggers" tab
4. Click "Add Custom Domain"
5. Enter your domain (e.g., api.yourdomain.com)
6. Follow DNS setup instructions

---

## 📈 Performance Optimization

### Enable Caching
Already configured in the code with KV namespace.

### Monitor Usage
- Dashboard → Workers & Pages → Analytics
- View requests, errors, CPU time
- Set up alerts for errors

### Rate Limiting (Future)
Consider adding rate limiting for production:
```typescript
// In routes/index.ts
// Add rate limiting middleware
```

---

## 🔒 Security Checklist

- ✅ Secrets stored securely (not in code)
- ✅ CORS configured properly
- ✅ Input validation on all endpoints
- ✅ Error messages don't leak sensitive info
- ⚠️ TODO: Add authentication for production endpoints
- ⚠️ TODO: Add rate limiting
- ⚠️ TODO: Add request signing

---

## 📝 Environment Variables

**Set in wrangler.toml:**
- `ENVIRONMENT` - "production" or "development"

**Set as secrets:**
- `ANTHROPIC_API_KEY` - Claude API key
- `OPENAI_API_KEY` - OpenAI API key
- `GOOGLE_API_KEY` - Google AI API key
- `STRIPE_SECRET_KEY` - (Optional) Stripe payments
- `CLERK_SECRET_KEY` - (Optional) Auth
- `JWT_SECRET` - (Optional) Token signing

---

## 🎯 Quick Deployment Checklist

- [ ] Authenticate: `npx wrangler login`
- [ ] Create D1 database
- [ ] Update database_id in wrangler.toml
- [ ] Run migration
- [ ] Create KV namespaces
- [ ] Update KV IDs in wrangler.toml
- [ ] Create R2 bucket
- [ ] Set API key secrets
- [ ] Deploy: `npx wrangler deploy`
- [ ] Test health endpoint
- [ ] Test chat endpoint
- [ ] Monitor logs: `npx wrangler tail`

---

## 🚀 You're Live!

Once deployed, your API is available at:
```
https://agent-army-worker.YOUR-SUBDOMAIN.workers.dev
```

**Available Endpoints:**
- `GET /` - API documentation
- `GET /health` - Health check
- `POST /test/chat` - Test conversation
- `POST /api/v1/agents/:agentId/chat` - Production chat

---

## 📞 Support

- **Cloudflare Docs:** https://developers.cloudflare.com/workers/
- **Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler/
- **D1 Docs:** https://developers.cloudflare.com/d1/
- **Community:** https://discord.gg/cloudflaredev

---

**Deployment Guide Version:** 1.0.0  
**Last Updated:** November 17, 2025  
**Status:** Ready for Production 🚀

