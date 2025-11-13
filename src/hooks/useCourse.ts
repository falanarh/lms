import { getCourseById } from "@/api/course";
import { QueryConfig } from "@/lib/queryClient";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const getCourseQueryKey = (id: string) => ["course", id]

export const getCourseQueryOptions = (id: string) => {
    return queryOptions({
        queryKey: getCourseQueryKey(id),
        queryFn: () => getCourseById(id)
    })
}

type UseCourseParams = {
    queryConfig?: QueryConfig<typeof getCourseQueryOptions>
}

export const useCourse = (id: string, params: UseCourseParams = {}) => {
    return useQuery({
        ...getCourseQueryOptions(id),
        ...params.queryConfig,
    })
}