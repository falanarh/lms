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
