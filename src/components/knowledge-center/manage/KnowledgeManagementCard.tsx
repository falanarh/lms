/**
 * Knowledge Management Card Component
 * 
 * Specialized card component for management view with admin actions
 * Following the existing design patterns from KnowledgeCard
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  Eye,
  ThumbsUp,
  Play,
  FileText,
  Headphones,
  Package,
  Clock,
  Edit,
  ExternalLink,
  CheckCircle,
  XCircle,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { KnowledgeCenter, ContentType, CONTENT_TYPES, KNOWLEDGE_TYPES } from '@/types/knowledge-center';

type KnowledgeStatus = 'draft' | 'scheduled' | 'published';

const getKnowledgeStatus = (knowledge: KnowledgeCenter): KnowledgeStatus => {
  if (!knowledge.isFinal) {
    return 'draft';
  }

  const publishDate = new Date(knowledge.publishedAt);
  const now = new Date();

  if (publishDate > now) {
    return 'scheduled';
  }

  return 'published';
};

interface KnowledgeManagementCardProps {
  knowledge: KnowledgeCenter;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  isDeleting: boolean;
  isUpdating: boolean;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  className?: string;
}

// Helper function to get thumbnail URL (same as KnowledgeCard)
const getThumbnailUrl = (thumbnail: string): string => {
  if (thumbnail.includes('youtube.com') || thumbnail.includes('youtu.be')) {
    const videoId = extractYouTubeVideoId(thumbnail);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : thumbnail;
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

export default function KnowledgeManagementCard({
  knowledge,
  onEdit,
  onDelete,
  onToggleStatus,
  isDeleting,
  isUpdating,
  isSelected = false,
  onSelectionChange,
  className = ''
}: KnowledgeManagementCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showActions, setShowActions] = useState(false);

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

  const status: KnowledgeStatus = getKnowledgeStatus(knowledge);

  const statusBadgeClasses =
    status === 'draft'
      ? 'bg-yellow-100/90 text-yellow-700 border-yellow-200/50'
      : status === 'scheduled'
      ? 'bg-blue-100/90 text-blue-700 border-blue-200/50'
      : 'bg-green-100/90 text-green-700 border-green-200/50';

  const statusLabel =
    status === 'draft' ? 'Draft' : status === 'scheduled' ? 'Scheduled' : 'Published';

  // Actions are handled by the bottom buttons instead of dropdown

  return (
    <article className={`bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:border-gray-300 hover:shadow-md flex flex-col h-full ${isSelected ? 'ring-2 ring-blue-500 border-blue-300' : ''} ${className}`}>
      {/* Selection Checkbox */}
      {onSelectionChange && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelectionChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 shadow-sm"
          />
        </div>
      )}
      
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {!imageError && knowledge.thumbnail ? (
          <Image
            src={getThumbnailUrl(knowledge.thumbnail)}
            alt={knowledge.title}
            fill
            priority
            className="object-cover"
            onError={() => setImageError(true)}
            unoptimized={knowledge.thumbnail.includes('youtube.com')}
          />
        ) : (
          <div className={`w-full h-full bg-linear-to-br ${getPlaceholderGradient()} flex flex-col items-center justify-center gap-3`}>
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

        {/* Media type badge */}
        <div className="absolute top-2 left-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border backdrop-blur-sm ${getMediaColor()}`}>
            {getMediaIcon()}
            <span>{getMediaTypeLabel()}</span>
          </div>
        </div>

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <div
            className={`px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm border ${statusBadgeClasses}`}
          >
            {statusLabel}
          </div>
        </div>

        {/* Actions overlay */}
        <div className="absolute bottom-2 right-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/90 backdrop-blur-sm border-white/50 hover:bg-white"
            disabled={isDeleting || isUpdating}
            onClick={() => setShowActions(!showActions)}
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-base mb-2 leading-snug line-clamp-2 min-h-12">
          {knowledge.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3 min-h-10">
          {knowledge.description}
        </p>

        {/* Subject */}
        {knowledge.subject && (
          <div className="mb-3">
            <span className="inline-flex items-center px-2 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs font-medium text-blue-700">
              {knowledge.subject}
            </span>
          </div>
        )}

        {/* Webinar Status */}
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

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Footer */}
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
          
          <div className="flex items-center gap-2">
            <span className="text-gray-400 truncate max-w-[200px]">{knowledge.penyelenggara}</span>
            <Link 
              href={`/knowledge-center/${knowledge.id}`}
              className="text-blue-600 hover:text-blue-700 transition-colors"
              target="_blank"
            >
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Management Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            disabled={isDeleting || isUpdating}
            className="flex-1"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleStatus}
            disabled={isDeleting || isUpdating}
            className={`flex-1 ${
              status === 'draft'
                ? 'text-green-600 hover:text-green-700 border-green-200 hover:border-green-300'
                : status === 'scheduled'
                ? 'text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300'
                : 'text-yellow-600 hover:text-yellow-700 border-yellow-200 hover:border-yellow-300'
            }`}
          >
            {status === 'draft' && (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Publish
              </>
            )}
            {status === 'scheduled' && (
              <>
                <XCircle className="w-3 h-3 mr-1" />
                Unschedule
              </>
            )}
            {status === 'published' && (
              <>
                <XCircle className="w-3 h-3 mr-1" />
                Unpublish
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting || isUpdating}
            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </article>
  );
}
