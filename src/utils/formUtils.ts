import { useState } from "react";

export interface TopicFormData {
  title: string;
  content: string;
}

export interface FormErrors {
  title?: string;
  content?: string;
}

/**
 * Utility functions untuk form management.
 * Bukan hook, murni utility functions yang reusable.
 */
export function createFormState<T extends Record<string, any>>(initialState: T) {
  const [formData, setFormData] = useState<T>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const updateField = (field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const setFieldErrors = (newErrors: Partial<Record<keyof T, string>>) => {
    setErrors(newErrors);
  };

  const clearErrors = () => setErrors({});
  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
  };

  return {
    formData,
    errors,
    updateField,
    setFieldErrors,
    clearErrors,
    resetForm,
  };
}

/**
 * Validation utilities untuk topic form
 */
export const topicFormValidation = {
  validateForm: (data: TopicFormData): FormErrors => {
    const newErrors: FormErrors = {};

    if (!data.title.trim()) {
      newErrors.title = "Judul topik tidak boleh kosong";
    } else if (data.title.trim().length < 3) {
      newErrors.title = "Judul topik terlalu pendek. Minimal 3 karakter diperlukan";
    }

    if (!data.content.trim()) {
      newErrors.content = "Konten topik tidak boleh kosong";
    } else if (data.content.trim().length < 10) {
      newErrors.content = "Konten topik terlalu pendek. Minimal 10 karakter diperlukan";
    }

    return newErrors;
  },

  isValid: (data: TopicFormData): boolean => {
    return Object.keys(topicFormValidation.validateForm(data)).length === 0;
  },
};

/**
 * Topic form state creator
 */
export function createTopicFormState() {
  const formState = createFormState<TopicFormData>({ title: "", content: "" });
  const [isExpanded, setIsExpanded] = useState(false);

  const validateForm = () => {
    const newErrors = topicFormValidation.validateForm(formState.formData);
    formState.setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    formState.resetForm();
    setIsExpanded(false);
  };

  const expandForm = () => setIsExpanded(true);
  const collapseForm = () => {
    formState.clearErrors();
    setIsExpanded(false);
  };

  return {
    ...formState,
    isExpanded,
    isValid: topicFormValidation.isValid(formState.formData),
    validateForm,
    resetForm,
    expandForm,
    collapseForm,
  };
}

export type TopicFormState = ReturnType<typeof createTopicFormState>;
