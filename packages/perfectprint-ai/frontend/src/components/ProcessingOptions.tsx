import { useState, useEffect } from 'react';
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
  const [options, setOptions] = useState<Options>({
    removeBackground: true,
    upscale: false,
    vectorize: true,
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
      }, 2000); // Poll every 2 seconds

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        setError('Processing timeout - please try again');
      }, 5 * 60 * 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Preview Original Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Original Image
        </label>
        <div className="mt-2 rounded-lg border border-gray-300 bg-gray-50 p-4">
          <img
            src={job.originalUrl}
            alt="Original"
            className="mx-auto max-h-64 rounded-lg"
          />
        </div>
      </div>

      {/* Processing Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Processing Options
        </label>
        <div className="mt-3 space-y-3">
          {/* Background Removal */}
          <label className="flex items-start rounded-lg border-2 border-gray-200 p-4 hover:border-blue-300 cursor-pointer transition-colors">
            <div className="flex h-5 items-center">
              <input
                type="checkbox"
                checked={options.removeBackground}
                onChange={(e) =>
                  setOptions({ ...options, removeBackground: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  Remove Background
                </span>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Recommended
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Removes backgrounds for transparent PNG. Perfect for t-shirts, mugs, stickers.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                ✨ BRIA-RMBG-2.0 (98% accuracy) • ~45 seconds
              </p>
            </div>
          </label>

          {/* Upscale */}
          <label className="flex items-start rounded-lg border-2 border-gray-200 p-4 hover:border-blue-300 cursor-pointer transition-colors">
            <div className="flex h-5 items-center">
              <input
                type="checkbox"
                checked={options.upscale}
                onChange={(e) =>
                  setOptions({ ...options, upscale: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  AI Upscale & Fix Pixelation
                </span>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Recommended
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Fixes blurry/pixelated images using AI. Makes low-resolution artwork print-ready.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                🤖 Real-ESRGAN AI • ~5 seconds • Adds realistic detail
              </p>
            </div>
          </label>

          {/* Vectorize */}
          <label className="flex items-start rounded-lg border-2 border-gray-200 p-4 hover:border-gray-300 cursor-pointer transition-colors">
            <div className="flex h-5 items-center">
              <input
                type="checkbox"
                checked={options.vectorize}
                onChange={(e) =>
                  setOptions({ ...options, vectorize: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  Convert to Vector (SVG)
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  Optional
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Creates scalable vector file (SVG). For cutting machines (Cricut), embroidery, or infinite scaling.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                ✂️ VTracer • ~8 seconds • Not needed for most print-on-demand
              </p>
              <p className="mt-1 text-xs text-amber-600">
                ⚠️ Requires Rust installation on server
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Process Button */}
      <div>
        <button
          onClick={handleProcess}
          disabled={
            !options.removeBackground && !options.upscale && !options.vectorize
          }
          className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          🚀 Process Artwork
        </button>
        <p className="mt-2 text-center text-xs text-gray-500">
          Processing typically takes 30-60 seconds
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
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
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

