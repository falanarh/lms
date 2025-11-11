/**
 * Media Upload Field Component
 * Handles video, audio, and PDF file uploads with preview
 */

'use client';

import React from 'react';
import { Upload, X } from 'lucide-react';
import { FieldInfo } from '@/lib/validation/form-utils';

interface MediaUploadFieldProps {
  field: any; // TanStack Form FieldApi - complex generic type with 23 type arguments
  mediaUrl?: string;
  mediaType: 'video' | 'audio' | 'pdf';
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
}

export default function MediaUploadField({
  field,
  mediaUrl,
  mediaType,
  onUpload,
  isUploading = false,
}: MediaUploadFieldProps) {
  const mediaLabel = mediaType === 'video' ? 'Video' : mediaType === 'pdf' ? 'PDF' : 'Podcast/Audio';
  const acceptTypes = mediaType === 'video' ? 'video/*' : mediaType === 'audio' ? 'audio/*' : '.pdf';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUpload(file);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        Media Resource <span className="text-red-500">*</span>
      </label>
      {mediaUrl ? (
        <div className="relative border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg overflow-hidden bg-gray-50 h-80">
          {mediaType === 'video' && (
            <video
              src={mediaUrl}
              className="w-full h-80 object-cover"
              controls={false}
            />
          )}
          {mediaType === 'audio' && (
            <div className="w-full h-80 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
              <audio src={mediaUrl} controls className="w-full max-w-md px-4" />
            </div>
          )}
          {mediaType === 'pdf' && (
            <div className="w-full h-80 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium mb-2">PDF Uploaded</p>
                <a
                  href={mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm underline"
                >
                  View PDF
                </a>
              </div>
            </div>
          )}
          <button
            onClick={() => field.handleChange('')}
            className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg z-10"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
          <input
            type="file"
            accept={acceptTypes}
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={isUploading}
          />
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium mb-1">
              {isUploading ? 'Uploading...' : `Upload ${mediaLabel}`}
            </p>
            <p className="text-sm text-gray-500">
              Click to browse or drag and drop
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {mediaType === 'video' && 'MP4, WebM, or other video formats'}
              {mediaType === 'audio' && 'MP3, WAV, or other audio formats'}
              {mediaType === 'pdf' && 'PDF documents only'}
            </p>
          </div>
        </div>
      )}
      <FieldInfo field={field} />
    </div>
  );
}
