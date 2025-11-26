import {
  getQuestionsByContentId,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createBulkQuestions,
} from "@/api/questions";
import { MutationConfig, queryClient, QueryConfig } from "@/lib/queryClient";
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

// Updated query key to support pagination
export const getQuestionsQueryKey = (
  idContent: string,
  page?: number,
  perPage?: number,
) => {
  const key = ["questions", idContent];
  if (page !== undefined && perPage !== undefined) {
    return [...key, page, perPage];
  }
  return key;
};

export const getQuestionByIdQueryKey = (id: string) => [
  "questions",
  "detail",
  id,
];

// Updated query options to support pagination
export const getQuestionsQueryOptions = (
  idContent: string,
  page: number = 1,
  perPage: number = 10,
) => {
  return queryOptions({
    queryKey: getQuestionsQueryKey(idContent, page, perPage),
    queryFn: () => getQuestionsByContentId(idContent, page, perPage),
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

// Updated useQuestions to accept page and perPage parameters
export const useQuestions = (
  idContent: string,
  page: number = 1,
  perPage: number = 10,
  params: UseQuestionsParams = {},
) => {
  return useQuery({
    ...getQuestionsQueryOptions(idContent, page, perPage),
    ...params.queryConfig,
  });
};

export const useQuestionById = (
  id: string,
  params: UseQuestionByIdParams = {},
) => {
  return useQuery({
    ...getQuestionByIdQueryOptions(id),
    ...params.queryConfig,
  });
};

export const useCreateQuestion = (
  config: MutationConfig<typeof createQuestion> = {},
) => {
  return useMutation({
    mutationFn: createQuestion,
    onSuccess: async (data, variables, ...args) => {
      // Invalidate all pages for this content (removes page/perPage from key)
      await queryClient.invalidateQueries({
        queryKey: ["questions", variables.idContent],
      });
      await config.onSuccess?.(data, variables, ...args);
    },
    ...config,
  });
};

export const useUpdateQuestion = (
  config: MutationConfig<typeof updateQuestion> = {},
) => {
  return useMutation({
    mutationFn: updateQuestion,
    onSuccess: async (data, ...args) => {
      // Invalidate specific question query
      await queryClient.invalidateQueries({
        queryKey: getQuestionByIdQueryKey(data.id),
      });
      // Also invalidate all pages for this content
      if (data.idContent) {
        await queryClient.invalidateQueries({
          queryKey: ["questions", data.idContent],
        });
      }
      await config.onSuccess?.(data, ...args);
    },
    ...config,
  });
};

export const useDeleteQuestion = (
  config: MutationConfig<typeof deleteQuestion> = {},
) => {
  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: async (...args) => {
      // Invalidate all question queries (all pages, all content)
      await queryClient.invalidateQueries({ queryKey: ["questions"] });
      await config.onSuccess?.(...args);
    },
    ...config,
  });
};

export const useCreateBulkQuestions = (
  config: MutationConfig<typeof createBulkQuestions> = {},
) => {
  return useMutation({
    mutationFn: createBulkQuestions,
    onSuccess: async (data, ...args) => {
      // Invalidate questions queries for all affected content IDs (all pages)
      const uniqueContentIds = [
        ...new Set(data.map((q) => q.idContent).filter(Boolean)),
      ] as string[];

      await Promise.all(
        uniqueContentIds.map((idContent) =>
          queryClient.invalidateQueries({
            queryKey: ["questions", idContent],
          }),
        ),
      );
      await config.onSuccess?.(data, ...args);
    },
    ...config,
  });
};
