/**
 * Upload Route - Handle file uploads
 */

import { Hono } from 'hono';
import type { Env, UploadResponse, ErrorResponse } from '../types';
import { saveToR2 } from '../services/r2';
import { createJob } from '../services/database';

export const uploadRoute = new Hono<{ Bindings: Env }>();

uploadRoute.post('/', async (c) => {
  try {
    console.log('📤 [UPLOAD] Starting file upload...');
    
    // Get form data
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('❌ [UPLOAD] No file provided in request');
      return c.json<ErrorResponse>({
        success: false,
        error: 'No file provided'
      }, 400);
    }
    
    console.log(`📄 [UPLOAD] File received: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

    // Validate file type
    const allowedTypes = c.env.ALLOWED_FILE_TYPES.split(',');
    if (!allowedTypes.includes(file.type)) {
      console.error(`❌ [UPLOAD] Invalid file type: ${file.type}`);
      return c.json<ErrorResponse>({
        success: false,
        error: 'Invalid file type',
        details: `Allowed types: ${allowedTypes.join(', ')}`
      }, 400);
    }
    console.log('✅ [UPLOAD] File type validated');

    // Validate file size
    const maxSize = parseInt(c.env.MAX_FILE_SIZE);
    if (file.size > maxSize) {
      console.error(`❌ [UPLOAD] File too large: ${file.size} bytes (max: ${maxSize})`);
      return c.json<ErrorResponse>({
        success: false,
        error: 'File too large',
        details: `Maximum size: ${maxSize / 1024 / 1024}MB`
      }, 400);
    }
    console.log('✅ [UPLOAD] File size validated');

    // Generate job ID
    const jobId = crypto.randomUUID();
    console.log(`🆔 [UPLOAD] Generated job ID: ${jobId}`);

    // Save file to R2
    console.log('💾 [UPLOAD] Saving file to R2 storage...');
    const fileUrl = await saveToR2(
      c.env.PERFECTPRINT_STORAGE,
      jobId,
      file,
      'original'
    );
    console.log(`✅ [UPLOAD] File saved to R2: ${fileUrl}`);

    // Create job in database
    console.log('🗄️ [UPLOAD] Creating job in database...');
    await createJob(c.env.DB, {
      id: jobId,
      status: 'pending',
      originalUrl: fileUrl,
      options: {
        removeBackground: true,
        upscale: false,
        vectorize: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log('✅ [UPLOAD] Job created in database');

    // Return response
    console.log(`🎉 [UPLOAD] Upload complete! Job ID: ${jobId}`);
    return c.json<UploadResponse>({
      success: true,
      jobId,
      fileUrl,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('❌ [UPLOAD] Upload failed:', error);
    console.error('❌ [UPLOAD] Error details:', error instanceof Error ? error.message : 'Unknown error');
    return c.json<ErrorResponse>({
      success: false,
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

