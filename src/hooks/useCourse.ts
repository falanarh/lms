
import { getCourses } from "@/api/course";
import { QueryConfig } from "@/lib/queryClient";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const getCourseQueryKey = () => ["courses"]

export const getCourseQueryOptions = () => {
    return queryOptions({
        queryKey: getCourseQueryKey(),
        queryFn: getCourses
    })
}

type UseCourseParams = {
    queryConfig?: QueryConfig<typeof getCourseQueryOptions>
}

export const useCourses = (params: UseCourseParams = {}) => {
    return useQuery({
        ...getCourseQueryOptions(),
        ...params.queryConfig,
    })
}