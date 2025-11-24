import { getReviewById, getReviewsByCourseId, createReview, CreateReviewRequest } from "@/api/review";
import { QueryConfig } from "@/lib/queryClient";
import { queryOptions, useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Query key generators
export const getReviewsQueryKey = (courseId: string, page: number, perPage: number) => 
  ["reviews", courseId, page, perPage];

export const getReviewQueryKey = (id: string) => ["review", id];

// Query options
export const getReviewsQueryOptions = (
  courseId: string, 
  page: number = 1, 
  perPage: number = 20
) => {
  return queryOptions({
    queryKey: getReviewsQueryKey(courseId, page, perPage),
    queryFn: () => getReviewsByCourseId(courseId, page, perPage),
    enabled: !!courseId,
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
  courseId: string,
  page: number = 1,
  perPage: number = 20,
  params: UseReviewsParams = {}
) => {
  return useQuery({
    ...getReviewsQueryOptions(courseId, page, perPage),
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
export const getInfiniteReviewsQueryKey = (courseId: string, perPage: number) => [
  "reviews",
  courseId,
  perPage,
] as const;

export const useInfiniteReviews = (
  courseId: string,
  perPage: number = 3
) => {
  return useInfiniteQuery({
    queryKey: getInfiniteReviewsQueryKey(courseId, perPage),
    queryFn: ({ pageParam = 1 }) =>
      getReviewsByCourseId(courseId, pageParam as number, perPage),
    initialPageParam: 1,
    getNextPageParam: (lastPage: { pageMeta?: { hasNext: boolean; page: number } }) =>
      lastPage.pageMeta?.hasNext ? lastPage.pageMeta.page + 1 : undefined,
    enabled: !!courseId,
  });
};

// Create review mutation
export const useCreateReview = (courseId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reviewData: CreateReviewRequest) => 
      createReview(courseId, reviewData),
    onSuccess: () => {
      // Invalidate and refetch reviews after successful creation
      queryClient.invalidateQueries({
        queryKey: ["reviews", courseId]
      });
      // Also invalidate rating summary
      queryClient.invalidateQueries({
        queryKey: ["rating-summary", courseId]
      });
  },
  });
};