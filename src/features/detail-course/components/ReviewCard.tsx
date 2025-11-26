import { Review } from "@/api/review";
import Image from "next/image";
import { renderStars } from "@/features/course/hooks/stars";

const getFormattedDate = (createdAt?: string): string => {
  if (createdAt) {
    return new Date(createdAt).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  }
  
  // Default date jika belum ada createdAt di API
  return new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
  const formattedDate = getFormattedDate(review.createdAt);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-start gap-4">
        <Image
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format"
          alt="Profile"
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">
                John Doe
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5">
                  {renderStars(review.rating, { size: "sm" })}
                </div>
                <span className="text-xs text-gray-500">{formattedDate}</span>
              </div>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
        </div>
      </div>
    </div>
  );
};
