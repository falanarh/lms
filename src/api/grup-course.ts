import axios from "axios";
import { API_BASE_URL } from "@/config/api";

// Type for group-courses list response (matches API structure)
export type GroupCourse = {
  id: string;
  idTeacher: string;
  rating: number;
  totalUserRating: number;
  _count: {
    listActivity: number;
  };
  course: {
    id: string;
    title: string;
    thumbnail: string | null;
    description: {
      category: string;
      description: string;
    };
  };
};

// Type for group-courses detail response (by ID)
export type GroupCourseDetail = {
  id: string;
  idTeacher: string;
  rating: number;
  totalUserRating: number;
  _count: {
    listActivity: number;
  };
  course: {
    id: string;
    title: string;
    thumbnail: string | null;
    typeCourse: string;
    description: {
      method: string;
      silabus: string;
      totalJp: number;
      quota: number;
      category: string;
      description: string;
    };
  };
};

export const getGroupCourses = async (): Promise<GroupCourse[]> => {
  const response = await axios.get(`${API_BASE_URL}/group-courses`);
  const courses = response.data.data;
  return courses;
};

export const getGroupCourseById = async (id: string): Promise<GroupCourseDetail> => {
  const response = await axios.get(`${API_BASE_URL}/group-courses/${id}`);
  const course = response.data.data;
  return course;
};

