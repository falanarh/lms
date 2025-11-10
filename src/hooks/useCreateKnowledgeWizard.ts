/**
 * Enhanced Create Knowledge Wizard Hook
 *
 * Optimized state management with TanStack Form integration
 * Declarative validation with Zod schemas
 * Improved performance and maintainability
 */

import { useState, useCallback, useMemo } from 'react';
import { useForm } from '@tanstack/react-form';
import { CreateKnowledgeFormData, FormErrors } from '@/types/knowledge-center';
import { getStepValidator, completeFormSchema } from '@/lib/validation/schemas';
import { generateFilePreview } from '@/lib/validation/form-utils';

const initialFormData: CreateKnowledgeFormData = {
  type: undefined,
  createdBy: 'b157852b-82ff-40ed-abf8-2f8fe26377aa',
  idSubject: '',
  title: '',
  description: '',
  penyelenggara: '',
  thumbnail: undefined,
  isFinal: false,
  publishedAt: '',
  webinar: {},
  knowledgeContent: {},
  tags: [],
  status: 'draft',
};

export const useCreateKnowledgeWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [currentTagInput, setCurrentTagInput] = useState('');

  // Enhanced TanStack Form implementation
  const form = useForm({
    defaultValues: initialFormData,
    validators: {
      onChange: ({ value }) => {
        // Step-based validation on change
        const validator = getStepValidator(currentStep, (value as any).type);
        const result = validator.safeParse(value);
        return result.success ? undefined : result.error.errors[0]?.message;
      },
      onSubmit: ({ value }) => {
        // Complete form validation on submit
        const result = completeFormSchema.safeParse(value);
        return result.success ? undefined : result.error.errors[0]?.message;
      }
    },
    onSubmit: async ({ value }) => {
      // Form submission handled by parent component
      console.log('Form submitted with data:', value);
    },
  });

  // Dynamic form field management with proper typing
  const updateFormData = useCallback((field: keyof CreateKnowledgeFormData, value: unknown) => {
    form.setFieldValue(field, value);
  }, [form]);

  // Optimized field-specific update functions
  const updateField = useCallback(<T extends keyof CreateKnowledgeFormData>(
    field: T,
    value: CreateKnowledgeFormData[T]
  ) => {
    form.setFieldValue(field, value);
  }, [form]);

  // Enhanced thumbnail handling with proper error management
  const handleThumbnailSelect = useCallback(async (file: File) => {
    try {
      updateField('thumbnail', file);

      // Generate preview with utility function
      const preview = await generateFilePreview(file);
      setThumbnailPreview(preview);

      console.log('🖼️ Thumbnail preview created successfully');
    } catch (error) {
      console.error('Failed to generate thumbnail preview:', error);
      // Optionally show error toast
    }
  }, [updateField]);

  const handleThumbnailRemove = useCallback(() => {
    updateField('thumbnail', undefined);
    setThumbnailPreview(null);
  }, [updateField]);

  const updateCurrentTagInput = useCallback((value: string) => {
    setCurrentTagInput(value);
  }, []);

  // Enhanced tag management with form state access
  const currentTags = form.getFieldValue('tags') || [];

  const handleAddTag = useCallback(() => {
    const trimmedTag = currentTagInput.trim();
    if (trimmedTag && !currentTags.includes(trimmedTag)) {
      const updatedTags = [...currentTags, trimmedTag];
      updateField('tags', updatedTags);
      setCurrentTagInput('');
    }
  }, [currentTagInput, currentTags, updateField]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
    updateField('tags', updatedTags);
  }, [currentTags, updateField]);

  // Enhanced step navigation with validation
  const nextStep = useCallback(async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback(async (step: number) => {
    if (step > currentStep) {
      // Only validate if moving forward
      const isValid = await validateStep(currentStep);
      if (!isValid) return;
    }
    setCurrentStep(Math.max(1, Math.min(step, 4)));
  }, [currentStep]);

  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    form.reset();
    setThumbnailPreview(null);
    setCurrentTagInput('');
  }, [form]);

  // Enhanced step validation using Zod schemas
  const validateStep = useCallback(async (step: number): Promise<boolean> => {
    try {
      const currentValues = form.state.values as CreateKnowledgeFormData;
      const validator = getStepValidator(step, currentValues.type);
      const result = validator.safeParse(currentValues);

      if (!result.success) {
        // Set field errors for failed validations
        result.error.errors.forEach(error => {
          const fieldPath = error.path.join('.');
          // TanStack Form handles error display automatically
          console.log(`Validation error at ${fieldPath}: ${error.message}`);
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  }, [form]);

  const canProceedToNext = useCallback(async () => {
    return await validateStep(currentStep);
  }, [currentStep, validateStep]);

  // Computed form values for performance optimization
  const formValues = useMemo(() => form.state.values as CreateKnowledgeFormData, [form.state.values]);
  const formErrors = useMemo(() => {
    const errors: FormErrors = {};
    // Simplified error handling since meta structure might be different
    if (form.state.errors) {
      Object.entries(form.state.errors).forEach(([field, errorList]) => {
        if (Array.isArray(errorList) && errorList.length > 0) {
          errors[field] = errorList.join(', ');
        }
      });
    }
    return errors;
  }, [form.state.errors]);

  // Enhanced form interface with new architecture
  const formInterface = {
    // Core form instance
    form,

    // Computed values
    formData: formValues,
    errors: formErrors,

    // UI state
    thumbnailPreview,
    currentTagInput,

    // Action methods
    updateFormData,
    updateField,
    handleThumbnailSelect,
    handleThumbnailRemove,
    setCurrentTagInput: updateCurrentTagInput,
    handleAddTag,
    handleRemoveTag,
  };

  return {
    currentStep,
    form: formInterface,
    nextStep,
    prevStep,
    goToStep,
    resetWizard,
    validateStep,
    canProceedToNext,

    // Direct form access for advanced usage
    formInstance: form,

    // Computed values for performance
    isValid: Object.keys(formErrors).length === 0,
    currentValues: formValues,
  };
};

export type UseCreateKnowledgeWizardReturn = ReturnType<typeof useCreateKnowledgeWizard>;
