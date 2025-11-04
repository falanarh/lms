import { Badge } from "@/components/ui/Badge/Badge";
import { Star, Users } from "lucide-react";

interface CourseInfoCardProps {
  category: string;
  rating: number;
  totalRatings: number;
  teacher: string;
  enrolled: number;
  type: string;
}

export const CourseInfoCard = ({
  category,
  rating,
  totalRatings,
  teacher,
  enrolled,
  type,
}: CourseInfoCardProps) => {
  // Render stars function
  const renderStars = () => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return [...Array(5)].map((_, i) => {
      if (i < fullStars) {
        return (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        return (
          <Star
            key={i}
            className="w-4 h-4 fill-yellow-400/50 text-yellow-400"
          />
        );
      } else {
        return <Star key={i} className="w-4 h-4 text-gray-300" />;
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header Section */}
      <div className="p-5 border-b border-gray-100">
        <Badge variant="secondary" size="sm" className="mb-3">
          {category}
        </Badge>

        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center gap-0.5">{renderStars()}</div>
          <span className="text-lg font-bold text-gray-900">{rating}</span>
        </div>
        <p className="text-xs text-gray-500">
          Based on {totalRatings.toLocaleString()} ratings
        </p>
      </div>

      {/* Details Section */}
      <div className="p-5 space-y-4">
        {/* Instructor */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-semibold text-sm">
              {teacher
                .split(" ")
                .map((word) => word.charAt(0))
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </span>
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-xs text-gray-500 mb-0.5">Instructor</p>
            <p className="text-sm font-semibold text-gray-900">{teacher}</p>
          </div>
        </div>

        {/* Students */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-emerald-600" strokeWidth={2} />
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-xs text-gray-500 mb-0.5">Students Enrolled</p>
            <p className="text-sm font-semibold text-gray-900">
              {enrolled.toLocaleString()} students
            </p>
          </div>
        </div>

        {/* Access Type */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-900 font-medium mb-1">
                Access Type
              </p>
              <p className="text-base font-bold text-gray-900">{type}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
