import axios from "axios";
import { UpdateZoomUrlInput } from "@/schemas/course.schema";
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
  id?: string;
  isOpen: boolean;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type PageMeta = {
  page: number;
  perPage: number;
  hasPrev: boolean;
  hasNext: boolean;
  totalPageCount: number;
  showingFrom: number;
  showingTo: number;
  resultCount: number;
  totalResultCount: number;
};

export type Course = {
  id: string;
  idCourse: string;
  idTeacher: string;
  teacherName: string;
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
  zoomUrl?: string;
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

// export const getCourses = async (
//   searchQuery?: string,
//   selectedCategory?: string,
//   sortBy?: string,
//   page: number = 1,
//   perPage: number = 8
// ): Promise<CourseResponse[]> => {
//   const params = new URLSearchParams();
//   if (searchQuery) params.append('search', searchQuery);
//   if (selectedCategory) params.append('category', selectedCategory);
//   if (sortBy) params.append('sortBy', sortBy);
//   params.append('page', page.toString());
//   params.append('perPage', perPage.toString());

//   const response = await axios.get(`${BASE_URL}/courses?${params.toString()}`);
//   const course = response.data.data;
//   return course;
// };

export type CoursesResponse = {
  data: CourseApiItem[];
  pageMeta: PageMeta;
};

// New API item type for the list response — separate from `CourseResponse` (owned by a teammate)
export type CourseApiItem = {
  id: string;
  idTeacher?: string;
  zoomUrl?: string | null;
  rating?: number;
  totalUserRating?: number;
  _count?: {
    listActivity?: number;
  };
  groupCourse?: {
    id?: string;
    title?: string;
    thumbnail?: string | null;
    description?: {
      category?: string;
      description?: string;
    };
  };
  teacherName?: string;
};

export const getCourses = async (
  searchQuery?: string,
  selectedCategory?: string,
  sortBy?: string,
  page: number = 1,
  perPage: number = 8
): Promise<CoursesResponse> => {
  const params = new URLSearchParams();

  params.append("page", page.toString());
  params.append("perPage", perPage.toString());

  if (searchQuery && searchQuery.trim()) {
    params.append("groupCourse[title][contains]", searchQuery);
    params.append("groupCourse[title][mode]", "insensitive");
  }

  if (selectedCategory && selectedCategory !== "All Categories") {
    params.append(
      "groupCourse[description][category][contains]",
      selectedCategory
    );
    params.append("groupCourse[description][category][mode]", "insensitive");
  }

  if (sortBy && sortBy !== "none") {
    switch (sortBy) {
      case "title-asc":
        params.append("orderBy[0][groupCourse][title]", "asc");
        break;
      case "title-desc":
        params.append("orderBy[0][groupCourse][title]", "desc");
        break;
      case "rating-desc":
        params.append("orderBy[0][rating]", "desc");
        break;
      case "students-desc":
        params.append("orderBy[0][listActivity][_count]", "desc");
        break;
    }
  }

  const queryString = params.toString();
  const url = `${API_BASE_URL}/courses?${queryString}`;
  const response = await axios.get(url);

  return {
    data: response.data.data as CourseApiItem[],
    pageMeta: response.data.pageMeta,
  };
};

export const getCourseById = async (id: string): Promise<CourseDetail> => {
  const response = await axios.get(`${BASE_URL}/courses/${id}`);
  const course = response.data.data;
  // Handle both array and object responses from API
  return Array.isArray(course) ? course[0] : course;
};

export type CourseDetail = {
  id: string;
  idTeacher?: string;
  teacherName?: string;
  zoomUrl?: string | null;
  rating?: number;
  averageRating?: number;
  totalUserRating?: number;
  totalUsers?: number;
  title?: string;
  typeCourse?: string;
  description?: {
    method?: string;
    silabus?: string;
    totalJp?: number;
    quota?: number;
    category?: string;
    description?: string;
  };
  _count?: {
    listActivity?: number;
  };
  groupCourse?: {
    id?: string;
    title?: string;
    thumbnail?: string | null;
    typeCourse?: string;
    description?: {
      method?: string;
      silabus?: string;
      totalJp?: number;
      quota?: number;
      category?: string;
      description?: string;
    };
  };
};

export const updateCourseZoomUrl = async (
  courseId: string,
  data: UpdateZoomUrlInput
): Promise<any> => {
  const response = await axios.patch(
    `${BASE_URL}/courses/${courseId}/zoom-url`,
    data
  );
  return response.data.data;
};

export const deleteCourseZoomUrl = async (courseId: string): Promise<any> => {
  const response = await axios.delete(
    `${BASE_URL}/courses/${courseId}/zoom-url`
  );
  return response.data.data;
};
