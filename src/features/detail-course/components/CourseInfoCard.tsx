"use client";

import { Badge } from "@/components/ui/Badge/Badge";
import { ArrowRight, Plus, Users, Loader2, GraduationCap } from "lucide-react";
import { renderStars } from "@/features/course/hooks/stars";
import { TeacherAvatar } from "@/features/course/components/TeacherAvatar";
import { useRouter } from "next/navigation";

interface CourseInfoCardProps {
  category: string;
  rating: number;
  totalRatings: number;
  type: string;
  isEnrolled: boolean;
  onToggle: () => void;
  courseId?: string; // ID untuk navigasi ke my-course
  buttonLabel?: string;
  isProcessing?: boolean;
  teacherName: string;
}

export const CourseInfoCard = ({
  category,
  rating,
  totalRatings,
  type,
  isEnrolled,
  onToggle,
  courseId,
  buttonLabel,
  isProcessing = false,
  teacherName,
}: CourseInfoCardProps) => {
  const router = useRouter();
  const label = buttonLabel ?? (isEnrolled ? "Start Learning" : "Enroll Now");

  const handleButtonClick = () => {
    if (label !== "Enroll Now" && courseId) {
      router.push(`/my-course/${courseId}`);
      return;
    }
    onToggle();
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <Badge variant="secondary" size="sm" className="mb-3">
          {category}
        </Badge>

        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center gap-0.5">{renderStars(rating)}</div>
          <span className="text-lg font-bold text-gray-900">{rating}</span>
        </div>
        <p className="text-xs text-gray-500">Based on {totalRatings} ratings</p>
      </div>
      <div className="p-5 space-y-4">
        {/* Teacher */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-blue-600" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-xs text-gray-500 mb-0.5">Teacher</p>
            <p className="text-sm font-semibold text-gray-900">{teacherName}</p>
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
          onClick={handleButtonClick}
          disabled={label === "Enroll Now" && isProcessing}
          className={`
            w-full font-semibold text-base py-4 px-6 rounded-xl transition-all duration-200 
            flex items-center justify-center gap-2.5 hover:-translate-y-0.5
            ${
              label === "Enroll Now"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
            }
            ${label === "Enroll Now" && isProcessing ? "opacity-75 cursor-not-allowed" : ""}
          `}
        >
          {label === "Enroll Now" ? (
            <>
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              <span>{isProcessing ? "Processing..." : label}</span>
            </>
          ) : (
            <>
              <span>{label}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
