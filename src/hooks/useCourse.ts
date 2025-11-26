import { deleteCourseZoomUrl, getCourseById, updateCourseZoomUrl } from "@/api/course";
import { UpdateZoomUrlInput } from "@/schemas/course.schema";
import { MutationConfig, queryClient, QueryConfig } from "@/lib/queryClient";
import { queryOptions, useMutation, UseMutationOptions, useQuery } from "@tanstack/react-query";

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

type UpdateZoomUrlVariables = {
  courseId: string;
  data: UpdateZoomUrlInput;
};

type UseUpdateZoomUrlOptions = {
  mutationConfig?: UseMutationOptions<any, Error, UpdateZoomUrlVariables, unknown>;
};

export const useUpdateZoomUrl = (
  { mutationConfig }: UseUpdateZoomUrlOptions = {}
) => {
  return useMutation({
    mutationFn: ({ courseId, data }: UpdateZoomUrlVariables) => 
      updateCourseZoomUrl(courseId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: getCourseQueryKey(variables.courseId) });
      queryClient.setQueryData(getCourseQueryKey(variables.courseId), data);
    },
    ...mutationConfig,
  });
};

type UseDeleteZoomUrlOptions = {
  mutationConfig?: MutationConfig<typeof deleteCourseZoomUrl>;
};

export const useDeleteZoomUrl = (
  { mutationConfig }: UseDeleteZoomUrlOptions = {}
) => {
  return useMutation({
    mutationFn: (courseId: string) => deleteCourseZoomUrl(courseId),
    onSuccess: (data, courseId) => {
      queryClient.invalidateQueries({ queryKey: getCourseQueryKey(courseId) });
      queryClient.setQueryData(getCourseQueryKey(courseId), data);
    },
    ...mutationConfig,
  });
};