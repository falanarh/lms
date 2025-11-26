import { startActivityContent, finishActivityContent } from "@/api/activityContents";
import { MutationConfig, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

export const useStartActivityContent = (
  config: MutationConfig<typeof startActivityContent> = {}
) => {
  return useMutation({
    mutationFn: startActivityContent,
    onSuccess: async (...args) => {
      await config.onSuccess?.(...args);
    },
    onError: async (...args) => {
      await config.onError?.(...args);
    },
    ...config,
  });
};

export const useFinishActivityContent = (
  config: MutationConfig<typeof finishActivityContent> = {}
) => {
  return useMutation({
    mutationFn: finishActivityContent,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["section-content"] });
      await config.onSuccess?.(...args);
    },
    onError: async (...args) => {
      await config.onError?.(...args);
    },
    ...config,
  });
};