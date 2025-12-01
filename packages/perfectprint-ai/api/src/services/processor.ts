/**
 * Processor Service
 * Call the Python processor (Google Cloud Run)
 */

import type { ProcessingOptions, ProcessingMetrics } from '../types';
import { saveBase64ToR2 } from './r2';
import { updateJob } from './database';

export async function callProcessor(
  processorUrl: string,
  bucket: R2Bucket,
  db: D1Database,
  jobId: string,
  fileUrl: string,
  options: ProcessingOptions
): Promise<void> {
  try {
    // Call Python processor
    const response = await fetch(`${processorUrl}/process-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        url: fileUrl,
        upscale: options.upscale.toString(),
        remove_background: options.removeBackground.toString(),
        vectorize: options.vectorize.toString()
      })
    });

    if (!response.ok) {
      throw new Error(`Processor returned ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Processing failed');
    }

    // Save processed images to R2
    const processedUrl = await saveBase64ToR2(
      bucket,
      jobId,
      result.results.processed_png,
      'processed',
      'image/png'
    );

    let svgUrl: string | undefined;
    if (result.results.processed_svg) {
      svgUrl = await saveBase64ToR2(
        bucket,
        jobId,
        result.results.processed_svg,
        'svg',
        'image/svg+xml'
      );
    }

    // Update job in database
    await updateJob(db, jobId, {
      status: 'completed',
      processedUrl,
      svgUrl,
      metrics: result.metrics as ProcessingMetrics,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Processor error:', error);
    
    // Update job status to failed
    await updateJob(db, jobId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      updatedAt: new Date().toISOString()
    });

    throw error;
  }
}

