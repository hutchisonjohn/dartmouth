# ✅ Deployment Checklist - Dartmouth Agent Army

Use this checklist to ensure a smooth deployment to Cloudflare Workers.

---

## 🔐 Pre-Deployment Requirements

### Accounts & Access
- [ ] Cloudflare account created (https://dash.cloudflare.com)
- [ ] Cloudflare Workers plan selected (Free or Paid)
- [ ] Wrangler CLI authenticated (`npx wrangler login`)

### API Keys
- [ ] At least ONE of these API keys obtained:
  - [ ] Anthropic API key (https://console.anthropic.com)
  - [ ] OpenAI API key (https://platform.openai.com)
  - [ ] Google AI API key (https://makersuite.google.com)

### Optional Services
- [ ] Stripe account (if using payments)
- [ ] Clerk account (if using authentication)

---

## 🛠️ Pre-Deployment Setup

### Code Quality
- [ ] All TypeScript errors fixed (`npm run lint`)
- [ ] All tests passing (`npm test`)
- [ ] No console.log statements in production code
- [ ] Environment-specific code properly configured

### Configuration Files
- [ ] `wrangler.toml` reviewed and updated
- [ ] Database binding name is "DB"
- [ ] KV bindings are "APP_CONFIG" and "CACHE"
- [ ] R2 binding is "FILES"
- [ ] Workers AI binding is "WORKERS_AI"

### Database
- [ ] Migration file reviewed (`migrations/0001_initial_schema.sql`)
- [ ] All 9 tables defined
- [ ] All indexes created
- [ ] All triggers configured

---

## 🚀 Deployment Steps

### Step 1: Authenticate
```bash
cd packages/worker
npx wrangler login
```
- [ ] Browser opened and authenticated successfully
- [ ] `npx wrangler whoami` shows your account

### Step 2: Create D1 Database
```bash
npx wrangler d1 create agent-army-db
```
- [ ] Database created successfully
- [ ] Database ID copied
- [ ] Database ID pasted into `wrangler.toml` (line 10)

### Step 3: Run Database Migration
```bash
# Test locally first
npx wrangler d1 execute agent-army-db --local --file=./migrations/0001_initial_schema.sql

# Deploy to production
npx wrangler d1 execute agent-army-db --remote --file=./migrations/0001_initial_schema.sql
```
- [ ] Local migration successful
- [ ] Remote migration successful
- [ ] Tables verified: `npx wrangler d1 execute agent-army-db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"`

### Step 4: Create KV Namespaces
```bash
npx wrangler kv:namespace create "APP_CONFIG"
npx wrangler kv:namespace create "CACHE"
```
- [ ] APP_CONFIG namespace created
- [ ] APP_CONFIG ID copied and pasted into `wrangler.toml` (line 15)
- [ ] CACHE namespace created
- [ ] CACHE ID copied and pasted into `wrangler.toml` (line 19)

### Step 5: Create R2 Bucket
```bash
npx wrangler r2 bucket create agent-army-files
```
- [ ] R2 bucket created successfully
- [ ] Bucket name matches `wrangler.toml` (line 24)

### Step 6: Set Secrets
```bash
# Required: At least one API key
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put GOOGLE_API_KEY

# Optional
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put CLERK_SECRET_KEY
npx wrangler secret put JWT_SECRET
```
- [ ] At least one LLM API key set
- [ ] Secrets verified: `npx wrangler secret list`

### Step 7: Deploy Worker
```bash
npx wrangler deploy
```
- [ ] Build successful
- [ ] Upload successful
- [ ] Deployment successful
- [ ] Worker URL copied

---

## ✅ Post-Deployment Verification

### Health Checks
```bash
# Replace YOUR-WORKER-URL with your actual URL
curl https://YOUR-WORKER-URL/health
```
- [ ] Health endpoint returns `{"status": "healthy"}`
- [ ] Database status is "up"
- [ ] Cache status is "up"

### API Root
```bash
curl https://YOUR-WORKER-URL/
```
- [ ] Returns API documentation
- [ ] Shows all available endpoints
- [ ] Version number displayed

### Test Chat
```bash
curl -X POST https://YOUR-WORKER-URL/test/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```
- [ ] Returns greeting response
- [ ] Includes sessionId and messageId
- [ ] Processing time is reasonable (<2000ms)

### Test Intent Detection
```bash
curl -X POST https://YOUR-WORKER-URL/test/intent \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 2+2?"}'
```
- [ ] Returns detected intent
- [ ] Confidence score present
- [ ] Intent type is correct

### Database Operations
```bash
# Check sessions table
npx wrangler d1 execute agent-army-db --remote --command="SELECT COUNT(*) FROM sessions;"
```
- [ ] Query executes successfully
- [ ] Returns count (may be 0 initially)

---

## 📊 Monitoring Setup

### Cloudflare Dashboard
- [ ] Navigate to Workers & Pages
- [ ] Find your worker
- [ ] Check "Metrics" tab
- [ ] Set up alerts for errors

### Real-time Logs
```bash
npx wrangler tail
```
- [ ] Logs streaming successfully
- [ ] Can see requests in real-time

### Analytics
- [ ] View request count
- [ ] Check error rate
- [ ] Monitor CPU time
- [ ] Review bandwidth usage

---

## 🔒 Security Checklist

### Secrets Management
- [ ] No API keys in code
- [ ] No secrets in wrangler.toml
- [ ] All secrets set via `wrangler secret put`
- [ ] Secrets not logged anywhere

### CORS Configuration
- [ ] CORS headers properly set
- [ ] Allowed origins configured
- [ ] Preflight requests handled

### Input Validation
- [ ] All endpoints validate input
- [ ] SQL injection prevention (using prepared statements)
- [ ] XSS prevention
- [ ] Rate limiting considered (future enhancement)

### Error Handling
- [ ] Errors don't leak sensitive information
- [ ] Stack traces not exposed in production
- [ ] Generic error messages for users

---

## 🌍 Optional: Custom Domain

If you want to use a custom domain:

1. [ ] Go to Cloudflare Dashboard
2. [ ] Workers & Pages → Your worker → Triggers
3. [ ] Click "Add Custom Domain"
4. [ ] Enter domain (e.g., api.yourdomain.com)
5. [ ] Follow DNS setup instructions
6. [ ] Wait for DNS propagation
7. [ ] Test custom domain

---

## 📝 Documentation Updates

After deployment:

- [ ] Update README with production URL
- [ ] Document API endpoints with examples
- [ ] Create user guide if needed
- [ ] Update environment variables documentation

---

## 🎯 Final Verification

### Functional Tests
- [ ] Greeting intent works
- [ ] Calculation intent works
- [ ] Information intent works
- [ ] Fallback handler works
- [ ] Session management works
- [ ] Memory system works (if implemented)

### Performance Tests
- [ ] Response time < 2 seconds
- [ ] No timeout errors
- [ ] Database queries fast
- [ ] Cache working properly

### Load Tests (Optional)
- [ ] Can handle 10 concurrent requests
- [ ] No errors under load
- [ ] Response times consistent

---

## 🐛 Troubleshooting

If something goes wrong:

### Database Issues
```bash
# Verify database exists
npx wrangler d1 list

# Check tables
npx wrangler d1 execute agent-army-db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"

# Re-run migration if needed
npx wrangler d1 execute agent-army-db --remote --file=./migrations/0001_initial_schema.sql
```

### KV Issues
```bash
# List namespaces
npx wrangler kv:namespace list

# Test write/read
npx wrangler kv:key put --namespace-id=YOUR-ID "test" "value"
npx wrangler kv:key get --namespace-id=YOUR-ID "test"
```

### Secret Issues
```bash
# List secrets
npx wrangler secret list

# Update secret
npx wrangler secret put ANTHROPIC_API_KEY
```

### Deployment Issues
```bash
# Dry run
npx wrangler deploy --dry-run

# Check logs
npx wrangler tail --format=pretty

# Rollback (deploy previous version)
# Note: Keep track of git commits for rollback
```

---

## 🔄 Rollback Plan

If deployment fails:

1. [ ] Note the error message
2. [ ] Check logs: `npx wrangler tail`
3. [ ] Fix the issue locally
4. [ ] Test locally: `npm run dev`
5. [ ] Re-deploy: `npx wrangler deploy`

If critical issue:
1. [ ] Revert git commit: `git revert HEAD`
2. [ ] Re-deploy previous version: `npx wrangler deploy`
3. [ ] Investigate issue
4. [ ] Fix and re-deploy when ready

---

## 📞 Support Resources

- **Cloudflare Docs:** https://developers.cloudflare.com/workers/
- **Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler/
- **D1 Docs:** https://developers.cloudflare.com/d1/
- **Discord:** https://discord.gg/cloudflaredev
- **Community Forum:** https://community.cloudflare.com/

---

## ✨ Success Criteria

Deployment is successful when:

- ✅ All health checks pass
- ✅ All test endpoints work
- ✅ No errors in logs
- ✅ Database queries succeed
- ✅ Response times acceptable
- ✅ Secrets properly configured
- ✅ Monitoring set up

---

**Checklist Version:** 1.0.0  
**Last Updated:** November 17, 2025  
**Status:** Ready for Use ✅

