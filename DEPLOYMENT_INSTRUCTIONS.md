# 🚀 DEPLOYMENT INSTRUCTIONS

## Quick Deploy (Run these commands):

### 1. Install Dependencies
```bash
cd packages/worker
npm install
```

### 2. Set JWT Secret
```bash
npx wrangler secret put JWT_SECRET
# When prompted, paste: dartmouth-os-jwt-secret-2025
```

### 3. Deploy
```bash
npx wrangler deploy
```

### 4. Test API
```bash
# Test login
curl -X POST https://dartmouth-os-worker.dartmouth.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@dtf.com.au\",\"password\":\"changeme123\"}"

# Copy the token from response, then test tickets
curl https://dartmouth-os-worker.dartmouth.workers.dev/api/tickets \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Test Credentials
- **Email:** john@dtf.com.au
- **Password:** changeme123
- **Role:** admin

---

**JWT Secret is in:** `packages/worker/set-jwt-secret.txt`


