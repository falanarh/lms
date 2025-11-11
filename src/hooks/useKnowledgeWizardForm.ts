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
  thumbnail: undefined,
  isFinal: false,
  publishedAt: new Date().toISOString().slice(0, 16), // Default to current datetime
  webinar: {},
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
      const updatedTags = currentTags.filter((tag) => tag !== tagToRemove);
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

      // Step 1: Content Type
      if (currentStep === 1) {
        if (!currentValues.type) {
          console.error('❌ Step 1: Please select a content type');
          return false;
        }
        return true;
      }

      // Step 2: Basic Info - Trigger field validations
      if (currentStep === 2) {
        // Trigger validation for all required fields
        const fields = ['title', 'description', 'idSubject', 'penyelenggara', 'createdBy', 'publishedAt', 'thumbnail'];

        for (const fieldName of fields) {
          await form.validateField(fieldName as any, 'change');
        }

        // Check if there are any errors
        const hasErrors = fields.some(fieldName => {
          const fieldState = form.getFieldMeta(fieldName as any);
          return fieldState?.errors && fieldState.errors.length > 0;
        });

        if (hasErrors) {
          console.error('❌ Step 2: Please fill in all required fields');
          return false;
        }

        // Also validate with schema
        const result = schema.safeParse(currentValues);
        if (!result.success) {
          console.error('❌ Step 2 validation failed:', result.error.errors);

          // Set field errors
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

      // Step 3: Content Details
      if (currentStep === 3) {
        if (currentType === KNOWLEDGE_TYPES.WEBINAR) {
          // Validate webinar details
          const result = webinarDetailsSchema.safeParse(currentValues.webinar);
          if (!result.success) {
            console.error('❌ Webinar validation failed:', result.error.errors);

            // Set field errors for webinar fields
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
          // Validate content details - use the complete form validation instead
          console.log('🔍 Validating content details:', currentValues.knowledgeContent);
          console.log('📋 Current full form values:', currentValues);

          // Check if knowledgeContent exists and has contentType
          console.log('🔍 Deep check - knowledgeContent:', currentValues.knowledgeContent);
          console.log('🔍 Deep check - contentType:', currentValues.knowledgeContent?.contentType);
          console.log('🔍 Deep check - contentType type:', typeof currentValues.knowledgeContent?.contentType);

          // More robust check - handle both undefined and empty string
          const contentType = currentValues.knowledgeContent?.contentType;
          const hasValidContentType = contentType && contentType !== '' && contentType !== 'undefined';

          if (!hasValidContentType) {
            console.error('❌ Content type is missing or invalid:', contentType);
            // Set error on the contentType field
            form.setFieldMeta('knowledgeContent.contentType' as any, (prev: any) => ({
              ...prev,
              errors: ['Please select a content type'],
            }));
            return false;
          }

          // Validate with proper content schema
          const result = contentDetailsWithMediaSchema.safeParse(
            currentValues.knowledgeContent
          );
          if (!result.success) {
            console.error('❌ Content validation failed:', result.error.errors);

            // Set field errors for content fields
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
