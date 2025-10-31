import {createContent, deleteContent, getContents} from "@/api/contents";
import { MutationConfig, queryClient, QueryConfig } from "@/lib/queryClient";
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

export const getContentQueryKey = () => ["contents"]

export const getContentQueryOptions = () => {
    return queryOptions({
        queryKey: getContentQueryKey(),
        queryFn: getContents
    })
}

type UseContentParams = {
    queryConfig?: QueryConfig<typeof getContentQueryOptions>
}

export const useContents = (params: UseContentParams = {}) => {
    return useQuery({
        ...getContentQueryOptions(),
        ...params.queryConfig,
    })
}

export const useCreateContent = (
  config: MutationConfig<typeof createContent> = {}
) => {
  return useMutation({
    mutationFn: createContent,
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: getContentQueryKey() })
      await config.onSuccess?.(...args)
    },
    ...config,
  })
}


export const useDeleteContent = (
  config: MutationConfig<typeof deleteContent> = {}
) => {
  return useMutation({
    mutationFn: deleteContent,
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: getContentQueryKey() })
      await config.onSuccess?.(...args)
    },
    ...config,
  })
}