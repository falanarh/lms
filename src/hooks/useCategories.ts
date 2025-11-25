import { getCategories } from "@/api/categories";
import { QueryConfig } from "@/lib/queryClient";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const getCategoriesQueryKey = () => ["categories"];

export const getCategoriesQueryOptions = () => {
    return queryOptions({
        queryKey: getCategoriesQueryKey(),
        queryFn: getCategories
    });
};

type UseCategoriesParams = {
    queryConfig?: QueryConfig<typeof getCategoriesQueryOptions>;
};

export const useCategories = (params: UseCategoriesParams = {}) => {
    return useQuery({
        ...getCategoriesQueryOptions(),
        ...params.queryConfig,
    });
};
