
import { getCourses } from "@/api/course";
import { QueryConfig } from "@/lib/queryClient";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const getCoursesQueryKey = () => ["courses"]

export const getCoursesQueryOptions = () => {
    return queryOptions({
        queryKey: getCoursesQueryKey(),
        queryFn: getCourses
    })
}

type UseCoursesParams = {
    queryConfig?: QueryConfig<typeof getCoursesQueryOptions>
}

export const useCourses = (params: UseCoursesParams = {}) => {
    return useQuery({
        ...getCoursesQueryOptions(),
        ...params.queryConfig,
    })
}