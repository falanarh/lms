import { Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge/Badge";
import { Course, ViewModeValue } from "../types";
import { ArrowRight } from "lucide-react";
import { TeacherAvatar } from "./TeacherAvatar";

interface CourseCardProps {
  course: Course;
  viewMode?: ViewModeValue;
}

export function CourseCard({ course, viewMode = "grid-4" }: CourseCardProps) {
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(course.averageRating);
    const hasHalfStar = course.averageRating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star
            key={i}
            className="w-4 h-4 fill-yellow-400/50 text-yellow-400"
          />
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  if (viewMode === "grid-4") {
    return (
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden transition-transform duration-300 hover:shadow-lg hover:cursor-pointer group">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={
              course.thumbnail ||
              "https://dummyimage.com/600x400/000/fff&text=Course"
            }
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="bg-white text-gray-900 px-6 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition-[background,transform,gap] duration-300 hover:bg-gray-100 hover:gap-3 shadow-lg">
              Lihat Kelas
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 flex flex-col">
          <div className="space-y-2">
            <Badge variant="secondary" size="sm">
              {course.description.category}
            </Badge>
            <div className="min-h-[56px] md:min-h-[64px]">
              <h3 className="font-bold text-lg text-zinc-900 line-clamp-2 transition-colors duration-200">
                {course.title}
              </h3>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">{renderStars()}</div>
              <span className="text-sm font-medium text-zinc-700">
                {course.averageRating}/5.00
              </span>
            </div>

            {/* //TODO: tambahkan avatar ketika sudah ada teacher */}
            {/* <div className="flex items-center gap-2 text-sm text-zinc-600">
              <TeacherAvatar
                teacherName={course.teacher}
                avatarUrl={course.teacherAvatar}
                size="sm"
              />
              <span>{course.teacher}</span>
            </div> */}

            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Users className="w-4 h-4" />
              <span>{course.totalUsers} students</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "grid-2") {
    return (
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden transition-transform duration-300 hover:shadow-lg group hover:cursor-pointer flex flex-col md:flex-row">
        <div className="w-full md:w-48 flex-shrink-0 relative overflow-hidden">
          <img
            src={
              course.thumbnail ||
              "https://dummyimage.com/600x400/000/fff&text=Course"
            }
            alt={course.title}
            className="w-full h-48 md:h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="bg-white text-gray-900 px-4 py-2 rounded-full font-semibold text-xs flex items-center gap-2 transition-[background,transform,gap] duration-300 hover:bg-gray-100 hover:gap-3 shadow-md">
              Lihat Kelas
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col">
          <div className="space-y-2">
            <Badge variant="secondary" size="sm">
              {course.description.category}
            </Badge>
            <div className="min-h-[56px] md:min-h-[64px]">
              <h3 className="font-bold text-lg text-zinc-900 line-clamp-2 transition-colors duration-200">
                {course.title}
              </h3>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">{renderStars()}</div>
              <span className="text-sm font-medium text-zinc-700">
                {course.averageRating}/5.00
              </span>
            </div>

            {/* //TODO: tambahkan avatar ketika sudah ada teacher */}
            {/* <div className="flex items-center gap-2 text-sm text-zinc-600">
              <TeacherAvatar
                teacherName={course.teacher}
                avatarUrl={course.teacherAvatar}
                size="sm"
              />
              <span>{course.description.teacher}</span>
            </div> */}

            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Users className="w-4 h-4" />
              <span>{course.totalUsers} students</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden transition-transform duration-300  hover:shadow-lg group hover:cursor-pointer flex flex-col md:flex-row">
        <div className="w-full md:w-48 flex-shrink-0 relative overflow-hidden">
          <img
            src={
              course.thumbnail ||
              "https://dummyimage.com/600x400/000/fff&text=Course"
            }
            alt={course.title}
            className="w-full h-48 md:h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="bg-white text-gray-900 px-4 py-2 rounded-full font-semibold text-xs flex items-center gap-2 transition-[background,transform,gap] duration-300 hover:bg-gray-100 hover:gap-3 shadow-md">
              Lihat Kelas
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col">
          <div className="space-y-2">
            <Badge variant="secondary" size="sm">
              {course.description.category}
            </Badge>
            <h3 className="font-bold text-lg text-zinc-900 line-clamp-1 transition-colors duration-200">
              {course.title}
            </h3>
            {course.description && (
              <p className="text-zinc-600 text-sm line-clamp-2">
                {course.description.description}
              </p>
            )}
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">{renderStars()}</div>
              <span className="text-sm font-medium text-zinc-700">
                {course.averageRating}/5.00
              </span>
            </div>

            {/* //TODO: tambahkan avatar ketika sudah ada teacher */}
            {/* <div className="flex items-center gap-2 text-sm text-zinc-600">
              <TeacherAvatar
                teacherName={course.description.teacher}
                avatarUrl={course.description.teacherAvatar}
                size="sm"
              />
              <span>{course.description.teacher}</span>
            </div> */}

            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Users className="w-4 h-4" />
              <span>{course.totalUsers} students</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
