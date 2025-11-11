/**
 * Content Details Form - Refactored with Sub-components
 *
 * This component has been split into smaller, focused components:
 * - WebinarDetailsForm: Handles webinar-specific fields
 * - GeneralContentForm: Handles article/video/podcast/PDF content
 * - ContentTypeSelector: Content type selection UI
 * - ContentTypeHeader: Selected content type display
 * - MediaUploadField: Media file upload handling
 *
 * Benefits:
 * - Easier to read and maintain
 * - Better separation of concerns
 * - Reusable sub-components
 * - Cleaner code organization
 */

'use client';

import React from 'react';
import type { UseKnowledgeWizardFormReturn } from '@/hooks/useKnowledgeWizardForm';
import { KNOWLEDGE_TYPES } from '@/types/knowledge-center';
import { WebinarDetailsForm, GeneralContentForm } from './content-details';

// ============================================================================
// Types
// ============================================================================

export interface UploadHandlers {
  onMedia?: (file: File, type: 'video' | 'audio' | 'pdf') => Promise<void>;
  onPDF?: (file: File) => Promise<void>;
  isUploadingMedia?: boolean;
  isUploadingPDF?: boolean;
}

export interface ContentDetailsFormProps {
  wizard: UseKnowledgeWizardFormReturn;
  uploadHandlers?: UploadHandlers;
}

// ============================================================================
// Component
// ============================================================================

export default function ContentDetailsForm({
  wizard,
  uploadHandlers,
}: ContentDetailsFormProps) {
  const { currentType } = wizard;

  const isWebinar = currentType === KNOWLEDGE_TYPES.WEBINAR;
  const isContent = currentType === KNOWLEDGE_TYPES.CONTENT;

  // Render webinar form
  if (isWebinar) {
    return (
      <WebinarDetailsForm
        form={wizard.form}
        formValues={wizard.formValues}
        onPDFUpload={uploadHandlers?.onPDF}
        isUploadingPDF={uploadHandlers?.isUploadingPDF}
      />
    );
  }

  // Render general content form
  if (isContent) {
    return (
      <GeneralContentForm
        wizard={wizard}
        onMediaUpload={uploadHandlers?.onMedia}
        isUploadingMedia={uploadHandlers?.isUploadingMedia}
      />
    );
  }

  return null;
}
