/**
 * Process Route - Trigger image processing
 */

import { Hono } from 'hono';
import type { Env, ProcessResponse, ErrorResponse, ProcessingOptions } from '../types';
import { getJob, updateJob } from '../services/database';
import { callProcessor } from '../services/processor';

export const processRoute = new Hono<{ Bindings: Env }>();

processRoute.post('/', async (c) => {
  try {
    // Get request body
    const body = await c.req.json<{
      jobId: string;
      options?: ProcessingOptions;
    }>();

    if (!body.jobId) {
      return c.json<ErrorResponse>({
        success: false,
        error: 'Job ID required'
      }, 400);
    }

    // Get job from database
    const job = await getJob(c.env.DB, body.jobId);

    if (!job) {
      return c.json<ErrorResponse>({
        success: false,
        error: 'Job not found'
      }, 404);
    }

    // Update options if provided
    if (body.options) {
      await updateJob(c.env.DB, body.jobId, {
        options: body.options,
        updatedAt: new Date().toISOString()
      });
    }

    // Update status to processing
    await updateJob(c.env.DB, body.jobId, {
      status: 'processing',
      updatedAt: new Date().toISOString()
    });

    // Call Python processor (async)
    // In production, this would be a queue/background job
    callProcessor(
      c.env.PROCESSOR_URL,
      c.env.PERFECTPRINT_STORAGE,
      c.env.DB,
      body.jobId,
      job.originalUrl,
      body.options || job.options
    ).catch(error => {
      console.error('Processing error:', error);
      // Update job status to failed
      updateJob(c.env.DB, body.jobId, {
        status: 'failed',
        error: error.message,
        updatedAt: new Date().toISOString()
      });
    });

    // Return response immediately
    return c.json<ProcessResponse>({
      success: true,
      jobId: body.jobId,
      status: 'processing',
      message: 'Processing started'
    });

  } catch (error) {
    console.error('Process error:', error);
    return c.json<ErrorResponse>({
      success: false,
      error: 'Processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

