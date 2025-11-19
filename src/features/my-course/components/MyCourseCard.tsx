import { Users, Clock, Award, Play, BookOpen, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge/Badge";
import { EnrolledCourse, ViewModeValue } from "../types";
import { ArrowRight } from "lucide-react";
import { TeacherAvatar } from "@/features/course/components/TeacherAvatar";
import { renderStars } from "@/features/course/hooks/stars";
import Link from "next/link";

interface MyCourseCardProps {
  course: EnrolledCourse;
  viewMode?: ViewModeValue;
}

export function MyCourseCard({ course, viewMode = "grid-4" }: MyCourseCardProps) {
  const getProgressColor = (percentage: number) => {
    if (percentage === 0) return "bg-gray-200 dark:bg-gray-700";
    if (percentage < 30) return "bg-red-500";
    if (percentage < 70) return "bg-yellow-500";
    if (percentage < 100) return "bg-blue-500";
    return "bg-green-500";
  };

  const getProgressTextColor = (percentage: number) => {
    if (percentage === 0) return "text-gray-500 dark:text-gray-400";
    if (percentage < 30) return "text-red-600 dark:text-red-400";
    if (percentage < 70) return "text-yellow-600 dark:text-yellow-400";
    if (percentage < 100) return "text-blue-600 dark:text-blue-400";
    return "text-green-600 dark:text-green-400";
  };

  const getProgressLabel = (percentage: number) => {
    if (percentage === 0) return "Not Started";
    if (percentage < 100) return "In Progress";
    return "Completed";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (viewMode === "grid-4") {
    return (
      <Link href={`/my-course/${course.id}`}>
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl hover:cursor-pointer group">
          {/* Thumbnail */}
          <div className="aspect-video relative overflow-hidden">
            <img
              src={
                course.course.thumbnail ||
                "https://dummyimage.com/600x400/000/fff&text=Course"
              }
              alt={course.course.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Progress Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              {/* Progress Badge */}
              <div className="absolute top-3 left-3">
                <Badge
                  variant="secondary"
                  className={`${
                    course.progress.percentage === 100
                      ? 'bg-green-500 text-white'
                      : 'bg-white/90 text-gray-900'
                  }`}
                >
                  {course.progress.percentage}%
                </Badge>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="bg-white text-gray-900 px-6 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition-[background,transform,gap] duration-300 hover:bg-gray-100 dark:hover:bg-zinc-200 hover:gap-3 shadow-lg">
                  <Play className="w-4 h-4" />
                  Lanjut Belajar
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Progress Info */}
              {/* <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm rounded-lg p-2">
                  <div className="flex justify-between items-center text-xs text-gray-700 dark:text-gray-300 mb-1">
                    <span>Progress</span>
                    <span className="font-medium">{course.progress.completedLessons}/{course.progress.totalLessons} lessons</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(course.progress.percentage)}`}
                      style={{ width: `${course.progress.percentage}%` }}
                    />
                  </div>
                </div>
              </div> */}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col">
            <div className="space-y-2">
              <Badge variant="secondary" size="sm">
                {course.course.description?.category}
              </Badge>
              <div className="min-h-[56px] md:min-h-[64px]">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 line-clamp-2 transition-colors duration-200">
                  {course.course.title}
                </h3>
              </div>
            </div>

            {/* Course Info */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {renderStars(course.rating)}
                </div>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {course.rating}/5.00
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <TeacherAvatar
                  teacherName="Dr. John Smith"
                  avatarUrl="https://i.pravatar.cc/150?img=12"
                  size="sm"
                />
                <span>Dr. John Smith</span>
              </div>

              <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Last accessed: {formatDate(course.lastAccessedAt)}</span>
                </div>
                {course.certificate.isIssued && (
                  <Award className="w-4 h-4 text-yellow-500" title="Certificate Available" />
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-medium ${getProgressTextColor(course.progress.percentage)}`}>
                  {getProgressLabel(course.progress.percentage)}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {course.progress.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(course.progress.percentage)}`}
                  style={{ width: `${course.progress.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (viewMode === "grid-2") {
    return (
      <Link href={`/my-course/${course.id}`}>
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl group hover:cursor-pointer flex flex-col md:flex-row">
          <div className="w-full md:w-48 flex-shrink-0 relative overflow-hidden">
            <img
              src={
                course.course.thumbnail ||
                "https://dummyimage.com/600x400/000/fff&text=Course"
              }
              alt={course.course.title}
              className="w-full h-48 md:h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Progress Overlay for Grid-2 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <div className="absolute top-3 left-3">
                <Badge
                  variant="secondary"
                  className={`${
                    course.progress.percentage === 100
                      ? 'bg-green-500 text-white'
                      : 'bg-white/90 text-gray-900'
                  }`}
                >
                  {course.progress.percentage}%
                </Badge>
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm rounded-lg p-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(course.progress.percentage)}`}
                      style={{ width: `${course.progress.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 flex flex-col">
            <div className="space-y-2">
              <Badge variant="secondary" size="sm">
                {course.course.description?.category}
              </Badge>
              <div className="min-h-[56px] md:min-h-[64px]">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 line-clamp-2 transition-colors duration-200">
                  {course.course.title}
                </h3>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {renderStars(course.rating)}
                </div>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {course.rating}/5.00
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <TeacherAvatar
                  teacherName="Dr. John Smith"
                  avatarUrl="https://i.pravatar.cc/150?img=12"
                  size="sm"
                />
                <span>Dr. John Smith</span>
              </div>

              <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(course.lastAccessedAt)}</span>
                </div>
                {course.certificate.isIssued && (
                  <Award className="w-4 h-4 text-yellow-500" title="Certificate Available" />
                )}
              </div>
            </div>

            {/* Progress Section */}
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-medium ${getProgressTextColor(course.progress.percentage)}`}>
                  {getProgressLabel(course.progress.percentage)}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {course.progress.completedLessons}/{course.progress.totalLessons} lessons
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(course.progress.percentage)}`}
                  style={{ width: `${course.progress.percentage}%` }}
                />
              </div>
            </div>

            <div className="mt-auto pt-4">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors duration-200">
                <Play className="w-4 h-4" />
                Lanjut Belajar
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (viewMode === "list") {
    return (
      <Link href={`/my-course/${course.id}`}>
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl group hover:cursor-pointer">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Thumbnail */}
              <div className="w-full md:w-48 flex-shrink-0">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <img
                    src={
                      course.course.thumbnail ||
                      "https://dummyimage.com/600x400/000/fff&text=Course"
                    }
                    alt={course.course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Progress Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge
                      variant="secondary"
                      className={`${
                        course.progress.percentage === 100
                          ? 'bg-green-500 text-white'
                          : 'bg-white/90 text-gray-900'
                      }`}
                    >
                      {course.progress.percentage}%
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" size="sm">
                        {course.course.description?.category}
                      </Badge>
                      {course.certificate.isIssued && (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Award className="w-4 h-4" />
                          <span className="text-xs">Certificate</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
                      {course.course.title}
                    </h3>
                    {course.course.description?.description && (
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2">
                        {course.course.description.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1">
                        {renderStars(course.rating)}
                      </div>
                      <span>{course.rating}/5.00</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <Users className="w-4 h-4" />
                      <span>{course._count.listActivity} students</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <Clock className="w-4 h-4" />
                      <span>Last: {formatDate(course.lastAccessedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="w-full md:w-64">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${getProgressTextColor(course.progress.percentage)}`}>
                        {getProgressLabel(course.progress.percentage)}
                      </span>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        {course.progress.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(course.progress.percentage)}`}
                        style={{ width: `${course.progress.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {course.progress.completedLessons} of {course.progress.totalLessons} lessons completed
                    </div>
                  </div>

                  <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors duration-200">
                    <Play className="w-4 h-4" />
                    Lanjut Belajar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return null;
}