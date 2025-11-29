/**
 * Ticket Manager
 * 
 * Manages customer service tickets with D1 database persistence.
 * 
 * Features:
 * - Create/update/delete tickets
 * - Assign tickets to staff
 * - Track SLA compliance
 * - Add messages and internal notes
 * - Escalate tickets
 * - Priority/category detection
 * 
 * Created: Nov 28, 2025
 * Updated: Nov 28, 2025 - D1 integration
 */

import type { D1Database } from '@cloudflare/workers-types';
import type { NormalizedMessage } from './OmnichannelRouter';

export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed' | 'escalated';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 
  | 'order_status'
  | 'artwork_issue'
  | 'payment'
  | 'shipping'
  | 'product_inquiry'
  | 'complaint'
  | 'other';

export interface Ticket {
  ticket_id: string;
  ticket_number: string;
  customer_id: string;
  customer_email: string;
  customer_name: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  channel: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
  sla_due_at?: string;
}

export interface TicketMessage {
  message_id: string;
  ticket_id: string;
  sender_type: 'customer' | 'agent' | 'system';
  sender_id?: string;
  sender_name: string;
  content: string;
  created_at: string;
}

export interface InternalNote {
  note_id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

/**
 * Ticket Manager
 */
export class TicketManager {
  private db: D1Database;

  // SLA times (in milliseconds)
  private slaConfig = {
    firstResponse: {
      urgent: 15 * 60 * 1000,  // 15 minutes
      high: 1 * 60 * 60 * 1000,  // 1 hour
      medium: 4 * 60 * 60 * 1000,  // 4 hours
      low: 24 * 60 * 60 * 1000   // 24 hours
    },
    resolution: {
      urgent: 4 * 60 * 60 * 1000,   // 4 hours
      high: 24 * 60 * 60 * 1000,      // 24 hours
      medium: 72 * 60 * 60 * 1000,    // 72 hours
      low: 168 * 60 * 60 * 1000       // 7 days
    }
  };

  constructor(db: D1Database) {
    this.db = db;
    console.log('[TicketManager] Initialized with D1 database');
  }

  /**
   * Create a new ticket
   */
  async createTicket(message: NormalizedMessage, options?: {
    subject?: string;
    isVIP?: boolean;
    priority?: TicketPriority;
    category?: TicketCategory;
    metadata?: Record<string, any>;
  }): Promise<Ticket> {
    const ticketId = this.generateTicketId();
    const ticketNumber = await this.generateTicketNumber();
    const now = new Date().toISOString();

    // Detect priority (use provided or auto-detect)
    const priority = options?.priority || this.detectPriority(message.content, options?.isVIP || false);

    // Detect category (use provided or auto-detect)
    const category = options?.category || this.detectCategory(message.content);

    // Calculate SLA - with error handling
    let slaDueAt: string;
    try {
      const slaTime = this.slaConfig.firstResponse[priority as keyof typeof this.slaConfig.firstResponse];
      if (!slaTime) {
        // Default to medium if priority not found
        slaDueAt = new Date(Date.now() + this.slaConfig.firstResponse.medium).toISOString();
      } else {
        slaDueAt = new Date(Date.now() + slaTime).toISOString();
      }
    } catch (error) {
      // Fallback to 4 hours from now
      slaDueAt = new Date(Date.now() + (4 * 60 * 60 * 1000)).toISOString();
    }

    const subject = options?.subject || this.generateSubject(message.content, category);

    try {
      // Insert ticket
      await this.db.prepare(`
        INSERT INTO tickets (
          ticket_id, ticket_number, customer_id, customer_email, customer_name,
          subject, description, status, priority, category, channel, sentiment, sla_due_at,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        ticketId,
        ticketNumber,
        message.customerId,
        message.customerEmail || null,
        message.customerName || null,
        subject,
        message.content,
        'open',
        priority,
        category,
        message.channelType,
        message.metadata?.sentiment || 'neutral',
        slaDueAt,
        now,
        now
      ).run();

      // Insert first message
      await this.addMessage(ticketId, {
        sender_type: 'customer',
        sender_id: message.customerId,
        sender_name: message.customerName || message.customerId,
        content: message.content
      });

      console.log(`[TicketManager] ✅ Ticket created: ${ticketNumber}`);

      return await this.getTicket(ticketId) as Ticket;
    } catch (error) {
      console.error('[TicketManager] ❌ Error creating ticket:', error);
      throw error;
    }
  }

  /**
   * Get ticket by ID
   */
  async getTicket(ticketId: string): Promise<Ticket | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM tickets WHERE ticket_id = ?
      `).bind(ticketId).first();

      return result as Ticket | null;
    } catch (error) {
      console.error('[TicketManager] ❌ Error fetching ticket:', error);
      return null;
    }
  }

  /**
   * Update ticket
   */
  async updateTicket(ticketId: string, updates: Partial<Ticket>): Promise<boolean> {
    try {
      const sets: string[] = [];
      const values: any[] = [];

      // Business rule: If status is being set to 'open', unassign the ticket
      if (updates.status === 'open') {
        updates.assigned_to = null;
      }

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'ticket_id') {
          sets.push(`${key} = ?`);
          values.push(value);
        }
      });

      if (sets.length === 0) return false;

      sets.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(ticketId);

      await this.db.prepare(`
        UPDATE tickets SET ${sets.join(', ')} WHERE ticket_id = ?
      `).bind(...values).run();

      console.log(`[TicketManager] ✅ Ticket updated: ${ticketId}`);
      return true;
    } catch (error) {
      console.error('[TicketManager] ❌ Error updating ticket:', error);
      return false;
    }
  }

  /**
   * Assign ticket to staff
   * Business rule: Assigned tickets must be in-progress status
   */
  async assignTicket(ticketId: string, assignedTo: string, assignedBy: string): Promise<boolean> {
    try {
      // When assigning a ticket, automatically set status to in-progress
      await this.db.prepare(`
        UPDATE tickets SET assigned_to = ?, status = 'in-progress', updated_at = ? WHERE ticket_id = ?
      `).bind(assignedTo, new Date().toISOString(), ticketId).run();

      await this.db.prepare(`
        INSERT INTO ticket_assignments (
          assignment_id, ticket_id, assigned_to, assigned_by, assigned_at
        ) VALUES (?, ?, ?, ?, ?)
      `).bind(
        this.generateId(),
        ticketId,
        assignedTo,
        assignedBy,
        new Date().toISOString()
      ).run();

      console.log(`[TicketManager] ✅ Ticket assigned: ${ticketId} → ${assignedTo}`);
      return true;
    } catch (error) {
      console.error('[TicketManager] ❌ Error assigning ticket:', error);
      return false;
    }
  }

  /**
   * Add message to ticket
   */
  async addMessage(ticketId: string, message: {
    sender_type: 'customer' | 'agent' | 'system';
    sender_id?: string;
    sender_name: string;
    content: string;
  }): Promise<boolean> {
    try {
      await this.db.prepare(`
        INSERT INTO ticket_messages (
          id, ticket_id, sender_type, sender_id, sender_name, content, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        this.generateId(),
        ticketId,
        message.sender_type,
        message.sender_id || null,
        message.sender_name,
        message.content,
        new Date().toISOString()
      ).run();

      // Update ticket timestamp
      await this.db.prepare(`
        UPDATE tickets SET updated_at = ? WHERE ticket_id = ?
      `).bind(new Date().toISOString(), ticketId).run();

      return true;
    } catch (error) {
      console.error('[TicketManager] ❌ Error adding message:', error);
      return false;
    }
  }

  /**
   * Add internal note
   */
  async addInternalNote(ticketId: string, userId: string, content: string): Promise<boolean> {
    try {
      await this.db.prepare(`
        INSERT INTO internal_notes (note_id, ticket_id, user_id, content, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        this.generateId(),
        ticketId,
        userId,
        content,
        new Date().toISOString()
      ).run();

      console.log(`[TicketManager] ✅ Internal note added to ticket: ${ticketId}`);
      return true;
    } catch (error) {
      console.error('[TicketManager] ❌ Error adding internal note:', error);
      return false;
    }
  }

  /**
   * Escalate ticket
   */
  async escalateTicket(ticketId: string, escalatedBy: string, escalatedTo: string, reason: string): Promise<boolean> {
    try {
      await this.db.prepare(`
        UPDATE tickets SET status = 'escalated', updated_at = ? WHERE ticket_id = ?
      `).bind(new Date().toISOString(), ticketId).run();

      await this.db.prepare(`
        INSERT INTO escalations (
          escalation_id, ticket_id, escalated_by, escalated_to, reason, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        this.generateId(),
        ticketId,
        escalatedBy,
        escalatedTo,
        reason,
        new Date().toISOString()
      ).run();

      console.log(`[TicketManager] ✅ Ticket escalated: ${ticketId}`);
      return true;
    } catch (error) {
      console.error('[TicketManager] ❌ Error escalating ticket:', error);
      return false;
    }
  }

  /**
   * Get tickets by status
   */
  async getTicketsByStatus(status: TicketStatus, limit: number = 50): Promise<Ticket[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM tickets WHERE status = ? ORDER BY created_at DESC LIMIT ?
      `).bind(status, limit).all();

      return result.results as Ticket[];
    } catch (error) {
      console.error('[TicketManager] ❌ Error fetching tickets by status:', error);
      return [];
    }
  }

  /**
   * Get tickets for customer
   */
  async getCustomerTickets(customerId: string, limit: number = 50): Promise<Ticket[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM tickets WHERE customer_id = ? ORDER BY created_at DESC LIMIT ?
      `).bind(customerId, limit).all();

      return result.results as Ticket[];
    } catch (error) {
      console.error('[TicketManager] ❌ Error fetching customer tickets:', error);
      return [];
    }
  }

  /**
   * Get tickets assigned to staff
   */
  async getStaffTickets(staffId: string, limit: number = 50): Promise<Ticket[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM tickets WHERE assigned_to = ? ORDER BY created_at DESC LIMIT ?
      `).bind(staffId, limit).all();

      return result.results as Ticket[];
    } catch (error) {
      console.error('[TicketManager] ❌ Error fetching staff tickets:', error);
      return [];
    }
  }

  /**
   * Detect priority from content and VIP status
   */
  private detectPriority(content: string, isVIP: boolean): TicketPriority {
    const lowerContent = content.toLowerCase();

    // Urgent keywords
    if (lowerContent.match(/urgent|emergency|asap|immediately|critical/)) {
      return 'urgent';
    }

    // High priority for VIP or important keywords
    if (isVIP || lowerContent.match(/important|soon|deadline|problem|issue/)) {
      return 'high';
    }

    // Low priority keywords
    if (lowerContent.match(/question|wondering|curious|when you can/)) {
      return 'low';
    }

    return 'normal';
  }

  /**
   * Detect category from content
   */
  private detectCategory(content: string): TicketCategory {
    const lowerContent = content.toLowerCase();

    // Order status - check for order-related keywords
    if (lowerContent.match(/\b(order|tracking|where\s+is|shipped|delivery\s+status|order\s+status)\b/i)) {
      return 'order_status';
    }
    // Artwork issues
    if (lowerContent.match(/\b(artwork|design|file|dpi|resolution|image|graphic)\b/i)) {
      return 'artwork_issue';
    }
    // Payment issues
    if (lowerContent.match(/\b(payment|charge|refund|invoice|credit\s+card|billing)\b/i)) {
      return 'payment';
    }
    // Shipping issues
    if (lowerContent.match(/\b(shipping|delivery|address|carrier|fedex|ups|usps)\b/i)) {
      return 'shipping';
    }
    // Product inquiries
    if (lowerContent.match(/\b(product|item|price|cost|available|stock|inventory)\b/i)) {
      return 'product_inquiry';
    }
    // Complaints
    if (lowerContent.match(/\b(complaint|unhappy|disappointed|terrible|awful|angry|frustrated)\b/i)) {
      return 'complaint';
    }

    return 'other';
  }

  /**
   * Generate subject from content
   */
  private generateSubject(content: string, category: TicketCategory): string {
    const categoryNames: Record<TicketCategory, string> = {
      order_status: 'Order Status Inquiry',
      artwork_issue: 'Artwork Issue',
      payment: 'Payment Question',
      shipping: 'Shipping Question',
      product_inquiry: 'Product Inquiry',
      complaint: 'Customer Complaint',
      other: 'Customer Inquiry'
    };

    // Try to extract first sentence
    const firstSentence = content.split(/[.!?]/)[0].trim();
    if (firstSentence.length > 10 && firstSentence.length < 100) {
      return firstSentence;
    }

    return categoryNames[category];
  }

  /**
   * Generate ticket ID
   */
  private generateTicketId(): string {
    return `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }

  /**
   * Generate ticket number
   */
  private async generateTicketNumber(): Promise<string> {
    try {
      const result = await this.db.prepare(`
        SELECT COUNT(*) as count FROM tickets
      `).first();

      const count = (result?.count as number) || 0;
      return `TKT-${(count + 1).toString().padStart(6, '0')}`;
    } catch (error) {
      return `TKT-${Date.now()}`;
    }
  }

  /**
   * Generate generic ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }

  // ==========================================================================
  // EMAIL-TO-TICKET FUNCTIONALITY
  // ==========================================================================

  /**
   * Create ticket from email
   * Uses transaction to ensure atomicity (ticket + email link)
   */
  async createTicketFromEmail(email: {
    id: string;
    gmailThreadId: string;
    from: { email: string; name: string | null };
    subject: string;
    bodyText: string;
  }): Promise<Ticket & { isNew: boolean }> {
    console.log(`[TicketManager] Creating ticket from email: ${email.subject}`);

    // 1. Check if ticket already exists for this thread
    const existingTicket = await this.findTicketByEmailThread(email.gmailThreadId);
    if (existingTicket) {
      console.log(`[TicketManager] Ticket already exists for thread: ${existingTicket.ticket_number}`);
      // Link email to existing ticket
      await this.linkEmailToTicket(email.id, existingTicket.ticket_id);
      return { ...existingTicket, isNew: false };
    }

    // 2. Check for duplicate content from same customer (within last 24 hours)
    const duplicateTicket = await this.findDuplicateTicket(email.from.email, email.subject, email.bodyText);
    if (duplicateTicket) {
      console.log(`[TicketManager] Duplicate ticket detected: ${duplicateTicket.ticket_number} (same content from same customer)`);
      // Link email to existing ticket and add as follow-up message
      await this.linkEmailToTicket(email.id, duplicateTicket.ticket_id);
      await this.addMessage(duplicateTicket.ticket_id, {
        sender_type: 'customer',
        sender_id: email.from.email,
        sender_name: email.from.name || email.from.email,
        content: `[Follow-up] ${email.bodyText}`
      });
      console.log(`[TicketManager] Added as follow-up message to existing ticket`);
      return { ...duplicateTicket, isNew: false };
    }

    // 2. Auto-detect priority
    const priority = this.detectPriorityFromEmail(email.subject, email.bodyText);

    // 3. Auto-categorize
    const category = this.detectCategoryFromEmail(email.subject, email.bodyText);

    // 4. Detect sentiment
    const sentiment = this.detectSentimentFromEmail(email.subject, email.bodyText);

    // 5. Create normalized message
    const normalizedMessage: NormalizedMessage = {
      id: email.id,
      channelType: 'email',
      direction: 'inbound',
      customerId: email.from.email,
      customerName: email.from.name || email.from.email,
      customerEmail: email.from.email,
      content: email.bodyText,
      timestamp: new Date().toISOString(),
      conversationId: email.gmailThreadId,
      metadata: {
        subject: email.subject,
        sentiment,
      },
    };

    // 6. Create ticket (this already inserts into DB)
    const ticket = await this.createTicket(normalizedMessage, {
      subject: email.subject,
      priority,
      category,
    });

    // 7. Link email to ticket (atomic operation via D1 batch)
    try {
      await this.linkEmailToTicket(email.id, ticket.ticket_id);
    } catch (error) {
      // If linking fails, log error but don't fail ticket creation
      // (ticket is already created, email link can be retried)
      console.error(`[TicketManager] ⚠️ Failed to link email to ticket:`, error);
    }

    console.log(`[TicketManager] ✅ Ticket created: ${ticket.ticket_number}`);
    return { ...ticket, isNew: true };
  }

  /**
   * Find duplicate ticket by content similarity
   * Checks for tickets from same customer with same/similar subject within last 24 hours
   */
  private async findDuplicateTicket(customerEmail: string, subject: string, bodyText: string): Promise<Ticket | null> {
    try {
      // Get recent open tickets from this customer (last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { results } = await this.db
        .prepare(
          `SELECT * FROM tickets 
           WHERE customer_email = ? 
           AND status IN ('open', 'in_progress', 'pending')
           AND created_at > ?
           ORDER BY created_at DESC
           LIMIT 10`
        )
        .bind(customerEmail, twentyFourHoursAgo)
        .all();

      if (!results || results.length === 0) {
        return null;
      }

      // Check for exact subject match or very similar content
      const normalizedSubject = subject.toLowerCase().trim();
      const normalizedBody = bodyText.toLowerCase().trim().substring(0, 200); // First 200 chars

      for (const ticket of results as Ticket[]) {
        const ticketSubject = (ticket.subject || '').toLowerCase().trim();
        const ticketDescription = (ticket.description || '').toLowerCase().trim().substring(0, 200);

        // Exact subject match
        if (ticketSubject === normalizedSubject) {
          console.log(`[TicketManager] Found duplicate: exact subject match`);
          return ticket;
        }

        // Very similar content (first 200 chars match)
        if (normalizedBody.length > 50 && ticketDescription === normalizedBody) {
          console.log(`[TicketManager] Found duplicate: content match`);
          return ticket;
        }
      }

      return null;
    } catch (error) {
      console.error('[TicketManager] Error finding duplicate ticket:', error);
      return null;
    }
  }

  /**
   * Find ticket by email thread ID
   */
  private async findTicketByEmailThread(gmailThreadId: string): Promise<Ticket | null> {
    try {
      const { results } = await this.db
        .prepare(
          `
        SELECT t.* FROM tickets t
        INNER JOIN ticket_email_links tel ON tel.ticket_id = t.ticket_id
        INNER JOIN emails e ON e.id = tel.email_id
        WHERE e.gmail_thread_id = ?
        LIMIT 1
      `
        )
        .bind(gmailThreadId)
        .all();

      if (results.length === 0) return null;
      return results[0] as Ticket;
    } catch (error) {
      console.error('[TicketManager] Error finding ticket by email thread:', error);
      return null;
    }
  }

  /**
   * Link email to ticket
   */
  private async linkEmailToTicket(emailId: string, ticketId: string): Promise<void> {
    try {
      await this.db
        .prepare(`INSERT OR IGNORE INTO ticket_email_links (ticket_id, email_id) VALUES (?, ?)`)
        .bind(ticketId, emailId)
        .run();
      console.log(`[TicketManager] Linked email ${emailId} to ticket ${ticketId}`);
    } catch (error) {
      console.error('[TicketManager] Error linking email to ticket:', error);
      throw error;
    }
  }

  /**
   * Detect priority from email content
   */
  private detectPriorityFromEmail(subject: string, body: string): TicketPriority {
    const text = `${subject} ${body}`.toLowerCase();

    // Urgent keywords
    if (
      text.includes('urgent') ||
      text.includes('asap') ||
      text.includes('emergency') ||
      text.includes('immediately') ||
      text.includes('critical') ||
      text.includes('!!!') ||
      text.includes('right now')
    ) {
      return 'urgent';
    }

    // High priority keywords
    if (
      text.includes('important') ||
      text.includes('priority') ||
      text.includes('soon') ||
      text.includes('quickly') ||
      text.includes('need help') ||
      text.includes('problem')
    ) {
      return 'high';
    }

    // Low priority keywords
    if (
      text.includes('when you can') ||
      text.includes('no rush') ||
      text.includes('whenever') ||
      text.includes('question') ||
      text.includes('curious')
    ) {
      return 'low';
    }

    return 'normal';
  }

  /**
   * Detect category from email content
   */
  private detectCategoryFromEmail(subject: string, body: string): TicketCategory {
    const text = `${subject} ${body}`.toLowerCase();

    // Order status
    if (
      text.match(/order\s*#?\d+/) ||
      text.match(/perp-\d+/) ||
      text.includes('where is my order') ||
      text.includes('track my order') ||
      text.includes('order status')
    ) {
      return 'order_status';
    }

    // Artwork issue
    if (
      text.includes('artwork') ||
      text.includes('design') ||
      text.includes('proof') ||
      text.includes('file') ||
      text.includes('image')
    ) {
      return 'artwork_issue';
    }

    // Payment
    if (
      text.includes('payment') ||
      text.includes('invoice') ||
      text.includes('receipt') ||
      text.includes('charge') ||
      text.includes('refund')
    ) {
      return 'payment';
    }

    // Shipping
    if (
      text.includes('shipping') ||
      text.includes('delivery') ||
      text.includes('tracking') ||
      text.includes('courier')
    ) {
      return 'shipping';
    }

    // Product inquiry
    if (
      text.includes('product') ||
      text.includes('price') ||
      text.includes('quote') ||
      text.includes('how much') ||
      text.includes('cost')
    ) {
      return 'product_inquiry';
    }

    // Complaint
    if (
      text.includes('complaint') ||
      text.includes('unhappy') ||
      text.includes('disappointed') ||
      text.includes('terrible') ||
      text.includes('worst') ||
      text.includes('angry')
    ) {
      return 'complaint';
    }

    return 'other';
  }

  /**
   * Detect sentiment from email content
   */
  private detectSentimentFromEmail(subject: string, body: string): string {
    const text = `${subject} ${body}`.toLowerCase();

    // Angry sentiment
    const angryKeywords = [
      'unacceptable',
      'terrible',
      'worst',
      'horrible',
      'angry',
      'furious',
      'ridiculous',
      'disgusting',
      'pathetic',
      'incompetent',
      'useless',
    ];
    if (angryKeywords.some((kw) => text.includes(kw)) || text.includes('!!!')) {
      return 'angry';
    }

    // Negative sentiment
    const negativeKeywords = [
      'disappointed',
      'unhappy',
      'frustrated',
      'problem',
      'issue',
      'concern',
      'complaint',
      'not happy',
      'not satisfied',
    ];
    if (negativeKeywords.some((kw) => text.includes(kw))) {
      return 'negative';
    }

    // Positive sentiment
    const positiveKeywords = [
      'thank',
      'great',
      'excellent',
      'perfect',
      'love',
      'happy',
      'satisfied',
      'appreciate',
      'wonderful',
      'amazing',
    ];
    if (positiveKeywords.some((kw) => text.includes(kw))) {
      return 'positive';
    }

    return 'neutral';
  }

  // ==========================================================================
  // SNOOZE FUNCTIONALITY
  // ==========================================================================

  /**
   * Snooze a ticket until a specific time
   */
  async snoozeTicket(
    ticketId: string,
    snoozedUntil: string,
    snoozedBy: string,
    reason?: string
  ): Promise<void> {
    console.log(`[TicketManager] Snoozing ticket ${ticketId} until ${snoozedUntil}`);

    await this.db
      .prepare(
        `
      UPDATE tickets
      SET 
        status = 'pending',
        is_snoozed = TRUE,
        snoozed_until = ?,
        snoozed_by = ?,
        snooze_reason = ?,
        updated_at = ?
      WHERE ticket_id = ?
    `
      )
      .bind(snoozedUntil, snoozedBy, reason, new Date().toISOString(), ticketId)
      .run();

    console.log(`[TicketManager] ✅ Ticket snoozed`);
  }

  /**
   * Unsnooze a ticket
   */
  async unsnoozeTicket(ticketId: string): Promise<void> {
    console.log(`[TicketManager] Unsnoozing ticket ${ticketId}`);

    await this.db
      .prepare(
        `
      UPDATE tickets
      SET 
        status = 'open',
        is_snoozed = FALSE,
        snoozed_until = NULL,
        updated_at = ?
      WHERE ticket_id = ?
    `
      )
      .bind(new Date().toISOString(), ticketId)
      .run();

    console.log(`[TicketManager] ✅ Ticket unsnoozed`);
  }

  /**
   * Get all snoozed tickets that are ready to be unsnoozed
   */
  async getSnoozedTicketsDue(): Promise<Ticket[]> {
    const now = new Date().toISOString();
    const { results } = await this.db
      .prepare(
        `
      SELECT * FROM tickets
      WHERE is_snoozed = TRUE AND snoozed_until <= ?
    `
      )
      .bind(now)
      .all();

    return results as Ticket[];
  }
}
