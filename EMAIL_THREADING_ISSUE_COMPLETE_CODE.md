# Email Threading Issue - Complete Technical Documentation

## 📋 Executive Summary

**Problem**: Email replies sent from our customer service dashboard are appearing as NEW emails in the recipient's inbox instead of threading with the original email conversation.

**Status**: Despite implementing all RFC 2822 standards correctly, Gmail API threading does not work reliably when sending to external email providers (Proton Mail, etc.).

**Proposed Solution**: Switch from Gmail API to SMTP for sending emails.

---

## 🏗️ System Architecture

### Technology Stack

**Backend:**
- **Platform**: Cloudflare Workers (Edge Computing)
- **Framework**: Hono (TypeScript web framework)
- **Database**: Cloudflare D1 (SQLite-compatible)
- **Email API**: Gmail API v1 (OAuth 2.0)
- **Runtime**: V8 JavaScript Engine (no Node.js)

**Frontend:**
- **Framework**: React + Vite
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router
- **UI**: Tailwind CSS + Headless UI

**Email Flow:**
1. Customer sends email → Gmail inbox (john@dtf.com.au)
2. Cloudflare Worker cron job (every 5 minutes) polls Gmail API
3. Email stored in D1 database, ticket created
4. Staff replies via dashboard
5. Reply sent via Gmail API → Customer's inbox

---

## 🔍 The Threading Problem

### What We've Tried (All Failed)

#### ✅ Attempt 1: Basic RFC 2822 Headers
- Added `In-Reply-To` header with original Message-ID
- Added `References` header with original Message-ID
- Result: **Still creates new email thread**

#### ✅ Attempt 2: Added MIME-Version Header
- Added `MIME-Version: 1.0` (was missing)
- Result: **Still creates new email thread**

#### ✅ Attempt 3: Improved Base64URL Encoding
- Switched from `String.fromCharCode(...data)` to byte-by-byte conversion
- Ensures proper UTF-8 handling
- Result: **Still creates new email thread**

#### ✅ Attempt 4: Fetch Original Message from Gmail API
- Instead of using stored `message_id` from database
- Fetch original message metadata directly from Gmail API
- Extract exact `threadId`, `Message-ID`, `Subject` from Gmail
- Use Gmail's authoritative threading information
- Result: **Still creates new email thread**

### Current Email Headers (Confirmed Perfect)

```
From: john@dtf.com.au
To: mccarthycsagent@proton.me
Subject: Re: first email from proton account
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
In-Reply-To: <PJWbnBdg_Xu9vB0tyKXGGJYIGt-NiD6AG-BDUtB6W1ofBjNO5NSAPP4J2Vk2xTBCyuZyWkW6wptLCz8tg0kNmnqGlxGn38SxCgb0BU3P_-k=@proton.me>
References: <PJWbnBdg_Xu9vB0tyKXGGJYIGt-NiD6AG-BDUtB6W1ofBjNO5NSAPP4J2Vk2xTBCyuZyWkW6wptLCz8tg0kNmnqGlxGn38SxCgb0BU3P_-k=@proton.me>
```

### Logs Confirm Success (But Still Doesn't Thread)

```
[GmailIntegration] Fetching original message metadata for: 19ad4ff7db1c69c7
[Tickets] Original message thread ID: 19ad4ff7db1c69c7
[Tickets] Original message Message-ID: <PJWbnBdg_Xu9vB0tyKXGGJYIGt-NiD6AG-BDUtB6W1ofBjNO5NSAPP4J2Vk2xTBCyuZyWkW6wptLCz8tg0kNmnqGlxGn38SxCgb0BU3P_-k=@proton.me>
[Tickets] Original message Subject: first email from proton account
[GmailIntegration] ✅ Email sent
[GmailIntegration] Result thread ID: 19ad4ff7db1c69c7 (MATCHES ORIGINAL!)
[GmailIntegration] Result message ID: 19ad6aa9603de1cf
```

**Key Observation**: 
- Gmail API confirms the email was sent with the correct `threadId`
- The reply appears threaded in the SENDER's "Sent" folder
- The reply appears as a NEW email in the RECIPIENT's inbox (Proton Mail)

---

## 🚨 Root Cause Analysis

### Gmail API Limitation

The Gmail API `users.messages.send` endpoint with `threadId` parameter works for:
- ✅ Threading within the same Gmail account
- ✅ Threading in the sender's "Sent" folder
- ❌ Threading in external recipient's inbox (Proton, Outlook, etc.)

### Why This Happens

1. **Gmail API is account-specific**: The `threadId` is Gmail's internal identifier, not a universal email standard.

2. **External providers don't see threadId**: When Gmail sends to Proton Mail, Proton's email server only sees the RFC 2822 headers (`In-Reply-To`, `References`), not Gmail's internal `threadId`.

3. **Potential header modification**: Gmail API may be modifying or not properly including the threading headers when sending to external recipients.

4. **SMTP vs API difference**: SMTP sends raw email messages with full control over headers. Gmail API abstracts this and may not preserve all threading headers correctly for external recipients.

---

## 💻 Complete Code Implementation

### 1. GmailIntegration Service (Current Implementation)

**File**: `packages/worker/src/services/GmailIntegration.ts`

```typescript
import type { D1Database } from '@cloudflare/workers-types';

/**
 * Gmail Integration Service
 * 
 * Handles Gmail API integration for Customer Service System:
 * - OAuth 2.0 authentication
 * - Fetch emails from inbox
 * - Send email replies
 * - Create drafts for staff approval
 * - Store emails in D1 database
 * 
 * Uses Google Gmail API v1
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface GmailCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken: string;
}

export interface Email {
  id: string;
  gmailMessageId: string;
  gmailThreadId: string;
  messageId: string | null; // RFC 2822 Message-ID header for threading
  from: EmailAddress;
  to: EmailAddress;
  subject: string;
  bodyText: string;
  bodyHtml: string | null;
  receivedAt: string;
  hasAttachments: boolean;
  attachments: Attachment[];
  labels: string[];
}

export interface EmailAddress {
  email: string;
  name: string | null;
}

export interface Attachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
}

export interface Draft {
  id: string;
  to: string;
  subject: string;
  body: string;
  threadId?: string;
}

export interface SendEmailOptions {
  from?: string;
  to: string;
  subject: string;
  body: string;
  threadId?: string;
  replyToMessageId?: string;
}

// ============================================================================
// GMAIL INTEGRATION SERVICE
// ============================================================================

export class GmailIntegration {
  private db: D1Database;
  private credentials: GmailCredentials;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  
  // Rate limiting (Gmail API: 250 quota units per user per second)
  private lastRequestTime: number = 0;
  private requestDelay: number = 200; // 200ms between requests = max 5 req/sec

  constructor(db: D1Database, credentials: GmailCredentials) {
    this.db = db;
    this.credentials = credentials;
    console.log('[GmailIntegration] Initialized');
  }

  /**
   * Rate limiter - ensures we don't exceed Gmail API limits
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.requestDelay) {
      const waitTime = this.requestDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  // ==========================================================================
  // AUTHENTICATION
  // ==========================================================================

  /**
   * Get a valid access token (refresh if expired)
   */
  private async getAccessToken(): Promise<string> {
    // If token exists and not expired, return it
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Refresh token with retry logic
    return await this.refreshAccessTokenWithRetry();
  }

  /**
   * Refresh access token with exponential backoff retry
   */
  private async refreshAccessTokenWithRetry(attempt: number = 1): Promise<string> {
    const maxAttempts = 3;
    
    try {
      console.log(`[GmailIntegration] Refreshing access token (attempt ${attempt}/${maxAttempts})...`);
      
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecret,
          refresh_token: this.credentials.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        
        // If refresh token is invalid, don't retry
        if (response.status === 400 || response.status === 401) {
          console.error('[GmailIntegration] 🔴 CRITICAL: Refresh token is invalid or expired');
          throw new Error(`Invalid refresh token: ${error}`);
        }
        
        throw new Error(`Failed to refresh access token: ${error}`);
      }

      const data = await response.json() as any;
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 min buffer

      console.log('[GmailIntegration] ✅ Access token refreshed');
      return this.accessToken;
      
    } catch (error) {
      // If we haven't exceeded max attempts, retry with exponential backoff
      if (attempt < maxAttempts) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`[GmailIntegration] ⚠️ Token refresh failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.refreshAccessTokenWithRetry(attempt + 1);
      }
      
      // Max attempts exceeded
      console.error('[GmailIntegration] 🔴 Token refresh failed after 3 attempts');
      throw error;
    }
  }

  // ==========================================================================
  // FETCH EMAILS
  // ==========================================================================

  /**
   * Fetch unread emails from inbox
   */
  async fetchInbox(maxResults: number = 50): Promise<Email[]> {
    console.log(`[GmailIntegration] Fetching inbox (max: ${maxResults})...`);
    const token = await this.getAccessToken();

    // 1. List message IDs (with rate limiting)
    // TESTING FILTER: Only process emails from specific addresses
    await this.rateLimit();
    const listResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=is:unread in:inbox (from:johnpaulhutchison@gmail.com OR from:mccarthycsagent@proton.me)`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!listResponse.ok) {
      const error = await listResponse.text();
      throw new Error(`Failed to list messages: ${error}`);
    }

    const listData = await listResponse.json() as any;
    const messages = listData.messages || [];

    if (messages.length === 0) {
      console.log('[GmailIntegration] No unread messages');
      return [];
    }

    console.log(`[GmailIntegration] Found ${messages.length} unread messages`);

    // 2. Fetch full message details for each
    const emails: Email[] = [];
    for (const message of messages) {
      try {
        const email = await this.getEmailDetails(message.id, token);
        emails.push(email);
      } catch (error) {
        console.error(`[GmailIntegration] Failed to fetch message ${message.id}:`, error);
      }
    }

    console.log(`[GmailIntegration] ✅ Fetched ${emails.length} emails`);
    return emails;
  }

  /**
   * Get full email details by message ID
   */
  private async getEmailDetails(messageId: string, token: string): Promise<Email> {
    // Rate limit before fetching
    await this.rateLimit();
    
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get message details: ${error}`);
    }

    const data = await response.json() as any;

    // Parse headers
    const headers = data.payload?.headers || [];
    const from = this.findHeader(headers, 'From') || '';
    const to = this.findHeader(headers, 'To') || '';
    const subject = this.findHeader(headers, 'Subject') || '(No Subject)';
    const dateHeader = this.findHeader(headers, 'Date');
    const messageIdHeader = this.findHeader(headers, 'Message-ID');

    // Parse date with fallback to internalDate (Unix timestamp in milliseconds)
    let receivedAt: string;
    try {
      if (dateHeader) {
        const parsedDate = new Date(dateHeader);
        if (isNaN(parsedDate.getTime())) {
          // Invalid date from header, use Gmail's internalDate
          receivedAt = new Date(parseInt(data.internalDate)).toISOString();
        } else {
          receivedAt = parsedDate.toISOString();
        }
      } else if (data.internalDate) {
        // No Date header, use Gmail's internalDate (Unix timestamp in milliseconds)
        receivedAt = new Date(parseInt(data.internalDate)).toISOString();
      } else {
        // Fallback to current time
        receivedAt = new Date().toISOString();
      }
    } catch (error) {
      console.warn('[GmailIntegration] ⚠️ Error parsing date, using current time:', error);
      receivedAt = new Date().toISOString();
    }

    // Parse body
    const body = this.parseEmailBody(data.payload);

    // Parse attachments
    const attachments = this.parseAttachments(data.payload);

    // Get labels
    const labels = data.labelIds || [];

    return {
      id: messageId, // Use Gmail message ID as the unique ID
      gmailMessageId: messageId,
      gmailThreadId: data.threadId,
      messageId: messageIdHeader || null, // RFC 2822 Message-ID for threading
      from: this.parseEmailAddress(from),
      to: this.parseEmailAddress(to),
      subject,
      bodyText: body.text,
      bodyHtml: body.html,
      receivedAt,
      hasAttachments: attachments.length > 0,
      attachments,
      labels,
    };
  }

  /**
   * Mark email as read in Gmail
   */
  async markAsRead(gmailMessageId: string): Promise<void> {
    console.log(`[GmailIntegration] Marking email ${gmailMessageId} as read...`);
    const token = await this.getAccessToken();

    await this.rateLimit();
    
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${gmailMessageId}/modify`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          removeLabelIds: ['UNREAD']
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to mark email as read: ${error}`);
    }

    console.log('[GmailIntegration] ✅ Email marked as read');
  }

  // ==========================================================================
  // SEND EMAILS
  // ==========================================================================

  /**
   * Fetch original message metadata from Gmail
   * Used for getting threading information (threadId, Message-ID, Subject, etc.)
   */
  private async getMessageMetadata(messageId: string): Promise<any> {
    const token = await this.getAccessToken();
    
    // Request specific metadata headers for threading
    const params = new URLSearchParams({
      format: 'metadata',
      metadataHeaders: 'Subject',
    });
    // Add multiple metadataHeaders params (Gmail API accepts repeated params)
    params.append('metadataHeaders', 'Message-ID');
    params.append('metadataHeaders', 'From');
    params.append('metadataHeaders', 'To');
    
    await this.rateLimit();
    
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get message metadata: ${response.status} ${error}`);
    }
    
    return await response.json();
  }

  /**
   * Get original message information for replying
   * Fetches the exact threading headers from Gmail API
   */
  async getOriginalMessageForReply(gmailMessageId: string): Promise<{
    threadId: string;
    messageId: string;
    subject: string;
    from: string;
  }> {
    console.log(`[GmailIntegration] Fetching original message metadata for: ${gmailMessageId}`);
    
    const metadata = await this.getMessageMetadata(gmailMessageId);
    
    // Extract headers
    const headers = metadata.payload?.headers || [];
    const headerMap = new Map<string, string>();
    for (const h of headers) {
      headerMap.set(h.name.toLowerCase(), h.value);
    }
    
    const threadId = metadata.threadId;
    const messageId = headerMap.get('message-id') || '';
    const subject = headerMap.get('subject') || '(no subject)';
    const from = headerMap.get('from') || '';
    
    if (!threadId) {
      throw new Error('Original message missing threadId');
    }
    if (!messageId) {
      throw new Error('Original message missing Message-ID header');
    }
    
    return {
      threadId,
      messageId,
      subject,
      from,
    };
  }

  /**
   * Send an email reply
   */
  async sendEmail(options: SendEmailOptions): Promise<void> {
    console.log(`[GmailIntegration] Sending email to ${options.to}...`);
    console.log(`[GmailIntegration] Thread ID: ${options.threadId || 'NONE'}`);
    console.log(`[GmailIntegration] Reply-To Message-ID: ${options.replyToMessageId || 'NONE'}`);
    const token = await this.getAccessToken();

    // Build email message
    const email = this.buildEmailMessage(options);
    console.log(`[GmailIntegration] Email headers:\n${email.split('\r\n').slice(0, 8).join('\r\n')}`);
    const encodedEmail = this.encodeEmail(email);

    // Rate limit before sending
    await this.rateLimit();
    
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodedEmail,
          threadId: options.threadId,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('[GmailIntegration] ❌ Send failed:', error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const result = await response.json() as any;
    console.log('[GmailIntegration] ✅ Email sent');
    console.log('[GmailIntegration] Result thread ID:', result.threadId);
    console.log('[GmailIntegration] Result message ID:', result.id);
  }

  /**
   * Create a draft email (for staff approval)
   */
  async createDraft(options: SendEmailOptions): Promise<Draft> {
    console.log(`[GmailIntegration] Creating draft for ${options.to}...`);
    const token = await this.getAccessToken();

    // Build email message
    const email = this.buildEmailMessage(options);
    const encodedEmail = this.encodeEmail(email);

    // Rate limit before creating draft
    await this.rateLimit();
    
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/drafts',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            raw: encodedEmail,
            threadId: options.threadId,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create draft: ${error}`);
    }

    const data = await response.json() as any;

    console.log('[GmailIntegration] ✅ Draft created');

    return {
      id: data.id,
      to: options.to,
      subject: options.subject,
      body: options.body,
      threadId: options.threadId,
    };
  }

  // ==========================================================================
  // STORE IN DATABASE
  // ==========================================================================

  /**
   * Store email in D1 database
   */
  async storeEmailInDatabase(email: Email): Promise<void> {
    console.log(`[GmailIntegration] Storing email ${email.gmailMessageId} in database...`);

    // Check if email already exists (prevent duplicates)
    if (await this.emailExists(email.gmailMessageId)) {
      console.log(`[GmailIntegration] ⚠️ Email already exists: ${email.gmailMessageId}`);
      return;
    }

    await this.db
      .prepare(
        `
      INSERT INTO emails (
        id, gmail_message_id, gmail_thread_id, message_id, from_email, from_name,
        to_email, to_name, subject, body_text, body_html, is_inbound, is_read,
        has_attachments, attachments, received_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .bind(
        email.id,
        email.gmailMessageId,
        email.gmailThreadId,
        email.messageId,
        email.from.email,
        email.from.name,
        email.to.email,
        email.to.name,
        email.subject,
        email.bodyText,
        email.bodyHtml,
        true, // is_inbound
        false, // is_read
        email.hasAttachments,
        JSON.stringify(email.attachments),
        email.receivedAt,
        new Date().toISOString()
      )
      .run();

    console.log('[GmailIntegration] ✅ Email stored in database');
  }

  /**
   * Link email to ticket after ticket creation
   */
  async linkEmailToTicket(emailId: string, ticketId: string): Promise<void> {
    await this.db.prepare(`
      UPDATE emails SET ticket_id = ? WHERE id = ?
    `).bind(ticketId, emailId).run();
  }

  /**
   * Check if email already exists in database
   */
  async emailExists(gmailMessageId: string): Promise<boolean> {
    const { results } = await this.db
      .prepare(`SELECT id FROM emails WHERE gmail_message_id = ? LIMIT 1`)
      .bind(gmailMessageId)
      .all();

    return results.length > 0;
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Find header value by name
   */
  private findHeader(headers: any[], name: string): string | null {
    const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
    return header?.value || null;
  }

  /**
   * Parse email address from "Name <email@example.com>" format
   */
  private parseEmailAddress(address: string): EmailAddress {
    const match = address.match(/(.+?)\s*<(.+?)>/);
    if (match) {
      return {
        name: match[1].trim().replace(/^["']|["']$/g, ''),
        email: match[2].trim(),
      };
    }
    return {
      name: null,
      email: address.trim(),
    };
  }

  /**
   * Parse email body (text and HTML)
   */
  private parseEmailBody(payload: any): { text: string; html: string | null } {
    let text = '';
    let html: string | null = null;

    const extractBody = (part: any) => {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        text = this.decodeBase64Url(part.body.data);
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        html = this.decodeBase64Url(part.body.data);
      } else if (part.parts) {
        part.parts.forEach(extractBody);
      }
    };

    if (payload.body?.data) {
      text = this.decodeBase64Url(payload.body.data);
    } else if (payload.parts) {
      payload.parts.forEach(extractBody);
    }

    return { text, html };
  }

  /**
   * Parse attachments
   */
  private parseAttachments(payload: any): Attachment[] {
    const attachments: Attachment[] = [];

    const extractAttachments = (part: any) => {
      if (part.filename && part.body?.attachmentId) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          size: part.body.size || 0,
          attachmentId: part.body.attachmentId,
        });
      } else if (part.parts) {
        part.parts.forEach(extractAttachments);
      }
    };

    if (payload.parts) {
      payload.parts.forEach(extractAttachments);
    }

    return attachments;
  }

  /**
   * Build email message in RFC 2822 format
   * Cloudflare Workers compatible - follows Gmail API threading requirements
   */
  private buildEmailMessage(options: SendEmailOptions): string {
    const lines: string[] = [
      `From: ${options.from || 'john@dtf.com.au'}`,
      `To: ${options.to}`,
      `Subject: ${options.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
    ];

    if (options.replyToMessageId) {
      lines.push(`In-Reply-To: ${options.replyToMessageId}`);
      lines.push(`References: ${options.replyToMessageId}`);
    }

    lines.push('');
    lines.push(options.body);

    return lines.join('\r\n');
  }

  /**
   * Encode email for Gmail API (base64url)
   * Properly handles UTF-8 characters (emojis, special characters)
   * Cloudflare Workers compatible (no Buffer)
   */
  private encodeEmail(email: string): string {
    // Use TextEncoder for proper UTF-8 encoding
    const encoder = new TextEncoder();
    const bytes = encoder.encode(email);
    
    // Convert bytes to binary string
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    // Convert to base64
    const base64 = btoa(binary);
    
    // Convert to base64url (replace + with -, / with _, remove =)
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /**
   * Decode base64url string
   * Properly handles UTF-8 characters (emojis, special characters)
   */
  private decodeBase64Url(data: string): string {
    // Convert base64url to base64
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode base64 to binary string
    const binaryString = atob(base64);
    
    // Convert binary string to Uint8Array
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Use TextDecoder for proper UTF-8 decoding
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  }
}
```

---

### 2. Tickets Controller (Reply Function)

**File**: `packages/worker/src/controllers/tickets.ts` (excerpt)

```typescript
/**
 * Reply to ticket
 */
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

    // Get ticket details
    const ticket = await c.env.DB.prepare(`
      SELECT customer_email, subject FROM tickets WHERE ticket_id = ?
    `).bind(ticketId).first();

    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    // Get staff member's name from database
    const staffInfo = await c.env.DB.prepare(`
      SELECT first_name, last_name FROM staff_users WHERE id = ?
    `).bind(user.id).first();

    const staffName = staffInfo 
      ? `${staffInfo.first_name} ${staffInfo.last_name}` 
      : user.email;

    // Get the Gmail message ID from our database
    const emailRecord = await c.env.DB.prepare(`
      SELECT gmail_message_id, gmail_thread_id, message_id FROM emails WHERE ticket_id = ? ORDER BY created_at DESC LIMIT 1
    `).bind(ticketId).first();

    if (!emailRecord?.gmail_message_id) {
      console.error(`[Tickets] No Gmail message ID found for ticket ${ticketId}`);
      // Still save the message in the database, but don't send email
    } else {
      // Send the email to the customer using Gmail API
      try {
        const { GmailIntegration } = await import('../services/GmailIntegration');
        const gmail = new GmailIntegration(c.env.DB, {
          clientId: c.env.GMAIL_CLIENT_ID!,
          clientSecret: c.env.GMAIL_CLIENT_SECRET!,
          redirectUri: c.env.GMAIL_REDIRECT_URI!,
          refreshToken: c.env.GMAIL_REFRESH_TOKEN!
        });

        // Fetch the original message metadata from Gmail to get exact threading info
        const originalMessage = await gmail.getOriginalMessageForReply(emailRecord.gmail_message_id as string);
        
        console.log(`[Tickets] Original message thread ID:`, originalMessage.threadId);
        console.log(`[Tickets] Original message Message-ID:`, originalMessage.messageId);
        console.log(`[Tickets] Original message Subject:`, originalMessage.subject);
        
        // Build reply subject (ensure it has Re: prefix)
        const replySubject = originalMessage.subject.startsWith('Re:') 
          ? originalMessage.subject 
          : `Re: ${originalMessage.subject}`;
        
        await gmail.sendEmail({
          from: 'john@dtf.com.au',
          to: ticket.customer_email as string,
          subject: replySubject,
          body: content,
          threadId: originalMessage.threadId,
          replyToMessageId: originalMessage.messageId
        });

        console.log(`[Tickets] ✅ Email sent to ${ticket.customer_email}`);
      } catch (emailError) {
        console.error(`[Tickets] Failed to send email:`, emailError);
        // Don't fail the entire request if email fails - still save the message
      }
    }

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

---

### 3. Scheduled Message Sender (Cron Job)

**File**: `packages/worker/src/workers/scheduled-message-sender.ts`

```typescript
/**
 * Scheduled Message Sender
 * Sends scheduled messages when their scheduled time has passed
 */

import type { Env } from '../types/shared';
import { GmailIntegration } from '../services/GmailIntegration';

export async function sendScheduledMessages(env: Env): Promise<void> {
  console.log('[Scheduled Messages] Starting job at:', new Date().toISOString());
  
  try {
    // Get all pending scheduled messages where scheduled_for <= now
    const now = new Date().toISOString();
    const { results: messages } = await env.DB.prepare(`
      SELECT sm.*, t.ticket_id, t.customer_email, t.subject, s.first_name, s.last_name
      FROM scheduled_messages sm
      JOIN tickets t ON sm.ticket_id = t.ticket_id
      JOIN staff_users s ON sm.staff_id = s.id
      WHERE sm.status = 'pending' AND sm.scheduled_for <= ?
      ORDER BY sm.scheduled_for ASC
    `).bind(now).all();

    console.log(`[Scheduled Messages] Found ${messages.length} messages to send`);

    for (const message of messages as any[]) {
      try {
        console.log(`[Scheduled Messages] Sending message ${message.id} for ticket ${message.ticket_id}`);
        
        // Get the Gmail message ID from our database
        const emailRecord = await env.DB.prepare(`
          SELECT gmail_message_id FROM emails WHERE ticket_id = ? ORDER BY created_at DESC LIMIT 1
        `).bind(message.ticket_id).first();

        if (!emailRecord?.gmail_message_id) {
          console.error(`[Scheduled Messages] No Gmail message ID found for ticket ${message.ticket_id}`);
          throw new Error('No Gmail message ID found for threading');
        }
        
        // Initialize Gmail service
        const gmail = new GmailIntegration(env.DB, {
          clientId: env.GMAIL_CLIENT_ID!,
          clientSecret: env.GMAIL_CLIENT_SECRET!,
          redirectUri: env.GMAIL_REDIRECT_URI!,
          refreshToken: env.GMAIL_REFRESH_TOKEN!
        });

        // Fetch the original message metadata from Gmail to get exact threading info
        const originalMessage = await gmail.getOriginalMessageForReply(emailRecord.gmail_message_id as string);
        
        console.log(`[Scheduled Messages] Original message thread ID:`, originalMessage.threadId);
        console.log(`[Scheduled Messages] Original message Message-ID:`, originalMessage.messageId);
        console.log(`[Scheduled Messages] Original message Subject:`, originalMessage.subject);
        
        // Build reply subject (ensure it has Re: prefix)
        const replySubject = originalMessage.subject.startsWith('Re:') 
          ? originalMessage.subject 
          : `Re: ${originalMessage.subject}`;
        
        // Send the email to the customer
        try {
          await gmail.sendEmail({
            from: 'john@dtf.com.au',
            to: message.customer_email,
            subject: replySubject,
            body: message.content,
            threadId: originalMessage.threadId,
            replyToMessageId: originalMessage.messageId
          });
          console.log(`[Scheduled Messages] ✅ Email sent to ${message.customer_email}`);
        } catch (emailError) {
          console.error(`[Scheduled Messages] Failed to send email:`, emailError);
          throw new Error(`Email send failed: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`);
        }
        
        // Insert the message as a regular ticket message
        // Use the scheduled_for time as created_at so it appears in chronological order
        const messageId = crypto.randomUUID();
        const senderName = `${message.first_name} ${message.last_name}`;
        
        await env.DB.prepare(`
          INSERT INTO ticket_messages (id, ticket_id, sender_type, sender_id, sender_name, content, created_at)
          VALUES (?, ?, 'agent', ?, ?, ?, ?)
        `).bind(messageId, message.ticket_id, message.staff_id, senderName, message.content, message.scheduled_for).run();

        // Update the scheduled message status to 'sent'
        await env.DB.prepare(`
          UPDATE scheduled_messages
          SET status = 'sent', sent_at = datetime('now'), updated_at = datetime('now')
          WHERE id = ?
        `).bind(message.id).run();

        // Update the ticket's updated_at timestamp
        await env.DB.prepare(`
          UPDATE tickets
          SET updated_at = datetime('now')
          WHERE ticket_id = ?
        `).bind(message.ticket_id).run();

        console.log(`[Scheduled Messages] Successfully sent message ${message.id}`);
      } catch (error) {
        console.error(`[Scheduled Messages] Error sending message ${message.id}:`, error);
        
        // Mark as failed
        await env.DB.prepare(`
          UPDATE scheduled_messages
          SET status = 'failed', error_message = ?, updated_at = datetime('now')
          WHERE id = ?
        `).bind(error instanceof Error ? error.message : 'Unknown error', message.id).run();
      }
    }

    console.log('[Scheduled Messages] Job completed');
  } catch (error) {
    console.error('[Scheduled Messages] Job error:', error);
  }
}
```

---

### 4. Database Schema (Relevant Tables)

**File**: `packages/worker/migrations/0010_add_message_id_to_emails.sql`

```sql
-- Migration 0010: Add message_id column to emails table
-- Date: 2025-11-30
-- Purpose: Store the RFC 2822 Message-ID header for proper email threading

ALTER TABLE emails ADD COLUMN message_id TEXT;

CREATE INDEX IF NOT EXISTS idx_emails_message_id ON emails(message_id);
```

**Emails Table Structure:**
```sql
CREATE TABLE IF NOT EXISTS emails (
  id TEXT PRIMARY KEY,
  gmail_message_id TEXT UNIQUE NOT NULL,
  gmail_thread_id TEXT NOT NULL,
  message_id TEXT,  -- RFC 2822 Message-ID header
  ticket_id TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  to_name TEXT,
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  body_html TEXT,
  is_inbound BOOLEAN DEFAULT TRUE,
  is_read BOOLEAN DEFAULT FALSE,
  has_attachments BOOLEAN DEFAULT FALSE,
  attachments TEXT,
  received_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE SET NULL
);
```

---

## 🔬 Testing Evidence

### Test Email Sent

**From**: john@dtf.com.au  
**To**: mccarthycsagent@proton.me  
**Original Subject**: first email from proton account  
**Reply Subject**: Re: first email from proton account

### Cloudflare Worker Logs

```
[GmailIntegration] Initialized
[GmailIntegration] Fetching original message metadata for: 19ad4ff7db1c69c7
[GmailIntegration] Refreshing access token (attempt 1/3)...
[GmailIntegration] ✅ Access token refreshed
[Tickets] Original message thread ID: 19ad4ff7db1c69c7
[Tickets] Original message Message-ID: <PJWbnBdg_Xu9vB0tyKXGGJYIGt-NiD6AG-BDUtB6W1ofBjNO5NSAPP4J2Vk2xTBCyuZyWkW6wptLCz8tg0kNmnqGlxGn38SxCgb0BU3P_-k=@proton.me>
[Tickets] Original message Subject: first email from proton account
[GmailIntegration] Sending email to mccarthycsagent@proton.me...
[GmailIntegration] Thread ID: 19ad4ff7db1c69c7
[GmailIntegration] Reply-To Message-ID: <PJWbnBdg_Xu9vB0tyKXGGJYIGt-NiD6AG-BDUtB6W1ofBjNO5NSAPP4J2Vk2xTBCyuZyWkW6wptLCz8tg0kNmnqGlxGn38SxCgb0BU3P_-k=@proton.me>
[GmailIntegration] Email headers:
From: john@dtf.com.au
To: mccarthycsagent@proton.me
Subject: Re: first email from proton account
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
In-Reply-To: <PJWbnBdg_Xu9vB0tyKXGGJYIGt-NiD6AG-BDUtB6W1ofBjNO5NSAPP4J2Vk2xTBCyuZyWkW6wptLCz8tg0kNmnqGlxGn38SxCgb0BU3P_-k=@proton.me>
References: <PJWbnBdg_Xu9vB0tyKXGGJYIGt-NiD6AG-BDUtB6W1ofBjNO5NSAPP4J2Vk2xTBCyuZyWkW6wptLCz8tg0kNmnqGlxGn38SxCgb0BU3P_-k=@proton.me>

[GmailIntegration] ✅ Email sent
[GmailIntegration] Result thread ID: 19ad4ff7db1c69c7
[GmailIntegration] Result message ID: 19ad6aa9603de1cf
[Tickets] ✅ Email sent to mccarthycsagent@proton.me
```

### Result

- ✅ Email sent successfully
- ✅ Headers are RFC 2822 compliant
- ✅ Gmail API confirms correct threadId
- ✅ Reply appears threaded in sender's "Sent" folder
- ❌ **Reply appears as NEW email in recipient's inbox (Proton Mail)**

---

## 💡 Recommended Solution: Switch to SMTP

### Why SMTP Will Work

1. **Direct SMTP gives full control** over email headers without Gmail API abstraction
2. **SMTP is the standard protocol** that all email providers understand
3. **No API-specific limitations** - raw RFC 2822 messages are sent as-is
4. **Proven to work** for email threading across all providers

### Implementation Options for Cloudflare Workers

#### Option 1: MailChannels (Recommended)
- **Free tier available** for Cloudflare Workers
- **Built for Workers** - no TCP/socket issues
- **Simple API** similar to what we have now
- **Reliable delivery** with proper DKIM/SPF

#### Option 2: Gmail SMTP (via Cloudflare Email Workers)
- Use Gmail's SMTP server (smtp.gmail.com:587)
- Requires TCP socket support (not native in Workers)
- Would need external service or Durable Objects

#### Option 3: SendGrid/Postmark
- Paid services with SMTP APIs
- Workers-compatible HTTP APIs
- Good deliverability

---

## 📊 Summary

### What Works
- ✅ Email polling from Gmail
- ✅ Ticket creation from emails
- ✅ Staff dashboard and ticket management
- ✅ Scheduled messages
- ✅ Escalation system
- ✅ OAuth 2.0 authentication
- ✅ RFC 2822 compliant headers
- ✅ Base64URL encoding
- ✅ Fetching original message metadata from Gmail API

### What Doesn't Work
- ❌ Email threading when sending to external providers (Proton, Outlook, etc.)

### Root Cause
- Gmail API's `threadId` parameter works for Gmail-to-Gmail threading
- External email providers don't recognize Gmail's internal `threadId`
- Gmail API may not properly preserve RFC 2822 threading headers for external recipients

### Next Steps
1. Implement SMTP sending (MailChannels recommended)
2. Keep Gmail API for receiving emails (works perfectly)
3. Test threading with SMTP implementation
4. Verify threading works across all email providers

---

## 🔗 References

- [RFC 2822 - Internet Message Format](https://www.rfc-editor.org/rfc/rfc2822)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [MailChannels for Cloudflare Workers](https://mailchannels.zendesk.com/hc/en-us/articles/4565898358413-Sending-Email-from-Cloudflare-Workers-using-MailChannels-Send-API)
- [Email Threading Best Practices](https://www.jwz.org/doc/threading.html)

---

**Document Version**: 1.0  
**Date**: November 30, 2025  
**Author**: Development Team  
**Status**: Ready for Second Opinion

