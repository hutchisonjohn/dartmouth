/**
 * Mentions Controller
 */

import type { Context } from 'hono';
import type { Env } from '../types/shared';
import type { AuthUser } from '../middleware/auth';

/**
 * List mentions for current user
 */
export async function listMentions(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;
    const unreadOnly = c.req.query('unreadOnly') === 'true';

    let query = `
      SELECT m.*, 
        fs.first_name as from_first_name, 
        fs.last_name as from_last_name,
        t.ticket_number, t.subject
      FROM staff_mentions m
      JOIN staff_users fs ON m.from_staff_id = fs.id
      JOIN tickets t ON m.ticket_id = t.ticket_id
      WHERE m.to_staff_id = ?
    `;

    if (unreadOnly) {
      query += ' AND m.is_read = FALSE';
    }

    query += ' ORDER BY m.created_at DESC';

    const { results } = await c.env.DB.prepare(query).bind(user.id).all();

    return c.json({ mentions: results });
  } catch (error) {
    console.error('[Mentions] List error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Get single mention with thread
 */
export async function getMention(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;
    const mentionId = c.req.param('id');

    const mention = await c.env.DB.prepare(`
      SELECT m.*, 
        fs.first_name as from_first_name, 
        fs.last_name as from_last_name,
        t.ticket_number, t.subject
      FROM staff_mentions m
      JOIN staff_users fs ON m.from_staff_id = fs.id
      JOIN tickets t ON m.ticket_id = t.ticket_id
      WHERE m.id = ? AND m.to_staff_id = ?
    `).bind(mentionId, user.id).first();

    if (!mention) {
      return c.json({ error: 'Mention not found' }, 404);
    }

    // Get thread replies
    const { results: replies } = await c.env.DB.prepare(`
      SELECT mt.*, s.first_name, s.last_name
      FROM mention_threads mt
      JOIN staff_users s ON mt.staff_id = s.id
      WHERE mt.mention_id = ?
      ORDER BY mt.created_at ASC
    `).bind(mentionId).all();

    return c.json({
      mention,
      replies
    });
  } catch (error) {
    console.error('[Mentions] Get error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Create mention
 */
export async function createMention(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;
    const { ticketId, toStaffId, message, priority, type } = await c.req.json();

    if (!ticketId || !toStaffId || !message) {
      return c.json({ error: 'ticketId, toStaffId, and message required' }, 400);
    }

    const mentionId = crypto.randomUUID();
    const now = new Date().toISOString();

    await c.env.DB.prepare(`
      INSERT INTO staff_mentions (id, ticket_id, from_staff_id, to_staff_id, message, priority, type, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, FALSE, ?)
    `).bind(mentionId, ticketId, user.id, toStaffId, message, priority || 'normal', type || 'ticket', now).run();

    return c.json({ message: 'Mention created', mentionId });
  } catch (error) {
    console.error('[Mentions] Create error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Reply to mention
 */
export async function replyToMention(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;
    const mentionId = c.req.param('id');
    const { message } = await c.req.json();

    if (!message) {
      return c.json({ error: 'message required' }, 400);
    }

    const replyId = crypto.randomUUID();
    const now = new Date().toISOString();

    await c.env.DB.prepare(`
      INSERT INTO mention_threads (id, mention_id, staff_id, message, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(replyId, mentionId, user.id, message, now).run();

    return c.json({ message: 'Reply added', replyId });
  } catch (error) {
    console.error('[Mentions] Reply error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Mark mention as read
 */
export async function markAsRead(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;
    const mentionId = c.req.param('id');

    await c.env.DB.prepare(`
      UPDATE staff_mentions
      SET is_read = TRUE
      WHERE id = ? AND to_staff_id = ?
    `).bind(mentionId, user.id).run();

    return c.json({ message: 'Mention marked as read' });
  } catch (error) {
    console.error('[Mentions] Mark as read error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}


