import { RatingSummaryCard } from "@/features/course/components/RatingSummaryCard";
import { ReviewCard } from "../ReviewCard";
import { useInfiniteReviews } from "@/hooks/useReviews";
import { useRatingSummary } from "@/hooks/useRating";
import { Review } from "@/api/review";
import React from "react";

interface RatingsReviewsTabProps {
  groupCourseId: string;
}

export const RatingsReviewsTab = ({
  groupCourseId,
}: RatingsReviewsTabProps) => {
  const perPage = 3;
  
  // Fetch rating summary using API
  const { 
    data: ratingSummaryData, 
    isLoading: isLoadingRating,
    error: ratingError 
  } = useRatingSummary(groupCourseId);
  
  // Infinite reviews (3 per page)
  const {
    data: reviewsPages,
    isLoading: isLoadingReviews,
    error: reviewsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteReviews(groupCourseId, perPage);

  const reviews = React.useMemo((): Review[] => {
    const pages = (reviewsPages?.pages as Array<{ data: Review[] }> | undefined);
    return pages ? pages.flatMap((p) => p.data) : [];
  }, [reviewsPages]);
  
  // Extract rating data from API
  const ratingSummary = ratingSummaryData?.data;
  const averageRating = ratingSummary?.averageRating || 0;
  const totalRatings = ratingSummary?.totalRatings || 0;
  const ratingDistribution = ratingSummary?.ratingDistribution || {
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Loading state for rating summary
  if (isLoadingRating) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">Loading ratings...</div>
      </div>
    );
  }

  // Error state for rating summary
  if (ratingError) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-red-500">Error loading ratings</div>
      </div>
    );
  }

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
        {isLoadingReviews ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Loading reviews...</div>
          </div>
        ) : reviewsError ? (
          <div className="flex justify-center py-8">
            <div className="text-red-500">Error loading reviews</div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">No reviews yet</div>
          </div>
        ) : (
          <>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}

            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center pt-2">
                <button 
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load More Reviews'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
