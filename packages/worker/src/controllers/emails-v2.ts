/**
 * Email System V2 Controllers
 * Handles email sending via MailChannels for multi-tenant conversations
 */

import type { Context } from 'hono';
import type { Env } from '../types/shared';
import { sendEmailThroughMailChannels } from '../services/MailChannelsService';

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Send a reply to a conversation (V2)
 */
export async function replyToConversation(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;
    const conversationId = c.req.param('id');
    const { content } = await c.req.json();

    if (!content) {
      return c.json({ error: 'content required' }, 400);
    }

    console.log(`[EmailV2] Sending reply to conversation ${conversationId}`);

    // Get conversation details
    const conversation = await c.env.DB.prepare(`
      SELECT 
        c.id,
        c.tenant_id,
        c.mailbox_id,
        c.subject,
        c.customer_email,
        m.email_address as from_email,
        m.label as from_name,
        t.default_signature_html,
        s.signature_override_html,
        s.first_name,
        s.last_name
      FROM conversations c
      JOIN mailboxes m ON c.mailbox_id = m.id
      JOIN tenants t ON c.tenant_id = t.id
      LEFT JOIN staff_users s ON s.id = ?
      WHERE c.id = ?
    `)
      .bind(user.id, conversationId)
      .first();

    if (!conversation) {
      return c.json({ error: 'Conversation not found' }, 404);
    }

    // Build signature
    const signature = conversation.signature_override_html || conversation.default_signature_html || '';
    const agentName = `${conversation.first_name} ${conversation.last_name}`;
    
    // Replace placeholders in signature
    const renderedSignature = signature
      .replace(/\{\{agent_name\}\}/g, agentName)
      .replace(/\{\{agent_role\}\}/g, user.role)
      .replace(/\{\{agent_email\}\}/g, user.email)
      .replace(/\{\{tenant_name\}\}/g, 'DTF Test'); // TODO: Get from tenant

    // Build final HTML body
    const bodyHtml = `<p>${content.replace(/\n/g, '<br>')}</p>${renderedSignature}`;

    // Send email via MailChannels
    await sendEmailThroughMailChannels(c.env, {
      tenantId: conversation.tenant_id as string,
      conversationId: conversationId,
      mailboxId: conversation.mailbox_id as string,
      userId: user.id,
      toEmail: conversation.customer_email as string,
      fromEmail: conversation.from_email as string,
      fromName: conversation.from_name as string,
      subject: conversation.subject as string,
      bodyHtml,
    });

    console.log(`[EmailV2] ✅ Reply sent successfully`);

    return c.json({ 
      success: true,
      message: 'Reply sent successfully'
    });
  } catch (error) {
    console.error('[EmailV2] Error sending reply:', error);
    return c.json(
      { 
        error: 'Failed to send reply',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      500
    );
  }
}

/**
 * Get all conversations for a tenant
 */
export async function listConversations(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;
    
    // For now, get all conversations for the test tenant
    // TODO: Filter by user's tenant_id
    const conversations = await c.env.DB.prepare(`
      SELECT 
        c.id,
        c.subject,
        c.customer_email,
        c.status,
        c.last_message_at,
        c.created_at,
        m.label as mailbox_label,
        (SELECT COUNT(*) FROM emails WHERE conversation_id = c.id) as message_count
      FROM conversations c
      JOIN mailboxes m ON c.mailbox_id = m.id
      WHERE c.tenant_id = 'test-tenant-dtf'
      ORDER BY c.last_message_at DESC
      LIMIT 100
    `).all();

    return c.json({
      conversations: conversations.results || []
    });
  } catch (error) {
    console.error('[EmailV2] Error listing conversations:', error);
    return c.json(
      { error: 'Failed to list conversations' },
      500
    );
  }
}

/**
 * Get conversation details with all messages
 */
export async function getConversation(c: Context<{ Bindings: Env }>) {
  try {
    const conversationId = c.req.param('id');

    // Get conversation details
    const conversation = await c.env.DB.prepare(`
      SELECT 
        c.*,
        m.email_address as mailbox_email,
        m.label as mailbox_label
      FROM conversations c
      JOIN mailboxes m ON c.mailbox_id = m.id
      WHERE c.id = ?
    `)
      .bind(conversationId)
      .first();

    if (!conversation) {
      return c.json({ error: 'Conversation not found' }, 404);
    }

    // Get all emails in conversation
    const emails = await c.env.DB.prepare(`
      SELECT 
        e.*,
        s.first_name,
        s.last_name
      FROM emails e
      LEFT JOIN staff_users s ON e.user_id = s.id
      WHERE e.conversation_id = ?
      ORDER BY e.created_at ASC
    `)
      .bind(conversationId)
      .all();

    return c.json({
      conversation,
      emails: emails.results || []
    });
  } catch (error) {
    console.error('[EmailV2] Error getting conversation:', error);
    return c.json(
      { error: 'Failed to get conversation' },
      500
    );
  }
}

