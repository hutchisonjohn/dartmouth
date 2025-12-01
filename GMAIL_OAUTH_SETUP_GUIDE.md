# 📧 GMAIL OAUTH SETUP GUIDE

**Purpose:** Enable CustomerServiceAgent to read/send emails via Gmail API  
**Time:** ~15 minutes  
**Required:** Google Workspace or Gmail account

---

## 🔧 **STEP 1: Create Google Cloud Project**

1. Go to: https://console.cloud.google.com/
2. Click **"Select a project"** → **"New Project"**
3. **Project Name:** `Dartmouth-Customer-Service`
4. Click **"Create"**
5. Wait for project to be created (~30 seconds)

---

## 🔧 **STEP 2: Enable Gmail API**

1. In your new project, go to: https://console.cloud.google.com/apis/library
2. Search for: **"Gmail API"**
3. Click **"Gmail API"**
4. Click **"Enable"**
5. Wait for API to enable (~10 seconds)

---

## 🔧 **STEP 3: Configure OAuth Consent Screen**

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. **User Type:** Select **"Internal"** (if Google Workspace) or **"External"** (if Gmail)
3. Click **"Create"**

### **OAuth Consent Screen - Page 1:**
- **App name:** `Dartmouth Customer Service`
- **User support email:** Your email
- **App logo:** (optional)
- **App domain:** (leave blank for now)
- **Authorized domains:** (leave blank for now)
- **Developer contact:** Your email
- Click **"Save and Continue"**

### **OAuth Consent Screen - Page 2 (Scopes):**
- Click **"Add or Remove Scopes"**
- Search and add these scopes:
  - `https://www.googleapis.com/auth/gmail.readonly` (Read emails)
  - `https://www.googleapis.com/auth/gmail.send` (Send emails)
  - `https://www.googleapis.com/auth/gmail.compose` (Create drafts)
  - `https://www.googleapis.com/auth/gmail.modify` (Mark as read)
- Click **"Update"**
- Click **"Save and Continue"**

### **OAuth Consent Screen - Page 3 (Test Users):**
- Click **"Add Users"**
- Add your email address (the one you'll use for customer service)
- Click **"Add"**
- Click **"Save and Continue"**

### **OAuth Consent Screen - Page 4 (Summary):**
- Review and click **"Back to Dashboard"**

---

## 🔧 **STEP 4: Create OAuth 2.0 Credentials**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. **Application type:** Select **"Web application"**
4. **Name:** `Dartmouth CS Agent`
5. **Authorized redirect URIs:** Click **"Add URI"**
   - Add: `http://localhost:3000/oauth/callback` (for local testing)
   - Add: `https://your-worker-domain.workers.dev/oauth/callback` (for production)
6. Click **"Create"**

### **Save These Credentials:**
You'll see a popup with:
- **Client ID:** `xxxxx.apps.googleusercontent.com`
- **Client Secret:** `xxxxx`

**⚠️ IMPORTANT:** Copy these NOW! You'll need them for the next step.

---

## 🔧 **STEP 5: Get Refresh Token**

We need to get a refresh token to access Gmail without user interaction.

### **Option A: Use OAuth Playground (Easiest)**

1. Go to: https://developers.google.com/oauthplayground/
2. Click the **⚙️ (gear icon)** in top right
3. Check **"Use your own OAuth credentials"**
4. Enter your **Client ID** and **Client Secret** from Step 4
5. Click **"Close"**

6. In **Step 1** (Select & authorize APIs):
   - Scroll down to **"Gmail API v1"**
   - Check these scopes:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.send`
     - `https://www.googleapis.com/auth/gmail.compose`
     - `https://www.googleapis.com/auth/gmail.modify`
   - Click **"Authorize APIs"**

7. Sign in with your Gmail/Google Workspace account
8. Click **"Allow"** to grant permissions

9. In **Step 2** (Exchange authorization code for tokens):
   - Click **"Exchange authorization code for tokens"**
   - You'll see a **Refresh token** appear
   - **⚠️ COPY THIS!** You won't see it again!

### **Option B: Use Node.js Script (Advanced)**

Create a file `get-gmail-token.js`:

```javascript
const { google } = require('googleapis');
const readline = require('readline');

const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'http://localhost:3000/oauth/callback'
);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

console.log('Authorize this app by visiting this url:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the code from that page here: ', (code) => {
  rl.close();
  oauth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    console.log('Refresh Token:', token.refresh_token);
  });
});
```

Run:
```bash
npm install googleapis
node get-gmail-token.js
```

---

## 🔧 **STEP 6: Add to Wrangler Secrets**

Now add your credentials to Cloudflare Workers:

```bash
cd packages/worker

# Add Gmail credentials as secrets
npx wrangler secret put GMAIL_CLIENT_ID
# Paste your Client ID and press Enter

npx wrangler secret put GMAIL_CLIENT_SECRET
# Paste your Client Secret and press Enter

npx wrangler secret put GMAIL_REFRESH_TOKEN
# Paste your Refresh Token and press Enter
```

---

## 🔧 **STEP 7: Update wrangler.toml**

Add these to `packages/worker/wrangler.toml`:

```toml
[vars]
GMAIL_REDIRECT_URI = "https://your-worker-domain.workers.dev/oauth/callback"
AI_RESPONSE_MODE = "draft"  # or "auto"
```

---

## ✅ **VERIFICATION**

Test your setup:

```bash
cd packages/worker
npm run test:gmail
```

This will:
1. Fetch latest 5 emails
2. Display sender, subject, date
3. Confirm OAuth is working

---

## 📝 **CREDENTIALS SUMMARY**

You should now have:

| Credential | Where to Find | Where to Store |
|------------|---------------|----------------|
| Client ID | Google Cloud Console | Wrangler Secret |
| Client Secret | Google Cloud Console | Wrangler Secret |
| Refresh Token | OAuth Playground | Wrangler Secret |
| Redirect URI | You define it | wrangler.toml |

---

## 🔒 **SECURITY NOTES**

1. ✅ **NEVER** commit credentials to git
2. ✅ Use Wrangler secrets for sensitive data
3. ✅ Refresh tokens don't expire (unless revoked)
4. ✅ Keep Client Secret private
5. ✅ Use "Internal" app type if using Google Workspace
6. ✅ Regularly review OAuth consent screen

---

## 🐛 **TROUBLESHOOTING**

### **"Access blocked: This app's request is invalid"**
- Make sure you added your email as a test user in OAuth consent screen

### **"redirect_uri_mismatch"**
- Check that redirect URI in code matches the one in Google Cloud Console

### **"invalid_grant"**
- Refresh token might be expired or revoked
- Go back to OAuth Playground and get a new one

### **"insufficient permissions"**
- Make sure all 4 Gmail scopes are enabled in OAuth consent screen

---

## 🎯 **NEXT STEPS**

After completing this setup:
1. ✅ Credentials stored in Wrangler secrets
2. ✅ Gmail API enabled
3. ✅ OAuth working
4. ⏭️ Build email polling worker
5. ⏭️ Test end-to-end flow

---

**Time to complete:** ~15 minutes  
**Difficulty:** Easy (just follow steps)  
**One-time setup:** Yes (credentials last forever unless revoked)


