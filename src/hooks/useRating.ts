import { getRatingSummaryByGroupCourse } from "@/api/rating";
import { QueryConfig } from "@/lib/queryClient";
import { queryOptions, useQuery } from "@tanstack/react-query";

// Query key generator
export const getRatingSummaryQueryKey = (groupCourseId: string) => 
  ["rating-summary", groupCourseId];

// Query options
export const getRatingSummaryQueryOptions = (groupCourseId: string) => {
  return queryOptions({
    queryKey: getRatingSummaryQueryKey(groupCourseId),
    queryFn: () => getRatingSummaryByGroupCourse(groupCourseId),
    enabled: !!groupCourseId,
  });
};

// Hook type
type UseRatingSummaryParams = {
  queryConfig?: QueryConfig<typeof getRatingSummaryQueryOptions>;
};

// Hook
export const useRatingSummary = (
  groupCourseId: string, 
  params: UseRatingSummaryParams = {}
) => {
  return useQuery({
    ...getRatingSummaryQueryOptions(groupCourseId),
    ...params.queryConfig,
  });
};
