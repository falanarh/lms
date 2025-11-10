'use client';

import React from 'react';
import { KnowledgeCenter } from '@/types/knowledge-center';

interface KnowledgeDetailTagsProps {
  knowledge: KnowledgeCenter;
}

export default function KnowledgeDetailTags({ knowledge }: KnowledgeDetailTagsProps) {
  // Tags are not available in the current API structure
  // This component is temporarily disabled until tags are implemented
  return null;

  // Original implementation (commented out until tags are available):
  /*
  if (!knowledge.tags || knowledge.tags.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Tags</h3>
      <div className="flex flex-wrap gap-2">
        {knowledge.tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors cursor-pointer"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
  */
}
