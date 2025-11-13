"use client";

import { Content } from "@/api/contents";
import { FileText, Link as LinkIcon, Package, Play } from "lucide-react";
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
              ? 'aspect-[4/3] md:max-h-[450px]' 
              : 'aspect-[4/3] md:max-h-[450px]'
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
          <div className="w-full aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 flex items-center justify-center ${
            isSidebarOpen 
              ? 'aspect-[4/3] md:h-[450px]' 
              : 'aspect-[4/3]  md:aspect-ratio-[4/3] '
          }">
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
          <div className="w-full aspect-video bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{content.name}</h3>
              <p className="text-gray-600 mb-6">{content.description}</p>
              <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                View Assignment
              </button>
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
