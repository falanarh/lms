import axios from "axios";
import { API_BASE_URL } from "@/config/api";

// Type for group-courses list response
export type GroupCourse = {
  id: string;
  idCourse: string;
  title: string;
  thumbnail: string;
  kategori: string;
  rating: number;
  id_teacher: string;
  total_user: number;
  total_section: number;
  description: string;
};

// Type for group-courses detail response (by ID)
export type GroupCourseDetail = {
  id: string;
  idCourse: string;
  title: string;
  kategori: string;
  rating: number;
  total_rating: number;
  id_teacher: string;
  total_user: number;
  type_course: string;
  metode: string;
  jp: number;
  silabus: string;
  kuota: number;
  description: string;
};

export const getGroupCourses = async (): Promise<GroupCourse[]> => {
  const response = await axios.get(`${API_BASE_URL}/group-courses`);
  const course = response.data.data;
  return course;
};

export const getGroupCourseById = async (id: string): Promise<GroupCourseDetail[]> => {
  const response = await axios.get(`${API_BASE_URL}/group-courses/${id}`);
  const course = response.data.data;
  return course;
};

