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
  sortBy?: string
): Promise<GroupCourse[]> => {
  const params = new URLSearchParams();
  
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
  if (sortBy) {
    switch (sortBy) {
      case 'title-desc':
        params.append('orderBy[0][course][title]', 'desc');
        break;
      case 'rating-desc':
        params.append('orderBy[0][rating]', 'desc');
        break;
      case 'students-desc':
        params.append('orderBy[0][_count][listActivity]', 'desc');
        break;
      // 'title-asc' adalah default, tidak perlu parameter
    }
  }
  
  const queryString = params.toString();
  const url = queryString 
    ? `${API_BASE_URL}/group-courses?${queryString}`
    : `${API_BASE_URL}/group-courses`;
    
  const response = await axios.get(url);
  const courses = response.data.data;
  return courses;
};

export const getGroupCourseById = async (id: string): Promise<GroupCourseDetail> => {
  const response = await axios.get(`${API_BASE_URL}/group-courses/${id}`);
  const course = response.data.data;
  return course;
};

