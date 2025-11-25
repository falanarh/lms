/**
 * Content Type Header Component
 * Displays the selected content type with icon and description
 */

'use client';

import React from 'react';
import { FileText, Video, FileAudio, ChevronLeft } from 'lucide-react';
import { CONTENT_TYPES, type ContentType } from '@/types/knowledge-center';

interface ContentTypeHeaderProps {
  contentType: ContentType;
  onBack: () => void;
}

export default function ContentTypeHeader({ contentType, onBack }: ContentTypeHeaderProps) {
  const isArticle = contentType === CONTENT_TYPES.ARTICLE;
  const isVideo = contentType === CONTENT_TYPES.VIDEO;
  const isPodcast = contentType === CONTENT_TYPES.PODCAST;
  const isPdf = contentType === CONTENT_TYPES.FILE;

  return (
    <>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mb-4"
        type="button"
      >
        <ChevronLeft className="w-4 h-4" />
        Change Content Type
      </button>

      {/* Content Type Header */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          {isArticle && <FileText className="w-5 h-5 text-blue-600" />}
          {isVideo && <Video className="w-5 h-5 text-blue-600" />}
          {isPodcast && <FileAudio className="w-5 h-5 text-blue-600" />}
          {isPdf && <FileText className="w-5 h-5 text-blue-600" />}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 capitalize">{contentType}</h3>
          <p className="text-sm text-gray-600">
            {isArticle && 'Create rich text articles'}
            {isVideo && 'Upload video content'}
            {isPodcast && 'Upload audio content'}
            {isPdf && 'Upload PDF documents'}
          </p>
        </div>
      </div>
    </>
  );
}
