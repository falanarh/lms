import { getGroupCourseById } from "@/api/grup-course";
import { QueryConfig } from "@/lib/queryClient";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const getGroupCourseQueryKey = (id: string) => ["group-course", id]

export const getGroupCourseQueryOptions = (id: string) => {
    return queryOptions({
        queryKey: getGroupCourseQueryKey(id),
        queryFn: () => getGroupCourseById(id)
    })
}

type UseGroupCourseParams = {
    queryConfig?: QueryConfig<typeof getGroupCourseQueryOptions>
}

export const useGroupCourse = (id: string, params: UseGroupCourseParams = {}) => {
    return useQuery({
        ...getGroupCourseQueryOptions(id),
        ...params.queryConfig,
    })
}