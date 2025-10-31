
import { getPosts } from "@/api/posts";
import { QueryConfig } from "@/lib/queryClient";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const getPostQueryKey = () => ["posts"]

export const getPostQueryOptions = () => {
    return queryOptions({
        queryKey: getPostQueryKey(),
        queryFn: getPosts
    })
}

type UsePostParams = {
    queryConfig?: QueryConfig<typeof getPostQueryOptions>
}

export const usePosts = (params: UsePostParams = {}) => {
    return useQuery({
        ...getPostQueryOptions(),
        ...params.queryConfig,
    })
}