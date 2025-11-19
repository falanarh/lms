import { getCourses } from "@/api/course";
import { QueryConfig } from "@/lib/queryClient";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const getCoursesQueryKey = (
  searchQuery?: string,
  selectedCategory?: string,
  sortBy?: string,
  page?: number,
  perPage?: number
) => ["courses", { searchQuery, selectedCategory, sortBy, page, perPage }];

export const getCoursesQueryOptions = (
  searchQuery?: string,
  selectedCategory?: string,
  sortBy?: string,
  page: number = 1,
  perPage: number = 8
) => {
  return queryOptions({
    queryKey: getCoursesQueryKey(searchQuery, selectedCategory, sortBy, page, perPage),
    queryFn: () => getCourses(searchQuery, selectedCategory, sortBy, page, perPage),
  });
};

type UseCoursesParams = {
  searchQuery?: string;
  selectedCategory?: string;
  sortBy?: string;
  page?: number;
  perPage?: number;
  queryConfig?: QueryConfig<typeof getCoursesQueryOptions>;
};

export const useCourses = (params: UseCoursesParams = {}) => {
  const {
    searchQuery,
    selectedCategory,
    sortBy,
    page = 1,
    perPage = 8,
    queryConfig,
  } = params;

  return useQuery({
    ...getCoursesQueryOptions(searchQuery, selectedCategory, sortBy, page, perPage),
    ...queryConfig,
  });
};