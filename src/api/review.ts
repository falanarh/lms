import axios from "axios";
import { API_COURSE_BASE_URL } from "@/config/api";

export type ReviewUser = {
  name: string;
};

export type Review = {
  id: string;
  rating: number;
  comment: string;
  user: ReviewUser;
  createdAt?: string; // Optional karena belum ada di response saat ini
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

export type ReviewResponse = {
  data: Review[];
  pageMeta: PageMeta;
};

export const getReviewsByGroupCourse = async (
  groupCourseId: string,
  page: number = 1,
  perPage: number = 20
): Promise<ReviewResponse> => {
  const response = await axios.get(
    `${API_COURSE_BASE_URL}/activities/group-course/${groupCourseId}/rating-reviews`,
    {
      params: {
        page,
        perPage,
      },
    }
  );
  return response.data;
};

export const getReviewById = async (id: string): Promise<Review> => {
  const response = await axios.get(`${API_COURSE_BASE_URL}/reviews/${id}`);
  return response.data.data;
};
