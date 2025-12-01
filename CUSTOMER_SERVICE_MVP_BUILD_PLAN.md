# 🚀 CUSTOMER SERVICE SYSTEM - MVP BUILD PLAN

**Version:** 3.0 (Architecture-Aligned)  
**Date:** November 28, 2025  
**Status:** Ready to Build  
**Timeline:** 4 weeks

---

## 🏗️ **ARCHITECTURE NOTE**

**The Customer Service System is an APPLICATION built ON TOP OF Dartmouth OS.**

### **What This Means:**
- ✅ **Dartmouth OS** provides the foundation (BaseAgent, Memory, RAG, Shopify, PERP, Tickets, Auth, etc.)
- ✅ **Customer Service System** adds CS-specific features (Gmail, CS Agent, CS Dashboard)
- ✅ We're building a **thin layer** that leverages DOS services

### **What's Already Built (Dartmouth OS):**
- ✅ BaseAgent framework
- ✅ ShopifyIntegration (shared by Sales, CS, Product agents)
- ✅ PERPIntegration (shared by CS, Production, Artwork agents)
- ✅ TicketManager (shared by all agents)
- ✅ AuthenticationService (shared by all dashboards)
- ✅ InternalCommunicationSystem (shared by all staff)
- ✅ AgentHandoffProtocol (shared by all agents)
- ✅ AnalyticsService (shared by all agents)

### **What We're Building (CS-Specific):**
- 🔴 GmailIntegration (only CS uses email)
- 🔴 CustomerServiceAgent (extends BaseAgent)
- 🔴 CS Handlers (OrderStatus, Production, Invoice, General)
- 🔴 SnoozeManager (only CS snoozes tickets)
- 🔴 MentionManager (only CS uses ticket mentions)
- 🔴 CS Dashboard (React app for CS staff)

**See:** `DARTMOUTH_OS_ARCHITECTURE_2025-11-28.md` for full architecture details.

---

## 📋 **WHAT WE'RE BUILDING (Based on Demo)**

### **Core Features from Demo:**

1. ✅ **Gmail Integration** - Email inbox → Tickets
2. ✅ **Ticketing System** - Full lifecycle management
3. ✅ **AI Customer Service Agent** - Auto-respond or draft
4. ✅ **Snooze Tickets** - 3hr, tomorrow, Friday, Monday, custom date/time
5. ✅ **Staff @Mentions** - Tag team members with threaded replies
6. ✅ **Internal Notes** - Staff-only notes per ticket (yellow background)
7. ✅ **Staff Group Chat** - Slack-like channels for team communication
8. ✅ **Staff Dashboard** - Built on Tailwind UI template
9. ✅ **Admin Settings** - Toggle AI auto-reply vs draft-for-approval

### **From Your Demo Code Analysis:**

**Snooze Feature:**
- 3 hours
- Tomorrow 9 AM
- Friday 9 AM
- Monday 9 AM
- Custom date/time picker
- Status: `snoozed` (separate from `in-progress`)

**@Mentions Feature:**
- Staff can @mention other staff in notes
- Creates notification for mentioned staff
- Threaded conversations per mention
- Inbox view for mentions
- Priority levels (high, normal, critical)
- Types: ticket, order, project

**Internal Notes:**
- Yellow background (bg-yellow-50)
- Staff-only (not visible to customers)
- Per-ticket
- Editable
- Timestamped
- Shows staff name

**Ticket Statuses:**
- `pending` / `open`
- `in-progress`
- `snoozed` (NEW - separate status)
- `waiting_on_customer`
- `waiting_on_internal`
- `resolved`
- `closed`
- `escalated`

---

## 🗄️ **DATABASE SCHEMA UPDATES**

### **1. Add to `tickets` table:**

```sql
-- Add snooze fields
ALTER TABLE tickets ADD COLUMN is_snoozed BOOLEAN DEFAULT FALSE;
ALTER TABLE tickets ADD COLUMN snoozed_until TEXT; -- ISO datetime
ALTER TABLE tickets ADD COLUMN snoozed_by TEXT; -- staff_users.id
ALTER TABLE tickets ADD COLUMN snooze_reason TEXT;
```

### **2. Create `staff_mentions` table:**

```sql
CREATE TABLE staff_mentions (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  from_staff_id TEXT NOT NULL,
  to_staff_id TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT CHECK(priority IN ('normal', 'high', 'critical')) DEFAULT 'normal',
  type TEXT CHECK(type IN ('ticket', 'order', 'project')) DEFAULT 'ticket',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TEXT NOT NULL,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (from_staff_id) REFERENCES staff_users(id),
  FOREIGN KEY (to_staff_id) REFERENCES staff_users(id)
);

CREATE INDEX idx_staff_mentions_to ON staff_mentions(to_staff_id);
CREATE INDEX idx_staff_mentions_ticket ON staff_mentions(ticket_id);
CREATE INDEX idx_staff_mentions_is_read ON staff_mentions(is_read);
```

### **3. Create `mention_threads` table:**

```sql
CREATE TABLE mention_threads (
  id TEXT PRIMARY KEY,
  mention_id TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (mention_id) REFERENCES staff_mentions(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES staff_users(id)
);

CREATE INDEX idx_mention_threads_mention ON mention_threads(mention_id);
```

### **4. Create `emails` table:**

```sql
CREATE TABLE emails (
  id TEXT PRIMARY KEY,
  gmail_message_id TEXT UNIQUE NOT NULL,
  gmail_thread_id TEXT NOT NULL,
  ticket_id TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  body_html TEXT,
  is_inbound BOOLEAN DEFAULT TRUE,
  is_read BOOLEAN DEFAULT FALSE,
  has_attachments BOOLEAN DEFAULT FALSE,
  attachments TEXT, -- JSON
  received_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);

CREATE INDEX idx_emails_gmail_thread ON emails(gmail_thread_id);
CREATE INDEX idx_emails_ticket ON emails(ticket_id);
CREATE INDEX idx_emails_from ON emails(from_email);
CREATE INDEX idx_emails_received_at ON emails(received_at);
```

### **5. Create `system_settings` table:**

```sql
CREATE TABLE system_settings (
  id TEXT PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type TEXT CHECK(setting_type IN ('string', 'boolean', 'number', 'json')) DEFAULT 'string',
  description TEXT,
  updated_by TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (updated_by) REFERENCES staff_users(id)
);

-- Seed AI mode setting
INSERT INTO system_settings (id, setting_key, setting_value, setting_type, description, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ai_response_mode',
  'draft',
  'string',
  'AI response mode: "auto" (send immediately) or "draft" (save for staff approval)',
  datetime('now')
);
```

### **6. Create Staff Group Chat Tables (Internal Communication System):**

```sql
-- Channels (Group Chats)
CREATE TABLE channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK(type IN ('public', 'private', 'direct')) NOT NULL,
  created_by TEXT NOT NULL,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (created_by) REFERENCES staff_users(id)
);

CREATE INDEX idx_channels_type ON channels(type);
CREATE INDEX idx_channels_is_archived ON channels(is_archived);

-- Channel Members
CREATE TABLE channel_members (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  role TEXT CHECK(role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  joined_at TEXT NOT NULL,
  last_read_at TEXT,
  FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES staff_users(id) ON DELETE CASCADE,
  UNIQUE(channel_id, staff_id)
);

CREATE INDEX idx_channel_members_channel ON channel_members(channel_id);
CREATE INDEX idx_channel_members_staff ON channel_members(staff_id);

-- Channel Messages
CREATE TABLE channel_messages (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  message TEXT NOT NULL,
  parent_message_id TEXT, -- For threads
  has_mentions BOOLEAN DEFAULT FALSE,
  mentioned_staff TEXT, -- JSON array of staff IDs
  has_attachments BOOLEAN DEFAULT FALSE,
  attachments TEXT, -- JSON
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES staff_users(id),
  FOREIGN KEY (parent_message_id) REFERENCES channel_messages(id) ON DELETE CASCADE
);

CREATE INDEX idx_channel_messages_channel ON channel_messages(channel_id);
CREATE INDEX idx_channel_messages_staff ON channel_messages(staff_id);
CREATE INDEX idx_channel_messages_parent ON channel_messages(parent_message_id);
CREATE INDEX idx_channel_messages_created_at ON channel_messages(created_at);

-- Channel Notifications
CREATE TABLE channel_notifications (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  type TEXT CHECK(type IN ('mention', 'reply', 'new_message')) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TEXT NOT NULL,
  FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES staff_users(id) ON DELETE CASCADE,
  FOREIGN KEY (message_id) REFERENCES channel_messages(id) ON DELETE CASCADE
);

CREATE INDEX idx_channel_notifications_staff ON channel_notifications(staff_id);
CREATE INDEX idx_channel_notifications_is_read ON channel_notifications(is_read);

-- Seed Default Channels
INSERT INTO channels (id, name, description, type, created_by, created_at, updated_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'General',
    'General discussion for all staff',
    'public',
    '00000000-0000-0000-0000-000000000001',
    datetime('now'),
    datetime('now')
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Customer Service',
    'Customer service team discussions',
    'public',
    '00000000-0000-0000-0000-000000000001',
    datetime('now'),
    datetime('now')
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Managers',
    'Private channel for managers and admins',
    'private',
    '00000000-0000-0000-0000-000000000001',
    datetime('now'),
    datetime('now')
  );

-- Add all staff to General channel
INSERT INTO channel_members (id, channel_id, staff_id, role, joined_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'owner',
    datetime('now')
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'member',
    datetime('now')
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    'member',
    datetime('now')
  );

-- Add all staff to Customer Service channel
INSERT INTO channel_members (id, channel_id, staff_id, role, joined_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'admin',
    datetime('now')
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'member',
    datetime('now')
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    'member',
    datetime('now')
  );

-- Add only John to Managers channel
INSERT INTO channel_members (id, channel_id, staff_id, role, joined_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'owner',
    datetime('now')
  );
```

### **6. Seed 3 Staff Users:**

```sql
-- Admin: John
INSERT INTO staff_users (
  id, email, password_hash, first_name, last_name, role, 
  is_active, is_available, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'john@dtf.com.au',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEiW4u', -- 'changeme123'
  'John',
  'Hutchison',
  'admin',
  TRUE,
  TRUE,
  datetime('now'),
  datetime('now')
);

-- Agent: Ted
INSERT INTO staff_users (
  id, email, password_hash, first_name, last_name, role,
  is_active, is_available, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'john+ted@dtf.com.au',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEiW4u', -- 'changeme123'
  'Ted',
  'Smith',
  'agent',
  TRUE,
  TRUE,
  datetime('now'),
  datetime('now')
);

-- Agent: Sam
INSERT INTO staff_users (
  id, email, password_hash, first_name, last_name, role,
  is_active, is_available, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  'john+sam@dtf.com.au',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEiW4u', -- 'changeme123'
  'Sam',
  'Johnson',
  'agent',
  TRUE,
  TRUE,
  datetime('now'),
  datetime('now')
);
```

---

## 🏗️ **BUILD PHASES**

### **WEEK 1: Backend Core (40 hours)**

#### **Day 1-2: Gmail Integration (16 hours)**

**Service:** `packages/worker/src/services/GmailIntegration.ts`

```typescript
export class GmailIntegration {
  private oauth2Client: OAuth2Client;
  private gmail: gmail_v1.Gmail;
  private db: D1Database;

  constructor(db: D1Database, credentials: GmailCredentials) {
    this.db = db;
    this.oauth2Client = new google.auth.OAuth2(
      credentials.clientId,
      credentials.clientSecret,
      credentials.redirectUri
    );
    this.oauth2Client.setCredentials({
      refresh_token: credentials.refreshToken
    });
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async fetchInbox(maxResults = 50): Promise<Email[]> {
    // 1. List messages
    const response = await this.gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: 'is:unread' // Only unread emails
    });

    // 2. Fetch full message details
    const emails: Email[] = [];
    for (const message of response.data.messages || []) {
      const email = await this.getEmailDetails(message.id!);
      emails.push(email);
    }

    return emails;
  }

  async getEmailDetails(messageId: string): Promise<Email> {
    const response = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    });

    // Parse headers
    const headers = response.data.payload?.headers || [];
    const from = headers.find(h => h.name === 'From')?.value || '';
    const to = headers.find(h => h.name === 'To')?.value || '';
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const date = headers.find(h => h.name === 'Date')?.value || '';

    // Parse body
    const body = this.parseEmailBody(response.data.payload);

    return {
      id: crypto.randomUUID(),
      gmailMessageId: messageId,
      gmailThreadId: response.data.threadId!,
      from: this.parseEmailAddress(from),
      to: this.parseEmailAddress(to),
      subject,
      bodyText: body.text,
      bodyHtml: body.html,
      receivedAt: new Date(date).toISOString(),
      hasAttachments: (response.data.payload?.parts?.length || 0) > 1,
      attachments: this.parseAttachments(response.data.payload)
    };
  }

  async sendEmail(to: string, subject: string, body: string, threadId?: string): Promise<void> {
    const email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      threadId ? `In-Reply-To: ${threadId}` : '',
      threadId ? `References: ${threadId}` : '',
      '',
      body
    ].filter(Boolean).join('\n');

    const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
        threadId
      }
    });
  }

  async createDraft(to: string, subject: string, body: string, threadId?: string): Promise<Draft> {
    const email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      threadId ? `In-Reply-To: ${threadId}` : '',
      threadId ? `References: ${threadId}` : '',
      '',
      body
    ].filter(Boolean).join('\n');

    const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    const response = await this.gmail.users.drafts.create({
      userId: 'me',
      requestBody: {
        message: {
          raw: encodedEmail,
          threadId
        }
      }
    });

    return {
      id: response.data.id!,
      to,
      subject,
      body,
      threadId
    };
  }

  async storeEmailInDatabase(email: Email): Promise<void> {
    await this.db.prepare(`
      INSERT INTO emails (
        id, gmail_message_id, gmail_thread_id, from_email, from_name,
        to_email, subject, body_text, body_html, is_inbound, is_read,
        has_attachments, attachments, received_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      email.id,
      email.gmailMessageId,
      email.gmailThreadId,
      email.from.email,
      email.from.name,
      email.to.email,
      email.subject,
      email.bodyText,
      email.bodyHtml,
      true,
      false,
      email.hasAttachments,
      JSON.stringify(email.attachments),
      email.receivedAt,
      new Date().toISOString()
    ).run();
  }

  private parseEmailBody(payload: any): { text: string; html: string | null } {
    // Implementation to extract text and HTML from Gmail payload
    // ...
  }

  private parseEmailAddress(address: string): { email: string; name: string | null } {
    // Parse "John Doe <john@example.com>" format
    const match = address.match(/(.+?)\s*<(.+?)>/);
    if (match) {
      return { name: match[1].trim(), email: match[2].trim() };
    }
    return { name: null, email: address.trim() };
  }

  private parseAttachments(payload: any): Attachment[] {
    // Implementation to extract attachments
    // ...
  }
}
```

**Tasks:**
- [ ] Set up Google Cloud Project
- [ ] Enable Gmail API
- [ ] Create OAuth 2.0 credentials
- [ ] Implement OAuth flow
- [ ] Implement email fetching
- [ ] Implement email sending
- [ ] Implement draft creation
- [ ] Store emails in D1
- [ ] Test with real Gmail account

---

#### **Day 3: Email-to-Ticket Creation (8 hours)**

**Update:** `packages/worker/src/services/TicketManager.ts`

```typescript
async createTicketFromEmail(email: Email): Promise<Ticket> {
  // 1. Check if ticket already exists for this thread
  const existingTicket = await this.findTicketByEmailThread(email.gmailThreadId);
  
  if (existingTicket) {
    // Add email to existing ticket
    await this.addEmailToTicket(existingTicket.id, email);
    return existingTicket;
  }

  // 2. Detect customer (by email)
  let customer = await this.getCustomerByEmail(email.from.email);
  if (!customer) {
    customer = await this.createCustomerFromEmail(email);
  }

  // 3. Auto-detect priority
  const priority = this.detectPriority(email);

  // 4. Auto-categorize
  const category = this.detectCategory(email);

  // 5. Create ticket
  const ticketNumber = await this.generateTicketNumber();
  const ticketId = crypto.randomUUID();

  await this.db.prepare(`
    INSERT INTO tickets (
      id, ticket_number, conversation_id, customer_id, customer_email,
      customer_name, channel, status, priority, category, sentiment,
      is_vip, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    ticketId,
    ticketNumber,
    email.gmailThreadId, // Use Gmail thread ID as conversation ID
    customer.id,
    email.from.email,
    email.from.name,
    'email',
    'open',
    priority,
    category,
    this.detectSentiment(email),
    customer.is_vip,
    new Date().toISOString(),
    new Date().toISOString()
  ).run();

  // 6. Link email to ticket
  await this.db.prepare(`
    UPDATE emails SET ticket_id = ? WHERE id = ?
  `).bind(ticketId, email.id).run();

  return this.getTicket(ticketId);
}

private detectPriority(email: Email): TicketPriority {
  const subject = email.subject.toLowerCase();
  const body = email.bodyText.toLowerCase();
  const text = `${subject} ${body}`;

  // Critical keywords
  if (
    text.includes('urgent') ||
    text.includes('asap') ||
    text.includes('emergency') ||
    text.includes('immediately') ||
    text.includes('critical')
  ) {
    return 'critical';
  }

  // High priority keywords
  if (
    text.includes('important') ||
    text.includes('priority') ||
    text.includes('soon') ||
    text.includes('quickly')
  ) {
    return 'high';
  }

  // Low priority keywords
  if (
    text.includes('when you can') ||
    text.includes('no rush') ||
    text.includes('whenever')
  ) {
    return 'low';
  }

  return 'normal';
}

private detectCategory(email: Email): TicketCategory {
  const subject = email.subject.toLowerCase();
  const body = email.bodyText.toLowerCase();
  const text = `${subject} ${body}`;

  if (text.match(/order\s*#?\d+|perp-\d+|where.*order|track.*order/)) {
    return 'order_status';
  }

  if (text.match(/quote|pricing|how much|cost|price/)) {
    return 'quote_request';
  }

  if (text.match(/production|printing|artwork|design|proof/)) {
    return 'production_status';
  }

  if (text.match(/invoice|receipt|payment/)) {
    return 'invoice_request';
  }

  if (text.match(/shipping|delivery|tracking/)) {
    return 'shipping_issue';
  }

  if (text.match(/refund|return|cancel/)) {
    return 'refund_request';
  }

  if (text.match(/quality|defect|damage|wrong/)) {
    return 'quality_complaint';
  }

  return 'general_inquiry';
}

private detectSentiment(email: Email): Sentiment {
  const text = `${email.subject} ${email.bodyText}`.toLowerCase();

  // Angry sentiment
  const angryKeywords = [
    'unacceptable', 'terrible', 'worst', 'horrible', 'angry', 'furious',
    'ridiculous', 'disgusting', 'pathetic', 'incompetent', 'useless'
  ];
  if (angryKeywords.some(kw => text.includes(kw)) || text.includes('!!!')) {
    return 'angry';
  }

  // Negative sentiment
  const negativeKeywords = [
    'disappointed', 'unhappy', 'frustrated', 'problem', 'issue',
    'concern', 'complaint', 'not happy', 'not satisfied'
  ];
  if (negativeKeywords.some(kw => text.includes(kw))) {
    return 'negative';
  }

  // Positive sentiment
  const positiveKeywords = [
    'thank', 'great', 'excellent', 'perfect', 'love', 'happy',
    'satisfied', 'appreciate', 'wonderful', 'amazing'
  ];
  if (positiveKeywords.some(kw => text.includes(kw))) {
    return 'positive';
  }

  return 'neutral';
}
```

**Tasks:**
- [ ] Implement `createTicketFromEmail()`
- [ ] Implement priority detection
- [ ] Implement category detection
- [ ] Implement sentiment detection
- [ ] Test with various email types

---

#### **Day 4: Customer Service AI Agent (8 hours)**

**Create:** `packages/customer-service-agent/src/CustomerServiceAgent.ts`

```typescript
export class CustomerServiceAgent extends BaseAgent {
  private ticketManager: TicketManager;
  private settingsManager: SettingsManager;

  handlers = [
    new OrderStatusHandler(),
    new ProductionStatusHandler(),
    new InvoiceHandler(),
    new GeneralInquiryHandler()
  ];

  async processTicket(ticket: Ticket): Promise<void> {
    // 1. Load conversation history
    const messages = await this.ticketManager.getTicketMessages(ticket.id);

    // 2. Get AI response mode setting
    const aiMode = await this.settingsManager.getSetting('ai_response_mode');

    // 3. Generate AI response
    const response = await this.generateResponse(ticket, messages);

    // 4. Check if should escalate
    if (this.shouldEscalate(response, ticket)) {
      await this.escalateTicket(ticket, response.escalationReason);
      return;
    }

    // 5. Either send or save as draft
    if (aiMode === 'auto') {
      await this.sendResponse(ticket, response);
    } else {
      await this.saveDraft(ticket, response);
    }
  }

  private async generateResponse(ticket: Ticket, messages: Message[]): Promise<AIResponse> {
    // Use Dartmouth foundation to generate response
    const context = {
      ticketId: ticket.id,
      customerEmail: ticket.customer_email,
      category: ticket.category,
      priority: ticket.priority,
      sentiment: ticket.sentiment
    };

    const response = await super.processMessage(
      messages[messages.length - 1].content,
      ticket.conversation_id,
      context
    );

    return {
      content: response.content,
      confidence: response.confidence,
      intent: response.intent,
      shouldEscalate: response.confidence < 0.6,
      escalationReason: response.confidence < 0.6 ? 'low_confidence' : undefined
    };
  }

  private shouldEscalate(response: AIResponse, ticket: Ticket): boolean {
    // 1. Low confidence
    if (response.confidence < 0.6) return true;

    // 2. Angry customer
    if (ticket.sentiment === 'angry') return true;

    // 3. VIP customer with high priority
    if (ticket.is_vip && ticket.priority === 'critical') return true;

    // 4. Refund request
    if (ticket.category === 'refund_request') return true;

    return false;
  }

  private async sendResponse(ticket: Ticket, response: AIResponse): Promise<void> {
    // Send email via Gmail
    const email = await this.ticketManager.getTicketEmail(ticket.id);
    await this.gmailIntegration.sendEmail(
      ticket.customer_email,
      `Re: ${email.subject}`,
      response.content,
      email.gmailThreadId
    );

    // Add message to ticket
    await this.ticketManager.addMessage(ticket.id, {
      senderType: 'ai',
      content: response.content,
      aiConfidence: response.confidence,
      aiIntent: response.intent
    });
  }

  private async saveDraft(ticket: Ticket, response: AIResponse): Promise<void> {
    // Create draft in Gmail
    const email = await this.ticketManager.getTicketEmail(ticket.id);
    await this.gmailIntegration.createDraft(
      ticket.customer_email,
      `Re: ${email.subject}`,
      response.content,
      email.gmailThreadId
    );

    // Add internal note
    await this.ticketManager.addInternalNote(ticket.id, {
      content: `AI generated draft response (confidence: ${(response.confidence * 100).toFixed(0)}%)`,
      noteType: 'general'
    });
  }
}
```

**Tasks:**
- [ ] Create CustomerServiceAgent class
- [ ] Create 4 basic handlers
- [ ] Implement response generation
- [ ] Implement escalation logic
- [ ] Implement auto-send vs draft logic
- [ ] Test with sample tickets

---

#### **Day 5: Snooze & Mentions (8 hours)**

**Add to TicketManager:**

```typescript
async snoozeTicket(
  ticketId: string,
  snoozedUntil: string,
  snoozedBy: string,
  reason?: string
): Promise<void> {
  await this.db.prepare(`
    UPDATE tickets
    SET 
      status = 'snoozed',
      is_snoozed = TRUE,
      snoozed_until = ?,
      snoozed_by = ?,
      snooze_reason = ?,
      updated_at = ?
    WHERE id = ?
  `).bind(
    snoozedUntil,
    snoozedBy,
    reason,
    new Date().toISOString(),
    ticketId
  ).run();
}

async unsnoozeTicket(ticketId: string): Promise<void> {
  await this.db.prepare(`
    UPDATE tickets
    SET 
      status = 'in-progress',
      is_snoozed = FALSE,
      snoozed_until = NULL,
      updated_at = ?
    WHERE id = ?
  `).bind(
    new Date().toISOString(),
    ticketId
  ).run();
}

async getSnoozedTickets(): Promise<Ticket[]> {
  const now = new Date().toISOString();
  const { results } = await this.db.prepare(`
    SELECT * FROM tickets
    WHERE is_snoozed = TRUE AND snoozed_until <= ?
  `).bind(now).all();

  return results as Ticket[];
}
```

**Create:** `packages/worker/src/services/MentionManager.ts`

```typescript
export class MentionManager {
  private db: D1Database;

  async createMention(data: CreateMentionData): Promise<Mention> {
    const mentionId = crypto.randomUUID();
    await this.db.prepare(`
      INSERT INTO staff_mentions (
        id, ticket_id, from_staff_id, to_staff_id, message,
        priority, type, is_read, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      mentionId,
      data.ticketId,
      data.fromStaffId,
      data.toStaffId,
      data.message,
      data.priority || 'normal',
      data.type || 'ticket',
      false,
      new Date().toISOString()
    ).run();

    return this.getMention(mentionId);
  }

  async getMentionsForStaff(staffId: string, unreadOnly = false): Promise<Mention[]> {
    const query = unreadOnly
      ? `SELECT * FROM staff_mentions WHERE to_staff_id = ? AND is_read = FALSE ORDER BY created_at DESC`
      : `SELECT * FROM staff_mentions WHERE to_staff_id = ? ORDER BY created_at DESC`;

    const { results } = await this.db.prepare(query).bind(staffId).all();
    return results as Mention[];
  }

  async addThreadReply(mentionId: string, staffId: string, message: string): Promise<void> {
    const threadId = crypto.randomUUID();
    await this.db.prepare(`
      INSERT INTO mention_threads (id, mention_id, staff_id, message, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      threadId,
      mentionId,
      staffId,
      message,
      new Date().toISOString()
    ).run();
  }

  async getThreadReplies(mentionId: string): Promise<ThreadReply[]> {
    const { results } = await this.db.prepare(`
      SELECT * FROM mention_threads WHERE mention_id = ? ORDER BY created_at ASC
    `).bind(mentionId).all();

    return results as ThreadReply[];
  }

  async markAsRead(mentionId: string): Promise<void> {
    await this.db.prepare(`
      UPDATE staff_mentions SET is_read = TRUE WHERE id = ?
    `).bind(mentionId).run();
  }
}
```

**Tasks:**
- [ ] Implement snooze functionality
- [ ] Create cron job to unsnooze tickets
- [ ] Implement mention creation
- [ ] Implement mention threads
- [ ] Implement mention notifications
- [ ] Test snooze and mentions

---

### **WEEK 2: Dashboard Backend APIs (40 hours)**

#### **API Routes:**

```typescript
// packages/worker/src/index.ts

// Authentication
app.post('/api/auth/login', authController.login);
app.post('/api/auth/logout', authController.logout);
app.get('/api/auth/me', authenticate, authController.me);

// Tickets
app.get('/api/tickets', authenticate, ticketController.list);
app.get('/api/tickets/:id', authenticate, ticketController.get);
app.put('/api/tickets/:id/assign', authenticate, ticketController.assign);
app.put('/api/tickets/:id/status', authenticate, ticketController.updateStatus);
app.post('/api/tickets/:id/reply', authenticate, ticketController.reply);
app.post('/api/tickets/:id/notes', authenticate, ticketController.addNote);
app.post('/api/tickets/:id/snooze', authenticate, ticketController.snooze);
app.post('/api/tickets/:id/unsnooze', authenticate, ticketController.unsnooze);

// Mentions (Ticket-based)
app.get('/api/mentions', authenticate, mentionController.list);
app.get('/api/mentions/:id', authenticate, mentionController.get);
app.post('/api/mentions', authenticate, mentionController.create);
app.post('/api/mentions/:id/reply', authenticate, mentionController.addReply);
app.put('/api/mentions/:id/read', authenticate, mentionController.markAsRead);

// Staff Group Chat (Channels)
app.get('/api/channels', authenticate, channelController.list);
app.get('/api/channels/:id', authenticate, channelController.get);
app.post('/api/channels', authenticate, requireManagerOrAdmin, channelController.create);
app.put('/api/channels/:id', authenticate, channelController.update);
app.delete('/api/channels/:id', authenticate, requireAdmin, channelController.delete);
app.post('/api/channels/:id/members', authenticate, channelController.addMembers);
app.delete('/api/channels/:id/members/:staffId', authenticate, channelController.removeMember);

// Channel Messages
app.get('/api/channels/:id/messages', authenticate, channelController.getMessages);
app.post('/api/channels/:id/messages', authenticate, channelController.sendMessage);
app.put('/api/channels/:id/messages/:messageId', authenticate, channelController.editMessage);
app.delete('/api/channels/:id/messages/:messageId', authenticate, channelController.deleteMessage);

// Channel Threads
app.get('/api/threads/:id/messages', authenticate, threadController.getMessages);
app.post('/api/threads/:id/messages', authenticate, threadController.replyToThread);

// Channel Notifications
app.get('/api/notifications', authenticate, notificationController.list);
app.put('/api/notifications/:id/read', authenticate, notificationController.markAsRead);
app.put('/api/notifications/read-all', authenticate, notificationController.markAllAsRead);

// Customers
app.get('/api/customers/:id', authenticate, customerController.get);
app.get('/api/customers/:id/orders', authenticate, customerController.getOrders);

// Settings
app.get('/api/settings', authenticate, requireAdmin, settingsController.list);
app.put('/api/settings/:key', authenticate, requireAdmin, settingsController.update);

// Staff
app.get('/api/staff', authenticate, staffController.list);
app.get('/api/staff/:id', authenticate, staffController.get);
app.put('/api/staff/:id/presence', authenticate, staffController.updatePresence);
```

**Tasks:**
- [ ] Create all API routes
- [ ] Implement authentication middleware
- [ ] Implement authorization (RBAC)
- [ ] Add request validation
- [ ] Add error handling
- [ ] Test all endpoints

---

### **WEEK 3-4: Dashboard Frontend (80 hours)**

#### **Tech Stack:**
- React 18
- Vite
- Tailwind CSS (using your existing Tailwind UI template)
- Zustand (state management)
- React Query (data fetching)
- React Router (routing)

#### **Key Components:**

**1. Layout (from Tailwind UI template):**
- `AppLayout.tsx` - Main layout wrapper
- `AppHeader.tsx` - Top navigation
- `AppSidebar.tsx` - Left sidebar navigation

**2. Ticket Views:**
- `TicketList.tsx` - List of tickets with filters
- `TicketDetail.tsx` - Ticket detail view
- `TicketFilters.tsx` - Status, priority, assignee, date filters
- `SnoozeModal.tsx` - Snooze ticket modal (3hr, tomorrow, Friday, Monday, custom)

**3. Mentions:**
- `MentionsList.tsx` - List of mentions
- `MentionDetail.tsx` - Mention detail with thread
- `MentionThread.tsx` - Threaded conversation

**4. Internal Notes:**
- `InternalNotes.tsx` - Yellow-background staff notes
- `NoteEditor.tsx` - Note creation/editing

**5. Customer Context:**
- `CustomerPanel.tsx` - Customer info sidebar
- `OrderHistory.tsx` - Order history (placeholder)

**6. Settings:**
- `SettingsPage.tsx` - Admin settings
- `AIModeSetting.tsx` - Toggle auto-reply vs draft

**Tasks:**
- [ ] Set up React + Vite project
- [ ] Integrate Tailwind UI template
- [ ] Create all components
- [ ] Implement state management
- [ ] Implement API integration
- [ ] Add real-time updates (polling)
- [ ] Responsive design
- [ ] Test all features

---

## 🎯 **DELIVERABLES (End of Week 4):**

✅ **Gmail Integration** - Full OAuth, fetch, send, draft  
✅ **Email-to-Ticket** - Auto-categorization, priority detection  
✅ **AI Agent** - 4 handlers, auto-reply or draft mode  
✅ **Snooze Tickets** - 5 snooze options from demo  
✅ **@Mentions** - Full mention system with threads  
✅ **Internal Notes** - Yellow staff-only notes  
✅ **Dashboard** - Full Tailwind UI implementation  
✅ **3 Users** - John (Admin), Ted (Agent), Sam (Agent)  
✅ **Admin Settings** - AI mode toggle  

---

## 📊 **TESTING CHECKLIST:**

### **Gmail Integration:**
- [ ] Fetch unread emails
- [ ] Parse email headers correctly
- [ ] Parse email body (text + HTML)
- [ ] Send email reply
- [ ] Create draft
- [ ] Thread emails correctly

### **Ticketing:**
- [ ] Create ticket from email
- [ ] Auto-detect priority
- [ ] Auto-categorize
- [ ] Auto-detect sentiment
- [ ] Link emails to tickets

### **Snooze:**
- [ ] Snooze for 3 hours
- [ ] Snooze until tomorrow 9 AM
- [ ] Snooze until Friday 9 AM
- [ ] Snooze until Monday 9 AM
- [ ] Snooze with custom date/time
- [ ] Auto-unsnooze when time reached

### **Mentions:**
- [ ] Create mention
- [ ] Notify mentioned staff
- [ ] Add thread reply
- [ ] Mark as read
- [ ] Filter by priority

### **Internal Notes:**
- [ ] Add note to ticket
- [ ] Edit note
- [ ] Delete note
- [ ] Show staff name and timestamp

### **AI Agent:**
- [ ] Generate response
- [ ] Check confidence score
- [ ] Escalate low confidence
- [ ] Escalate angry customer
- [ ] Auto-send (auto mode)
- [ ] Save draft (draft mode)

### **Dashboard:**
- [ ] Login/logout
- [ ] View ticket list
- [ ] Filter by status
- [ ] Filter by priority
- [ ] Filter by assignee
- [ ] Filter by date
- [ ] View ticket detail
- [ ] Reply to ticket
- [ ] Add internal note
- [ ] Snooze ticket
- [ ] View mentions
- [ ] Reply to mention
- [ ] View settings
- [ ] Toggle AI mode

---

## 🚀 **DEPLOYMENT:**

### **Environment Variables:**

```bash
# Gmail
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REDIRECT_URI=
GMAIL_REFRESH_TOKEN=

# AI
ANTHROPIC_API_KEY=

# Database
D1_DATABASE_ID=

# JWT
JWT_SECRET=

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
```

### **Deployment Steps:**

1. Create D1 database: `wrangler d1 create customer-service-db`
2. Run migrations: `wrangler d1 migrations apply customer-service-db`
3. Deploy worker: `wrangler deploy`
4. Deploy frontend: `wrangler pages deploy frontend/dist`
5. Set up Gmail OAuth
6. Test end-to-end

---

## 📝 **NOTES:**

- **Shopify/PERP integrations:** Placeholder for now, add post-MVP
- **Live Chat Widget:** Post-MVP
- **WhatsApp:** Post-MVP
- **Real-time WebSockets:** Using polling for MVP
- **Product Knowledge:** Post-MVP

---

**STATUS:** ✅ READY TO BUILD

**Next Step:** Start with Gmail Integration (Day 1)

