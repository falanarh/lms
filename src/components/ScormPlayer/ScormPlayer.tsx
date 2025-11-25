"use client";
import React, { useEffect, useRef, useState } from 'react';

import { Loader2, AlertCircle } from 'lucide-react';
import { useScormAPI } from '@/features/course/components/ScromAPI';

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
  height = '100%',
  width = '100%',
  onProgress,
  onComplete,
}: ScormPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize SCORM API
  useScormAPI({
    onInitialize: () => {
      console.log('✅ SCORM Content initialized');
    },
    onTerminate: () => {
      console.log('✅ SCORM Content terminated');
      onComplete?.();
    },
    onCommit: (data) => {
      console.log('💾 SCORM Data committed:', data);
      
      // Check for completion
      if (data['cmi.core.lesson_status'] === 'completed' || 
          data['cmi.completion_status'] === 'completed') {
        onComplete?.();
      }
      
      // Report progress
      onProgress?.(data);
    },
    onSetValue: (element, value) => {
      console.log(`📝 SCORM Set: ${element} = ${value}`);
      
      // Track specific values
      if (element === 'cmi.core.score.raw' || element === 'cmi.score.raw') {
        console.log('📊 Score updated:', value);
      }
    },
  });

  const absoluteScormUrl = React.useMemo(() => {
    console.log('🔗 ScormPlayer received URL:', scormUrl);
    
    if (!scormUrl) {
      console.error('❌ No SCORM URL provided');
      return '';
    }
    
    if (scormUrl.startsWith('http://') || scormUrl.startsWith('https://')) {
      console.log('✅ Valid absolute URL');
      return scormUrl;
    }
    
    console.error('❌ Invalid URL - not absolute:', scormUrl);
    return '';
  }, [scormUrl]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !absoluteScormUrl) return;

    const handleLoad = () => {
      console.log('✅ SCORM iframe loaded successfully');
      
      // Try to inject API reference into iframe if needed
      try {
        if (iframe.contentWindow) {
          (iframe.contentWindow as any).API = (window as any).API;
          (iframe.contentWindow as any).API_1484_11 = (window as any).API_1484_11;
          console.log('✅ Injected SCORM API into iframe');
        }
      } catch (e) {
        console.warn('⚠️ Could not inject API into iframe (may not be needed):', e);
      }
      
      setIsLoading(false);
      setLoadError(null);
    };

    const handleError = (e: ErrorEvent) => {
      console.error('❌ SCORM iframe failed to load:', e);
      setIsLoading(false);
      setLoadError('Failed to load SCORM content');
    };

    iframe.addEventListener('load', handleLoad);
    // @ts-ignore
    iframe.addEventListener('error', handleError);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      // @ts-ignore
      iframe.removeEventListener('error', handleError);
    };
  }, [absoluteScormUrl]);

  if (!absoluteScormUrl) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 text-red-600 p-6">
        <AlertCircle className="size-16 mb-4 text-red-400" />
        <p className="text-lg font-semibold mb-2">SCORM Loading Error</p>
        <p className="text-sm text-center max-w-md">
          The SCORM URL is invalid or missing. Please contact support if this problem persists.
        </p>
        {scormUrl && (
          <p className="text-xs mt-4 text-gray-500 font-mono bg-white px-3 py-2 rounded border border-red-200 max-w-full overflow-x-auto">
            Received: {scormUrl}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-white">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 z-10">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-700 font-medium">Loading SCORM content...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
          <div className="text-center text-red-600 p-6 max-w-md">
            <AlertCircle className="size-16 mb-4 text-red-400 mx-auto" />
            <p className="font-semibold text-lg mb-2">Failed to load SCORM content</p>
            <p className="text-sm text-gray-600">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* SCORM Content Iframe */}
      <iframe
        ref={iframeRef}
        src={absoluteScormUrl}
        width={width}
        height={height}
        title={title || 'SCORM Content'}
        className="absolute inset-0 w-full h-full border-0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      />
    </div>
  );
}