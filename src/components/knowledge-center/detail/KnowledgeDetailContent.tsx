'use client';

import React from 'react';
import MediaViewer from '../MediaViewer';
import { Knowledge } from '@/types/knowledge-center';

interface KnowledgeDetailContentProps {
  knowledge: Knowledge;
}

export default function KnowledgeDetailContent({ knowledge }: KnowledgeDetailContentProps) {
  const isWebinar = knowledge.knowledge_type === 'webinar';
  const webinarData = knowledge as any;

  return (
    <div className="space-y-12">
      {/* Media Content for Video, Audio, PDF */}
      {!isWebinar &&
       (knowledge as any).media_type &&
       ['video', 'audio', 'pdf'].includes((knowledge as any).media_type) &&
       (knowledge as any).media_resource && (
        <div>
          <MediaViewer
            src={(knowledge as any).media_resource}
            type={(knowledge as any).media_type}
            title={knowledge.title}
            className="w-full rounded-lg"
          />
        </div>
      )}

      {/* Article Content - Full Rich Text */}
      {!isWebinar &&
       (knowledge as any).media_type === 'article' &&
       knowledge.content_richtext && (
        <div>
          <article className="article-content">
            <div dangerouslySetInnerHTML={{ __html: knowledge.content_richtext }} />
          </article>
        </div>
      )}

      {/* Webinar Content Preview */}
      {isWebinar && knowledge.content_richtext && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">About This Webinar</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700">
              <div dangerouslySetInnerHTML={{ __html: knowledge.content_richtext }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}