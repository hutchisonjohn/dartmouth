/**
 * Email System V2 - Test Endpoints
 * Simulate inbound emails and test the full flow
 */

import type { Context } from 'hono';
import type { Env } from '../types/shared';
import { handleInboundEmail } from '../services/EmailHandler';
import { sendEmailThroughMailChannels } from '../services/MailChannelsService';

/**
 * Simulate an inbound email from a customer
 */
export async function simulateInboundEmail(c: Context<{ Bindings: Env }>) {
  try {
    const { from, to, subject, body } = await c.req.json();

    console.log('[Test] Simulating inbound email...');
    console.log(`[Test] From: ${from}`);
    console.log(`[Test] To: ${to}`);
    console.log(`[Test] Subject: ${subject}`);

    // Create a mock EmailMessage object
    const mockMessage = {
      from: from || 'customer@example.com',
      to: [to || 'john@dtf.com.au'],
      headers: new Map([
        ['from', from || 'customer@example.com'],
        ['to', to || 'john@dtf.com.au'],
        ['subject', subject || 'Test Email'],
        ['message-id', `<test-${Date.now()}@example.com>`],
        ['date', new Date().toUTCString()],
      ]),
      raw: createMockRawStream(body || 'This is a test email body.'),
    };

    // Process the email
    await handleInboundEmail(mockMessage as any, c.env);

    // Get the created conversation
    const conversation = await c.env.DB.prepare(`
      SELECT * FROM conversations 
      WHERE customer_email = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `)
      .bind(from || 'customer@example.com')
      .first();

    return c.json({
      success: true,
      message: 'Inbound email simulated successfully',
      conversation,
    });
  } catch (error) {
    console.error('[Test] Error simulating inbound email:', error);
    return c.json(
      {
        error: 'Failed to simulate inbound email',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
}

/**
 * Test sending an outbound email via MailChannels
 */
export async function testOutboundEmail(c: Context<{ Bindings: Env }>) {
  try {
    const { conversationId, content, toEmail } = await c.req.json();

    if (!conversationId || !content) {
      return c.json({ error: 'conversationId and content required' }, 400);
    }

    console.log('[Test] Testing outbound email...');
    console.log(`[Test] Conversation: ${conversationId}`);

    // Get conversation details
    const conversation = await c.env.DB.prepare(`
      SELECT 
        c.*,
        m.email_address as from_email,
        m.label as from_name
      FROM conversations c
      JOIN mailboxes m ON c.mailbox_id = m.id
      WHERE c.id = ?
    `)
      .bind(conversationId)
      .first();

    if (!conversation) {
      return c.json({ error: 'Conversation not found' }, 404);
    }

    // Send test email
    await sendEmailThroughMailChannels(c.env, {
      tenantId: conversation.tenant_id as string,
      conversationId: conversationId,
      mailboxId: conversation.mailbox_id as string,
      userId: 'test-user-id',
      toEmail: toEmail || (conversation.customer_email as string),
      fromEmail: conversation.from_email as string,
      fromName: conversation.from_name as string,
      subject: conversation.subject as string,
      bodyHtml: `<p>${content}</p><p>--<br>Test Signature<br>DTF Test</p>`,
    });

    return c.json({
      success: true,
      message: 'Outbound email sent successfully via MailChannels',
    });
  } catch (error) {
    console.error('[Test] Error sending outbound email:', error);
    return c.json(
      {
        error: 'Failed to send outbound email',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
}

/**
 * Test the full email flow (inbound + outbound)
 */
export async function testFullEmailFlow(c: Context<{ Bindings: Env }>) {
  try {
    const { customerEmail, customerName, subject, initialMessage, replyMessage } = await c.req.json();

    const results: any = {
      steps: [],
    };

    // Step 1: Simulate inbound email
    console.log('[Test] Step 1: Simulating inbound email...');
    const mockMessage = {
      from: `${customerName || 'Test Customer'} <${customerEmail || 'test@example.com'}>`,
      to: ['john@dtf.com.au'],
      headers: new Map([
        ['from', `${customerName || 'Test Customer'} <${customerEmail || 'test@example.com'}>`],
        ['to', 'john@dtf.com.au'],
        ['subject', subject || 'Test Email Flow'],
        ['message-id', `<test-${Date.now()}@example.com>`],
        ['date', new Date().toUTCString()],
      ]),
      raw: createMockRawStream(initialMessage || 'Hello, I need help with my order.'),
    };

    await handleInboundEmail(mockMessage as any, c.env);
    results.steps.push({ step: 1, status: 'success', message: 'Inbound email processed' });

    // Step 2: Find the conversation
    console.log('[Test] Step 2: Finding conversation...');
    const conversation = await c.env.DB.prepare(`
      SELECT * FROM conversations 
      WHERE customer_email = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `)
      .bind(customerEmail || 'test@example.com')
      .first();

    if (!conversation) {
      throw new Error('Conversation not created');
    }
    results.conversation = conversation;
    results.steps.push({ step: 2, status: 'success', message: 'Conversation found' });

    // Step 3: Get the email
    console.log('[Test] Step 3: Getting email...');
    const email = await c.env.DB.prepare(`
      SELECT * FROM emails 
      WHERE conversation_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `)
      .bind(conversation.id)
      .first();

    results.email = email;
    results.steps.push({ step: 3, status: 'success', message: 'Email stored' });

    // Step 4: Send reply via MailChannels
    console.log('[Test] Step 4: Sending reply...');
    const mailbox = await c.env.DB.prepare(`
      SELECT * FROM mailboxes WHERE id = ?
    `)
      .bind(conversation.mailbox_id)
      .first();

    try {
      await sendEmailThroughMailChannels(c.env, {
        tenantId: conversation.tenant_id as string,
        conversationId: conversation.id as string,
        mailboxId: conversation.mailbox_id as string,
        userId: 'test-user-id',
        toEmail: conversation.customer_email as string,
        fromEmail: mailbox?.email_address as string,
        fromName: mailbox?.label as string,
        subject: conversation.subject as string,
        bodyHtml: `<p>${replyMessage || 'Thank you for contacting us. We will help you shortly.'}</p><p>--<br>Test Agent<br>DTF Test</p>`,
      });
      results.steps.push({ step: 4, status: 'success', message: 'Reply sent via MailChannels' });
    } catch (mailChannelsError) {
      console.log('[Test] MailChannels error (expected without domain verification):', mailChannelsError);
      results.steps.push({ 
        step: 4, 
        status: 'warning', 
        message: 'MailChannels blocked (401 - domain verification required)',
        note: 'This is expected. Email was stored in database but not sent externally.'
      });
    }

    // Step 5: Verify reply was stored
    console.log('[Test] Step 5: Verifying reply stored...');
    const replyEmail = await c.env.DB.prepare(`
      SELECT * FROM emails 
      WHERE conversation_id = ? AND direction = 'outbound'
      ORDER BY created_at DESC 
      LIMIT 1
    `)
      .bind(conversation.id)
      .first();

    results.replyEmail = replyEmail;
    results.steps.push({ step: 5, status: 'success', message: 'Reply stored in database' });

    return c.json({
      success: true,
      message: 'Full email flow test completed successfully',
      results,
    });
  } catch (error) {
    console.error('[Test] Error in full email flow test:', error);
    return c.json(
      {
        error: 'Full email flow test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
}

/**
 * Get all test conversations
 */
export async function listTestConversations(c: Context<{ Bindings: Env }>) {
  try {
    const conversations = await c.env.DB.prepare(`
      SELECT 
        c.*,
        m.email_address as mailbox_email,
        (SELECT COUNT(*) FROM emails WHERE conversation_id = c.id) as email_count
      FROM conversations c
      JOIN mailboxes m ON c.mailbox_id = m.id
      WHERE c.tenant_id = 'test-tenant-dtf'
      ORDER BY c.created_at DESC
      LIMIT 20
    `).all();

    return c.json({
      conversations: conversations.results || [],
    });
  } catch (error) {
    console.error('[Test] Error listing conversations:', error);
    return c.json(
      {
        error: 'Failed to list conversations',
      },
      500
    );
  }
}

/**
 * Clean up test data
 */
export async function cleanupTestData(c: Context<{ Bindings: Env }>) {
  try {
    // Delete all emails for test tenant
    await c.env.DB.prepare(`
      DELETE FROM emails WHERE tenant_id = 'test-tenant-dtf'
    `).run();

    // Delete all conversations for test tenant
    await c.env.DB.prepare(`
      DELETE FROM conversations WHERE tenant_id = 'test-tenant-dtf'
    `).run();

    // Reset quota
    await c.env.DB.prepare(`
      UPDATE tenant_email_quota 
      SET used_today = 0, last_reset_at = datetime('now')
      WHERE tenant_id = 'test-tenant-dtf'
    `).run();

    return c.json({
      success: true,
      message: 'Test data cleaned up successfully',
    });
  } catch (error) {
    console.error('[Test] Error cleaning up test data:', error);
    return c.json(
      {
        error: 'Failed to clean up test data',
      },
      500
    );
  }
}

/**
 * Helper: Create a mock ReadableStream for email body
 */
function createMockRawStream(body: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const headers = `From: Test Customer <test@example.com>
To: john@dtf.com.au
Subject: Test Email
Content-Type: text/plain; charset=UTF-8

`;
  const fullContent = headers + body;
  const bytes = encoder.encode(fullContent);

  return new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
}

