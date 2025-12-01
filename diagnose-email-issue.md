# Customer Service Email System - Diagnostic Guide

## Current Status
- ✅ Wrangler dev is working
- ✅ Database exists and is accessible
- ❌ No tickets in database (empty)
- ❓ Cron job status unknown
- ❓ Email polling working unknown

## Email Filter Configuration

**Current Filter (Line 193 in GmailIntegration.ts):**
```
from:johnpaulhutchison@gmail.com
```

This filter will ONLY fetch unread emails from `johnpaulhutchison@gmail.com` that are in the inbox of `john@dtf.com.au`.

## Possible Issues

### 1. No Emails Match the Filter
- **Check**: Are there unread emails from `johnpaulhutchison@gmail.com` in `john@dtf.com.au` inbox?
- **Action**: Send a test email from `johnpaulhutchison@gmail.com` to `john@dtf.com.au`

### 2. Cron Job Not Running
- **Check**: View Cloudflare Worker logs
- **Command**: `npx wrangler tail --format pretty`
- **Look for**: `[Scheduled] Email polling job triggered`

### 3. Gmail OAuth Token Expired
- **Check**: Logs will show "Invalid refresh token" or "401 Unauthorized"
- **Action**: Refresh the Gmail OAuth token

### 4. Cron Not Deployed
- **Check**: Was the worker deployed after adding cron configuration?
- **Action**: `npx wrangler deploy`

### 5. Email Already Read
- **Check**: Gmail only fetches UNREAD emails
- **Action**: Make sure test emails are unread in Gmail

## Quick Diagnostic Steps

### Step 1: Check Cloudflare Logs
```powershell
cd packages/worker
npx wrangler tail --format pretty
```
Wait 5 minutes to see if cron triggers. Look for:
- `[Scheduled] Email polling job triggered`
- `[EmailPoller] Starting email polling job`
- `[EmailPoller] Found X unread emails`

### Step 2: Manual Trigger Test
```powershell
Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/trigger-email-poll"
```
This will show you the logs immediately without waiting for cron.

### Step 3: Check Gmail Directly
1. Log into `john@dtf.com.au` Gmail account
2. Search for: `from:johnpaulhutchison@gmail.com is:unread`
3. Count how many emails match

### Step 4: Send Test Email
1. From `johnpaulhutchison@gmail.com`
2. To: `john@dtf.com.au`
3. Subject: "Test Ticket - [Current Time]"
4. Body: "This is a test email for the customer service system"
5. Wait 5 minutes for cron OR trigger manually

### Step 5: Verify Deployment
```powershell
cd packages/worker
npx wrangler deploy
```
Make sure the latest code with cron configuration is deployed.

## Expected Behavior

When working correctly:
1. Cron triggers every 5 minutes
2. Email poller fetches unread emails from `johnpaulhutchison@gmail.com`
3. Tickets are created in database
4. Emails are marked as read (or processed)
5. Dashboard shows new tickets

## Next Steps

1. **Run**: `npx wrangler tail` to see if cron is triggering
2. **If no cron logs**: Deploy the worker (`npx wrangler deploy`)
3. **If cron triggers but no emails**: Send test email from `johnpaulhutchison@gmail.com`
4. **If emails found but no tickets**: Check logs for errors in ticket creation
5. **If OAuth errors**: Refresh Gmail tokens

## Dashboard Access

- URL: http://localhost:3000/tickets
- Login: `admin@dtf.com.au` / `admin123`

## Useful Commands

```powershell
# View logs (real-time)
npx wrangler tail --format pretty

# Deploy worker
npx wrangler deploy

# Check tickets
npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT COUNT(*) FROM tickets;"

# Check emails table
npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT COUNT(*) FROM emails;"

# Manual trigger
Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/trigger-email-poll"

# View recent tickets
npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT ticket_number, subject, customer_email, created_at FROM tickets ORDER BY created_at DESC LIMIT 5;"
```

