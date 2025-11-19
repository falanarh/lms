"use client"

import { useState } from "react";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown/Dropdown";
import { Badge } from "@/components/ui/Badge/Badge";
import { CATEGORIES, SORT_OPTIONS, PROGRESS_FILTERS } from "../types";

interface MyCourseFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedProgress: string;
  onProgressChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export function MyCourseFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedProgress,
  onProgressChange,
  sortBy,
  onSortChange,
  onClearFilters,
  activeFiltersCount,
}: MyCourseFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Filter Kursus Saya
        </h2>
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-zinc-600 hover:text-zinc-800"
          >
            Hapus Semua Filter ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Cari kursus yang diikuti..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-full"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Mobile Toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filter & Sortir
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      </div>

      {/* Filters */}
      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block space-y-4`}>
        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Kategori
          </label>
          <Dropdown
            items={CATEGORIES.map(category => ({
              value: category,
              label: category,
            }))}
            value={selectedCategory}
            onChange={onCategoryChange}
            placeholder="Pilih Kategori"
            className="w-full"
          />
        </div>

        {/* Progress Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Progress
          </label>
          <Dropdown
            items={PROGRESS_FILTERS}
            value={selectedProgress}
            onChange={onProgressChange}
            placeholder="Filter Progress"
            className="w-full"
          />
        </div>

        {/* Sort Options */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Urutkan
          </label>
          <Dropdown
            items={SORT_OPTIONS}
            value={sortBy}
            onChange={onSortChange}
            placeholder="Pilih Urutan"
            className="w-full"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchQuery || selectedCategory !== "All Categories" || selectedProgress !== "all") && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-700">
          {searchQuery && (
            <Badge variant="outline" className="flex items-center gap-1">
              Search: "{searchQuery}"
              <button
                onClick={() => onSearchChange("")}
                className="ml-1 text-zinc-500 hover:text-zinc-700"
              >
                ×
              </button>
            </Badge>
          )}
          {selectedCategory !== "All Categories" && (
            <Badge variant="outline" className="flex items-center gap-1">
              Category: {selectedCategory}
              <button
                onClick={() => onCategoryChange("All Categories")}
                className="ml-1 text-zinc-500 hover:text-zinc-700"
              >
                ×
              </button>
            </Badge>
          )}
          {selectedProgress !== "all" && (
            <Badge variant="outline" className="flex items-center gap-1">
              Progress: {PROGRESS_FILTERS.find(f => f.value === selectedProgress)?.label}
              <button
                onClick={() => onProgressChange("all")}
                className="ml-1 text-zinc-500 hover:text-zinc-700"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}