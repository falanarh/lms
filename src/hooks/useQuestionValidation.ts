import { useState, useCallback } from 'react';
import { z } from 'zod';
import {
  QuizQuestionSchema,
  CreateQuestionRequestSchema,
  ImportQuestionSchema,
  AIGeneratedQuestionSchema,
  formatZodError
} from '@/schemas/question.schema';

interface UseQuestionValidationReturn<T> {
  validate: (data: unknown) => { success: true; data: T } | { success: false; errors: Record<string, string> };
  errors: Record<string, string>;
  clearErrors: () => void;
  hasErrors: boolean;
}

// Generic validation hook
export function useQuestionValidation<T>(
  schema: z.ZodSchema<T>
): UseQuestionValidationReturn<T> {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((data: unknown) => {
    try {
      const result = schema.parse(data);
      setErrors({});
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = formatZodError(error);
        setErrors(formattedErrors);
        return { success: false, errors: formattedErrors };
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
        setErrors({ general: errorMessage });
        return { success: false, errors: { general: errorMessage } };
      }
    }
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    validate,
    errors,
    clearErrors,
    hasErrors: Object.keys(errors).length > 0
  };
}

// Specific hooks for different validation scenarios
export function useQuizQuestionValidation() {
  return useQuestionValidation(QuizQuestionSchema);
}

export function useCreateQuestionValidation() {
  return useQuestionValidation(CreateQuestionRequestSchema);
}

export function useImportQuestionValidation() {
  return useQuestionValidation(ImportQuestionSchema);
}

export function useAIGeneratedQuestionValidation() {
  return useQuestionValidation(AIGeneratedQuestionSchema);
}

// Real-time validation helpers
export const validateQuestionField = (
  field: string,
  value: any,
  questionType?: string
): { isValid: boolean; error?: string } => {
  switch (field) {
    case 'questionText':
      if (!value || typeof value !== 'string' || value.trim().length === 0) {
        return { isValid: false, error: 'Question text is required' };
      }
      if (value.length > 2000) {
        return { isValid: false, error: 'Question text too long (max 2000 characters)' };
      }
      return { isValid: true };

    case 'questionType':
      if (!value || !['multiple_choice', 'essay', 'true_false'].includes(value)) {
        return { isValid: false, error: 'Please select a valid question type' };
      }
      return { isValid: true };

    case 'points': {
      const points = Number(value);
      if (!value || isNaN(points) || points < 1 || points > 100) {
        return { isValid: false, error: 'Points must be between 1 and 100' };
      }
      return { isValid: true };
    }

    case 'correctAnswer':
      if (questionType === 'multiple_choice' && (!value || value.trim() === '')) {
        return { isValid: false, error: 'Please select a correct answer' };
      }
      return { isValid: true };

    case 'options':
      if (questionType === 'multiple_choice') {
        if (!Array.isArray(value) || value.length < 2) {
          return { isValid: false, error: 'Multiple choice questions need at least 2 options' };
        }
        if (value.length > 6) {
          return { isValid: false, error: 'Multiple choice questions can have at most 6 options' };
        }

        // Check if all options have text
        const hasEmptyOptions = value.some((opt: any) => !opt.text || opt.text.trim() === '');
        if (hasEmptyOptions) {
          return { isValid: false, error: 'All options must have text' };
        }

        // Check if exactly one option is marked as correct
        const correctCount = value.filter((opt: any) => opt.isCorrect).length;
        if (correctCount !== 1) {
          return { isValid: false, error: 'Multiple choice questions must have exactly one correct answer' };
        }
      }
      return { isValid: true };

    default:
      return { isValid: true };
  }
};

// Form validation state management
export interface QuestionFormState {
  questionText: string;
  questionType: 'multiple_choice' | 'essay' | 'true_false';
  points: number;
  options?: Array<{ id: string; text: string; isCorrect: boolean; order: number }>;
  correctAnswer?: string;
  explanation?: string;
  timeLimit?: number;
}

export const validateQuestionForm = (formState: QuestionFormState): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};

  // Validate question text
  if (!formState.questionText.trim()) {
    errors.questionText = 'Question text is required';
  } else if (formState.questionText.length > 2000) {
    errors.questionText = 'Question text too long';
  }

  // Validate points
  if (!formState.points || formState.points < 1 || formState.points > 100) {
    errors.points = 'Points must be between 1 and 100';
  }

  // Validate based on question type
  switch (formState.questionType) {
    case 'multiple_choice':
      if (!formState.options || formState.options.length < 2) {
        errors.options = 'Multiple choice questions need at least 2 options';
      } else if (formState.options.length > 6) {
        errors.options = 'Multiple choice questions can have at most 6 options';
      } else {
        // Check for empty options
        const emptyOptionIndex = formState.options.findIndex(opt => !opt.text.trim());
        if (emptyOptionIndex !== -1) {
          errors.options = `Option ${emptyOptionIndex + 1} cannot be empty`;
        } else {
          // Check for correct answer
          const correctCount = formState.options.filter(opt => opt.isCorrect).length;
          if (correctCount !== 1) {
            errors.correctAnswer = 'Multiple choice questions must have exactly one correct answer';
          }
        }
      }
      break;

    case 'true_false':
      if (!formState.correctAnswer || !['true', 'false'].includes(formState.correctAnswer)) {
        errors.correctAnswer = 'True/False questions must have a correct answer';
      }
      break;

    case 'essay':
      // Essay questions don't require options or correctAnswer
      break;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validation helper functions for Zod v4.x
export const validateQuizQuestion = (data: unknown) => {
  try {
    const result = QuizQuestionSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    return { success: false, error: new Error('Unknown validation error') };
  }
};

export const validateCreateQuestionRequest = (data: unknown) => {
  try {
    const result = CreateQuestionRequestSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    return { success: false, error: new Error('Unknown validation error') };
  }
};

export const validateImportQuestion = (data: unknown) => {
  try {
    const result = ImportQuestionSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    return { success: false, error: new Error('Unknown validation error') };
  }
};

export const validateAIGeneratedQuestion = (data: unknown) => {
  try {
    const result = AIGeneratedQuestionSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    return { success: false, error: new Error('Unknown validation error') };
  }
};