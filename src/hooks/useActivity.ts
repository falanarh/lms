import { startActivity, StartActivityRequest, checkEnroll, CheckEnrollResponse } from "@/api/activities";
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import type { QueryConfig } from "@/lib/queryClient";
import { DUMMY_USER_ID } from "@/config/api";

export const useStartActivity = (courseId: string, userId: string = DUMMY_USER_ID) => {
  return useMutation({
    mutationFn: () => startActivity({ idCourse: courseId, idUser: userId } as StartActivityRequest),
  });
};

export const getCheckEnrollQueryKey = (courseId: string, userId: string) => [
  "check-enroll",
  courseId,
  userId,
] as const;

export const getCheckEnrollQueryOptions = (
  courseId: string,
  userId: string = DUMMY_USER_ID
) => {
  return queryOptions({
    queryKey: getCheckEnrollQueryKey(courseId, userId),
    queryFn: () => checkEnroll(courseId, userId),
    enabled: !!courseId && !!userId,
  });
};

type UseCheckEnrollParams = {
  courseId: string;
  userId?: string;
  queryConfig?: QueryConfig<typeof getCheckEnrollQueryOptions>;
};

export const useCheckEnroll = ({
  courseId,
  userId = DUMMY_USER_ID,
  queryConfig,
}: UseCheckEnrollParams) => {
  return useQuery({
    ...getCheckEnrollQueryOptions(courseId, userId),
    ...queryConfig,
  });
};