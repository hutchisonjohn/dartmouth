/**
 * R2 Storage Service
 * Handle file operations with Cloudflare R2
 */

export async function saveToR2(
  bucket: R2Bucket,
  jobId: string,
  file: File,
  type: 'original' | 'processed' | 'svg'
): Promise<string> {
  const extension = file.name.split('.').pop() || 'png';
  const key = `${jobId}/${type}.${extension}`;

  // Convert File to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Upload to R2
  await bucket.put(key, arrayBuffer, {
    httpMetadata: {
      contentType: file.type
    }
  });

  // Return public URL (you'll need to configure R2 public access)
  return `https://perfectprint-files.your-domain.com/${key}`;
}

export async function getFromR2(
  bucket: R2Bucket,
  key: string
): Promise<ArrayBuffer | null> {
  const object = await bucket.get(key);
  
  if (!object) {
    return null;
  }

  return await object.arrayBuffer();
}

export async function saveBase64ToR2(
  bucket: R2Bucket,
  jobId: string,
  base64Data: string,
  type: 'processed' | 'svg',
  contentType: string
): Promise<string> {
  // Remove data URL prefix if present
  const base64 = base64Data.includes(',') 
    ? base64Data.split(',')[1] 
    : base64Data;

  // Decode base64
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const extension = type === 'svg' ? 'svg' : 'png';
  const key = `${jobId}/${type}.${extension}`;

  // Upload to R2
  await bucket.put(key, bytes.buffer, {
    httpMetadata: {
      contentType
    }
  });

  return `https://perfectprint-files.your-domain.com/${key}`;
}

export async function deleteFromR2(
  bucket: R2Bucket,
  jobId: string
): Promise<void> {
  // Delete all files for this job
  const keys = [
    `${jobId}/original.png`,
    `${jobId}/original.jpg`,
    `${jobId}/processed.png`,
    `${jobId}/svg.svg`
  ];

  for (const key of keys) {
    await bucket.delete(key);
  }
}

