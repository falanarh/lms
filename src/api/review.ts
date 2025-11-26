import axios from "axios";
import { API_BASE_URL, DUMMY_USER_ID } from "@/config/api";

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

export type CreateReviewRequest = {
  rating: number;
  comment: string;
};

export type CreateReviewResponse = {
  data: Review;
  message: string;
};

export const getReviewsByCourseId = async (
  courseId: string,
  page: number = 1,
  perPage: number = 20
): Promise<ReviewResponse> => {
  const response = await axios.get(
    `${API_BASE_URL}/activities/course/${courseId}/rating-reviews`,
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
  const response = await axios.get(`${API_BASE_URL}/reviews/${id}`);
  return response.data.data;
};

export const createReview = async (
  idCourse: string,
  reviewData: CreateReviewRequest,
  idUser: string = DUMMY_USER_ID
): Promise<CreateReviewResponse> => {
  const response = await axios.patch(
    `${API_BASE_URL}/activities/rating`,
    {
      ...reviewData,
      idCourse,
      idUser,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};
