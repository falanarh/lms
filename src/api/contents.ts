import axios from "axios";

export type Content = {
  id: string
  idSection: string
  type: string
  contentUrl: string
  name: string
  description: string
  contentStart: string
  contentEnd: string
  sequence: number
  createdAt?: string
  updatedAt?: string
}


const BASE_URL = "http://10.101.20.150:3000"

export const getContents = async (): Promise<Content[]> => {
    const response = await axios.get<Content[]>(`${BASE_URL}/contents`, {
      withCredentials: false
    })
    return response.data
}

export const createContent = async (newContent: Omit<Content, "id" | "createdAt" | "updatedAt">): Promise<Content> => {
  const response = await axios.post<Content>(
    `${BASE_URL}/contents`,
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
  await axios.delete(`${BASE_URL}/contents/${id}`)
}