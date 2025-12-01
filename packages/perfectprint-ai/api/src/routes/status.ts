/**
 * Status Route - Check job status
 */

import { Hono } from 'hono';
import type { Env, StatusResponse, ErrorResponse } from '../types';
import { getJob } from '../services/database';

export const statusRoute = new Hono<{ Bindings: Env }>();

statusRoute.get('/:jobId', async (c) => {
  try {
    const jobId = c.req.param('jobId');

    if (!jobId) {
      return c.json<ErrorResponse>({
        success: false,
        error: 'Job ID required'
      }, 400);
    }

    // Get job from database
    const job = await getJob(c.env.DB, jobId);

    if (!job) {
      return c.json<ErrorResponse>({
        success: false,
        error: 'Job not found'
      }, 404);
    }

    // Return job status
    return c.json<StatusResponse>({
      success: true,
      job
    });

  } catch (error) {
    console.error('Status error:', error);
    return c.json<ErrorResponse>({
      success: false,
      error: 'Failed to get status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

