'use client';

import React from 'react';
import { ChevronLeft, Video, FileAudio, FileText, Upload, X, Check } from 'lucide-react';
import BlockNoteEditor from './BlockNoteEditor';

interface ContentDetailsFormProps {
  knowledgeType: 'webinar' | 'konten' | undefined;
  contentType: 'article' | 'video' | 'podcast' | 'pdf' | null;
  formData: {
    // Webinar fields
    tgl_zoom: string;
    link_zoom: string;
    link_youtube: string;
    link_record: string;
    link_vb: string;
    file_notulensi_pdf?: string; // Changed from File to string (URL)
    jumlah_jp?: number;
    // Content fields
    media_resource?: string; // Changed from File to string (URL)
    content_richtext: string;
  };
  errors: Record<string, string>;
  onContentTypeChange: (type: 'article' | 'video' | 'podcast' | 'pdf' | null) => void;
  onFieldChange: (field: string, value: unknown) => void;
  onMediaUpload?: (file: File, type: 'video' | 'audio' | 'pdf') => Promise<void>;
  onPDFUpload?: (file: File) => Promise<void>;
  isUploadingMedia?: boolean;
  isUploadingPDF?: boolean;
}

export default function ContentDetailsForm({
  knowledgeType,
  contentType,
  formData,
  errors,
  onContentTypeChange,
  onFieldChange,
  onMediaUpload,
  onPDFUpload,
  isUploadingMedia = false,
  isUploadingPDF = false,
}: ContentDetailsFormProps) {

  if (knowledgeType === 'webinar') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Webinar Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={
                formData.tgl_zoom
                  ? new Date(formData.tgl_zoom).toISOString().slice(0, 16)
                  : ''
              }
              onChange={(e) => onFieldChange('tgl_zoom', e.target.value)}
              className="w-full px-4 h-12 border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
            />
            {errors.tgl_zoom && (
              <p className="text-red-600 text-xs mt-1.5">{errors.tgl_zoom}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              JP Credits
            </label>
            <input
              type="number"
              value={formData.jumlah_jp || ''}
              onChange={(e) =>
                onFieldChange('jumlah_jp', parseInt(e.target.value) || undefined)
              }
              className="w-full px-4 h-12 border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Zoom Link
            </label>
            <input
              type="url"
              value={formData.link_zoom || ''}
              onChange={(e) => onFieldChange('link_zoom', e.target.value)}
              className="w-full px-4 h-12 border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
              placeholder="https://zoom.us/j/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              YouTube Link
            </label>
            <input
              type="url"
              value={formData.link_youtube || ''}
              onChange={(e) => onFieldChange('link_youtube', e.target.value)}
              className="w-full px-4 h-12 border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
              placeholder="https://youtube.com/..."
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Recording Link
            </label>
            <input
              type="url"
              value={formData.link_record || ''}
              onChange={(e) => onFieldChange('link_record', e.target.value)}
              className="w-full px-4 h-12 border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Virtual Background Link
            </label>
            <input
              type="url"
              value={formData.link_vb || ''}
              onChange={(e) => onFieldChange('link_vb', e.target.value)}
              className="w-full px-4 h-12 border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
              placeholder="https://..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Notes PDF
          </label>
          {formData.file_notulensi_pdf ? (
            <div className="relative border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg overflow-hidden bg-gray-50 h-64">
              <div className="w-full h-full flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-7 h-7 text-green-600" />
                  </div>
                  <p className="text-gray-900 text-sm font-medium truncate mb-2">
                    PDF Notes Uploaded
                  </p>
                  <p className="text-gray-600 text-xs">
                    File uploaded successfully • PDF
                  </p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white text-sm font-medium truncate">
                  {formData.file_notulensi_pdf.split('/').pop()?.split('?')[0] || 'PDF File'}
                </p>
              </div>
              <button
                onClick={() => onFieldChange('file_notulensi_pdf', undefined)}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className={`border-2 border-dashed rounded-lg p-8 transition-colors bg-white ${
              isUploadingPDF
                ? 'border-yellow-400 bg-yellow-50'
                : 'border-gray-300 hover:border-green-400'
            }`}>
              <input
                type="file"
                accept=".pdf"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file && onPDFUpload) {
                    try {
                      await onPDFUpload(file);
                    } catch (error) {
                      console.error('PDF upload failed:', error);
                    }
                  }
                }}
                className="hidden"
                id="notes-pdf-upload"
                disabled={isUploadingPDF}
              />
              <label
                htmlFor="notes-pdf-upload"
                className={`block text-center ${isUploadingPDF ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                  isUploadingPDF
                    ? 'bg-yellow-100'
                    : 'bg-gray-100'
                }`}>
                  {isUploadingPDF ? (
                    <div className="w-7 h-7 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Upload className="w-7 h-7 text-gray-600" />
                  )}
                </div>
                <p className={`text-base font-medium mb-1 ${
                  isUploadingPDF
                    ? 'text-yellow-700'
                    : 'text-gray-900'
                }`}>
                  {isUploadingPDF ? 'Uploading PDF...' : 'Upload Notes PDF'}
                </p>
                <p className="text-sm text-gray-500">PDF up to 10MB</p>
              </label>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Content type (konten)
  return (
    <>
      {!contentType ? (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Choose Content Type
            </h3>
            <p className="text-gray-600">
              Select the type of content you want to create
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <button
              onClick={() => onContentTypeChange('article')}
              className={`group relative p-8 rounded-xl border-2 transition-all duration-200 text-left ${
                contentType === 'article'
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50'
                  : 'border-[var(--border,rgba(0,0,0,0.12))] hover:border-blue-300 bg-white'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-colors ${
                  contentType === 'article'
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                    : 'bg-gray-100 group-hover:bg-blue-50'
                }`}
              >
                <FileText
                  className={`w-6 h-6 ${
                    contentType === 'article' ? 'text-white' : 'text-gray-700 group-hover:text-blue-600'
                  }`}
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Article</h3>
              <p className="text-gray-600 text-sm mb-4">
                Write articles with rich text content and formatting
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  Rich Text
                </span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  No File
                </span>
              </div>
              {contentType === 'article' && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>

            <button
              onClick={() => onContentTypeChange('video')}
              className={`group relative p-8 rounded-xl border-2 transition-all duration-200 text-left ${
                contentType === 'video'
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50'
                  : 'border-[var(--border,rgba(0,0,0,0.12))] hover:border-blue-300 bg-white'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-colors ${
                  contentType === 'video'
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                    : 'bg-gray-100 group-hover:bg-blue-50'
                }`}
              >
                <Video
                  className={`w-6 h-6 ${
                    contentType === 'video' ? 'text-white' : 'text-gray-700 group-hover:text-blue-600'
                  }`}
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Video</h3>
              <p className="text-gray-600 text-sm mb-4">
                Upload video content with rich text descriptions
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  MP4
                </span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  MOV
                </span>
              </div>
              {contentType === 'video' && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>

            <button
              onClick={() => onContentTypeChange('podcast')}
              className={`group relative p-8 rounded-xl border-2 transition-all duration-200 text-left ${
                contentType === 'podcast'
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50'
                  : 'border-[var(--border,rgba(0,0,0,0.12))] hover:border-blue-300 bg-white'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-colors ${
                  contentType === 'podcast'
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                    : 'bg-gray-100 group-hover:bg-blue-50'
                }`}
              >
                <FileAudio
                  className={`w-6 h-6 ${
                    contentType === 'podcast' ? 'text-white' : 'text-gray-700 group-hover:text-blue-600'
                  }`}
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Podcast/Audio</h3>
              <p className="text-gray-600 text-sm mb-4">
                Upload audio content with show notes and transcripts
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  MP3
                </span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  WAV
                </span>
              </div>
              {contentType === 'podcast' && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>

            <button
              onClick={() => onContentTypeChange('pdf')}
              className={`group relative p-8 rounded-xl border-2 transition-all duration-200 text-left ${
                contentType === 'pdf'
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50'
                  : 'border-[var(--border,rgba(0,0,0,0.12))] hover:border-blue-300 bg-white'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-colors ${
                  contentType === 'pdf'
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                    : 'bg-gray-100 group-hover:bg-blue-50'
                }`}
              >
                <FileText
                  className={`w-6 h-6 ${
                    contentType === 'pdf' ? 'text-white' : 'text-gray-700 group-hover:text-blue-600'
                  }`}
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">PDF</h3>
              <p className="text-gray-600 text-sm mb-4">
                Upload PDF documents with descriptions and summaries
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  PDF
                </span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  Document
                </span>
              </div>
              {contentType === 'pdf' && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Back button */}
          <button
            onClick={() => onContentTypeChange(null)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Change Content Type
          </button>

          {/* Content Type Header */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              {contentType === 'article' && <FileText className="w-5 h-5 text-blue-600" />}
              {contentType === 'video' && <Video className="w-5 h-5 text-blue-600" />}
              {contentType === 'podcast' && <FileAudio className="w-5 h-5 text-blue-600" />}
              {contentType === 'pdf' && <FileText className="w-5 h-5 text-blue-600" />}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 capitalize">{contentType}</h3>
              <p className="text-sm text-gray-600">
                {contentType === 'article' && 'Create rich text articles'}
                {contentType === 'video' && 'Upload video content'}
                {contentType === 'podcast' && 'Upload audio content'}
                {contentType === 'pdf' && 'Upload PDF documents'}
              </p>
            </div>
          </div>

          {/* Media Resource (only for video, podcast, pdf) */}
          {contentType !== 'article' && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Media Resource <span className="text-red-500">*</span>
              </label>
              {formData.media_resource ? (
                <div className="relative border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg overflow-hidden bg-gray-50 h-64">
                  <div className="w-full h-full flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="mx-auto w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        {contentType === 'video' ? (
                          <Video className="w-7 h-7 text-blue-600" />
                        ) : contentType === 'pdf' ? (
                          <FileText className="w-7 h-7 text-blue-600" />
                        ) : contentType === 'podcast' ? (
                          <FileAudio className="w-7 h-7 text-blue-600" />
                        ) : (
                          <FileText className="w-7 h-7 text-blue-600" />
                        )}
                      </div>
                      <p className="text-gray-900 text-sm font-medium truncate mb-2">
                        {contentType === 'video' ? 'Video' : contentType === 'pdf' ? 'PDF' : 'Audio'} File Uploaded
                      </p>
                      <p className="text-gray-600 text-xs">
                        File uploaded successfully • {contentType === 'video' ? 'Video' : contentType === 'pdf' ? 'PDF' : 'Audio'}
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white text-sm font-medium truncate">
                      {formData.media_resource.split('/').pop()?.split('?')[0] || `${contentType === 'video' ? 'Video' : contentType === 'pdf' ? 'PDF' : 'Audio'} File`}
                    </p>
                  </div>
                  <button
                    onClick={() => onFieldChange('media_resource', undefined)}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className={`border-2 border-dashed rounded-lg p-8 transition-colors bg-white ${
                  isUploadingMedia
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}>
                  <input
                    type="file"
                    accept={
                      contentType === 'video'
                        ? 'video/*'
                        : contentType === 'podcast'
                        ? 'audio/*'
                        : contentType === 'pdf'
                        ? '.pdf'
                        : '*'
                    }
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file && onMediaUpload) {
                        try {
                          const uploadType = contentType === 'video' ? 'video' : contentType === 'podcast' ? 'audio' : 'pdf';
                          await onMediaUpload(file, uploadType);
                        } catch (error) {
                          console.error('Media upload failed:', error);
                        }
                      }
                    }}
                    className="hidden"
                    id="media-resource-upload"
                    disabled={isUploadingMedia}
                  />
                  <label
                    htmlFor="media-resource-upload"
                    className={`block text-center ${isUploadingMedia ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                      isUploadingMedia
                        ? 'bg-yellow-100'
                        : 'bg-gray-100'
                    }`}>
                      {isUploadingMedia ? (
                        <div className="w-7 h-7 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Upload className="w-7 h-7 text-gray-600" />
                      )}
                    </div>
                    <p className={`text-base font-medium mb-1 ${
                      isUploadingMedia
                        ? 'text-yellow-700'
                        : 'text-gray-900'
                    }`}>
                      {isUploadingMedia ? 'Uploading...' : `Upload ${contentType === 'video' ? 'Video' : contentType === 'podcast' ? 'Audio' : 'PDF'} File`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {contentType === 'video' && 'MP4, MOV up to 50MB'}
                      {contentType === 'podcast' && 'MP3, WAV up to 50MB'}
                      {contentType === 'pdf' && 'PDF up to 10MB'}
                    </p>
                  </label>
                </div>
              )}
              {errors.media_resource && (
                <p className="text-red-600 text-xs mt-1.5">{errors.media_resource}</p>
              )}
            </div>
          )}

          {/* Content (Rich Text Editor) */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Content
            </label>
            <BlockNoteEditor
              type={contentType === 'video' ? 'video' : contentType === 'podcast' ? 'audio' : contentType === 'pdf' ? 'pdf' : 'article'}
              onContentChange={(contentJson) => {
                onFieldChange('content_richtext', contentJson);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}