import { useQuery } from "@tanstack/react-query";
import { getForumsQueryOptions } from "@/api/forums";
import type { Forum } from "@/api/forums";

export const useForums = () => {
  const {
    data: forums = [],
    isLoading,
    error,
    refetch,
  } = useQuery(getForumsQueryOptions());

  return {
    data: (forums || []) as Forum[],
    isLoading,
    error,
    refetch,
  };
};

export type UseForumsReturn = ReturnType<typeof useForums>;