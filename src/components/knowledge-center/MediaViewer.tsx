'use client';

import { useState } from 'react';

import { X, Download, Volume2, FileText } from 'lucide-react';

import { CONTENT_TYPES, ContentType } from '@/types/knowledge-center';

export interface MediaViewerProps {
  src: string;
  type: ContentType;
  title?: string;
  className?: string;
  onClose?: () => void;
  autoplay?: boolean;
}

export default function MediaViewer({
  src,
  type,
  title,
  className = '',
  onClose,
  autoplay = false
}: MediaViewerProps) {
  const [isLoading, setIsLoading] = useState(true);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = title || 'media';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderVideoPlayer = () => (
    <div className="relative bg-black rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}

      <video
        src={src}
        className={`w-full h-auto ${className}`}
        controls
        autoPlay={autoplay}
        onLoadedData={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />

      {title && (
        <div className="absolute top-4 left-4 right-4 text-white">
          <h3 className="text-lg font-semibold drop-shadow-lg">{title}</h3>
        </div>
      )}
    </div>
  );

  const renderAudioPlayer = () => (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Volume2 className="w-8 h-8 text-blue-600" />
        </div>
        <div className="flex-1">
          {title && (
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          )}
          <p className="text-sm text-gray-600">Podcast / Audio Content</p>
        </div>
        <button
          onClick={handleDownload}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          title="Download"
        >
          <Download className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <audio
        src={src}
        controls
        autoPlay={autoplay}
        className="w-full"
        onLoadedData={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />

      {isLoading && (
        <div className="text-center py-4 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-2"></div>
          <p className="text-sm">Loading audio...</p>
        </div>
      )}
    </div>
  );

  const renderPDFViewer = () => (
    <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-red-600" />
          </div>
          <div>
            {title && (
              <h3 className="font-semibold text-gray-900">{title}</h3>
            )}
            <p className="text-sm text-gray-600">File Document</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Download
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      <div className="h-[600px] bg-gray-100 flex items-center justify-center">
        <iframe
          src={src}
          className="w-full h-full border-0"
          title={title || 'PDF Document'}
          onError={() => {
            // Fallback if iframe fails
            const container = document.getElementById('pdf-fallback');
            if (container) {
              container.style.display = 'flex';
            }
          }}
        />

        <div
          id="pdf-fallback"
          className="hidden flex-col items-center justify-center text-gray-500"
        >
          <FileText className="w-16 h-16 mb-4" />
          <p className="text-lg font-medium mb-2">File Preview</p>
          <p className="text-sm text-center mb-4 max-w-md">
            Your browser doesn't support inline file viewing. Please download the file to view it.
          </p>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download File
          </button>
        </div>
      </div>
    </div>
  );

  const renderArticleViewer = () => (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            {title && (
              <h3 className="font-semibold text-gray-900">{title}</h3>
            )}
            <p className="text-sm text-gray-600">Article</p>
          </div>
        </div>
      </div>

      <div className="p-8 prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900">
        <div className="text-gray-700">
          <p>This is an article type content. The full article content should be displayed in the detail page using the content_richtext field.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {type === CONTENT_TYPES.VIDEO && renderVideoPlayer()}
      {type === CONTENT_TYPES.PODCAST && renderAudioPlayer()}
      {type === CONTENT_TYPES.FILE && renderPDFViewer()}
      {type === CONTENT_TYPES.ARTICLE && renderArticleViewer()}

      {onClose && type !== CONTENT_TYPES.FILE && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}