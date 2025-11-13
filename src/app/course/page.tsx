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

const COURSES_PER_PAGE = 8;

export default function CoursePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("title-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewModeValue>("grid-4");

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

<<<<<<< HEAD
  const filteredAndSortedCourses = useMemo(() => {
    const filtered = courses.filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(debouncedSearchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All Categories" ||
        course.categories === selectedCategory;
      return matchesSearch && matchesCategory;
    });
=======
  const { data: courses = [], isLoading: isLoadingCourses } = useGroupCourses({
    searchQuery: debouncedSearchQuery,
    selectedCategory,
    sortBy
  });
>>>>>>> 4e6ace569ee588ccc5527f19b97f411aa4a863db

  const totalPages = Math.ceil(courses.length / COURSES_PER_PAGE);

  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
    const endIndex = startIndex + COURSES_PER_PAGE;
    return courses.slice(startIndex, endIndex);
  }, [courses, currentPage]);

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
        isLoading={isLoadingCourses}
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
