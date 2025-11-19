/**
 * Knowledge Management List Component
 *
 * Following the API → Hooks → UI pattern from coding principles
 * - Focused on UI logic and presentation only
 * - Uses custom hooks for data fetching and business logic
 * - Clean separation of concerns for better maintainability
 */

"use client";

import React, { useState, useMemo } from "react";
import { Search, Plus, Filter, Grid3X3, List, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input/Input";
import { Dropdown } from "@/components/ui/Dropdown/Dropdown";
import { Button } from "@/components/ui/Button/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/shared/Pagination/Pagination";
import KnowledgeManagementCard from "./KnowledgeManagementCard";
// import KnowledgeManagementFilters from './KnowledgeManagementFilters'; // Component not implemented yet
import { useKnowledge } from "@/hooks/useKnowledgeCenter";
import { useDebounce } from "@/hooks/useDebounce";
import { useKnowledgeSubjects } from "@/hooks/useKnowledgeSubject";
import {
  KnowledgeCenter,
  KnowledgeQueryParams,
  SORT_OPTIONS,
  KNOWLEDGE_TYPES,
} from "@/types/knowledge-center";
import Link from "next/link";

// Helper function to determine knowledge center status
const getKnowledgeStatus = (
  knowledge: KnowledgeCenter
): "draft" | "scheduled" | "published" => {
  if (!knowledge.isFinal) {
    return "draft";
  }

  const publishDate = new Date(knowledge.publishedAt);
  const now = new Date();

  if (publishDate > now) {
    return "scheduled";
  }

  return "published";
};

// Helper function to get status display info
const getStatusInfo = (status: "draft" | "scheduled" | "published") => {
  switch (status) {
    case "draft":
      return {
        label: "Draft",
        color: "bg-yellow-500",
        textColor: "text-yellow-700",
        bgColor: "bg-yellow-50",
      };
    case "scheduled":
      return {
        label: "Scheduled",
        color: "bg-blue-500",
        textColor: "text-blue-700",
        bgColor: "bg-blue-50",
      };
    case "published":
      return {
        label: "Published",
        color: "bg-green-500",
        textColor: "text-green-700",
        bgColor: "bg-green-50",
      };
  }
};

const getStatusActionClasses = (status: "draft" | "scheduled" | "published") => {
  switch (status) {
    case "draft":
      return "bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 shadow-sm";
    case "scheduled":
      return "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 shadow-sm";
    case "published":
      return "bg-yellow-500 hover:bg-yellow-600 text-gray-900 border-yellow-500 hover:border-yellow-600 shadow-sm";
  }
};

interface KnowledgeManagementListProps {
  onEdit: (knowledge: KnowledgeCenter) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onDuplicate: (knowledge: KnowledgeCenter) => void;
  onToggleStatus: (id: string, isFinal: boolean, title: string) => void;
  isDeleting: boolean;
  isUpdating: boolean;
}

// Skeleton component for knowledge management cards
const KnowledgeManagementCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-8 w-8" />
    </div>

    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />

      <div className="flex gap-2 mt-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Skeleton className="h-4 w-24" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  </div>
);

// Skeleton component for list view
const KnowledgeManagementListSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="flex items-center gap-4">
      <Skeleton className="h-16 w-24 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  </div>
);

// List view item component
const KnowledgeManagementListItem = ({
  knowledge,
  onEdit,
  onDelete,
  onToggleStatus,
  isUpdating,
  isDeleting,
  isSelected = false,
  onSelectionChange,
}: {
  knowledge: KnowledgeCenter;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
}) => {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow ${isSelected ? "ring-2 ring-blue-500 border-blue-300" : ""}`}
    >
      <div className="flex items-center gap-4">
        {/* Selection Checkbox */}
        {onSelectionChange && (
          <div className="shrink-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelectionChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
          </div>
        )}

        {/* Thumbnail */}
        <div className="shrink-0">
          <div className="w-20 h-14 bg-gray-100 rounded overflow-hidden">
            {knowledge.thumbnail && (
              <img
                src={knowledge.thumbnail}
                alt={knowledge.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {knowledge.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {knowledge.description}
              </p>

              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                {(() => {
                  const status = getKnowledgeStatus(knowledge);
                  const statusInfo = getStatusInfo(status);
                  return (
                    <span className="flex items-center gap-1">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${statusInfo.color}`}
                      />
                      {statusInfo.label}
                    </span>
                  );
                })()}
                <span>{knowledge.type}</span>
                <span>
                  {new Date(knowledge.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            disabled={isUpdating || isDeleting}
          >
            Edit
          </Button>
          <Button
            variant="solid"
            size="sm"
            onClick={onToggleStatus}
            disabled={isUpdating || isDeleting}
            className={(() => {
              const status = getKnowledgeStatus(knowledge);
              return getStatusActionClasses(status);
            })()}
          >
            {(() => {
              const status = getKnowledgeStatus(knowledge);
              switch (status) {
                case "draft": {
                  const publishDate = knowledge.publishedAt
                    ? new Date(knowledge.publishedAt)
                    : null;
                  const isFuturePublishDate =
                    !!publishDate &&
                    !isNaN(publishDate.getTime()) &&
                    publishDate > new Date();
                  return isFuturePublishDate ? "Schedule" : "Publish";
                }
                case "scheduled":
                  return "Unschedule";
                case "published":
                  return "Unpublish";
                default:
                  return "Publish";
              }
            })()}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            disabled={isUpdating || isDeleting}
            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function KnowledgeManagementList({
  onEdit,
  onDelete,
  onBulkDelete,
  // onDuplicate,
  onToggleStatus,
  isDeleting,
  isUpdating,
}: KnowledgeManagementListProps) {
  // ============================================================================
  // State Management
  // ============================================================================

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<
    typeof KNOWLEDGE_TYPES.WEBINAR | typeof KNOWLEDGE_TYPES.CONTENT | "all"
  >("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "published" | "scheduled" | "draft"
  >("all");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.NEWEST);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const { data: subjects } = useKnowledgeSubjects();

  // Debounce search query to avoid sending a request on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Map subject name to ID for API filtering 
  const subjectId = useMemo(() => {
    if (selectedSubject === "all") return undefined;

    const subject = subjects?.find((s) => s.name === selectedSubject);
    return subject?.id || selectedSubject;
  }, [selectedSubject, subjects]);

  // Build query params for API
  const queryParams: KnowledgeQueryParams = useMemo(() => {
    const base: KnowledgeQueryParams = {
      search: debouncedSearchQuery || undefined,
      knowledgeType:
        selectedType !== "all"
          ? (selectedType as
              | typeof KNOWLEDGE_TYPES.WEBINAR
              | typeof KNOWLEDGE_TYPES.CONTENT)
          : undefined,
      subject: subjectId ? [subjectId] : undefined,
      sort: sortBy,
      page: currentPage,
      limit: itemsPerPage,
    };

    // Server-side status filters
    const now = new Date().toISOString();

    if (selectedStatus === "published") {
      // Published: final and publishedAt up to now
      return {
        ...base,
        isFinal: true,
        "publishedAt[lte]": now,
      };
    }

    if (selectedStatus === "scheduled") {
      // Scheduled: final and publish date in the future
      return {
        ...base,
        isFinal: true,
        "publishedAt[gte]": now,
      };
    }

    if (selectedStatus === "draft") {
      // Draft: not final
      return {
        ...base,
        isFinal: false,
      };
    }

    // All status: no additional status filters
    return base;
  }, [
    debouncedSearchQuery,
    selectedType,
    subjectId,
    sortBy,
    currentPage,
    itemsPerPage,
    selectedStatus,
  ]);

  const {
    data: knowledgeItems,
    isLoading,
    isFetching,
    error,
    total,
    totalPages,
    refetch,
  } = useKnowledge(queryParams);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedSubject("all");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    refetch();
  };

  // ============================================================================
  // Bulk Selection Handlers
  // ============================================================================

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(knowledgeItems?.map((item) => item.id) || []);
      setSelectedItems(allIds);
      setSelectAll(true);
    }
  };

  const handleItemSelection = (id: string, selected: boolean) => {
    const newSelectedItems = new Set(selectedItems);
    if (selected) {
      newSelectedItems.add(id);
    } else {
      newSelectedItems.delete(id);
      setSelectAll(false);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleBulkDelete = () => {
    if (selectedItems.size > 0) {
      onBulkDelete(Array.from(selectedItems));
      setSelectedItems(new Set());
      setSelectAll(false);
    }
  };

  const selectedCount = selectedItems.size;

  // ============================================================================
  // Sort and Filter Options
  // ============================================================================

  const sortOptions = [
    { value: SORT_OPTIONS.NEWEST, label: "Recently Added" },
    { value: SORT_OPTIONS.MOST_LIKED, label: "Most Liked" },
    { value: SORT_OPTIONS.MOST_VIEWED, label: "Most Viewed" },
    { value: "title", label: "Title A-Z" },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "published", label: "Published" },
    { value: "scheduled", label: "Scheduled" },
    { value: "draft", label: "Draft" },
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: KNOWLEDGE_TYPES.WEBINAR, label: "Webinars" },
    { value: KNOWLEDGE_TYPES.CONTENT, label: "Content" },
  ];

  const hasActiveFilters =
    searchQuery ||
    selectedType !== "all" ||
    selectedSubject !== "all" ||
    selectedStatus !== "all";
  return (
    <>
      <div className="space-y-6">
        {/* Bulk Actions Bar */}
        {selectedCount > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {selectedCount} item{selectedCount > 1 ? "s" : ""} selected
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedItems(new Set());
                    setSelectAll(false);
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Clear selection
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedCount})
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="space-y-4">
          {/* Main Search and Filter Row */}
          <div className="flex flex-col py-8 space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            {/* Search Section */}
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search knowledge centers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
                size="md"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Primary Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="min-w-[120px]">
                  <Dropdown
                    items={typeOptions}
                    value={selectedType}
                    onChange={(value) =>
                      setSelectedType(
                        value as
                          | typeof KNOWLEDGE_TYPES.WEBINAR
                          | typeof KNOWLEDGE_TYPES.CONTENT
                          | "all"
                      )
                    }
                    placeholder="All Types"
                    searchable={false}
                    size="md"
                    variant="outline"
                  />
                </div>

                <div className="min-w-[120px]">
                  <Dropdown
                    items={statusOptions}
                    value={selectedStatus}
                    onChange={(value) =>
                      setSelectedStatus(
                        value as "all" | "published" | "scheduled" | "draft"
                      )
                    }
                    placeholder="All Status"
                    searchable={false}
                    size="md"
                    variant="outline"
                  />
                </div>

                <div className="min-w-[140px]">
                  <Dropdown
                    items={sortOptions.map((option) => ({
                      value: option.value,
                      label: option.label,
                    }))}
                    value={sortBy}
                    onChange={(value) =>
                      setSortBy(value as typeof SORT_OPTIONS.NEWEST)
                    }
                    placeholder="Sort by"
                    searchable={false}
                    size="md"
                    variant="outline"
                  />
                </div>
              </div>

              {/* Advanced Filter Toggle, Add New, and View Toggle */}
              <div className="flex items-center gap-2">
                {/* Advanced Filter Toggle */}
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 min-w-fit"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {hasActiveFilters && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full ml-1">
                      {
                        Object.values({
                          search: searchQuery,
                          type: selectedType !== "all" ? selectedType : null,
                          subject:
                            selectedSubject !== "all" ? selectedSubject : null,
                          status:
                            selectedStatus !== "all" ? selectedStatus : null,
                        }).filter(Boolean).length
                      }
                    </span>
                  )}
                </Button>

                {/* Add New */}
                <Link href="/knowledge-center/create">
                  <Button size="md" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Add New</span>
                  </Button>
                </Link>

                {/* View Mode Toggle */}
                <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "solid" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-none border-0 px-3"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "solid" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-none border-0 px-3"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <h4 className="font-medium text-gray-900">
                      Advanced Filters
                    </h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  >
                    Clear All Filters
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Subject Category
                    </label>
                    <Dropdown
                      items={[
                        { value: "all", label: "All Subjects" },
                        ...(subjects?.map((subject) => ({
                          value: subject.id,
                          label: subject.name,
                        })) || []),
                      ]}
                      value={selectedSubject}
                      onChange={setSelectedSubject}
                      placeholder="Select subject"
                      searchable={true}
                      size="md"
                      variant="outline"
                    />
                  </div>

                  {/* Placeholder for additional advanced filters */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Date Range
                    </label>
                    <div className="text-sm text-gray-500 p-2 border border-gray-200 rounded-md bg-white">
                      Coming soon
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Author
                    </label>
                    <div className="text-sm text-gray-500 p-2 border border-gray-200 rounded-md bg-white">
                      Coming soon
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Tags
                    </label>
                    <div className="text-sm text-gray-500 p-2 border border-gray-200 rounded-md bg-white">
                      Coming soon
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Loading State */}
      {(isLoading || isFetching) && (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              : "space-y-4"
          }
        >
          {[...Array(itemsPerPage)].map((_, index) =>
            viewMode === "grid" ? (
              <KnowledgeManagementCardSkeleton key={index} />
            ) : (
              <KnowledgeManagementListSkeleton key={index} />
            )
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-red-600 mb-4">
            Failed to load knowledge centers
          </div>
          <Button onClick={handleRefresh} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Knowledge Grid/List */}
      {!isLoading &&
        !isFetching &&
        !error &&
        knowledgeItems &&
        knowledgeItems.length > 0 && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                : "space-y-4"
            }
          >
            {knowledgeItems.map((knowledge) =>
              viewMode === "grid" ? (
                <KnowledgeManagementCard
                  key={knowledge.id}
                  knowledge={knowledge}
                  onEdit={() => onEdit(knowledge)}
                  onDelete={() => onDelete(knowledge.id)}
                  onToggleStatus={() =>
                    onToggleStatus(
                      knowledge.id,
                      knowledge.isFinal,
                      knowledge.title
                    )
                  }
                  isDeleting={isDeleting}
                  isUpdating={isUpdating}
                  isSelected={selectedItems.has(knowledge.id)}
                  onSelectionChange={(selected) =>
                    handleItemSelection(knowledge.id, selected)
                  }
                />
              ) : (
                <KnowledgeManagementListItem
                  key={knowledge.id}
                  knowledge={knowledge}
                  onEdit={() => onEdit(knowledge)}
                  onDelete={() => onDelete(knowledge.id)}
                  onToggleStatus={() =>
                    onToggleStatus(
                      knowledge.id,
                      knowledge.isFinal,
                      knowledge.title
                    )
                  }
                  isUpdating={isUpdating}
                  isDeleting={isDeleting}
                  isSelected={selectedItems.has(knowledge.id)}
                  onSelectionChange={(selected) =>
                    handleItemSelection(knowledge.id, selected)
                  }
                />
              )
            )}
          </div>
        )}

      {/* Empty State */}
      {!isLoading &&
        !isFetching &&
        !error &&
        (!knowledgeItems || knowledgeItems.length === 0) && (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                No knowledge centers found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? `No knowledge centers found matching "${searchQuery}". Try different keywords or browse categories.`
                  : "No knowledge centers available. Create your first knowledge center to get started."}
              </p>
              <div className="flex items-center justify-center gap-4">
                {hasActiveFilters && (
                  <Button onClick={handleClearFilters} variant="outline">
                    Clear Filters
                  </Button>
                )}
                <Link href="/knowledge-center/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Knowledge Center
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

      {/* Pagination */}
      {!isLoading &&
        !isFetching &&
        knowledgeItems &&
        knowledgeItems.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              {/* Showing X from Y Knowledge */}
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {knowledgeItems.length}
                  </span>{" "}
                  from{" "}
                  <span className="font-semibold text-gray-900">
                    {total || 0}
                  </span>{" "}
                  Knowledge Centers
                </p>
              </div>

              {/* Pagination */}
              <div className="flex-1 flex justify-center">
                {totalPages > 1 && (
                  <Pagination
                    alignment="center"
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    className="max-w-xl"
                  />
                )}
              </div>

              {/* Items Per Page Selector */}
              <div className="flex-1 flex justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show:</span>
                  <Dropdown
                    value={itemsPerPage.toString()}
                    onChange={(value: string) =>
                      handleItemsPerPageChange(parseInt(value))
                    }
                    items={[
                      { value: "6", label: "6" },
                      { value: "12", label: "12" },
                      { value: "24", label: "24" },
                      { value: "48", label: "48" },
                    ]}
                    className="w-20"
                    searchable={false}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
