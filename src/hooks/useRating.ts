import { getRatingSummaryByCourseId } from "@/api/rating";
import { QueryConfig } from "@/lib/queryClient";
import { queryOptions, useQuery } from "@tanstack/react-query";

// Query key generator
export const getRatingSummaryQueryKey = (courseId: string) => 
  ["rating-summary", courseId];

// Query options
export const getRatingSummaryQueryOptions = (courseId: string) => {
  return queryOptions({
    queryKey: getRatingSummaryQueryKey(courseId),
    queryFn: () => getRatingSummaryByCourseId(courseId),
    enabled: !!courseId,
  });
};

// Hook type
type UseRatingSummaryParams = {
  queryConfig?: QueryConfig<typeof getRatingSummaryQueryOptions>;
};

// Hook
export const useRatingSummary = (
  courseId: string, 
  params: UseRatingSummaryParams = {}
) => {
  return useQuery({
    ...getRatingSummaryQueryOptions(courseId),
    ...params.queryConfig,
  });
};
