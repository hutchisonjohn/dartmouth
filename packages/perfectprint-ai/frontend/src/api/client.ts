import type { UploadResponse, ProcessResponse, StatusResponse, ProcessingOptions } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export async function uploadFile(file: File): Promise<UploadResponse> {
  console.log('📤 [CLIENT] Starting file upload...', { name: file.name, size: file.size, type: file.type });
  
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  console.log(`📡 [CLIENT] Upload response: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ [CLIENT] Upload failed:', errorData);
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ [CLIENT] Upload successful:', data);
  return data;
}

export async function processImage(
  jobId: string,
  options: ProcessingOptions
): Promise<ProcessResponse> {
  console.log('⚙️ [CLIENT] Starting image processing...', { jobId, options });
  
  const response = await fetch(`${API_BASE_URL}/api/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jobId, options }),
  });

  console.log(`📡 [CLIENT] Process response: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ [CLIENT] Processing failed:', errorData);
    throw new Error(`Processing failed: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ [CLIENT] Processing started:', data);
  return data;
}

export async function getJobStatus(jobId: string): Promise<StatusResponse> {
  const response = await fetch(`${API_BASE_URL}/api/status/${jobId}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ [CLIENT] Status check failed:', errorData);
    throw new Error(`Failed to get status: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`📊 [CLIENT] Job status: ${data.job.status}`, data.job);
  return data;
}

