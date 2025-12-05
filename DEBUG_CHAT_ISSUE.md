# 🔍 Debug Chat Issue

## Problem
AI messages appear in dashboard but not in widget (and vice versa)

## Quick Diagnostic Steps

### 1. Check Browser Console (Widget Side)
Open the chat widget and check console for:
- `[McCarthyChat] Starting message polling` - Should appear
- `[McCarthyChat] Conversation started: conv_xxx` - Should show conversation ID
- Any fetch errors or CORS errors
- Any 401/403/500 errors

### 2. Check Network Tab
- Look for `/api/chat/conversation/conv_xxx/poll` requests
- Should be happening every 2 seconds
- Check if they're returning 200 OK
- Check the response - does it contain messages?

### 3. Check Conversation Status in Database
Run this query in Cloudflare D1:
```sql
SELECT id, status, assigned_to, customer_name 
FROM chat_conversations 
WHERE customer_email = 'john@directtofilm.com.au'
ORDER BY created_at DESC 
LIMIT 5;
```

Look for:
- Status should be `ai_handling` or `queued`
- If it's `staff_handling` or `assigned`, AI won't respond

### 4. Check Messages in Database
```sql
SELECT conversation_id, sender_type, sender_name, content, created_at
FROM chat_messages
WHERE conversation_id = 'conv_xxx'  -- Use actual conversation ID
ORDER BY created_at ASC;
```

Should show all messages from both sides.

## Common Causes

### Cause 1: Conversation Status Wrong
**Symptom:** AI not responding  
**Check:** Conversation status is `staff_handling` or `assigned`  
**Fix:**
```sql
UPDATE chat_conversations 
SET status = 'ai_handling', assigned_to = 'ai-agent-001' 
WHERE id = 'conv_xxx';
```

### Cause 2: Polling Not Working
**Symptom:** Messages not syncing  
**Check:** No poll requests in Network tab  
**Fix:** Widget needs to be redeployed or page refreshed

### Cause 3: CORS Issue
**Symptom:** Fetch errors in console  
**Check:** "CORS policy" errors  
**Fix:** Worker CORS configuration

### Cause 4: Widget Not Deployed
**Symptom:** Old widget code running  
**Check:** Widget version/timestamp  
**Fix:** Deploy widget

## Immediate Test

Run this in browser console on the widget page:
```javascript
// Check if conversation ID exists
console.log('Conversation ID:', sessionStorage.getItem('mccarthy-conversation-id'));

// Manually poll
fetch('https://dartmouth-os-worker.dartmouth.workers.dev/api/chat/conversation/YOUR_CONV_ID/poll')
  .then(r => r.json())
  .then(d => console.log('Poll result:', d))
  .catch(e => console.error('Poll error:', e));
```

Replace `YOUR_CONV_ID` with actual conversation ID from sessionStorage.

## What to Check Next

1. **Is the widget polling?** (Network tab)
2. **Are messages in the database?** (D1 query)
3. **What's the conversation status?** (D1 query)
4. **Any console errors?** (Browser console)

## Most Likely Issue

Based on the screenshot, messages ARE being saved (they show in dashboard), so the issue is likely:

1. **Widget not polling** - Check Network tab
2. **Polling wrong conversation ID** - Check sessionStorage
3. **Widget cache** - Hard refresh (Ctrl+Shift+R)


