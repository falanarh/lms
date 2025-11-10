/**
 * Optimized Knowledge Center Form Validation Schemas
 *
 * Clean, type-safe validation using Zod with TanStack Form native integration
 * Best practices: declarative schemas, proper error messages, type inference
 */

import { z } from 'zod';
import { KNOWLEDGE_TYPES, CONTENT_TYPES } from '@/types/knowledge-center';

// ============================================================================
// Base Validators - Reusable validation rules
// ============================================================================

const requiredString = (fieldName: string) =>
  z.string().min(1, `${fieldName} is required`);

const optionalUrl = z
  .string()
  .url('Please enter a valid URL')
  .or(z.literal(''))
  .optional();

const requiredUrl = z.string().url('Please enter a valid URL').min(1, 'URL is required');

// ============================================================================
// File Validators
// ============================================================================

export const imageFileValidator = z
  .instanceof(File, { message: 'Please select an image file' })
  .refine((file) => file.size <= 20 * 1024 * 1024, 'Image must be less than 20MB')
  .refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    'Only JPEG, PNG, and WebP images are allowed'
  );

export const pdfFileValidator = z
  .instanceof(File, { message: 'Please select a PDF file' })
  .refine((file) => file.size <= 10 * 1024 * 1024, 'PDF must be less than 10MB')
  .refine((file) => file.type === 'application/pdf', 'Only PDF files are allowed');

export const thumbnailValidator = z.union(
  [imageFileValidator, z.string().url().min(1, 'Thumbnail is required')],
  { required_error: 'Thumbnail is required' }
);

// ============================================================================
// Step 1: Content Type Selection Schema
// ============================================================================

export const contentTypeSchema = z.object({
  type: z.enum([KNOWLEDGE_TYPES.WEBINAR, KNOWLEDGE_TYPES.CONTENT], {
    required_error: 'Please select a content type',
    invalid_type_error: 'Invalid content type',
  }),
});

// ============================================================================
// Step 2: Basic Information Schema
// ============================================================================

export const basicInfoSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  idSubject: requiredString('Subject'),
  penyelenggara: requiredString('Organizer'),
  createdBy: requiredString('Author'),
  publishedAt: z.string().min(1, 'Published date is required'),
  thumbnail: thumbnailValidator,
  tags: z.array(z.string()).optional().default([]),
});

// ============================================================================
// Step 3A: Webinar Details Schema
// ============================================================================

export const webinarDetailsSchema = z.object({
  zoomDate: z.string().min(1, 'Webinar date is required'),
  zoomLink: requiredUrl,
  recordLink: requiredUrl,
  youtubeLink: optionalUrl,
  vbLink: optionalUrl,
  contentText: z.union([pdfFileValidator, z.string()]).optional(),
  jpCount: z.number().int().min(0, 'JP credits must be a positive number').default(0),
});

// ============================================================================
// Step 3B: Content Details Schema
// ============================================================================

export const contentTypeEnumSchema = z.enum(
  [CONTENT_TYPES.ARTICLE, CONTENT_TYPES.VIDEO, CONTENT_TYPES.PODCAST, CONTENT_TYPES.FILE],
  { required_error: 'Please select a content type' }
);

export const contentDetailsSchema = z.object({
  contentType: contentTypeEnumSchema,
  mediaUrl: z.string().optional(),
  document: z.string().optional(),
});

// Media URL is required for non-article content types
export const contentDetailsWithMediaSchema = contentDetailsSchema.refine(
  (data) => {
    if (data.contentType === CONTENT_TYPES.ARTICLE) {
      return true; // Article doesn't need media URL
    }
    return !!data.mediaUrl && data.mediaUrl.length > 0;
  },
  {
    message: 'Media file is required for this content type',
    path: ['mediaUrl'],
  }
);

// ============================================================================
// Complete Form Schemas - Discriminated Union for Type Safety
// ============================================================================

export const webinarFormSchema = contentTypeSchema
  .extend(basicInfoSchema.shape)
  .extend({
    type: z.literal(KNOWLEDGE_TYPES.WEBINAR),
    webinar: webinarDetailsSchema,
    knowledgeContent: z.object({}).optional(),
  });

export const contentFormSchema = contentTypeSchema
  .extend(basicInfoSchema.shape)
  .extend({
    type: z.literal(KNOWLEDGE_TYPES.CONTENT),
    knowledgeContent: contentDetailsWithMediaSchema,
    webinar: z.object({}).optional(),
  });

export const completeFormSchema = z.discriminatedUnion('type', [
  webinarFormSchema,
  contentFormSchema,
]);

// ============================================================================
// Step Validators - Progressive Validation
// ============================================================================

export const getStepSchema = (step: number, type?: string) => {
  switch (step) {
    case 1:
      return contentTypeSchema;
    case 2:
      return basicInfoSchema;
    case 3:
      if (type === KNOWLEDGE_TYPES.WEBINAR) {
        return webinarDetailsSchema;
      } else if (type === KNOWLEDGE_TYPES.CONTENT) {
        return contentDetailsWithMediaSchema;
      }
      return z.object({});
    case 4:
      return completeFormSchema;
    default:
      return z.object({});
  }
};

// ============================================================================
// Type Inference
// ============================================================================

export type ContentTypeFormData = z.infer<typeof contentTypeSchema>;
export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type WebinarDetailsFormData = z.infer<typeof webinarDetailsSchema>;
export type ContentDetailsFormData = z.infer<typeof contentDetailsWithMediaSchema>;
export type CompleteFormData = z.infer<typeof completeFormSchema>;
export type WebinarFormData = z.infer<typeof webinarFormSchema>;
export type ContentFormData = z.infer<typeof contentFormSchema>;
