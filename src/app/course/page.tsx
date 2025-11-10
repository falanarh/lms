"use client";

import { useState, useEffect, useMemo } from "react";
import { ViewModeValue } from "@/features/course/types";
import { useDebounce } from "@/hooks/useDebounce";
import { Pagination } from "@/components/shared/Pagination/Pagination";
import {
  CourseFilters,
  CourseGrid,
  CourseHeader,
  CourseLayout,
} from "@/features/course/components";
import { useGroupCourses } from "@/hooks/useGroupCourses";

const COURSES_PER_PAGE = 4;

export default function CoursePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("title-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewModeValue>("grid-4");

  const { data, isPending, isFetching } = useGroupCourses();
  const courses = data ?? [];

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredAndSortedCourses = useMemo(() => {
    console.log(courses);
    let filtered = courses.filter((item) => {
      const matchesSearch = item.course.title
        ?.toLowerCase()
        .includes(debouncedSearchQuery.toLowerCase()) ?? false;
      const matchesCategory =
        selectedCategory === "All Categories" ||
        item.course.description.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title-asc":
          return a.course.title.localeCompare(b.course.title);
        case "title-desc":
          return b.course.title.localeCompare(a.course.title);
        case "rating-desc":
          return b.rating - a.rating;
        case "students-desc":
          return b.totalUserRating - a.totalUserRating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [courses, debouncedSearchQuery, selectedCategory, sortBy]);

  const totalPages = Math.ceil(
    filteredAndSortedCourses.length / COURSES_PER_PAGE
  );

  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
    const endIndex = startIndex + COURSES_PER_PAGE;
    return filteredAndSortedCourses.slice(startIndex, endIndex);
  }, [filteredAndSortedCourses, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedCategory, sortBy]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <CourseLayout>
      <CourseHeader
        title="All Course"
        subtitle="Explore our comprehensive collection of professional courses"
      />

      <CourseFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <CourseGrid
        courses={paginatedCourses}
        viewMode={viewMode}
        isLoading={isPending || isFetching}
      />

      {totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          size="md"
          showPrevNext={true}
          siblingCount={1}
          boundaryCount={1}
        />
      )}
    </CourseLayout>
  );
}
