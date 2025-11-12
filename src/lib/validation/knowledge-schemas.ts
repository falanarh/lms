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

const optionalUrl = z
  .string()
  .url('Please enter a valid URL')
  .or(z.literal(''))
  .optional();

// ============================================================================
// File Validators
// ============================================================================

export const imageFileValidator = z
  .instanceof(File, { message: 'Please select a thumbnail image file' })
  .refine((file) => file.size <= 20 * 1024 * 1024, 'Thumbnail image file size must be less than 20MB');
  // .refine(
  //   (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
  //   'Only JPEG, PNG, and WebP images are allowed'
  // );

export const pdfFileValidator = z
  .instanceof(File, { message: 'Please select a PDF document' })
  .refine((file) => file.size <= 10 * 1024 * 1024, 'PDF file size must be less than 10MB')
  .refine((file) => file.type === 'application/pdf', 'Only PDF format is allowed');

export const thumbnailValidator = z.union(
  [imageFileValidator, z.string().url().min(1, 'Please upload a thumbnail image')],
  { required_error: 'Please upload a thumbnail image' }
);

// ============================================================================
// Step 1: Content Type Selection Schema
// ============================================================================

export const contentTypeSchema = z.object({
  type: z.enum([KNOWLEDGE_TYPES.WEBINAR, KNOWLEDGE_TYPES.CONTENT], {
    required_error: 'Please select whether you want to create a Webinar or Content',
    invalid_type_error: 'Invalid content type selected',
  }),
});

// ============================================================================
// Step 2: Basic Information Schema
// ============================================================================

export const basicInfoSchema = z.object({
  title: z
    .string()
    .min(3, 'Please enter a title with at least 3 characters')
    .max(100, 'Title is too long (maximum 100 characters)'),
  description: z
    .string()
    .min(10, 'Please provide a description with at least 10 characters')
    .max(1000, 'Description is too long (maximum 1000 characters)'),
  idSubject: z.string().min(1, 'Please select a subject category'),
  penyelenggara: z.string().min(1, 'Please select an organizer'),
  createdBy: z.string().min(1, 'Please enter the author name'),
  publishedAt: z.string().min(1, 'Please select a published date and time'),
  thumbnail: thumbnailValidator,
  tags: z.array(z.string()).min(1, 'Please add at least one tag'),
});

// ============================================================================
// Step 3A: Webinar Details Schema
// ============================================================================

export const webinarDetailsSchema = z.object({
  zoomDate: z.string({
    required_error: 'Please select webinar date and time',
    invalid_type_error: 'Invalid date format',
  }).min(1, 'Please select webinar date and time'),
  zoomLink: z.string({
    required_error: 'Please enter the Zoom meeting link',
    invalid_type_error: 'Invalid URL format',
  }).url('Please enter a valid Zoom meeting URL').min(1, 'Zoom link is required for participants to join the webinar'),
  recordLink: z.string().url('Please enter a valid recording URL').min(1, 'Recording link is required'),
  youtubeLink: optionalUrl,
  vbLink: optionalUrl,
  contentText: z.union([pdfFileValidator, z.string()]).optional(),
  jpCount: z.number({
    required_error: 'Please enter JP credits',
    invalid_type_error: 'JP credits must be a number'
  }).int('JP credits must be a whole number').min(0, 'JP credits cannot be negative').default(0),
});

// ============================================================================
// Step 3B: Content Details Schema
// ============================================================================

export const contentTypeEnumSchema = z.enum(
  [CONTENT_TYPES.ARTICLE, CONTENT_TYPES.VIDEO, CONTENT_TYPES.PODCAST, CONTENT_TYPES.FILE],
  { required_error: 'Please select a content type (Article, Video, Podcast, or PDF)' }
);

export const contentDetailsSchema = z.object({
  contentType: contentTypeEnumSchema,
  mediaUrl: z.string().optional(),
  document: z.string().optional(),
});

// Field-level validators for webinar details
// Custom validator function for JP Count (compatible with TanStack Form)
export const jpCountValidator = {
  validate: (value: any) => {
    // Allow 0 as valid value
    if (value === 0) {
      return undefined;
    }

    // Handle empty string (user cleared the input)
    if (value === '') {
      return 'Please enter JP credits';
    }

    // Handle null or undefined
    if (value === null || value === undefined) {
      return 'Please enter JP credits';
    }

    // Convert to number if it's a string
    const num = typeof value === 'string' ? Number(value) : value;

    // Check if it's a valid number
    if (isNaN(num)) {
      return 'Please enter a valid number for JP credits';
    }

    // Check if negative
    if (num < 0) {
      return 'JP credits cannot be negative';
    }

    // Check if integer
    if (!Number.isInteger(num)) {
      return 'JP credits must be a whole number';
    }

    // Valid
    return undefined;
  }
};

// Field-level validators for content details
export const mediaUrlValidator = z.string().min(1, 'Please upload a media file (video, audio, or PDF)');
export const documentValidator = z.string().min(1, 'Please add content using the rich text editor below');

// Media URL is required for non-article content types
export const contentDetailsWithMediaSchema = contentDetailsSchema.refine(
  (data) => {
    if (data.contentType === CONTENT_TYPES.ARTICLE) {
      return true; // Article doesn't need media URL
    }
    return !!data.mediaUrl && data.mediaUrl.length > 0;
  },
  {
    message: 'Please upload a media file for this content type',
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
