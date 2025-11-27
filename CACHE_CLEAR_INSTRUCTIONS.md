# 🔄 FULL SYSTEM RESTART & CACHE CLEAR INSTRUCTIONS
## McCarthy Artwork Agent - November 27, 2025

---

## 🎯 PURPOSE

Clear all caches to ensure the latest deployed code is being used, not cached old versions.

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### STEP 1: Clear Cloudflare Workers Cache

#### Option A: Via Wrangler CLI (Recommended)
```bash
cd d:\coding\agent-army-system\packages\worker
wrangler deployments list
wrangler deployments view [deployment-id]
```

Then redeploy to force cache clear:
```bash
npm run deploy
```

#### Option B: Via Cloudflare Dashboard
1. Go to https://dash.cloudflare.com
2. Select your account
3. Go to **Workers & Pages**
4. Find `dartmouth-os-worker`
5. Click on it
6. Go to **Settings** → **Triggers**
7. Note the worker URL
8. Go back to **Overview**
9. Click **Quick Edit** → **Save and Deploy** (this forces a redeploy)

---

### STEP 2: Clear Browser Cache

#### Chrome/Edge:
1. Open the site: https://artwork-analyser-ai-agent-1qo.pages.dev
2. Press `Ctrl + Shift + Delete`
3. Select:
   - ✅ Cached images and files
   - ✅ Cookies and other site data
   - Time range: **Last 24 hours**
4. Click **Clear data**
5. Close all browser tabs for the site
6. Reopen in a **new incognito/private window**

#### Alternative (Hard Refresh):
1. Open the site
2. Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. Or press `Ctrl + F5`

---

### STEP 3: Clear Cloudflare Pages Cache

1. Go to https://dash.cloudflare.com
2. Select your account
3. Go to **Workers & Pages**
4. Find `artwork-analyser-ai-agent-1qo`
5. Click on it
6. Go to **Deployments**
7. Find the latest deployment
8. Click **...** → **Retry deployment**

OR

Go to the **Settings** tab:
1. Scroll to **Build & deployments**
2. Click **Retry deployment** on the latest production deployment

---

### STEP 4: Clear KV Namespace Cache (If Needed)

The agent uses KV for caching. To clear:

```bash
cd d:\coding\agent-army-system\packages\worker
wrangler kv:key list --namespace-id=4dde59b47cc34c9495aba50d7312df1d
```

To delete specific cache keys:
```bash
wrangler kv:key delete "cache:key:here" --namespace-id=4dde59b47cc34c9495aba50d7312df1d
```

To clear ALL cache (nuclear option):
```bash
wrangler kv:key list --namespace-id=4dde59b47cc34c9495aba50d7312df1d | ForEach-Object { wrangler kv:key delete $_.name --namespace-id=4dde59b47cc34c9495aba50d7312df1d }
```

---

### STEP 5: Verify Deployment Version

Check that the latest code is deployed:

```bash
cd d:\coding\agent-army-system\packages\worker
wrangler deployments list
```

Look for the most recent deployment timestamp. It should be from today (Nov 27, 2025).

---

### STEP 6: Test RAG Directly

Before testing the agent, verify RAG is working:

```powershell
Invoke-WebRequest -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/test/rag" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"action":"search","agentId":"mccarthy-artwork","query":"what can UV DTF be used for","topK":3}' | Select-Object -ExpandProperty Content
```

**Expected:** Should return chunks about "HARD SURFACES ONLY"

---

### STEP 7: Test Agent

1. Open https://artwork-analyser-ai-agent-1qo.pages.dev in **incognito/private window**
2. Upload an artwork file
3. Ask: `what can UV DTF be used for?`

**Expected Response:**
- Should mention: Metal, glass, wood, ceramic, plastic, acrylic
- Should say: "HARD SURFACES ONLY"
- Should NOT say: Textiles, apparel, fabrics

**If Still Wrong:**
- Response has bullet points → LLM fallback (WRONG)
- Response is raw text → RAG handler (CORRECT)

---

## 🔍 TROUBLESHOOTING

### If Still Getting Wrong Answers:

#### Check 1: Verify Intent Detection
The question should be detected as `information` intent. Check browser console for logs.

#### Check 2: Verify Handler Registration
InformationHandler should be registered and handling the intent.

#### Check 3: Check for Frontend Caching
The React frontend might be cached. Clear browser cache again and use incognito.

#### Check 4: Check Worker Logs
```bash
cd d:\coding\agent-army-system\packages\worker
wrangler tail
```

Then ask the question and watch the logs in real-time.

#### Check 5: Verify RAG Agent ID
The handlers should be using `'mccarthy-artwork'` as the agent ID, not `context.state?.agentId`.

---

## 🚨 NUCLEAR OPTION

If nothing works, do a complete redeploy:

```bash
# 1. Redeploy worker
cd d:\coding\agent-army-system\packages\worker
npm run deploy

# 2. Wait 30 seconds

# 3. Reload RAG database
cd scripts
node load-knowledge-base.js

# 4. Wait 30 seconds

# 5. Clear all browser data

# 6. Test in incognito window
```

---

## ✅ SUCCESS CRITERIA

You'll know it's working when:

1. ✅ RAG test returns correct info (hard surfaces)
2. ✅ Agent response is RAW TEXT (not bullet points)
3. ✅ Agent says "hard surfaces only"
4. ✅ Agent does NOT mention textiles/apparel

---

## 📊 EXPECTED vs ACTUAL

### Expected (Correct):
```
UV DTF: Suitable For HARD SURFACES ONLY

UV DTF creates durable, waterproof stickers with a clear laminate layer 
that adheres to non-porous hard surfaces. These are NOT suitable for textiles.

Compatible Surfaces:
- Metal - Stainless steel tumblers, aluminum bottles, tin signs
- Glass - Glassware, windows, mirrors, glass bottles, jars
- Wood - Painted or sealed wood, wooden signs, furniture
- Ceramic - Mugs, plates, tiles, ceramic drinkware
- Plastic - Hard plastic containers, phone cases
- Acrylic - Acrylic signs, displays, awards, keychains
```

### Actual (Wrong - LLM Hallucination):
```
UV DTF (Direct-to-Film) printing can be used for:
- Textiles: Printing on a variety of fabrics for apparel, bags, and more.
- Promotional Merchandise: Ideal for creating custom items like mugs, hats...
- Signage: Excellent for producing vibrant, durable signs...
```

---

## 🔗 RELATED DOCUMENTS

- `CRITICAL_ISSUE_RAG_VS_LLM_2025-11-27.md` - Full issue analysis
- `RETEST_RESULTS_2025-11-27.md` - Test results
- `STATUS_UPDATE_2025-11-27_POST_FIXES.md` - Status update

---

**Last Updated:** 2025-11-27 14:45 AEDT  
**Status:** Ready for cache clear and retest

**END OF INSTRUCTIONS**

