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
    console.log(`🔧 [PROCESSOR] Starting processor call for job: ${jobId}`);
    
    // Get the file from R2
    const fileKey = `${jobId}/original.png`;
    console.log(`📦 [PROCESSOR] Fetching file from R2: ${fileKey}`);
    const r2Object = await bucket.get(fileKey);
    
    if (!r2Object) {
      console.error(`❌ [PROCESSOR] File not found in R2: ${fileKey}`);
      throw new Error('Original file not found in storage');
    }
    
    console.log(`✅ [PROCESSOR] File retrieved from R2`);
    const fileBlob = await r2Object.blob();
    console.log(`📊 [PROCESSOR] File size: ${fileBlob.size} bytes`);
    
    // Create FormData to send file to processor
    const formData = new FormData();
    formData.append('file', fileBlob, 'image.png');
    formData.append('upscale', options.upscale.toString());
    formData.append('remove_background', options.removeBackground.toString());
    formData.append('vectorize', options.vectorize.toString());
    
    console.log(`🐍 [PROCESSOR] Sending to Python processor: ${processorUrl}/process-async`);
    console.log(`⚙️ [PROCESSOR] Options: upscale=${options.upscale}, remove_bg=${options.removeBackground}, vectorize=${options.vectorize}`);
    console.log(`🔔 [PROCESSOR] Job ID: ${jobId} - processor will call webhook when done`);

    // Add job ID to form data so processor can call back
    formData.append('job_id', jobId);
    formData.append('webhook_url', `${processorUrl.replace(':8000', ':8787')}/api/webhook`);

    // Call Python processor - fire and forget (it will call our webhook when done)
    fetch(`${processorUrl}/process-async`, {
      method: 'POST',
      body: formData
    }).catch(error => {
      console.error(`❌ [PROCESSOR] Failed to call processor: ${error.message}`);
    });
    
    console.log(`✅ [PROCESSOR] Processing request sent, waiting for webhook callback...`);

    // Processing is now async - webhook will handle completion
    // No need to wait for response or save results here

  } catch (error) {
    console.error('❌ [PROCESSOR] Processor error:', error);
    console.error('❌ [PROCESSOR] Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('❌ [PROCESSOR] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    
    // Update job status to failed
    console.log(`🗄️ [PROCESSOR] Updating job status to failed...`);
    await updateJob(db, jobId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      updatedAt: new Date().toISOString()
    });

    throw error;
  }
}

