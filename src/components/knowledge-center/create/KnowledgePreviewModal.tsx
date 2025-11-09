'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { X } from 'lucide-react';
import {
  KnowledgeDetailInfo,
  KnowledgeDetailActionBar,
  KnowledgeDetailContent,
  KnowledgeDetailResources,
  KnowledgeDetailTags,
} from '@/components/knowledge-center/detail';
import { Knowledge } from '@/types/knowledge-center';

interface KnowledgePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    title: string;
    description: string;
    subject: string;
    penyelenggara: string;
    author: string;
    knowledge_type: 'webinar' | 'konten' | undefined;
    published_at: string;
    tags: string[];
    thumbnail?: string | File;
    tgl_zoom?: string;
    link_zoom?: string;
    link_youtube?: string;
    link_record?: string;
    link_vb?: string;
    file_notulensi_pdf?: string | File;
    jumlah_jp?: number;
    media_resource?: string | File;
    media_type?: 'video' | 'audio' | 'pdf' | 'article';
    content_richtext?: string;
  };
  thumbnailPreview: string | null;
  contentType: 'article' | 'video' | 'podcast' | 'pdf' | null;
}

type PreviewKnowledge = Knowledge & {
  type: 'webinar' | 'content';
  knowledgeContent?: {
    contentType: 'article' | 'video' | 'podcast' | 'pdf';
    mediaUrl?: string;
    document: string;
  };
};

export default function KnowledgePreviewModal({
  isOpen,
  onClose,
  formData,
  thumbnailPreview,
  contentType,
}: KnowledgePreviewModalProps) {
  const objectUrlRef = useRef<string[]>([]);

  const getResourceUrl = useCallback((value?: string | File) => {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    const objectUrl = URL.createObjectURL(value);
    objectUrlRef.current.push(objectUrl);
    return objectUrl;
  }, []);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      objectUrlRef.current.forEach(URL.revokeObjectURL);
      objectUrlRef.current = [];
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      objectUrlRef.current.forEach(URL.revokeObjectURL);
      objectUrlRef.current = [];
    };
  }, []);

  const resolvedMediaUrl = useMemo(
    () => (isOpen ? getResourceUrl(formData.media_resource) : undefined),
    [isOpen, formData.media_resource, getResourceUrl]
  );
  const resolvedNotulensiUrl = useMemo(
    () => (isOpen ? getResourceUrl(formData.file_notulensi_pdf) : undefined),
    [isOpen, formData.file_notulensi_pdf, getResourceUrl]
  );
  const resolvedThumbnail = useMemo(
    () => thumbnailPreview || (isOpen ? getResourceUrl(formData.thumbnail) : undefined),
    [isOpen, thumbnailPreview, formData.thumbnail, getResourceUrl]
  );

  if (!isOpen) return null;

  const isWebinar = formData.knowledge_type === 'webinar';
  const resolvedContentType = contentType || 'article';
  const blockNoteDocument = formData.content_richtext ?? '[]';

  // Transform formData to Knowledge type for preview
  const baseKnowledge = {
    id: 'preview-' + Date.now(),
    title: formData.title || 'Untitled Knowledge',
    description: formData.description || 'No description provided',
    subject: formData.subject || 'General',
    knowledge_type: formData.knowledge_type || 'konten',
    type: isWebinar ? 'webinar' : 'content',
    penyelenggara: formData.penyelenggara || 'Pusdiklat BPS',
    thumbnail: resolvedThumbnail || '',
    author: formData.author || 'Anonymous',
    like_count: 0,
    dislike_count: 0,
    view_count: 0,
    tags: formData.tags || [],
    published_at: formData.published_at || new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const previewKnowledge: PreviewKnowledge = isWebinar
    ? {
        ...baseKnowledge,
        tgl_zoom: formData.tgl_zoom,
        link_zoom: formData.link_zoom,
        link_youtube: formData.link_youtube,
        link_record: formData.link_record,
        link_vb: formData.link_vb,
        file_notulensi_pdf: resolvedNotulensiUrl,
        jumlah_jp: formData.jumlah_jp,
        content_richtext: formData.content_richtext || '<p>No content provided</p>',
      }
    : {
        ...baseKnowledge,
        media_resource: resolvedMediaUrl,
        media_type: resolvedContentType,
        content_richtext: blockNoteDocument,
        knowledgeContent: {
          contentType: resolvedContentType,
          document: blockNoteDocument,
          ...(resolvedMediaUrl && resolvedContentType !== 'article' ? { mediaUrl: resolvedMediaUrl } : {}),
        },
      };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-7xl bg-white rounded-xl shadow-2xl my-8 max-h-[90vh] overflow-hidden flex flex-col">

          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Preview Knowledge</h2>
              <p className="text-sm text-gray-600 mt-0.5">Lihat tampilan sebelum dipublikasikan</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close preview"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="min-h-screen bg-white">
              {/* Hero Section */}
              {resolvedThumbnail && (
                <div className="relative h-64 md:h-96 lg:h-[500px]">
                  <img
                    src={resolvedThumbnail}
                    alt={formData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Article Content */}
              <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Article Header */}
                <KnowledgeDetailInfo knowledge={previewKnowledge} />

                {/* Action Bar */}
                <KnowledgeDetailActionBar
                  knowledge={previewKnowledge}
                  isLiking={false}
                  isDisliking={false}
                  onLike={() => {}}
                  onDislike={() => {}}
                />

                {/* Content */}
                <KnowledgeDetailContent knowledge={previewKnowledge} />

                {/* Resources */}
                <KnowledgeDetailResources knowledge={previewKnowledge} />

                {/* Tags */}
                <KnowledgeDetailTags knowledge={previewKnowledge} />
              </article>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Ini adalah preview. Data belum disimpan.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
