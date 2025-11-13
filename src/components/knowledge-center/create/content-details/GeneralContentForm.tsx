/**
 * General Content Form Component
 * Handles article, video, podcast, and PDF content creation
 */

'use client';

import React from 'react';
import type { UseKnowledgeWizardFormReturn } from '@/hooks/useKnowledgeWizardForm';
import { CONTENT_TYPES, type ContentType } from '@/types/knowledge-center';
import { documentValidator } from '@/lib/validation/knowledge-schemas';
import BlockNoteEditor from '../BlockNoteEditor';
import ContentTypeSelector from './ContentTypeSelector';
import ContentTypeHeader from './ContentTypeHeader';
import MediaUploadField from './MediaUploadField';

interface GeneralContentFormProps {
  wizard: UseKnowledgeWizardFormReturn;
}

export default function GeneralContentForm({
  wizard,
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
            onChange: ({ value }: any) => {
              // Allow File objects (for preview before upload)
              if (value instanceof File) {
                return undefined;
              }
              // Allow string URLs (after upload)
              if (typeof value === 'string' && value.length > 0) {
                return undefined;
              }
              // Empty or invalid
              return 'Please upload a media file (video, audio, or PDF)';
            },
            onBlur: ({ value }: any) => {
              // Allow File objects (for preview before upload)
              if (value instanceof File) {
                return undefined;
              }
              // Allow string URLs (after upload)
              if (typeof value === 'string' && value.length > 0) {
                return undefined;
              }
              // Empty or invalid
              return 'Please upload a media file (video, audio, or PDF)';
            },
          }}
        >
          {(field: any) => (
            <MediaUploadField
              field={field}
              mediaUrl={typeof formValues.knowledgeContent?.mediaUrl === 'string' ? formValues.knowledgeContent?.mediaUrl : undefined}
              mediaType={uploadType}
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
