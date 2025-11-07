import Image from "next/image";

export type Course = {
  id: number | string;
  title: string;
  category: string;
  rating: number;
  students: number;
  image: string;
  instructor?: string;
  price?: number;
  duration?: string;
};

type CourseCardProps = {
  course: Course;
  onClick?: (course: Course) => void;
};

export function CourseCard({ course, onClick }: CourseCardProps) {
  return (
    <div
      onClick={() => onClick?.(course)}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group h-full flex flex-col"
    >
      {/* Course Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
          <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
            📚
          </div>
        </div>
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
            {course.category}
          </span>
        </div>
      </div>

      {/* Course Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-sm ${
                  i < Math.floor(course.rating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-sm text-gray-600 font-medium">
            ({course.rating})
          </span>
        </div>

        {/* Students Count - Push to bottom */}
        <div className="flex items-center gap-1 text-gray-600 text-sm mt-auto">
          <span>👥</span>
          <span>{course.students.toLocaleString('id-ID')} Students</span>
        </div>
      </div>
    </div>
  );
}