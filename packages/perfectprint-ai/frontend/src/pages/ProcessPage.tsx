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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🎨 PerfectPrint AI
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Professional artwork processing for print-on-demand
              </p>
            </div>
            {job && (
              <button
                onClick={handleReset}
                className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                New Upload
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Step 1: Upload */}
          {!job && (
            <div className="rounded-lg bg-white p-8 shadow">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Step 1: Upload Your Artwork
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Upload PNG, JPG, or WEBP files (max 10MB)
                </p>
              </div>
              <FileUpload onUploadComplete={handleUploadComplete} />
            </div>
          )}

          {/* Step 2: Processing Options */}
          {job && job.status === 'pending' && (
            <div className="rounded-lg bg-white p-8 shadow">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Step 2: Processing Options
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Choose how you want to process your artwork
                </p>
              </div>
              <ProcessingOptions
                job={job}
                onProcessStart={() => setIsProcessing(true)}
                onProcessComplete={handleProcessComplete}
              />
            </div>
          )}

          {/* Step 3: Processing Status */}
          {isProcessing && (
            <div className="rounded-lg bg-white p-8 shadow">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  Processing Your Artwork...
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  This may take 30-60 seconds
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {job && job.status === 'completed' && (
            <>
              <div className="rounded-lg bg-white p-8 shadow">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Before & After Comparison
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Drag the slider to compare original and processed images
                  </p>
                </div>
                <ImageComparison
                  originalUrl={job.originalUrl}
                  processedUrl={job.processedUrl!}
                />
              </div>

              <div className="rounded-lg bg-white p-8 shadow">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Download Results
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Your processed artwork is ready!
                  </p>
                </div>
                <DownloadResults job={job} />
              </div>
            </>
          )}

          {/* Error State */}
          {job && job.status === 'failed' && (
            <div className="rounded-lg bg-red-50 p-8 shadow">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Processing Failed
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{job.error || 'An unknown error occurred'}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handleReset}
                      className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Powered by BRIA-RMBG-2.0 (98% accuracy) • VTracer • Real-ESRGAN
          </p>
        </div>
      </footer>
    </div>
  );
}

