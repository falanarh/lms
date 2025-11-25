import { getSectionContent } from "@/api/sectionContent";
import { QueryConfig } from "@/lib/queryClient";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { DUMMY_USER_ID } from "@/config/api";

export const getSectionContentQueryKey = (courseId: string, userId: string) => [
  "section-content",
  courseId,
  userId,
];

export const getSectionContentQueryOptions = (
  courseId: string,
  userId: string = DUMMY_USER_ID
) => {
  return queryOptions({
    queryKey: getSectionContentQueryKey(courseId, userId),
    queryFn: () => getSectionContent(courseId, userId),
    enabled: !!courseId && !!userId,
  });
};

type UseSectionContentParams = {
  courseId: string;
  userId?: string;
  enabled?: boolean;
  queryConfig?: QueryConfig<typeof getSectionContentQueryOptions>;
};

export const useSectionContent = ({
  courseId,
  userId = DUMMY_USER_ID,
  enabled = true,
  queryConfig,
}: UseSectionContentParams) => {
  return useQuery({
    ...getSectionContentQueryOptions(courseId, userId),
    enabled,
    ...queryConfig,
  });
};