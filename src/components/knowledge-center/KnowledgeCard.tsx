'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Utility function to get proper thumbnail URL
const getThumbnailUrl = (thumbnail: string) => {
  if (!thumbnail || thumbnail.trim() === '') {
    return '/api/placeholder/400x225.png';
  }

  // Handle YouTube URLs
  if (thumbnail.includes('youtube.com') || thumbnail.includes('youtu.be')) {
    // Extract YouTube video ID if it's a regular YouTube URL
    const videoId = extractYouTubeVideoId(thumbnail);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
    // If it's already an img.youtube.com URL, return as is
    if (thumbnail.includes('img.youtube.com') || thumbnail.includes('i.ytimg.com')) {
      return thumbnail;
    }
  }

  return thumbnail;
};

// Extract YouTube video ID from various YouTube URL formats
const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /(?:youtube\.com\/.*[?&]v=)([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
};
import {
  Calendar,
  Eye,
  ThumbsUp,
  Play,
  FileText,
  Headphones,
  Package,
  Clock,
} from 'lucide-react';
import { KnowledgeCenter, ContentType, CONTENT_TYPES, KNOWLEDGE_TYPES } from '@/types/knowledge-center';

interface KnowledgeCardProps {
  knowledge: KnowledgeCenter;
  className?: string;
}

export default function KnowledgeCard({
  knowledge,
  className = ''
}: KnowledgeCardProps) {
  const [imageError, setImageError] = useState(false);

  const getMediaIcon = () => {
    if (knowledge.type === 'webinar') {
      return <Calendar className="w-4 h-4" />;
    }

    const contentType = knowledge.knowledgeContent?.contentType as ContentType;
    switch (contentType) {
      case CONTENT_TYPES.VIDEO:
        return <Play className="w-4 h-4" />;
      case CONTENT_TYPES.FILE:
        return <FileText className="w-4 h-4" />;
      case CONTENT_TYPES.PODCAST:
        return <Headphones className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getMediaColor = () => {
    if (knowledge.type === 'webinar') {
      return 'bg-purple-100 text-purple-700 border-purple-200';
    }

    const contentType = knowledge.knowledgeContent?.contentType as ContentType;
    switch (contentType) {
      case CONTENT_TYPES.VIDEO:
        return 'bg-red-100 text-red-700 border-red-200';
      case CONTENT_TYPES.FILE:
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case CONTENT_TYPES.PODCAST:
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getMediaTypeLabel = () => {
    if (knowledge.type === 'webinar') {
      return 'Webinar';
    }

    const contentType = knowledge.knowledgeContent?.contentType as ContentType;
    switch (contentType) {
      case CONTENT_TYPES.VIDEO:
        return 'Video';
      case CONTENT_TYPES.FILE:
        return 'PDF';
      case CONTENT_TYPES.PODCAST:
        return 'Podcast';
      default:
        return 'Article';
    }
  };

  const getPlaceholderGradient = () => {
    if (knowledge.type === 'webinar') {
      return 'from-purple-100 via-purple-200 to-purple-300';
    }

    const contentType = knowledge.knowledgeContent?.contentType as ContentType;
    switch (contentType) {
      case CONTENT_TYPES.VIDEO:
        return 'from-red-100 via-red-200 to-red-300';
      case CONTENT_TYPES.FILE:
        return 'from-blue-100 via-blue-200 to-blue-300';
      case CONTENT_TYPES.PODCAST:
        return 'from-green-100 via-green-200 to-green-300';
      default:
        return 'from-gray-100 via-gray-200 to-gray-300';
    }
  };

  const isUpcomingWebinar =
    knowledge.type === 'webinar' &&
    knowledge.webinar?.zoomDate &&
    new Date(knowledge.webinar.zoomDate) > new Date();

  return (
    <Link href={`/knowledge-center/${knowledge.id}`} className="block group h-full">
      <article
        className={`bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:border-gray-300 hover:shadow-md flex flex-col h-full ${className}`}
        onClick={() => {
          // View count will be incremented when navigating to detail page
        }}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-100 overflow-hidden">
          {!imageError && knowledge.thumbnail ? (
            <Image
              src={getThumbnailUrl(knowledge.thumbnail)}
              alt={knowledge.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              onError={() => setImageError(true)}
              unoptimized={knowledge.thumbnail.includes('youtube.com')}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getPlaceholderGradient()} flex flex-col items-center justify-center gap-3`}>
              <div className="text-gray-600 opacity-70">
                <div className="w-16 h-16 flex items-center justify-center">
                  {(() => {
                    const Icon = knowledge.type === KNOWLEDGE_TYPES.WEBINAR ? Calendar :
                                 knowledge.knowledgeContent?.contentType === CONTENT_TYPES.VIDEO ? Play :
                                 knowledge.knowledgeContent?.contentType === CONTENT_TYPES.FILE ? FileText :
                                 knowledge.knowledgeContent?.contentType === CONTENT_TYPES.PODCAST ? Headphones : Package;
                    return <Icon className="w-16 h-16" />;
                  })()}
                </div>
              </div>
              <div className="text-gray-700 font-semibold text-base">
                {getMediaTypeLabel()}
              </div>
            </div>
          )}

          {/* Media type badge only */}
          <div className="absolute top-2 left-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border backdrop-blur-sm ${getMediaColor()}`}>
              {getMediaIcon()}
              <span>{getMediaTypeLabel()}</span>
            </div>
          </div>

          {/* Subject badge */}
          {knowledge.subject && (
            <div className="absolute top-2 right-2">
              <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-700 border border-white/50">
                {knowledge.subject}
              </div>
            </div>
          )}
        </div>

        {/* Content - Fixed height structure */}
        <div className="p-4 flex flex-col flex-1">
          {/* Title - Fixed height with line-clamp */}
          <h3 className="font-semibold text-gray-900 text-base mb-2 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[3rem]">
            {knowledge.title}
          </h3>

          {/* Description - Fixed height */}
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3 min-h-[2.5rem]">
            {knowledge.description}
          </p>

          {/* Webinar Status - Only for webinars with date */}
          {knowledge.type === KNOWLEDGE_TYPES.WEBINAR && knowledge.webinar?.zoomDate && (
            <div className="mb-3">
              {isUpcomingWebinar ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-md">
                  <Clock className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">Upcoming</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-md">
                  <Calendar className="w-3.5 h-3.5 text-orange-600" />
                  <span className="text-xs font-semibold text-orange-700">Past Event</span>
                </div>
              )}
            </div>
          )}

          {/* Tags - Fixed height - Removed since KnowledgeCenter doesn't have tags field */}
          <div className="mb-3 min-h-[1.5rem]">
            {/* Tags will be available when backend adds support for them */}
          </div>

          {/* Spacer to push footer to bottom */}
          <div className="flex-1"></div>

          {/* Footer - Minimal info */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 mt-auto">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{knowledge.viewCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                <span>{knowledge.likeCount}</span>
              </div>
            </div>
            <span className="text-gray-400 truncate max-w-[200px]">{knowledge.penyelenggara}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}