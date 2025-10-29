import { getSections } from "@/api/sections";
import { QueryConfig } from "@/lib/queryClient";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const getSectionQueryKey = () => ["sections"]

export const getSectionQueryOptions = () => {
    return queryOptions({
        queryKey: getSectionQueryKey(),
        queryFn: getSections
    })
}

type UseSectionParams = {
    queryConfig?: QueryConfig<typeof getSectionQueryOptions>
}

export const useSections = (params: UseSectionParams = {}) => {
    return useQuery({
        ...getSectionQueryOptions(),
        ...params.queryConfig,
    })
}