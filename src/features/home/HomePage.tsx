'use client';

import { useRouter } from "next/navigation";
import { CourseCarousel } from "./CourseCarousel";
import type { Course } from "./CourseCard";

type HomePageClientProps = {
  popularCourses: Course[];
  newCourses: Course[];
};

export function HomePageClient({ popularCourses, newCourses }: HomePageClientProps) {
  const router = useRouter();

  // Handler untuk ketika course card diklik
  const handleCourseClick = (course: Course) => {
    console.log("Course clicked:", course);
    // Navigate ke detail page
    router.push(`/course/${course.id}`);
  };

  return (
    <>
      {/* Kursus Populer Section */}
      <CourseCarousel
        title="Kursus Populer"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco"
        courses={popularCourses}
        variant="light"
        onCourseClick={handleCourseClick}
      />

      {/* Kursus Terbaru Section */}
      <CourseCarousel
        title="Kursus Terbaru"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco"
        courses={newCourses}
        variant="dark"
        onCourseClick={handleCourseClick}
      />
    </>
  );
}