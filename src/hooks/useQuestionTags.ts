import {
  getQuestionTags,
  createQuestionTag,
  GetQuestionTagsParams,
} from "@/api/questionTag";
import { MutationConfig, QueryConfig, queryClient } from "@/lib/queryClient";
import { queryOptions, useQuery, useMutation } from "@tanstack/react-query";

// Query key generator - include all params for proper caching
export const getQuestionTagsQueryKey = (params: GetQuestionTagsParams = {}) => {
  const { search, page, perPage } = params;
  const key = ["question-tags"];

  if (search) key.push("search", search);
  if (page !== undefined) key.push("page", page.toString());
  if (perPage !== undefined) key.push("perPage", perPage.toString());

  return key;
};

// Query options
export const getQuestionTagsQueryOptions = (
  params: GetQuestionTagsParams = {},
) => {
  return queryOptions({
    queryKey: getQuestionTagsQueryKey(params),
    queryFn: () => getQuestionTags(params),
  });
};

type UseQuestionTagsParams = {
  search?: string;
  page?: number;
  perPage?: number;
  queryConfig?: QueryConfig<typeof getQuestionTagsQueryOptions>;
};

export const useQuestionTags = (params: UseQuestionTagsParams = {}) => {
  const { search, page = 1, perPage = 20, queryConfig } = params;

  return useQuery({
    ...getQuestionTagsQueryOptions({ search, page, perPage }),
    ...queryConfig,
  });
};

export const useCreateQuestionTag = (
  config: MutationConfig<typeof createQuestionTag> = {},
) => {
  return useMutation({
    mutationFn: createQuestionTag,
    onSuccess: async (data, ...args) => {
      // Invalidate all question tags queries to refresh the list
      await queryClient.invalidateQueries({
        queryKey: ["question-tags"],
      });
      await config.onSuccess?.(data, ...args);
    },
    ...config,
  });
};
