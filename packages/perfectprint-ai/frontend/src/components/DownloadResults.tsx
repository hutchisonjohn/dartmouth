import type { ProcessingJob } from '../types';

interface DownloadResultsProps {
  job: ProcessingJob;
}

export default function DownloadResults({ job }: DownloadResultsProps) {
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Download Buttons */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* PNG Download */}
        {job.processedUrl && (
          <button
            onClick={() =>
              handleDownload(job.processedUrl!, `processed-${job.id}.png`)
            }
            className="flex items-center justify-center space-x-2 rounded-lg border-2 border-blue-600 bg-blue-600 px-6 py-4 text-white transition-colors hover:bg-blue-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span className="font-semibold">Download PNG</span>
          </button>
        )}

        {/* SVG Download */}
        {job.svgUrl && (
          <button
            onClick={() => handleDownload(job.svgUrl!, `vector-${job.id}.svg`)}
            className="flex items-center justify-center space-x-2 rounded-lg border-2 border-green-600 bg-green-600 px-6 py-4 text-white transition-colors hover:bg-green-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span className="font-semibold">Download SVG</span>
          </button>
        )}
      </div>

      {/* Processing Metrics */}
      {job.metrics && (
        <div className="rounded-lg bg-gray-50 p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Processing Metrics
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {job.metrics?.backgroundRemovalTime && (
              <div>
                <p className="text-xs text-gray-500">Background Removal</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {job.metrics.backgroundRemovalTime.toFixed(2)}s
                </p>
              </div>
            )}
            {job.metrics?.upscaleTime && (
              <div>
                <p className="text-xs text-gray-500">Upscaling</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {job.metrics.upscaleTime.toFixed(2)}s
                </p>
              </div>
            )}
            {job.metrics?.vectorizationTime && (
              <div>
                <p className="text-xs text-gray-500">Vectorization</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {job.metrics.vectorizationTime.toFixed(2)}s
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500">Total Time</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {job.metrics?.totalTime?.toFixed(2) || 'N/A'}s
              </p>
            </div>
          </div>
        </div>
      )}

      {/* File Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          File Information
        </h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Job ID:</dt>
            <dd className="font-mono text-gray-900">{job.id}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Status:</dt>
            <dd className="font-semibold text-green-600">
              {job.status.toUpperCase()}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Background Removed:</dt>
            <dd className="text-gray-900">
              {job.options.removeBackground ? '✅ Yes' : '❌ No'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Upscaled:</dt>
            <dd className="text-gray-900">
              {job.options.upscale ? '✅ Yes' : '❌ No'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Vectorized:</dt>
            <dd className="text-gray-900">
              {job.options.vectorize && job.svgUrl ? '✅ Yes' : '❌ No'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Success Message */}
      <div className="rounded-lg bg-green-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-green-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Processing Complete!
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                Your artwork has been processed and is ready for print-on-demand
                use. The transparent background makes it perfect for t-shirts,
                mugs, and other products.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

