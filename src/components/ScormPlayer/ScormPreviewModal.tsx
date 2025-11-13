"use client";
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ScormPlayer } from './ScormPlayer';
import { 
  X, 
  Play, 
  ExternalLink, 
  Info, 
  Maximize2, 
  Minimize2,
  Download
} from 'lucide-react';

interface ScormPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  scormUrl: string;
  title: string;
  description?: string;
}

export function ScormPreviewModal({
  isOpen,
  onClose,
  scormUrl,
  title,
  description
}: ScormPreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleProgress = (progress: any) => {
    console.log('📊 SCORM Progress:', progress);
    // You can save this to your backend here
  };

  const handleComplete = () => {
    console.log('✅ SCORM Completed!');
    // You can track completion in your backend here
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isOpen) return null;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
  
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  // Also prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`
          bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden
          transition-all duration-300 ease-in-out
          ${isFullscreen 
            ? 'w-full h-full m-0 rounded-none' 
            : 'w-[95vw] h-[95vh] max-w-[1800px]'
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-blue-100">
              <Play className="size-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 truncate text-lg">
                {title}
              </h2>
              {description && (
                <p className="text-sm text-gray-600 truncate mt-0.5">
                  {description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {/* Fullscreen Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="hidden sm:flex"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </Button>

            {/* Open in New Tab */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(scormUrl, '_blank')}
              className="hidden md:flex items-center gap-2"
            >
              <ExternalLink className="size-4" />
              <span className="hidden lg:inline">New Tab</span>
            </Button>

            {/* Close Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="size-5" />
            </Button>
          </div>
        </div>
        
        {/* Player Container - Takes up remaining space */}
        <div className="flex-1 bg-gray-50 overflow-hidden relative">
          <ScormPlayer
            scormUrl={scormUrl}
            title={title}
            height="100%"
            width="100%"
            onProgress={handleProgress}
            onComplete={handleComplete}
          />
        </div>
        
        {/* Footer Info - Only show when not fullscreen */}
        {!isFullscreen && (
          <div className="px-6 py-3 border-t bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Info className="size-4 flex-shrink-0" />
                <span className="hidden sm:inline">
                  Your progress and completion status will be tracked automatically.
                </span>
                <span className="sm:hidden">
                  Progress tracked automatically
                </span>
              </div>
              
              {/* Mobile actions */}
              <div className="flex items-center gap-2 md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  title="Fullscreen"
                >
                  <Maximize2 className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(scormUrl, '_blank')}
                  title="Open in new tab"
                >
                  <ExternalLink className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Keyboard hint - Only show when not fullscreen */}
      {!isFullscreen && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm hidden lg:block">
          Press <kbd className="px-2 py-1 bg-white/20 rounded mx-1">Esc</kbd> to close
        </div>
      )}
    </div>
  );
}