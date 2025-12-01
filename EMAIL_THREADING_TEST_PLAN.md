# Email Threading Test Plan
**Created**: November 29, 2025 - 11:45 PM
**Priority**: 🚨 CRITICAL - Must be fixed before production

---

## 🚨 CRITICAL ISSUE DISCOVERED

### Problem
The `replyToTicket` function in `packages/worker/src/controllers/tickets.ts` is **NOT sending emails** to customers.

**Current Behavior**:
- Staff types a reply in the dashboard
- Reply is saved to the database
- **NO EMAIL IS SENT** to the customer
- Customer never receives the response

**Expected Behavior**:
- Staff types a reply
- Reply is saved to database
- Email is sent to customer via Gmail API
- Email appears in the same thread as the original email
- Customer replies come back to the same ticket

---

## 📋 What Needs to Be Fixed

### 1. Update `replyToTicket` Function
**File**: `packages/worker/src/controllers/tickets.ts` (lines 204-241)

**Current Code** (INCOMPLETE):
```typescript
export async function replyToTicket(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;
    const ticketId = c.req.param('id');
    const { content } = await c.req.json();

    if (!content) {
      return c.json({ error: 'content required' }, 400);
    }

    const messageId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Get staff member's name
    const staffInfo = await c.env.DB.prepare(`
      SELECT first_name, last_name FROM staff_users WHERE id = ?
    `).bind(user.id).first();

    const staffName = staffInfo 
      ? `${staffInfo.first_name} ${staffInfo.last_name}` 
      : user.email;

    // Save to database
    await c.env.DB.prepare(`
      INSERT INTO ticket_messages (id, ticket_id, sender_type, sender_id, sender_name, content, created_at)
      VALUES (?, ?, 'agent', ?, ?, ?, ?)
    `).bind(messageId, ticketId, user.id, staffName, content, now).run();

    // Update ticket
    await c.env.DB.prepare(`
      UPDATE tickets SET updated_at = ? WHERE ticket_id = ?
    `).bind(now, ticketId).run();

    return c.json({ message: 'Reply added', messageId });
  } catch (error) {
    console.error('[Tickets] Reply error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
```

**Required Code** (COMPLETE):
```typescript
export async function replyToTicket(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;
    const ticketId = c.req.param('id');
    const { content } = await c.req.json();

    if (!content) {
      return c.json({ error: 'content required' }, 400);
    }

    // 1. Get ticket information (customer email, thread ID, original message ID, subject)
    const ticket = await c.env.DB.prepare(`
      SELECT customer_email, gmail_thread_id, gmail_message_id, subject
      FROM tickets
      WHERE ticket_id = ?
    `).bind(ticketId).first();

    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    const messageId = crypto.randomUUID();
    const now = new Date().toISOString();

    // 2. Get staff member's name
    const staffInfo = await c.env.DB.prepare(`
      SELECT first_name, last_name FROM staff_users WHERE id = ?
    `).bind(user.id).first();

    const staffName = staffInfo 
      ? `${staffInfo.first_name} ${staffInfo.last_name}` 
      : user.email;

    // 3. Save to database FIRST
    await c.env.DB.prepare(`
      INSERT INTO ticket_messages (id, ticket_id, sender_type, sender_id, sender_name, content, created_at)
      VALUES (?, ?, 'agent', ?, ?, ?, ?)
    `).bind(messageId, ticketId, user.id, staffName, content, now).run();

    // 4. Send email to customer via Gmail API
    const gmail = new GmailIntegration(c.env);
    
    await gmail.sendEmail({
      to: ticket.customer_email,
      subject: `Re: ${ticket.subject}`,
      body: content,
      threadId: ticket.gmail_thread_id,        // CRITICAL: Keeps email in same thread
      replyToMessageId: ticket.gmail_message_id // CRITICAL: Sets In-Reply-To header
    });

    console.log(`[Tickets] ✅ Email sent to ${ticket.customer_email} in thread ${ticket.gmail_thread_id}`);

    // 5. Update ticket
    await c.env.DB.prepare(`
      UPDATE tickets SET updated_at = ? WHERE ticket_id = ?
    `).bind(now, ticketId).run();

    return c.json({ 
      message: 'Reply sent', 
      messageId,
      emailSent: true,
      threadId: ticket.gmail_thread_id
    });
  } catch (error) {
    console.error('[Tickets] Reply error:', error);
    return c.json({ 
      error: 'Internal server error',
      details: error.message 
    }, 500);
  }
}
```

**Key Changes**:
1. ✅ Fetch ticket data (customer_email, gmail_thread_id, gmail_message_id, subject)
2. ✅ Initialize GmailIntegration service
3. ✅ Call `gmail.sendEmail()` with proper threading parameters
4. ✅ Pass `threadId` to keep email in same Gmail thread
5. ✅ Pass `replyToMessageId` to set `In-Reply-To` and `References` headers
6. ✅ Add logging for debugging
7. ✅ Return more detailed response

---

## 🧪 Testing Plan

### Phase 1: Manual Testing (30 minutes)

#### Test 1: Send First Reply
1. **Setup**:
   - Open dashboard: http://localhost:3001/tickets
   - Select a ticket (e.g., TKT-000014)
   - Open Response Area (Ctrl+R)

2. **Action**:
   - Type a reply: "Thank you for contacting us. We're looking into your order now."
   - Click "Send Reply"

3. **Expected Results**:
   - ✅ Success message appears
   - ✅ Reply appears in ticket conversation
   - ✅ Check Gmail: Email sent to customer
   - ✅ Email appears in same thread as original
   - ✅ Email has proper `In-Reply-To` header

4. **Verification**:
   ```powershell
   # Check database
   cd D:\coding\DARTMOUTH_OS_PROJECT\packages\worker
   npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT * FROM ticket_messages WHERE ticket_id = 'TKT-000014' ORDER BY created_at DESC LIMIT 5;"
   
   # Check Gmail
   # - Log into johnpaulhutchison@gmail.com
   # - Find the email thread
   # - Verify reply appears in thread
   ```

#### Test 2: Customer Replies Back
1. **Setup**:
   - Log into customer email (johnpaulhutchison@gmail.com)
   - Find the email thread
   - Reply to the staff message

2. **Action**:
   - Type: "Thank you! When will my order arrive?"
   - Send email

3. **Expected Results**:
   - ✅ Wait 5 minutes for cron job
   - ✅ New message appears in TKT-000014
   - ✅ Message is from customer
   - ✅ Ticket status updates to show new customer message

4. **Verification**:
   ```powershell
   # Check database
   npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT sender_type, sender_name, content, created_at FROM ticket_messages WHERE ticket_id = 'TKT-000014' ORDER BY created_at DESC LIMIT 5;"
   ```

#### Test 3: Multiple Back-and-Forth
1. **Action**:
   - Staff replies: "Your order will arrive in 2-3 business days."
   - Customer replies: "Perfect, thank you!"
   - Staff replies: "You're welcome! Let us know if you need anything else."

2. **Expected Results**:
   - ✅ All messages stay in same Gmail thread
   - ✅ All messages appear in same ticket (TKT-000014)
   - ✅ Conversation flows naturally
   - ✅ No duplicate tickets created

#### Test 4: Different Tickets Don't Mix
1. **Action**:
   - Reply to TKT-000014: "Message for ticket 14"
   - Reply to TKT-000016: "Message for ticket 16"

2. **Expected Results**:
   - ✅ Each reply goes to correct customer
   - ✅ Each reply stays in its own Gmail thread
   - ✅ No cross-contamination between tickets

---

### Phase 2: Edge Cases (15 minutes)

#### Test 5: Missing Thread ID
**Scenario**: What if a ticket has no `gmail_thread_id`?

**Test**:
1. Create a ticket manually in database without thread ID
2. Try to reply
3. Expected: Email sends but creates new thread (acceptable fallback)

#### Test 6: Invalid Customer Email
**Scenario**: What if customer email is invalid?

**Test**:
1. Update ticket with invalid email: "invalid@@@email"
2. Try to reply
3. Expected: Error message, reply saved to DB but email fails gracefully

#### Test 7: Gmail API Rate Limit
**Scenario**: What if we hit Gmail API rate limits?

**Test**:
1. Send 10 replies rapidly
2. Expected: Rate limiting kicks in, emails queue or fail gracefully

---

### Phase 3: Threading Verification (15 minutes)

#### Test 8: Email Headers
**Check that proper headers are set**:

1. Send a reply
2. In Gmail, click "Show original" on the reply email
3. Verify headers:
   ```
   In-Reply-To: <original-message-id>
   References: <original-message-id>
   ```

#### Test 9: Gmail Thread Grouping
**Verify Gmail groups emails correctly**:

1. Send 5 replies to same ticket
2. In Gmail inbox, verify all appear as single conversation
3. Count should show "6" (1 original + 5 replies)

---

## 📊 Success Criteria

### Must Have (Critical)
- [x] `replyToTicket` function sends actual emails
- [ ] Emails include `threadId` for Gmail threading
- [ ] Emails include `In-Reply-To` and `References` headers
- [ ] Customer replies come back to same ticket
- [ ] No duplicate tickets created from replies
- [ ] All messages stay in correct Gmail thread

### Should Have (Important)
- [ ] Error handling for failed email sends
- [ ] Logging for debugging
- [ ] Rate limiting respected
- [ ] Graceful fallback if threading fails

### Nice to Have (Optional)
- [ ] Email templates with formatting
- [ ] HTML email support
- [ ] Attachments support
- [ ] Read receipts

---

## 🔧 Implementation Steps

### Step 1: Update replyToTicket Function (15 min)
1. Add ticket data fetch
2. Add GmailIntegration initialization
3. Add sendEmail call with threading parameters
4. Add error handling
5. Update response format

### Step 2: Test Locally (30 min)
1. Deploy to Cloudflare Workers
2. Run Test 1-4 from Phase 1
3. Verify emails send correctly
4. Verify threading works

### Step 3: Fix Any Issues (30 min)
1. Debug any failures
2. Check logs for errors
3. Adjust code as needed

### Step 4: Document Results (15 min)
1. Update this document with test results
2. Add screenshots of working threads
3. Document any limitations found

---

## 🐛 Known Issues to Watch For

### Issue 1: Missing Gmail Credentials
**Symptom**: "Unauthorized" or "Invalid credentials" error
**Solution**: Verify Gmail OAuth tokens are valid in KV store

### Issue 2: Thread ID Not Found
**Symptom**: Emails send but create new threads
**Solution**: Verify `gmail_thread_id` is saved when ticket is created

### Issue 3: Message ID Format
**Symptom**: Threading doesn't work despite correct thread ID
**Solution**: Verify `gmail_message_id` format includes angle brackets: `<message-id@gmail.com>`

### Issue 4: Rate Limiting
**Symptom**: "Quota exceeded" error from Gmail API
**Solution**: Implement exponential backoff and retry logic

---

## 📝 Database Schema Verification

### Required Columns in `tickets` Table
```sql
CREATE TABLE tickets (
  ticket_id TEXT PRIMARY KEY,
  customer_email TEXT NOT NULL,
  subject TEXT,
  gmail_thread_id TEXT,      -- CRITICAL: Must be populated
  gmail_message_id TEXT,     -- CRITICAL: Must be populated
  status TEXT,
  priority TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Verify these columns exist**:
```powershell
cd D:\coding\DARTMOUTH_OS_PROJECT\packages\worker
npx wrangler d1 execute dartmouth-os-db --remote --command "PRAGMA table_info(tickets);"
```

---

## 🚀 Deployment Checklist

Before deploying the fix:
- [ ] Code updated in `tickets.ts`
- [ ] Import statement added: `import { GmailIntegration } from '../services/GmailIntegration'`
- [ ] Local testing passed
- [ ] Error handling added
- [ ] Logging added
- [ ] Documentation updated

After deploying:
- [ ] Run all Phase 1 tests
- [ ] Verify emails send
- [ ] Verify threading works
- [ ] Check logs for errors
- [ ] Update status document

---

## 📚 Related Files

### Files to Modify
1. `packages/worker/src/controllers/tickets.ts` - Add email sending
2. `packages/worker/src/services/GmailIntegration.ts` - Already has sendEmail (no changes needed)

### Files to Reference
1. `packages/worker/src/workers/email-poller.ts` - Example of GmailIntegration usage
2. `packages/worker/src/services/OmnichannelRouter.ts` - Example of sendEmail call

---

## ⏱️ Time Estimate

- **Code Changes**: 15 minutes
- **Testing**: 1 hour
- **Debugging**: 30 minutes
- **Documentation**: 15 minutes
- **Total**: ~2 hours

---

## 🎯 Priority

**CRITICAL** - This must be fixed before production launch. Without this:
- Staff replies never reach customers
- Customers think they're being ignored
- System appears broken
- No actual customer service happening

---

## ✅ Next Steps

1. **Immediate**: Update `replyToTicket` function with email sending
2. **Deploy**: Push changes to Cloudflare Workers
3. **Test**: Run Phase 1 tests (Test 1-4)
4. **Verify**: Check Gmail for threaded emails
5. **Document**: Update status with test results

---

**Status**: 🔴 CRITICAL BUG - NOT FIXED YET
**Assigned To**: Next developer session
**Est. Fix Time**: 2 hours
**Impact**: HIGH - Core functionality broken

---

**Last Updated**: November 29, 2025 - 11:45 PM
**Created By**: AI Assistant (Bug Discovery)
**Approved By**: Pending - John Hutchison

