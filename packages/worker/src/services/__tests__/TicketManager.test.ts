/**
 * TicketManager Tests
 * 
 * Tests D1 database integration for ticket management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TicketManager } from '../TicketManager';

// Mock D1 Database
const createMockDB = () => {
  const mockResults = new Map();
  
  return {
    prepare: (query: string) => ({
      bind: (...params: any[]) => ({
        run: async () => {
          console.log('[MockDB] RUN:', query, params);
          // Store tickets when they're inserted
          if (query.includes('INSERT INTO tickets')) {
            mockResults.set(params[0], {
              ticket_id: params[0],
              ticket_number: params[1],
              customer_id: params[2],
              customer_email: params[3],
              customer_name: params[4],
              subject: params[5],
              description: params[6],
              status: params[7],
              priority: params[8],
              category: params[9],
              channel: params[10],
              sla_due_at: params[11],
              created_at: params[12],
              updated_at: params[13]
            });
          }
          return { success: true };
        },
        first: async () => {
          console.log('[MockDB] FIRST:', query, params);
          if (query.includes('COUNT(*)')) {
            return { count: 5 };
          }
          if (query.includes('SELECT * FROM tickets WHERE ticket_id')) {
            // Return the ticket that was just created (stored in mockResults)
            const ticketId = params[0];
            const storedTicket = mockResults.get(ticketId);
            if (storedTicket) {
              return storedTicket;
            }
            // Fallback
            return {
              ticket_id: params[0],
              ticket_number: 'TKT-000001',
              customer_id: 'cust_123',
              customer_email: 'test@example.com',
              customer_name: 'Test Customer',
              subject: 'Test Ticket',
              description: 'Test description',
              status: 'open',
              priority: 'medium',
              category: 'other',
              channel: 'email',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          }
          return null;
        },
        all: async () => {
          console.log('[MockDB] ALL:', query, params);
          return { results: [] };
        }
      })
    })
  } as any;
};

describe('TicketManager', () => {
  let ticketManager: TicketManager;
  let mockDB: any;

  beforeEach(() => {
    mockDB = createMockDB();
    ticketManager = new TicketManager(mockDB);
  });

  describe('createTicket', () => {
    it('should create a ticket from a normalized message', async () => {
      const message = {
        messageId: 'msg_123',
        customerId: 'cust_123',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        content: 'I need help with my order',
        channelType: 'email' as const,
        timestamp: new Date().toISOString(),
        metadata: { timestamp: new Date().toISOString() }
      };

      const ticket = await ticketManager.createTicket(message);

      expect(ticket).toBeDefined();
      expect(ticket.customer_email).toBe('john@example.com');
      expect(ticket.status).toBe('open');
    });

    it('should detect urgent priority for urgent keywords', async () => {
      const message = {
        messageId: 'msg_123',
        customerId: 'cust_123',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        content: 'URGENT: My order is wrong!',
        channelType: 'email' as const,
        timestamp: new Date().toISOString(),
        metadata: { timestamp: new Date().toISOString() }
      };

      const ticket = await ticketManager.createTicket(message);

      expect(ticket.priority).toBe('urgent');
    });

    it('should detect order_status category', async () => {
      const message = {
        messageId: 'msg_123',
        customerId: 'cust_123',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        content: 'Where is my order? Tracking number?',
        channelType: 'email' as const,
        timestamp: new Date().toISOString(),
        metadata: { timestamp: new Date().toISOString() }
      };

      const ticket = await ticketManager.createTicket(message);

      expect(ticket.category).toBe('order_status');
    });
  });

  describe('assignTicket', () => {
    it('should assign a ticket to a staff member', async () => {
      const result = await ticketManager.assignTicket('ticket_123', 'staff_456', 'manager_789');

      expect(result).toBe(true);
    });
  });

  describe('addMessage', () => {
    it('should add a message to a ticket', async () => {
      const result = await ticketManager.addMessage('ticket_123', {
        sender_type: 'agent',
        sender_id: 'agent_456',
        sender_name: 'Support Agent',
        content: 'I can help you with that'
      });

      expect(result).toBe(true);
    });
  });

  describe('escalateTicket', () => {
    it('should escalate a ticket', async () => {
      const result = await ticketManager.escalateTicket(
        'ticket_123',
        'agent_456',
        'manager_789',
        'Customer is very upset'
      );

      expect(result).toBe(true);
    });
  });
});

