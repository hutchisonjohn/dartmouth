import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import ProcessingOptions from '../components/ProcessingOptions';
import ImageComparison from '../components/ImageComparison';
import DownloadResults from '../components/DownloadResults';
import { ProcessingJob } from '../types';

export default function ProcessPage() {
  const [job, setJob] = useState<ProcessingJob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUploadComplete = (uploadedJob: ProcessingJob) => {
    setJob(uploadedJob);
  };

  const handleProcessComplete = (processedJob: ProcessingJob) => {
    setJob(processedJob);
    setIsProcessing(false);
  };

  const handleReset = () => {
    setJob(null);
    setIsProcessing(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      {/* Hero Header */}
      <header style={{ 
        background: 'linear-gradient(135deg, #3641f5 0%, #7592ff 100%)',
        padding: '3rem 2rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: '700', 
            marginBottom: '1rem',
            letterSpacing: '-0.02em'
          }}>
            PerfectPrint AI
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            opacity: 0.95,
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Transform your artwork into print-ready files with AI-powered background removal and enhancement
          </p>
          
          {!job && (
            <div style={{ 
              display: 'inline-flex', 
              gap: '1rem',
              background: 'rgba(255,255,255,0.1)',
              padding: '1rem 2rem',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>98%</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Accuracy</div>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>30s</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Processing</div>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>Free</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>No Signup</div>
              </div>
            </div>
          )}

          {job && (
            <button 
              onClick={handleReset} 
              style={{
                background: 'white',
                color: '#3641f5',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              ← Process Another Image
            </button>
          )}
        </div>
      </header>

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        
        {/* Upload Section */}
        {!job && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <FileUpload onUploadComplete={handleUploadComplete} />
            
            {/* Features Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '2rem',
              marginTop: '4rem'
            }}>
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎯</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#101828', marginBottom: '0.5rem' }}>
                  AI Background Removal
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#667085', lineHeight: '1.6' }}>
                  BRIA-RMBG-2.0 removes backgrounds with 98% accuracy, perfect for t-shirts, mugs, and any print-on-demand product
                </p>
              </div>

              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✨</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#101828', marginBottom: '0.5rem' }}>
                  Fix Pixelation
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#667085', lineHeight: '1.6' }}>
                  Automatically upscale and enhance low-resolution images for crisp, professional prints
                </p>
              </div>

              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚡</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#101828', marginBottom: '0.5rem' }}>
                  Lightning Fast
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#667085', lineHeight: '1.6' }}>
                  Get your print-ready files in 30-60 seconds. No waiting, no hassle
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Processing Options */}
        {job && job.status === 'pending' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card">
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#101828', marginBottom: '0.5rem' }}>
                Choose Your Processing Options
              </h2>
              <p style={{ color: '#667085', marginBottom: '2rem', fontSize: '0.875rem' }}>
                Select which enhancements you'd like to apply
              </p>
              <ProcessingOptions
                job={job}
                onProcessStart={() => setIsProcessing(true)}
                onProcessComplete={handleProcessComplete}
              />
            </div>
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '4rem 0' }}>
            <div className="spinner" style={{ width: '60px', height: '60px', margin: '0 auto 2rem' }}></div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#101828', marginBottom: '0.5rem' }}>
              Processing Your Artwork...
            </h2>
            <p style={{ color: '#667085', fontSize: '0.875rem' }}>
              This usually takes 30-60 seconds
            </p>
          </div>
        )}

        {/* Results */}
        {job && job.status === 'completed' && (
          <div>
            {/* Success Banner */}
            <div style={{ 
              background: 'linear-gradient(135deg, #ecfdf3 0%, #d1fadf 100%)',
              padding: '2rem',
              borderRadius: '12px',
              textAlign: 'center',
              marginBottom: '3rem',
              border: '1px solid #a6f4c5'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#027a48', marginBottom: '0.5rem' }}>
                Your Artwork is Ready!
              </h2>
              <p style={{ color: '#05603a', fontSize: '0.875rem' }}>
                Background removed and enhanced for professional printing
              </p>
            </div>

            {/* Before/After Comparison */}
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#101828', marginBottom: '0.5rem' }}>
                Before & After
              </h2>
              <p style={{ color: '#667085', marginBottom: '2rem', fontSize: '0.875rem' }}>
                Drag the slider to see the transformation
              </p>
              <ImageComparison
                originalUrl={job.originalUrl}
                processedUrl={(() => {
                  // For local dev: extract base64 from error field
                  if (job.error && job.error.startsWith('{')) {
                    try {
                      const data = JSON.parse(job.error);
                      if (data.processedPng) {
                        return `data:image/png;base64,${data.processedPng}`;
                      }
                    } catch (e) {
                      // Fall back to processedUrl
                    }
                  }
                  return job.processedUrl!;
                })()}
              />
            </div>

            {/* Download Section */}
            <div className="card">
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#101828', marginBottom: '0.5rem' }}>
                Download Your Files
              </h2>
              <p style={{ color: '#667085', marginBottom: '2rem', fontSize: '0.875rem' }}>
                Your print-ready files with transparent background
              </p>
              <DownloadResults job={job} />
            </div>
          </div>
        )}

        {/* Error State */}
        {job && job.status === 'failed' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ 
              background: '#fff5f5', 
              border: '2px solid #fc8181',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#c53030', marginBottom: '0.5rem' }}>
                Processing Failed
              </h3>
              <p style={{ color: '#742a2a', marginBottom: '1.5rem' }}>
                {job.error || 'An unknown error occurred'}
              </p>
              <button 
                onClick={handleReset} 
                style={{
                  background: '#fc8181',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ 
        background: '#f9fafb', 
        borderTop: '1px solid #e4e7ec',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <p style={{ color: '#667085', fontSize: '0.875rem' }}>
          © 2025 PerfectPrint AI • Professional artwork processing for print-on-demand
        </p>
      </footer>
    </div>
  );
}
