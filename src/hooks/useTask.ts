import { useMutation, useQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import {
  createTaskAttempt,
  getTaskAttempt,
  getTaskById,
  updateTaskAttempt,
  type TaskDetail,
  type TaskAttempt,
} from "@/api/tasks";

export const getTaskDetailQueryKey = (idTask: string) => [
  "task-detail",
  idTask,
];
export const getTaskAttemptQueryKey = (idUser: string, idContent: string) => [
  "task-attempt",
  idUser,
  idContent,
];

export const getTaskDetailQueryOptions = (idTask: string) =>
  queryOptions({
    queryKey: getTaskDetailQueryKey(idTask),
    queryFn: () => getTaskById(idTask),
    enabled: !!idTask,
  });

export const getTaskAttemptQueryOptions = (idUser: string, idContent: string) =>
  queryOptions({
    queryKey: getTaskAttemptQueryKey(idUser, idContent),
    queryFn: () => getTaskAttempt(idUser, idContent),
    enabled: !!idUser && !!idContent,
  });

export const useTaskDetail = (idTask: string, config: any = {}) => {
  return useQuery({
    ...getTaskDetailQueryOptions(idTask),
    ...config,
  });
};

export const useTaskAttempt = (
  idUser: string,
  idContent: string,
  config: any = {}
) => {
  return useQuery({
    ...getTaskAttemptQueryOptions(idUser, idContent),
    ...config,
  });
};

export const useSubmitTaskAttempt = (config: any = {}) => {
  return useMutation({
    mutationFn: (payload: {
      idUser: string;
      idContent: string;
      urlFile: string;
    }) => createTaskAttempt(payload),
    ...config,
  });
};

export const useUpdateTaskAttempt = (config: any = {}) => {
  return useMutation({
    mutationFn: ({
      idTask,
      payload,
    }: {
      idTask: string;
      payload: { idUser: string; idContent: string; urlFile: string | null };
    }) => updateTaskAttempt(idTask, payload),
    ...config,
  });
};
