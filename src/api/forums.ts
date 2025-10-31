import { queryOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";

export type Forum = {
  id: string;
  idCourse?: string;
  title: string;
  description?: string;
  type: "course" | "general";
  createdAt?: string;
  updatedAt?: string;
  lastActivity: string;
  totalTopics: number;
};

export type CreateForumRequest = {
  idCourse?: string;
  title: string;
  description: string;
  type: "course" | "general";
};

export type UpdateForumRequest = {
  idCourse?: string;
  title?: string;
  description?: string;
  type?: "course" | "general";
};

export type ForumResponse = {
  data: Forum[];
  status: number;
  message: string;
  success: boolean;
  meta?: any;
  links?: any;
  requestId?: string;
};

export const getForums = async (): Promise<Forum[]> => {
  try {
    const response = await axios.get<ForumResponse>("https://api-lms-kappa.vercel.app/forums", {withCredentials: false});
    if (response.data.status !== 200) {
      throw new Error(response.data.message || "Failed to fetch forums");
    }

    // Transform API data to match expected Forum type
    return response.data.data.map(forum => ({
      ...forum,
      // Use updatedAt as lastActivity since API doesn't provide lastActivity
      // lastActivity: forum.updatedAt || forum.createdAt || new Date().toISOString(),
      // Add default totalTopics since API doesn't provide it
      // totalTopics: 0,
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to connect to forum server");
    }
    throw error;
  }
};

export const createForum = async (forumData: CreateForumRequest): Promise<Forum> => {
  try {
    const response = await axios.post<{ status: number; data: Forum; message: string }>(
      "https://api-lms-kappa.vercel.app/forums",
      forumData,
      {
        withCredentials: false,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status < 200 || response.data.status >= 300) {
      throw new Error(response.data.message || "Failed to create forum");
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to connect to forum server");
    }
    throw error;
  }
};

export const updateForum = async (id: string, forumData: UpdateForumRequest): Promise<Forum> => {
  try {
    const response = await axios.patch<{ status: number; data: Forum; message: string }>(
      `https://api-lms-kappa.vercel.app/forums/${id}`,
      forumData,
      {
        withCredentials: false,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status < 200 || response.data.status >= 300) {
      throw new Error(response.data.message || "Failed to update forum");
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to connect to forum server");
    }
    throw error;
  }
};

export const useCreateForum = () => {
  return useMutation({
    mutationFn: createForum,
  });
};

export const useUpdateForum = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateForumRequest }) =>
      updateForum(id, data),
  });
};

export const getForumsQueryOptions = () => {
  return queryOptions({
    queryKey: ["forums"],
    queryFn: getForums,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};