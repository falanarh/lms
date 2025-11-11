'use client';

import React from 'react';
import MediaViewer from '../MediaViewer';
import BlockNoteViewer from './BlockNoteViewer';
import { CONTENT_TYPES, ContentType, KNOWLEDGE_TYPES, KnowledgeCenter } from '@/types/knowledge-center';

interface KnowledgeDetailContentProps {
  knowledge: KnowledgeCenter;
}

export default function KnowledgeDetailContent({ knowledge }: KnowledgeDetailContentProps) {
  // Debug logs
  console.log('KnowledgeDetailContent - Full knowledge object:', knowledge);
  console.log('KnowledgeDetailContent - knowledge.type:', knowledge.type);

  const isWebinar = knowledge.type === KNOWLEDGE_TYPES.WEBINAR;
  const knowledgeContent = knowledge.knowledgeContent;
  const contentType = knowledgeContent?.contentType;

  // Helper functions for type-safe conditional rendering
  const getMediaViewerType = (type: typeof contentType): ContentType | null => {
    if (type === CONTENT_TYPES.VIDEO || type === CONTENT_TYPES.PODCAST || type === CONTENT_TYPES.FILE) {
      return type;
    }
    return null;
  };

  const getBlockNoteViewerTypes = (type: typeof contentType): ContentType[] => {
    // Article always shows content
    if (type === CONTENT_TYPES.ARTICLE) return [CONTENT_TYPES.ARTICLE];
    // File shows both media and content
    if (type === CONTENT_TYPES.FILE) return [CONTENT_TYPES.FILE];
    // Video/Podcast show content as transcript
    if (type === CONTENT_TYPES.VIDEO || type === CONTENT_TYPES.PODCAST) {
      return [CONTENT_TYPES.VIDEO, CONTENT_TYPES.PODCAST];
    }
    return [];
  };

  console.log('KnowledgeDetailContent - knowledgeContent:', knowledgeContent);
  console.log('KnowledgeDetailContent - contentType:', contentType);
  console.log('KnowledgeDetailContent - isWebinar:', isWebinar);
  console.log('KnowledgeDetailContent - document exists:', !!knowledgeContent?.document);
  console.log('KnowledgeDetailContent - document value:', knowledgeContent?.document);
  console.log('KnowledgeDetailContent - document type:', typeof knowledgeContent?.document);
  console.log('KnowledgeDetailContent - document length:', knowledgeContent?.document?.length);

  return (
    <div className="space-y-12">
      {/* Media Content for Video, Audio, File */}
      {!isWebinar && contentType && knowledgeContent?.mediaUrl && (() => {
        const mediaType = getMediaViewerType(contentType);
        return mediaType ? (
          <div>
            <MediaViewer
              src={knowledgeContent.mediaUrl}
              type={mediaType}
              title={knowledge.title}
              className="w-full rounded-lg"
            />
          </div>
        ) : null;
      })()}

      {/* Article/File Content - BlockNote Viewer */}
      {!isWebinar && contentType && (() => {
        const allowedTypes = getBlockNoteViewerTypes(contentType);
        const hasDocument = knowledgeContent?.document &&
                           typeof knowledgeContent.document === 'string' &&
                           knowledgeContent.document.trim() !== '';

        console.log('KnowledgeDetailContent - Render check:', {
          allowedTypes,
          contentType,
          isAllowed: allowedTypes.includes(contentType),
          hasDocument,
          documentValue: knowledgeContent?.document
        });

        return allowedTypes.includes(contentType) && hasDocument ? (
          <div>
            {contentType === CONTENT_TYPES.VIDEO || contentType === CONTENT_TYPES.PODCAST ? (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Transcript & Notes</h3>
                <BlockNoteViewer
                  contentJson={knowledgeContent.document}
                  className="w-full"
                />
              </div>
            ) : (
              <BlockNoteViewer
                contentJson={knowledgeContent.document}
                className="w-full"
              />
            )}
          </div>
        ) : null;
      })()}

      {/* Webinar Content Preview */}
      {/* {isWebinar && knowledge.content_richtext && (
        <div className='mb-12'>
          <h3 className="text-lg font-bold text-gray-900 mb-4">About This Webinar</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700">
              <div dangerouslySetInnerHTML={{ __html: knowledge.content_richtext }} />
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}