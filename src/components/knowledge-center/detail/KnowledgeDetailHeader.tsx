'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bookmark, Share2 } from 'lucide-react';
import { KnowledgeCenter } from '@/types/knowledge-center';

interface KnowledgeDetailHeaderProps {
  knowledge: KnowledgeCenter;
  isBookmarked: boolean;
  onBookmark: () => void;
  onShare: () => void;
}

export default function KnowledgeDetailHeader({
  isBookmarked,
  onBookmark,
  onShare,
}: KnowledgeDetailHeaderProps) {
  const router = useRouter();

  return (
    <header className="border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back</span>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={onBookmark}
              className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                isBookmarked ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onShare}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}