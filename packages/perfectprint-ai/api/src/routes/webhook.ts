/**
 * Webhook Route - Receive completion notifications from Python processor
 */

import { Hono } from 'hono';
import type { Env, ErrorResponse } from '../types';
import { updateJob } from '../services/database';
import { saveBase64ToR2 } from '../services/r2';

export const webhookRoute = new Hono<{ Bindings: Env }>();

webhookRoute.post('/', async (c) => {
  try {
    console.log('🔔 [WEBHOOK] Received completion notification from processor');
    
    const body = await c.req.json<{
      jobId: string;
      success: boolean;
      results?: {
        processed_png: string;
        processed_svg?: string;
        original_size: number[];
        processed_size: number[];
      };
      metrics?: any;
      error?: string;
    }>();

    console.log(`📋 [WEBHOOK] Job ID: ${body.jobId}, Success: ${body.success}`);

    if (!body.jobId) {
      console.error('❌ [WEBHOOK] No job ID provided');
      return c.json<ErrorResponse>({
        success: false,
        error: 'Job ID required'
      }, 400);
    }

    if (!body.success) {
      console.error(`❌ [WEBHOOK] Processing failed: ${body.error}`);
      await updateJob(c.env.DB, body.jobId, {
        status: 'failed',
        error: body.error || 'Processing failed',
        updatedAt: new Date().toISOString()
      });
      
      return c.json({ success: true, message: 'Status updated' });
    }

    if (!body.results) {
      console.error('❌ [WEBHOOK] No results provided');
      return c.json<ErrorResponse>({
        success: false,
        error: 'Results required'
      }, 400);
    }

    // Save processed images to R2
    console.log('💾 [WEBHOOK] Saving processed PNG to R2...');
    const processedUrl = await saveBase64ToR2(
      c.env.PERFECTPRINT_STORAGE,
      body.jobId,
      body.results.processed_png,
      'processed',
      'image/png'
    );
    console.log(`✅ [WEBHOOK] Processed PNG saved: ${processedUrl}`);

    let svgUrl: string | undefined;
    if (body.results.processed_svg) {
      console.log('💾 [WEBHOOK] Saving SVG to R2...');
      svgUrl = await saveBase64ToR2(
        c.env.PERFECTPRINT_STORAGE,
        body.jobId,
        body.results.processed_svg,
        'svg',
        'image/svg+xml'
      );
      console.log(`✅ [WEBHOOK] SVG saved: ${svgUrl}`);
    }

    // Update job in database
    console.log('🗄️ [WEBHOOK] Updating job status to completed...');
    
    // For local dev: also store base64 data in error field (temporary hack)
    const localDevData = JSON.stringify({
      processedPng: body.results.processed_png,
      processedSvg: body.results.processed_svg
    });
    
    await updateJob(c.env.DB, body.jobId, {
      status: 'completed',
      processedUrl,
      svgUrl,
      metrics: body.metrics,
      error: localDevData, // Temporary: store base64 here for local dev
      updatedAt: new Date().toISOString()
    });
    
    console.log(`🎉 [WEBHOOK] Job ${body.jobId} completed successfully!`);

    return c.json({ success: true, message: 'Job completed' });

  } catch (error) {
    console.error('❌ [WEBHOOK] Webhook error:', error);
    console.error('❌ [WEBHOOK] Error details:', error instanceof Error ? error.message : 'Unknown error');
    return c.json<ErrorResponse>({
      success: false,
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

