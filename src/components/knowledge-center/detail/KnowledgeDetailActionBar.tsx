'use client';

import React from 'react';
import { Heart, Eye, ExternalLink } from 'lucide-react';
import { KNOWLEDGE_TYPES, KnowledgeCenter } from '@/types/knowledge-center';

interface KnowledgeDetailActionBarProps {
  knowledge: KnowledgeCenter;
  isLiking: boolean;
  onLike: () => void;
}

export default function KnowledgeDetailActionBar({
  knowledge,
  isLiking,
  onLike,
}: KnowledgeDetailActionBarProps) {
  const isWebinar = knowledge.type === KNOWLEDGE_TYPES.WEBINAR;
  const webinarData = knowledge.webinar;
  const isUpcomingWebinar = isWebinar && webinarData?.zoomDate && new Date(webinarData.zoomDate) > new Date();

  return (
    <div className="flex flex-wrap items-center gap-4 py-6 border-b border-gray-200 mb-8">
      <button
        onClick={onLike}
        disabled={isLiking}
        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-black transition-colors disabled:opacity-50"
      >
        <Heart className={`w-5 h-5 ${isLiking ? 'animate-pulse' : ''}`} />
        <span className="font-medium">{knowledge.likeCount}</span>
      </button>

      <div className="flex items-center gap-2 px-4 py-2 text-gray-600">
        <Eye className="w-5 h-5" />
        <span className="font-medium">{knowledge.viewCount}</span>
      </div>

      <div className="flex-1"></div>

      {isWebinar && isUpcomingWebinar && webinarData.zoomDate && (
        <a
          href={webinarData.zoomDate}
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