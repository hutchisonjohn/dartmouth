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
      id: messageId, // Use Gmail message ID as the unique ID (not crypto.randomUUID())
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

