/**
 * Chat Messages Controller
 * Handles live chat messaging with AI integration
 */

import type { Context } from 'hono';
import type { Env } from '../types/shared';

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: 'customer' | 'staff' | 'ai' | 'system';
  sender_id: string | null;
  sender_name: string | null;
  content: string;
  created_at: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  attachment_size?: number;
}

interface Conversation {
  id: string;
  ticket_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  status: 'open' | 'in-progress' | 'closed' | 'escalated';
  assigned_to: string | null;
  started_at: string;
  last_message_at: string;
}

/**
 * Start a new chat conversation
 * POST /api/chat/start
 * Public endpoint (no auth required for customers)
 */
export async function startConversation(c: Context<{ Bindings: Env }>) {
  try {
    const body = await c.req.json();
    const { customer } = body;

    console.log('[Chat] Starting new conversation:', { customer });

    if (!customer?.name || !customer?.email) {
      return c.json({ error: 'Customer name and email required' }, 400);
    }

    const now = new Date().toISOString();

    // Create or get customer
    let customerId = await getOrCreateCustomer(c.env.DB, customer.name, customer.email);

    // Create ticket for this chat
    const ticketId = `ticket_chat_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const ticketNumber = await getNextTicketNumber(c.env.DB);

    await c.env.DB.prepare(`
      INSERT INTO tickets (
        ticket_id, ticket_number, customer_id, customer_email, customer_name, subject, description,
        status, priority, category, sentiment, channel, assigned_to, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'open', 'normal', 'chat_inquiry', 'neutral', 'chat', 'ai-agent-001', ?, ?)
    `).bind(
      ticketId,
      ticketNumber,
      customerId,
      customer.email,
      customer.name,
      'Live Chat Conversation',
      'Chat started - awaiting first message',
      now,
      now
    ).run();

    // Create conversation
    const convId = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    
    await c.env.DB.prepare(`
      INSERT INTO chat_conversations (
        id, ticket_id, customer_id, customer_name, customer_email,
        status, assigned_to, started_at, last_message_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'ai_handling', 'ai-agent-001', ?, ?, ?, ?)
    `).bind(
      convId,
      ticketId,
      customerId,
      customer.name,
      customer.email,
      now,
      now,
      now,
      now
    ).run();

    console.log('[Chat] Created new conversation:', convId, 'ticket:', ticketNumber);

    return c.json({
      success: true,
      conversationId: convId,
      ticketId,
      ticketNumber
    });

  } catch (error: any) {
    console.error('[Chat] Start conversation error:', error);
    return c.json({ error: 'Failed to start conversation: ' + error.message }, 500);
  }
}

/**
 * Send a chat message
 * POST /api/chat/message
 * Public endpoint (no auth required for customers)
 */
export async function sendMessage(c: Context<{ Bindings: Env }>) {
  try {
    const body = await c.req.json();
    const { conversationId, message, customer, attachment } = body;

    console.log('[Chat] Received message:', { conversationId, messageLength: message?.length, customer, hasAttachment: !!attachment });

    // Allow empty message if there's an attachment
    if ((!message || typeof message !== 'string' || message.trim().length === 0) && !attachment) {
      return c.json({ error: 'Message or attachment is required' }, 400);
    }

    const now = new Date().toISOString();
    let conversation: Conversation | null = null;
    let isNewConversation = false;

    // Get or create conversation
    if (conversationId) {
      conversation = await c.env.DB.prepare(`
        SELECT * FROM chat_conversations WHERE id = ?
      `).bind(conversationId).first<Conversation>();
    }

    if (!conversation) {
      // Validate customer info for new conversation
      if (!customer?.name || !customer?.email) {
        return c.json({ error: 'Customer name and email required for new conversation' }, 400);
      }

      isNewConversation = true;

      // Create or get customer
      let customerId = await getOrCreateCustomer(c.env.DB, customer.name, customer.email);

      // Create ticket for this chat
      const ticketId = `ticket_chat_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const ticketNumber = await getNextTicketNumber(c.env.DB);

      await c.env.DB.prepare(`
        INSERT INTO tickets (
          ticket_id, ticket_number, customer_id, customer_email, customer_name, subject, description,
          status, priority, category, sentiment, channel, assigned_to, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'open', 'normal', 'chat_inquiry', 'neutral', 'chat', 'ai-agent-001', ?, ?)
      `).bind(
        ticketId,
        ticketNumber,
        customerId,
        customer.email,
        customer.name,
        'Live Chat Conversation',
        message.trim(), // Use the first message as description
        now,
        now
      ).run();

      // Create conversation
      const convId = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      
      await c.env.DB.prepare(`
        INSERT INTO chat_conversations (
          id, ticket_id, customer_id, customer_name, customer_email,
          status, assigned_to, started_at, last_message_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'open', 'ai-agent-001', ?, ?, ?, ?)
      `).bind(
        convId,
        ticketId,
        customerId,
        customer.name,
        customer.email,
        now,
        now,
        now,
        now
      ).run();

      conversation = {
        id: convId,
        ticket_id: ticketId,
        customer_id: customerId,
        customer_name: customer.name,
        customer_email: customer.email,
        status: 'open',
        assigned_to: 'ai-agent-001',
        started_at: now,
        last_message_at: now
      };

      console.log('[Chat] Created new conversation:', convId);
    }

    // Save customer message
    const customerMsgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const messageContent = message?.trim() || (attachment ? `📎 ${attachment.name}` : '');
    
    await c.env.DB.prepare(`
      INSERT INTO chat_messages (id, conversation_id, sender_type, sender_id, sender_name, content, created_at, attachment_url, attachment_name, attachment_type, attachment_size)
      VALUES (?, ?, 'customer', ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      customerMsgId,
      conversation.id,
      conversation.customer_id,
      conversation.customer_name,
      messageContent,
      now,
      attachment?.url || null,
      attachment?.name || null,
      attachment?.type || null,
      attachment?.size || null
    ).run();

    // Update conversation last_message_at
    await c.env.DB.prepare(`
      UPDATE chat_conversations SET last_message_at = ?, updated_at = ? WHERE id = ?
    `).bind(now, now, conversation.id).run();

    // Re-fetch conversation to get current status
    const currentConversation = await c.env.DB.prepare(`
      SELECT assigned_to, status FROM chat_conversations WHERE id = ?
    `).bind(conversation.id).first<{ assigned_to: string | null; status: string }>();

    // AI should respond if:
    // 1. status is 'ai_handling' (AI is primary handler)
    // 2. status is 'queued' (customer can still chat with AI while waiting)
    // AI should NOT respond if:
    // - status is 'assigned' or 'staff_handling' (staff has taken over)
    const shouldAIRespond = currentConversation?.status === 'ai_handling' || currentConversation?.status === 'queued';
    
    console.log('[Chat] Conversation handler:', { 
      conversationId: conversation.id, 
      status: currentConversation?.status,
      assignedTo: currentConversation?.assigned_to,
      shouldAIRespond 
    });

    // If staff has taken over, don't generate AI response - staff will reply manually
    if (!shouldAIRespond) {
      console.log('[Chat] Staff has taken over - not generating AI response');
      return c.json({
        success: true,
        conversationId: conversation.id,
        messageId: customerMsgId,
        response: null, // No automatic response - staff will reply
        sender: 'staff',
        senderName: null,
        staffTakeover: true
      });
    }

    // Get AI response
    let aiResponse = '';
    let aiSenderName = 'McCarthy AI';
    let shouldCloseChat = false;

    try {
      const aiResult = await getAIResponse(c.env, message, conversation, isNewConversation);
      aiResponse = aiResult.response;
      shouldCloseChat = aiResult.closeChat || false;
    } catch (error: any) {
      console.error('[Chat] AI response error:', error);
      aiResponse = "Thanks for your message! I'm processing your request. A team member will assist you shortly if needed.";
    }

    // Save AI response
    const aiMsgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    await c.env.DB.prepare(`
      INSERT INTO chat_messages (id, conversation_id, sender_type, sender_id, sender_name, content, created_at)
      VALUES (?, ?, 'ai', 'ai-agent-001', ?, ?, ?)
    `).bind(
      aiMsgId,
      conversation.id,
      aiSenderName,
      aiResponse,
      new Date().toISOString()
    ).run();

    console.log('[Chat] AI responded to conversation:', conversation.id);

    // Analyze chat message for priority and sentiment (async, don't wait)
    analyzeChatPriorityAndSentiment(c.env, conversation.ticket_id, message).catch(err => {
      console.error('[Chat] Priority/sentiment analysis error:', err);
    });

    return c.json({
      success: true,
      conversationId: conversation.id,
      messageId: customerMsgId,
      response: aiResponse,
      sender: 'ai',
      senderName: aiSenderName,
      chatClosed: shouldCloseChat
    });

  } catch (error: any) {
    console.error('[Chat] Send message error:', error);
    return c.json({ error: 'Failed to send message: ' + error.message }, 500);
  }
}

/**
 * Get conversation history
 * GET /api/chat/conversation/:id
 */
export async function getConversation(c: Context<{ Bindings: Env }>) {
  try {
    const conversationId = c.req.param('id');

    const conversation = await c.env.DB.prepare(`
      SELECT c.*,
        s.first_name as assigned_staff_first_name,
        s.last_name as assigned_staff_last_name,
        t.ticket_number,
        t.priority,
        t.sentiment
      FROM chat_conversations c
      LEFT JOIN staff_users s ON c.assigned_to = s.id
      LEFT JOIN tickets t ON c.ticket_id = t.ticket_id
      WHERE c.id = ?
    `).bind(conversationId).first();

    if (!conversation) {
      return c.json({ error: 'Conversation not found' }, 404);
    }

    const { results: messages } = await c.env.DB.prepare(`
      SELECT * FROM chat_messages 
      WHERE conversation_id = ? 
      ORDER BY created_at ASC
    `).bind(conversationId).all<ChatMessage>();

    return c.json({
      conversation,
      messages
    });

  } catch (error: any) {
    console.error('[Chat] Get conversation error:', error);
    return c.json({ error: 'Failed to get conversation' }, 500);
  }
}

/**
 * Get conversation by ticket ID
 * GET /api/chat/conversation/by-ticket/:ticketId
 */
export async function getConversationByTicket(c: Context<{ Bindings: Env }>) {
  try {
    const ticketId = c.req.param('ticketId');

    const conversation = await c.env.DB.prepare(`
      SELECT c.*,
        s.first_name as assigned_staff_first_name,
        s.last_name as assigned_staff_last_name,
        t.ticket_number,
        t.priority,
        t.sentiment
      FROM chat_conversations c
      LEFT JOIN staff_users s ON c.assigned_to = s.id
      LEFT JOIN tickets t ON c.ticket_id = t.ticket_id
      WHERE c.ticket_id = ?
    `).bind(ticketId).first();

    if (!conversation) {
      return c.json({ error: 'Conversation not found for this ticket' }, 404);
    }

    return c.json({ conversation });

  } catch (error: any) {
    console.error('[Chat] Get conversation by ticket error:', error);
    return c.json({ error: 'Failed to get conversation' }, 500);
  }
}

/**
 * Poll for new messages (public endpoint for widget)
 * GET /api/chat/conversation/:id/poll
 */
export async function pollMessages(c: Context<{ Bindings: Env }>) {
  try {
    const conversationId = c.req.param('id');

    // Get all messages for this conversation including attachments
    const { results: messages } = await c.env.DB.prepare(`
      SELECT id, sender_type, sender_name, content, created_at, 
             attachment_url, attachment_name, attachment_type, attachment_size
      FROM chat_messages 
      WHERE conversation_id = ? 
      ORDER BY created_at ASC
    `).bind(conversationId).all();

    return c.json({ messages });

  } catch (error: any) {
    console.error('[Chat] Poll messages error:', error);
    return c.json({ error: 'Failed to poll messages' }, 500);
  }
}

/**
 * List active chat conversations (for staff dashboard)
 * GET /api/chat/conversations
 */
export async function listConversations(c: Context<{ Bindings: Env }>) {
  try {
    const tab = c.req.query('tab') || 'ai';
    const countOnly = c.req.query('count_only') === 'true';
    const status = c.req.query('status'); // Legacy support

    // Build WHERE clause based on tab (using new status model)
    // Statuses: ai_handling, queued, assigned, staff_handling, closed
    let whereClause = '';
    switch (tab) {
      case 'ai':
        // Active chats being handled by AI (includes queued chats that can still talk to AI)
        whereClause = `c.status IN ('ai_handling', 'queued')`;
        break;
      case 'staff':
        // Active chats with staff (assigned or actively handling)
        whereClause = `c.status IN ('assigned', 'staff_handling')`;
        break;
      case 'queued':
        // Awaiting staff pickup (in waiting room)
        whereClause = `c.status = 'queued'`;
        break;
      case 'closed':
        // Resolved & inactive chats
        whereClause = `c.status = 'closed'`;
        break;
      default:
        // Legacy: filter by status or show all active
        if (status) {
          whereClause = `c.status = '${status}'`;
        } else {
          whereClause = `c.status IN ('ai_handling', 'queued', 'assigned', 'staff_handling')`;
        }
    }

    // Count only mode for tab badges
    if (countOnly) {
      const countResult = await c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM chat_conversations c WHERE ${whereClause}
      `).first<{ count: number }>();
      return c.json({ count: countResult?.count || 0 });
    }

    const { results } = await c.env.DB.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM chat_messages WHERE conversation_id = c.id) as message_count,
        (SELECT content FROM chat_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        s.first_name as assigned_staff_first_name,
        s.last_name as assigned_staff_last_name,
        t.ticket_number,
        t.priority,
        t.sentiment
      FROM chat_conversations c
      LEFT JOIN staff_users s ON c.assigned_to = s.id
      LEFT JOIN tickets t ON c.ticket_id = t.ticket_id
      WHERE ${whereClause}
      ORDER BY ${tab === 'queued' ? 'c.queue_entered_at ASC' : 'c.last_message_at DESC'}
      LIMIT 50
    `).all();

    return c.json({ conversations: results });

  } catch (error: any) {
    console.error('[Chat] List conversations error:', error);
    return c.json({ error: 'Failed to list conversations' }, 500);
  }
}

/**
 * Staff takes over a conversation
 * POST /api/chat/conversation/:id/takeover
 */
export async function takeoverConversation(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as { id: string; email: string; role: string };
    const conversationId = c.req.param('id');

    // Get staff name
    const staff = await c.env.DB.prepare(`
      SELECT first_name, last_name FROM staff_users WHERE id = ?
    `).bind(user.id).first<{ first_name: string; last_name: string }>();

    const staffFirstName = staff?.first_name || 'Support Agent';
    const staffFullName = staff ? `${staff.first_name} ${staff.last_name || ''}`.trim() : 'Support Agent';

    // Update conversation - staff takes over, set to staff_handling
    const now = new Date().toISOString();
    
    // Get the ticket_id for this conversation
    const conv = await c.env.DB.prepare(`
      SELECT ticket_id FROM chat_conversations WHERE id = ?
    `).bind(conversationId).first<{ ticket_id: string }>();
    
    await c.env.DB.prepare(`
      UPDATE chat_conversations 
      SET assigned_to = ?, status = 'staff_handling', queue_assigned_at = ?, updated_at = ?
      WHERE id = ?
    `).bind(user.id, now, now, conversationId).run();

    // Also update the ticket's assigned_to so it shows in staff's ticket queue
    if (conv?.ticket_id) {
      await c.env.DB.prepare(`
        UPDATE tickets 
        SET assigned_to = ?, status = 'in-progress', updated_at = ?
        WHERE ticket_id = ?
      `).bind(user.id, now, conv.ticket_id).run();
    }

    // Add system message - use first name only for customer-facing message
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    await c.env.DB.prepare(`
      INSERT INTO chat_messages (id, conversation_id, sender_type, sender_id, sender_name, content, created_at)
      VALUES (?, ?, 'system', ?, ?, ?, ?)
    `).bind(
      msgId,
      conversationId,
      user.id,
      staffFirstName,
      `${staffFirstName} has joined the conversation`,
      now
    ).run();

    console.log(`[Chat] ${staffFullName} took over conversation ${conversationId}`);

    return c.json({ 
      success: true, 
      message: 'Conversation taken over',
      staffName: staffFirstName 
    });

  } catch (error: any) {
    console.error('[Chat] Takeover error:', error);
    return c.json({ error: 'Failed to takeover conversation' }, 500);
  }
}

/**
 * Staff sends a message
 * POST /api/chat/conversation/:id/reply
 */
export async function staffReply(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as { id: string; email: string; role: string };
    const conversationId = c.req.param('id');
    const { message, attachment } = await c.req.json();

    // Allow empty message if there's an attachment
    if ((!message || message.trim().length === 0) && !attachment) {
      return c.json({ error: 'Message or attachment is required' }, 400);
    }

    // Get staff name
    const staff = await c.env.DB.prepare(`
      SELECT first_name, last_name FROM staff_users WHERE id = ?
    `).bind(user.id).first<{ first_name: string; last_name: string }>();

    const staffFirstName = staff?.first_name || 'Support Agent';
    const staffFullName = staff ? `${staff.first_name} ${staff.last_name || ''}`.trim() : 'Support Agent';

    // Save message
    const now = new Date().toISOString();
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const messageContent = message?.trim() || (attachment ? `📎 ${attachment.name}` : '');
    
    await c.env.DB.prepare(`
      INSERT INTO chat_messages (id, conversation_id, sender_type, sender_id, sender_name, content, created_at, attachment_url, attachment_name, attachment_type, attachment_size)
      VALUES (?, ?, 'staff', ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      msgId,
      conversationId,
      user.id,
      staffFirstName, // Use first name only for customer-facing
      messageContent,
      now,
      attachment?.url || null,
      attachment?.name || null,
      attachment?.type || null,
      attachment?.size || null
    ).run();

    // Update conversation
    await c.env.DB.prepare(`
      UPDATE chat_conversations SET last_message_at = ?, updated_at = ? WHERE id = ?
    `).bind(now, now, conversationId).run();

    console.log(`[Chat] Staff ${staffFullName} replied to ${conversationId}`);

    return c.json({
      success: true,
      messageId: msgId,
      senderName: staffFirstName,
      attachments: attachment ? [attachment] : []
    });

  } catch (error: any) {
    console.error('[Chat] Staff reply error:', error);
    return c.json({ error: 'Failed to send reply' }, 500);
  }
}

/**
 * Staff picks up a conversation from queue
 * POST /api/chat/conversation/:id/pickup
 */
export async function pickupFromQueue(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as { id: string; email: string; role: string };
    const conversationId = c.req.param('id');

    // Get staff name
    const staff = await c.env.DB.prepare(`
      SELECT first_name, last_name FROM staff_users WHERE id = ?
    `).bind(user.id).first<{ first_name: string; last_name: string }>();

    const staffFirstName = staff?.first_name || 'Support Agent';

    // Update conversation - assign to staff and set staff_handling
    const now = new Date().toISOString();
    
    // Get the ticket_id for this conversation
    const conv = await c.env.DB.prepare(`
      SELECT ticket_id FROM chat_conversations WHERE id = ?
    `).bind(conversationId).first<{ ticket_id: string }>();
    
    await c.env.DB.prepare(`
      UPDATE chat_conversations 
      SET assigned_to = ?, status = 'staff_handling', queue_assigned_at = ?, updated_at = ?
      WHERE id = ?
    `).bind(user.id, now, now, conversationId).run();

    // Also update the ticket's assigned_to so it shows in staff's ticket queue
    if (conv?.ticket_id) {
      await c.env.DB.prepare(`
        UPDATE tickets 
        SET assigned_to = ?, status = 'in-progress', updated_at = ?
        WHERE ticket_id = ?
      `).bind(user.id, now, conv.ticket_id).run();
    }

    // Add system message
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    await c.env.DB.prepare(`
      INSERT INTO chat_messages (id, conversation_id, sender_type, sender_id, sender_name, content, created_at)
      VALUES (?, ?, 'system', ?, ?, ?, ?)
    `).bind(
      msgId,
      conversationId,
      user.id,
      staffFirstName,
      `${staffFirstName} has joined the conversation`,
      now
    ).run();

    console.log('[Chat] Staff picked up conversation:', conversationId, 'by:', staffFirstName);

    return c.json({ success: true, message: 'Conversation picked up' });

  } catch (error: any) {
    console.error('[Chat] Pickup from queue error:', error);
    return c.json({ error: 'Failed to pick up conversation' }, 500);
  }
}

/**
 * Close a conversation
 * POST /api/chat/conversation/:id/close
 */
export async function closeConversation(c: Context<{ Bindings: Env }>) {
  try {
    const conversationId = c.req.param('id');
    const now = new Date().toISOString();
    
    // Get resolution type from body (staff closing) or default
    let resolutionType = 'inactive_closed';
    let resolvedBy: string | null = null;
    
    try {
      const body = await c.req.json();
      if (body.resolution_type === 'resolved') {
        // Check if it was AI or staff who resolved
        const user = c.get('user') as { id: string } | undefined;
        if (user) {
          resolutionType = 'staff_resolved';
          resolvedBy = user.id;
        } else {
          resolutionType = 'ai_resolved';
          resolvedBy = 'ai-agent-001';
        }
      } else if (body.resolution_type === 'closed') {
        resolutionType = 'inactive_closed';
      }
    } catch {
      // No body, use defaults
    }

    // Get current conversation to check who's assigned and get ticket_id
    const conv = await c.env.DB.prepare(`
      SELECT assigned_to, ticket_id FROM chat_conversations WHERE id = ?
    `).bind(conversationId).first<{ assigned_to: string | null; ticket_id: string }>();

    if (!resolvedBy && conv?.assigned_to) {
      resolvedBy = conv.assigned_to;
      if (conv.assigned_to === 'ai-agent-001' && resolutionType !== 'inactive_closed') {
        resolutionType = 'ai_resolved';
      }
    }

    await c.env.DB.prepare(`
      UPDATE chat_conversations 
      SET status = 'closed', ended_at = ?, updated_at = ?, 
          resolution_type = ?, resolved_by = ?, resolved_at = ?
      WHERE id = ?
    `).bind(now, now, resolutionType, resolvedBy, now, conversationId).run();

    // Also update the ticket status to match
    if (conv?.ticket_id) {
      const ticketStatus = resolutionType === 'inactive_closed' ? 'closed' : 'resolved';
      await c.env.DB.prepare(`
        UPDATE tickets 
        SET status = ?, updated_at = ?
        WHERE ticket_id = ?
      `).bind(ticketStatus, now, conv.ticket_id).run();
    }

    // Add system message
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const closeMessage = resolutionType === 'ai_resolved' 
      ? 'Conversation resolved by AI' 
      : resolutionType === 'staff_resolved'
        ? 'Conversation resolved by staff'
        : 'Conversation closed due to inactivity';
        
    await c.env.DB.prepare(`
      INSERT INTO chat_messages (id, conversation_id, sender_type, sender_id, sender_name, content, created_at)
      VALUES (?, ?, 'system', NULL, NULL, ?, ?)
    `).bind(msgId, conversationId, closeMessage, now).run();

    return c.json({ success: true, message: 'Conversation closed', resolution_type: resolutionType });

  } catch (error: any) {
    console.error('[Chat] Close conversation error:', error);
    return c.json({ error: 'Failed to close conversation' }, 500);
  }
}

/**
 * Reassign a conversation to another staff member or back to AI
 * POST /api/chat/conversation/:id/reassign
 */
export async function reassignConversation(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as { id: string; email: string; role: string };
    const conversationId = c.req.param('id');
    const { assignTo, reason } = await c.req.json();

    if (!assignTo) {
      return c.json({ error: 'assignTo is required' }, 400);
    }

    const now = new Date().toISOString();

    // Get current staff info
    const currentStaff = await c.env.DB.prepare(`
      SELECT first_name FROM staff_users WHERE id = ?
    `).bind(user.id).first<{ first_name: string }>();
    const currentStaffName = currentStaff?.first_name || 'Staff';

    // Determine new status and get new assignee info
    let newStatus: string;
    let newAssigneeName: string;

    if (assignTo === 'ai-agent-001') {
      // Hand back to AI
      newStatus = 'ai_handling';
      newAssigneeName = 'McCarthy AI';
    } else {
      // Assign to another staff member
      const newStaff = await c.env.DB.prepare(`
        SELECT first_name FROM staff_users WHERE id = ?
      `).bind(assignTo).first<{ first_name: string }>();
      
      if (!newStaff) {
        return c.json({ error: 'Staff member not found' }, 404);
      }
      
      newStatus = 'assigned';
      newAssigneeName = newStaff.first_name;
    }

    // Get ticket_id for the conversation first
    const conv = await c.env.DB.prepare(`
      SELECT ticket_id FROM chat_conversations WHERE id = ?
    `).bind(conversationId).first<{ ticket_id: string }>();

    // Update conversation
    await c.env.DB.prepare(`
      UPDATE chat_conversations 
      SET assigned_to = ?, status = ?, updated_at = ?
      WHERE id = ?
    `).bind(assignTo, newStatus, now, conversationId).run();

    // Also update the ticket's assigned_to so it shows in the correct staff's ticket queue
    if (conv?.ticket_id) {
      const ticketStatus = assignTo === 'ai-agent-001' ? 'open' : 'in-progress';
      await c.env.DB.prepare(`
        UPDATE tickets 
        SET assigned_to = ?, status = ?, updated_at = ?
        WHERE ticket_id = ?
      `).bind(assignTo === 'ai-agent-001' ? null : assignTo, ticketStatus, now, conv.ticket_id).run();
    }

    // Add system message about reassignment
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const systemMessage = assignTo === 'ai-agent-001'
      ? `${currentStaffName} has handed the conversation back to McCarthy AI`
      : `${currentStaffName} has transferred the conversation to ${newAssigneeName}`;
    
    await c.env.DB.prepare(`
      INSERT INTO chat_messages (id, conversation_id, sender_type, sender_id, sender_name, content, created_at)
      VALUES (?, ?, 'system', ?, ?, ?, ?)
    `).bind(
      msgId,
      conversationId,
      user.id,
      currentStaffName,
      systemMessage,
      now
    ).run();

    // Add staff note if reason provided
    if (reason && conv?.ticket_id) {
      const noteId = `note_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      await c.env.DB.prepare(`
        INSERT INTO ticket_notes (id, ticket_id, user_id, content, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        noteId,
        conv.ticket_id,
        user.id,
        `🔄 Chat Reassigned: ${reason}`,
        now
      ).run();
    }

    console.log(`[Chat] ${currentStaffName} reassigned conversation ${conversationId} to ${newAssigneeName}`);

    return c.json({ 
      success: true, 
      message: `Conversation reassigned to ${newAssigneeName}`,
      newAssignee: newAssigneeName,
      newStatus
    });

  } catch (error: any) {
    console.error('[Chat] Reassign conversation error:', error);
    return c.json({ error: 'Failed to reassign conversation' }, 500);
  }
}

/**
 * Submit a callback request (when offline)
 * POST /api/chat/callback
 * Public endpoint
 */
export async function submitCallback(c: Context<{ Bindings: Env }>) {
  try {
    const body = await c.req.json();
    const { name, email, phone, message, orderId } = body;

    console.log('[Chat] Callback request:', { name, email, phone });

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return c.json({ error: 'Name, email, phone, and message are required' }, 400);
    }

    const now = new Date().toISOString();

    // Create or get customer
    const customerId = await getOrCreateCustomer(c.env.DB, name, email);

    // Create a ticket for the callback request
    const ticketId = `ticket_callback_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const ticketNumber = await getNextTicketNumber(c.env.DB);

    const description = `📞 CALLBACK REQUEST

Name: ${name}
Email: ${email}
Phone: ${phone}
${orderId ? `Order ID: ${orderId}` : ''}

Message:
${message}`;

    await c.env.DB.prepare(`
      INSERT INTO tickets (
        ticket_id, ticket_number, customer_id, customer_email, customer_name, subject, description,
        status, priority, category, sentiment, channel, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'open', 'high', 'callback_request', 'neutral', 'phone', ?, ?)
    `).bind(
      ticketId,
      ticketNumber,
      customerId,
      email,
      name,
      `Callback Request from ${name}`,
      description,
      now,
      now
    ).run();

    console.log('[Chat] Created callback ticket:', ticketNumber);

    return c.json({
      success: true,
      ticketNumber,
      message: 'Your callback request has been submitted. We will contact you shortly!'
    });

  } catch (error: any) {
    console.error('[Chat] Callback submission error:', error);
    return c.json({ error: 'Failed to submit callback request' }, 500);
  }
}

/**
 * Get embed code for chat widget
 * GET /api/chat/embed-code
 */
export async function getEmbedCode(c: Context<{ Bindings: Env }>) {
  try {
    // Get chat widget settings
    const settings = await c.env.DB.prepare(`
      SELECT * FROM chat_widget_settings LIMIT 1
    `).first();

    const apiUrl = 'https://dartmouth-os-worker.dartmouth.workers.dev';
    const widgetUrl = 'https://customer-service-dashboard.pages.dev/mccarthy-chat.iife.js'; // TODO: Update with actual CDN URL

    const embedCode = `<!-- McCarthy AI Chat Widget -->
<script>
  window.mccarthyChatConfig = {
    apiUrl: '${apiUrl}',
    primaryColor: '${(settings as any)?.primary_color || '#4F46E5'}',
    secondaryColor: '${(settings as any)?.secondary_color || '#818CF8'}',
    textColor: '${(settings as any)?.text_color || '#FFFFFF'}',
    buttonText: '${(settings as any)?.button_text || 'Chat with us'}',
    welcomeMessage: '${((settings as any)?.welcome_message || "Hi! 👋 I'm McCarthy AI. How can I help you today?").replace(/'/g, "\\'")}',
    offlineMessage: '${((settings as any)?.offline_message || "We're currently offline. Please leave a message!").replace(/'/g, "\\'")}'
  };
</script>
<script src="${widgetUrl}" async></script>`;

    return c.json({
      embedCode,
      settings: settings || {},
      instructions: [
        '1. Copy the embed code above',
        '2. Paste it just before the closing </body> tag on your website',
        '3. The chat widget will appear in the bottom-right corner',
        '4. Customize colors and messages in Chat Widget Settings'
      ]
    });

  } catch (error: any) {
    console.error('[Chat] Get embed code error:', error);
    return c.json({ error: 'Failed to generate embed code' }, 500);
  }
}

// ============ Helper Functions ============

async function getOrCreateCustomer(db: D1Database, name: string, email: string): Promise<string> {
  const existing = await db.prepare(`
    SELECT id FROM customers WHERE email = ?
  `).bind(email.toLowerCase()).first<{ id: string }>();

  if (existing) return existing.id;

  const id = `cust_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const now = new Date().toISOString();

  await db.prepare(`
    INSERT INTO customers (id, email, name, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(id, email.toLowerCase(), name, now, now).run();

  return id;
}

async function getNextTicketNumber(db: D1Database): Promise<string> {
  const result = await db.prepare(`
    SELECT MAX(CAST(SUBSTR(ticket_number, 5) AS INTEGER)) as max_num 
    FROM tickets 
    WHERE ticket_number LIKE 'TKT-%'
  `).first<{ max_num: number | null }>();

  const nextNum = (result?.max_num || 0) + 1;
  return `TKT-${String(nextNum).padStart(6, '0')}`;
}

// Check if message is requesting human assistance
function isRequestingHuman(message: string): boolean {
  // Only match EXPLICIT requests for human assistance
  // Avoid generic words like "help me", "person", "agent" that could appear in normal questions
  const humanKeywords = [
    'speak to a human', 'talk to a human', 'real human', 'need a human', 'want a human',
    'real person', 'actual person', 'speak to someone', 'talk to someone',
    'speak to a person', 'talk to a person', 'connect me to a person',
    'representative please', 'staff please', 'human please',
    'not helping', 'useless bot', 'useless ai', 'stupid bot', 'stupid ai',
    'transfer me', 'escalate please', 'escalate this',
    'manager please', 'supervisor please',
    'is anyone there', 'anyone free to help', 'is anyone available',
    'live agent please', 'live person please', 'real support please',
    'i want to speak to', 'i need to speak to', 'let me talk to',
    'can i speak to someone', 'can i talk to someone'
  ];
  
  const lowerMessage = message.toLowerCase();
  const matched = humanKeywords.some(keyword => lowerMessage.includes(keyword));
  
  if (matched) {
    console.log('[Chat] HUMAN KEYWORD DETECTED in message:', message);
  }
  
  return matched;
}

// Check if message is requesting a callback
function isRequestingCallback(message: string): boolean {
  const callbackKeywords = [
    'callback', 'call back', 'call me', 'phone call',
    'ring me', 'give me a call', 'prefer to talk',
    'speak on the phone', 'can you call', 'please call',
    'want a call', 'need a call', 'call me back',
    'phone me', 'call my number', 'call my phone'
  ];
  
  const lowerMessage = message.toLowerCase();
  return callbackKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Extract phone number from message
function extractPhoneNumber(message: string): string | null {
  // Match various phone number formats
  const phonePatterns = [
    /\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g, // International format
    /\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g, // Local format
    /0\d{9,10}/g, // Australian mobile (0400000000)
    /\d{10,12}/g // Plain digits
  ];
  
  for (const pattern of phonePatterns) {
    const matches = message.match(pattern);
    if (matches) {
      // Return the first match that looks like a valid phone (at least 8 digits)
      const validPhone = matches.find(m => m.replace(/\D/g, '').length >= 8);
      if (validPhone) return validPhone;
    }
  }
  
  return null;
}

// Create callback ticket and close conversation
async function createCallbackAndCloseChat(
  db: D1Database,
  conversation: Conversation,
  phoneNumber: string,
  chatHistory: string
): Promise<string> {
  const now = new Date().toISOString();
  
  // Create callback ticket
  const ticketId = `ticket_callback_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const ticketNumber = await getNextTicketNumber(db);
  
  const description = `📞 CALLBACK REQUEST (from Live Chat)

Customer: ${conversation.customer_name}
Email: ${conversation.customer_email}
Phone: ${phoneNumber}

Chat Summary:
${chatHistory}`;

  await db.prepare(`
    INSERT INTO tickets (
      ticket_id, ticket_number, customer_id, customer_email, customer_name, subject, description,
      status, priority, category, sentiment, channel, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'open', 'high', 'callback_request', 'neutral', 'phone', ?, ?)
  `).bind(
    ticketId,
    ticketNumber,
    conversation.customer_id,
    conversation.customer_email,
    conversation.customer_name,
    `Callback Request from ${conversation.customer_name}`,
    description,
    now,
    now
  ).run();
  
  // Close the chat conversation
  await db.prepare(`
    UPDATE chat_conversations 
    SET status = 'closed', ended_at = ?, updated_at = ?, resolution_type = 'ai_resolved', resolved_by = 'ai-agent-001', resolved_at = ?
    WHERE id = ?
  `).bind(now, now, now, conversation.id).run();
  
  // Also close the original chat ticket
  const convWithTicket = await db.prepare(`
    SELECT ticket_id FROM chat_conversations WHERE id = ?
  `).bind(conversation.id).first<{ ticket_id: string }>();
  
  if (convWithTicket?.ticket_id) {
    await db.prepare(`
      UPDATE tickets SET status = 'resolved', updated_at = ? WHERE ticket_id = ?
    `).bind(now, convWithTicket.ticket_id).run();
  }
  
  console.log(`[Chat] Created callback ticket ${ticketNumber} and closed conversation ${conversation.id}`);
  
  return ticketNumber;
}

// Get available online staff
async function getAvailableStaff(db: D1Database): Promise<{ id: string; first_name: string; last_name: string } | null> {
  const result = await db.prepare(`
    SELECT id, first_name, last_name 
    FROM staff_users 
    WHERE availability_status = 'online' 
    AND role IN ('admin', 'agent')
    AND id != 'ai-agent-001'
    AND first_name IS NOT NULL
    AND first_name != ''
    ORDER BY RANDOM()
    LIMIT 1
  `).first<{ id: string; first_name: string; last_name: string }>();
  
  console.log('[Chat] Available staff query result:', result);
  
  return result || null;
}

// Add conversation to queue (waiting for staff pickup)
async function addToQueue(
  db: D1Database, 
  conversationId: string
): Promise<void> {
  const now = new Date().toISOString();
  
  // Update conversation to queued status
  await db.prepare(`
    UPDATE chat_conversations 
    SET status = 'queued', queue_entered_at = ?, updated_at = ?
    WHERE id = ?
  `).bind(now, now, conversationId).run();
  
  // Add system message
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  await db.prepare(`
    INSERT INTO chat_messages (id, conversation_id, sender_type, sender_id, sender_name, content, created_at)
    VALUES (?, ?, 'system', NULL, NULL, ?, ?)
  `).bind(
    msgId,
    conversationId,
    'You have been added to the queue. A customer support team member will be with you shortly. You can continue chatting with me in the meantime!',
    now
  ).run();
  
  console.log(`[Chat] Added conversation ${conversationId} to queue`);
}

// Directly assign conversation to staff (bypass queue)
async function assignToStaff(
  db: D1Database, 
  conversationId: string, 
  staffId: string, 
  staffFirstName: string
): Promise<void> {
  const now = new Date().toISOString();
  
  // Get the ticket_id for this conversation
  const conv = await db.prepare(`
    SELECT ticket_id FROM chat_conversations WHERE id = ?
  `).bind(conversationId).first<{ ticket_id: string }>();
  
  // Update conversation - assign directly with 'staff_handling' status
  await db.prepare(`
    UPDATE chat_conversations 
    SET assigned_to = ?, status = 'staff_handling', queue_assigned_at = ?, updated_at = ?
    WHERE id = ?
  `).bind(staffId, now, now, conversationId).run();
  
  // Also update the ticket's assigned_to so it shows in staff's ticket queue
  if (conv?.ticket_id) {
    await db.prepare(`
      UPDATE tickets 
      SET assigned_to = ?, status = 'in-progress', updated_at = ?
      WHERE ticket_id = ?
    `).bind(staffId, now, conv.ticket_id).run();
  }
  
  // Add system message - staff will pick up
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  await db.prepare(`
    INSERT INTO chat_messages (id, conversation_id, sender_type, sender_id, sender_name, content, created_at)
    VALUES (?, ?, 'system', ?, ?, ?, ?)
  `).bind(
    msgId,
    conversationId,
    staffId,
    staffFirstName,
    `${staffFirstName} has joined the chat`,
    now
  ).run();
  
  console.log(`[Chat] Assigned conversation ${conversationId} to ${staffFirstName}`);
}

// Get staff with lowest active ticket count (less than 3 active)
async function getAvailableStaffWithCapacity(db: D1Database): Promise<{ id: string; first_name: string; active_count: number } | null> {
  // Get online staff with their active chat counts (using new status model)
  const { results } = await db.prepare(`
    SELECT 
      s.id, 
      s.first_name,
      COUNT(CASE WHEN c.status IN ('assigned', 'staff_handling') THEN 1 END) as active_count
    FROM staff_users s
    LEFT JOIN chat_conversations c ON c.assigned_to = s.id AND c.status IN ('assigned', 'staff_handling')
    WHERE s.availability_status = 'online'
      AND s.id != 'ai-agent-001'
    GROUP BY s.id, s.first_name
    HAVING active_count < 3
    ORDER BY active_count ASC
    LIMIT 1
  `).all<{ id: string; first_name: string; active_count: number }>();
  
  return results.length > 0 ? results[0] : null;
}

async function getAIResponse(env: Env, message: string, conversation: Conversation, isNew: boolean): Promise<{ response: string; closeChat?: boolean }> {
  console.log('[Chat] Getting AI response for:', message.substring(0, 50));
  console.log('[Chat] Conversation ID:', conversation.id);

  // Check if message contains a phone number (customer providing callback number)
  const phoneNumber = extractPhoneNumber(message);
  if (phoneNumber) {
    // Check if this conversation was waiting for a callback number
    // by looking at recent messages for callback request context
    const { results: recentMessages } = await env.DB.prepare(`
      SELECT content FROM chat_messages 
      WHERE conversation_id = ? AND sender_type = 'ai'
      ORDER BY created_at DESC LIMIT 3
    `).bind(conversation.id).all<{ content: string }>();
    
    const wasAskingForPhone = recentMessages.some(m => 
      m.content.toLowerCase().includes('phone number') || 
      m.content.toLowerCase().includes('callback')
    );
    
    if (wasAskingForPhone) {
      console.log('[Chat] Phone number received for callback:', phoneNumber);
      
      // Get chat history for the ticket
      const { results: allMessages } = await env.DB.prepare(`
        SELECT sender_type, sender_name, content, created_at FROM chat_messages 
        WHERE conversation_id = ? ORDER BY created_at ASC
      `).bind(conversation.id).all<{ sender_type: string; sender_name: string; content: string; created_at: string }>();
      
      const chatHistory = allMessages.map(m => 
        `[${m.sender_type}${m.sender_name ? ` - ${m.sender_name}` : ''}]: ${m.content}`
      ).join('\n');
      
      // Create callback ticket and close chat
      const ticketNumber = await createCallbackAndCloseChat(
        env.DB,
        conversation,
        phoneNumber,
        chatHistory
      );
      
      return {
        response: `Thank you! 📞 Your callback request has been submitted (Reference: ${ticketNumber}).\n\nOne of our staff will call you back at ${phoneNumber} within 24 hours during business hours.\n\nThank you for chatting with us today. This conversation is now closed.`,
        closeChat: true
      };
    }
  }

  // Check if customer is requesting a callback
  if (isRequestingCallback(message)) {
    console.log('[Chat] Customer requesting callback');
    return {
      response: "I'd be happy to arrange a callback for you! 📞\n\nPlease provide your phone number and one of our team members will call you back within 24 hours during business hours."
    };
  }

  // Check if customer is requesting human assistance
  if (isRequestingHuman(message)) {
    console.log('[Chat] Customer requesting human assistance - DETECTED');
    
    try {
      // Check if conversation is already queued or escalated
      const convStatus = await env.DB.prepare(`
        SELECT status, assigned_to FROM chat_conversations WHERE id = ?
      `).bind(conversation.id).first<{ status: string; assigned_to: string | null }>();
      
      console.log('[Chat] Current conversation status:', convStatus);
      
      if (convStatus?.status === 'queued') {
        // Already in queue - reassure them
        return {
          response: "You're already in the queue! A team member will be with you shortly. While you wait, feel free to continue chatting with me if you have any other questions."
        };
      }
      
      if (convStatus?.status === 'assigned' || convStatus?.status === 'staff_handling') {
        return {
          response: "A team member has already been assigned to help you. They'll respond shortly!"
        };
      }
      
      // Check for staff with capacity (less than 3 active chats)
      console.log('[Chat] Checking for available staff with capacity...');
      const staffWithCapacity = await getAvailableStaffWithCapacity(env.DB);
      console.log('[Chat] Staff with capacity:', staffWithCapacity);
      
      if (staffWithCapacity && staffWithCapacity.active_count === 0) {
        // Staff has NO active chats - assign directly (bypass queue)
        console.log('[Chat] Assigning directly to staff:', staffWithCapacity.first_name);
        await assignToStaff(
          env.DB, 
          conversation.id, 
          staffWithCapacity.id, 
          staffWithCapacity.first_name
        );
        
        return {
          response: "Great news! A team member is available and will be with you right now. They're joining the chat!"
        };
      } else if (staffWithCapacity) {
        // Staff has some active chats but capacity - add to queue
        console.log('[Chat] Adding to queue (staff has some capacity)');
        await addToQueue(env.DB, conversation.id);
        
        return {
          response: "I understand you'd like to speak with a team member. You've been added to the queue and someone will be with you shortly! Feel free to continue chatting with me while you wait."
        };
      } else {
        // No staff available or all at capacity - add to queue
        console.log('[Chat] Adding to queue (no staff available)');
        await addToQueue(env.DB, conversation.id);
        
        // Check business hours
        const businessHours = await env.DB.prepare(`
          SELECT * FROM business_hours WHERE day_of_week = ?
        `).bind(new Date().getDay()).first<{ is_open: number; open_time: string; close_time: string }>();
        
        const isWithinHours = businessHours?.is_open === 1;
        console.log('[Chat] Business hours check:', { businessHours, isWithinHours });
        
        if (isWithinHours) {
          return {
            response: "I understand you'd like to speak with a team member. You've been added to the queue - all our agents are currently helping other customers, but someone will be with you as soon as possible! Feel free to continue chatting with me while you wait."
          };
        } else {
          return {
            response: "I'd love to connect you with a team member, but we're currently outside business hours. You've been added to the queue and will be helped when we reopen. Would you prefer a callback instead? Just say 'callback' and provide your phone number! 📞"
          };
        }
      }
    } catch (escalationError: any) {
      console.error('[Chat] ESCALATION ERROR:', escalationError.message, escalationError.stack);
      // Still try to add to queue as fallback
      try {
        await addToQueue(env.DB, conversation.id);
        return {
          response: "I understand you'd like to speak with a team member. You've been added to the queue and someone will be with you shortly!"
        };
      } catch (queueError: any) {
        console.error('[Chat] QUEUE ERROR:', queueError.message);
        return {
          response: "I understand you'd like to speak with a team member. Please hold on - I'm connecting you to our support team."
        };
      }
    }
  }

  // Try to use the Customer Service Agent with KnowledgeService
  try {
    // Import dynamically to avoid circular deps
    const { CustomerServiceAgent } = await import('../../../customer-service-agent/src/CustomerServiceAgent');
    
    const agent = new CustomerServiceAgent({
      agentId: 'ai-agent-001',
      tenantId: 'test-tenant-dtf',
      env,
      agentConfig: {
        agentId: 'ai-agent-001',
        systemPrompt: '', // Will be loaded from KnowledgeService
        temperature: 0.7,
        maxTokens: 2000,
        llmProvider: 'openai',
        llmModel: 'gpt-4o',
      },
      aiResponseMode: 'auto'
    });

    // Build context
    const context = isNew 
      ? `New live chat from ${conversation.customer_name} (${conversation.customer_email})`
      : `Continuing chat with ${conversation.customer_name}`;

    // Pass sessionId as string (conversation.id), not as an object
    const result = await agent.processMessage(message, conversation.id, {
      context,
      channel: 'chat',
      customerName: conversation.customer_name,
      customerEmail: conversation.customer_email
    });

    if (result.content) {
      return { response: result.content };
    }
  } catch (error) {
    console.error('[Chat] Customer Service Agent error:', error);
  }

  // Fallback: Use OpenAI directly with KnowledgeService
  try {
    const openaiKey = env.OPENAI_API_KEY;
    if (!openaiKey) {
      throw new Error('No OpenAI key');
    }

    // Load knowledge context for enhanced responses (with Vector RAG if available)
    const { KnowledgeService } = await import('../services/KnowledgeService');
    const knowledgeService = new KnowledgeService(
      env.DB, 
      'test-tenant-dtf',
      env.VECTORIZE,  // Pass Vectorize binding for semantic search
      env.OPENAI_API_KEY  // Pass OpenAI key for embeddings
    );
    const knowledge = await knowledgeService.getKnowledgeContext(message);
    
    console.log('[Chat] ========== KNOWLEDGE SERVICE DEBUG ==========');
    console.log('[Chat] Query:', message);
    console.log('[Chat] System message length:', knowledge.systemMessage.length);
    console.log('[Chat] Learning examples:', knowledge.learningExamples.length);
    console.log('[Chat] RAG documents found:', knowledge.ragDocuments.length);
    
    // Log actual RAG document titles and content preview
    if (knowledge.ragDocuments.length > 0) {
      console.log('[Chat] RAG DOCUMENTS:');
      knowledge.ragDocuments.forEach((doc, i) => {
        console.log(`[Chat]   ${i + 1}. ${doc.title} (${doc.content.length} chars)`);
        // Check if this doc has temperature info
        if (doc.content.includes('150') || doc.content.includes('160')) {
          console.log('[Chat]   ✅ Contains temperature info!');
          // Find and log the temperature section
          const tempMatch = doc.content.match(/Temperature[:\s]*[\d\-°CFcf\s\(\)]+/gi);
          if (tempMatch) {
            console.log('[Chat]   Temperature section:', tempMatch[0]);
          }
        }
      });
    } else {
      console.log('[Chat] ⚠️ NO RAG DOCUMENTS FOUND - AI will use generic knowledge');
    }
    
    console.log('[Chat] RAG Context preview:', knowledge.ragContext?.substring(0, 500) || 'EMPTY');
    console.log('[Chat] ================================================');

    // Build RAG-first system prompt - put RAG content FIRST so it takes priority
    let ragFirstPrompt = '';
    
    if (knowledge.ragDocuments.length > 0) {
      ragFirstPrompt = `#######################
# VERIFIED COMPANY KNOWLEDGE BASE - USE THIS FIRST!
#######################

The following information is from our official company documents. 
ALWAYS use these EXACT values when answering questions.
DO NOT use generic internet knowledge - use ONLY what's written below.

`;
      // Add each RAG document's content directly
      knowledge.ragDocuments.forEach(doc => {
        ragFirstPrompt += `## ${doc.title}\n${doc.content}\n\n---\n\n`;
      });
      
      ragFirstPrompt += `
#######################
# END OF KNOWLEDGE BASE
#######################

CRITICAL INSTRUCTION: When answering questions about DTF settings, temperatures, 
application instructions, etc., you MUST quote the EXACT values from the 
Knowledge Base above. For example, if it says "Temperature: 150-160°C", 
you MUST say "150-160°C", NOT "160-170°C" or any other value.

`;
      console.log('[Chat] RAG-first prompt built, length:', ragFirstPrompt.length);
    } else {
      console.log('[Chat] WARNING: No RAG documents found for query!');
    }

    const systemPrompt = `${ragFirstPrompt}${knowledge.systemMessage}

# Current Chat Context
You're chatting live with a customer. Be conversational, helpful, and concise.

Customer: ${conversation.customer_name}
Email: ${conversation.customer_email}

# Guidelines
- Be warm and professional
- Use emojis sparingly
- Don't make up order information or specific prices
- If customer asks for a callback, ask for their phone number
- ALWAYS check the Knowledge Base section above FIRST before answering technical questions`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (response.ok) {
      const data = await response.json() as any;
      return { response: data.choices[0]?.message?.content || "I'm here to help! Could you tell me more about what you need?" };
    }
  } catch (error) {
    console.error('[Chat] OpenAI fallback error:', error);
  }

  // Final fallback
  return { response: "Thanks for reaching out! 👋 I'm here to help with any questions about our DTF printing services. What can I assist you with today?" };
}

/**
 * Analyze chat message for priority and sentiment
 * Updates the ticket with the analysis results
 */
async function analyzeChatPriorityAndSentiment(env: Env, ticketId: string, message: string): Promise<void> {
  const openaiKey = env.OPENAI_API_KEY;
  if (!openaiKey) {
    console.log('[Chat] No OpenAI key for priority/sentiment analysis');
    return;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are a customer service analyst. Analyze the customer message and determine:
1. Priority: urgent (needs immediate attention, mentions deadlines, frustrated), high (important issue, time-sensitive), normal (standard inquiry), low (general question, not time-sensitive)
2. Sentiment: positive (happy, satisfied, complimentary), neutral (factual, no strong emotion), negative (frustrated, angry, disappointed)

Respond ONLY with valid JSON in this exact format:
{"priority": "normal", "sentiment": "neutral"}

Examples:
- "My order is 3 days late and I need it for an event tomorrow!" → {"priority": "urgent", "sentiment": "negative"}
- "Just checking on my order status" → {"priority": "normal", "sentiment": "neutral"}
- "Thanks so much for the quick help!" → {"priority": "low", "sentiment": "positive"}
- "This is ridiculous, I've been waiting for weeks!" → {"priority": "high", "sentiment": "negative"}`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 50,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      console.error('[Chat] Priority/sentiment API error:', response.status);
      return;
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content?.trim();
    
    if (!content) {
      console.log('[Chat] No content in priority/sentiment response');
      return;
    }

    // Parse the JSON response
    let analysis: { priority?: string; sentiment?: string };
    try {
      analysis = JSON.parse(content);
    } catch (parseError) {
      console.error('[Chat] Failed to parse priority/sentiment JSON:', content);
      return;
    }

    // Validate values
    const validPriorities = ['urgent', 'high', 'normal', 'low'];
    const validSentiments = ['positive', 'neutral', 'negative'];
    
    const priority = validPriorities.includes(analysis.priority || '') ? analysis.priority : 'normal';
    const sentiment = validSentiments.includes(analysis.sentiment || '') ? analysis.sentiment : 'neutral';

    console.log('[Chat] Analyzed priority/sentiment:', { ticketId, priority, sentiment, originalMessage: message.substring(0, 50) });

    // Update the ticket with the analysis
    await env.DB.prepare(`
      UPDATE tickets SET priority = ?, sentiment = ?, updated_at = ? WHERE ticket_id = ?
    `).bind(priority, sentiment, new Date().toISOString(), ticketId).run();

    // Also update the conversation
    await env.DB.prepare(`
      UPDATE chat_conversations SET priority = ?, sentiment = ?, updated_at = ? WHERE ticket_id = ?
    `).bind(priority, sentiment, new Date().toISOString(), ticketId).run();

    console.log('[Chat] Updated ticket and conversation with priority/sentiment');

  } catch (error: any) {
    console.error('[Chat] Priority/sentiment analysis error:', error.message);
  }
}

