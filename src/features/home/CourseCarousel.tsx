'use client';

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CourseCard, type Course } from "./CourseCard";

type CourseCarouselProps = {
  title: string;
  description?: string;
  courses: Course[];
  variant?: "light" | "dark";
  onCourseClick?: (course: Course) => void;
};

export function CourseCarousel({
  title,
  description,
  courses,
  variant = "light",
  onCourseClick,
}: CourseCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Detect responsive items per view
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerView(1);
      } else if (width < 1024) {
        setItemsPerView(2);
      } else if (width < 1280) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, courses.length - itemsPerView);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < maxIndex;

  // Calculate transform offset
  const getTransformValue = () => {
    if (!carouselRef.current) return 0;
    const containerWidth = carouselRef.current.offsetWidth;
    const gap = 24; // 1.5rem = 24px
    const itemWidth = (containerWidth - gap * (itemsPerView - 1)) / itemsPerView;
    return -(currentIndex * (itemWidth + gap));
  };

  const bgColor = variant === "light" ? "bg-gray-50" : "bg-white";

  return (
    <section className={`py-16 ${bgColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          {description && (
            <p className="text-gray-600 max-w-3xl mx-auto">{description}</p>
          )}
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          {canGoPrevious && (
            <button
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 size-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label="Previous"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
          )}

          {canGoNext && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 size-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label="Next"
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>
          )}

          {/* Carousel Wrapper */}
          <div className="overflow-hidden" ref={carouselRef}>
            <div
              className="flex gap-6 transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(${getTransformValue()}px)`,
              }}
            >
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex-shrink-0"
                  style={{
                    width: `calc((100% - ${(itemsPerView - 1) * 24}px) / ${itemsPerView})`,
                  }}
                >
                  <CourseCard course={course} onClick={onCourseClick} />
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          {courses.length > itemsPerView && (
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(maxIndex + 1)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 bg-blue-600"
                      : "w-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Empty State */}
        {courses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-500">Belum ada kursus tersedia</p>
          </div>
        )}
      </div>
    </section>
  );
}