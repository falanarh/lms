'use client';

import React, { useState } from 'react';
import { User, Upload, X, Settings } from 'lucide-react';
import { Dropdown } from '@/components/ui/Dropdown/Dropdown';
import { Subject, Penyelenggara } from '@/api/knowledge';
import SubjectManager from './SubjectManager';

interface BasicInfoFormProps {
  formData: {
    title: string;
    description: string;
    subject: string;
    penyelenggara: string;
    author: string;
    published_at: string;
    tags: string[];
    thumbnail?: File;
  };
  thumbnailPreview: string | null;
  currentTagInput: string;
  subjects: Subject[];
  penyelenggara: Penyelenggara[];
  errors: Record<string, string>;
  onFieldChange: (field: string, value: unknown) => void;
  onThumbnailSelect: (file: File) => void;
  onThumbnailRemove: () => void;
  onTagInput: (value: string) => void;
  onAddTag: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemoveTag: (tag: string) => void;
  onSubjectAdd?: (subject: { name: string; description?: string }) => void;
  onSubjectUpdate?: (id: string, subject: { name?: string; description?: string }) => void;
  onSubjectDelete?: (id: string) => void;
  isSubjectManagementPending?: {
    adding: boolean;
    updating: boolean;
    deleting: boolean;
  };
}

export default function BasicInfoForm({
  formData,
  thumbnailPreview,
  currentTagInput,
  subjects,
  penyelenggara,
  errors,
  onFieldChange,
  onThumbnailSelect,
  onThumbnailRemove,
  onTagInput,
  onAddTag,
  onRemoveTag,
  onSubjectAdd,
  onSubjectUpdate,
  onSubjectDelete,
  isSubjectManagementPending = { adding: false, updating: false, deleting: false },
}: BasicInfoFormProps) {
  const [showSubjectManager, setShowSubjectManager] = useState(false);
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Enter a clear, descriptive title"
          value={formData.title}
          onChange={(e) => onFieldChange('title', e.target.value)}
          className={`w-full px-4 h-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 ${
            errors.title ? 'border-red-500' : 'border-[var(--border,rgba(0,0,0,0.12))]'
          }`}
        />
        {errors.title && (
          <p className="text-red-600 text-xs mt-1.5">{errors.title}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          placeholder="Describe what learners will gain from this content"
          value={formData.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
          rows={4}
          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 resize-y min-h-[48px] max-h-[200px] scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full ${
            errors.description ? 'border-red-500' : 'border-[var(--border,rgba(0,0,0,0.12))]'
          }`}
        />
        {errors.description && (
          <p className="text-red-600 text-xs mt-1.5">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Organizer <span className="text-red-500">*</span>
          </label>
          <Dropdown
            items={penyelenggara.map((p) => ({
              value: p.name,
              label: p.name,
            }))}
            value={formData.penyelenggara}
            onChange={(value) => onFieldChange('penyelenggara', value)}
            placeholder="Select organizer"
            error={!!errors.penyelenggara}
            size="lg"
            variant="solid"
            className="w-full"
          />
          {errors.penyelenggara && (
            <p className="text-red-600 text-xs mt-1.5">{errors.penyelenggara}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Author <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Enter author name"
              value={formData.author}
              onChange={(e) => onFieldChange('author', e.target.value)}
              className={`w-full pl-10 pr-4 h-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 ${
                errors.author ? 'border-red-500' : 'border-[var(--border,rgba(0,0,0,0.12))]'
              }`}
            />
          </div>
          {errors.author && (
            <p className="text-red-600 text-xs mt-1.5">{errors.author}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-900">
              Subject <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowSubjectManager(!showSubjectManager)}
              className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-3 h-3" />
              Manage Subjects
            </button>
          </div>
          <Dropdown
            items={subjects.map((s) => ({
              value: s.name,
              label: s.name,
            }))}
            value={formData.subject}
            onChange={(value) => onFieldChange('subject', value)}
            placeholder="Select subject"
            error={!!errors.subject}
            size="lg"
            variant="solid"
            className="w-full"
          />
          {errors.subject && (
            <p className="text-red-600 text-xs mt-1.5">{errors.subject}</p>
          )}

          {/* Subject Manager */}
          {showSubjectManager && onSubjectAdd && onSubjectUpdate && onSubjectDelete && (
            <div className="mt-3">
              <SubjectManager
                subjects={subjects}
                onSubjectAdd={onSubjectAdd}
                onSubjectUpdate={onSubjectUpdate}
                onSubjectDelete={onSubjectDelete}
                isAdding={isSubjectManagementPending.adding}
                isUpdating={isSubjectManagementPending.updating}
                isDeleting={isSubjectManagementPending.deleting}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Published Date
          </label>
          <input
            type="datetime-local"
            value={
              formData.published_at
                ? new Date(formData.published_at).toISOString().slice(0, 16)
                : ''
            }
            onChange={(e) => onFieldChange('published_at', e.target.value)}
            className="w-full px-4 h-12 border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Thumbnail <span className="text-red-500">*</span>
        </label>
        {thumbnailPreview ? (
          <div className="relative border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg overflow-hidden bg-gray-50">
            <img
              src={thumbnailPreview}
              alt="Thumbnail preview"
              className="w-full h-64 object-cover"
            />
            <button
              onClick={onThumbnailRemove}
              className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-white text-sm font-medium truncate">
                {formData.thumbnail?.name}
              </p>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors bg-white">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onThumbnailSelect(file);
              }}
              className="hidden"
              id="thumbnail-upload"
            />
            <label
              htmlFor="thumbnail-upload"
              className="cursor-pointer block text-center"
            >
              <div className="mx-auto w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-7 h-7 text-gray-600" />
              </div>
              <p className="text-base font-medium text-gray-900 mb-1">
                Upload Thumbnail
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, JPEG up to 10MB • Recommended size: 1200x630px
              </p>
            </label>
          </div>
        )}
        {errors.thumbnail && (
          <p className="text-red-600 text-xs mt-1.5">{errors.thumbnail}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Tags
        </label>
        <div className="border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full max-h-[120px] overflow-y-auto">
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-medium shadow-sm hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                  <span>#{tag}</span>
                  <button
                    onClick={() => onRemoveTag(tag)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    type="button"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <input
            type="text"
            value={currentTagInput}
            onChange={(e) => onTagInput(e.target.value)}
            onKeyDown={onAddTag}
            placeholder={
              formData.tags.length === 0
                ? 'Type a tag and press Enter or comma'
                : 'Add another tag...'
            }
            className="w-full h-12 px-4 outline-none text-gray-900 placeholder:text-gray-400 text-sm"
          />
        </div>
        <p className="text-gray-500 text-xs mt-1.5">
          Press Enter or comma to add a tag
        </p>
      </div>
    </div>
  );
}