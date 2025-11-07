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

export const useUpdateSectionsSequence = (
  config: {
    onSuccess?: () => void | Promise<void>;
    onError?: (error: Error) => void | Promise<void>;
  } = {}
) => {
  return useMutation({
    mutationFn: async (updates: { id: string; sequence: number }[]) => {
      // ✅ PERBAIKAN: Kirim semua updates dalam 1 batch (jika backend support)
      // Atau tunggu semua selesai dengan Promise.all
      const promises = updates.map(({ id, sequence }) =>
        updateSection(id, { sequence })
      );
      
      // Tunggu SEMUA request selesai
      const results = await Promise.all(promises);
      return results;
    },
    
    // ❌ HAPUS onMutate - Jangan gunakan optimistic update untuk sequence
    // Biarkan UI menunggu response dari backend
    
    onSuccess: async (data, variables, context) => {
      // ✅ Tunggu sebentar agar backend commit data
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // ✅ Invalidate dan refetch
      await queryClient.invalidateQueries({ queryKey: getSectionQueryKey() });
      await queryClient.refetchQueries({ queryKey: getSectionQueryKey() });
      
      await config.onSuccess?.();
    },
    
    onError: async (error) => {
      console.error("❌ Update sequence error:", error);
      
      // ✅ Refetch untuk restore data yang benar
      await queryClient.refetchQueries({ queryKey: getSectionQueryKey() });
      
      await config.onError?.(error);
    },
  });
};