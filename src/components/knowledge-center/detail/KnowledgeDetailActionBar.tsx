'use client';

import React from 'react';
import { Heart, ThumbsDown, ExternalLink } from 'lucide-react';
import { Knowledge } from '@/types/knowledge-center';

interface KnowledgeDetailActionBarProps {
  knowledge: Knowledge;
  isLiking: boolean;
  isDisliking: boolean;
  onLike: () => void;
  onDislike: () => void;
}

export default function KnowledgeDetailActionBar({
  knowledge,
  isLiking,
  isDisliking,
  onLike,
  onDislike,
}: KnowledgeDetailActionBarProps) {
  const isWebinar = knowledge.knowledge_type === 'webinar';
  const webinarData = knowledge as any;
  const isUpcomingWebinar = isWebinar && webinarData.tgl_zoom && new Date(webinarData.tgl_zoom) > new Date();

  return (
    <div className="flex flex-wrap items-center gap-4 py-6 border-b border-gray-200 mb-12">
      <button
        onClick={onLike}
        disabled={isLiking}
        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-black transition-colors disabled:opacity-50"
      >
        <Heart className={`w-5 h-5 ${isLiking ? 'animate-pulse' : ''}`} />
        <span className="font-medium">{knowledge.like_count}</span>
      </button>

      <button
        onClick={onDislike}
        disabled={isDisliking}
        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-black transition-colors disabled:opacity-50"
      >
        <ThumbsDown className={`w-5 h-5 ${isDisliking ? 'animate-pulse' : ''}`} />
        <span className="font-medium">{knowledge.dislike_count}</span>
      </button>

      <div className="flex-1"></div>

      {isWebinar && isUpcomingWebinar && webinarData.link_zoom && (
        <a
          href={webinarData.link_zoom}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          Join Live Session
        </a>
      )}
    </div>
  );
}