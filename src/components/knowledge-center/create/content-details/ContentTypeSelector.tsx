/**
 * Content Type Selector Component
 * Allows users to select between Article, Video, Podcast, or PDF content types
 * Design matches Step 1 Knowledge Type Selector for consistency
 */

'use client';

import React from 'react';
import { FileText, Video, FileAudio, File, Check } from 'lucide-react';
import { CONTENT_TYPES, type ContentType } from '@/types/knowledge-center';

interface ContentTypeSelectorProps {
  selectedType?: ContentType;
  onSelect: (type: ContentType) => void;
}

const contentTypeOptions = [
  {
    type: CONTENT_TYPES.ARTICLE,
    icon: FileText,
    label: 'Article',
    description: 'Create rich text articles with formatting',
    tags: ['Rich Text', 'Editor', 'Formatting'],
    gradient: 'from-blue-500 to-cyan-600',
    bgGradient: 'from-blue-50 to-cyan-50',
    borderColor: 'border-blue-500',
    hoverBorder: 'hover:border-blue-300',
    iconBg: 'bg-gray-100 group-hover:bg-blue-50',
    iconColor: 'text-gray-700 group-hover:text-blue-600',
    selectedIconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    tagBg: 'bg-blue-100',
    tagText: 'text-blue-700',
    checkBg: 'bg-blue-500',
  },
  {
    type: CONTENT_TYPES.VIDEO,
    icon: Video,
    label: 'Video',
    description: 'Upload and share video content',
    tags: ['MP4', 'Streaming', 'Visual'],
    gradient: 'from-purple-500 to-pink-600',
    bgGradient: 'from-purple-50 to-pink-50',
    borderColor: 'border-purple-500',
    hoverBorder: 'hover:border-purple-300',
    iconBg: 'bg-gray-100 group-hover:bg-purple-50',
    iconColor: 'text-gray-700 group-hover:text-purple-600',
    selectedIconBg: 'bg-gradient-to-br from-purple-500 to-pink-600',
    tagBg: 'bg-purple-100',
    tagText: 'text-purple-700',
    checkBg: 'bg-purple-500',
  },
  {
    type: CONTENT_TYPES.PODCAST,
    icon: FileAudio,
    label: 'Podcast/Audio',
    description: 'Upload audio files and podcasts',
    tags: ['MP3', 'Audio', 'Podcast'],
    gradient: 'from-green-500 to-emerald-600',
    bgGradient: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-500',
    hoverBorder: 'hover:border-green-300',
    iconBg: 'bg-gray-100 group-hover:bg-green-50',
    iconColor: 'text-gray-700 group-hover:text-green-600',
    selectedIconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
    tagBg: 'bg-green-100',
    tagText: 'text-green-700',
    checkBg: 'bg-green-500',
  },
  {
    type: CONTENT_TYPES.FILE,
    icon: File,
    label: 'PDF Document',
    description: 'Upload PDF documents and files',
    tags: ['PDF', 'Document', 'Download'],
    gradient: 'from-red-500 to-orange-600',
    bgGradient: 'from-red-50 to-orange-50',
    borderColor: 'border-red-500',
    hoverBorder: 'hover:border-red-300',
    iconBg: 'bg-gray-100 group-hover:bg-red-50',
    iconColor: 'text-gray-700 group-hover:text-red-600',
    selectedIconBg: 'bg-gradient-to-br from-red-500 to-orange-600',
    tagBg: 'bg-red-100',
    tagText: 'text-red-700',
    checkBg: 'bg-red-500',
  },
] as const;

export default function ContentTypeSelector({ selectedType, onSelect }: ContentTypeSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Select Content Type
        </h3>
        <p className="text-sm text-gray-600">
          Choose the type of content you want to create
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {contentTypeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedType === option.type;
          
          return (
            <button
              key={option.type}
              onClick={() => onSelect(option.type)}
              className={`group relative p-8 rounded-xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? `${option.borderColor} bg-gradient-to-br ${option.bgGradient}`
                  : `border-[var(--border,rgba(0,0,0,0.12))] ${option.hoverBorder} bg-white`
              }`}
              type="button"
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-colors ${
                  isSelected
                    ? option.selectedIconBg
                    : option.iconBg
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isSelected ? 'text-white' : option.iconColor
                  }`}
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{option.label}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {option.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {option.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-xs px-2 py-1 ${option.tagBg} ${option.tagText} rounded`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {isSelected && (
                <div className={`absolute top-3 right-3 w-6 h-6 ${option.checkBg} rounded-full flex items-center justify-center`}>
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
