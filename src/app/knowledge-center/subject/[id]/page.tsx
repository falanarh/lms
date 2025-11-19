"use client";

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Search } from 'lucide-react';
import { KnowledgeCard } from '@/components/knowledge-center';
import { Pagination } from '@/components/shared/Pagination/Pagination';
import { Dropdown } from '@/components/ui/Dropdown/Dropdown';
import { Input } from '@/components/ui/Input/Input';
import { Skeleton } from '@/components/ui/skeleton';
import { useKnowledge } from '@/hooks/useKnowledgeCenter';
import { useKnowledgeSubjects } from '@/hooks/useKnowledgeSubject';
import { useDebounce } from '@/hooks/useDebounce';
import { SortOption, SORT_OPTIONS, KnowledgeQueryParams } from '@/types/knowledge-center';

// Skeleton component for knowledge cards
const KnowledgeCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <Skeleton className="w-full h-48" />
    <div className="p-6">
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
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

export default function KnowledgeSubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.id as string;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTIONS.NEWEST);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  const { data: subjects } = useKnowledgeSubjects();

  // Debounce search within a subject so API calls are not made on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Find the current subject
  const currentSubject = subjects?.find(subject => subject.id === subjectId);

  // Build query params for API
  const queryparams: KnowledgeQueryParams = useMemo(() => ({
    search: debouncedSearchQuery || undefined,
    subject: subjectId ? [subjectId] : undefined,
    sort: sortBy,
    page: currentPage,
    limit: itemsPerPage,
  }), [debouncedSearchQuery, subjectId, sortBy, currentPage, itemsPerPage]);

  const {
    data: knowledgeItems,
    isLoading,
    isFetching,
    error,
    total,
    totalPages,
  } = useKnowledge(queryparams);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleBackClick = () => {
    router.back();
  };

  const sortOptions = [
    { value: SORT_OPTIONS.NEWEST, label: 'Recently Added' },
    { value: SORT_OPTIONS.MOST_LIKED, label: 'Most Liked' },
    { value: SORT_OPTIONS.MOST_VIEWED, label: 'Most Viewed' },
  ];

  const sortDropdownItems = sortOptions.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  if (!currentSubject && subjects) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Subject Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              The knowledge subject you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={handleBackClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={handleBackClick}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Knowledge Center
          </button>

          {/* Subject Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentSubject?.name || 'Loading...'}
              </h1>
              <p className="text-gray-600 mt-1">
                Explore all knowledge centers in this subject category
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Knowledge Grid without subject filter */}
      {currentSubject && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header with Search and Sort */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 w-full">
            <div className="mb-4 max-w-1/2">
              <h2 className="text-2xl font-bold text-gray-900">
                {searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : 'All Resources'}
              </h2>
              <p className="text-gray-600 mt-1">
                {isLoading || isFetching ? (
                  'Searching items in this subject...'
                ) : (
                  <>
                    {total || 0} items found in {currentSubject.name}
                  </>
                )}
              </p>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex items-center justify-end gap-4 max-w-1/2 w-full">
              <Input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
                size="md"
                containerClassName="flex-1 max-w-xl"
              />

              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Dropdown
                  items={sortDropdownItems}
                  value={sortBy}
                  onChange={(value) => handleSortChange(value as SortOption)}
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
                      ? `No resources found matching "${searchQuery}" in ${currentSubject.name}. Try different keywords.`
                      : `No resources available in ${currentSubject.name}. Check back later for new content.`}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => handleSearchChange('')}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            )}

          {/* Pagination */}
          {!isLoading && !isFetching && knowledgeItems && knowledgeItems.length > 0 && (
            <div className="mt-12">
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
      )}
    </div>
  );
}
