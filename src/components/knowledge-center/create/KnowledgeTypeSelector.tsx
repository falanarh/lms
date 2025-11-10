'use client';

import React from 'react';
import { Calendar, FileText, Check } from 'lucide-react';
import { KNOWLEDGE_TYPES } from '@/types/knowledge-center';

interface KnowledgeTypeSelectorProps {
  selectedType: typeof KNOWLEDGE_TYPES.WEBINAR | typeof KNOWLEDGE_TYPES.CONTENT | undefined;
  onTypeSelect: (type: typeof KNOWLEDGE_TYPES.WEBINAR | typeof KNOWLEDGE_TYPES.CONTENT) => void;
  error?: string;
}

export default function KnowledgeTypeSelector({
  selectedType,
  onTypeSelect,
  error,
}: KnowledgeTypeSelectorProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <button
          onClick={() => onTypeSelect(KNOWLEDGE_TYPES.WEBINAR)}
          className={`group relative p-8 rounded-xl border-2 transition-all duration-200 text-left ${
            selectedType === KNOWLEDGE_TYPES.WEBINAR
              ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50'
              : 'border-[var(--border,rgba(0,0,0,0.12))] hover:border-green-300 bg-white'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-colors ${
              selectedType === 'webinar'
                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                : 'bg-gray-100 group-hover:bg-green-50'
            }`}
          >
            <Calendar
              className={`w-6 h-6 ${
                selectedType === 'webinar' ? 'text-white' : 'text-gray-700 group-hover:text-green-600'
              }`}
            />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Webinar</h3>
          <p className="text-gray-600 text-sm mb-4">
            Live sessions with recordings and GOJAGS integration
          </p>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
              Zoom
            </span>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
              Recording
            </span>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
              JP
            </span>
          </div>
          {selectedType === 'webinar' && (
            <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </button>

        <button
          onClick={() => onTypeSelect(KNOWLEDGE_TYPES.CONTENT)}
          className={`group relative p-8 rounded-xl border-2 transition-all duration-200 text-left ${
            selectedType === KNOWLEDGE_TYPES.CONTENT
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50'
              : 'border-[var(--border,rgba(0,0,0,0.12))] hover:border-blue-300 bg-white'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-colors ${
              selectedType === KNOWLEDGE_TYPES.CONTENT
                ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                : 'bg-gray-100 group-hover:bg-blue-50'
            }`}
          >
            <FileText
              className={`w-6 h-6 ${
                selectedType === KNOWLEDGE_TYPES.CONTENT ? 'text-white' : 'text-gray-700 group-hover:text-blue-600'
              }`}
            />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Content</h3>
          <p className="text-gray-600 text-sm mb-4">
            Articles, videos, PDFs, or audio files with rich content
          </p>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
              Video
            </span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
              PDF
            </span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
              Audio
            </span>
          </div>
          {selectedType === KNOWLEDGE_TYPES.CONTENT && (
            <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
}