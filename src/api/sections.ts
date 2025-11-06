import { API_BASE_URL } from "@/config/api";
import axios from "axios";

export type Section  = {
    id: string,
    name: string,
    description: string,
    sequence: number
}

export const getSections = async (): Promise<Section[]> => {
    const response = await axios.get<Section[]>(`${API_BASE_URL}/sections`, {
      withCredentials: false,
    })
    return response.data
}

export const getSectionsByGroupId = async (groupId: string): Promise<Section[]> => {
  const response = await axios.get(`${API_BASE_URL}/group-courses/${groupId}/section`);
  return response.data.data;
};

export const createSection = async (newSection: Omit<Section, "id" | "group" | "createdAt" | "updatedAt">): Promise<Section> => {
  const response = await axios.post<Section>(
    `${API_BASE_URL}/sections`,
    newSection,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
  return response.data
}

export const updateSection = async (
  id: string,
  updatedData: Partial<Omit<Section, "id" | "group" | "createdAt" | "updatedAt">>
): Promise<Section> => {
  const response = await axios.patch<Section>(
    `${API_BASE_URL}/sections/${id}`,
    updatedData,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const deleteSection = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/sections/${id}`)
}