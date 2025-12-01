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
    console.log('⚙️ [PROCESS] Starting image processing...');
    
    // Get request body
    const body = await c.req.json<{
      jobId: string;
      options?: ProcessingOptions;
    }>();
    
    console.log(`📋 [PROCESS] Job ID: ${body.jobId}`);
    console.log(`⚙️ [PROCESS] Options:`, body.options);

    if (!body.jobId) {
      console.error('❌ [PROCESS] No job ID provided');
      return c.json<ErrorResponse>({
        success: false,
        error: 'Job ID required'
      }, 400);
    }

    // Get job from database
    console.log('🔍 [PROCESS] Looking up job in database...');
    const job = await getJob(c.env.DB, body.jobId);

    if (!job) {
      console.error(`❌ [PROCESS] Job not found: ${body.jobId}`);
      return c.json<ErrorResponse>({
        success: false,
        error: 'Job not found'
      }, 404);
    }
    
    console.log(`✅ [PROCESS] Job found. Status: ${job.status}, Original URL: ${job.originalUrl}`);

    // Update options if provided
    if (body.options) {
      console.log('📝 [PROCESS] Updating job options...');
      await updateJob(c.env.DB, body.jobId, {
        options: body.options,
        updatedAt: new Date().toISOString()
      });
    }

    // Update status to processing
    console.log('📝 [PROCESS] Updating job status to "processing"...');
    await updateJob(c.env.DB, body.jobId, {
      status: 'processing',
      updatedAt: new Date().toISOString()
    });
    console.log('✅ [PROCESS] Job status updated');

    // Call Python processor (async)
    // In production, this would be a queue/background job
    console.log(`🐍 [PROCESS] Calling Python processor at: ${c.env.PROCESSOR_URL}`);
    console.log(`📦 [PROCESS] Processing options:`, body.options || job.options);
    
    callProcessor(
      c.env.PROCESSOR_URL,
      c.env.PERFECTPRINT_STORAGE,
      c.env.DB,
      body.jobId,
      job.originalUrl,
      body.options || job.options
    ).catch(error => {
      console.error('❌ [PROCESS] Processing error:', error);
      console.error('❌ [PROCESS] Error message:', error.message);
      // Update job status to failed
      updateJob(c.env.DB, body.jobId, {
        status: 'failed',
        error: error.message,
        updatedAt: new Date().toISOString()
      });
    });

    // Return response immediately
    console.log(`✅ [PROCESS] Processing started for job: ${body.jobId}`);
    return c.json<ProcessResponse>({
      success: true,
      jobId: body.jobId,
      status: 'processing',
      message: 'Processing started'
    });

  } catch (error) {
    console.error('❌ [PROCESS] Process error:', error);
    console.error('❌ [PROCESS] Error details:', error instanceof Error ? error.message : 'Unknown error');
    return c.json<ErrorResponse>({
      success: false,
      error: 'Processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

