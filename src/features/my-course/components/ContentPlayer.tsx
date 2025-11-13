"use client";

import { Content } from "@/api/contents";
import { FileCheck, FileText, Link as LinkIcon, Package, Play } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ContentPlayerProps {
  content: Content | null;
  isSidebarOpen?: boolean;
}

export const ContentPlayer = ({ content, isSidebarOpen = true }: ContentPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset state when content changes
  useEffect(() => {
    setIsPlaying(false);
    
    // Reset video if ref exists
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.load();
    }
  }, [content?.id]);

  if (!content) {
    return (
      <div className="w-full flex justify-center px-4 lg:px-0">
        <div className="w-full aspect-video bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-gray-200 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Select a content to start learning</p>
            <p className="text-gray-400 text-sm mt-2">Choose from the course contents below</p>
          </div>
        </div>
      </div>
    );
  }

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Render berdasarkan tipe content
  const renderContent = () => {
    switch (content.type.toLowerCase()) {
      case "video":
        return (
          <div className={`relative w-full rounded-md overflow-hidden transition-all duration-500 bg-black ${
            isSidebarOpen 
              ? 'aspect-[3/4] md:h-[450px]' 
              : 'aspect-[3/4] md:h-[450px]'
          }`}>
            <video
              key={content.id}
              ref={videoRef}
              className="w-full h-full object-contain"
              controls={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={content.contentUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {!isPlaying && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer group hover:bg-black/30 transition-colors"
                onClick={handlePlayClick}
              >
                <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-10 h-10 text-blue-600 ml-1" fill="currentColor" />
                </div>
              </div>
            )}
          </div>
        );

      case "pdf":
        return (
          <div className={`relative w-full bg-white rounded-md overflow-hidden transition-all duration-500 ${
            isSidebarOpen 
              ? 'aspect-[3/4] md:h-[450px]' 
              : 'aspect-[3/4] md:h-[450px]'
          }`}>
            <iframe
              key={content.id}
              src={content.contentUrl}
              className="w-full h-full"
              title={content.name}
            />
          </div>
        );

      case "link":
        return (
          <div className={`relative w-full bg-white rounded-xl overflow-hidden border border-gray-200 shadow-lg transition-all duration-500 ${
            isSidebarOpen ? 'aspect-[4/3] md:aspect-video md:max-h-[450px]' : 'aspect-[4/3] md:aspect-video md:max-h-[450px] lg:max-h-[506px]'
          }`}>
            <iframe
              key={content.id}
              src={content.contentUrl}
              className="w-full h-full"
              title={content.name}
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
        );

      case "scorm":
        return (
          <div className={`relative w-full bg-white rounded-md overflow-hidden transition-all duration-500 ${
            isSidebarOpen 
              ? 'aspect-[3/4] md:h-[450px]' 
              : 'aspect-[3/4] md:h-[450px]'
          }`}>
            <iframe
              key={content.id}
              src={content.contentUrl}
              className="w-full h-full border-0"
              title={content.name}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation allow-downloads"
              allow="fullscreen; autoplay; camera; microphone; geolocation"
              loading="lazy"
            />
          </div>
        );

      case "quiz":
        return (
          <div className={`w-full aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 flex items-center justify-center ${
            isSidebarOpen 
              ? 'aspect-[3/4] md:h-[450px]' 
              : 'aspect-[3/4]  md:h-[450px]'
          }`}>
            <div className="text-center p-8">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{content.name}</h3>
              <p className="text-gray-600 mb-6">{content.description}</p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Start Quiz
              </button>
            </div>
          </div>
        );

      case "task":
        return (
          <div className={`relative w-full bg-white rounded-md overflow-hidden transition-all duration-500 border border-gray-200 shadow-sm flex flex-col ${
            isSidebarOpen 
              ? 'aspect-[3/4] md:h-[450px]' 
              : 'aspect-[3/4] md:h-[450px]'
          }`}>
            {/* Deadline - Top Right Corner (desktop only) */}
            <div className="hidden md:block absolute md:top-4 md:right-4 z-10">
              <div className="px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium">
                Due: Not specified
              </div>
            </div>

            {/* Header */}
            <div className="p-3 md:p-6 md:pr-32 flex-shrink-0">
              <div className="flex items-start gap-2 md:gap-4">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <FileCheck className="w-4 h-4 md:w-6 md:h-6 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-lg font-semibold text-gray-900 mb-1 md:mb-2 truncate">{content.name}</p>
                  <p className="text-gray-600 text-xs md:text-base leading-relaxed">{content.description}</p>
                  {/* Deadline - Mobile below description */}
                  <p className="mt-1 text-xs text-gray-500 md:hidden">Due: Not specified</p>
                </div>
              </div>
            </div>

            {/* Assignment Content */}
            {content.contentUrl && (
              <div className="px-3 md:px-6 pb-2 md:pb-3 flex-shrink-0">
                <div className="bg-gray-50 rounded-lg p-2 md:p-4 border border-gray-200">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm md:text-base truncate">Assignment Document</p>
                    </div>
                    <button 
                      onClick={() => window.open(content.contentUrl, '_blank')}
                      className="px-2 py-1 md:px-4 md:py-2 bg-blue-600 text-white rounded text-xs md:text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Submission Section - Flexible */}
            <div className="p-3 md:p-6 flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between mb-2 md:mb-4 flex-shrink-0">
                <h3 className="text-sm md:text-lg font-medium text-gray-900">Your Submission</h3>
                <div className="text-xs md:text-sm text-gray-500">
                  Status: <span className="font-medium">Not submitted</span>
                </div>
              </div>

              {/* File Upload Component - Compact Dropzone */}
              <div className="mb-3 md:mb-4 flex-1 min-h-0 overflow-y-auto">
                <div className="h-full">
                  <label htmlFor={`task-upload-${content.id}`} className="block w-full h-full cursor-pointer">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-white/50 text-center p-6 md:p-8 h-full">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3">
                        <FileText className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-sm md:text-base text-gray-700 font-medium">Klik untuk upload dokumen</p>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">PDF, DOC, PPT (max 10MB)</p>
                    </div>
                  </label>
                  <input
                    id={`task-upload-${content.id}`}
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      console.log('Files uploaded:', Array.from(files).map(f => ({ name: f.name, size: f.size })));
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons - Bottom */}
              <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 mt-auto">
                <button className="flex-1 px-3 py-2 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-xs md:text-sm">
                  Turn In
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full aspect-video bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center">
            <div className="text-center">
              <LinkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Unsupported content type</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {renderContent()}
    </div>
  );
};
