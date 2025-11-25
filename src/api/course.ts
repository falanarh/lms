import axios from "axios";

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

// export const getCourses = async (): Promise<Course[]> => {
//   const response = await axios.get<Course[]>(
//     "http://10.101.20.150:3000/courses"
//   );
//   console.log("Fetched courses:", response);
//   return response.data;
// };

const BASE_URL =
  process.env.NEXT_PUBLIC_COURSE_BASE_URL || "http://localhost:3000";

export const getCourses = async (): Promise<CourseResponse[]> => {
  const response = await axios.get(`${BASE_URL}/courses`);
  const course = response.data.data;
  return course;
};

export const getCourseById = async (id: string): Promise<CourseResponse[]> => {
  const response = await axios.get(`${BASE_URL}/courses/${id}`);
  const course = response.data.data;
  return course;
};
