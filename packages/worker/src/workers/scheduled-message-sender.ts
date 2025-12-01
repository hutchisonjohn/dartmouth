/**
 * Scheduled Message Sender
 * Sends scheduled messages when their scheduled time has passed
 */

import type { Env } from '../types/shared';
import { GmailIntegration } from '../services/GmailIntegration';

export async function sendScheduledMessages(env: Env): Promise<void> {
  console.log('[Scheduled Messages] Starting job at:', new Date().toISOString());
  
  try {
    // Get all pending scheduled messages where scheduled_for <= now
    const now = new Date().toISOString();
    const { results: messages } = await env.DB.prepare(`
      SELECT sm.*, t.ticket_id, t.customer_email, t.subject, s.first_name, s.last_name
      FROM scheduled_messages sm
      JOIN tickets t ON sm.ticket_id = t.ticket_id
      JOIN staff_users s ON sm.staff_id = s.id
      WHERE sm.status = 'pending' AND sm.scheduled_for <= ?
      ORDER BY sm.scheduled_for ASC
    `).bind(now).all();

    console.log(`[Scheduled Messages] Found ${messages.length} messages to send`);

    for (const message of messages as any[]) {
      try {
        console.log(`[Scheduled Messages] Sending message ${message.id} for ticket ${message.ticket_id}`);
        
        // Get the Gmail message ID from our database
        const emailRecord = await env.DB.prepare(`
          SELECT gmail_message_id FROM emails WHERE ticket_id = ? ORDER BY created_at DESC LIMIT 1
        `).bind(message.ticket_id).first();

        if (!emailRecord?.gmail_message_id) {
          console.error(`[Scheduled Messages] No Gmail message ID found for ticket ${message.ticket_id}`);
          throw new Error('No Gmail message ID found for threading');
        }
        
        // Initialize Gmail service
        const gmail = new GmailIntegration(env.DB, {
          clientId: env.GMAIL_CLIENT_ID!,
          clientSecret: env.GMAIL_CLIENT_SECRET!,
          redirectUri: env.GMAIL_REDIRECT_URI!,
          refreshToken: env.GMAIL_REFRESH_TOKEN!
        });

        // Fetch the original message metadata from Gmail to get exact threading info
        const originalMessage = await gmail.getOriginalMessageForReply(emailRecord.gmail_message_id as string);
        
        console.log(`[Scheduled Messages] Original message thread ID:`, originalMessage.threadId);
        console.log(`[Scheduled Messages] Original message Message-ID:`, originalMessage.messageId);
        console.log(`[Scheduled Messages] Original message Subject:`, originalMessage.subject);
        
        // Build reply subject (ensure it has Re: prefix)
        const replySubject = originalMessage.subject.startsWith('Re:') 
          ? originalMessage.subject 
          : `Re: ${originalMessage.subject}`;
        
        // Send the email to the customer
        try {
          await gmail.sendEmail({
            from: 'john@dtf.com.au',
            to: message.customer_email,
            subject: replySubject,
            body: message.content,
            threadId: originalMessage.threadId,
            replyToMessageId: originalMessage.messageId
          });
          console.log(`[Scheduled Messages] ✅ Email sent to ${message.customer_email}`);
        } catch (emailError) {
          console.error(`[Scheduled Messages] Failed to send email:`, emailError);
          throw new Error(`Email send failed: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`);
        }
        
        // Insert the message as a regular ticket message
        // Use the scheduled_for time as created_at so it appears in chronological order
        const messageId = crypto.randomUUID();
        const senderName = `${message.first_name} ${message.last_name}`;
        
        await env.DB.prepare(`
          INSERT INTO ticket_messages (id, ticket_id, sender_type, sender_id, sender_name, content, created_at)
          VALUES (?, ?, 'agent', ?, ?, ?, ?)
        `).bind(messageId, message.ticket_id, message.staff_id, senderName, message.content, message.scheduled_for).run();

        // Update the scheduled message status to 'sent'
        await env.DB.prepare(`
          UPDATE scheduled_messages
          SET status = 'sent', sent_at = datetime('now'), updated_at = datetime('now')
          WHERE id = ?
        `).bind(message.id).run();

        // Update the ticket's updated_at timestamp
        await env.DB.prepare(`
          UPDATE tickets
          SET updated_at = datetime('now')
          WHERE ticket_id = ?
        `).bind(message.ticket_id).run();

        console.log(`[Scheduled Messages] Successfully sent message ${message.id}`);
      } catch (error) {
        console.error(`[Scheduled Messages] Error sending message ${message.id}:`, error);
        
        // Mark as failed
        await env.DB.prepare(`
          UPDATE scheduled_messages
          SET status = 'failed', error_message = ?, updated_at = datetime('now')
          WHERE id = ?
        `).bind(error instanceof Error ? error.message : 'Unknown error', message.id).run();
      }
    }

    console.log('[Scheduled Messages] Job completed');
  } catch (error) {
    console.error('[Scheduled Messages] Job error:', error);
  }
}

