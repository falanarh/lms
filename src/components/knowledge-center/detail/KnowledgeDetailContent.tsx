'use client';

import React from 'react';
import MediaViewer from '../MediaViewer';
import BlockNoteViewer from './BlockNoteViewer';
import { Knowledge } from '@/types/knowledge-center';

interface KnowledgeDetailContentProps {
  knowledge: Knowledge;
}

export default function KnowledgeDetailContent({ knowledge }: KnowledgeDetailContentProps) {
  // Debug logs
  console.log('KnowledgeDetailContent - Full knowledge object:', knowledge);
  console.log('KnowledgeDetailContent - knowledge.type:', knowledge.type);

  const isWebinar = knowledge.type === 'webinar';
  const knowledgeContent = (knowledge as any).knowledgeContent;
  const contentType = knowledgeContent?.contentType;

  console.log('KnowledgeDetailContent - knowledgeContent:', knowledgeContent);
  console.log('KnowledgeDetailContent - contentType:', contentType);
  console.log('KnowledgeDetailContent - isWebinar:', isWebinar);
  console.log('KnowledgeDetailContent - document exists:', !!knowledgeContent?.document);

  return (
    <div className="space-y-12">
      {/* Media Content for Video, Audio, File */}
      {!isWebinar && contentType && ['video', 'podcast', 'file'].includes(contentType) && knowledgeContent?.mediaUrl && (
        <div>
          <MediaViewer
            src={knowledgeContent.mediaUrl}
            type={contentType === 'podcast' ? 'audio' : contentType}
            title={knowledge.title}
            className="w-full rounded-lg"
          />
        </div>
      )}

      {/* Article/File Content - BlockNote Viewer */}
      {!isWebinar && contentType && ['article', 'file'].includes(contentType) && knowledgeContent?.document && (
        <div>
          <BlockNoteViewer
            contentJson={knowledgeContent.document}
            className="w-full"
          />
        </div>
      )}

      {/* Video/Podcast with Document Content */}
      {!isWebinar && contentType && ['video', 'podcast'].includes(contentType) && knowledgeContent?.document && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Transcript & Notes</h3>
          <BlockNoteViewer
            contentJson={knowledgeContent.document}
            className="w-full"
          />
        </div>
      )}

      {/* Webinar Content Preview */}
      {isWebinar && knowledge.content_richtext && (
        <div className='mb-12'>
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