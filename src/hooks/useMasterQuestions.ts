import {
  getMasterQuestions,
  getMasterQuestionById,
  createMasterQuestion,
  updateMasterQuestion,
  deleteMasterQuestion,
  QuestionRequest,
  MasterQuestionResponse,
  MasterQuestionsListResponse,
} from "@/api/masterQuestions";
import { MutationConfig, queryClient } from "@/lib/queryClient";
import { queryOptions, useMutation, useQuery, type UseQueryOptions } from "@tanstack/react-query";

// Query keys
export const getMasterQuestionsQueryKey = (page?: number, perPage?: number, search?: string, type?: string) => {
  const key = ["master-questions"];
  if (page !== undefined && perPage !== undefined) {
    return [...key, page, perPage, search, type];
  }
  return key;
};

export const getMasterQuestionByIdQueryKey = (id: string) => ["master-questions", "detail", id];

// Query options for getting all questions with pagination
export const getMasterQuestionsQueryOptions = (
  page: number = 1,
  perPage: number = 10,
  search?: string,
  type?: string
) => {
  return queryOptions({
    queryKey: getMasterQuestionsQueryKey(page, perPage, search, type),
    queryFn: async () => {
      // For now, we'll implement a simple search/filter on the client side
      // since the API doesn't seem to support search/filter parameters directly
      const response = await getMasterQuestions(page, perPage);

      // If search or type filters are provided, filter the results
      if (search || type) {
        let filteredData = response.data || [];

        if (search) {
          const searchLower = search.toLowerCase();
          filteredData = filteredData.filter(question =>
            question.name.toLowerCase().includes(searchLower) ||
            question.questionText.toLowerCase().includes(searchLower)
          );
        }

        if (type) {
          filteredData = filteredData.filter(question =>
            question.questionType === type
          );
        }

        // Recalculate pagination for filtered results
        const totalResultCount = filteredData.length;
        const totalPageCount = Math.max(1, Math.ceil(totalResultCount / perPage));
        const resultCount = Math.min(perPage, totalResultCount);
        const showingFrom = totalResultCount > 0 ? ((page - 1) * perPage) + 1 : 0;
        const showingTo = Math.min(page * perPage, totalResultCount);

        return {
          ...response,
          data: filteredData,
          pageMeta: {
            ...response.pageMeta,
            page: page,
            perPage: perPage,
            resultCount: resultCount,
            totalResultCount: totalResultCount,
            totalPageCount: totalPageCount,
            showingFrom: showingFrom,
            showingTo: showingTo,
            hasPrev: page > 1,
            hasNext: page < totalPageCount
          }
        };
      }

      return response;
    },
  });
};

// Query options for getting a single question by ID
export const getMasterQuestionByIdQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: getMasterQuestionByIdQueryKey(id),
    queryFn: () => getMasterQuestionById(id),
  });
};

// Custom hook for getting all master questions with pagination
export const useMasterQuestions = ({
  page = 1,
  perPage = 10,
  searchQuery,
  type,
  queryConfig
}: {
  page?: number;
  perPage?: number;
  searchQuery?: string;
  type?: string;
  queryConfig?: Omit<UseQueryOptions<MasterQuestionsListResponse>, 'queryKey' | 'queryFn'>;
} = {}) => {
  return useQuery({
    ...getMasterQuestionsQueryOptions(page, perPage, searchQuery, type),
    ...queryConfig,
  } as UseQueryOptions<MasterQuestionsListResponse>);
};

// Custom hook for getting a single master question by ID
export const useMasterQuestion = ({
  id,
  queryConfig
}: {
  id: string;
  queryConfig?: Omit<UseQueryOptions<MasterQuestionResponse>, 'queryKey' | 'queryFn'>;
}) => {
  return useQuery({
    ...getMasterQuestionByIdQueryOptions(id),
    ...queryConfig,
  } as UseQueryOptions<MasterQuestionResponse>);
};

// Custom hook for creating a master question
export const useCreateMasterQuestion = (
  config: MutationConfig<typeof createMasterQuestion> = {}
) => {
  return useMutation({
    mutationFn: createMasterQuestion,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["master-questions"] })
      await config.onSuccess?.(...args)
    },
    ...config,
  })
};

// Custom hook for updating a master question
export const useUpdateMasterQuestion = (
  config: MutationConfig<typeof updateMasterQuestion> = {}
) => {
  return useMutation({
    mutationFn: updateMasterQuestion,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["master-questions"] })
      await config.onSuccess?.(...args)
    },
    ...config,
  })
};

// Custom hook for deleting a master question
export const useDeleteMasterQuestion = (
  config: MutationConfig<typeof deleteMasterQuestion> = {}
) => {
  return useMutation({
    mutationFn: deleteMasterQuestion,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["master-questions"] })
      await config.onSuccess?.(...args)
    },
    ...config,
  })
};
  