/**
 * PerfectPrint AI - Type Definitions
 */

export interface Env {
  PERFECTPRINT_STORAGE: R2Bucket;
  DB: D1Database;
  PROCESSOR_URL: string;
  MAX_FILE_SIZE: string;
  ALLOWED_FILE_TYPES: string;
}

export interface ProcessingJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  originalUrl: string;
  processedUrl?: string;
  svgUrl?: string;
  options: ProcessingOptions;
  metrics?: ProcessingMetrics;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessingOptions {
  removeBackground: boolean;
  upscale: boolean;
  vectorize: boolean;
}

export interface ProcessingMetrics {
  upscaleTime?: number;
  backgroundRemovalTime?: number;
  vectorizationTime?: number;
  totalTime: number;
}

export interface UploadResponse {
  success: boolean;
  jobId: string;
  fileUrl: string;
  message?: string;
}

export interface ProcessResponse {
  success: boolean;
  jobId: string;
  status: string;
  message?: string;
}

export interface StatusResponse {
  success: boolean;
  job: ProcessingJob;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

