import axios from "axios";

type Group = {
    id: string,
    idCourse: string,
    idTeacher: string,
    isOpen: boolean,
    name: string,
    description: string,
    createdAt: Date,
    updatedAt: Date
}

export type Section  = {
    id: string,
    idGroup: string,
    name: string,
    description: string,
    // content_start: Date,
    // content_end: Date,
    sequence: number,
    createdAt: Date,
    updatedAt: Date,
    group: Group
}


const BASE_URL = "http://10.101.20.150:3000"

export const getSections = async (): Promise<Section[]> => {
    const response = await axios.get<Section[]>(`${BASE_URL}/sections`, {
      withCredentials: false,
    })
    return response.data
}


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