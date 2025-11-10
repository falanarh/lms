"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { X } from "lucide-react";
import {
  KnowledgeDetailInfo,
  KnowledgeDetailActionBar,
  KnowledgeDetailContent,
  KnowledgeDetailResources,
  KnowledgeDetailTags,
} from "@/components/knowledge-center/detail";
import {
  ContentType,
  KNOWLEDGE_TYPES,
  KnowledgeCenter,
} from "@/types/knowledge-center";

interface KnowledgePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: KnowledgeCenter;
  thumbnailPreview: string | null;
  contentType: ContentType | null;
}

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
    if (typeof value === "string") return value;
    const objectUrl = URL.createObjectURL(value);
    objectUrlRef.current.push(objectUrl);
    return objectUrl;
  }, []);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
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
    () => (isOpen ? getResourceUrl(formData.type === KNOWLEDGE_TYPES.CONTENT ? formData.knowledgeContent?.mediaUrl : undefined) : undefined),
    [isOpen, formData.knowledgeContent?.mediaUrl, getResourceUrl]
  );
  const resolvedNotulensiUrl = useMemo(
    () => (isOpen ? getResourceUrl(formData.type === KNOWLEDGE_TYPES.WEBINAR ? formData.webinar?.noteFile : undefined) : undefined),
    [isOpen, formData.webinar?.noteFile, getResourceUrl]
  );
  const resolvedThumbnail = useMemo(
    () =>
      thumbnailPreview ||
      (isOpen ? getResourceUrl(formData.thumbnail) : undefined),
    [isOpen, thumbnailPreview, formData.thumbnail, getResourceUrl]
  );

  if (!isOpen) return null;

  const isWebinar = formData.type === KNOWLEDGE_TYPES.WEBINAR;
  
  // Transform formData to Knowledge type for preview
  const baseKnowledge = {
    id: "preview-" + Date.now(),
    title: formData.title || "Untitled Knowledge",
    description: formData.description || "No description provided",
    idSubject: formData.id,
    subject: formData.subject || "General",
    type: formData.type || "konten",
    penyelenggara: formData.penyelenggara || "Pusdiklat BPS",
    thumbnail: formData.thumbnail || "",
    createdBy: formData.createdBy || "Anonymous",
    likeCount: 0,
    isFinal: false,
    viewCount: 0,
    tags: formData.tags || [],
    publishedAt: formData.publishedAt || new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const previewKnowledge: KnowledgeCenter = isWebinar
    ? {
        ...baseKnowledge,
        webinar: {
          zoomDate: formData.webinar?.zoomDate || "",
          zoomLink: formData.webinar?.zoomLink || "",
          youtubeLink: formData.webinar?.youtubeLink || "",
          recordLink: formData.webinar?.recordLink || "",
          vbLink: formData.webinar?.vbLink || "",
          noteFile: resolvedNotulensiUrl || "",
          jpCount: formData.webinar?.jpCount || 0,
        },
      }
    : {
        ...baseKnowledge,
        knowledgeContent: {
          mediaUrl: resolvedMediaUrl || "",
          contentType: contentType || "file",
          document: formData.knowledgeContent?.document || "[]",
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
              <h2 className="text-xl font-bold text-gray-900">
                Preview Knowledge
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                Lihat tampilan sebelum dipublikasikan
              </p>
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
                  onLike={() => {}}
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
