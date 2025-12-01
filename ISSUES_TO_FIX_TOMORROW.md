# 🚨 Issues to Fix Tomorrow - Quick Reference
**Date**: November 30, 2025
**Total Issues**: 5
**Estimated Time**: 4.5 hours + 1 hour testing = 5.5 hours

---

## 📋 PRIORITY ORDER

### 1. Email Replies Not Sending 🔴 BLOCKER
- **Time**: 2 hours
- **Priority**: CRITICAL
- **File**: `packages/worker/src/controllers/tickets.ts`
- **Guide**: EMAIL_THREADING_TEST_PLAN.md
- **Impact**: Customers don't receive replies - BLOCKS PRODUCTION

### 2. Escalated Ticket Counts Wrong 🟡
- **Time**: 30 minutes
- **Priority**: HIGH
- **Files**: DashboardLayout.tsx, TicketsPage.tsx, Sidebar.tsx
- **Problem**: Escalated tickets showing in My Tickets (3), Sam (1), Ted (1) - all wrong
- **Fix**: Exclude `status = 'escalated'` from My Tickets, Open, Staff queues

### 3. Staff Notes Display Broken 🟡
- **Time**: 30 minutes
- **Priority**: HIGH
- **File**: TicketDetailPage.tsx (lines 788-825)
- **Problem**: Existing notes not visible, textarea takes all space
- **Fix**: Separate scrollable history (60%) from fixed input (40%)

### 4. Escalation Not Creating Staff Notes 🟡
- **Time**: 1 hour
- **Priority**: HIGH
- **Files**: TicketDetailPage.tsx, tickets.ts
- **Problem**: Escalating creates @mention but no staff note in ticket
- **Fix**: Add staff note: "🚨 Escalated to [Names]: [Reason]"

### 5. AI Agent Not a Staff Member 🤖
- **Time**: 35 minutes
- **Priority**: MEDIUM
- **File**: AI_AGENT_STAFF_MEMBER.md (complete guide)
- **Problem**: AI processes tickets but can't be assigned
- **Fix**: Add AI Agent (UUID: ...0004) to database and all UI lists

---

## 🎯 QUICK FIX CHECKLIST

### Issue 1: Email Sending (2 hours)
```typescript
// In packages/worker/src/controllers/tickets.ts
export async function replyToTicket(c: Context<{ Bindings: Env }>) {
  // 1. Get ticket data
  const ticket = await c.env.DB.prepare(`
    SELECT customer_email, gmail_thread_id, gmail_message_id, subject
    FROM tickets WHERE ticket_id = ?
  `).bind(ticketId).first();
  
  // 2. Send email via Gmail
  const gmail = new GmailIntegration(c.env);
  await gmail.sendEmail({
    to: ticket.customer_email,
    subject: `Re: ${ticket.subject}`,
    body: content,
    threadId: ticket.gmail_thread_id,
    replyToMessageId: ticket.gmail_message_id
  });
}
```

### Issue 2: Escalated Counts (30 min)
```typescript
// In DashboardLayout.tsx - Add to all filters:
t.status !== 'escalated'

// Example:
myTickets: tickets.filter((t: any) => 
  t.assigned_to === user?.id &&
  t.status !== 'resolved' &&
  t.status !== 'closed' &&
  t.status !== 'escalated'  // ADD THIS
).length,
```

### Issue 3: Staff Notes Display (30 min)
```typescript
// In TicketDetailPage.tsx
{showInternalNotes && (
  <div className="flex flex-col" style={{ height: `${staffNotesHeight}px` }}>
    {/* History - Scrollable, max 60% */}
    <div className="overflow-y-auto" style={{ maxHeight: '60%' }}>
      {notes.map(...)}
    </div>
    
    {/* Input - Fixed, 40% */}
    <div className="flex-1 border-t">
      <textarea ... />
    </div>
  </div>
)}
```

### Issue 4: Escalation Notes (1 hour)
```typescript
// In TicketDetailPage.tsx handleEscalate
await ticketsApi.addNote(ticket.ticket_id, 
  `🚨 Escalated to ${selectedStaff.map(s => s.name).join(', ')}: ${reason}`
);
```

### Issue 5: AI Agent (35 min)
```sql
-- Database
INSERT INTO staff_users VALUES (
  '00000000-0000-0000-0000-000000000004',
  'ai-agent@dtf.com.au', 'N/A', 'AI', 'Agent', 'agent', 1, ...
);
```
```typescript
// Add to all staff lists
{ id: '...0004', name: 'AI Agent', role: 'AI', online: true }
```

---

## 📊 CURRENT COUNTS (WRONG)

### What You're Seeing (INCORRECT):
- My Tickets: 3 (includes escalated - WRONG)
- Sam Johnson: 1 (includes escalated - WRONG)
- Ted Smith: 1 (includes escalated - WRONG)
- Open: 3 (includes escalated - WRONG)

### What It Should Be (CORRECT):
- My Tickets: 1 (exclude escalated)
- Sam Johnson: 1 (exclude escalated)
- Ted Smith: 1 (exclude escalated)
- Open: 5 (exclude escalated)
- Escalated: 2 (separate count)

---

## ✅ SUCCESS CRITERIA

### Email Sending
- [ ] Reply sent from dashboard
- [ ] Email received by customer
- [ ] Email in correct Gmail thread
- [ ] Customer can reply back
- [ ] Reply appears in ticket

### Escalated Counts
- [ ] My Tickets count correct
- [ ] Sam/Ted counts correct
- [ ] Open count correct
- [ ] Escalated has own count

### Staff Notes
- [ ] Existing notes visible
- [ ] Notes scroll independently
- [ ] Textarea stays at bottom
- [ ] New notes appear

### Escalation Notes
- [ ] Escalating creates staff note
- [ ] Note includes @mentions
- [ ] Note shows in ticket

### AI Agent
- [ ] AI in database
- [ ] AI in all staff lists
- [ ] AI in sidebar
- [ ] Can assign to AI

---

## ⏱️ TIME BREAKDOWN

| Issue | Time | Priority |
|-------|------|----------|
| 1. Email Sending | 2:00 | CRITICAL |
| 2. Escalated Counts | 0:30 | HIGH |
| 3. Staff Notes | 0:30 | HIGH |
| 4. Escalation Notes | 1:00 | HIGH |
| 5. AI Agent | 0:35 | MEDIUM |
| **TOTAL FIXES** | **4:35** | |
| Testing | 1:00 | |
| Deploy | 0:30 | |
| **GRAND TOTAL** | **6:05** | |

---

## 🚀 AFTER FIXES

Once all 5 issues fixed:
- ✅ System is production-ready
- ✅ Email threading works
- ✅ Counts are accurate
- ✅ Staff notes work
- ✅ Escalation complete
- ✅ AI Agent integrated
- ✅ **READY FOR MVP LAUNCH!** 🎉

---

**Status**: 📋 DOCUMENTED - Ready for tomorrow
**Files Updated**: START_TOMORROW_SESSION.md, FINAL_SESSION_SUMMARY.md
**Next**: Fix issues, test, deploy, launch!

---

**Created**: November 30, 2025 - 12:10 AM
**For**: Morning session
**Goal**: MVP Launch by end of day! 🚀

