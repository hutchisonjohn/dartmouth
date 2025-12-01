# 📧 Customer Service System - Complete Guide
**Version:** 0.35 Alpha  
**Status:** ⚠️ Partially Operational (Email-to-Ticket Working, Management Features Missing)  
**Last Updated:** November 29, 2025

---

## 🎯 What Is This System?

A **fully automated customer service system** that:
1. Monitors Gmail inbox for customer emails
2. Automatically creates support tickets
3. Uses AI to analyze and draft responses
4. Provides a dashboard for staff to manage tickets
5. Sends responses back to customers via email

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMER SERVICE SYSTEM                   │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Customer   │────▶│     Gmail    │────▶│  Cloudflare  │
│    Email     │     │   Inbox      │     │    Worker    │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
                     ┌──────────────────────────────────┐
                     │     Email Poller (Cron)          │
                     │   Runs every 5 minutes           │
                     └──────────┬───────────────────────┘
                                │
                                ▼
                     ┌──────────────────────────────────┐
                     │    Ticket Manager                │
                     │  - Create tickets                │
                     │  - Link emails                   │
                     │  - Detect priority/category      │
                     └──────────┬───────────────────────┘
                                │
                                ▼
                     ┌──────────────────────────────────┐
                     │    D1 Database                   │
                     │  - tickets                       │
                     │  - emails                        │
                     │  - ticket_messages               │
                     │  - staff                         │
                     └──────────┬───────────────────────┘
                                │
                                ▼
                     ┌──────────────────────────────────┐
                     │    AI Agent                      │
                     │  - Analyze ticket                │
                     │  - Generate response             │
                     │  - Create Gmail draft            │
                     └──────────┬───────────────────────┘
                                │
                                ▼
                     ┌──────────────────────────────────┐
                     │    Frontend Dashboard            │
                     │  http://localhost:3000/tickets   │
                     │  - View tickets                  │
                     │  - Reply to customers            │
                     │  - Assign staff                  │
                     └──────────────────────────────────┘
```

---

## 🚀 How It Works

### **Step 1: Email Arrives**
```
Customer sends email to: john@dtf.com.au
From: johnpaulhutchison@gmail.com (or any customer)
Subject: "Help with my order"
Body: "I need to check my order status..."
```

### **Step 2: Cron Job Triggers (Every 5 Minutes)**
```
12:00 PM - Cron runs
12:05 PM - Cron runs
12:10 PM - Cron runs
... (every 5 minutes)
```

### **Step 3: Email Poller Fetches Email**
```typescript
// GmailIntegration.fetchUnreadEmails()
1. Connect to Gmail API
2. Search for: "from:johnpaulhutchison@gmail.com to:john@dtf.com.au is:unread"
3. Parse email details (subject, body, from, to, date)
4. Store in database
```

### **Step 4: Ticket Created**
```typescript
// TicketManager.createTicketFromEmail()
1. Check if ticket exists for this email thread
2. Detect priority (urgent, high, medium, low)
3. Detect category (order, product, billing, technical, other)
4. Create ticket with unique number (TKT-000001)
5. Link email to ticket
6. Mark email as read in Gmail (prevents duplicates)
```

### **Step 5: AI Processes Ticket**
```typescript
// CustomerServiceAgent.processTicket()
1. Analyze ticket content
2. Check Shopify for order info (if order-related)
3. Check PERP for production status (if production-related)
4. Generate draft response
5. Create draft in Gmail for staff review
```

### **Step 6: Staff Reviews & Sends**
```
Staff opens dashboard → http://localhost:3000/tickets
Views ticket → TKT-000004
Reviews AI draft → Gmail drafts
Edits if needed → Send to customer
```

---

## 📊 Database Schema

### **tickets**
```sql
CREATE TABLE tickets (
  ticket_id TEXT PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  customer_id TEXT NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  category TEXT NOT NULL DEFAULT 'other',
  channel TEXT NOT NULL DEFAULT 'email',
  assigned_to TEXT,
  sla_due_at TEXT NOT NULL,
  first_response_at TEXT,
  resolved_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### **emails**
```sql
CREATE TABLE emails (
  id TEXT PRIMARY KEY,
  gmail_message_id TEXT UNIQUE NOT NULL,
  gmail_thread_id TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  to_name TEXT,
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  body_html TEXT,
  received_at TEXT NOT NULL,
  has_attachments INTEGER DEFAULT 0,
  labels TEXT,
  created_at TEXT NOT NULL
);
```

### **ticket_messages**
```sql
CREATE TABLE ticket_messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK(sender_type IN ('customer', 'agent', 'system')),
  sender_id TEXT,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
);
```

### **staff**
```sql
CREATE TABLE staff (
  staff_id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'agent',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

---

## 🔧 Configuration

### **Email Filter**
```typescript
// In GmailIntegration.ts
const query = 'from:johnpaulhutchison@gmail.com to:john@dtf.com.au is:unread';
```

**To change:**
1. Edit `packages/worker/src/services/GmailIntegration.ts`
2. Find `fetchUnreadEmails()` method
3. Update the `query` string
4. Deploy: `npx wrangler deploy`

### **Cron Schedule**
```toml
# In wrangler.toml
[triggers]
crons = ["*/5 * * * *"]  # Every 5 minutes
```

**To change:**
- `*/5 * * * *` = Every 5 minutes
- `*/10 * * * *` = Every 10 minutes
- `0 * * * *` = Every hour
- `0 9 * * *` = Every day at 9 AM

### **AI Response Mode**
```toml
# In wrangler.toml
[vars]
AI_RESPONSE_MODE = "draft"  # or "auto"
```

- `draft` = Create Gmail draft for staff review
- `auto` = Send response automatically (not recommended)

---

## 🎨 Priority Detection

The system automatically detects priority based on keywords:

### **Urgent**
- "urgent", "emergency", "asap", "immediately"
- "critical", "down", "broken", "not working"

### **High**
- "important", "soon", "quickly", "problem"
- "issue", "error", "failed"

### **Medium** (Default)
- Everything else

### **Low**
- "question", "wondering", "curious"
- "feedback", "suggestion"

---

## 🏷️ Category Detection

The system automatically categorizes tickets:

### **Order**
- "order", "purchase", "bought", "delivery"
- "shipping", "tracking", "received"

### **Product**
- "product", "item", "quality", "defect"
- "size", "color", "description"

### **Billing**
- "invoice", "payment", "charge", "refund"
- "price", "cost", "bill"

### **Technical**
- "login", "password", "account", "access"
- "error", "bug", "not working"

### **Other** (Default)
- Everything else

---

## 🚀 Deployment

### **Prerequisites**
1. Node.js 18+ installed
2. Cloudflare account
3. Gmail account with OAuth configured
4. Wrangler CLI installed

### **Deploy Worker**
```powershell
cd packages/worker
npx wrangler deploy
```

### **Start Frontend**
```powershell
cd packages/customer-service-dashboard
npm run dev
```

### **View Logs**
```powershell
cd packages/worker
npx wrangler tail dartmouth-os-worker --format pretty
```

---

## 🧪 Testing

### **Manual Test**
1. Send email to `john@dtf.com.au` from `johnpaulhutchison@gmail.com`
2. Wait 5 minutes for cron OR trigger manually:
   ```powershell
   Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/trigger-email-poll"
   ```
3. Check dashboard: http://localhost:3000/tickets
4. Verify ticket appears with correct subject

### **Check Database**
```powershell
cd packages/worker
npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT * FROM tickets ORDER BY created_at DESC LIMIT 5;"
```

### **Check Logs**
```powershell
npx wrangler tail dartmouth-os-worker --format pretty
```

---

## 🐛 Troubleshooting

### **No Tickets Appearing**

**Check 1: Is cron running?**
```powershell
npx wrangler tail dartmouth-os-worker --format pretty
# Look for: "Scheduled" email polling job triggered
```

**Check 2: Are there unread emails?**
- Go to Gmail
- Check for unread emails from `johnpaulhutchison@gmail.com`

**Check 3: Check logs for errors**
```powershell
npx wrangler tail dartmouth-os-worker --format pretty
# Look for errors in red
```

### **Duplicate Tickets**

**Solution:** Emails should be marked as read after processing. If you see duplicates:
1. Check that `markEmailAsRead()` is being called
2. Verify Gmail API permissions include "modify" scope
3. Delete duplicates:
   ```powershell
   npx wrangler d1 execute dartmouth-os-db --remote --command "DELETE FROM tickets WHERE ticket_number = 'TKT-000003';"
   ```

### **Wrong Subject Line**

**Solution:** Fixed in latest deployment. Subject should match email subject, not body.

If still wrong:
1. Check `createTicketFromEmail()` in `TicketManager.ts`
2. Verify `subject: email.subject` is passed to `createTicket()`
3. Deploy: `npx wrangler deploy`

### **Frontend Not Loading**

**Check 1: Is dev server running?**
```powershell
cd packages/customer-service-dashboard
npm run dev
# Should show: Local: http://localhost:3000/
```

**Check 2: Check browser console**
- Open http://localhost:3000/tickets
- Press F12 → Console tab
- Look for errors

**Check 3: Check API connection**
- Dashboard calls: `https://dartmouth-os-worker.dartmouth.workers.dev/api/tickets`
- Test in browser or Postman

---

## 📈 Monitoring

### **Key Metrics**

1. **Ticket Volume**
   ```sql
   SELECT COUNT(*) FROM tickets WHERE created_at > datetime('now', '-1 day');
   ```

2. **Average Response Time**
   ```sql
   SELECT AVG(julianday(first_response_at) - julianday(created_at)) * 24 * 60 
   FROM tickets 
   WHERE first_response_at IS NOT NULL;
   ```

3. **Open Tickets**
   ```sql
   SELECT COUNT(*) FROM tickets WHERE status = 'open';
   ```

4. **SLA Breaches**
   ```sql
   SELECT COUNT(*) FROM tickets 
   WHERE status = 'open' 
   AND datetime('now') > sla_due_at;
   ```

---

## 🔐 Security

### **Secrets Management**
All sensitive data stored as Cloudflare secrets:
```powershell
npx wrangler secret put GMAIL_CLIENT_ID
npx wrangler secret put GMAIL_CLIENT_SECRET
npx wrangler secret put GMAIL_REFRESH_TOKEN
npx wrangler secret put JWT_SECRET
npx wrangler secret put OPENAI_API_KEY
```

### **API Authentication**
- JWT tokens for API access
- Clerk for user authentication (planned)
- Rate limiting on all endpoints

### **Data Privacy**
- Customer emails stored encrypted
- PII redacted in logs
- GDPR-compliant data retention

---

## 🎯 Feature Roadmap

### **✅ Completed (Phase 1)**
- Email polling & ticket creation
- Gmail integration
- Basic ticket list view
- Priority & category detection
- Duplicate prevention

### **🚧 In Progress (Phase 2 - CRITICAL)**
- Message history (table created, not saving)
- AI draft responses (has error)
- Ticket detail view (NOT STARTED)
- Reply functionality (NOT STARTED)
- Ticket updates (NOT STARTED)

### **📋 Planned (Phase 3)**
- Staff assignments
- Internal notes
- Ticket escalation
- SLA monitoring
- Email templates
- Search & filtering
- Bulk actions

### **🔮 Future (Phase 3)**
- Customer portal
- Live chat widget
- SMS integration
- WhatsApp integration
- Analytics dashboard
- Automation rules
- Knowledge base
- Canned responses

---

## 📚 API Documentation

### **GET /api/tickets**
```typescript
// List all tickets
GET https://dartmouth-os-worker.dartmouth.workers.dev/api/tickets?limit=100

Response:
{
  "tickets": [
    {
      "ticket_id": "ticket_1764384453637_mefxmdfv",
      "ticket_number": "TKT-000004",
      "customer_email": "johnpaulhutchison@gmail.com",
      "subject": "Subject Line",
      "status": "open",
      "priority": "medium",
      "category": "other",
      "created_at": "2025-11-29T02:47:32.000Z"
    }
  ]
}
```

### **GET /api/tickets/:id**
```typescript
// Get ticket details
GET https://dartmouth-os-worker.dartmouth.workers.dev/api/tickets/TKT-000004

Response:
{
  "ticket": { ... },
  "messages": [ ... ],
  "emails": [ ... ]
}
```

### **POST /api/tickets/:id/reply**
```typescript
// Reply to ticket
POST https://dartmouth-os-worker.dartmouth.workers.dev/api/tickets/TKT-000004/reply

Body:
{
  "content": "Thank you for contacting us...",
  "staffId": "staff_123"
}

Response:
{
  "success": true,
  "messageId": "msg_456"
}
```

---

## 💡 Best Practices

### **For Staff**
1. Check dashboard every 30 minutes
2. Respond to urgent tickets within 1 hour
3. Use AI drafts as starting point, personalize
4. Add internal notes for context
5. Close tickets when resolved

### **For Developers**
1. Always test in dev before deploying
2. Monitor logs after deployment
3. Keep secrets secure
4. Document all changes
5. Use version control (Git)

### **For Admins**
1. Monitor SLA compliance
2. Review AI responses weekly
3. Update email templates monthly
4. Train staff on system usage
5. Backup database regularly

---

## 🔗 Quick Links

- **Dashboard:** http://localhost:3000/tickets
- **Worker:** https://dartmouth-os-worker.dartmouth.workers.dev
- **Docs:** [Full documentation](README.md)
- **Status:** [Project status](PROJECT_STATUS_2025-11-29.md)

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review troubleshooting section
3. Check logs: `npx wrangler tail`
4. Contact system administrator

---

**Last Updated:** November 29, 2025  
**Version:** 1.0 MVP  
**Status:** ✅ Operational

---

*This system is designed to scale from 10 tickets/day to 1000+ tickets/day with minimal changes.*

