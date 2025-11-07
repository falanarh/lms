"use client";

import { Content } from "@/api/contents";
import { FileText, Link as LinkIcon, Package, Play, Maximize2, Minimize2 } from "lucide-react";
import { useState, useRef } from "react";

interface ContentPlayerProps {
  content: Content | null;
}

export const ContentPlayer = ({ content }: ContentPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMaximize = () => {
    if (!isMaximized && containerRef.current) {
      containerRef.current.requestFullscreen?.();
      setIsMaximized(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsMaximized(false);
    }
  };

  if (!content) {
    return (
      <div className="w-full flex justify-center px-4 lg:px-0">
        <div className="w-full max-w-[1000px] aspect-video bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-gray-200 flex items-center justify-center">
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
          <div className="relative w-full max-w-[1000px] aspect-video bg-black rounded-xl overflow-hidden group/video">
            <video
              ref={videoRef}
              className="w-full h-full"
              controls={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={content.contentUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Maximize Button */}
            <button
              onClick={handleMaximize}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all opacity-0 group-hover/video:opacity-100 z-10"
              title={isMaximized ? "Exit fullscreen" : "Fullscreen"}
            >
              {isMaximized ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
            
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
          <div className="relative w-full max-w-[1000px] aspect-video bg-white rounded-xl overflow-hidden border border-gray-200 group/pdf">
            <iframe
              src={content.contentUrl}
              className="w-full h-full"
              title={content.name}
            />
            
            {/* Maximize Button */}
            <button
              onClick={handleMaximize}
              className="absolute top-4 right-4 p-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg shadow-md transition-all opacity-0 group-hover/pdf:opacity-100 z-10 border border-gray-200"
              title={isMaximized ? "Exit fullscreen" : "Fullscreen"}
            >
              {isMaximized ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
          </div>
        );

      case "link":
        return (
          <div className="w-full max-w-[1000px] aspect-video bg-white rounded-xl overflow-hidden border border-gray-200">
            <iframe
              src={content.contentUrl}
              className="w-full h-full"
              title={content.name}
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
        );

      case "scorm":
        return (
          <div className="w-full max-w-[1000px] aspect-video bg-white rounded-xl overflow-hidden border border-gray-200">
            <iframe
              src={content.contentUrl}
              className="w-full h-full"
              title={content.name}
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
        );

      case "quiz":
        return (
          <div className="w-full max-w-[1000px] aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 flex items-center justify-center">
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

      case "assignment":
        return (
          <div className="w-full max-w-[1000px] aspect-video bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 flex items-center justify-center">
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
          <div className="w-full max-w-[1000px] aspect-video bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center">
            <div className="text-center">
              <LinkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Unsupported content type</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full flex justify-center px-4 lg:px-0">
      <div ref={containerRef} className="w-full max-w-[1000px] space-y-4">
        {renderContent()}
      </div>
    </div>
  );
};
