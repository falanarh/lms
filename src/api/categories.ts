import { API_BASE_URL } from "@/config/api";
import axios from "axios";

export type CategoriesResponse = {
  data: string[];
};

export const getCategories = async (): Promise<string[]> => {
  const response = await axios.get(`${API_BASE_URL}/group-courses/categories/list`);
  return response.data.data;
};
