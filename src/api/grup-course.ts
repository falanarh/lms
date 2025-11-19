import { API_COURSE_BASE_URL } from "@/config/api";
import axios from "axios";

// Type for group-courses list response (matches API structure)
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

export type GroupCoursesResponse = {
  data: GroupCourse[];
  pageMeta: PageMeta;
};

export type GroupCourse = {
  id: string;
  idTeacher: string;
  zoomUrl?: string | null;
  rating: number;
  totalUserRating: number;
  _count: {
    listActivity: number;
  };
  course: {
    id: string;
    title: string;
    thumbnail: string | null;
    description?: {
      category: string;
      description: string;
    };
  };
};

// Type for group-courses detail response (by ID)
export type GroupCourseDetail = {
  id: string;
  idTeacher: string;
  zoomUrl?: string | null;
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

export const getGroupCourses = async (
  searchQuery?: string,
  selectedCategory?: string,
  sortBy?: string,
  page: number = 1,
  perPage: number = 8
): Promise<GroupCoursesResponse> => {
  const params = new URLSearchParams();
  
  // Pagination parameters
  params.append('page', page.toString());
  params.append('perPage', perPage.toString());
  
  // Search parameter
  if (searchQuery && searchQuery.trim()) {
    params.append('course[title][contains]', searchQuery);
    params.append('course[title][mode]', 'insensitive');
  }
  
  // Category parameter
  if (selectedCategory && selectedCategory !== 'All Categories') {
    params.append('course[description][category][contains]', selectedCategory);
    params.append('course[description][category][mode]', 'insensitive');
  }
  
  // Sorting parameters
  if (sortBy && sortBy !== 'none') {
    switch (sortBy) {
      case 'title-asc':
        params.append('orderBy[0][course][title]', 'asc');
        break;
      case 'title-desc':
        params.append('orderBy[0][course][title]', 'desc');
        break;
      case 'rating-desc':
        params.append('orderBy[0][rating]', 'desc');
        break;
      case 'students-desc':
        params.append('orderBy[0][listActivity][_count]', 'desc');
        break;
    }
  }
  
  const queryString = params.toString();
  const url = `${API_COURSE_BASE_URL}/group-courses?${queryString}`;
    
  const response = await axios.get(url);
  return {
    data: response.data.data,
    pageMeta: response.data.pageMeta
  };
};

export const getGroupCourseById = async (id: string): Promise<GroupCourseDetail> => {
  const response = await axios.get(`${API_COURSE_BASE_URL}/group-courses/${id}`);
  const course = response.data.data;
  return course;
};

