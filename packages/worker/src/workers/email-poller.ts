/**
 * Email Polling Worker
 * 
 * Scheduled worker that runs every 5 minutes to:
 * 1. Fetch unread emails from Gmail
 * 2. Create tickets from emails
 * 3. Process tickets with CustomerServiceAgent
 * 4. Send auto-replies or create drafts
 * 
 * Cron: every 5 minutes
 */

import type { Env } from '../types/shared';
import { GmailIntegration } from '../services/GmailIntegration';
import { TicketManager } from '../services/TicketManager';
import { CustomerServiceAgent } from '../../../customer-service-agent/src/CustomerServiceAgent';

/**
 * Email Poller - Scheduled Worker
 */
export async function handleEmailPolling(env: Env): Promise<void> {
  console.log('[EmailPoller] Starting email polling job...');
  const startTime = Date.now();

  try {
    // 1. Initialize services
    const gmail = new GmailIntegration(env.DB, {
      clientId: env.GMAIL_CLIENT_ID!,
      clientSecret: env.GMAIL_CLIENT_SECRET!,
      redirectUri: env.GMAIL_REDIRECT_URI!,
      refreshToken: env.GMAIL_REFRESH_TOKEN!
    });

    const ticketManager = new TicketManager(env.DB);

    // 2. Fetch unread emails
    console.log('[EmailPoller] Fetching unread emails from Gmail...');
    const emails = await gmail.fetchInbox(50); // Max 50 emails per run
    console.log(`[EmailPoller] Found ${emails.length} unread emails`);

    if (emails.length === 0) {
      console.log('[EmailPoller] No new emails. Job complete.');
      return;
    }

    // 3. Process each email
    let ticketsCreated = 0;
    let ticketsUpdated = 0;
    let errors = 0;

    for (const email of emails) {
      try {
        console.log(`[EmailPoller] Processing email from ${email.from.email}: ${email.subject}`);

        // 3a. Store email in database
        await gmail.storeEmailInDatabase(email);

        // 3b. Create or update ticket
        const ticket = await ticketManager.createTicketFromEmail(email);
        
        if (ticket.isNew) {
          ticketsCreated++;
          console.log(`[EmailPoller] ✅ Created ticket #${ticket.ticket_number} for email`);
        } else {
          ticketsUpdated++;
          console.log(`[EmailPoller] ✅ Updated ticket #${ticket.ticket_number} with new email`);
        }

        // 3c. Link email to ticket (update ticket_id in emails table)
        await env.DB.prepare(`
          UPDATE emails SET ticket_id = ? WHERE gmail_message_id = ?
        `).bind(ticket.ticket_id, email.gmailMessageId).run();
        console.log(`[EmailPoller] ✅ Linked email to ticket ${ticket.ticket_id}`);

        // 3d. Mark email as read in Gmail (prevent duplicate processing)
        try {
          await gmail.markAsRead(email.gmailMessageId);
        } catch (markReadError) {
          console.error(`[EmailPoller] ⚠️ Failed to mark email as read (non-fatal):`, markReadError);
          // Don't fail the whole process if marking as read fails
        }

        // 3e. Process ticket with AI agent (if new ticket)
        if (ticket.isNew) {
          await processTicketWithAI(ticket, env);
        }

      } catch (error) {
        errors++;
        console.error(`[EmailPoller] ❌ Error processing email ${email.id}:`, error);
        // Continue with next email
      }
    }

    // 4. Log summary
    const duration = Date.now() - startTime;
    console.log(`[EmailPoller] Job complete in ${duration}ms`);
    console.log(`[EmailPoller] Summary:`);
    console.log(`  - Emails processed: ${emails.length}`);
    console.log(`  - Tickets created: ${ticketsCreated}`);
    console.log(`  - Tickets updated: ${ticketsUpdated}`);
    console.log(`  - Errors: ${errors}`);

  } catch (error) {
    console.error('[EmailPoller] ❌ Fatal error in email polling job:', error);
    throw error;
  }
}

/**
 * Process ticket with CustomerServiceAgent
 */
async function processTicketWithAI(ticket: any, env: Env): Promise<void> {
  try {
    console.log(`[EmailPoller] Processing ticket #${ticket.ticket_number} with AI...`);

    // 1. Initialize CustomerServiceAgent
    const agent = new CustomerServiceAgent({
      agentId: 'customer-service',
      tenantId: 'default-tenant',
      agentConfig: {
        agentId: 'customer-service',
        name: 'Customer Service Agent',
        description: 'AI Customer Service Agent',
        version: '1.0.0',
        systemPrompt: '', // Will be overridden by agent
        llmProvider: (env.LLM_PROVIDER || 'openai') as 'openai',
        llmModel: env.LLM_MODEL || 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 2000
      },
      env: {
        DB: env.DB,
        APP_CONFIG: env.APP_CONFIG,
        CACHE: env.CACHE,
        FILES: env.FILES,
        WORKERS_AI: env.WORKERS_AI,
        OPENAI_API_KEY: env.OPENAI_API_KEY,
        ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY,
        GOOGLE_API_KEY: env.GOOGLE_API_KEY
      },
      shopifyApiUrl: env.SHOPIFY_API_URL!,
      shopifyAccessToken: env.SHOPIFY_ACCESS_TOKEN!,
      perpApiUrl: env.PERP_API_URL!,
      perpApiKey: env.PERP_API_KEY!,
      gmailCredentials: {
        clientId: env.GMAIL_CLIENT_ID!,
        clientSecret: env.GMAIL_CLIENT_SECRET!,
        redirectUri: env.GMAIL_REDIRECT_URI!,
        refreshToken: env.GMAIL_REFRESH_TOKEN!
      },
      aiResponseMode: (env.AI_RESPONSE_MODE || 'draft') as 'auto' | 'draft'
    });

    // 2. Get ticket email content
    const ticketEmail = await env.DB.prepare(
      `SELECT e.* FROM emails e
       INNER JOIN ticket_email_links tel ON e.id = tel.email_id
       WHERE tel.ticket_id = ?
       ORDER BY e.received_at DESC LIMIT 1`
    ).bind(ticket.ticket_id).first();

    if (!ticketEmail) {
      console.log(`[EmailPoller] No email found for ticket #${ticket.ticket_number}`);
      return;
    }

    // 3. Process with AI
    const message = `${ticketEmail.subject}\n\n${ticketEmail.body_text}`;
    const response = await agent.processMessage(message, ticket.ticket_id);

    console.log(`[EmailPoller] ✅ AI response generated (confidence: ${response.metadata.confidence})`);

    // 4. Check if should escalate (IMPROVED LOGIC)
    const shouldEscalate = 
      response.metadata.confidence < 0.6 || 
      response.metadata.escalate ||
      // Escalate angry + urgent/high priority
      (ticket.sentiment === 'angry' && ['urgent', 'high'].includes(ticket.priority)) ||
      // Escalate critical priority always
      ticket.priority === 'critical' ||
      // Escalate VIP + negative sentiment
      (ticket.vip === 1 && ['angry', 'negative'].includes(ticket.sentiment)) ||
      // Escalate if customer explicitly demands manager/supervisor
      (ticketEmail.body_text?.toLowerCase().includes('manager') || 
       ticketEmail.body_text?.toLowerCase().includes('supervisor') ||
       ticketEmail.body_text?.toLowerCase().includes('incompetent') ||
       ticketEmail.body_text?.toLowerCase().includes('useless'));

    if (shouldEscalate) {
      const escalationReason = 
        ticket.sentiment === 'angry' && ['urgent', 'high'].includes(ticket.priority) 
          ? 'Angry customer with high priority issue - requires immediate human attention'
        : ticket.priority === 'critical'
          ? 'Critical priority issue - requires immediate escalation'
        : ticket.vip === 1 && ['angry', 'negative'].includes(ticket.sentiment)
          ? 'VIP customer with negative sentiment - requires priority handling'
        : ticketEmail.body_text?.toLowerCase().includes('manager')
          ? 'Customer explicitly requested manager/supervisor'
        : response.metadata.escalationReason || 'Low confidence or complex issue';

      console.log(`[EmailPoller] ⚠️ Escalating ticket #${ticket.ticket_number} to human: ${escalationReason}`);
      
      const ticketManager = new TicketManager(env.DB);
      await ticketManager.escalateTicket(
        ticket.ticket_id,
        'ai-agent',
        'human-agent',
        escalationReason
      );
      
      return;
    }

    // 5. Send response or create draft
    const gmail = agent.getGmail();
    const aiMode = agent.getAIResponseMode();

    if (aiMode === 'auto') {
      // Auto-send reply
      await gmail.sendEmail({
        to: ticketEmail.from_email,
        subject: `Re: ${ticketEmail.subject}`,
        body: response.content,
        threadId: ticketEmail.gmail_thread_id
      });
      
      console.log(`[EmailPoller] ✅ Auto-sent reply to ${ticketEmail.from_email}`);
      
      // Add to ticket messages
      const ticketManager = new TicketManager(env.DB);
      await ticketManager.addMessage(ticket.ticket_id, {
        sender_type: 'ai',
        sender_name: 'Customer Service AI',
        content: response.content,
        created_at: new Date().toISOString(),
        metadata: {
          confidence: response.metadata.confidence,
          intent: response.metadata.intent
        }
      });

    } else {
      // Create draft for approval
      await gmail.createDraft({
        to: ticketEmail.from_email,
        subject: `Re: ${ticketEmail.subject}`,
        body: response.content,
        threadId: ticketEmail.gmail_thread_id
      });
      
      console.log(`[EmailPoller] ✅ Created draft for staff approval`);
      
      // Add internal note
      const ticketManager = new TicketManager(env.DB);
      await ticketManager.addInternalNote(
        ticket.ticket_id,
        'ai-agent',
        `AI generated draft response (confidence: ${(response.metadata.confidence * 100).toFixed(0)}%). Please review and send.`
      );
    }

  } catch (error) {
    console.error(`[EmailPoller] Error processing ticket with AI:`, error);
    throw error;
  }
}

