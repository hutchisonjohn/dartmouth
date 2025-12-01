# Gmail OAuth Debug Guide

## Error We're Seeing

```
"error": "invalid_client",
"error_description": "The OAuth client was not found."
```

## What This Means

Google's OAuth server cannot find the OAuth client with the CLIENT_ID we're sending. This happens when:

1. **Wrong CLIENT_ID** - Typo or wrong value
2. **OAuth client deleted** - Removed from Google Cloud Console
3. **Wrong Google Cloud Project** - Using CLIENT_ID from different project
4. **Project disabled/deleted** - The entire GCP project is gone

## Steps to Debug

### Step 1: Check Current Secrets

Run:
```bash
cd packages/worker
npx wrangler secret list
```

Look for:
- GMAIL_CLIENT_ID
- GMAIL_CLIENT_SECRET  
- GMAIL_REFRESH_TOKEN

### Step 2: Check Google Cloud Console

1. Go to: https://console.cloud.google.com
2. Select project: **Dartmouth-CS-TEST** (or whatever you named it)
3. Go to: APIs & Services > Credentials
4. Look for OAuth 2.0 Client IDs
5. Click on the client to see the CLIENT_ID

### Step 3: Compare Values

Compare the CLIENT_ID from Google Cloud Console with what's in Cloudflare secrets.

### Step 4: If CLIENT_ID is Wrong

Update the secret:
```bash
npx wrangler secret put GMAIL_CLIENT_ID
# Paste the correct CLIENT_ID from Google Cloud Console
```

### Step 5: If OAuth Client Doesn't Exist

You need to create a new one:
1. In Google Cloud Console > Credentials
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: Web application
4. Add redirect URI: `https://dartmouth-os-worker.dartmouth.workers.dev/oauth/callback`
5. Copy the CLIENT_ID and CLIENT_SECRET
6. Get a new refresh token using OAuth Playground

### Step 6: Test Again

After updating secrets, trigger the email poll:
```bash
Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/trigger-email-poll"
```

## Quick Workaround (Test Dashboard Without Gmail)

Insert a test ticket to see the dashboard working:
```bash
cd packages/worker
npx wrangler d1 execute dartmouth-os-db --remote --file=insert-test-ticket.sql
```

Then refresh the dashboard at http://localhost:3000/tickets

---

## Files to Check

- `GMAIL_OAUTH_SETUP_GUIDE.md` - Original setup instructions
- `packages/worker/wrangler.toml` - GMAIL_REDIRECT_URI setting
- `packages/worker/src/services/GmailIntegration.ts` - OAuth implementation


