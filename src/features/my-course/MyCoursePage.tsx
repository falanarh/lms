"use client";

import { useState, useEffect, useMemo } from "react";
import { MyCourseHeader } from "./components/MyCourseHeader";
import { MyCourseFilters } from "./components/MyCourseFilters";
import { MyCourseGrid } from "./components/MyCourseGrid";
import { dummyEnrolledCourses, getDummyStats } from "./data/dummyData";
import { EnrolledCourse, ViewModeValue } from "./types";

export function MyCoursePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedProgress, setSelectedProgress] = useState("all");
  const [sortBy, setSortBy] = useState("last-accessed-desc");
  const [viewMode, setViewMode] = useState<ViewModeValue>("grid-4");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = dummyEnrolledCourses.filter((course) => {
      // Search filter
      if (debouncedSearchQuery) {
        const searchLower = debouncedSearchQuery.toLowerCase();
        const matchesSearch =
          course.course.title.toLowerCase().includes(searchLower) ||
          (course.course.description?.description?.toLowerCase().includes(searchLower)) ||
          course.course.description?.category?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory !== "All Categories") {
        if (course.course.description?.category !== selectedCategory) {
          return false;
        }
      }

      // Progress filter
      if (selectedProgress !== "all") {
        switch (selectedProgress) {
          case "not-started":
            if (course.progress.percentage !== 0) return false;
            break;
          case "in-progress":
            if (course.progress.percentage === 0 || course.progress.percentage === 100) return false;
            break;
          case "completed":
            if (course.progress.percentage !== 100) return false;
            break;
        }
      }

      return true;
    });

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "last-accessed-desc":
          return new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime();
        case "progress-desc":
          return b.progress.percentage - a.progress.percentage;
        case "progress-asc":
          return a.progress.percentage - b.progress.percentage;
        case "title-asc":
          return a.course.title.localeCompare(b.course.title);
        case "title-desc":
          return b.course.title.localeCompare(a.course.title);
        case "enrolled-desc":
          return new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime();
        case "rating-desc":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [debouncedSearchQuery, selectedCategory, selectedProgress, sortBy]);

  // Calculate stats
  const stats = useMemo(() => getDummyStats(), []);

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedCategory !== "All Categories") count++;
    if (selectedProgress !== "all") count++;
    return count;
  }, [searchQuery, selectedCategory, selectedProgress]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedProgress("all");
    setSortBy("last-accessed-desc");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <MyCourseHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalCourses={stats.totalCourses}
          completedCourses={stats.completedCourses}
          inProgressCourses={stats.inProgressCourses}
          averageProgress={stats.averageProgress}
          totalCertificates={stats.totalCertificates}
          isLoading={isLoading}
        />

        {/* Filters */}
        {/* <div className="mb-8">
          <MyCourseFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedProgress={selectedProgress}
            onProgressChange={setSelectedProgress}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onClearFilters={handleClearFilters}
            activeFiltersCount={activeFiltersCount}
          />
        </div> */}

        {/* Results Summary */}
        <div className="my-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Hasil Pencarian
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Menampilkan {filteredAndSortedCourses.length} dari {stats.totalCourses} kursus
              {activeFiltersCount > 0 && ` dengan ${activeFiltersCount} filter aktif`}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-zinc-600 dark:text-zinc-400">Sedang Berjalan: {stats.inProgressCourses}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-zinc-600 dark:text-zinc-400">Selesai: {stats.completedCourses}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <span className="text-zinc-600 dark:text-zinc-400">Dimulai: {stats.totalCourses - stats.inProgressCourses - stats.completedCourses}</span>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <MyCourseGrid
          courses={filteredAndSortedCourses}
          isLoading={isLoading}
          viewMode={viewMode}
        />

        {/* No Results Message */}
        {!isLoading && filteredAndSortedCourses.length === 0 && activeFiltersCount > 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-zinc-400 dark:text-zinc-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Tidak ada kursus yang sesuai dengan filter
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Coba ubah atau hapus beberapa filter untuk melihat lebih banyak kursus
            </p>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200"
            >
              Hapus Semua Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}