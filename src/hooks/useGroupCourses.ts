import { getGroupCourses } from "@/api/grup-course";
import { QueryConfig } from "@/lib/queryClient";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const getGroupCoursesQueryKey = () => ["group-courses"]

export const getGroupCoursesQueryOptions = () => {
    return queryOptions({
        queryKey: getGroupCoursesQueryKey(),
        queryFn: getGroupCourses
    })
}

type UseGroupCoursesParams = {
    queryConfig?: QueryConfig<typeof getGroupCoursesQueryOptions>
}

export const useGroupCourses = (params: UseGroupCoursesParams = {}) => {
    return useQuery({
        ...getGroupCoursesQueryOptions(),
        ...params.queryConfig,
    })
}