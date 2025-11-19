import { z } from 'zod';

// Base option schema for multiple choice questions
export const QuestionOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean(),
  order: z.number().int().min(0)
});

// Quiz Question Schema for frontend validation
export const QuizQuestionSchema = z.object({
  id: z.string().optional(),
  questionText: z.string().min(1, 'Question text is required').max(2000, 'Question text too long'),
  questionType: z.enum(['multiple_choice', 'essay', 'true_false'], {
    required_error: 'Question type is required'
  }),
  points: z.number().int().min(1, 'Points must be at least 1').max(100, 'Points cannot exceed 100'),
  order: z.number().int().min(0).optional(),
  timeLimit: z.number().int().min(0).optional(),
  explanation: z.string().max(1000, 'Explanation too long').optional(),
  correctAnswer: z.string().optional(),
  options: z.array(QuestionOptionSchema).optional()
}).refine((data) => {
  // Validation rules based on question type
  switch (data.questionType) {
    case 'multiple_choice': {
      // Must have at least 2 options and at most 6 options
      if (!data.options || data.options.length < 2) {
        return {
          success: false,
          error: new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: 'Multiple choice questions need at least 2 options',
              path: ['options']
            }
          ])
        };
      }
      if (data.options.length > 6) {
        return {
          success: false,
          error: new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: 'Multiple choice questions can have at most 6 options',
              path: ['options']
            }
          ])
        };
      }
      // Must have exactly one correct option
      const correctCount = data.options.filter(opt => opt.isCorrect).length;
      if (correctCount !== 1) {
        return {
          success: false,
          error: new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: 'Multiple choice questions must have exactly one correct answer',
              path: ['options']
            }
          ])
        };
      }
      // Validate that all options have text
      const emptyOptions = data.options.filter(opt => !opt.text || opt.text.trim().length === 0);
      if (emptyOptions.length > 0) {
        return {
          success: false,
          error: new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: 'All option texts are required',
              path: ['options']
            }
          ])
        };
      }
      break;
    }

    case 'true_false':
    case 'essay': {
      // Should not have options
      if (data.options && data.options.length > 0) {
        return {
          success: false,
          error: new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: 'Options are not allowed for ' + data.questionType + ' questions',
              path: ['options']
            }
          ])
        };
      }
      break;
    }

    default:
      return { success: true, data };
  }

  return { success: true, data: data };
}, {
  message: 'Validation failed',
  path: ['general']
});

// API Request Schema for backend validation
export const CreateQuestionRequestSchema = z.object({
  idContent: z.string().uuid('Invalid content ID format'),
  name: z.string().min(1, 'Question name is required').max(100, 'Name too long'),
  questionType: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'], {
    required_error: 'Question type is required'
  }),
  questionText: z.string().min(1, 'Question text is required').max(2000, 'Question text too long'),
  maxScore: z.number().int().min(1, 'Score must be at least 1').max(100, 'Score cannot exceed 100'),
  optionsCode: z.array(z.string().length(3, 'Option code must be exactly 3 characters')).optional(),
  optionsText: z.array(z.string()).optional(),
  answer: z.object({
    answer: z.string().min(1, 'Answer is required'),
    codeAnswer: z.string().length(3).nullable().optional()
  })
}).refine((data) => {
  // Validation rules based on question type
  switch (data.questionType) {
    case 'MULTIPLE_CHOICE':
      // Must have at least 2 options and at most 6 options
      if (!data.optionsText || data.optionsText.length < 2) {
        return {
          success: false,
          error: new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: 'Multiple choice questions need at least 2 options',
              path: ['optionsText']
            }
          ])
        };
      }
      if (data.optionsText.length > 6) {
        return {
          success: false,
          error: new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: 'Multiple choice questions can have at most 6 options',
              path: ['optionsText']
            }
          ])
        };
      }
      // Must have optionsCode matching optionsText length
      if (data.optionsCode && data.optionsCode.length !== data.optionsText.length) {
        return {
          success: false,
          error: new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: 'Options codes must match options count',
              path: ['optionsCode']
            }
          ])
        };
      }
      return { success: true, data: data };

    case 'TRUE_FALSE':
      // Must have exactly 2 options: ["True", "False"]
      return data.optionsText &&
             data.optionsText.length === 2 &&
             data.optionsText.includes("True") &&
             data.optionsText.includes("False")
        ? { success: true, data: data }
        : {
            success: false,
            error: new z.ZodError([
              {
                code: z.ZodIssueCode.custom,
                message: 'True/False questions must have exactly "True" and "False" options',
                path: ['optionsText']
              }
            ])
          };

    case 'SHORT_ANSWER':
      // Should not have options
      return !data.optionsText || data.optionsText.length === 0
        ? { success: true, data: data }
        : {
            success: false,
            error: new z.ZodError([
              {
                code: z.ZodIssueCode.custom,
                message: 'Short answer questions cannot have options',
                path: ['optionsText']
              }
            ])
          };

    default:
      return { success: true, data: data };
  }
}, {
  message: 'Invalid question configuration for the selected question type',
  path: ['questionType']
});

// Update Question Schema
export const UpdateQuestionRequestSchema = CreateQuestionRequestSchema.partial().extend({
  id: z.string().uuid('Invalid question ID format')
});

// Import Questions Schema
export const ImportQuestionSchema = z.object({
  questionText: z.string().min(1, 'Question text is required'),
  questionType: z.enum(['multiple_choice', 'essay', 'true_false']),
  points: z.number().int().min(1).max(100),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  explanation: z.string().optional()
}).refine((data) => {
  switch (data.questionType) {
    case 'multiple_choice':
      return data.options && data.options.length >= 2 && data.options.length <= 6 && data.correctAnswer;
    case 'true_false':
      return !data.options || data.options.length === 0;
    case 'essay':
      return !data.options || data.options.length === 0;
    default:
      return true;
  }
}, {
  message: 'Invalid question configuration',
  path: ['questionType']
});

// AI Generated Question Schema
export const AIGeneratedQuestionSchema = z.object({
  question_id: z.string(),
  question_text: z.string(),
  question_type: z.enum(['multiple_choice', 'essay', 'true_false']),
  options: z.array(z.string()).optional(),
  answer_text: z.string(),
  explanation: z.string().optional()
});

// Type exports
export type QuizQuestionType = z.infer<typeof QuizQuestionSchema>;
export type CreateQuestionRequestType = z.infer<typeof CreateQuestionRequestSchema>;
export type UpdateQuestionRequestType = z.infer<typeof UpdateQuestionRequestSchema>;
export type ImportQuestionType = z.infer<typeof ImportQuestionSchema>;
export type AIGeneratedQuestionType = z.infer<typeof AIGeneratedQuestionSchema>;

// Error formatter for form validation
export const formatZodError = (error: z.ZodError): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};

  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    formattedErrors[path] = issue.message;
  });

  return formattedErrors;
};

// Legacy validation functions for compatibility
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