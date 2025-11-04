import { RatingSummaryCard } from "@/features/course/components/RatingSummaryCard";
import { ReviewCard } from "./ReviewCard";

interface Review {
  id: string;
  userName: string;
  userInitials: string;
  avatarColor: string;
  rating: number;
  date: string;
  comment: string;
}

interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

interface RatingsReviewsTabProps {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: RatingDistribution;
  reviews: Review[];
}

export const RatingsReviewsTab = ({
  averageRating,
  totalRatings,
  ratingDistribution,
  reviews,
}: RatingsReviewsTabProps) => {
  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <RatingSummaryCard
        averageRating={averageRating}
        totalRatings={totalRatings}
        ratingDistribution={ratingDistribution}
        title="Student Ratings & Reviews"
        variant="yellow"
      />

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}

        {/* Load More Button */}
        <div className="flex justify-center pt-2">
          <button className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200">
            Load More Reviews
          </button>
        </div>
      </div>
    </div>
  );
};
