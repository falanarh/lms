import { getReviewById, getReviewsByGroupCourse, createReview, CreateReviewRequest } from "@/api/review";
import { QueryConfig } from "@/lib/queryClient";
import { queryOptions, useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Query key generators
export const getReviewsQueryKey = (groupCourseId: string, page: number, perPage: number) => 
  ["reviews", groupCourseId, page, perPage];

export const getReviewQueryKey = (id: string) => ["review", id];

// Query options
export const getReviewsQueryOptions = (
  groupCourseId: string, 
  page: number = 1, 
  perPage: number = 20
) => {
  return queryOptions({
    queryKey: getReviewsQueryKey(groupCourseId, page, perPage),
    queryFn: () => getReviewsByGroupCourse(groupCourseId, page, perPage),
    enabled: !!groupCourseId,
  });
};

export const getReviewQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: getReviewQueryKey(id),
    queryFn: () => getReviewById(id),
  });
};

// Hook types
type UseReviewsParams = {
  queryConfig?: QueryConfig<typeof getReviewsQueryOptions>;
};

type UseReviewParams = {
  queryConfig?: QueryConfig<typeof getReviewQueryOptions>;
};

// Hooks
export const useReviews = (
  groupCourseId: string,
  page: number = 1,
  perPage: number = 20,
  params: UseReviewsParams = {}
) => {
  return useQuery({
    ...getReviewsQueryOptions(groupCourseId, page, perPage),
    ...params.queryConfig,
  });
};

export const useReview = (id: string, params: UseReviewParams = {}) => {
  return useQuery({
    ...getReviewQueryOptions(id),
    ...params.queryConfig,
  });
};

// Infinite reviews (for Load More)
export const getInfiniteReviewsQueryKey = (groupCourseId: string, perPage: number) => [
  "reviews",
  groupCourseId,
  perPage,
] as const;

export const useInfiniteReviews = (
  groupCourseId: string,
  perPage: number = 3
) => {
  return useInfiniteQuery({
    queryKey: getInfiniteReviewsQueryKey(groupCourseId, perPage),
    queryFn: ({ pageParam = 1 }) =>
      getReviewsByGroupCourse(groupCourseId, pageParam as number, perPage),
    initialPageParam: 1,
    getNextPageParam: (lastPage: { pageMeta?: { hasNext: boolean; page: number } }) =>
      lastPage.pageMeta?.hasNext ? lastPage.pageMeta.page + 1 : undefined,
    enabled: !!groupCourseId,
  });
};

// Create review mutation
export const useCreateReview = (groupCourseId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reviewData: CreateReviewRequest) => 
      createReview(groupCourseId, reviewData),
    onSuccess: () => {
      // Invalidate and refetch reviews after successful creation
      queryClient.invalidateQueries({
        queryKey: ["reviews", groupCourseId]
      });
      // Also invalidate rating summary
      queryClient.invalidateQueries({
        queryKey: ["rating-summary", groupCourseId]
      });
    },
  });
};