import { Star } from "lucide-react";

interface Review {
  id: string;
  userName: string;
  userInitials: string;
  avatarColor: string;
  rating: number;
  date: string;
  comment: string;
}

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${review.avatarColor} flex items-center justify-center flex-shrink-0`}
        >
          <span className="text-white font-semibold text-sm">
            {review.userInitials}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">
                {review.userName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">{review.date}</span>
              </div>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
        </div>
      </div>
    </div>
  );
};
