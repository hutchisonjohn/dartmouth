/**
 * PerfectPrint AI - Cloudflare Worker API
 * 
 * Main entry point for the API
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env } from './types';

// Import routes
import { uploadRoute } from './routes/upload';
import { processRoute } from './routes/process';
import { statusRoute } from './routes/status';
import { webhookRoute } from './routes/webhook';

// Create Hono app
const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: '*', // Configure this properly in production
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  maxAge: 86400,
}));

// Health check
app.get('/', (c) => {
  return c.json({
    service: 'PerfectPrint AI API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      upload: 'POST /api/upload',
      process: 'POST /api/process',
      status: 'GET /api/status/:jobId'
    }
  });
});

app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.route('/api/upload', uploadRoute);
app.route('/api/process', processRoute);
app.route('/api/status', statusRoute);
app.route('/api/webhook', webhookRoute);

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not Found',
    path: c.req.path
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({
    success: false,
    error: 'Internal Server Error',
    details: err.message
  }, 500);
});

export default app;

