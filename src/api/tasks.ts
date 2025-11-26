import axios from "axios";
import { API_QUIZ_BASE_URL } from "@/config/api";

export type TaskDetail = {
  idContent: string;
  name: string;
  description: string;
  taskUrl: string | null;
  isRequired: boolean;
  dueDate: string | null;
  createdBy: string;
};

export type TaskAttemptStatus =
  | "SUBMITTED"
  | "GRADED"
  | "NOT_SUBMITTED"
  | string;

export type TaskAttempt = {
  id: string;
  idUser: string;
  idContent: string;
  urlFile: string | null;
  totalScore: number | null;
  feedback: string | null;
  status: TaskAttemptStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskAttemptRequest = {
  idUser: string;
  idContent: string;
  urlFile: string;
};

export type UpdateTaskAttemptRequest = {
  idUser: string;
  idContent: string;
  urlFile: string | null;
};

export const getTaskById = async (
  idTask: string
): Promise<TaskDetail | null> => {
  try {
    const response = await axios.get<TaskDetail>(
      `${API_QUIZ_BASE_URL}/tasks/${idTask}`,
      {
        withCredentials: false,
      }
    );
    return response.data;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 404 || error.response?.status === 400)
    ) {
      return null;
    }
    throw error;
  }
};

export const getTaskAttempt = async (
  idUser: string,
  idContent: string
): Promise<TaskAttempt | null> => {
  try {
    const response = await axios.get<TaskAttempt>(
      `${API_QUIZ_BASE_URL}/task-attempts/${idUser}/${idContent}`,
      { withCredentials: false }
    );
    return response.data;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 404 || error.response?.status === 400)
    ) {
      return null;
    }
    throw error;
  }
};

export const createTaskAttempt = async (
  payload: CreateTaskAttemptRequest
): Promise<TaskAttempt> => {
  const response = await axios.post<TaskAttempt>(
    `${API_QUIZ_BASE_URL}/task-attempts`,
    payload,
    {
      headers: { "Content-Type": "application/json" },
      withCredentials: false,
    }
  );
  return response.data;
};

export const updateTaskAttempt = async (
  id: string,
  payload: UpdateTaskAttemptRequest
): Promise<TaskAttempt> => {
  const response = await axios.patch<TaskAttempt>(
    `${API_QUIZ_BASE_URL}/task-attempts/${id}`,
    payload,
    {
      headers: { "Content-Type": "application/json" },
      withCredentials: false,
    }
  );
  return response.data;
};
