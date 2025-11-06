import { API_BASE_URL } from "@/config/api";
import axios from "axios";

export type Content = {
  id: string
  type: string
  name: string
  description: string
  contentUrl: string
  contentStart: string
  contentEnd: string
  sequence: number
}

export const getContents = async (): Promise<Content[]> => {
    const response = await axios.get<Content[]>(`${API_BASE_URL}/contents`, {
      withCredentials: false
    })
    return response.data
}

export const getContentsBySectionId = async (sectionId: string): Promise<Content[]> => {
  const response = await axios.get(`${API_BASE_URL}/sections/${sectionId}/content`);
  const content = response.data.data;
  return content;
};

export const createContent = async (newContent: Omit<Content, "id">): Promise<Content> => {
  const response = await axios.post<Content>(
    `${API_BASE_URL}/contents`,
    newContent,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
  return response.data
}

export const deleteContent = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/contents/${id}`)
}