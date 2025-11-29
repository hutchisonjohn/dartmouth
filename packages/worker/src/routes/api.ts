/**
 * Customer Service API Routes
 * Using Hono framework for better routing
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from '../types/shared';

// Middleware
import { authenticate, requireAdmin, requireManagerOrAdmin } from '../middleware/auth';

// Controllers
import * as authController from '../controllers/auth';
import * as ticketsController from '../controllers/tickets';
import * as mentionsController from '../controllers/mentions';
import * as settingsController from '../controllers/settings';
import * as staffController from '../controllers/staff';

/**
 * Create API router
 */
export function createAPIRouter() {
  const app = new Hono<{ Bindings: Env }>();

  // Enable CORS
  app.use('/*', cors());

  // ========================================================================
  // AUTHENTICATION ROUTES
  // ========================================================================

  app.post('/api/auth/login', authController.login);
  app.post('/api/auth/logout', authController.logout);
  app.get('/api/auth/me', authenticate, authController.me);

  // ========================================================================
  // TICKETS ROUTES
  // ========================================================================

  app.get('/api/tickets', authenticate, ticketsController.listTickets);
  app.get('/api/tickets/:id', authenticate, ticketsController.getTicket);
  app.get('/api/tickets/:id/messages', authenticate, ticketsController.getTicketMessages);
  app.put('/api/tickets/:id/assign', authenticate, requireManagerOrAdmin, ticketsController.assignTicket);
  app.put('/api/tickets/:id/status', authenticate, ticketsController.updateTicketStatus);
  app.post('/api/tickets/:id/reply', authenticate, ticketsController.replyToTicket);
  app.post('/api/tickets/:id/notes', authenticate, ticketsController.addNote);
  app.post('/api/tickets/:id/snooze', authenticate, ticketsController.snoozeTicket);
  app.post('/api/tickets/:id/unsnooze', authenticate, ticketsController.unsnoozeTicket);

  // ========================================================================
  // MENTIONS ROUTES
  // ========================================================================

  app.get('/api/mentions', authenticate, mentionsController.listMentions);
  app.get('/api/mentions/:id', authenticate, mentionsController.getMention);
  app.post('/api/mentions', authenticate, mentionsController.createMention);
  app.post('/api/mentions/:id/reply', authenticate, mentionsController.replyToMention);
  app.put('/api/mentions/:id/read', authenticate, mentionsController.markAsRead);

  // ========================================================================
  // SETTINGS ROUTES
  // ========================================================================

  app.get('/api/settings', authenticate, requireAdmin, settingsController.listSettings);
  app.get('/api/settings/:key', authenticate, requireAdmin, settingsController.getSetting);
  app.put('/api/settings/:key', authenticate, requireAdmin, settingsController.updateSetting);

  // ========================================================================
  // STAFF ROUTES
  // ========================================================================

  app.get('/api/staff', authenticate, staffController.listStaff);
  app.get('/api/staff/:id', authenticate, staffController.getStaff);
  app.put('/api/staff/:id/presence', authenticate, staffController.updatePresence);

  return app;
}

