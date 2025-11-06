"use client";

import React, { useState } from "react";
import { Eye } from "lucide-react";
import KnowledgePreviewModal from "./KnowledgePreviewModal";

interface ReviewStepProps {
  formData: {
    title: string;
    description: string;
    subject: string;
    penyelenggara: string;
    author: string;
    knowledge_type: "webinar" | "konten" | undefined;
    published_at: string;
    tags: string[];
    thumbnail?: File;
    tgl_zoom?: string;
    link_zoom?: string;
    link_youtube?: string;
    link_record?: string;
    link_vb?: string;
    file_notulensi_pdf?: File;
    jumlah_jp?: number;
    media_resource?: File;
    media_type?: "video" | "audio" | "pdf" | "article";
    content_richtext?: string;
  };
  contentType: "article" | "video" | "podcast" | "pdf" | null;
  thumbnailPreview: string | null;
}

export default function ReviewStep({
  formData,
  contentType,
  thumbnailPreview,
}: ReviewStepProps) {
  const [showPreview, setShowPreview] = useState(false);
  const getTypeLabel = () => {
    if (formData.knowledge_type === "webinar") {
      return "Webinar";
    }
    if (contentType) {
      return `Content (${contentType.charAt(0).toUpperCase() + contentType.slice(1)})`;
    }
    return "Content";
  };

  return (
    <div className="space-y-6">
      {/* Preview Button */}
      {/* <div className="flex justify-end">
        
      </div> */}

      <div className="bg-gradient-to-br from-blue-50 via-cyan-50/50 to-green-50/30 rounded-lg p-6 border-2 border-blue-200/50 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-semibold text-blue-600">Type</span>
            <p className="font-medium text-gray-900">{getTypeLabel()}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-blue-600">Subject</span>
            <p className="font-medium text-gray-900">{formData.subject}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-blue-600">
              Organizer
            </span>
            <p className="font-medium text-gray-900">
              {formData.penyelenggara}
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-blue-600">Author</span>
            <p className="font-medium text-gray-900">{formData.author}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-blue-200/50">
          <span className="text-xs font-semibold text-blue-600">Title</span>
          <p className="font-semibold text-gray-900 text-lg mt-1">
            {formData.title}
          </p>
        </div>

        <div>
          <span className="text-xs font-semibold text-blue-600">
            Description
          </span>
          <p className="text-gray-700 mt-1">{formData.description}</p>
        </div>

        {thumbnailPreview && (
          <div>
            <span className="text-xs font-semibold text-blue-600 block mb-2">
              Thumbnail
            </span>
            <div className="rounded-lg overflow-hidden border-2 border-blue-200">
              <img
                src={thumbnailPreview}
                alt="Thumbnail"
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        )}

        {formData.tags.length > 0 && (
          <div>
            <span className="text-xs font-semibold text-blue-600 block mb-2">
              Tags
            </span>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {formData.knowledge_type === "webinar" && formData.tgl_zoom && (
          <div className="flex justify-between pt-4 border-t border-blue-200/50">
            <div>
              <span className="text-xs font-semibold text-green-600 block mb-2">
                Webinar Details
              </span>
              <div className="text-sm space-y-1">
                <p className="text-gray-700">
                  Date: {new Date(formData.tgl_zoom).toLocaleString("id-ID")}
                </p>
                {formData.jumlah_jp && (
                  <p className="text-gray-700">JP: {formData.jumlah_jp}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex items-center h-12 gap-2 px-4 py-2.5 bg-white border-2 border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 font-medium shadow-sm"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <KnowledgePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        formData={formData}
        thumbnailPreview={thumbnailPreview}
        contentType={contentType}
      />
    </div>
  );
}
