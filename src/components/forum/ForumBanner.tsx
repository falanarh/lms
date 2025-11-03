"use client";

import React from "react";
import { Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Forum } from "@/api/forums";

interface ForumBannerProps {
  forum?: Forum;
}

export const ForumBanner: React.FC<ForumBannerProps> = ({ forum }) => {
  // Forum images based on type
  const getForumImage = (forum?: Forum) => {
    if (!forum) {
      return "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&h=400&fit=crop&crop=center";
    }
    if (forum.type === "course") {
      return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop&crop=center";
    } else {
      return "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&h=400&fit=crop&crop=center";
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden mb-8 h-80 md:h-96">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
        style={{ backgroundImage: `url(${getForumImage(forum)})` }}
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />

      {/* Content */}
      <div className="relative h-full flex items-center p-8 md:p-12">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
              {forum?.type === "course" ? "Course Forum" : "General Forum"}
            </Badge>
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <Users className="w-4 h-4" />
              <span>{forum?.totalTopics || 0} topik</span>
            </div>
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <Clock className="w-4 h-4" />
              <span>Aktif {forum?.lastActivity ? new Date(forum.lastActivity).toLocaleDateString('id-ID') : 'Baru saja'}</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
            {forum?.title || 'Loading...'}
          </h1>
          <p className="text-lg md:text-xl text-white/95 max-w-2xl mb-6 drop-shadow">
            {forum?.description || 'Deskripsi forum tidak tersedia'}
          </p>
        </div>
      </div>
    </div>
  );
};