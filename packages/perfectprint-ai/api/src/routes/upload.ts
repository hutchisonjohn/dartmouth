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
    // Get form data
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json<ErrorResponse>({
        success: false,
        error: 'No file provided'
      }, 400);
    }

    // Validate file type
    const allowedTypes = c.env.ALLOWED_FILE_TYPES.split(',');
    if (!allowedTypes.includes(file.type)) {
      return c.json<ErrorResponse>({
        success: false,
        error: 'Invalid file type',
        details: `Allowed types: ${allowedTypes.join(', ')}`
      }, 400);
    }

    // Validate file size
    const maxSize = parseInt(c.env.MAX_FILE_SIZE);
    if (file.size > maxSize) {
      return c.json<ErrorResponse>({
        success: false,
        error: 'File too large',
        details: `Maximum size: ${maxSize / 1024 / 1024}MB`
      }, 400);
    }

    // Generate job ID
    const jobId = crypto.randomUUID();

    // Save file to R2
    const fileUrl = await saveToR2(
      c.env.PERFECTPRINT_STORAGE,
      jobId,
      file,
      'original'
    );

    // Create job in database
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

    // Return response
    return c.json<UploadResponse>({
      success: true,
      jobId,
      fileUrl,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return c.json<ErrorResponse>({
      success: false,
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

