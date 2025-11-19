import axios from "axios";
import { API_BASE_URL } from "@/config/api";

export type RatingDistribution = {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
};

export type RatingSummary = {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: RatingDistribution;
};

export type RatingSummaryResponse = {
  data: RatingSummary;
};

export const getRatingSummaryByCourseId = async (
  courseId: string
): Promise<RatingSummaryResponse> => {
  const response = await axios.get(
    `${API_BASE_URL}/activities/course/${courseId}/rating-summary`
  );
  return response.data;
};
