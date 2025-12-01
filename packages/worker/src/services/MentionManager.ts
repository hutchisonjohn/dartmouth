import type { D1Database } from '@cloudflare/workers-types';

/**
 * Mention Manager
 * 
 * Manages @mentions in tickets for staff collaboration.
 * 
 * Features:
 * - Create mentions
 * - Get mentions for staff
 * - Add thread replies
 * - Mark as read
 * - Notification creation
 * 
 * Created: Nov 28, 2025
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type MentionPriority = 'normal' | 'high' | 'critical';
export type MentionType = 'ticket' | 'order' | 'project';

export interface Mention {
  id: string;
  ticket_id: string;
  from_staff_id: string;
  to_staff_id: string;
  message: string;
  priority: MentionPriority;
  type: MentionType;
  is_read: boolean;
  created_at: string;
}

export interface CreateMentionData {
  ticketId: string;
  fromStaffId: string;
  toStaffId: string;
  message: string;
  priority?: MentionPriority;
  type?: MentionType;
}

export interface ThreadReply {
  id: string;
  mention_id: string;
  staff_id: string;
  message: string;
  created_at: string;
}

// ============================================================================
// MENTION MANAGER
// ============================================================================

export class MentionManager {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
    console.log('[MentionManager] Initialized with D1 database');
  }

  // ==========================================================================
  // MENTION CRUD
  // ==========================================================================

  /**
   * Create a new mention
   */
  async createMention(data: CreateMentionData): Promise<Mention> {
    console.log(`[MentionManager] Creating mention from ${data.fromStaffId} to ${data.toStaffId}`);

    // Validation: Prevent self-mentions
    if (data.fromStaffId === data.toStaffId) {
      throw new Error('Cannot mention yourself');
    }

    // Validation: Check if from staff exists
    const fromStaffExists = await this.staffExists(data.fromStaffId);
    if (!fromStaffExists) {
      throw new Error(`Staff not found: ${data.fromStaffId}`);
    }

    // Validation: Check if to staff exists
    const toStaffExists = await this.staffExists(data.toStaffId);
    if (!toStaffExists) {
      throw new Error(`Staff not found: ${data.toStaffId}`);
    }

    // Validation: Check if ticket exists
    const ticketExists = await this.ticketExists(data.ticketId);
    if (!ticketExists) {
      throw new Error(`Ticket not found: ${data.ticketId}`);
    }

    const mentionId = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.db
      .prepare(
        `
      INSERT INTO staff_mentions (
        id, ticket_id, from_staff_id, to_staff_id, message,
        priority, type, is_read, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .bind(
        mentionId,
        data.ticketId,
        data.fromStaffId,
        data.toStaffId,
        data.message,
        data.priority || 'normal',
        data.type || 'ticket',
        false,
        now
      )
      .run();

    console.log(`[MentionManager] ✅ Mention created: ${mentionId}`);

    return this.getMention(mentionId);
  }

  /**
   * Check if staff exists
   */
  private async staffExists(staffId: string): Promise<boolean> {
    try {
      const { results } = await this.db
        .prepare(`SELECT id FROM staff_users WHERE id = ? LIMIT 1`)
        .bind(staffId)
        .all();
      return results.length > 0;
    } catch (error) {
      console.error('[MentionManager] Error checking staff existence:', error);
      return false;
    }
  }

  /**
   * Check if ticket exists
   */
  private async ticketExists(ticketId: string): Promise<boolean> {
    try {
      const { results } = await this.db
        .prepare(`SELECT ticket_id FROM tickets WHERE ticket_id = ? LIMIT 1`)
        .bind(ticketId)
        .all();
      return results.length > 0;
    } catch (error) {
      console.error('[MentionManager] Error checking ticket existence:', error);
      return false;
    }
  }

  /**
   * Get a mention by ID
   */
  async getMention(mentionId: string): Promise<Mention> {
    const { results } = await this.db
      .prepare(`SELECT * FROM staff_mentions WHERE id = ? LIMIT 1`)
      .bind(mentionId)
      .all();

    if (results.length === 0) {
      throw new Error(`Mention not found: ${mentionId}`);
    }

    return results[0] as Mention;
  }

  /**
   * Get all mentions for a staff member
   */
  async getMentionsForStaff(staffId: string, unreadOnly: boolean = false): Promise<Mention[]> {
    const query = unreadOnly
      ? `SELECT * FROM staff_mentions WHERE to_staff_id = ? AND is_read = FALSE ORDER BY created_at DESC`
      : `SELECT * FROM staff_mentions WHERE to_staff_id = ? ORDER BY created_at DESC`;

    const { results } = await this.db.prepare(query).bind(staffId).all();

    return results as Mention[];
  }

  /**
   * Get mentions for a specific ticket
   */
  async getMentionsForTicket(ticketId: string): Promise<Mention[]> {
    const { results } = await this.db
      .prepare(`SELECT * FROM staff_mentions WHERE ticket_id = ? ORDER BY created_at DESC`)
      .bind(ticketId)
      .all();

    return results as Mention[];
  }

  /**
   * Mark mention as read
   */
  async markAsRead(mentionId: string): Promise<void> {
    console.log(`[MentionManager] Marking mention ${mentionId} as read`);

    await this.db
      .prepare(`UPDATE staff_mentions SET is_read = TRUE WHERE id = ?`)
      .bind(mentionId)
      .run();

    console.log(`[MentionManager] ✅ Mention marked as read`);
  }

  /**
   * Mark all mentions as read for a staff member
   */
  async markAllAsRead(staffId: string): Promise<void> {
    console.log(`[MentionManager] Marking all mentions as read for ${staffId}`);

    await this.db
      .prepare(`UPDATE staff_mentions SET is_read = TRUE WHERE to_staff_id = ?`)
      .bind(staffId)
      .run();

    console.log(`[MentionManager] ✅ All mentions marked as read`);
  }

  /**
   * Delete a mention
   */
  async deleteMention(mentionId: string): Promise<void> {
    console.log(`[MentionManager] Deleting mention ${mentionId}`);

    await this.db.prepare(`DELETE FROM staff_mentions WHERE id = ?`).bind(mentionId).run();

    console.log(`[MentionManager] ✅ Mention deleted`);
  }

  // ==========================================================================
  // THREAD REPLIES
  // ==========================================================================

  /**
   * Add a reply to a mention thread
   */
  async addThreadReply(mentionId: string, staffId: string, message: string): Promise<ThreadReply> {
    console.log(`[MentionManager] Adding thread reply to mention ${mentionId}`);

    const threadId = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.db
      .prepare(
        `
      INSERT INTO mention_threads (id, mention_id, staff_id, message, created_at)
      VALUES (?, ?, ?, ?, ?)
    `
      )
      .bind(threadId, mentionId, staffId, message, now)
      .run();

    console.log(`[MentionManager] ✅ Thread reply added: ${threadId}`);

    return {
      id: threadId,
      mention_id: mentionId,
      staff_id: staffId,
      message,
      created_at: now,
    };
  }

  /**
   * Get all thread replies for a mention
   */
  async getThreadReplies(mentionId: string): Promise<ThreadReply[]> {
    const { results } = await this.db
      .prepare(`SELECT * FROM mention_threads WHERE mention_id = ? ORDER BY created_at ASC`)
      .bind(mentionId)
      .all();

    return results as ThreadReply[];
  }

  /**
   * Delete a thread reply
   */
  async deleteThreadReply(threadId: string): Promise<void> {
    console.log(`[MentionManager] Deleting thread reply ${threadId}`);

    await this.db.prepare(`DELETE FROM mention_threads WHERE id = ?`).bind(threadId).run();

    console.log(`[MentionManager] ✅ Thread reply deleted`);
  }

  // ==========================================================================
  // MENTION DETECTION
  // ==========================================================================

  /**
   * Detect @mentions in a message
   * Returns array of staff IDs mentioned
   */
  detectMentions(message: string): string[] {
    // Match @username or @"First Last"
    const mentionRegex = /@(?:"([^"]+)"|(\w+))/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(message)) !== null) {
      const mention = match[1] || match[2];
      mentions.push(mention);
    }

    return mentions;
  }

  /**
   * Create mentions from a message
   * Detects @mentions and creates mention records
   */
  async createMentionsFromMessage(
    message: string,
    ticketId: string,
    fromStaffId: string,
    priority: MentionPriority = 'normal',
    type: MentionType = 'ticket'
  ): Promise<Mention[]> {
    const mentionedUsernames = this.detectMentions(message);

    if (mentionedUsernames.length === 0) {
      return [];
    }

    console.log(`[MentionManager] Detected ${mentionedUsernames.length} mentions in message`);

    // Get staff IDs from usernames
    const staffIds = await this.getStaffIdsByUsernames(mentionedUsernames);

    // Create mention for each staff member
    const mentions: Mention[] = [];
    for (const toStaffId of staffIds) {
      const mention = await this.createMention({
        ticketId,
        fromStaffId,
        toStaffId,
        message,
        priority,
        type,
      });
      mentions.push(mention);
    }

    console.log(`[MentionManager] ✅ Created ${mentions.length} mentions`);
    return mentions;
  }

  /**
   * Get staff IDs from usernames
   */
  private async getStaffIdsByUsernames(usernames: string[]): Promise<string[]> {
    if (usernames.length === 0) return [];

    // Build query with placeholders
    const placeholders = usernames.map(() => '?').join(',');
    const query = `
      SELECT id FROM staff_users
      WHERE email IN (${placeholders})
      OR first_name IN (${placeholders})
      OR last_name IN (${placeholders})
    `;

    const { results } = await this.db
      .prepare(query)
      .bind(...usernames, ...usernames, ...usernames)
      .all();

    return results.map((row: any) => row.id);
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get unread mention count for a staff member
   */
  async getUnreadCount(staffId: string): Promise<number> {
    const { results } = await this.db
      .prepare(
        `
      SELECT COUNT(*) as count FROM staff_mentions
      WHERE to_staff_id = ? AND is_read = FALSE
    `
      )
      .bind(staffId)
      .all();

    return (results[0] as any)?.count || 0;
  }

  /**
   * Get mention statistics for a staff member
   */
  async getMentionStats(staffId: string): Promise<{
    total: number;
    unread: number;
    byPriority: Record<MentionPriority, number>;
    byType: Record<MentionType, number>;
  }> {
    const mentions = await this.getMentionsForStaff(staffId);

    const stats = {
      total: mentions.length,
      unread: mentions.filter((m) => !m.is_read).length,
      byPriority: {
        normal: mentions.filter((m) => m.priority === 'normal').length,
        high: mentions.filter((m) => m.priority === 'high').length,
        critical: mentions.filter((m) => m.priority === 'critical').length,
      },
      byType: {
        ticket: mentions.filter((m) => m.type === 'ticket').length,
        order: mentions.filter((m) => m.type === 'order').length,
        project: mentions.filter((m) => m.type === 'project').length,
      },
    };

    return stats;
  }
}

