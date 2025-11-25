import {
  getMasterQuestions,
  getMasterQuestionById,
  createMasterQuestion,
  updateMasterQuestion,
  deleteMasterQuestion,
  GetMasterQuestionsParams,
  QuestionType,
} from "@/api/masterQuestions";
import { MutationConfig, queryClient, QueryConfig } from "@/lib/queryClient";
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

// Query keys with proper typing
export const getMasterQuestionsQueryKey = (
  params: GetMasterQuestionsParams = {},
) => {
  const { page, perPage, search, type, tagId, tagName } = params;
  const key = ["master-questions"];

  if (page !== undefined) key.push("page", page.toString());
  if (perPage !== undefined) key.push("perPage", perPage.toString());
  if (search) key.push("search", search);
  if (type) key.push("type", type);
  if (tagId) key.push("tagId", tagId);
  if (tagName) key.push("tagName", tagName);

  return key;
};

export const getMasterQuestionByIdQueryKey = (id: string) => [
  "master-questions",
  "detail",
  id,
];

// Query options for getting all questions with pagination and filters
export const getMasterQuestionsQueryOptions = (
  params: GetMasterQuestionsParams = {},
) => {
  return queryOptions({
    queryKey: getMasterQuestionsQueryKey(params),
    queryFn: () => getMasterQuestions(params), // FIX: Pass params object directly
  });
};

// Query options for getting a single question by ID
export const getMasterQuestionByIdQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: getMasterQuestionByIdQueryKey(id),
    queryFn: () => getMasterQuestionById(id),
    enabled: !!id,
  });
};

// Hook parameters interface
interface UseMasterQuestionsParams {
  page?: number;
  perPage?: number;
  searchQuery?: string;
  type?: QuestionType;
  tagId?: string;
  tagName?: string;
  queryConfig?: QueryConfig<typeof getMasterQuestionsQueryOptions>;
}

// Custom hook for getting all master questions with pagination and filters
export const useMasterQuestions = (params: UseMasterQuestionsParams = {}) => {
  const {
    page = 1,
    perPage = 10,
    searchQuery,
    type,
    tagId,
    tagName,
    queryConfig,
  } = params;

  return useQuery({
    ...getMasterQuestionsQueryOptions({
      page,
      perPage,
      search: searchQuery,
      type,
      tagId,
      tagName,
    }),
    ...queryConfig,
  });
};

// Custom hook for getting a single master question by ID
export const useMasterQuestion = ({
  id,
  queryConfig,
}: {
  id: string;
  queryConfig?: QueryConfig<typeof getMasterQuestionByIdQueryOptions>;
}) => {
  return useQuery({
    ...getMasterQuestionByIdQueryOptions(id),
    ...queryConfig,
  });
};

// Custom hook for creating a master question
export const useCreateMasterQuestion = ({
  mutationConfig,
}: {
  mutationConfig?: MutationConfig<typeof createMasterQuestion>;
} = {}) => {
  return useMutation({
    mutationFn: createMasterQuestion,
    onSuccess: async (data, variables, context) => {
      // Invalidate all master questions queries to refresh the list
      await queryClient.invalidateQueries({
        queryKey: ["master-questions"],
      });
      // Call the custom onSuccess if provided
      await mutationConfig?.onSuccess?.(data, variables, context);
    },
    onError: mutationConfig?.onError,
  });
};

// Custom hook for updating a master question
export const useUpdateMasterQuestion = ({
  mutationConfig,
}: {
  mutationConfig?: MutationConfig<typeof updateMasterQuestion>;
} = {}) => {
  return useMutation({
    mutationFn: updateMasterQuestion,
    onSuccess: async (data, variables, context) => {
      // Invalidate the specific question detail
      await queryClient.invalidateQueries({
        queryKey: getMasterQuestionByIdQueryKey(variables.id),
      });
      // Invalidate all master questions list queries
      await queryClient.invalidateQueries({
        queryKey: ["master-questions"],
      });
      // Call the custom onSuccess if provided
      await mutationConfig?.onSuccess?.(data, variables, context);
    },
    onError: mutationConfig?.onError,
  });
};

// Custom hook for deleting a master question
export const useDeleteMasterQuestion = ({
  mutationConfig,
}: {
  mutationConfig?: MutationConfig<typeof deleteMasterQuestion>;
} = {}) => {
  return useMutation({
    mutationFn: deleteMasterQuestion,
    onSuccess: async (data, variables, context) => {
      // Invalidate all master questions queries
      await queryClient.invalidateQueries({
        queryKey: ["master-questions"],
      });
      // Call the custom onSuccess if provided
      await mutationConfig?.onSuccess?.(data, variables, context);
    },
    onError: mutationConfig?.onError,
  });
};
