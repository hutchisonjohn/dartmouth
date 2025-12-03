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
        status, priority, category, sentiment, channel, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'open', 'normal', 'chat_inquiry', 'neutral', 'chat', ?, ?)
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
          status, priority, category, sentiment, channel, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'open', 'normal', 'chat_inquiry', 'neutral', 'chat', ?, ?)
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

    // Re-fetch conversation to get current assigned_to (might have been taken over)
    const currentConversation = await c.env.DB.prepare(`
      SELECT assigned_to, status FROM chat_conversations WHERE id = ?
    `).bind(conversation.id).first<{ assigned_to: string | null; status: string }>();

    // Only get AI response if still assigned to AI agent
    const isAIHandling = currentConversation?.assigned_to === 'ai-agent-001';
    
    console.log('[Chat] Conversation handler:', { 
      conversationId: conversation.id, 
      assignedTo: currentConversation?.assigned_to,
      isAIHandling 
    });

    // If staff has taken over, don't generate AI response - staff will reply manually
    if (!isAIHandling) {
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
        s.last_name as assigned_staff_last_name
      FROM chat_conversations c
      LEFT JOIN staff_users s ON c.assigned_to = s.id
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
        s.last_name as assigned_staff_last_name
      FROM chat_conversations c
      LEFT JOIN staff_users s ON c.assigned_to = s.id
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

    // Build WHERE clause based on tab
    let whereClause = '';
    switch (tab) {
      case 'ai':
        // Active chats being handled by AI
        whereClause = `c.assigned_to = 'ai-agent-001' AND c.status IN ('open', 'in-progress') AND (c.resolution_type IS NULL OR c.resolution_type = '')`;
        break;
      case 'staff':
        // Active chats escalated to staff (in progress)
        whereClause = `c.assigned_to != 'ai-agent-001' AND c.assigned_to IS NOT NULL AND c.status = 'in-progress' AND (c.resolution_type IS NULL OR c.resolution_type = '')`;
        break;
      case 'queued':
        // Awaiting staff pickup
        whereClause = `c.status = 'queued' OR (c.status = 'escalated' AND c.assigned_to IS NULL)`;
        break;
      case 'closed':
        // Resolved & inactive chats
        whereClause = `c.status = 'closed' OR c.resolution_type IS NOT NULL`;
        break;
      default:
        // Legacy: filter by status
        if (status) {
          whereClause = `c.status = '${status}'`;
        } else {
          whereClause = `c.status IN ('open', 'in-progress')`;
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
        s.last_name as assigned_staff_last_name
      FROM chat_conversations c
      LEFT JOIN staff_users s ON c.assigned_to = s.id
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

    // Update conversation
    const now = new Date().toISOString();
    await c.env.DB.prepare(`
      UPDATE chat_conversations 
      SET assigned_to = ?, status = 'in-progress', updated_at = ?
      WHERE id = ?
    `).bind(user.id, now, conversationId).run();

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

    // Update conversation - assign to staff and set in-progress
    const now = new Date().toISOString();
    await c.env.DB.prepare(`
      UPDATE chat_conversations 
      SET assigned_to = ?, status = 'in-progress', queue_assigned_at = ?, updated_at = ?
      WHERE id = ?
    `).bind(user.id, now, now, conversationId).run();

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

    // Get current conversation to check who's assigned
    const conv = await c.env.DB.prepare(`
      SELECT assigned_to FROM chat_conversations WHERE id = ?
    `).bind(conversationId).first<{ assigned_to: string | null }>();

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
  const humanKeywords = [
    'human', 'real person', 'actual person', 'speak to someone',
    'talk to someone', 'agent', 'representative', 'staff', 'support',
    'person', 'help me', 'not helping', 'useless', 'real human',
    'speak with a human', 'talk to a human', 'connect me',
    'transfer', 'escalate', 'manager', 'supervisor'
  ];
  
  const lowerMessage = message.toLowerCase();
  return humanKeywords.some(keyword => lowerMessage.includes(keyword));
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
    UPDATE chat_conversations SET status = 'closed', ended_at = ?, updated_at = ? WHERE id = ?
  `).bind(now, now, conversation.id).run();
  
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

// Escalate conversation to staff
async function escalateToStaff(
  db: D1Database, 
  conversationId: string, 
  staffId: string, 
  staffName: string
): Promise<void> {
  const now = new Date().toISOString();
  
  // Update conversation
  await db.prepare(`
    UPDATE chat_conversations 
    SET assigned_to = ?, status = 'escalated', updated_at = ?
    WHERE id = ?
  `).bind(staffId, now, conversationId).run();
  
  // Add system message
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  await db.prepare(`
    INSERT INTO chat_messages (id, conversation_id, sender_type, sender_id, sender_name, content, created_at)
    VALUES (?, ?, 'system', ?, ?, ?, ?)
  `).bind(
    msgId,
    conversationId,
    staffId,
    staffName,
    `${staffName} will be with you shortly`,
    now
  ).run();
  
  console.log(`[Chat] Escalated conversation ${conversationId} to ${staffName}`);
}

async function getAIResponse(env: Env, message: string, conversation: Conversation, isNew: boolean): Promise<{ response: string; closeChat?: boolean }> {
  console.log('[Chat] Getting AI response for:', message.substring(0, 50));

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
    console.log('[Chat] Customer requesting human assistance');
    
    // Check for available staff
    const availableStaff = await getAvailableStaff(env.DB);
    
    if (availableStaff) {
      // Escalate to available staff
      await escalateToStaff(
        env.DB, 
        conversation.id, 
        availableStaff.id, 
        availableStaff.first_name
      );
      
      return {
        response: `I understand you'd like to speak with a team member. I've connected you with ${availableStaff.first_name} who will be with you shortly! 🙋`
      };
    } else {
      // No staff available - check business hours
      const businessHours = await env.DB.prepare(`
        SELECT * FROM business_hours WHERE day_of_week = ?
      `).bind(new Date().getDay()).first<{ is_open: number; open_time: string; close_time: string }>();
      
      const isWithinHours = businessHours?.is_open === 1;
      
      if (isWithinHours) {
        return {
          response: "I'd be happy to connect you with a team member, but all our agents are currently busy. Please hold on - someone will be with you as soon as possible! In the meantime, is there anything I can help you with? 🙏"
        };
      } else {
        return {
          response: "I'd love to connect you with a team member, but we're currently outside business hours. Our team will be available during our next business day. Would you like a callback instead? Just say 'callback' and provide your phone number! 📞"
        };
      }
    }
  }

  // Try to use the Customer Service Agent
  try {
    // Import dynamically to avoid circular deps
    const { CustomerServiceAgent } = await import('../agents/customer-service-agent');
    
    const agent = new CustomerServiceAgent({
      agentId: 'ai-agent-001',
      tenantId: 'test-tenant-dtf',
      env
    });

    // Build context
    const context = isNew 
      ? `New live chat from ${conversation.customer_name} (${conversation.customer_email})`
      : `Continuing chat with ${conversation.customer_name}`;

    const result = await agent.processMessage(message, {
      sessionId: conversation.id,
      context,
      metadata: {
        channel: 'chat',
        customerName: conversation.customer_name,
        customerEmail: conversation.customer_email
      }
    });

    if (result.response) {
      return { response: result.response };
    }
  } catch (error) {
    console.error('[Chat] Customer Service Agent error:', error);
  }

  // Fallback: Use OpenAI directly
  try {
    const openaiKey = env.OPENAI_API_KEY;
    if (!openaiKey) {
      throw new Error('No OpenAI key');
    }

    const systemPrompt = `You are McCarthy AI, a friendly and helpful customer service assistant for Direct To Film (DTF) printing company.

You're chatting live with a customer. Be conversational, helpful, and concise. Keep responses under 100 words unless more detail is needed.

Customer: ${conversation.customer_name}
Email: ${conversation.customer_email}

Guidelines:
- Be warm and professional
- Answer questions about DTF printing, orders, pricing
- If you don't know something specific, offer to connect them with a human agent
- Use emojis sparingly but appropriately
- Don't make up order information or specific prices
- If customer asks for a callback, ask for their phone number`;

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

