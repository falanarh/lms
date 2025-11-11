/**
 * Knowledge Center Wizard Form Hook - Best Practice Implementation
 *
 * Clean architecture with TanStack Form v1.23.8 best practices:
 * - Native Zod integration for type-safe validation
 * - Efficient state management without redundancy
 * - Progressive validation per wizard step
 * - Optimized performance with proper memoization
 */

import { useState, useCallback, useMemo } from 'react';
import { useForm } from '@tanstack/react-form';
import type { CreateKnowledgeFormData } from '@/types/knowledge-center';
import { KNOWLEDGE_TYPES } from '@/types/knowledge-center';
import {
  webinarDetailsSchema,
  contentDetailsWithMediaSchema,
  completeFormSchema,
  getStepSchema,
} from '@/lib/validation/knowledge-schemas';

// ============================================================================
// Initial Form State
// ============================================================================

const getInitialFormValues = (): CreateKnowledgeFormData => ({
  type: undefined,
  createdBy: crypto.randomUUID(),
  idSubject: '',
  title: '',
  description: '',
  penyelenggara: '',
  thumbnail: '',
  isFinal: false,
  publishedAt: new Date().toISOString().slice(0, 16), // Default to current datetime
  webinar: {
    jpCount: undefined, 
    zoomDate: undefined,
    zoomLink: undefined,
    recordLink: undefined,
    youtubeLink: undefined,
    vbLink: undefined,
    noteFile: undefined,
    contentText: undefined,
  },
  knowledgeContent: {
    contentType: undefined,
    mediaUrl: undefined,
    document: undefined,
  },
  tags: [],
  status: 'draft',
});

// ============================================================================
// Main Hook
// ============================================================================

export const useKnowledgeWizardForm = () => {
  // ============================================================================
  // Wizard State
  // ============================================================================

  const [currentStep, setCurrentStep] = useState(1);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [currentTagInput, setCurrentTagInput] = useState('');

  // ============================================================================
  // TanStack Form with Native Zod Integration
  // ============================================================================

  const form = useForm({
    defaultValues: getInitialFormValues(),
    validators: {
      // Form-level validation on submit using complete schema
      onSubmit: ({ value }) => {
        const result = completeFormSchema.safeParse(value);
        if (!result.success) {
          // Return first error for form-level display
          return result.error.errors[0]?.message || 'Validation failed';
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      // Form submission is handled by parent component
      console.log('✅ Form validation passed:', value);
    },
  }) as any;

  // ============================================================================
  // Form Values Access - Memoized for Performance
  // ============================================================================

  const formValues = useMemo(
    () => form.state.values,
    [form.state.values]
  );

  const currentType = formValues.type;

  // ============================================================================
  // Thumbnail Management
  // ============================================================================

  const handleThumbnailSelect = useCallback(
    async (file: File) => {
      try {
        // Update form value
        form.setFieldValue('thumbnail' as any, file as any);

        // Generate preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setThumbnailPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Failed to process thumbnail:', error);
      }
    },
    [form]
  );

  const handleThumbnailRemove = useCallback(() => {
    form.setFieldValue('thumbnail' as any, undefined as any);
    setThumbnailPreview(null);
  }, [form]);

  // ============================================================================
  // Tag Management
  // ============================================================================

  const currentTags = useMemo(
    () => formValues.tags || [],
    [formValues.tags]
  );

  const handleAddTag = useCallback(() => {
    const trimmedTag = currentTagInput.trim();
    if (trimmedTag && !currentTags.includes(trimmedTag)) {
      form.setFieldValue('tags' as any, [...currentTags, trimmedTag] as any);
      setCurrentTagInput('');
    }
  }, [currentTagInput, currentTags, form]);

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      const updatedTags = currentTags.filter((tag: string) => tag !== tagToRemove);
      form.setFieldValue('tags' as any, updatedTags as any);
    },
    [currentTags, form]
  );

  // ============================================================================
  // Step Validation - Progressive with Zod Schemas
  // ============================================================================

  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    try {
      const currentValues = form.state.values;
      const schema = getStepSchema(currentStep, currentValues.type);

      // Step 1: Content Type - Simple check
      if (currentStep === 1) {
        if (!currentValues.type) {
          console.error('❌ Step 1: Please select a content type');
          return false;
        }
        return true;
      }

      // Step 2: Basic Info - Declarative validation with schema
      if (currentStep === 2) {
        // First, trigger validation on all required fields to show errors in UI
        const requiredFields = ['title', 'description', 'idSubject', 'penyelenggara', 'createdBy', 'publishedAt', 'thumbnail'];
        
        // Trigger validation for each field
        for (const fieldName of requiredFields) {
          await form.validateField(fieldName as any, 'blur');
        }

        // Then validate with schema
        const result = schema.safeParse(currentValues);
        if (!result.success) {
          console.error('❌ Step 2 validation failed:', result.error.errors);
          // Set field errors declaratively
          result.error.errors.forEach((error) => {
            const fieldPath = error.path.join('.');
            form.setFieldMeta(fieldPath as any, (prev: any) => ({
              ...prev,
              errors: [error.message],
            }));
          });
          return false;
        }
        return true;
      }

      // Step 3: Content Details - Declarative validation
      if (currentStep === 3) {
        if (currentType === KNOWLEDGE_TYPES.WEBINAR) {
          // Trigger validation on webinar fields first
          const webinarFields = ['webinar.zoomDate', 'webinar.jpCount', 'webinar.zoomLink'];
          for (const fieldName of webinarFields) {
            await form.validateField(fieldName as any, 'blur');
          }

          const result = webinarDetailsSchema.safeParse(currentValues.webinar);
          if (!result.success) {
            console.error('❌ Webinar validation failed:', result.error.errors);
            result.error.errors.forEach((error) => {
              const fieldPath = 'webinar.' + error.path.join('.');
              form.setFieldMeta(fieldPath as any, (prev: any) => ({
                ...prev,
                errors: [error.message],
              }));
            });
            return false;
          }
        } else if (currentType === KNOWLEDGE_TYPES.CONTENT) {
          // Check content type exists
          const contentType = currentValues.knowledgeContent?.contentType;
          if (!contentType || contentType === '' || contentType === 'undefined') {
            console.error('❌ Content type is missing or invalid:', contentType);
            // Trigger validation to show error in UI
            await form.validateField('knowledgeContent.contentType' as any, 'blur');
            form.setFieldMeta('knowledgeContent.contentType' as any, (prev: any) => ({
              ...prev,
              errors: ['Please select a content type'],
            }));
            return false;
          }

          // Trigger validation on content fields
          const contentFields = ['knowledgeContent.document'];
          if (contentType !== 'article') {
            contentFields.push('knowledgeContent.mediaUrl');
          }
          for (const fieldName of contentFields) {
            await form.validateField(fieldName as any, 'blur');
          }

          // Validate with schema
          const result = contentDetailsWithMediaSchema.safeParse(currentValues.knowledgeContent);
          if (!result.success) {
            console.error('❌ Content validation failed:', result.error.errors);
            result.error.errors.forEach((error) => {
              const fieldPath = 'knowledgeContent.' + error.path.join('.');
              form.setFieldMeta(fieldPath as any, (prev: any) => ({
                ...prev,
                errors: [error.message],
              }));
            });
            return false;
          }
        }
        return true;
      }

      // Step 4: Final validation
      const result = schema.safeParse(currentValues);
      if (!result.success) {
        console.error(`❌ Step ${currentStep} validation failed:`, result.error.errors);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Validation error:', error);
      return false;
    }
  }, [currentStep, currentType, form]);

  // ============================================================================
  // Step Navigation
  // ============================================================================

  const nextStep = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  }, [validateCurrentStep]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback(
    async (targetStep: number) => {
      // Validate current step if moving forward
      if (targetStep > currentStep) {
        const isValid = await validateCurrentStep();
        if (!isValid) return;
      }

      setCurrentStep(Math.max(1, Math.min(targetStep, 4)));
    },
    [currentStep, validateCurrentStep]
  );

  // ============================================================================
  // Form Reset
  // ============================================================================

  const resetForm = useCallback(() => {
    form.reset();
    setCurrentStep(1);
    setThumbnailPreview(null);
    setCurrentTagInput('');
  }, [form]);

  // ============================================================================
  // Field Update Helper
  // ============================================================================

  const updateField = useCallback(
    <K extends keyof CreateKnowledgeFormData>(
      field: K,
      value: CreateKnowledgeFormData[K]
    ) => {
      form.setFieldValue(field as any, value as any);
    },
    [form]
  );

  // ============================================================================
  // Return API
  // ============================================================================

  return {
    // Form instance
    form,

    // Wizard state
    currentStep,
    currentType,

    // Form values
    formValues,

    // Thumbnail state
    thumbnailPreview,
    handleThumbnailSelect,
    handleThumbnailRemove,

    // Tag management
    currentTags,
    currentTagInput,
    setCurrentTagInput,
    handleAddTag,
    handleRemoveTag,

    // Step navigation
    nextStep,
    prevStep,
    goToStep,
    validateCurrentStep,

    // Utilities
    updateField,
    resetForm,

    // Validation state
    isValid: form.state.isValid,
    isSubmitting: form.state.isSubmitting,
    canSubmit: form.state.canSubmit,
  };
};

// ============================================================================
// Type Export
// ============================================================================

export type UseKnowledgeWizardFormReturn = ReturnType<typeof useKnowledgeWizardForm>;
