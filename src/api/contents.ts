import axios from "axios";

export type Content = {
  id_content?: string
  id_section: string
  type: string
  content_url: string
  name: string
  description: string
  content_start: string
  content_end: string
  sequence: number
  created_at?: string
  updated_at?: string
}

export const getContents = async (): Promise<Content[]> => {
    const response = await axios.get<Content[]>("http://10.101.20.150:3000/contents")
    return response.data
}

export const createContent = async (newContent: Omit<Content, "id_content" | "created_at" | "updated_at">): Promise<Content> => {
  const response = await axios.post<Content>(
    "http://10.101.20.150:3000/contents",
    newContent,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
  return response.data
}