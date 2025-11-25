import axios from "axios";
import { API_BASE_URL } from "@/config/api";

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

// Tipe item untuk list /courses, mengikuti response backend (memiliki properti groupCourse)
export type Course = {
  id: string;
  idTeacher: string;
  zoomUrl?: string | null;
  rating: number;
  totalUserRating: number;
  _count: {
    listActivity: number;
  };
  groupCourse: {
    id: string;
    title: string;
    thumbnail: string | null;
    description?: {
      category: string;
      description: string;
    };
  };
};

export type CoursesResponse = {
  data: Course[];
  pageMeta: PageMeta;
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
    params.append("groupCourse[description][category][contains]", selectedCategory);
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
    data: response.data.data as Course[],
    pageMeta: response.data.pageMeta,
  };
};

export type CourseDetail = {
  id: string;
  idTeacher: string;
  zoomUrl?: string | null;
  rating: number;
  totalUserRating: number;
  _count: {
    listActivity: number;
  };
  groupCourse: {
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

export const getCourseById = async (id: string): Promise<CourseDetail> => {
  const response = await axios.get(`${API_BASE_URL}/courses/${id}`);
  return response.data.data as CourseDetail;
};

