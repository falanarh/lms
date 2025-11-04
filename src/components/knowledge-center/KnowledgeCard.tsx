'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale/id';
import {
  Calendar,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Play,
  FileText,
  Headphones,
  Package,
  ExternalLink,
  Clock,
  Award,
  Users,
} from 'lucide-react';
import { Knowledge, MediaType, KnowledgeType } from '@/types/knowledge-center';
import { useKnowledgeInteraction } from '@/hooks/useKnowledgeCenter';

interface KnowledgeCardProps {
  knowledge: Knowledge;
  showActions?: boolean;
  className?: string;
}

export default function KnowledgeCard({
  knowledge,
  showActions = true,
  className = ''
}: KnowledgeCardProps) {
  const { like, dislike, isLiking, isDisliking } = useKnowledgeInteraction();
  const [imageError, setImageError] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (knowledge.id) {
      like(knowledge.id);
    }
  };

  const handleDislike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (knowledge.id) {
      dislike(knowledge.id);
    }
  };

  const getMediaIcon = () => {
    if (knowledge.knowledge_type === 'webinar') {
      return <Calendar className="w-4 h-4" />;
    }

    const mediaType = (knowledge as any).media_type as MediaType;
    switch (mediaType) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'audio':
        return <Headphones className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getMediaColor = () => {
    if (knowledge.knowledge_type === 'webinar') {
      return 'bg-purple-100 text-purple-700 border-purple-200';
    }

    const mediaType = (knowledge as any).media_type as MediaType;
    switch (mediaType) {
      case 'video':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pdf':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'audio':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getMediaTypeLabel = () => {
    if (knowledge.knowledge_type === 'webinar') {
      return 'Webinar';
    }

    const mediaType = (knowledge as any).media_type as MediaType;
    switch (mediaType) {
      case 'video':
        return 'Video';
      case 'pdf':
        return 'PDF';
      case 'audio':
        return 'Podcast';
      default:
        return 'Article';
    }
  };

  const getPlaceholderGradient = () => {
    if (knowledge.knowledge_type === 'webinar') {
      return 'from-purple-100 via-purple-200 to-purple-300';
    }

    const mediaType = (knowledge as any).media_type as MediaType;
    switch (mediaType) {
      case 'video':
        return 'from-red-100 via-red-200 to-red-300';
      case 'pdf':
        return 'from-blue-100 via-blue-200 to-blue-300';
      case 'audio':
        return 'from-green-100 via-green-200 to-green-300';
      default:
        return 'from-gray-100 via-gray-200 to-gray-300';
    }
  };

  const isUpcomingWebinar =
    knowledge.knowledge_type === 'webinar' &&
    (knowledge as any).tgl_zoom &&
    new Date((knowledge as any).tgl_zoom) > new Date();

  const isPastWebinar =
    knowledge.knowledge_type === 'webinar' &&
    (knowledge as any).tgl_zoom &&
    new Date((knowledge as any).tgl_zoom) <= new Date();

  const formatWebinarDate = () => {
    if (!(knowledge as any).tgl_zoom) return '';

    const date = new Date((knowledge as any).tgl_zoom);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const hasZoomLink = knowledge.knowledge_type === 'webinar' && (knowledge as any).link_zoom;

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
              src={knowledge.thumbnail}
              alt={knowledge.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getPlaceholderGradient()} flex flex-col items-center justify-center gap-3`}>
              <div className="text-gray-600 opacity-70">
                <div className="w-16 h-16 flex items-center justify-center">
                  {(() => {
                    const Icon = knowledge.knowledge_type === 'webinar' ? Calendar :
                                 (knowledge as any).media_type === 'video' ? Play :
                                 (knowledge as any).media_type === 'pdf' ? FileText :
                                 (knowledge as any).media_type === 'audio' ? Headphones : Package;
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
          {knowledge.knowledge_type === 'webinar' && (knowledge as any).tgl_zoom && (
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

          {/* Tags - Fixed height */}
          <div className="mb-3 min-h-[1.5rem]">
            {knowledge.tags && knowledge.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {knowledge.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                  >
                    #{tag}
                  </span>
                ))}
                {knowledge.tags.length > 2 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                    +{knowledge.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Spacer to push footer to bottom */}
          <div className="flex-1"></div>

          {/* Footer - Minimal info */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 mt-auto">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{knowledge.view_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                <span>{knowledge.like_count}</span>
              </div>
            </div>
            <span className="text-gray-400 truncate max-w-[200px]">{knowledge.penyelenggara}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}