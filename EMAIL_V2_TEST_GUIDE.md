# Email System V2 - Local Testing Guide

**Status**: Ready to Test  
**Worker URL**: https://dartmouth-os-worker.dartmouth.workers.dev

---

## 🧪 Test Endpoints Available

### 1. Test Full Email Flow (Recommended)
Tests the complete inbound → storage → outbound flow.

```bash
curl -X POST https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/test/full-flow \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "customer@example.com",
    "customerName": "Test Customer",
    "subject": "Help with my order",
    "initialMessage": "Hello, I need help with order #12345",
    "replyMessage": "Thank you for contacting us! We will help you right away."
  }'
```

**What it does**:
1. ✅ Simulates inbound email from customer
2. ✅ Creates conversation in database
3. ✅ Stores inbound email
4. ✅ Sends reply via MailChannels
5. ✅ Stores outbound email
6. ✅ Returns full results with threading info

---

### 2. Simulate Inbound Email Only
Test just the inbound email processing.

```bash
curl -X POST https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/test/inbound \
  -H "Content-Type: application/json" \
  -d '{
    "from": "customer@example.com",
    "to": "john@dtf.com.au",
    "subject": "Test Email",
    "body": "This is a test email body"
  }'
```

---

### 3. Test Outbound Email Only
Test sending via MailChannels (requires existing conversation).

```bash
curl -X POST https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/test/outbound \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "CONVERSATION_ID_HERE",
    "content": "This is a test reply",
    "toEmail": "customer@example.com"
  }'
```

---

### 4. List Test Conversations
See all conversations created during testing.

```bash
curl https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/test/conversations
```

---

### 5. Cleanup Test Data
Delete all test conversations and emails.

```bash
curl -X POST https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/test/cleanup
```

---

## 🎯 Recommended Test Sequence

### Step 1: Run Full Flow Test
```bash
curl -X POST https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/test/full-flow \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "john.hutchison@example.com",
    "customerName": "John Hutchison",
    "subject": "Question about DTF printing",
    "initialMessage": "Hi, I would like to know more about your DTF printing services. What sizes do you support?",
    "replyMessage": "Thank you for your inquiry! We support all standard sizes from A4 to A0. Our DTF prints are high quality with vibrant colors. Would you like a quote?"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Full email flow test completed successfully",
  "results": {
    "steps": [
      { "step": 1, "status": "success", "message": "Inbound email processed" },
      { "step": 2, "status": "success", "message": "Conversation found" },
      { "step": 3, "status": "success", "message": "Email stored" },
      { "step": 4, "status": "success", "message": "Reply sent via MailChannels" },
      { "step": 5, "status": "success", "message": "Reply stored in database" }
    ],
    "conversation": { ... },
    "email": { ... },
    "replyEmail": { ... }
  }
}
```

---

### Step 2: Check Conversations
```bash
curl https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/test/conversations
```

**Look for**:
- ✅ Conversation created
- ✅ `customer_email` matches
- ✅ `subject` matches
- ✅ `email_count` shows 2 (inbound + outbound)

---

### Step 3: Check Database Directly
```powershell
cd D:\coding\DARTMOUTH_OS_PROJECT\packages\worker
npx wrangler d1 execute dartmouth-os-db --command="SELECT * FROM conversations ORDER BY created_at DESC LIMIT 5;" --remote
```

---

### Step 4: Check Emails
```powershell
npx wrangler d1 execute dartmouth-os-db --command="SELECT id, direction, from_email, to_email, subject, message_id, in_reply_to, references_header FROM emails ORDER BY created_at DESC LIMIT 5;" --remote
```

**Look for**:
- ✅ Inbound email: `direction = 'inbound'`
- ✅ Outbound email: `direction = 'outbound'`
- ✅ Outbound has `in_reply_to` set to inbound's `message_id`
- ✅ Outbound has `references_header` set
- ✅ Outbound `message_id` uses dtf.com.au domain

---

### Step 5: Check Quota
```powershell
npx wrangler d1 execute dartmouth-os-db --command="SELECT * FROM tenant_email_quota;" --remote
```

**Look for**:
- ✅ `used_today` incremented by 1 (for outbound email)

---

### Step 6: Test Multiple Emails (Threading)
```bash
# First email
curl -X POST https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/test/full-flow \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "threading-test@example.com",
    "customerName": "Threading Test",
    "subject": "Threading Test Email",
    "initialMessage": "First message",
    "replyMessage": "First reply"
  }'

# Get conversation ID from response, then send another email to same conversation
# (You'll need to manually create another inbound email with same customer_email)
```

---

### Step 7: Cleanup
```bash
curl -X POST https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/test/cleanup
```

---

## ✅ What To Verify

### Inbound Email Processing
- [ ] Conversation created with correct `tenant_id`, `mailbox_id`
- [ ] Email stored with `direction = 'inbound'`
- [ ] `message_id` extracted from headers
- [ ] `from_email`, `to_email`, `subject` correct
- [ ] `body_text` and `body_html` stored

### Outbound Email Processing
- [ ] Email sent via MailChannels (check logs)
- [ ] Email stored with `direction = 'outbound'`
- [ ] `user_id` set (even if test user)
- [ ] `message_id` generated with dtf.com.au domain
- [ ] `in_reply_to` set to parent's `message_id`
- [ ] `references_header` includes parent's `message_id`
- [ ] Quota incremented

### Threading Headers
- [ ] Inbound: `message_id` = `<...@example.com>`
- [ ] Outbound: `message_id` = `<...@dtf.com.au>`
- [ ] Outbound: `in_reply_to` = inbound's `message_id`
- [ ] Outbound: `references_header` = inbound's `message_id`

### Conversation Management
- [ ] Multiple emails link to same conversation
- [ ] `last_message_at` updates correctly
- [ ] `email_count` accurate

---

## 🐛 Troubleshooting

### Error: "No mailbox configured for address"
**Problem**: The `to` address doesn't match a mailbox in database.  
**Solution**: Use `john@dtf.com.au` or `info@dtf.com.au` (seeded in migration).

### Error: "Conversation not found"
**Problem**: Trying to send outbound without inbound first.  
**Solution**: Use the full flow test, or create inbound first.

### Error: "Daily email quota exceeded"
**Problem**: Sent too many test emails.  
**Solution**: Run cleanup endpoint or reset quota manually:
```sql
UPDATE tenant_email_quota SET used_today = 0 WHERE tenant_id = 'test-tenant-dtf';
```

### Error: "MailChannels send failed"
**Problem**: MailChannels API error.  
**Solution**: Check worker logs:
```powershell
npx wrangler tail dartmouth-os-worker --format pretty
```

---

## 📊 Expected Results

### Successful Full Flow Test
```json
{
  "success": true,
  "message": "Full email flow test completed successfully",
  "results": {
    "steps": [
      { "step": 1, "status": "success" },
      { "step": 2, "status": "success" },
      { "step": 3, "status": "success" },
      { "step": 4, "status": "success" },
      { "step": 5, "status": "success" }
    ],
    "conversation": {
      "id": "...",
      "tenant_id": "test-tenant-dtf",
      "mailbox_id": "mailbox-john",
      "subject": "Help with my order",
      "customer_email": "customer@example.com",
      "status": "open"
    },
    "email": {
      "id": "...",
      "direction": "inbound",
      "message_id": "<test-...@example.com>",
      "from_email": "customer@example.com",
      "to_email": "john@dtf.com.au"
    },
    "replyEmail": {
      "id": "...",
      "direction": "outbound",
      "message_id": "<...@dtf.com.au>",
      "in_reply_to": "<test-...@example.com>",
      "references_header": "<test-...@example.com>",
      "from_email": "john@dtf.com.au",
      "to_email": "customer@example.com"
    }
  }
}
```

---

## 🎉 Success Criteria

- ✅ All 5 steps complete successfully
- ✅ Conversation created in database
- ✅ Inbound email stored
- ✅ Outbound email sent via MailChannels
- ✅ Outbound email stored
- ✅ Threading headers correct
- ✅ Quota incremented
- ✅ No errors in logs

Once all tests pass, we're ready for DNS configuration! 🚀

---

## 📞 Next Steps After Testing

1. ✅ Verify all tests pass
2. Configure Cloudflare Email Routing
3. Add DNS records (MX + SPF)
4. Test with real emails
5. Build frontend UI

**Current Status**: Testing Phase  
**Progress**: 80% Complete

