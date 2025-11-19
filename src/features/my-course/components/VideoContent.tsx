import { Content } from "@/api/contents";
import { Play } from "lucide-react";
import { useRef, useState } from "react";

interface VideoContentProps {
  content: Content;
  isSidebarOpen: boolean;
}

export const VideoContent = ({ content, isSidebarOpen }: VideoContentProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  return (
    <div
      className={`relative w-full rounded-md overflow-hidden transition-all duration-500 bg-black ${
        isSidebarOpen
          ? "aspect-[3/4] md:aspect-auto md:h-[520px]"
          : "aspect-[3/4] md:aspect-auto md:h-[520px]"
      }`}
    >
      <video
        key={content.id}
        ref={videoRef}
        className="w-full h-full object-contain"
        controls={isPlaying}
        onPlay={handlePlay}
        onPause={handlePause}
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
};
