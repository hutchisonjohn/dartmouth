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

    // Build query - fetch all tickets with escalation flags
    let query = `
      SELECT t.*, 
        MAX(CASE WHEN e.escalated_to = ? AND e.status = 'pending' THEN 1 ELSE 0 END) as is_escalated_to_me,
        MAX(CASE WHEN e.status = 'pending' THEN 1 ELSE 0 END) as has_escalation
      FROM tickets t
      LEFT JOIN escalations e ON t.ticket_id = e.ticket_id
      WHERE 1=1
    `;
    const params: any[] = [user.id];

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND t.priority = ?';
      params.push(priority);
    }

    if (assignedTo) {
      query += ' AND t.assigned_to = ?';
      params.push(assignedTo);
    }

    // Group by ticket_id to handle multiple escalations
    query += ' GROUP BY t.ticket_id';

    // If agent role, only show their tickets OR tickets escalated to them
    if (user.role === 'agent') {
      query += ' HAVING (t.assigned_to = ? OR MAX(CASE WHEN e.escalated_to = ? AND e.status = \'pending\' THEN 1 ELSE 0 END) = 1)';
      params.push(user.id, user.id);
    }

    // Order: escalated tickets first, then by created_at
    query += ' ORDER BY is_escalated_to_me DESC, t.created_at DESC LIMIT ? OFFSET ?';
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

    // Get internal notes with escalation data
    const { results: notes } = await c.env.DB.prepare(`
      SELECT n.*, s.first_name, s.last_name, e.id as escalation_id, e.escalated_to, e.status as escalation_status, e.resolved_at
      FROM internal_notes n
      JOIN staff_users s ON n.staff_id = s.id
      LEFT JOIN escalations e ON n.ticket_id = e.ticket_id AND n.note_type = 'escalation' AND e.created_at = n.created_at
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

    // Update ticket status to 'snoozed'
    await c.env.DB.prepare(`
      UPDATE tickets
      SET status = 'snoozed', updated_at = ?
      WHERE ticket_id = ?
    `).bind(now, ticketId).run();

    // Add an internal note about the snooze
    const noteId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO internal_notes (id, ticket_id, staff_id, note_type, content, created_at, updated_at)
      VALUES (?, ?, ?, 'general', ?, datetime('now'), datetime('now'))
    `).bind(
      noteId,
      ticketId,
      user.id,
      `💤 Ticket snoozed until ${new Date(snoozedUntil).toLocaleString()}. Reason: ${reason || 'No reason provided'}`
    ).run();

    return c.json({ message: 'Ticket snoozed', snoozedUntil });
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
    const user = c.get('user') as AuthUser;
    const ticketId = c.req.param('id');

    await c.env.DB.prepare(`
      UPDATE tickets
      SET status = 'in-progress', updated_at = datetime('now')
      WHERE ticket_id = ?
    `).bind(ticketId).run();

    // Add an internal note about removing the snooze
    const noteId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO internal_notes (id, ticket_id, staff_id, note_type, content, created_at, updated_at)
      VALUES (?, ?, ?, 'general', ?, datetime('now'), datetime('now'))
    `).bind(
      noteId,
      ticketId,
      user.id,
      '✅ Snooze removed - ticket is now active'
    ).run();

    return c.json({ message: 'Ticket unsnoozed' });
  } catch (error) {
    console.error('[Tickets] Unsnooze error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Escalate ticket - Request help from other staff members
 */
export async function escalateTicket(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;
    const ticketId = c.req.param('id');
    const body = await c.req.json();
    const { staffIds, reason } = body;

    if (!staffIds || !Array.isArray(staffIds) || staffIds.length === 0) {
      return c.json({ error: 'At least one staff member must be selected' }, 400);
    }

    if (!reason || !reason.trim()) {
      return c.json({ error: 'Reason is required' }, 400);
    }

    const now = new Date().toISOString();

    // Create escalation records for each staff member
    const escalationIds: string[] = [];
    for (const staffId of staffIds) {
      const escalationId = crypto.randomUUID();
      escalationIds.push(escalationId);
      
      await c.env.DB.prepare(`
        INSERT INTO escalations (id, ticket_id, escalated_by, escalated_to, reason, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'pending', ?)
      `).bind(escalationId, ticketId, user.id, staffId, reason, now).run();

      // Create @mention for the staff member
      const mentionId = crypto.randomUUID();
      await c.env.DB.prepare(`
        INSERT INTO staff_mentions (id, ticket_id, from_staff_id, to_staff_id, message, priority, type, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, 'high', 'ticket', FALSE, ?)
      `).bind(mentionId, ticketId, user.id, staffId, reason, now).run();
    }

    // Create staff note documenting the escalation
    const noteId = crypto.randomUUID();
    const staffNames = await Promise.all(
      staffIds.map(async (staffId: string) => {
        const staff = await c.env.DB.prepare(`
          SELECT first_name, last_name FROM staff_users WHERE id = ?
        `).bind(staffId).first();
        return staff ? `${staff.first_name} ${staff.last_name}` : 'Unknown';
      })
    );
    
    const noteContent = `🚨 Escalated to ${staffNames.join(', ')}: ${reason}`;
    await c.env.DB.prepare(`
      INSERT INTO internal_notes (id, ticket_id, staff_id, note_type, content, created_at, updated_at)
      VALUES (?, ?, ?, 'escalation', ?, ?, ?)
    `).bind(noteId, ticketId, user.id, noteContent, now, now).run();

    return c.json({ message: 'Ticket escalated successfully', escalationIds, noteId });
  } catch (error) {
    console.error('[Tickets] Escalate error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Resolve escalation - Mark escalation as resolved
 */
export async function resolveEscalation(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;
    const ticketId = c.req.param('id');
    const body = await c.req.json();
    const { escalationId } = body;

    if (!escalationId) {
      return c.json({ error: 'Escalation ID is required' }, 400);
    }

    const now = new Date().toISOString();

    // Update escalation status to resolved
    await c.env.DB.prepare(`
      UPDATE escalations
      SET status = 'resolved', resolved_at = ?
      WHERE id = ? AND escalated_to = ?
    `).bind(now, escalationId, user.id).run();

    return c.json({ message: 'Escalation resolved successfully' });
  } catch (error) {
    console.error('[Tickets] Resolve escalation error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Schedule a reply to be sent at a specific time
 */
export async function scheduleReply(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;
    const ticketId = c.req.param('id');
    const { content, scheduledFor } = await c.req.json();

    if (!content || !scheduledFor) {
      return c.json({ error: 'Content and scheduledFor are required' }, 400);
    }

    // Validate scheduledFor is in the future (allow 1 minute buffer for processing time)
    const scheduledDate = new Date(scheduledFor);
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000); // 1 minute buffer
    
    console.log('[Schedule Reply] Validation:', {
      scheduledFor,
      scheduledDate: scheduledDate.toISOString(),
      now: now.toISOString(),
      isValid: scheduledDate > oneMinuteAgo
    });
    
    if (scheduledDate <= oneMinuteAgo) {
      return c.json({ 
        error: 'Scheduled time must be in the future',
        details: {
          scheduled: scheduledDate.toISOString(),
          current: now.toISOString()
        }
      }, 400);
    }

    // Generate unique ID
    const messageId = crypto.randomUUID();

    // Insert scheduled message
    await c.env.DB.prepare(`
      INSERT INTO scheduled_messages (id, ticket_id, staff_id, content, scheduled_for, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))
    `).bind(messageId, ticketId, user.id, content, scheduledFor).run();

    // Add an internal note to track the scheduled reply
    const noteId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO internal_notes (id, ticket_id, staff_id, note_type, content, created_at, updated_at)
      VALUES (?, ?, ?, 'general', ?, datetime('now'), datetime('now'))
    `).bind(noteId, ticketId, user.id, `📅 Scheduled reply for ${new Date(scheduledFor).toLocaleString()}`).run();

    return c.json({ 
      message: 'Reply scheduled successfully',
      scheduledMessageId: messageId,
      scheduledFor
    });
  } catch (error) {
    console.error('[Tickets] Schedule reply error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Get scheduled messages for a ticket
 */
export async function getScheduledMessages(c: Context<{ Bindings: Env }>) {
  try {
    const ticketId = c.req.param('id');

    const { results: scheduledMessages } = await c.env.DB.prepare(`
      SELECT sm.*, s.first_name, s.last_name
      FROM scheduled_messages sm
      JOIN staff_users s ON sm.staff_id = s.id
      WHERE sm.ticket_id = ? AND sm.status = 'pending'
      ORDER BY sm.scheduled_for ASC
    `).bind(ticketId).all();

    return c.json({ scheduledMessages });
  } catch (error) {
    console.error('[Tickets] Get scheduled messages error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Update a scheduled message
 */
export async function updateScheduledMessage(c: Context<{ Bindings: Env }>) {
  try {
    const messageId = c.req.param('messageId');
    const { content, scheduledFor } = await c.req.json();
    
    console.log('[Update Scheduled Message]', { messageId, content, scheduledFor });

    if (!content || !scheduledFor) {
      return c.json({ error: 'Content and scheduledFor are required' }, 400);
    }

    // Validate scheduledFor is in the future
    const scheduledDate = new Date(scheduledFor);
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    
    if (scheduledDate <= oneMinuteAgo) {
      return c.json({ error: 'Scheduled time must be in the future' }, 400);
    }

    // Update the scheduled message
    await c.env.DB.prepare(`
      UPDATE scheduled_messages
      SET content = ?, scheduled_for = ?, updated_at = datetime('now')
      WHERE id = ? AND status = 'pending'
    `).bind(content, scheduledFor, messageId).run();

    return c.json({ message: 'Scheduled message updated successfully' });
  } catch (error) {
    console.error('[Tickets] Update scheduled message error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Delete a scheduled message
 */
export async function deleteScheduledMessage(c: Context<{ Bindings: Env }>) {
  try {
    const messageId = c.req.param('messageId');

    await c.env.DB.prepare(`
      DELETE FROM scheduled_messages
      WHERE id = ? AND status = 'pending'
    `).bind(messageId).run();

    return c.json({ message: 'Scheduled message deleted successfully' });
  } catch (error) {
    console.error('[Tickets] Delete scheduled message error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}


