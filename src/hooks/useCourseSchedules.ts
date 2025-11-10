import { createCourseSchedule, deleteCourseSchedule, getCourseSchedules, updateCourseSchedule, CourseSchedule } from "@/api/courseSchedules";
import { MutationConfig, queryClient, QueryConfig } from "@/lib/queryClient";
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

export const getCourseSchedulesQueryKey = (idGroup: string) => ["courseSchedules", idGroup]

export const getCourseSchedulesQueryOptions = (idGroup: string) => {
    return queryOptions({
        queryKey: getCourseSchedulesQueryKey(idGroup),
        queryFn: () => getCourseSchedules(idGroup)
    })
}

type UseCourseSchedulesParams = {
    idGroup: string;
    queryConfig?: QueryConfig<typeof getCourseSchedulesQueryOptions>
}

export const useCourseSchedules = (params: UseCourseSchedulesParams) => {
    return useQuery({
        ...getCourseSchedulesQueryOptions(params.idGroup),
        ...params.queryConfig,
    })
}

export const useCreateCourseSchedule = (
  config: MutationConfig<typeof createCourseSchedule> = {}
) => {
  return useMutation({
    mutationFn: createCourseSchedule,
    onSuccess: async (...args) => {
      // Force immediate refetch of course schedules list
      await queryClient.refetchQueries({ queryKey: ["courseSchedules"] })
      // Call the config's onSuccess if provided
      await config.onSuccess?.(...args)
    },
    ...config,
  })
}

export const useDeleteCourseSchedule = (
  config: MutationConfig<typeof deleteCourseSchedule> = {}
) => {
  return useMutation({
    mutationFn: deleteCourseSchedule,
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: ["courseSchedules"] })
      await config.onSuccess?.(...args)
    },
    ...config,
  })
}

export const useUpdateCourseSchedule = (
  config: {
    onSuccess?: (data: CourseSchedule) => void | Promise<void>;
    onError?: (error: Error) => void | Promise<void>;
  } = {}
) => {
  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: Partial<Omit<CourseSchedule, "id" | "groupCourse" | "masterContent" | "createdAt" | "updatedAt">>
    }) => updateCourseSchedule(id, data),
    onSuccess: async (data, variables, context) => {
      await queryClient.refetchQueries({ queryKey: ["courseSchedules"] });
      await config.onSuccess?.(data);
    },
    onError: async (error) => {
      await config.onError?.(error);
    },
  });
};
