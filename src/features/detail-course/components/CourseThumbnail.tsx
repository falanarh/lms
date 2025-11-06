"use client";

import { BookOpen, Play } from "lucide-react";
import { useState, useRef } from "react";

interface CourseThumbnailProps {
  thumbnail?: string;      // URL foto/poster
  trailerUrl?: string;     // URL video/foto trailer dari API
  title: string;
}

export const CourseThumbnail = ({ thumbnail, trailerUrl, title }: CourseThumbnailProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-detect media type dari URL
  const getMediaType = (url?: string): 'video' | 'image' | null => {
    if (!url) return null;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    
    const lowerUrl = url.toLowerCase();
    if (videoExtensions.some(ext => lowerUrl.includes(ext))) return 'video';
    if (imageExtensions.some(ext => lowerUrl.includes(ext))) return 'image';
    
    return null;
  };

  const mediaType = getMediaType(trailerUrl);
  const displayUrl = trailerUrl || thumbnail;

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoError = () => {
    setHasError(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  // Render video player
  if (mediaType === 'video' && !hasError) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-gray-200">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          poster={thumbnail}
          onError={handleVideoError}
          onPause={handleVideoPause}
          onPlay={handleVideoPlay}
          controls={isPlaying}
        >
          <source src={trailerUrl} type="video/mp4" />
          <source src={trailerUrl} type="video/webm" />
          Your browser does not support the video tag.
        </video>
        
        {/* Custom Play Button Overlay */}
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
  }

  // Render image
  if (displayUrl && (mediaType === 'image' || hasError)) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-gray-200">
        <img
          src={displayUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Fallback placeholder
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-gray-200">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <BookOpen
              className="w-10 h-10 text-blue-600"
              strokeWidth={1.5}
            />
          </div>
          <p className="text-gray-500 font-medium text-sm">
            Course Preview
          </p>
        </div>
      </div>
    </div>
  );
};
