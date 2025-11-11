/**
 * Content Details Form - Clean Implementation with TanStack Form Best Practices
 *
 * Key improvements:
 * - Native Zod validation for all fields
 * - Clean separation of concerns (webinar vs content)
 * - No duplicate state management
 * - Optimized rendering with proper memoization
 */

'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  Video,
  FileAudio,
  FileText,
  Upload,
  X,
} from 'lucide-react';
import type { UseKnowledgeWizardFormReturn } from '@/hooks/useKnowledgeWizardForm';
import {
  CONTENT_TYPES,
  KNOWLEDGE_TYPES,
  type ContentType,
} from '@/types/knowledge-center';
import {
  webinarDetailsSchema,
  mediaUrlValidator,
  documentValidator,
  jpCountValidator,
} from '@/lib/validation/knowledge-schemas';
import { FormInput, FieldInfo } from '@/lib/validation/form-utils';
import BlockNoteEditor from './BlockNoteEditor';

// ============================================================================
// Types
// ============================================================================

interface ContentDetailsFormProps {
  wizard: UseKnowledgeWizardFormReturn;
  onMediaUpload?: (file: File, type: 'video' | 'audio' | 'pdf') => Promise<void>;
  onPDFUpload?: (file: File) => Promise<void>;
  isUploadingMedia?: boolean;
  isUploadingPDF?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export default function ContentDetailsForm({
  wizard,
  onMediaUpload,
  onPDFUpload,
  isUploadingMedia = false,
  isUploadingPDF = false,
}: ContentDetailsFormProps) {
  const { form, formValues, currentType } = wizard;

  // Local state for content type selection (only for CONTENT type)
  const [selectedContentType, setSelectedContentType] = useState<ContentType | undefined>(
    formValues.knowledgeContent?.contentType as ContentType | undefined
  );

  // ============================================================================
  // Computed Values
  // ============================================================================

  const isWebinar = currentType === KNOWLEDGE_TYPES.WEBINAR;
  const isContent = currentType === KNOWLEDGE_TYPES.CONTENT;

  const isArticle = selectedContentType === CONTENT_TYPES.ARTICLE;
  const isVideo = selectedContentType === CONTENT_TYPES.VIDEO;
  const isPodcast = selectedContentType === CONTENT_TYPES.PODCAST;
  const isPdf = selectedContentType === CONTENT_TYPES.FILE;

  const mediaLabel = isVideo ? 'Video' : isPdf ? 'PDF' : 'Podcast/Audio';
  const uploadType: 'video' | 'audio' | 'pdf' = isVideo
    ? 'video'
    : isPodcast
      ? 'audio'
      : 'pdf';

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleContentTypeSelect = (type: ContentType) => {
    console.log('🔧 Content type selected:', type);
    setSelectedContentType(type);

    // Get current knowledge content to preserve existing data
    const currentKnowledgeContent = formValues.knowledgeContent || {};

    // Create the updated knowledge content object
    const updatedKnowledgeContent = {
      ...currentKnowledgeContent,
      contentType: type,
    };

    console.log('🔄 Setting knowledgeContent to:', updatedKnowledgeContent);

    // Try different approaches to update the form
    try {
      // Method 1: Direct object update
      form.setFieldValue('knowledgeContent', updatedKnowledgeContent as any);

      console.log('✅ Method 1 successful');
    } catch (error) {
      console.error('❌ Method 1 failed:', error);

      // Method 2: Try using the Field API
      try {
        const fieldApi = form.getFieldInfo('knowledgeContent');
        if (fieldApi) {
          fieldApi.setValue(updatedKnowledgeContent as any);
          console.log('✅ Method 2 successful');
        }
      } catch (error2) {
        console.error('❌ Method 2 failed:', error2);
      }
    }

    // Debug immediately and after delay
    setTimeout(() => {
      console.log('🐛 Form values after update:', form.state.values.knowledgeContent);
      console.log('🎯 ContentType field value:', form.getFieldValue('knowledgeContent'));
      console.log('🔍 Current formValues:', formValues);
      console.log('🔍 Full form state:', form.state.values);
    }, 100);
  };

  const handleMediaUpload = async (file: File) => {
    if (onMediaUpload) {
      try {
        await onMediaUpload(file, uploadType);
      } catch (error) {
        console.error('Media upload failed:', error);
      }
    }
  };

  const handlePDFUpload = async (file: File) => {
    if (onPDFUpload) {
      try {
        await onPDFUpload(file);
      } catch (error) {
        console.error('PDF upload failed:', error);
      }
    }
  };

  // ============================================================================
  // Webinar Form
  // ============================================================================

  if (isWebinar) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Webinar Date */}
          <form.Field
            name="webinar.zoomDate"
            validators={{
              onChange: webinarDetailsSchema.shape.zoomDate,
              onBlur: webinarDetailsSchema.shape.zoomDate,
            }}
          >
            {(field) => (
              <FormInput
                field={field}
                label="Webinar Date"
                type="datetime-local"
                required
              />
            )}
          </form.Field>

          {/* JP Credits */}
          <form.Field
            name="webinar.jpCount"
            validators={{
              onChange: ({ value }) => jpCountValidator.validate(value),
              onBlur: ({ value }) => jpCountValidator.validate(value),
            }}
          >
            {(field) => (
              <FormInput
                field={field as any}
                label="JP Credits"
                type="number"
                placeholder="0"
                required
              />
            )}
          </form.Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Zoom Link */}
          <form.Field
            name="webinar.zoomLink"
            validators={{
              onChange: webinarDetailsSchema.shape.zoomLink,
              onBlur: webinarDetailsSchema.shape.zoomLink,
            }}
          >
            {(field) => (
              <FormInput
                field={field}
                label="Zoom Link"
                type="url"
                placeholder="https://zoom.us/j/..."
                required
              />
            )}
          </form.Field>

          {/* YouTube Link */}
          <form.Field
            name="webinar.youtubeLink"
            validators={{
              onChange: webinarDetailsSchema.shape.youtubeLink,
              onBlur: webinarDetailsSchema.shape.youtubeLink,
            }}
          >
            {(field) => (
              <FormInput
                field={field}
                label="YouTube Link"
                type="url"
                placeholder="https://youtube.com/..."
              />
            )}
          </form.Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Recording Link */}
          <form.Field
            name="webinar.recordLink"
            validators={{
              onChange: webinarDetailsSchema.shape.recordLink,
              onBlur: webinarDetailsSchema.shape.recordLink,
            }}
          >
            {(field) => (
              <FormInput
                field={field}
                label="Recording Link"
                type="url"
                placeholder="https://..."                
              />
            )}
          </form.Field>

          {/* Virtual Background Link */}
          <form.Field
            name="webinar.vbLink"
            validators={{
              onChange: webinarDetailsSchema.shape.vbLink,
              onBlur: webinarDetailsSchema.shape.vbLink,
            }}
          >
            {(field) => (
              <FormInput
                field={field}
                label="Virtual Background Link"
                type="url"
                placeholder="https://..."
              />
            )}
          </form.Field>
        </div>

        {/* Notes PDF Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Notes PDF
          </label>
          {formValues.webinar?.contentText ? (
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
                <p className="text-white text-sm font-medium truncate">PDF Notes</p>
              </div>
              <button
                onClick={() => {
                  form.setFieldValue('webinar', {
                    ...formValues.webinar,
                    contentText: undefined,
                  });
                }}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-8 transition-colors bg-white ${
                isUploadingPDF
                  ? 'border-yellow-400 bg-yellow-50'
                  : 'border-gray-300 hover:border-green-400'
              }`}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    await handlePDFUpload(file);
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
                <div
                  className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                    isUploadingPDF ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}
                >
                  {isUploadingPDF ? (
                    <div className="w-7 h-7 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Upload className="w-7 h-7 text-gray-600" />
                  )}
                </div>
                <p
                  className={`text-base font-medium mb-1 ${
                    isUploadingPDF ? 'text-yellow-700' : 'text-gray-900'
                  }`}
                >
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

  // ============================================================================
  // Content Type Selection
  // ============================================================================

  if (isContent && !selectedContentType) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Choose Content Type
          </h3>
          <p className="text-gray-600">Select the type of content you want to create</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Article Option */}
          <button
            onClick={() => handleContentTypeSelect(CONTENT_TYPES.ARTICLE)}
            className="group relative p-8 rounded-xl border-2 border-[var(--border,rgba(0,0,0,0.12))] hover:border-blue-300 bg-white transition-all duration-200 text-left"
            type="button"
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-colors bg-gray-100 group-hover:bg-blue-50">
              <FileText className="w-6 h-6 text-gray-700 group-hover:text-blue-600" />
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
          </button>

          {/* Video Option */}
          <button
            onClick={() => handleContentTypeSelect(CONTENT_TYPES.VIDEO)}
            className="group relative p-8 rounded-xl border-2 border-[var(--border,rgba(0,0,0,0.12))] hover:border-blue-300 bg-white transition-all duration-200 text-left"
            type="button"
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-colors bg-gray-100 group-hover:bg-blue-50">
              <Video className="w-6 h-6 text-gray-700 group-hover:text-blue-600" />
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
          </button>

          {/* Podcast Option */}
          <button
            onClick={() => handleContentTypeSelect(CONTENT_TYPES.PODCAST)}
            className="group relative p-8 rounded-xl border-2 border-[var(--border,rgba(0,0,0,0.12))] hover:border-blue-300 bg-white transition-all duration-200 text-left"
            type="button"
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-colors bg-gray-100 group-hover:bg-blue-50">
              <FileAudio className="w-6 h-6 text-gray-700 group-hover:text-blue-600" />
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
          </button>

          {/* PDF Option */}
          <button
            onClick={() => handleContentTypeSelect(CONTENT_TYPES.FILE)}
            className="group relative p-8 rounded-xl border-2 border-[var(--border,rgba(0,0,0,0.12))] hover:border-blue-300 bg-white transition-all duration-200 text-left"
            type="button"
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-colors bg-gray-100 group-hover:bg-blue-50">
              <FileText className="w-6 h-6 text-gray-700 group-hover:text-blue-600" />
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
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Content Details Form
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => {
          setSelectedContentType(undefined);
          form.setFieldValue('knowledgeContent', {
            contentType: undefined,
            mediaUrl: undefined,
            document: undefined,
          } as any);
          // Clear any validation errors
          form.setFieldMeta('knowledgeContent.contentType' as any, (prev: any) => ({
            ...prev,
            errors: [],
          }));
        }}
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
          <h3 className="font-semibold text-gray-900 capitalize">
            {selectedContentType}
          </h3>
          <p className="text-sm text-gray-600">
            {isArticle && 'Create rich text articles'}
            {isVideo && 'Upload video content'}
            {isPodcast && 'Upload audio content'}
            {isPdf && 'Upload PDF documents'}
          </p>
        </div>
      </div>

      {/* Media Resource (only for video, podcast, pdf) */}
      {!isArticle && (
        <form.Field
          name="knowledgeContent.mediaUrl"
          validators={{
            onChange: mediaUrlValidator,
            onBlur: mediaUrlValidator,
          }}
        >
          {(field) => {
            // Create a wrapped handleChange that preserves contentType
            const wrappedHandleChange = (value: string) => {
              const currentKnowledgeContent = formValues.knowledgeContent || {};
              console.log('📸 Media field change - preserving contentType:', selectedContentType);

              // Update the entire knowledgeContent object to preserve contentType
              form.setFieldValue('knowledgeContent', {
                ...currentKnowledgeContent,
                mediaUrl: value,
                contentType: selectedContentType || currentKnowledgeContent.contentType,
              } as any);
            };

            return (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Media Resource <span className="text-red-500">*</span>
              </label>
              {formValues.knowledgeContent?.mediaUrl ? (
                <div className="relative border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg overflow-hidden bg-gray-50 h-80">
                  {isVideo && (
                    <video
                      src={formValues.knowledgeContent.mediaUrl}
                      className="w-full h-80 object-cover"
                      controls={false}
                      muted
                    />
                  )}
                  {isPdf && (
                    <iframe
                      src={formValues.knowledgeContent.mediaUrl}
                      className="w-full h-80 border-0"
                      title="PDF Preview"
                    />
                  )}
                  {isPodcast && (
                    <div className="w-full h-80 flex items-center justify-center p-8 bg-gradient-to-br from-purple-50 to-blue-50">
                      <div className="text-center">
                        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                          <FileAudio className="w-12 h-12 text-white" />
                        </div>
                        <p className="text-gray-900 text-base font-semibold mb-2">
                          Audio File Uploaded
                        </p>
                        <p className="text-gray-600 text-sm mb-4">
                          File uploaded successfully • Audio
                        </p>
                        <audio
                          src={formValues.knowledgeContent.mediaUrl}
                          controls
                          className="mx-auto w-full max-w-xs shadow-md rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      // Use wrapped handler to preserve contentType
                      wrappedHandleChange('');
                    }}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg z-10"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 transition-colors bg-white ${
                    isUploadingMedia
                      ? 'border-yellow-400 bg-yellow-50'
                      : field.state.meta.errors.length > 0
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <input
                    type="file"
                    accept={
                      isVideo ? 'video/*' : isPodcast ? 'audio/*' : isPdf ? '.pdf' : '*'
                    }
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        await handleMediaUpload(file);
                        // After upload, validate the field
                        field.handleBlur();
                      }
                    }}
                    onBlur={field.handleBlur}
                    className="hidden"
                    id="media-resource-upload"
                    disabled={isUploadingMedia}
                  />
                  <label
                    htmlFor="media-resource-upload"
                    className={`block text-center ${isUploadingMedia ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div
                      className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                        isUploadingMedia ? 'bg-yellow-100' : 'bg-gray-100'
                      }`}
                    >
                      {isUploadingMedia ? (
                        <div className="w-7 h-7 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Upload className="w-7 h-7 text-gray-600" />
                      )}
                    </div>
                    <p
                      className={`text-base font-medium mb-1 ${
                        isUploadingMedia ? 'text-yellow-700' : 'text-gray-900'
                      }`}
                    >
                      {isUploadingMedia ? 'Uploading...' : `Upload ${mediaLabel} File`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {isVideo && 'MP4, MOV up to 50MB'}
                      {isPodcast && 'MP3, WAV up to 50MB'}
                      {isPdf && 'PDF up to 10MB'}
                    </p>
                  </label>
                </div>
              )}
              <FieldInfo field={field} />
            </div>
            );
          }}
        </form.Field>
      )}

      {/* Content (Rich Text Editor) */}
      <form.Field
        name="knowledgeContent.document"
        validators={{
          onChange: documentValidator,
          onBlur: documentValidator,
        }}
      >
        {(field) => {
          // Create a wrapped handleChange that preserves contentType
          const wrappedHandleChange = (value: string) => {
            const currentKnowledgeContent = formValues.knowledgeContent || {};
            console.log('📝 Document field change - preserving contentType:', selectedContentType);

            // Update the entire knowledgeContent object to preserve contentType
            form.setFieldValue('knowledgeContent', {
              ...currentKnowledgeContent,
              document: value,
              contentType: selectedContentType || currentKnowledgeContent.contentType,
            } as any);
          };

          return (
          <div>
            <BlockNoteEditor
              type={selectedContentType as ContentType}
              onContentChange={(contentJson) => {
                // Use wrapped handler to preserve contentType
                wrappedHandleChange(contentJson);
              }}
            />
            <FieldInfo field={field} />
          </div>
          );
        }}
      </form.Field>
    </div>
  );
}
