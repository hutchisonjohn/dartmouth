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
    metadata?: Record<string, any>;
  }): Promise<Ticket> {
    const ticketId = this.generateTicketId();
    const ticketNumber = await this.generateTicketNumber();
    const now = new Date().toISOString();

    // Detect priority
    const priority = this.detectPriority(message.content, options?.isVIP || false);

    // Detect category
    const category = this.detectCategory(message.content);

    // Calculate SLA
    const slaDueAt = new Date(Date.now() + this.slaConfig.firstResponse[priority]).toISOString();

    const subject = options?.subject || this.generateSubject(message.content, category);

    try {
      // Insert ticket
      await this.db.prepare(`
        INSERT INTO tickets (
          ticket_id, ticket_number, customer_id, customer_email, customer_name,
          subject, description, status, priority, category, channel, sla_due_at,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        ticketId,
        ticketNumber,
        message.customerId,
        message.customerEmail,
        message.customerName,
        subject,
        message.content,
        'open',
        priority,
        category,
        message.channelType,
        slaDueAt,
        now,
        now
      ).run();

      // Insert first message
      await this.addMessage(ticketId, {
        sender_type: 'customer',
        sender_id: message.customerId,
        sender_name: message.customerName,
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
   */
  async assignTicket(ticketId: string, assignedTo: string, assignedBy: string): Promise<boolean> {
    try {
      await this.db.prepare(`
        UPDATE tickets SET assigned_to = ?, updated_at = ? WHERE ticket_id = ?
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
          message_id, ticket_id, sender_type, sender_id, sender_name, content, created_at
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

    return 'medium';
  }

  /**
   * Detect category from content
   */
  private detectCategory(content: string): TicketCategory {
    const lowerContent = content.toLowerCase();

    if (lowerContent.match(/order|status|tracking|where is|shipped/)) {
      return 'order_status';
    }
    if (lowerContent.match(/artwork|design|file|dpi|resolution|image/)) {
      return 'artwork_issue';
    }
    if (lowerContent.match(/payment|charge|refund|invoice|credit card/)) {
      return 'payment';
    }
    if (lowerContent.match(/shipping|delivery|address|carrier/)) {
      return 'shipping';
    }
    if (lowerContent.match(/product|item|what|how much|price|available/)) {
      return 'product_inquiry';
    }
    if (lowerContent.match(/complaint|unhappy|disappointed|terrible|awful/)) {
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
}
