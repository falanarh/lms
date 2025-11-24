import { getGroupCourses } from "@/api/grup-course";
import { QueryConfig } from "@/lib/queryClient";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const getGroupCoursesQueryKey = (
  searchQuery?: string,
  selectedCategory?: string,
  sortBy?: string,
  page?: number,
  perPage?: number
) => ["group-courses", { searchQuery, selectedCategory, sortBy, page, perPage }]

export const getGroupCoursesQueryOptions = (
  searchQuery?: string,
  selectedCategory?: string,
  sortBy?: string,
  page: number = 1,
  perPage: number = 8
) => {
    return queryOptions({
        queryKey: getGroupCoursesQueryKey(searchQuery, selectedCategory, sortBy, page, perPage),
        queryFn: () => getGroupCourses(searchQuery, selectedCategory, sortBy, page, perPage)
    })
}

type UseGroupCoursesParams = {
    searchQuery?: string;
    selectedCategory?: string;
    sortBy?: string;
    page?: number;
    perPage?: number;
    queryConfig?: QueryConfig<typeof getGroupCoursesQueryOptions>
}

export const useGroupCourses = (params: UseGroupCoursesParams = {}) => {
    const { searchQuery, selectedCategory, sortBy, page = 1, perPage = 8, queryConfig } = params;
    
    return useQuery({
        ...getGroupCoursesQueryOptions(searchQuery, selectedCategory, sortBy, page, perPage),
        ...queryConfig,
    })
}