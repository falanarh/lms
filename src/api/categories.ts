import { API_COURSE_BASE_URL } from "@/config/api";
import axios from "axios";

export type CategoriesResponse = {
  data: string[];
};

export const getCategories = async (): Promise<string[]> => {
  const response = await axios.get(`${API_COURSE_BASE_URL}/courses/categories/list`);
  return response.data.data;
};
