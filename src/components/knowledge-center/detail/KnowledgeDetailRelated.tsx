'use client';

import React from 'react';
import KnowledgeCard from '../KnowledgeCard';
import { KnowledgeCenter } from '@/types/knowledge-center';

interface KnowledgeDetailRelatedProps {
  knowledge: KnowledgeCenter;
  relatedKnowledge: KnowledgeCenter[];
}

export default function KnowledgeDetailRelated({ knowledge, relatedKnowledge }: KnowledgeDetailRelatedProps) {
  if (!relatedKnowledge || relatedKnowledge.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 py-6 border-t border-gray-200 my-6">Related Content</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedKnowledge
          .filter(item => item.id !== knowledge.id)
          .slice(0, 4)
          .map((item) => (
            <div key={item.id} className="h-full min-h-[360px]">
              <KnowledgeCard
                knowledge={item}
                className="h-full w-full"
              />
            </div>
          ))}
      </div>
    </div>
  );
}