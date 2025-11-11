/**
 * General Content Form Component
 * Handles article, video, podcast, and PDF content creation
 */

'use client';

import React from 'react';
import type { UseKnowledgeWizardFormReturn } from '@/hooks/useKnowledgeWizardForm';
import { CONTENT_TYPES, type ContentType } from '@/types/knowledge-center';
import { mediaUrlValidator, documentValidator } from '@/lib/validation/knowledge-schemas';
import BlockNoteEditor from '../BlockNoteEditor';
import ContentTypeSelector from './ContentTypeSelector';
import ContentTypeHeader from './ContentTypeHeader';
import MediaUploadField from './MediaUploadField';

interface GeneralContentFormProps {
  wizard: UseKnowledgeWizardFormReturn;
  onMediaUpload?: (file: File, type: 'video' | 'audio' | 'pdf') => Promise<void>;
  isUploadingMedia?: boolean;
}

export default function GeneralContentForm({
  wizard,
  onMediaUpload,
  isUploadingMedia = false,
}: GeneralContentFormProps) {
  const { form, formValues } = wizard;

  const handleContentTypeSelect = (type: ContentType) => {
    console.log('🎯 Selecting content type:', type);
    // Always set the entire knowledgeContent object to ensure reactivity
    form.setFieldValue('knowledgeContent' as any, {
      contentType: type,
      mediaUrl: formValues.knowledgeContent?.mediaUrl,
      document: formValues.knowledgeContent?.document,
    } as any);
  };

  const handleBack = () => {
    // Reset content type and clear data
    form.setFieldValue('knowledgeContent' as any, {
      contentType: undefined,
      mediaUrl: undefined,
      document: undefined,
    } as any);
  };

  // Use Subscribe for reactive content type
  return (
    <form.Subscribe
      selector={(state: any) => state.values.knowledgeContent?.contentType}
    >
      {(selectedContentType: any) => {
        const isArticle = selectedContentType === CONTENT_TYPES.ARTICLE;
        const isVideo = selectedContentType === CONTENT_TYPES.VIDEO;
        const isPodcast = selectedContentType === CONTENT_TYPES.PODCAST;

        const uploadType: 'video' | 'audio' | 'pdf' = isVideo
          ? 'video'
          : isPodcast
            ? 'audio'
            : 'pdf';

        const handleMediaUpload = async (file: File) => {
          if (onMediaUpload) {
            try {
              await onMediaUpload(file, uploadType);
            } catch (error) {
              console.error('Media upload failed:', error);
            }
          }
        };

        // Step 1: Select content type
        if (!selectedContentType) {
          return (
            <ContentTypeSelector
              selectedType={selectedContentType as ContentType | undefined}
              onSelect={handleContentTypeSelect}
            />
          );
        }

        // Step 2: Fill content details
        return (
          <div className="space-y-6">
            <ContentTypeHeader contentType={selectedContentType as ContentType} onBack={handleBack} />

      {/* Media Resource (only for video, podcast, pdf) */}
      {!isArticle && (
        <form.Field
          name="knowledgeContent.mediaUrl"
          validators={{
            onChange: mediaUrlValidator,
            onBlur: mediaUrlValidator,
          }}
        >
          {(field: any) => (
            <MediaUploadField
              field={field}
              mediaUrl={formValues.knowledgeContent?.mediaUrl}
              mediaType={uploadType}
              onUpload={handleMediaUpload}
              isUploading={isUploadingMedia}
            />
          )}
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
              {(field: any) => (
                <div>
                  <BlockNoteEditor
                    type={selectedContentType as ContentType}
                    onContentChange={(contentJson) => field.handleChange(contentJson)}
                  />
                </div>
              )}
            </form.Field>
          </div>
        );
      }}
    </form.Subscribe>
  );
}
