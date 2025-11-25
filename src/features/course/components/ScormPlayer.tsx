"use client";

import React, { useEffect, useRef } from 'react';

interface ScormPlayerProps {
  scormUrl: string;
  title?: string;
  height?: string | number;
  width?: string | number;
  onProgress?: (progress: any) => void;
  onComplete?: () => void;
}

export function ScormPlayer({
  scormUrl,
  title,
  height = '600px',
  width = '100%',
  onProgress,
  onComplete,
}: ScormPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ✅ ENSURE THE URL IS ABSOLUTE BEFORE USING IT
  // This is the critical fix.
  const absoluteScormUrl = React.useMemo(() => {
    if (!scormUrl) return '';
    
    // If it's already a full URL (starts with http:// or https://), use it as is.
    if (scormUrl.startsWith('http://') || scormUrl.startsWith('https://')) {
      return scormUrl;
    }
    
    // Otherwise, we can't reliably construct an absolute URL,
    // so we'll return an empty string to prevent loading.
    console.error('ScormPlayer: Invalid URL provided. Expected an absolute URL.', { scormUrl });
    return '';
  }, [scormUrl]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      console.log(`SCORM content loaded: ${absoluteScormUrl}`);
      // You can add more sophisticated API communication here if needed
    };

    const handleError = () => {
      console.error(`SCORM content failed to load: ${absoluteScormUrl}`);
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    // Cleanup function
    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [absoluteScormUrl]);

  if (!absoluteScormUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 text-red-600 p-4 rounded-lg border-2 border-red-200">
        <p>
          <strong>SCORM Loading Error:</strong> The URL provided to the SCORM player is not a valid absolute URL.
        </p>
        <p className="text-sm mt-2">Please check the console for more details.</p>
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      // ✅ USE THE GUARANTEED ABSOLUTE URL
      src={absoluteScormUrl}
      width={width}
      height={height}
      title={title || 'SCORM Content'}
      style={{ border: 'none' }}
      allowFullScreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    />
  );
}