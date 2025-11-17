/**
 * Log Activity Table Component
 *
 * Advanced table with filtering, sorting, and pagination
 * Following the coding principles for clean UI components
 */

"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Calendar,
  User,
  Activity,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Dropdown } from "@/components/ui/Dropdown/Dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useLogActivities,
  useLogActivityTableState,
} from "@/hooks/useLogActivity";
import {
  LOG_TYPE_LABELS,
  LOG_TYPE_COLORS,
  LOG_TYPES,
  SORT_OPTIONS,
  LogActivityQueryParams,
  LogType,
} from "@/types/log-activity";

interface LogActivityTableProps {
  filterState: ReturnType<typeof useLogActivityTableState>;
  onRefresh: () => void;
  onExport: (
    format: "csv" | "excel" | "pdf",
    params?: LogActivityQueryParams
  ) => void;
  isExporting: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// Helper function to determine if log type should show duration
const shouldShowDuration = (logType: LogType): boolean => {
  const endSessionTypes: LogType[] = [
    LOG_TYPES.LOGIN, // logout session
    LOG_TYPES.END_COURSE,
    LOG_TYPES.END_SECTION,
    LOG_TYPES.END_CONTENT,
    LOG_TYPES.END_QUIZ,
  ];
  return endSessionTypes.includes(logType);
};

const formatDuration = (seconds?: number): string => {
  if (!seconds) return "-";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// ============================================================================
// Skeleton Components
// ============================================================================

const TableRowSkeleton = () => (
  <tr className="border-b border-gray-100">
    <td className="px-6 py-4">
      <Skeleton className="h-4 w-32" />
    </td>
    <td className="px-6 py-4">
      <Skeleton className="h-6 w-20 rounded-full" />
    </td>
    <td className="px-6 py-4">
      <Skeleton className="h-4 w-24" />
    </td>
    <td className="px-6 py-4">
      <Skeleton className="h-4 w-40" />
    </td>
    <td className="px-6 py-4">
      <Skeleton className="h-4 w-16" />
    </td>
    <td className="px-6 py-4">
      <Skeleton className="h-4 w-24" />
    </td>
    <td className="px-6 py-4">
      <Skeleton className="h-8 w-16" />
    </td>
  </tr>
);

// ============================================================================
// Main Component
// ============================================================================

export default function LogActivityTable({
  filterState,
  onRefresh,
  onExport,
  isExporting,
}: LogActivityTableProps) {
  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Use shared filter state from props
  const {
    searchQuery,
    sortBy,
    currentPage,
    itemsPerPage,
    queryParams,
    hasActiveFilters,
    setSearchQuery,
    setSortBy,
    setCurrentPage,
    setItemsPerPage,
    clearFilters,
  } = filterState;

  // Fetch data
  const {
    data: logActivities,
    isLoading,
    isFetching,
    error,
    refetch,
    total,
    totalPages,
  } = useLogActivities(queryParams);

  // Sort options for dropdown
  const sortOptions = [
    { value: SORT_OPTIONS.NEWEST, label: "Newest First" },
    { value: SORT_OPTIONS.OLDEST, label: "Oldest First" },
    { value: SORT_OPTIONS.TYPE, label: "By Type" },
    { value: SORT_OPTIONS.USER, label: "By User" },
    { value: SORT_OPTIONS.DURATION, label: "By Duration" },
  ];

  // Items per page options
  const itemsPerPageOptions = [
    { value: "10", label: "10 per page" },
    { value: "25", label: "25 per page" },
    { value: "50", label: "50 per page" },
    { value: "100", label: "100 per page" },
  ];

  // Handle row selection
  const handleRowSelect = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === logActivities.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(logActivities.map((log) => log.id));
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: string) => {
    setItemsPerPage(parseInt(newItemsPerPage));
    setCurrentPage(1);
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
    onRefresh();
  };

  // Generate pagination numbers
  const paginationNumbers = useMemo(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter(
      (item, index, arr) => arr.indexOf(item) === index
    );
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6">
      {/* Table Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Activity Logs
              </h2>
              <p className="text-sm text-gray-600">
                {total} total logs
                {hasActiveFilters && " (filtered)"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Search */}
          {/* <div className="relative">
            <Input
              type="text"
              placeholder="Quick search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              size="sm"
              className="w-64"
            />
          </div> */}

          {/* Sort Dropdown */}
          {/* <Dropdown
            items={sortOptions}
            value={sortBy}
            onChange={setSortBy}
            placeholder="Sort by"
            size="sm"
            variant="outline"
            className="w-40"
          /> */}

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isFetching}
            className="flex items-center gap-2"
            leftIcon={
              <RefreshCw
                className={`w-4 h-4 ${isLoading || isFetching ? "animate-spin" : ""}`}
              />
            }
          >
            Refresh
          </Button>

          {/* Export Button with Dropdown */}
          <div className="relative group">
            <Button
              size="sm"
              disabled={isExporting}
              className="flex items-center gap-2"
              leftIcon={<Download className="w-4 h-4" />}
            >
              {isExporting ? "Exporting..." : "Export"}
            </Button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => onExport("csv", queryParams)}
                  disabled={isExporting}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Download className="w-3 h-3" />
                  Export as CSV
                </button>
                <button
                  onClick={() => onExport("excel", queryParams)}
                  disabled={isExporting}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Download className="w-3 h-3" />
                  Export as Excel
                </button>
                <button
                  onClick={() => onExport("pdf", queryParams)}
                  disabled={isExporting}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Download className="w-3 h-3" />
                  Export as JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {/* {hasActiveFilters && (
        <div className="mb-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Filters applied (
                  {Object.values(queryParams).filter(Boolean).length})
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700"
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )} */}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left w-12">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.length === logActivities.length &&
                      logActivities.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900 transition-colors">
                    <Calendar className="w-4 h-4" />
                    Timestamp
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Type
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    User
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Detail
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Duration
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {/* Loading State */}
              {(isLoading || isFetching) && (
                <>
                  {[...Array(itemsPerPage)].map((_, index) => (
                    <TableRowSkeleton key={index} />
                  ))}
                </>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-red-600">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">
                        Failed to load logs
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {error.message}
                      </p>
                      <Button
                        onClick={handleRefresh}
                        variant="outline"
                        size="sm"
                      >
                        Try Again
                      </Button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Data Rows */}
              {!isLoading &&
                !isFetching &&
                !error &&
                logActivities.map((log) => (
                  <tr
                    key={log.id}
                    className={`hover:bg-blue-50/50 transition-all duration-200 ${
                      selectedRows.includes(log.id)
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "hover:shadow-sm"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(log.id)}
                        onChange={() => handleRowSelect(log.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          LOG_TYPE_COLORS[log.logType] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {LOG_TYPE_LABELS[log.logType] || log.logType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {log.userName || "Unknown User"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {log.userId}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="max-w-xs">
                        {truncateText(log.detail || "No details available")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {shouldShowDuration(log.logType) ? formatDuration(log.duration) : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/log-activity/${log.id}`)}
                        className="flex justify-center items-center gap-1"
                        leftIcon={<Eye className="w-4 h-4 -mr-1" />}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}

              {/* Empty State */}
              {!isLoading &&
                !isFetching &&
                !error &&
                logActivities.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">
                          No logs found
                        </h3>
                        <p className="text-sm mb-4">
                          {hasActiveFilters
                            ? "No logs match your current filters. Try adjusting your search criteria."
                            : "No activity logs are available at the moment."}
                        </p>
                        {hasActiveFilters && (
                          <Button
                            onClick={clearFilters}
                            variant="outline"
                            size="sm"
                          >
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && !error && logActivities.length > 0 && (
        <div className="flex items-center justify-between py-4 mt-4">
          {/* Results Info */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, total)} of {total} results
            </span>

            <Dropdown
              items={itemsPerPageOptions}
              value={itemsPerPage.toString()}
              onChange={handleItemsPerPageChange}
              size="sm"
              variant="outline"
              className="w-32"
            />
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1">
              {paginationNumbers.map((page, index) => (
                <React.Fragment key={index}>
                  {page === "..." ? (
                    <span className="px-3 py-1 text-gray-500">...</span>
                  ) : (
                    <Button
                      variant={currentPage === page ? "solid" : "ghost"}
                      size="sm"
                      onClick={() => handlePageChange(page as number)}
                      className="min-w-[2.5rem]"
                    >
                      {page}
                    </Button>
                  )}
                </React.Fragment>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
