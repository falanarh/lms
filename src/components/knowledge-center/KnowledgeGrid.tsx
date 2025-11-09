/**
 * Knowledge Grid Component
 * Focused on UI logic and presentation only
 */

'use client';

import { useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { KnowledgeCard, Subject } from '@/components/knowledge-center';
import { Pagination } from '@/components/shared/Pagination/Pagination';
import { Dropdown } from '@/components/ui/Dropdown/Dropdown';
import { Input } from '@/components/ui/Input/Input';
import { useKnowledgeGrid } from '@/hooks/useKnowledge';
import { SortOption } from '@/types/knowledge-center';

interface KnowledgeGridProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: 'webinar' | 'konten' | 'all';
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

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

  const {
    data: knowledgeItems,
    isLoading,
    error,
    total,
    totalPages,
  } = useKnowledgeGrid({
    search: searchQuery || undefined,
    knowledge_type: selectedType !== 'all' ? [selectedType as 'webinar' | 'konten'] : undefined,
    subject: selectedSubject !== 'all' ? [selectedSubject] : undefined,
    sort: sortBy,
    page: currentPage,
    limit: 12,
  });

  const sortOptions = [
    { value: 'newest', label: 'Recently Added' },
    { value: 'most_liked', label: 'Most Popular' },
    { value: 'most_viewed', label: 'Most Viewed' },
    { value: 'upcoming_webinar', label: 'Upcoming Events' },
    { value: 'popular', label: 'Trending Now' },
  ];

  const sortDropdownItems = sortOptions.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
          <div className="mb-4 max-w-1/5">
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
          <div className="flex items-center justify-end gap-4 max-w-4/5 w-full">
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
              size="md"
              containerClassName="flex-1 max-w-xl"
            />

            <Dropdown
              items={sortDropdownItems}
              value={sortBy}
              onChange={(value) => onSortChange(value as SortOption)}
              placeholder="Sort by"
              label="Sort by:"
              searchable={false}
              size="md"
              variant="outline"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <div className="aspect-video bg-gray-200 animate-pulse"></div>
                <div className="p-6 flex flex-col h-full">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2 animate-pulse"></div>
                  <div className="mt-auto">
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                    <div className="flex gap-4">
                      <div className="h-2 bg-gray-200 rounded w-12 animate-pulse"></div>
                      <div className="h-2 bg-gray-200 rounded w-12 animate-pulse"></div>
                      <div className="h-2 bg-gray-200 rounded w-12 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
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
        {!isLoading && knowledgeItems && knowledgeItems.length > 0 && (
          <div className="mt-12 flex items-center justify-between">
            {/* Showing X from Y Knowledge - Left */}
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{knowledgeItems.length}</span> from{' '}
              <span className="font-semibold text-gray-900">{total || 0}</span> Knowledge
            </p>

            {/* Pagination - Right */}
            {totalPages > 1 && (
              <Pagination
                alignment="right"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="max-w-xl"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
