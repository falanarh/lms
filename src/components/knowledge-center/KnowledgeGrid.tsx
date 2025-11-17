/**
 * Knowledge Grid Component
 * Focused on UI logic and presentation only
 */

'use client';

import { useMemo, useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { KnowledgeCard, Subject } from '@/components/knowledge-center';
import { Pagination } from '@/components/shared/Pagination/Pagination';
import { Dropdown } from '@/components/ui/Dropdown/Dropdown';
import { Input } from '@/components/ui/Input/Input';
import { Skeleton } from '@/components/ui/skeleton';
import { useKnowledge } from '@/hooks/useKnowledgeCenter';
import { useKnowledgeSubjects } from '@/hooks/useKnowledgeSubject';
import { SortOption, KnowledgeQueryParams, SORT_OPTIONS, KNOWLEDGE_TYPES } from '@/types/knowledge-center';

interface KnowledgeGridProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: typeof KNOWLEDGE_TYPES.WEBINAR | typeof KNOWLEDGE_TYPES.CONTENT | 'all';
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

// Skeleton component for knowledge cards
const KnowledgeCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    {/* Image skeleton */}
    <Skeleton className="w-full h-48" />
    
    <div className="p-6">
      {/* Title skeleton */}
      <Skeleton className="h-6 w-3/4 mb-3" />
      
      {/* Description skeleton */}
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      
      {/* Tags skeleton */}
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
      
      {/* Footer skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  </div>
);

export default function KnowledgeGrid({
  searchQuery,
  onSearchChange,
  selectedType,
  selectedSubject,
  onSubjectChange,
  sortBy,
  onSortChange,
}: KnowledgeGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const { data: subjects } = useKnowledgeSubjects();

  // Map subject name to ID for API filtering
  const subjectId = useMemo(() => {
    if (selectedSubject === 'all') return undefined;
    
    const subject = subjects?.find(s => s.name === selectedSubject);
    return subject?.id || selectedSubject; // Fallback to name if ID not found
  }, [selectedSubject, subjects]);

  // Build query params for API
  const queryparams: KnowledgeQueryParams = useMemo(() => ({
    search: searchQuery || undefined,
    knowledgeType: selectedType !== 'all' ? selectedType as typeof KNOWLEDGE_TYPES.WEBINAR | typeof KNOWLEDGE_TYPES.CONTENT : undefined,
    subject: subjectId ? [subjectId] : undefined,
    sort: sortBy,
    page: currentPage,
    limit: itemsPerPage,
  }), [searchQuery, selectedType, subjectId, sortBy, currentPage, itemsPerPage]);

  const {
    data: knowledgeItems,
    isLoading,
    isFetching,
    error,
    total,
    totalPages,
  } = useKnowledge(queryparams);

  const sortOptions = [
    { value: SORT_OPTIONS.NEWEST, label: 'Recently Added' },
    { value: SORT_OPTIONS.MOST_LIKED, label: 'Most Liked' },
    { value: SORT_OPTIONS.MOST_VIEWED, label: 'Most Viewed' },
  ];

  const sortDropdownItems = sortOptions.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleClearFilters = () => {
    onSearchChange('');
    onSubjectChange('all');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Category Filter */}
      <div className="mb-8">
        <Subject
          selectedSubject={selectedSubject}
          onSubjectChange={onSubjectChange}
        />
      </div>

      {/* Main Content */}
      <div>
        {/* Header with Search and Sort */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 w-full">
          <div className="mb-4 max-w-1/2">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : 'All Resources'}
            </h2>
            <p className="text-gray-600 mt-1">
              {total || 0} items found
              {selectedType !== 'all' &&
                ` • ${selectedType === 'webinar' ? 'Webinars' : 'Content'}`}
              {selectedSubject !== 'all' && ` • ${selectedSubject}`}
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center justify-end gap-4 max-w-1/2 w-full">
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
              size="md"
              containerClassName="flex-1 max-w-xl"
            />

            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Dropdown
                items={sortDropdownItems}
                value={sortBy}
                onChange={(value) => onSortChange(value as SortOption)}
                placeholder="Sort by"
                searchable={false}
                size="md"
                variant="outline"
                className="min-w-[140px]"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {(isLoading || isFetching) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(itemsPerPage)].map((_, index) => (
              <KnowledgeCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              Failed to load knowledge items
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Knowledge Grid */}
        {!isLoading &&
          !isFetching &&
          !error &&
          knowledgeItems &&
          knowledgeItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {knowledgeItems.map((knowledge) => (
                <KnowledgeCard key={knowledge.id} knowledge={knowledge} />
              ))}
            </div>
          )}

        {/* Empty State */}
        {!isLoading &&
          !isFetching &&
          !error &&
          (!knowledgeItems || knowledgeItems.length === 0) && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  No resources found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? `No resources found matching "${searchQuery}". Try different keywords or browse categories.`
                    : 'No resources available. Check back later for new content.'}
                </p>
                {(searchQuery ||
                  selectedType !== 'all' ||
                  selectedSubject !== 'all') && (
                  <button
                    onClick={handleClearFilters}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}

        {/* Pagination with Showing Info */}
        {!isLoading && !isFetching && knowledgeItems && knowledgeItems.length > 0 && (
          <div className="mt-12">
            {/* Single row with all three components */}
            <div className="flex items-center justify-between">
              {/* Showing X from Y Knowledge - Left */}
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{knowledgeItems.length}</span> from{' '}
                  <span className="font-semibold text-gray-900">{total || 0}</span> Knowledge
                </p>
              </div>

              {/* Pagination - Center */}
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

              {/* Items Per Page Selector - Right */}
              <div className="flex-1 flex justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Tampilkan:</span>
                  <Dropdown
                    value={itemsPerPage.toString()}
                    onChange={(value: string) => handleItemsPerPageChange(parseInt(value))}
                    items={[
                      { value: '5', label: '5' },
                      { value: '10', label: '10' },
                      { value: '12', label: '12' },
                      { value: '20', label: '20' },
                      { value: '50', label: '50' },
                    ]}
                    className="w-20"
                    searchable={false}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
