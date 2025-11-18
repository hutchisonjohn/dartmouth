# 🚀 Quick Start Deployment - 5 Minutes

Get your Agent Army deployed to Cloudflare Workers in 5 minutes!

---

## Prerequisites

- Cloudflare account (free tier works!)
- At least one API key (Anthropic, OpenAI, or Google)

---

## Step 1: Login (30 seconds)

```bash
cd packages/worker
npx wrangler login
```

Browser will open → Click "Allow" → Done!

---

## Step 2: Create Database (30 seconds)

```bash
npm run db:create
```

**Copy the `database_id` from output and paste into `wrangler.toml` line 10**

---

## Step 3: Run Migration (30 seconds)

```bash
npm run db:migrate:remote
```

Creates all 9 tables automatically!

---

## Step 4: Create KV Namespaces (1 minute)

```bash
npm run kv:create:config
```
**Copy the ID and paste into `wrangler.toml` line 15**

```bash
npm run kv:create:cache
```
**Copy the ID and paste into `wrangler.toml` line 19**

---

## Step 5: Create R2 Bucket (30 seconds)

```bash
npm run r2:create
```

---

## Step 6: Set API Keys (1 minute)

**Choose at least ONE:**

```bash
npx wrangler secret put ANTHROPIC_API_KEY
# Paste your key when prompted

npx wrangler secret put OPENAI_API_KEY
# Paste your key when prompted

npx wrangler secret put GOOGLE_API_KEY
# Paste your key when prompted
```

---

## Step 7: Deploy! (30 seconds)

```bash
npm run deploy
```

**Copy your worker URL from the output!**

---

## Step 8: Test (30 seconds)

Replace `YOUR-WORKER-URL` with your actual URL:

```bash
# Health check
curl https://YOUR-WORKER-URL/health

# Test chat
curl -X POST https://YOUR-WORKER-URL/test/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```

---

## 🎉 Done!

Your Agent Army is now live!

**What's next?**

1. **Monitor logs:** `npm run logs`
2. **View dashboard:** https://dash.cloudflare.com/
3. **Read full guide:** See `DEPLOYMENT_GUIDE.md`

---

## 🆘 Quick Troubleshooting

**"Database not found"**
- Make sure you updated `database_id` in `wrangler.toml`

**"Namespace not found"**
- Make sure you updated KV IDs in `wrangler.toml`

**"Unauthorized"**
- Run `npx wrangler login` again

**"Health check fails"**
- Wait 30 seconds for deployment to propagate
- Check logs: `npm run logs`

---

## 📊 Useful Commands

```bash
# View logs in real-time
npm run logs

# Re-deploy after changes
npm run deploy

# Run tests before deploying
npm run deploy:full

# Query database
npm run db:query:remote "SELECT COUNT(*) FROM sessions;"
```

---

**Total Time:** ~5 minutes  
**Cost:** $0 (Free tier)  
**Status:** Production Ready! ✅

