/**
 * Tickets Controller
 */

import type { Context } from 'hono';
import type { Env } from '../types/shared';
import type { AuthUser } from '../middleware/auth';

/**
 * Convert plain text to HTML with proper paragraph spacing
 */
function textToHtml(text: string): string {
  console.log(`[textToHtml] ═══════════════════════════════════════════`);
  console.log(`[textToHtml] INPUT length=${text.length} newlines=${(text.match(/\n/g) || []).length} doubleNewlines=${(text.match(/\n\n/g) || []).length}`);
  console.log(`[textToHtml] INPUT text:\n${text.substring(0, 400)}`);
  console.log(`[textToHtml] ───────────────────────────────────────────`);
  
  // Split by double newlines to get paragraphs
  const paragraphs = text.split(/\n\n+/);
  
  console.log(`[textToHtml] PARAGRAPHS found: ${paragraphs.length}`);
  
  // Convert each paragraph
  const html = paragraphs
    .map(para => {
      // Within each paragraph, convert single newlines to <br>
      const lines = para.trim().replace(/\n/g, '<br>');
      return lines ? `<p>${lines}</p>` : '';
    })
    .filter(p => p) // Remove empty paragraphs
    .join('\n');
  
  console.log(`[textToHtml] OUTPUT html:\n${html.substring(0, 400)}`);
  console.log(`[textToHtml] ═══════════════════════════════════════════`);
  
  return html;
}

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

    // Build query - fetch all tickets with escalation flags (exclude deleted)
    let query = `
      SELECT t.*, 
        MAX(CASE WHEN e.escalated_to = ? AND e.status = 'pending' THEN 1 ELSE 0 END) as is_escalated_to_me,
        MAX(CASE WHEN e.status = 'pending' THEN 1 ELSE 0 END) as has_escalation
      FROM tickets t
      LEFT JOIN escalations e ON t.ticket_id = e.ticket_id
      WHERE t.deleted_at IS NULL
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
      SELECT customer_email, subject, conversation_id FROM tickets WHERE ticket_id = ?
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
    // For message display, use just the first name
    const senderName = staffInfo?.first_name || staffName;

    // Send email via Resend (Email System V2)
    try {
      const { sendEmailThroughResend } = await import('../services/ResendService');
      
      // Get conversation ID from ticket
      const conversationId = ticket.conversation_id as string;
      
      if (!conversationId) {
        console.error(`[Tickets] No conversation_id found for ticket ${ticketId}`);
        throw new Error('Ticket has no conversation_id - cannot send email');
      }

      // Get mailbox info (assuming john@directtofilm.com.au for now)
      const mailbox = await c.env.DB.prepare(`
        SELECT id, email_address FROM mailboxes WHERE email_address = 'john@directtofilm.com.au' LIMIT 1
      `).first<{ id: string; email_address: string }>();

      if (!mailbox) {
        console.error(`[Tickets] No mailbox found for john@directtofilm.com.au`);
        throw new Error('Mailbox not configured');
      }

      // Build reply subject (ensure it has Re: prefix)
      const replySubject = ticket.subject && !(ticket.subject as string).startsWith('Re:')
        ? `Re: ${ticket.subject}`
        : ticket.subject as string;

      await sendEmailThroughResend(c.env, {
        tenantId: 'test-tenant-dtf', // TODO: Get from ticket/mailbox
        conversationId,
        mailboxId: mailbox.id,
        userId: user.id,
        toEmail: ticket.customer_email as string,
        fromEmail: mailbox.email_address,
        fromName: staffName,
        subject: replySubject,
        bodyHtml: textToHtml(content),
        bodyText: content,
      });

      console.log(`[Tickets] ✅ Email sent to ${ticket.customer_email} via Resend`);
    } catch (emailError) {
      console.error(`[Tickets] Failed to send email:`, emailError);
      // Don't fail the entire request if email fails - still save the message
    }

    await c.env.DB.prepare(`
      INSERT INTO ticket_messages (id, ticket_id, sender_type, sender_id, sender_name, content, created_at)
      VALUES (?, ?, 'agent', ?, ?, ?, ?)
    `).bind(messageId, ticketId, user.id, senderName, content, now).run();

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

    // Update ticket status to 'snoozed' and set the snooze expiry time
    await c.env.DB.prepare(`
      UPDATE tickets
      SET status = 'snoozed', snoozed_until = ?, updated_at = ?
      WHERE ticket_id = ?
    `).bind(snoozedUntil, now, ticketId).run();

    // Add an internal note about the snooze
    // Use SNOOZE_TIME: marker so frontend can format in user's timezone
    const noteId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO internal_notes (id, ticket_id, staff_id, note_type, content, created_at, updated_at)
      VALUES (?, ?, ?, 'general', ?, datetime('now'), datetime('now'))
    `).bind(
      noteId,
      ticketId,
      user.id,
      `💤 Ticket snoozed until SNOOZE_TIME:${snoozedUntil}. Reason: ${reason || 'No reason provided'}`
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
    // Store the ISO timestamp so the frontend can format it in the user's timezone
    const noteId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO internal_notes (id, ticket_id, staff_id, note_type, content, created_at, updated_at)
      VALUES (?, ?, ?, 'general', ?, datetime('now'), datetime('now'))
    `).bind(noteId, ticketId, user.id, `📅 Scheduled reply for SCHEDULE_TIME:${scheduledFor}`).run();

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

/**
 * Get AI draft response for a ticket
 */
export async function getAIDraftResponse(c: Context<{ Bindings: Env }>) {
  try {
    const ticketId = c.req.param('id');
    const user = c.get('user') as AuthUser;

    // Get the most recent pending draft for this ticket
    const draft = await c.env.DB.prepare(`
      SELECT * FROM ai_draft_responses
      WHERE ticket_id = ? AND status = 'pending'
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(ticketId).first();

    if (!draft) {
      return c.json({ error: 'No AI draft found for this ticket' }, 404);
    }

    // Parse JSON fields
    const response = {
      ...draft,
      suggested_actions: draft.suggested_actions ? JSON.parse(draft.suggested_actions as string) : [],
      shopify_data: draft.shopify_data ? JSON.parse(draft.shopify_data as string) : null,
      perp_data: draft.perp_data ? JSON.parse(draft.perp_data as string) : null,
    };

    return c.json({ draft: response });
  } catch (error) {
    console.error('[Tickets] Get AI draft error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Approve and send AI draft response
 */
export async function approveAIDraftResponse(c: Context<{ Bindings: Env }>) {
  try {
    const ticketId = c.req.param('id');
    const user = c.get('user') as AuthUser;

    // Get staff name from database
    const staffUser = await c.env.DB.prepare(`
      SELECT first_name, last_name FROM staff_users WHERE id = ?
    `).bind(user.id).first();
    const staffName = staffUser 
      ? `${staffUser.first_name || ''} ${staffUser.last_name || ''}`.trim() || user.email
      : user.email;

    console.log(`[RLHF] ✅ Send As-Is initiated for ticket ${ticketId}`, {
      staffId: user.id,
      staffName
    });

    // Get the pending draft
    const draft = await c.env.DB.prepare(`
      SELECT * FROM ai_draft_responses
      WHERE ticket_id = ? AND status = 'pending'
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(ticketId).first();

    if (!draft) {
      console.log(`[RLHF] ⚠️ No pending draft found for ticket ${ticketId}`);
      return c.json({ error: 'No pending draft found' }, 404);
    }

    console.log(`[RLHF] 📝 Approving draft without edits:`, {
      draftId: draft.id,
      contentLength: (draft.draft_content as string || '').length,
      confidence: draft.confidence_score
    });

    // Get ticket details
    const ticket = await c.env.DB.prepare(`
      SELECT customer_email, subject, conversation_id FROM tickets WHERE ticket_id = ?
    `).bind(ticketId).first();

    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    // Send email via Resend
    const { sendEmailThroughResend } = await import('../services/ResendService');
    
    const conversationId = ticket.conversation_id as string | null;
    
    console.log(`[RLHF] 📧 Sending approved draft to ${ticket.customer_email}`);
    
    await sendEmailThroughResend(c.env, {
      tenantId: 'test-tenant-dtf', // TODO: Get from ticket or user context
      conversationId: conversationId || ticketId,
      mailboxId: 'mailbox-john', // TODO: Get from ticket or user context
      userId: 'ai-agent-001',
      toEmail: ticket.customer_email as string,
      fromEmail: 'support@directtofilm.com.au',
      fromName: 'DTF Support',
      subject: `Re: ${ticket.subject}`,
      bodyHtml: textToHtml(draft.draft_content as string),
      bodyText: draft.draft_content as string,
    });

    console.log(`[RLHF] ✅ Email sent successfully (no edits)`);

    // Add message to ticket_messages
    const messageId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO ticket_messages (
        id, ticket_id, sender_type, sender_id, sender_name, content, was_scheduled, created_at
      ) VALUES (?, ?, 'agent', 'ai-agent-001', 'McCarthy AI', ?, 0, datetime('now'))
    `).bind(messageId, ticketId, draft.draft_content).run();

    // Update draft status
    await c.env.DB.prepare(`
      UPDATE ai_draft_responses
      SET status = 'approved', approved_by = ?, approved_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).bind(user.id, draft.id).run();

    // Update ticket status if needed
    await c.env.DB.prepare(`
      UPDATE tickets
      SET status = 'in-progress', updated_at = datetime('now')
      WHERE ticket_id = ? AND status = 'open'
    `).bind(ticketId).run();

    console.log(`[RLHF] 💾 Draft marked as 'approved', ready for feedback collection`);

    return c.json({
      data: {
        message: { id: draft.id, ticket_id: ticketId, content: draft.draft_content },
        draft: { id: draft.id, status: 'approved', approved_by: user.id }
      }
    });
  } catch (error) {
    console.error('[RLHF] ❌ Approve AI draft error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Edit and send AI draft response
 */
export async function editAIDraftResponse(c: Context<{ Bindings: Env }>) {
  try {
    const ticketId = c.req.param('id');
    const user = c.get('user') as AuthUser;
    const body = await c.req.json();
    const { editedContent, content } = body;
    
    // Support both 'editedContent' and 'content' field names
    const finalContent = editedContent || content;

    // Get staff name from database
    const staffUser = await c.env.DB.prepare(`
      SELECT first_name, last_name FROM staff_users WHERE id = ?
    `).bind(user.id).first();
    const staffName = staffUser 
      ? `${staffUser.first_name || ''} ${staffUser.last_name || ''}`.trim() || user.email
      : user.email;
    // For message display, use just the first name
    const senderName = staffUser?.first_name || staffName;

    console.log(`[RLHF] ✏️ Edit & Send initiated for ticket ${ticketId}`, {
      staffId: user.id,
      staffName,
      senderName,
      contentLength: finalContent?.length || 0
    });

    if (!finalContent) {
      console.error('[RLHF] ❌ No content provided in edit request');
      return c.json({ error: 'Edited content is required' }, 400);
    }

    // Get the pending draft
    const draft = await c.env.DB.prepare(`
      SELECT * FROM ai_draft_responses
      WHERE ticket_id = ? AND status = 'pending'
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(ticketId).first();

    if (!draft) {
      console.log(`[RLHF] ⚠️ No pending draft found for ticket ${ticketId}`);
      return c.json({ error: 'No pending draft found' }, 404);
    }

    const originalLength = (draft.draft_content as string || '').length;
    const editedLength = finalContent.length;
    const changePercent = Math.round(((editedLength - originalLength) / originalLength) * 100);

    console.log(`[RLHF] 📊 Draft comparison:`, {
      draftId: draft.id,
      originalLength,
      editedLength,
      changePercent: `${changePercent > 0 ? '+' : ''}${changePercent}%`,
      wasSignificantlyEdited: Math.abs(changePercent) > 20
    });

    // Get ticket details
    const ticket = await c.env.DB.prepare(`
      SELECT customer_email, subject, conversation_id FROM tickets WHERE ticket_id = ?
    `).bind(ticketId).first();

    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    // Send email via Resend with edited content
    const { sendEmailThroughResend } = await import('../services/ResendService');
    
    const conversationId = ticket.conversation_id as string | null;
    
    console.log(`[RLHF] 📧 Sending edited email to ${ticket.customer_email}`);
    
    await sendEmailThroughResend(c.env, {
      tenantId: 'test-tenant-dtf', // TODO: Get from ticket or user context
      conversationId: conversationId || ticketId,
      mailboxId: 'mailbox-john', // TODO: Get from ticket or user context
      userId: user.id,
      toEmail: ticket.customer_email as string,
      fromEmail: 'support@directtofilm.com.au',
      fromName: 'DTF Support',
      subject: `Re: ${ticket.subject}`,
      bodyHtml: textToHtml(finalContent),
      bodyText: finalContent,
    });

    console.log(`[RLHF] ✅ Email sent successfully`);

    // Add message to ticket_messages (with edited content)
    const messageId = crypto.randomUUID();
    
    await c.env.DB.prepare(`
      INSERT INTO ticket_messages (
        id, ticket_id, sender_type, sender_id, sender_name, content, was_scheduled, created_at
      ) VALUES (?, ?, 'agent', ?, ?, ?, 0, datetime('now'))
    `).bind(messageId, ticketId, user.id, senderName, finalContent).run();

    // Update draft status
    await c.env.DB.prepare(`
      UPDATE ai_draft_responses
      SET status = 'edited', approved_by = ?, approved_at = datetime('now'), 
          edited_content = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(user.id, finalContent, draft.id).run();

    // Update ticket status if needed
    await c.env.DB.prepare(`
      UPDATE tickets
      SET status = 'in-progress', updated_at = datetime('now')
      WHERE ticket_id = ? AND status = 'open'
    `).bind(ticketId).run();

    console.log(`[RLHF] 💾 Draft marked as 'edited', ready for feedback collection`);
    
    return c.json({
      data: {
        message: { id: draft.id, ticket_id: ticketId, content: finalContent },
        draft: { id: draft.id, status: 'edited', approved_by: user.id, edited_content: finalContent }
      }
    });
  } catch (error) {
    console.error('[RLHF] ❌ Edit AI draft error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Submit feedback for AI draft response (for learning/improvement)
 */
export async function submitAIDraftFeedback(c: Context<{ Bindings: Env }>) {
  try {
    const ticketId = c.req.param('id');
    const user = c.get('user') as AuthUser;
    const body = await c.req.json();
    const { qualityScore, wasHelpful, improvementNotes } = body;

    // Get staff name from database
    const staffUser = await c.env.DB.prepare(`
      SELECT first_name, last_name FROM staff_users WHERE id = ?
    `).bind(user.id).first();
    const staffName = staffUser 
      ? `${staffUser.first_name || ''} ${staffUser.last_name || ''}`.trim() || user.email
      : user.email;

    console.log(`[RLHF] 📊 Feedback received for ticket ${ticketId}:`, {
      qualityScore,
      wasHelpful,
      hasNotes: !!improvementNotes,
      staffId: user.id,
      staffName
    });

    if (!qualityScore || wasHelpful === undefined) {
      return c.json({ error: 'Quality score and wasHelpful are required' }, 400);
    }

    // Get the draft
    const draft = await c.env.DB.prepare(`
      SELECT id, draft_content, edited_content, intent, ticket_id FROM ai_draft_responses
      WHERE ticket_id = ? AND status IN ('approved', 'edited')
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(ticketId).first();

    if (!draft) {
      console.log(`[RLHF] ⚠️ No draft found for ticket ${ticketId}`);
      return c.json({ error: 'No draft found for this ticket' }, 404);
    }

    console.log(`[RLHF] 📝 Draft found: ${draft.id}`, {
      intent: draft.intent,
      wasEdited: !!draft.edited_content,
      originalLength: (draft.draft_content as string || '').length,
      editedLength: (draft.edited_content as string || draft.draft_content as string).length
    });

    // Calculate edit distance (simple character count difference)
    const originalLength = (draft.draft_content as string || '').length;
    const editedLength = (draft.edited_content as string || draft.draft_content as string).length;
    const editDistance = Math.abs(editedLength - originalLength);

    console.log(`[RLHF] 📏 Edit distance calculated: ${editDistance} characters changed`);

    // Update draft with feedback
    await c.env.DB.prepare(`
      UPDATE ai_draft_responses
      SET quality_score = ?, was_helpful = ?, improvement_notes = ?, 
          edit_distance = ?, feedback_submitted_at = datetime('now'), 
          feedback_submitted_by = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(qualityScore, wasHelpful ? 1 : 0, improvementNotes || null, editDistance, user.id, draft.id).run();

    console.log(`[RLHF] ✅ Feedback saved to database`);

    // If quality score is 4 or 5, add to learning examples
    if (qualityScore >= 4) {
      console.log(`[RLHF] 🌟 High-quality response detected (${qualityScore}/5) - adding to learning examples`);
      
      const ticket = await c.env.DB.prepare(`
        SELECT description FROM tickets WHERE ticket_id = ?
      `).bind(ticketId).first();

      if (ticket) {
        const learningExampleId = crypto.randomUUID();
        await c.env.DB.prepare(`
          INSERT INTO ai_learning_examples (
            id, draft_id, customer_message, ai_response, intent, sentiment, quality_score, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).bind(
          learningExampleId,
          draft.id,
          ticket.description as string,
          draft.edited_content || draft.draft_content,
          draft.intent || 'unknown',
          'neutral', // TODO: Get from ticket
          qualityScore
        ).run();

        console.log(`[RLHF] 🎓 Learning example created: ${learningExampleId}`, {
          intent: draft.intent || 'unknown',
          qualityScore,
          responseLength: (draft.edited_content || draft.draft_content as string).length
        });
      }
    } else {
      console.log(`[RLHF] 📉 Low score (${qualityScore}/5) - not added to learning examples`);
    }

    console.log(`[RLHF] 🎯 COMPLETE - Feedback pipeline finished for draft ${draft.id}`);

    return c.json({
      message: 'Feedback submitted successfully',
      data: { draftId: draft.id, qualityScore, wasHelpful }
    });
  } catch (error) {
    console.error('[RLHF] ❌ Submit feedback error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Reject AI draft response
 */
export async function rejectAIDraftResponse(c: Context<{ Bindings: Env }>) {
  try {
    const ticketId = c.req.param('id');
    const user = c.get('user') as AuthUser;
    const body = await c.req.json();
    const { reason } = body;

    // Get the pending draft
    const draft = await c.env.DB.prepare(`
      SELECT * FROM ai_draft_responses
      WHERE ticket_id = ? AND status = 'pending'
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(ticketId).first();

    if (!draft) {
      return c.json({ error: 'No pending draft found' }, 404);
    }

    // Update draft status
    await c.env.DB.prepare(`
      UPDATE ai_draft_responses
      SET status = 'rejected', approved_by = ?, approved_at = datetime('now'), 
          rejection_reason = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(user.id, reason || 'No reason provided', draft.id).run();

    return c.json({
      data: {
        draft: {
          id: draft.id,
          status: 'rejected',
          rejected_by: user.id,
          rejection_reason: reason || 'No reason provided'
        }
      }
    });
  } catch (error) {
    console.error('[Tickets] Reject AI draft error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Delete a ticket (soft delete)
 * DELETE /api/tickets/:id
 */
export async function deleteTicket(c: Context<{ Bindings: Env }>) {
  try {
    const ticketId = c.req.param('id');
    const user = c.get('user') as AuthUser;

    // Check if ticket exists and is not already deleted
    const ticket = await c.env.DB.prepare(`
      SELECT ticket_id, ticket_number, status, deleted_at
      FROM tickets
      WHERE ticket_id = ?
    `).bind(ticketId).first();

    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    if (ticket.deleted_at) {
      return c.json({ error: 'Ticket is already deleted' }, 400);
    }

    // Soft delete the ticket
    await c.env.DB.prepare(`
      UPDATE tickets
      SET deleted_at = datetime('now'),
          deleted_by = ?,
          updated_at = datetime('now')
      WHERE ticket_id = ?
    `).bind(user.id, ticketId).run();

    console.log(`[Tickets] Ticket ${ticket.ticket_number} soft deleted by ${user.email}`);

    return c.json({
      message: 'Ticket deleted successfully',
      ticket_id: ticketId,
      ticket_number: ticket.ticket_number
    });
  } catch (error) {
    console.error('[Tickets] Delete ticket error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Merge multiple tickets into one
 * POST /api/tickets/:id/merge
 * Body: { secondaryTicketIds: string[] }
 */
export async function mergeTickets(c: Context<{ Bindings: Env }>) {
  try {
    const primaryTicketId = c.req.param('id');
    const user = c.get('user') as AuthUser;
    const body = await c.req.json();
    const { secondaryTicketIds } = body;

    if (!secondaryTicketIds || !Array.isArray(secondaryTicketIds) || secondaryTicketIds.length === 0) {
      return c.json({ error: 'secondaryTicketIds array is required' }, 400);
    }

    // Get primary ticket
    const primaryTicket = await c.env.DB.prepare(`
      SELECT ticket_id, ticket_number, customer_email, subject, status
      FROM tickets
      WHERE ticket_id = ?
    `).bind(primaryTicketId).first();

    if (!primaryTicket) {
      return c.json({ error: 'Primary ticket not found' }, 404);
    }

    // Get secondary tickets
    const secondaryTickets = [];
    for (const ticketId of secondaryTicketIds) {
      const ticket = await c.env.DB.prepare(`
        SELECT ticket_id, ticket_number, customer_email, subject
        FROM tickets
        WHERE ticket_id = ?
      `).bind(ticketId).first();
      
      if (ticket) {
        secondaryTickets.push(ticket);
      }
    }

    if (secondaryTickets.length === 0) {
      return c.json({ error: 'No valid secondary tickets found' }, 400);
    }

    const now = new Date().toISOString();
    const mergedTicketNumbers = secondaryTickets.map(t => t.ticket_number).join(', ');

    // 1. Get all messages from secondary tickets
    for (const secondaryTicket of secondaryTickets) {
      // Get messages from secondary ticket
      const { results: messages } = await c.env.DB.prepare(`
        SELECT id, sender_type, sender_id, sender_name, content, created_at
        FROM ticket_messages
        WHERE ticket_id = ?
        ORDER BY created_at ASC
      `).bind(secondaryTicket.ticket_id).all();

      // Move messages to primary ticket (update ticket_id)
      for (const msg of messages as any[]) {
        await c.env.DB.prepare(`
          UPDATE ticket_messages
          SET ticket_id = ?
          WHERE id = ?
        `).bind(primaryTicketId, msg.id).run();
      }

      // Also copy the description as a message if it exists
      const secondaryTicketFull = await c.env.DB.prepare(`
        SELECT description, customer_name, customer_email, created_at
        FROM tickets WHERE ticket_id = ?
      `).bind(secondaryTicket.ticket_id).first() as any;

      if (secondaryTicketFull?.description) {
        const messageId = crypto.randomUUID();
        await c.env.DB.prepare(`
          INSERT INTO ticket_messages (id, ticket_id, sender_type, sender_id, sender_name, content, created_at)
          VALUES (?, ?, 'customer', ?, ?, ?, ?)
        `).bind(
          messageId,
          primaryTicketId,
          secondaryTicketFull.customer_email,
          secondaryTicketFull.customer_name || secondaryTicketFull.customer_email,
          `[Merged from ${secondaryTicket.ticket_number}] ${secondaryTicketFull.description}`,
          secondaryTicketFull.created_at
        ).run();
      }

      // 2. Close the secondary ticket with a note
      await c.env.DB.prepare(`
        UPDATE tickets
        SET status = 'closed',
            updated_at = ?
        WHERE ticket_id = ?
      `).bind(now, secondaryTicket.ticket_id).run();

      // Add system note to secondary ticket
      const noteId = crypto.randomUUID();
      await c.env.DB.prepare(`
        INSERT INTO ticket_messages (id, ticket_id, sender_type, sender_id, sender_name, content, created_at)
        VALUES (?, ?, 'system', 'system', 'System', ?, ?)
      `).bind(
        noteId,
        secondaryTicket.ticket_id,
        `[Merged] This ticket was merged into ${primaryTicket.ticket_number} by ${user.email}`,
        now
      ).run();
    }

    // Get staff info for proper name display
    const staffInfo = await c.env.DB.prepare(`
      SELECT first_name, last_name FROM staff_users WHERE id = ?
    `).bind(user.id).first() as { first_name: string; last_name: string } | null;
    
    const staffName = staffInfo 
      ? `${staffInfo.first_name} ${staffInfo.last_name}` 
      : user.email;

    // 3. Add system note to primary ticket (visible in conversation)
    const primaryNoteId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO ticket_messages (id, ticket_id, sender_type, sender_id, sender_name, content, created_at)
      VALUES (?, ?, 'system', 'system', 'System', ?, ?)
    `).bind(
      primaryNoteId,
      primaryTicketId,
      `[Merged] Tickets ${mergedTicketNumbers} were merged into this ticket by ${staffName}. All messages have been combined in chronological order.`,
      now
    ).run();

    // 4. Add staff note with merge details (using internal_notes table)
    const staffNoteId = crypto.randomUUID();
    
    // Store the ISO timestamp in the note - frontend will need to parse and format it
    // Format: MERGE_TIMESTAMP:2025-12-03T10:30:00.000Z
    await c.env.DB.prepare(`
      INSERT INTO internal_notes (id, ticket_id, staff_id, note_type, content, created_at, updated_at)
      VALUES (?, ?, ?, 'general', ?, ?, ?)
    `).bind(
      staffNoteId,
      primaryTicketId,
      user.id,
      `Merged: ${primaryTicket.ticket_number} and ${mergedTicketNumbers}\nMERGE_TIMESTAMP:${now}\nBy ${staffName}`,
      now,
      now
    ).run();

    // 5. Update primary ticket with merge info
    try {
      await c.env.DB.prepare(`
        UPDATE tickets
        SET merged_from = ?,
            merged_at = ?,
            merged_by = ?,
            updated_at = ?,
            status = CASE WHEN status IN ('closed', 'resolved') THEN 'open' ELSE status END
        WHERE ticket_id = ?
      `).bind(mergedTicketNumbers, now, staffName, now, primaryTicketId).run();
    } catch (e) {
      // Some columns might not exist yet, try simpler update
      console.log('[Tickets] Some merge columns not found, trying fallback');
      try {
        await c.env.DB.prepare(`
          UPDATE tickets
          SET merged_from = ?,
              updated_at = ?,
              status = CASE WHEN status IN ('closed', 'resolved') THEN 'open' ELSE status END
          WHERE ticket_id = ?
        `).bind(mergedTicketNumbers, now, primaryTicketId).run();
      } catch (e2) {
        // Just update status
        await c.env.DB.prepare(`
          UPDATE tickets
          SET updated_at = ?,
              status = CASE WHEN status IN ('closed', 'resolved') THEN 'open' ELSE status END
          WHERE ticket_id = ?
        `).bind(now, primaryTicketId).run();
      }
    }

    console.log(`[Tickets] Merged ${secondaryTickets.length} tickets into ${primaryTicket.ticket_number} by ${user.email}`);

    return c.json({
      message: 'Tickets merged successfully',
      primary_ticket: primaryTicket.ticket_number,
      merged_tickets: secondaryTickets.map(t => t.ticket_number),
      total_merged: secondaryTickets.length
    });
  } catch (error) {
    console.error('[Tickets] Merge tickets error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}


