import axios from "axios";
import { Content } from "./contents";

export type Section  = {
    id: string,
    name: string,
    description: string,
    // content_start: Date,
    // content_end: Date,
    sequence: number,
    createdAt: Date,
    updatedAt: Date,
    listContents?: Content[],
    // group: Group
}


const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://service-courses.vercel.app/api/v1"

export const getSections = async (): Promise<Section[]> => {
    const response = await axios.get<Section[]>(`${BASE_URL}/sections?idGroup=12ecb1ea-e097-43af-9d6c-8f5a6e6098f0&orderBy[0][sequence]=asc`, {
      withCredentials: false,
    })
    return response.data
}

export const getSectionsByGroupId = async (groupId: string): Promise<Section[]> => {
  const response = await axios.get(`${BASE_URL}/group-courses/${groupId}/section`);
  return response.data.data;
};

export const createSection = async (newSection: Omit<Section, "id" | "group" | "createdAt" | "updatedAt">): Promise<Section> => {
  const response = await axios.post<Section>(
    `${BASE_URL}/sections`,
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
    `${BASE_URL}/sections/${id}`,
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
  await axios.delete(`${BASE_URL}/sections/${id}`)
}