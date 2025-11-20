/**
 * Form Validation Schemas for Knowledge Center
 *
 * Uses Zod for declarative, type-safe validation
 * Optimized for step-by-step form validation
 */

import { z } from 'zod';
import { KNOWLEDGE_TYPES, CONTENT_TYPES, type KnowledgeType } from '@/types/knowledge-center';

// Base validation schemas
const dateSchema = z.string().min(1, 'This field is required');
const urlSchema = z.string().url('Please enter a valid URL');
const stringSchema = z.string().min(1, 'This field is required');
const optionalUrlSchema = z
  .string()
  .url('Please enter a valid URL')
  .or(z.literal(''))
  .or(z.null())
  .optional();

// File validation schemas
const imageFileSchema = z.instanceof(File, {
  message: 'Please select an image file',
}).refine(
  (file) => file.size <= 20 * 1024 * 1024, // 20MB
  { message: 'Image size must be less than 20MB' }
).refine(
  (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
  { message: 'Only JPEG, PNG, and WebP images are allowed' }
);

const pdfFileSchema = z.instanceof(File, {
  message: 'Please select a PDF file',
}).refine(
  (file) => file.size <= 10 * 1024 * 1024, // 10MB for PDF
  { message: 'PDF size must be less than 10MB' }
).refine(
  (file) => file.type === 'application/pdf',
  { message: 'Only PDF files are allowed' }
);

// Step 1: Content Type Selection
const contentTypeStepSchema = z.object({
  type: z.enum([KNOWLEDGE_TYPES.WEBINAR, KNOWLEDGE_TYPES.CONTENT]),
});

// Step 2: Basic Information
const basicInfoStepSchema = z.object({
  title: stringSchema.min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: stringSchema.min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  idSubject: stringSchema.min(1, 'Please select a subject'),
  penyelenggara: stringSchema.min(1, 'Please select an organizer'),
  createdBy: stringSchema,
  publishedAt: dateSchema,
  thumbnail: z.union([
    imageFileSchema,
    z.string().min(1, 'Thumbnail is required'),
  ]).refine((val) => val !== null && val !== undefined, 'Thumbnail is required'),
  tags: z.array(z.string()).optional(),
});

// Step 3A: Webinar Details
const webinarDetailsStepSchema = z.object({
  webinar: z.object({
    zoomDate: dateSchema.min(1, 'Webinar date is required'),
    zoomLink: urlSchema.min(1, 'Zoom link is required'),
    recordLink: urlSchema,
    youtubeLink: optionalUrlSchema,
    vbLink: optionalUrlSchema,
    contentText: z.union([pdfFileSchema, z.string(), z.null()]).optional(),
    jpCount: z.number().int().min(0, 'JP credits must be a positive number'),
  }).optional(),
});

// Step 3B: Content Details
const contentDetailsStepSchema = z.object({
  knowledgeContent: z.object({
    contentType: z.enum([
      CONTENT_TYPES.ARTICLE,
      CONTENT_TYPES.VIDEO,
      CONTENT_TYPES.PODCAST,
      CONTENT_TYPES.FILE,
    ]).refine((val) => val !== null && val !== undefined, 'Please select a content type'),
    mediaUrl: z.string().optional(),
    document: z.string().optional(),
  }).optional(),
});

// Complete form schema for final validation
const completeFormSchema = z.discriminatedUnion('type', [
  contentTypeStepSchema.extend(basicInfoStepSchema.shape).extend(webinarDetailsStepSchema.shape).extend({
    type: z.literal(KNOWLEDGE_TYPES.WEBINAR),
    webinar: webinarDetailsStepSchema.shape.webinar.unwrap(),
  }),
  contentTypeStepSchema.extend(basicInfoStepSchema.shape).extend(contentDetailsStepSchema.shape).extend({
    type: z.literal(KNOWLEDGE_TYPES.CONTENT),
    knowledgeContent: contentDetailsStepSchema.shape.knowledgeContent.unwrap(),
  }),
]);

// Step validators for progressive validation
export const stepValidators = {
  1: contentTypeStepSchema,
  2: basicInfoStepSchema,
  3: (type?: KnowledgeType) => {
    if (type === KNOWLEDGE_TYPES.WEBINAR) {
      return webinarDetailsStepSchema;
    } else if (type === KNOWLEDGE_TYPES.CONTENT) {
      return contentDetailsStepSchema;
    }
    return z.object({});
  },
  4: completeFormSchema,
} as const;

// Dynamic step validator function
export const getStepValidator = (step: number, type?: KnowledgeType) => {
  const validator = stepValidators[step as keyof typeof stepValidators];
  if (typeof validator === 'function') {
    return validator(type);
  }
  return validator;
};

// Field-level validators
export const fieldValidators = {
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  idSubject: z.string().min(1, 'Please select a subject'),
  penyelenggara: z.string().min(1, 'Please select an organizer'),
  zoomDate: dateSchema,
  zoomLink: urlSchema,
  recordLink: urlSchema,
  youtubeLink: optionalUrlSchema,
  vbLink: optionalUrlSchema,
  jpCount: z.number().int().min(0, 'JP credits must be a positive number'),
  contentType: z.enum([
    CONTENT_TYPES.ARTICLE,
    CONTENT_TYPES.VIDEO,
    CONTENT_TYPES.PODCAST,
    CONTENT_TYPES.FILE,
  ]),
} as const;

// Knowledge Subject schemas
export const createKnowledgeSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').min(2, 'Subject name must be at least 2 characters'),
  icon: z.string().min(1, 'Icon is required'),
});

export const updateKnowledgeSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').min(2, 'Subject name must be at least 2 characters').optional(),
  icon: z.string().min(1, 'Icon is required').optional(),
});

// Type inference for Knowledge Subject
export type CreateKnowledgeSubjectFormData = z.infer<typeof createKnowledgeSubjectSchema>;
export type UpdateKnowledgeSubjectFormData = z.infer<typeof updateKnowledgeSubjectSchema>;

// Error message formatter
export const formatZodError = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};

  error.issues.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });

  return errors;
};

// Type inference
export type ContentTypeStepFormData = z.infer<typeof contentTypeStepSchema>;
export type BasicInfoFormData = z.infer<typeof basicInfoStepSchema>;
export type WebinarDetailsFormData = z.infer<typeof webinarDetailsStepSchema>;
export type ContentDetailsFormData = z.infer<typeof contentDetailsStepSchema>;
export type CompleteFormData = z.infer<typeof completeFormSchema>;

// Export schemas for external use
export {
  contentTypeStepSchema,
  basicInfoStepSchema,
  webinarDetailsStepSchema,
  contentDetailsStepSchema,
  completeFormSchema,
};