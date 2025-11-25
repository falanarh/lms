/**
 * Knowledge Center Data Transformation Utilities
 * 
 * Clean separation of business logic from UI logic
 * Handles transformation between form data and API payload
 */

import type { CreateKnowledgeFormData } from '@/types/knowledge-center';
import type { CreateKnowledgeCenterRequest } from '@/types/knowledge-center';
import { KNOWLEDGE_TYPES, CONTENT_TYPES } from '@/types/knowledge-center';
import { encodeMediaUrl } from '@/utils/urlUtils';

/**
 * Transform form data to API payload
 * Handles all the business logic for data transformation
 */
export const transformFormDataToAPI = (
  formValues: CreateKnowledgeFormData,
  status: 'draft' | 'published',
  thumbnailUrl: string
): CreateKnowledgeCenterRequest => {
  // Base payload - common fields
  const apiData: CreateKnowledgeCenterRequest = {
    createdBy: formValues.createdBy,
    idSubject: formValues.idSubject,
    title: formValues.title,
    description: formValues.description,
    type: formValues.type!,
    penyelenggara: formValues.penyelenggara,
    thumbnail: thumbnailUrl,
    isFinal: status === 'published',
    // Konversi nilai datetime-local (YYYY-MM-DDTHH:MM) menjadi ISO string penuh untuk API
    publishedAt: formValues.publishedAt
      ? new Date(formValues.publishedAt).toISOString()
      : new Date().toISOString(),
    tags: formValues.tags,
  };

  // Add webinar-specific data - match KnowledgeWebinar type 100%
  // Sanitize all URL fields to handle special characters like spaces
  if (formValues.type === KNOWLEDGE_TYPES.WEBINAR && formValues.webinar) {
    apiData.webinar = {
      zoomDate: formValues.webinar.zoomDate || new Date().toISOString(),
      zoomLink: encodeMediaUrl(formValues.webinar.zoomLink) || 'https://zoom.us',
      recordLink: formValues.webinar.recordLink ? encodeMediaUrl(formValues.webinar.recordLink) : undefined,
      jpCount: formValues.webinar.jpCount || 0,
      youtubeLink: formValues.webinar.youtubeLink ? encodeMediaUrl(formValues.webinar.youtubeLink) : undefined,
      vbLink: formValues.webinar.vbLink ? encodeMediaUrl(formValues.webinar.vbLink) : undefined,
      noteFile: typeof formValues.webinar.noteFile === 'string' && formValues.webinar.noteFile ? encodeMediaUrl(formValues.webinar.noteFile) : undefined,
      contentText: formValues.webinar.contentText || undefined,
    };
  }

  // Add content-specific data
  // Sanitize mediaUrl to handle special characters like spaces
  if (formValues.type === KNOWLEDGE_TYPES.CONTENT && formValues.knowledgeContent) {
    const contentType = formValues.knowledgeContent.contentType || CONTENT_TYPES.ARTICLE;

    apiData.knowledgeContent = {
      contentType,
      document: formValues.knowledgeContent.document || '',
    };

    // Only include mediaUrl for non-article content types
    // Encode the URL to handle special characters
    if (contentType !== CONTENT_TYPES.ARTICLE) {
      const rawMediaUrl = formValues.knowledgeContent.mediaUrl || '';
      apiData.knowledgeContent.mediaUrl = (typeof rawMediaUrl === 'string' && rawMediaUrl) ? encodeMediaUrl(rawMediaUrl) : '';
    }
  }

  return apiData;
};

/**
 * Validate form data before submission
 * Returns error message if validation fails, undefined if valid
 */
export const validateFormDataForSubmission = (
  formValues: CreateKnowledgeFormData
): string | undefined => {
  if (!formValues.type) {
    return 'Please select a content type first!';
  }

  if (!formValues.idSubject) {
    return 'Please select a subject first!';
  }

  return undefined;
};

/**
 * Get default thumbnail URL
 */
export const getDefaultThumbnailUrl = (): string => {
  return 'https://via.placeholder.com/300x200';
};
