import { createSection, deleteSection, getSections, Section, updateSection } from "@/api/sections";
import { MutationConfig, queryClient, QueryConfig } from "@/lib/queryClient";
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

export const getSectionQueryKey = () => ["sections"]

export const getSectionQueryOptions = () => {
    return queryOptions({
        queryKey: getSectionQueryKey(),
        queryFn: getSections
    })
}

type UseSectionParams = {
    queryConfig?: QueryConfig<typeof getSectionQueryOptions>
}

export const useSections = (params: UseSectionParams = {}) => {
    return useQuery({
        ...getSectionQueryOptions(),
        ...params.queryConfig,
    })
}

export const useCreateSection = (
  config: MutationConfig<typeof createSection> = {}
) => {
  return useMutation({
    mutationFn: createSection,
    onSuccess: async (...args) => {
      // Force immediate refetch of contents list
      await queryClient.refetchQueries({ queryKey: getSectionQueryKey() })
      // Call the config's onSuccess if provided
      await config.onSuccess?.(...args)
    },
    ...config,
  })
}

export const useDeleteSection = (
  config: MutationConfig<typeof deleteSection> = {}
) => {
  return useMutation({
    mutationFn: deleteSection,
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: getSectionQueryKey() })
      await config.onSuccess?.(...args)
    },
    ...config,
  })
}

export const useUpdateSection = (
  config: {
    onSuccess?: (data: Section) => void | Promise<void>;
    onError?: (error: Error) => void | Promise<void>;
  } = {}
) => {
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: Partial<Omit<Section, "id" | "group" | "createdAt" | "updatedAt">> 
    }) => updateSection(id, data),
    onSuccess: async (data, variables, context) => {
      await queryClient.refetchQueries({ queryKey: getSectionQueryKey() });
      await config.onSuccess?.(data);
    },
    onError: async (error) => {
      await config.onError?.(error);
    },
  });
};
