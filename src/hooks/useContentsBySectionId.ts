import { getContentsBySectionId } from "@/api/contents";
import { QueryConfig } from "@/lib/queryClient";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const getContentsBySectionIdQueryKey = (sectionId: string) => ["contents", sectionId];

export const getContentsBySectionIdQueryOptions = (sectionId: string) => {
  return queryOptions({
    queryKey: getContentsBySectionIdQueryKey(sectionId),
    queryFn: () => getContentsBySectionId(sectionId),
  });
};

type UseContentsBySectionIdParams = {
  sectionId: string;
  enabled?: boolean;
  queryConfig?: QueryConfig<typeof getContentsBySectionIdQueryOptions>;
};

export const useContentsBySectionId = ({ 
  sectionId, 
  enabled = true,
  queryConfig 
}: UseContentsBySectionIdParams) => {
  return useQuery({
    ...getContentsBySectionIdQueryOptions(sectionId),
    enabled,
    ...queryConfig,
  });
};
