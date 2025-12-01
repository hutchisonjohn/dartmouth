import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile } from '../api/client';
import type { ProcessingJob } from '../types';

interface FileUploadProps {
  onUploadComplete: (job: ProcessingJob) => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setIsUploading(true);
      setError(null);

      try {
        // Create a local preview URL
        const reader = new FileReader();
        reader.onload = async (e) => {
          const dataUrl = e.target?.result as string;
          
          try {
            const response = await uploadFile(file);

            // Create job with local preview URL
            const job: ProcessingJob = {
              id: response.jobId,
              status: 'pending',
              originalUrl: dataUrl, // Use data URL for preview
              options: {
                removeBackground: true,
                upscale: true,
                vectorize: false,
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            onUploadComplete(job);
            setIsUploading(false);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
            setIsUploading(false);
          }
        };
        
        reader.readAsDataURL(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
        setIsUploading(false);
      }
    },
    [onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: isUploading,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? 'active' : ''}`}
        style={{ opacity: isUploading ? 0.6 : 1, cursor: isUploading ? 'not-allowed' : 'pointer' }}
      >
        <input {...getInputProps()} />

        <div className="upload-icon">
          📤
        </div>

        <div className="upload-text">
          {isUploading ? (
            'Uploading...'
          ) : isDragActive ? (
            'Drop your file here'
          ) : (
            <>
              Drop your artwork here, or <span style={{ color: '#3641f5', fontWeight: '600' }}>browse</span>
            </>
          )}
        </div>

        <div className="upload-subtext">
          PNG, JPG, or WEBP up to 10MB
        </div>

        {isUploading && (
          <div className="spinner" style={{ marginTop: '1.5rem' }}></div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          background: '#fff5f5', 
          border: '2px solid #fc8181',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>❌</div>
            <div>
              <h3 style={{ fontWeight: '600', color: '#c53030', marginBottom: '0.5rem' }}>
                Upload Error
              </h3>
              <p style={{ color: '#742a2a', fontSize: '0.875rem' }}>
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

