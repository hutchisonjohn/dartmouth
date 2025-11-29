/**
 * Tickets Controller
 */

import type { Context } from 'hono';
import type { Env } from '../types/shared';
import type { AuthUser } from '../middleware/auth';

/**
 * List tickets with filters
 */
export async function listTickets(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;
    
    // Get query parameters
    const status = c.req.query('status');
    const priority = c.req.query('priority');
    const assignedTo = c.req.query('assignedTo');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    // Build query
    let query = 'SELECT * FROM tickets WHERE 1=1';
    const params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    if (assignedTo) {
      query += ' AND assigned_to = ?';
      params.push(assignedTo);
    }

    // If agent, only show their tickets
    if (user.role === 'agent') {
      query += ' AND assigned_to = ?';
      params.push(user.id);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const { results } = await c.env.DB.prepare(query).bind(...params).all();

    return c.json({ tickets: results });
  } catch (error) {
    console.error('[Tickets] List error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Get single ticket
 */
export async function getTicket(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;
    const ticketId = c.req.param('id');

    const ticket = await c.env.DB.prepare(`
      SELECT * FROM tickets WHERE ticket_id = ?
    `).bind(ticketId).first();

    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    // Check access
    if (user.role === 'agent' && ticket.assigned_to !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    // Get messages
    const { results: messages } = await c.env.DB.prepare(`
      SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC
    `).bind(ticketId).all();

    // Get internal notes
    const { results: notes } = await c.env.DB.prepare(`
      SELECT n.*, s.first_name, s.last_name
      FROM internal_notes n
      JOIN staff_users s ON n.staff_id = s.id
      WHERE n.ticket_id = ?
      ORDER BY n.created_at DESC
    `).bind(ticketId).all();

    return c.json({
      ticket,
      messages,
      notes
    });
  } catch (error) {
    console.error('[Tickets] Get error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Get ticket messages only
 */
export async function getTicketMessages(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;
    const ticketId = c.req.param('id');

    // Check if ticket exists
    const ticket = await c.env.DB.prepare(`
      SELECT ticket_id, assigned_to FROM tickets WHERE ticket_id = ?
    `).bind(ticketId).first();

    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    // Check access
    if (user.role === 'agent' && ticket.assigned_to !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    // Get messages
    const { results: messages } = await c.env.DB.prepare(`
      SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC
    `).bind(ticketId).all();

    return c.json({ messages });
  } catch (error) {
    console.error('[Tickets] Get messages error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Assign ticket
 */
export async function assignTicket(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;
    const ticketId = c.req.param('id');
    const { assignedTo } = await c.req.json();

    if (!assignedTo) {
      return c.json({ error: 'assignedTo required' }, 400);
    }

    await c.env.DB.prepare(`
      UPDATE tickets
      SET assigned_to = ?, updated_at = datetime('now')
      WHERE ticket_id = ?
    `).bind(assignedTo, ticketId).run();

    return c.json({ message: 'Ticket assigned successfully' });
  } catch (error) {
    console.error('[Tickets] Assign error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(c: Context<{ Bindings: Env }>) {
  try {
    const ticketId = c.req.param('id');
    const { status } = await c.req.json();

    if (!status) {
      return c.json({ error: 'status required' }, 400);
    }

    const now = new Date().toISOString();
    let resolvedAt = null;
    let closedAt = null;

    if (status === 'resolved') {
      resolvedAt = now;
    } else if (status === 'closed') {
      closedAt = now;
    }

    await c.env.DB.prepare(`
      UPDATE tickets
      SET status = ?, resolved_at = ?, closed_at = ?, updated_at = ?
      WHERE ticket_id = ?
    `).bind(status, resolvedAt, closedAt, now, ticketId).run();

    return c.json({ message: 'Ticket status updated' });
  } catch (error) {
    console.error('[Tickets] Update status error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

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

    // Get staff member's name from database
    const staffInfo = await c.env.DB.prepare(`
      SELECT first_name, last_name FROM staff_users WHERE id = ?
    `).bind(user.id).first();

    const staffName = staffInfo 
      ? `${staffInfo.first_name} ${staffInfo.last_name}` 
      : user.email;

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

/**
 * Add internal note
 */
export async function addNote(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;
    const ticketId = c.req.param('id');
    const { content, noteType } = await c.req.json();

    if (!content) {
      return c.json({ error: 'content required' }, 400);
    }

    const noteId = crypto.randomUUID();
    const now = new Date().toISOString();

    await c.env.DB.prepare(`
      INSERT INTO internal_notes (id, ticket_id, staff_id, note_type, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(noteId, ticketId, user.id, noteType || 'general', content, now, now).run();

    return c.json({ message: 'Note added', noteId });
  } catch (error) {
    console.error('[Tickets] Add note error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Snooze ticket
 */
export async function snoozeTicket(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;
    const ticketId = c.req.param('id');
    const { snoozedUntil, reason } = await c.req.json();

    if (!snoozedUntil) {
      return c.json({ error: 'snoozedUntil required' }, 400);
    }

    const now = new Date().toISOString();

    await c.env.DB.prepare(`
      UPDATE tickets
      SET status = 'snoozed', is_snoozed = TRUE, snoozed_until = ?, snoozed_by = ?, snooze_reason = ?, updated_at = ?
      WHERE ticket_id = ?
    `).bind(snoozedUntil, user.id, reason, now, ticketId).run();

    return c.json({ message: 'Ticket snoozed' });
  } catch (error) {
    console.error('[Tickets] Snooze error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Unsnooze ticket
 */
export async function unsnoozeTicket(c: Context<{ Bindings: Env }>) {
  try {
    const ticketId = c.req.param('id');
    const now = new Date().toISOString();

    await c.env.DB.prepare(`
      UPDATE tickets
      SET status = 'in-progress', is_snoozed = FALSE, snoozed_until = NULL, updated_at = ?
      WHERE ticket_id = ?
    `).bind(now, ticketId).run();

    return c.json({ message: 'Ticket unsnoozed' });
  } catch (error) {
    console.error('[Tickets] Unsnooze error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}


