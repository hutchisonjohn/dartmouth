import { useState } from 'react';
import { processImage, getJobStatus } from '../api/client';
import type { ProcessingJob, ProcessingOptions as Options } from '../types';

interface ProcessingOptionsProps {
  job: ProcessingJob;
  onProcessStart: () => void;
  onProcessComplete: (job: ProcessingJob) => void;
}

export default function ProcessingOptions({
  job,
  onProcessStart,
  onProcessComplete,
}: ProcessingOptionsProps) {
  const [options] = useState<Options>({
    removeBackground: true,
    upscale: true,
    vectorize: false,
  });
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    setError(null);
    onProcessStart();

    try {
      // Start processing
      await processImage(job.id, options);

      // Poll for status
      const pollInterval = setInterval(async () => {
        try {
          const response = await getJobStatus(job.id);

          if (response.job.status === 'completed') {
            clearInterval(pollInterval);
            onProcessComplete(response.job);
          } else if (response.job.status === 'failed') {
            clearInterval(pollInterval);
            onProcessComplete(response.job);
          }
        } catch (err) {
          clearInterval(pollInterval);
          setError(err instanceof Error ? err.message : 'Status check failed');
        }
      }, 2000);

      setTimeout(() => {
        clearInterval(pollInterval);
        setError('Processing timeout - please try again');
      }, 5 * 60 * 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Preview */}
      <div style={{ 
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ 
          display: 'inline-block',
          padding: '1rem',
          background: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e4e7ec'
        }}>
          <img
            src={job.originalUrl}
            alt="Your artwork"
            style={{ 
              maxWidth: '100%',
              maxHeight: '300px',
              borderRadius: '8px',
              display: 'block'
            }}
          />
        </div>
      </div>

      {/* Simple Explanation */}
      <div style={{
        background: 'linear-gradient(135deg, #ecf3ff 0%, #f2f7ff 100%)',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        border: '1px solid #dde9ff'
      }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          color: '#101828',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>✨</span>
          What we'll do:
        </h3>
        <ul style={{ 
          margin: 0,
          paddingLeft: '1.5rem',
          color: '#475467',
          fontSize: '0.875rem',
          lineHeight: '1.8'
        }}>
          <li><strong>Remove the background</strong> - Make it transparent for printing</li>
          <li><strong>Fix any pixelation</strong> - Enhance quality for crisp prints</li>
          <li><strong>Optimize for printing</strong> - Perfect for t-shirts, mugs, stickers</li>
        </ul>
      </div>

      {/* Big Process Button */}
      <button
        onClick={handleProcess}
        style={{
          width: '100%',
          padding: '1.25rem',
          background: 'linear-gradient(135deg, #3641f5 0%, #7592ff 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '1.125rem',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(54, 65, 245, 0.3)',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(54, 65, 245, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(54, 65, 245, 0.3)';
        }}
      >
        🚀 Make It Print-Ready
      </button>

      <p style={{ 
        textAlign: 'center', 
        marginTop: '1rem',
        color: '#667085',
        fontSize: '0.875rem'
      }}>
        Takes about 30-60 seconds
      </p>

      {/* Error Message */}
      {error && (
        <div style={{ 
          marginTop: '1.5rem',
          padding: '1rem', 
          background: '#fff5f5', 
          border: '2px solid #fc8181',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>❌</div>
            <div>
              <h3 style={{ fontWeight: '600', color: '#c53030', marginBottom: '0.5rem' }}>
                Something went wrong
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
