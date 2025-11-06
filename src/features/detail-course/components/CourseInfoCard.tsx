import { Badge } from "@/components/ui/Badge/Badge";
import { Users } from "lucide-react";
import { renderStars } from "@/features/course/hooks/stars";
import { TeacherAvatar } from "@/features/course/components/TeacherAvatar";

interface CourseInfoCardProps {
  category: string;
  rating: number;
  totalRatings: number;
  // teacher: string;
  type: string;
  isEnrolled: boolean;
  onToggle: () => void;
}

export const CourseInfoCard = ({
  category,
  rating,
  totalRatings,
  // teacher,
  type,
  isEnrolled,
  onToggle,
}: CourseInfoCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header Section */}
      <div className="p-5 border-b border-gray-100">
        <Badge variant="secondary" size="sm" className="mb-3">
          {category}
        </Badge>

        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center gap-0.5">{renderStars(rating)}</div>
          <span className="text-lg font-bold text-gray-900">{rating}</span>
        </div>
        <p className="text-xs text-gray-500">
          Based on {totalRatings} ratings
        </p>
      </div>

      {/* Details Section */}
      <div className="p-5 space-y-4">
        {/* Instructor */}
        {/* //TODO: PERBAIKI KETIKA SUDAH ADA TEACHER */}
        <div className="flex items-start gap-3">
          <TeacherAvatar
            teacherName="Dr. John Smith"
            avatarUrl="https://i.pravatar.cc/150?img=12"
            size="lg"
          />
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-xs text-gray-500 mb-0.5">Instructor</p>
            <p className="text-sm font-semibold text-gray-900">Dr. John Smith</p>
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
              {totalRatings} students
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

        {/* Enroll Button */}
        <button
          onClick={onToggle}
          className={`
            w-full font-semibold text-base py-4 px-6 rounded-xl transition-all duration-200 
            flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl hover:-translate-y-0.5
            ${
              isEnrolled
                ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-green-500/25 hover:shadow-green-500/35"
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-500/25 hover:shadow-blue-500/35"
            }
          `}
        >
          {isEnrolled ? (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.6667 5L7.50004 14.1667L3.33337 10"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Enrolled</span>
            </>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 4V16M4 10H16"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Enroll Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
