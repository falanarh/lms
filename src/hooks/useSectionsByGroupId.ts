import { getSectionsByGroupId } from "@/api/sections";
import { QueryConfig } from "@/lib/queryClient";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const getSectionsByGroupIdQueryKey = (groupId: string) => ["sections", groupId];

export const getSectionsByGroupIdQueryOptions = (groupId: string) => {
  return queryOptions({
    queryKey: getSectionsByGroupIdQueryKey(groupId),
    queryFn: () => getSectionsByGroupId(groupId),
  });
};

type UseSectionsByGroupIdParams = {
  groupId: string;
  enabled?: boolean;
  queryConfig?: QueryConfig<typeof getSectionsByGroupIdQueryOptions>;
};

export const useSectionsByGroupId = ({ 
  groupId, 
  enabled = true,
  queryConfig 
}: UseSectionsByGroupIdParams) => {
  return useQuery({
    ...getSectionsByGroupIdQueryOptions(groupId),
    enabled,
    ...queryConfig,
  });
};
