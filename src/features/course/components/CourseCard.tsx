import { Star, Users, ArrowRight } from "lucide-react";
import { useState } from "react";

interface CourseCardProps {
  image: string;
  category: string;
  categoryColor: string;
  title: string;
  rating: number;
  ratingCount: string;
  instructor: string;
  instructorImage?: string;
  studentCount: string;
}

export function CourseCard({
  image,
  category,
  categoryColor,
  title,
  rating,
  ratingCount,
  instructor,
  instructorImage,
  studentCount,
}: CourseCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className="w-4 h-4"
          fill={i <= rating ? "#EAB308" : "none"}
          stroke={i <= rating ? "#EAB308" : "#D1D5DB"}
          strokeWidth={1.5}
        />
      );
    }
    return stars;
  };

  return (
    <div 
      className="bg-white overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image with Overlay */}
      <div className="w-full h-[200px] overflow-hidden relative">
        <img 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          src={image} 
        />
        
        {/* Overlay with Button */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end justify-center pb-6 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button className="bg-white text-gray-900 px-6 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transform transition-all duration-300 hover:bg-gray-100 hover:gap-3 shadow-lg">
            Lihat Kelas
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Category Badge - Positioned on Image */}
        <div className="absolute top-3 left-3">
          <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${categoryColor} backdrop-blur-sm shadow-sm`}>
            <p className="font-medium text-xs">
              {category}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-semibold text-lg leading-7 text-zinc-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-0.5">
            {renderStars()}
          </div>
          <p className="font-medium text-sm text-gray-700">
            {rating.toFixed(1)}
          </p>
          <p className="font-normal text-sm text-gray-500">
            ({ratingCount})
          </p>
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0 ring-2 ring-white shadow-sm">
            {instructorImage ? (
              <img src={instructorImage} alt={instructor} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold">
                {instructor.charAt(0)}
              </div>
            )}
          </div>
          <p className="font-medium text-sm text-gray-700">
            {instructor}
          </p>
        </div>

        {/* Students */}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <p className="font-normal text-sm text-gray-600">
            {studentCount} Students
          </p>
        </div>
      </div>
    </div>
  );
}