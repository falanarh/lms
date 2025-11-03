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

  const isUpcomingWebinar =
    knowledge.knowledge_type === 'webinar' &&
    (knowledge as any).tgl_zoom &&
    new Date((knowledge as any).tgl_zoom) > new Date();

  const formatWebinarDate = () => {
    if (!isUpcomingWebinar || !(knowledge as any).tgl_zoom) return '';

    const date = new Date((knowledge as any).tgl_zoom);
    return date.toLocaleString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const hasZoomLink = knowledge.knowledge_type === 'webinar' && (knowledge as any).link_zoom;

  return (
    <Link href={`/knowledge-center/${knowledge.id}`} className="block group">
      <article
        className={`bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:border-gray-300 ${className}`}
        onClick={() => {
          // View count will be incremented when navigating to detail page
        }}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-100">
          {!imageError && knowledge.thumbnail ? (
            <Image
              src={knowledge.thumbnail}
              alt={knowledge.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-gray-400">
                <Package className="w-12 h-12" />
              </div>
            </div>
          )}

          {/* Status badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getMediaColor()}`}>
              {getMediaIcon()}
              <span>{getMediaTypeLabel()}</span>
            </div>

            {isUpcomingWebinar && (
              <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium border border-orange-200">
                <Clock className="w-3 h-3 inline mr-1" />
                Upcoming
              </div>
            )}

            {(knowledge as any).gojags_ref && (
              <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium border border-emerald-200">
                <Award className="w-3 h-3 inline mr-1" />
                GOJAGS
              </div>
            )}
          </div>

          {/* Subject badge */}
          {knowledge.subject && (
            <div className="absolute top-3 right-3">
              <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-gray-700 border border-white/50">
                {knowledge.subject}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-bold text-gray-900 text-lg mb-3 leading-tight group-hover:text-gray-700 transition-colors">
            {knowledge.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
            {knowledge.description}
          </p>

          {/* Webinar specific info */}
          {knowledge.knowledge_type === 'webinar' && (
            <div className="mb-3 space-y-2">
              {isUpcomingWebinar && (
                <div className="text-sm text-gray-600">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {formatWebinarDate()}
                </div>
              )}

              {hasZoomLink && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open((knowledge as any).link_zoom, '_blank');
                  }}
                  className="inline-flex items-center gap-1 text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Join Zoom
                </button>
              )}

              {(knowledge as any).jumlah_jp && (
                <div className="text-sm text-gray-600">
                  <Award className="w-4 h-4 inline mr-1" />
                  {(knowledge as any).jumlah_jp} JP
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {knowledge.tags && knowledge.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {knowledge.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
                >
                  {tag}
                </span>
              ))}
              {knowledge.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                  +{knowledge.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <span>{knowledge.penyelenggara}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(knowledge.published_at || knowledge.created_at || ''), {
                addSuffix: true,
                locale: id
              })}</span>
            </div>
          </div>

          {/* Actions */}
          {showActions && knowledge.id && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`flex items-center gap-1 text-xs transition-colors ${
                    isLiking
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{knowledge.like_count}</span>
                </button>

                <button
                  onClick={handleDislike}
                  disabled={isDisliking}
                  className={`flex items-center gap-1 text-xs transition-colors ${
                    isDisliking
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  <ThumbsDown className="w-3 h-3" />
                  <span>{knowledge.dislike_count}</span>
                </button>

                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Eye className="w-3 h-3" />
                  <span>{knowledge.view_count}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users className="w-3 h-3" />
                <span>{knowledge.author}</span>
              </div>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}