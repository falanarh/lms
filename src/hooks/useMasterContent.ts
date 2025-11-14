import {createContent, deleteContent, getContents, updateContent, updateContentsSequence} from "@/api/contents";
import { createMasterContent, getMasterContents, updateMasterContent, deleteMasterContent } from "@/api/masterContent";
import { MutationConfig, queryClient, QueryConfig } from "@/lib/queryClient";
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

export const getMasterContentQueryKey = (page: number = 1, perPage: number = 10, searchQuery?: string) => ["master-contents", page, perPage, searchQuery || ""]

export const getContentQueryKey = () => ["contents"]

export const getMasterContentQueryOptions = (page: number = 1, perPage: number = 10, searchQuery?: string) => {
    return queryOptions({
        queryKey: getMasterContentQueryKey(page, perPage, searchQuery),
        queryFn: () => getMasterContents(page, perPage, searchQuery)
    })
}

type UseMasterContentParams = {
    page?: number;
    perPage?: number;
    searchQuery?: string;
    queryConfig?: QueryConfig<ReturnType<typeof getMasterContentQueryOptions>>
}

export const useMasterContents = (params: UseMasterContentParams = {}) => {
    const { page = 1, perPage = 10, searchQuery, queryConfig = {} } = params;

    return useQuery({
        ...getMasterContentQueryOptions(page, perPage, searchQuery),
        ...queryConfig,
    })
}

export const useCreateMasterContent = (
  config: MutationConfig<typeof createMasterContent> = {}
) => {
  return useMutation({
    mutationFn: createMasterContent,
    onSuccess: async (...args) => {
      // Invalidate all master content queries regardless of page/perPage
      await queryClient.invalidateQueries({ queryKey: ["master-contents"] })
      await config.onSuccess?.(...args)
    },
    ...config,
  })
}

export const useUpdateMasterContent = (
  config: MutationConfig<typeof updateMasterContent> = {}
) => {
  return useMutation({
    mutationFn: ({ id, updatedContent }: { id: string; updatedContent: Partial<Omit<MasterContent, "id" | "createdAt" | "updatedAt">> }) =>
      updateMasterContent(id, updatedContent),
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["master-contents"] })
      await config.onSuccess?.(...args)
    },
    ...config,
  })
}

export const useDeleteMasterContent = (
  config: MutationConfig<typeof deleteMasterContent> = {}
) => {
  return useMutation({
    mutationFn: deleteMasterContent,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["master-contents"] })
      await config.onSuccess?.(...args)
    },
    ...config,
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

export const useUpdateContent = (
  config: MutationConfig<typeof updateContent> = {}
) => {
  return useMutation({
    mutationFn: updateContent,
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

export const useUpdateContentsSequence = (
  config: MutationConfig<typeof updateContentsSequence> = {}
) => {
  return useMutation({
    mutationFn: updateContentsSequence,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: getContentQueryKey() });
      await queryClient.refetchQueries({ queryKey: getContentQueryKey() });
      await config.onSuccess?.(...args);
    },
    onError: async (error, ...args) => {
      // Refetch untuk restore order jika error
      await queryClient.refetchQueries({ queryKey: getContentQueryKey() });
      await config.onError?.(error, ...args);
    },
    ...config,
  });
};
