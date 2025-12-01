/**
 * Internal Communication System
 * 
 * Staff messaging with channels, threads, mentions, and notifications using D1.
 * 
 * Features:
 * - Group channels (public/private/direct)
 * - Threaded conversations
 * - @mentions
 * - Real-time notifications
 * - Read/unread tracking
 * 
 * Created: Nov 28, 2025
 * Updated: Nov 28, 2025 - D1 integration
 */

import type { D1Database } from '@cloudflare/workers-types';

export type ChannelType = 'public' | 'private' | 'direct';
export type MemberRole = 'owner' | 'admin' | 'member';

export interface Channel {
  channel_id: string;
  channel_name?: string;
  channel_type: ChannelType;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
}

export interface ChannelMessage {
  message_id: string;
  channel_id: string;
  user_id: string;
  content: string;
  parent_message_id?: string;
  created_at: string;
  updated_at: string;
  deleted: boolean;
}

export interface Thread {
  thread_id: string;
  channel_id: string;
  parent_message_id: string;
  created_at: string;
  updated_at: string;
}

export interface Mention {
  mention_id: string;
  message_id: string;
  user_id: string;
  mentioned_by: string;
  read: boolean;
  created_at: string;
}

export interface Notification {
  notification_id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

/**
 * Internal Communication System
 */
export class InternalCommunicationSystem {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
    console.log('[InternalCommunicationSystem] Initialized with D1 database');
  }

  /**
   * Create a new channel
   */
  async createChannel(
    name: string,
    type: ChannelType,
    createdBy: string,
    options?: {
      description?: string;
      memberIds?: string[];
    }
  ): Promise<Channel> {
    const channelId = this.generateChannelId(name);
    const now = new Date().toISOString();

    try {
      // Insert channel
      await this.db.prepare(`
        INSERT INTO channels (
          channel_id, channel_name, channel_type, description, created_by, created_at, updated_at, archived
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)
      `).bind(channelId, name, type, options?.description || null, createdBy, now, now).run();

      // Add creator as owner
      await this.addChannelMember(channelId, createdBy, 'owner');

      // Add additional members
      if (options?.memberIds) {
        for (const userId of options.memberIds) {
          if (userId !== createdBy) {
            await this.addChannelMember(channelId, userId, 'member');
          }
        }
      }

      console.log(`[InternalCommunicationSystem] ✅ Channel created: ${name} (${type})`);

      return {
        channel_id: channelId,
        channel_name: name,
        channel_type: type,
        description: options?.description,
        created_by: createdBy,
        created_at: now,
        updated_at: now,
        archived: false
      };
    } catch (error) {
      console.error('[InternalCommunicationSystem] ❌ Error creating channel:', error);
      throw error;
    }
  }

  /**
   * Add member to channel
   */
  async addChannelMember(channelId: string, userId: string, role: MemberRole = 'member'): Promise<boolean> {
    try {
      await this.db.prepare(`
        INSERT INTO channel_members (channel_id, user_id, role, joined_at)
        VALUES (?, ?, ?, ?)
      `).bind(channelId, userId, role, new Date().toISOString()).run();

      console.log(`[InternalCommunicationSystem] ✅ Member added to channel: ${userId} → ${channelId}`);
      return true;
    } catch (error) {
      console.error('[InternalCommunicationSystem] ❌ Error adding member:', error);
      return false;
    }
  }

  /**
   * Send message to channel
   */
  async sendMessage(
    channelId: string,
    userId: string,
    content: string,
    options?: {
      parentMessageId?: string;
    }
  ): Promise<ChannelMessage> {
    const messageId = this.generateMessageId();
    const now = new Date().toISOString();

    try {
      // Insert message
      await this.db.prepare(`
        INSERT INTO channel_messages (
          message_id, channel_id, user_id, content, parent_message_id, created_at, updated_at, deleted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)
      `).bind(messageId, channelId, userId, content, options?.parentMessageId || null, now, now).run();

      // Update channel timestamp
      await this.db.prepare(`
        UPDATE channels SET updated_at = ? WHERE channel_id = ?
      `).bind(now, channelId).run();

      // Handle @mentions
      const mentions = this.extractMentions(content);
      if (mentions.length > 0) {
        await this.handleMentions(messageId, userId, mentions);
      }

      // If it's a reply, create/update thread
      if (options?.parentMessageId) {
        await this.ensureThread(channelId, options.parentMessageId);
      }

      console.log(`[InternalCommunicationSystem] ✅ Message sent to channel: ${channelId}`);

      return {
        message_id: messageId,
        channel_id: channelId,
        user_id: userId,
        content,
        parent_message_id: options?.parentMessageId,
        created_at: now,
        updated_at: now,
        deleted: false
      };
    } catch (error) {
      console.error('[InternalCommunicationSystem] ❌ Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get channel messages
   */
  async getChannelMessages(channelId: string, limit: number = 50): Promise<ChannelMessage[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM channel_messages
        WHERE channel_id = ? AND deleted = 0
        ORDER BY created_at DESC
        LIMIT ?
      `).bind(channelId, limit).all();

      return result.results as ChannelMessage[];
    } catch (error) {
      console.error('[InternalCommunicationSystem] ❌ Error fetching messages:', error);
      return [];
    }
  }

  /**
   * Get user's channels
   */
  async getUserChannels(userId: string): Promise<Channel[]> {
    try {
      const result = await this.db.prepare(`
        SELECT c.* FROM channels c
        JOIN channel_members cm ON c.channel_id = cm.channel_id
        WHERE cm.user_id = ? AND c.archived = 0
        ORDER BY c.updated_at DESC
      `).bind(userId).all();

      return result.results as Channel[];
    } catch (error) {
      console.error('[InternalCommunicationSystem] ❌ Error fetching user channels:', error);
      return [];
    }
  }

  /**
   * Get user's mentions
   */
  async getUserMentions(userId: string, unreadOnly: boolean = false): Promise<Mention[]> {
    try {
      let query = `SELECT * FROM mentions WHERE user_id = ?`;
      if (unreadOnly) {
        query += ` AND read = 0`;
      }
      query += ` ORDER BY created_at DESC LIMIT 50`;

      const result = await this.db.prepare(query).bind(userId).all();

      return result.results as Mention[];
    } catch (error) {
      console.error('[InternalCommunicationSystem] ❌ Error fetching mentions:', error);
      return [];
    }
  }

  /**
   * Mark mention as read
   */
  async markMentionAsRead(mentionId: string): Promise<boolean> {
    try {
      await this.db.prepare(`
        UPDATE mentions SET read = 1 WHERE mention_id = ?
      `).bind(mentionId).run();

      return true;
    } catch (error) {
      console.error('[InternalCommunicationSystem] ❌ Error marking mention as read:', error);
      return false;
    }
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    try {
      let query = `SELECT * FROM notifications WHERE user_id = ?`;
      if (unreadOnly) {
        query += ` AND read = 0`;
      }
      query += ` ORDER BY created_at DESC LIMIT 50`;

      const result = await this.db.prepare(query).bind(userId).all();

      return result.results as Notification[];
    } catch (error) {
      console.error('[InternalCommunicationSystem] ❌ Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Create notification
   */
  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    link?: string
  ): Promise<boolean> {
    try {
      await this.db.prepare(`
        INSERT INTO notifications (notification_id, user_id, type, title, message, link, read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?)
      `).bind(
        this.generateId(),
        userId,
        type,
        title,
        message,
        link || null,
        new Date().toISOString()
      ).run();

      return true;
    } catch (error) {
      console.error('[InternalCommunicationSystem] ❌ Error creating notification:', error);
      return false;
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      await this.db.prepare(`
        UPDATE notifications SET read = 1 WHERE notification_id = ?
      `).bind(notificationId).run();

      return true;
    } catch (error) {
      console.error('[InternalCommunicationSystem] ❌ Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Update user presence
   */
  async updatePresence(userId: string, status: 'online' | 'away' | 'busy' | 'offline'): Promise<boolean> {
    try {
      await this.db.prepare(`
        INSERT INTO staff_presence (user_id, status, last_seen)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET status = ?, last_seen = ?
      `).bind(
        userId,
        status,
        new Date().toISOString(),
        status,
        new Date().toISOString()
      ).run();

      return true;
    } catch (error) {
      console.error('[InternalCommunicationSystem] ❌ Error updating presence:', error);
      return false;
    }
  }

  /**
   * Extract @mentions from content
   */
  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  }

  /**
   * Handle mentions
   */
  private async handleMentions(messageId: string, mentionedBy: string, usernames: string[]): Promise<void> {
    try {
      for (const username of usernames) {
        // In production, look up user ID by username
        // For now, assume username is user ID
        const userId = username;

        await this.db.prepare(`
          INSERT INTO mentions (mention_id, message_id, user_id, mentioned_by, read, created_at)
          VALUES (?, ?, ?, ?, 0, ?)
        `).bind(
          this.generateId(),
          messageId,
          userId,
          mentionedBy,
          new Date().toISOString()
        ).run();

        // Create notification
        await this.createNotification(
          userId,
          'mention',
          'You were mentioned',
          `@${mentionedBy} mentioned you in a message`
        );
      }
    } catch (error) {
      console.error('[InternalCommunicationSystem] ❌ Error handling mentions:', error);
    }
  }

  /**
   * Ensure thread exists
   */
  private async ensureThread(channelId: string, parentMessageId: string): Promise<void> {
    try {
      // Check if thread exists
      const existing = await this.db.prepare(`
        SELECT thread_id FROM threads WHERE parent_message_id = ?
      `).bind(parentMessageId).first();

      if (!existing) {
        // Create thread
        await this.db.prepare(`
          INSERT INTO threads (thread_id, channel_id, parent_message_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          this.generateId(),
          channelId,
          parentMessageId,
          new Date().toISOString(),
          new Date().toISOString()
        ).run();
      } else {
        // Update thread timestamp
        await this.db.prepare(`
          UPDATE threads SET updated_at = ? WHERE parent_message_id = ?
        `).bind(new Date().toISOString(), parentMessageId).run();
      }
    } catch (error) {
      console.error('[InternalCommunicationSystem] ❌ Error ensuring thread:', error);
    }
  }

  /**
   * Generate channel ID
   */
  private generateChannelId(name: string): string {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `channel_${slug}_${Date.now()}`;
  }

  /**
   * Generate message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }

  /**
   * Generate generic ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }
}
