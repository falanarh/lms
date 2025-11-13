import axios from "axios";
import { API_COURSE_BASE_URL } from "@/config/api";

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

export const getRatingSummaryByGroupCourse = async (
  groupCourseId: string
): Promise<RatingSummaryResponse> => {
  const response = await axios.get(
    `${API_COURSE_BASE_URL}/activities/group-course/${groupCourseId}/rating-summary`
  );
  return response.data;
};
