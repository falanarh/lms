"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import {
  ChevronsRight,
  Clock4,
  MessagesSquare,
  LayoutGrid,
  List,
  Grid,
  Edit2,
} from "lucide-react";
import ForumCard from "./ForumCard";
import Pagination from "@/components/shared/Pagination/Pagination";

export type Forum = {
  id: string;
  title: string;
  description?: string;
  type: "course" | "general";
  /** ISO 8601 date string */
  lastActivity: string;
  totalTopics: number;
};

export type ViewMode = "list" | "card" | "grid";

export interface ForumListProps {
  forum: Forum;
  className?: string;
  viewMode?: ViewMode;
  onEdit?: (forum: Forum) => void;
}

export interface ForumListContainerProps {
  forums: Forum[];
  className?: string;
  title?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  enableFilter?: boolean;
  isLoading?: boolean;
  onEditForum?: (forum: Forum) => void;
}

const TYPE_META: Record<
  Forum["type"],
  { label: string; accent: string; tone: "primary" | "success"; image: string }
> = {
  course: {
    label: "Course Forum",
    accent: "var(--color-primary,#2563eb)",
    tone: "primary",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop&crop=center",
  },
  general: {
    label: "General Forum",
    accent: "var(--success,#16a34a)",
    tone: "success",
    image:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=200&fit=crop&crop=center",
  },
};

// Helper to format date difference
function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return `${seconds} detik lalu`;
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  return `${days} hari lalu`;
}

export function ForumList({
  forum,
  className,
  viewMode = "card",
  onEdit,
}: ForumListProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const meta = TYPE_META[forum.type];
  const accentColor = meta.accent;

  const handleForumClick = () => {
    router.push(`/forum/${forum.id}`);
  };

  // Card view (horizontal layout with image on left)
  if (viewMode === "card") {
    return (
      <article
        className={[
          "bg-white overflow-hidden cursor-pointer",
          "transition-all duration-300 ease-out",
          "hover:shadow-lg hover:-translate-y-1",
          "rounded-2xl shadow-[0px_0px_1px_0px_rgba(12,26,75,0.24),0px_3px_8px_-1px_rgba(50,50,71,0.05)]",
        ]
          .filter(Boolean)
          .join(" ")}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleForumClick}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image Section - Left */}
          <div className="relative w-full sm:w-64 h-48 sm:h-auto overflow-hidden">
            <img
              src={meta.image}
              alt={forum.title}
              className={`w-full h-full object-cover transition-transform duration-300 ease-out ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
            />
            {/* Type badge overlay on image */}
            <Badge
              className="absolute top-4 right-4 font-semibold"
              style={{
                backgroundColor: accentColor,
                color: "white",
                borderColor: "transparent",
              }}
            >
              {meta.label}
            </Badge>
          </div>

          {/* Content Section - Right */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex-1">
              {/* Title */}
              <h3
                className="font-semibold text-base leading-[1.36] overflow-hidden mb-3"
                style={{
                  color: "#16192C",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {forum.title}
              </h3>

              {/* Description */}
              {forum.description && (
                <p
                  className="leading-relaxed text-sm overflow-hidden mb-3"
                  style={{
                    color: "#425466",
                    lineHeight: "23px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {forum.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium" style={{ color: "#16192C" }}>
                    {forum.totalTopics} topics
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: "#425466" }}>
                    {/* {timeAgo(forum.lastActivity)} */}
                    {forum.lastActivity}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Section with Buttons */}
            <div className="flex justify-end items-center gap-2 mt-4">
              <Button
                rightIcon={
                  <ChevronsRight className="w-5 h-5 mt-1 -ml-1 group-hover:translate-x-1 transition-transform" />
                }
                className="group font-medium"
                style={{
                  backgroundColor: accentColor,
                  borderColor: accentColor,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleForumClick();
                }}
              >
                Lihat forum
              </Button>
              {onEdit && (
                <Button
                  leftIcon={<Edit2 className="w-4 h-4 text-gray-600" />}
                  variant="outline"
                  className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 w-10 h-10 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(forum);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }

  // List view (simplified horizontal layout)
  return (
    <article
      className={[
        "relative w-full overflow-hidden",
        "flex items-center justify-between",
        "bg-white",
        "border border-gray-100",
        "rounded-lg p-4",
        "transition-all duration-300 ease-out",
        "hover:bg-gray-50",
        "group",
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleForumClick}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex-shrink-0 w-2 h-12 rounded-full"
          style={{ backgroundColor: accentColor }}
        />

        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900 group-hover:text-[var(--color-primary,#2563eb)] transition-colors duration-200">
              {forum.title}
            </h3>
            <Badge
              className="font-semibold"
              style={{
                backgroundColor: accentColor,
                color: "white",
                borderColor: "transparent",
              }}
            >
              {meta.label}
            </Badge>
          </div>

          <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <MessagesSquare className="w-3 h-3" />
              <span>{forum.totalTopics} Topik</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock4 className="w-3 h-3" />
              <span>{timeAgo(forum.lastActivity)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          rightIcon={
            <ChevronsRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          }
          size="sm"
          className="group font-medium"
          style={{
            backgroundColor: accentColor,
            borderColor: accentColor,
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleForumClick();
          }}
        >
          Lihat
        </Button>
        {onEdit && (
          <Button
            leftIcon={<Edit2 className="w-4 h-4 text-gray-600" />}
            variant="outline"
            className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 w-10 h-10 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(forum);
            }}
          />
        )}
      </div>
    </article>
  );
}

// Container component with search, filter, and view toggle
export function ForumListContainer({
  forums,
  className,
  title = "Forum Diskusi",
  showSearch = true,
  searchPlaceholder = "Search forums by title or description...",
  enableFilter = true,
  isLoading = false,
  onEditForum,
}: ForumListContainerProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>("card");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const itemsPerPage = 6; // Number of items to display per page

  // Filter options for the dropdown
  const filterOptions = [
    { value: "all", label: "All Forums" },
    { value: "course", label: "Course Forums" },
    { value: "general", label: "General Forums" },
  ];

  // Filter and search logic
  const filteredForums = useMemo(() => {
    let filtered = forums;

    // Apply type filter
    if (enableFilter && filterType !== "all") {
      filtered = filtered.filter((forum) => forum.type === filterType);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (forum) =>
          forum.title.toLowerCase().includes(searchLower) ||
          (forum.description &&
            forum.description.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [forums, searchTerm, filterType, enableFilter]);

  // Calculate the items to display based on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredForums.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredForums.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  return (
    <div className={`${className || ""}`}>
      {/* Header with Title */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>

      {/* Search, Filter, and View Mode Section */}
      {showSearch && (
        <div className="flex w-full justify-between mb-8">
          {/* Left Section: Search Bar and Filters */}
          <div className="flex justify-between items-center gap-4">
            {/* Search Bar */}
            <div className="w-full sm:flex-1 lg:w-96">
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                size="sm"
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="text-sm"
              />
            </div>

            {/* Filter Dropdown */}
            {enableFilter && (
              <Dropdown
                label="Type:"
                items={filterOptions}
                value={filterType}
                onChange={(value) => setFilterType(value)}
                placeholder="All types"
                size="sm"
                className="text-sm"
              />
            )}

            {/* Clear Filters Button */}
            {(searchTerm || (enableFilter && filterType !== "all")) && (
              <div className="w-full sm:w-auto">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full sm:w-auto"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Right Section: View Mode Toggle */}
          <div className="flex items-center p-1 rounded-md">
            <button
              className={`p-2 rounded ${
                viewMode === "card"
                  ? "bg-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setViewMode("card")}
              aria-label="Tampilan Card"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              className={`p-2 rounded ${
                viewMode === "grid"
                  ? "bg-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setViewMode("grid")}
              aria-label="Tampilan Grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              className={`p-2 rounded ${
                viewMode === "list"
                  ? "bg-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setViewMode("list")}
              aria-label="Tampilan List"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col gap-6">
          {/* Skeleton cards */}
          {[1, 2, 3].map((index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-md">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-64 h-48 sm:h-auto bg-gray-200 animate-pulse" />
                <div className="flex-1 p-6 flex flex-col">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                  </div>
                  <div className="flex justify-end items-center mt-4">
                    <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-24" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {!isLoading && filteredForums.length === 0 && (
        <div className="text-sm text-gray-600">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="font-medium text-gray-900 mb-1">No forums found</p>
            <p className="text-gray-600">
              Try adjusting your search terms or filters to find what you're
              looking for.
            </p>
          </div>
        </div>
      )}

      {/* Forum List/Grid */}
      {!isLoading && filteredForums.length > 0 && (
        <>
          {viewMode === "card" ? (
            <div className="flex flex-col gap-8">
              {currentItems.map((forum) => (
                <ForumList key={forum.id} forum={forum} viewMode={viewMode} onEdit={onEditForum} />
              ))}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentItems.map((forum) => (
                <div key={forum.id} className="h-[400px]">
                  <ForumCard forum={forum} onEdit={onEditForum} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {currentItems.map((forum) => (
                <ForumList key={forum.id} forum={forum} viewMode={viewMode} onEdit={onEditForum} />
              ))}
            </div>
          )}

          {/* Pagination and Results Summary */}
          <div className="mt-8 border-t border-gray-200 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Results Summary */}
              <div className="text-sm text-gray-600">
                <p>
                  Showing{" "}
                  <span className="font-medium text-gray-900">
                    {currentItems.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-900">
                    {filteredForums.length}
                  </span>{" "}
                  forums
                  {searchTerm && (
                    <>
                      {" "}
                      for{" "}
                      <span className="font-medium text-gray-900">
                        "{searchTerm}"
                      </span>
                    </>
                  )}
                  {enableFilter && filterType !== "all" && (
                    <>
                      {" "}
                      in{" "}
                      <span className="font-medium text-gray-900">
                        {
                          filterOptions.find((opt) => opt.value === filterType)
                            ?.label
                        }
                      </span>
                    </>
                  )}
                </p>
                {(searchTerm || (enableFilter && filterType !== "all")) && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterType("all");
                    }}
                    className="mt-2 sm:mt-0 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div>
                  <Pagination
                    alignment="right"
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    showPrevNext={true}
                    showFirstLast={false}
                    siblingCount={1}
                    boundaryCount={1}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ForumList;

// ThreadsIcon is no longer used in the updated horizontal layout
// Keeping for reference in case needed for future use

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3.333 8h9.334M8.667 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
