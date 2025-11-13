import {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  createQuizWithContent,
  updateQuizWithContent,
  type Quiz,
  type QuizCreateRequest,
  type QuizUpdateRequest,
  type QuizWithContent,
} from "@/api/quizzes";
import {
  createQuestion,
  getQuestionsByContentId,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  createBulkQuestions,
  type QuestionRequest,
  type QuestionResponse,
  type QuestionType,
  type Answer,
} from "@/api/questions";
import { MutationConfig, queryClient, QueryConfig } from "@/lib/queryClient";
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

export const getQuizQueryKey = () => ["quizzes"];
export const getQuizByIdQueryKey = (id: string) => ["quizzes", id];

export const getQuizQueryOptions = () => {
  return queryOptions({
    queryKey: getQuizQueryKey(),
    queryFn: getQuizzes,
  });
};

export const getQuizByIdQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: getQuizByIdQueryKey(id),
    queryFn: () => getQuizById(id),
  });
};

type UseQuizParams = {
  queryConfig?: QueryConfig<typeof getQuizQueryOptions>;
};

type UseQuizByIdParams = {
  queryConfig?: QueryConfig<typeof getQuizByIdQueryOptions>;
};

export const useQuizzes = (params: UseQuizParams = {}) => {
  return useQuery({
    ...getQuizQueryOptions(),
    ...params.queryConfig,
  });
};

export const useQuizById = (id: string, params: UseQuizByIdParams = {}) => {
  return useQuery({
    ...getQuizByIdQueryOptions(id),
    ...params.queryConfig,
  });
};

export const useCreateQuiz = (
  config: MutationConfig<typeof createQuiz> = {},
) => {
  return useMutation({
    mutationFn: createQuiz,
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: getQuizQueryKey() });
      await config.onSuccess?.(...args);
    },
    ...config,
  });
};

export const useUpdateQuiz = (
  config: MutationConfig<typeof updateQuiz> = {},
) => {
  return useMutation({
    mutationFn: updateQuiz,
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: getQuizQueryKey() });
      // args[0] is the updated Quiz, which has idContent as the identifier
      await queryClient.refetchQueries({
        queryKey: getQuizByIdQueryKey(args[0].idContent),
      });
      await config.onSuccess?.(...args);
    },
    ...config,
  });
};

export const useDeleteQuiz = (
  config: MutationConfig<typeof deleteQuiz> = {},
) => {
  return useMutation({
    mutationFn: deleteQuiz,
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: getQuizQueryKey() });
      await config.onSuccess?.(...args);
    },
    ...config,
  });
};

// Combined operations for quiz + content
export const useCreateQuizWithContent = (
  config: MutationConfig<typeof createQuizWithContent> = {},
) => {
  return useMutation({
    mutationFn: createQuizWithContent,
    onSuccess: async (...args) => {
      // Invalidate both quiz and content queries
      await queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      await queryClient.invalidateQueries({ queryKey: ["contents"] });
      await config.onSuccess?.(...args);
    },
    ...config,
  });
};

export const useUpdateQuizWithContent = (
  config: MutationConfig<typeof updateQuizWithContent> = {},
) => {
  return useMutation({
    mutationFn: updateQuizWithContent,
    onSuccess: async (...args) => {
      // Invalidate both quiz and content queries
      await queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      await queryClient.invalidateQueries({ queryKey: ["contents"] });
      // Also invalidate specific quiz by ID
      if (args[0]?.quiz?.idContent) {
        await queryClient.invalidateQueries({
          queryKey: getQuizByIdQueryKey(args[0].quiz.idContent),
        });
      }
      await config.onSuccess?.(...args);
    },
    ...config,
  });
};

// Question-related hooks
export const getQuestionsQueryKey = (idContent: string) => [
  "questions",
  idContent,
];
export const getQuestionByIdQueryKey = (id: string) => ["questions", id];

export const getQuestionsQueryOptions = (idContent: string) => {
  return queryOptions({
    queryKey: getQuestionsQueryKey(idContent),
    queryFn: () => getQuestionsByContentId(idContent),
    enabled: !!idContent,
  });
};

export const getQuestionByIdQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: getQuestionByIdQueryKey(id),
    queryFn: () => getQuestionById(id),
    enabled: !!id,
  });
};

type UseQuestionsParams = {
  queryConfig?: QueryConfig<typeof getQuestionsQueryOptions>;
};

type UseQuestionByIdParams = {
  queryConfig?: QueryConfig<typeof getQuestionByIdQueryOptions>;
};

export const useQuestions = (
  idContent: string,
  params: UseQuestionsParams = {}
) => {
  return useQuery({
    ...getQuestionsQueryOptions(idContent),
    ...params.queryConfig,
  });
};

export const useQuestionById = (
  id: string,
  params: UseQuestionByIdParams = {}
) => {
  return useQuery({
    ...getQuestionByIdQueryOptions(id),
    ...params.queryConfig,
  });
};

export const useCreateQuestion = (
  config: MutationConfig<typeof createQuestion> = {}
) => {
  return useMutation({
    mutationFn: createQuestion,
    onSuccess: async (...args) => {
      // Invalidate questions queries for the content
      const questionData = args[0];
      await queryClient.invalidateQueries({
        queryKey: getQuestionsQueryKey(questionData.idContent),
      });
      await config.onSuccess?.(...args);
    },
    ...config,
  });
};

export const useUpdateQuestion = (
  config: MutationConfig<typeof updateQuestion> = {}
) => {
  return useMutation({
    mutationFn: updateQuestion,
    onSuccess: async (...args) => {
      // Invalidate specific question query
      const [updatedQuestion] = args;
      await queryClient.invalidateQueries({
        queryKey: getQuestionByIdQueryKey(updatedQuestion.id),
      });
      // Also invalidate questions list for the content
      await queryClient.invalidateQueries({
        queryKey: getQuestionsQueryKey(updatedQuestion.idContent),
      });
      await config.onSuccess?.(...args);
    },
    ...config,
  });
};

export const useDeleteQuestion = (
  config: MutationConfig<typeof deleteQuestion> = {}
) => {
  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: async (...args) => {
      // The deleted question ID is the first argument
      const deletedQuestionId = args[0];

      // We don't know the contentId from the delete response, so invalidate all question queries
      await queryClient.invalidateQueries({ queryKey: ["questions"] });
      await config.onSuccess?.(...args);
    },
    ...config,
  });
};

export const useCreateBulkQuestions = (
  config: MutationConfig<typeof createBulkQuestions> = {}
) => {
  return useMutation({
    mutationFn: createBulkQuestions,
    onSuccess: async (...args) => {
      // Invalidate questions queries for all affected content IDs
      const questions = args[0];
      const uniqueContentIds = [
        ...new Set(questions.map((q) => q.idContent)),
      ];

      await Promise.all(
        uniqueContentIds.map((idContent) =>
          queryClient.invalidateQueries({
            queryKey: getQuestionsQueryKey(idContent),
          })
        )
      );
      await config.onSuccess?.(...args);
    },
    ...config,
  });
};
