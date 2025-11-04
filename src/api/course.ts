import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

export type CourseDescription = {
  id: string;
  idCourse: string;
  curriculum: string;
  method: string;
  silabus: string;
  totalJp: number;
  quota: number;
  grade: string;
  category: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type CourseGroup = {
  id: string;
  idCourse: string;
  idTeacher: string;
  isOpen: boolean;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type CourseResponse = {
  id: string;
  title: string;
  idManager: string;
  thumbnail: string;
  typeCourse: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  description: CourseDescription;
  groups: CourseGroup[];
  averageRating: number;
  totalUsers: number;
};

export const getCourses = async (): Promise<CourseResponse[]> => {
  const response = await axios.get(`${API_BASE_URL}/courses`);
  const course = response.data;
  return course;
};
