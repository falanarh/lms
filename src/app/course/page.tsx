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
import { useCourses } from "@/hooks/useCourses";
import { useCategories } from "@/hooks/useCategories";
import { COURSE_CATEGORIES } from "@/features/course/constant/course";

const COURSES_PER_PAGE = 8

export default function CoursePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("none");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewModeValue>("grid-4");

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: categoriesData, isLoading: isLoadingCategories, error: categoriesError } = useCategories();

  const { data: response, isLoading: isLoadingCourses } = useCourses({
    searchQuery: debouncedSearchQuery,
    selectedCategory,
    sortBy,
    page: currentPage,
    perPage: COURSES_PER_PAGE
  });

  const categories = useMemo(() => {
    if (categoriesError || !categoriesData) {
      return COURSE_CATEGORIES;
    }
    return ['All Categories', ...categoriesData];
  }, [categoriesData, categoriesError]);

  const courses = response || [];
  const pageMeta = undefined; // Response doesn't have pageMeta
  const totalPages = 1; // Default to 1 since we don't have pagination

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
        categories={categories}
        isLoadingCategories={isLoadingCategories}
      />

      <CourseGrid
        courses={courses}
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
