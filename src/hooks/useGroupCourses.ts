import { getGroupCourses } from "@/api/grup-course";
import { QueryConfig } from "@/lib/queryClient";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const getGroupCoursesQueryKey = (
  searchQuery?: string,
  selectedCategory?: string,
  sortBy?: string
) => ["group-courses", { searchQuery, selectedCategory, sortBy }]

export const getGroupCoursesQueryOptions = (
  searchQuery?: string,
  selectedCategory?: string,
  sortBy?: string
) => {
    return queryOptions({
        queryKey: getGroupCoursesQueryKey(searchQuery, selectedCategory, sortBy),
        queryFn: () => getGroupCourses(searchQuery, selectedCategory, sortBy)
    })
}

type UseGroupCoursesParams = {
    searchQuery?: string;
    selectedCategory?: string;
    sortBy?: string;
    queryConfig?: QueryConfig<typeof getGroupCoursesQueryOptions>
}

export const useGroupCourses = (params: UseGroupCoursesParams = {}) => {
    const { searchQuery, selectedCategory, sortBy, queryConfig } = params;
    
    return useQuery({
        ...getGroupCoursesQueryOptions(searchQuery, selectedCategory, sortBy),
        ...queryConfig,
    })
}