import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from 'react-compare-slider';

interface ImageComparisonProps {
  originalUrl: string;
  processedUrl: string;
}

export default function ImageComparison({
  originalUrl,
  processedUrl,
}: ImageComparisonProps) {
  return (
    <div className="space-y-4">
      {/* Slider */}
      <div className="overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-100">
        <ReactCompareSlider
          itemOne={
            <ReactCompareSliderImage
              src={originalUrl}
              alt="Original"
              style={{ objectFit: 'contain' }}
            />
          }
          itemTwo={
            <ReactCompareSliderImage
              src={processedUrl}
              alt="Processed"
              style={{ objectFit: 'contain' }}
            />
          }
          position={50}
          style={{
            height: '600px',
            width: '100%',
          }}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <span className="font-medium text-gray-700">Original</span>
        </div>
        <div className="text-gray-500">← Drag slider to compare →</div>
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-700">Processed</span>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        </div>
      </div>

      {/* Checkerboard Pattern Info */}
      <div className="rounded-md bg-blue-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> The checkerboard pattern you see indicates
              transparent areas. Your processed image has a transparent
              background, perfect for print-on-demand!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

