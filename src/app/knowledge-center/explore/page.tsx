'use client';

import { useState } from 'react';
import { Search, Grid, List, SlidersHorizontal } from 'lucide-react';
import KnowledgeCard from '@/components/knowledge-center/KnowledgeCard';
import KnowledgeFilters from '@/components/knowledge-center/KnowledgeFilters';
import { useKnowledge } from '@/hooks/useKnowledgeCenter';
import { KnowledgeFilters as FilterType, SortOption, KnowledgeQueryParams } from '@/types/knowledge-center';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<FilterType>({});
  const [showFilters, setShowFilters] = useState(false);

  // Build query params
  const queryParams: KnowledgeQueryParams = {
    search: searchQuery || undefined,
    sort: sortBy,
    ...filters,
    limit: 20,
  };

  const {
    data: knowledgeItems,
    isLoading,
    error,
    total,
    page,
    totalPages,
  } = useKnowledge(queryParams);

  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const hasActiveFilters = Object.values(filters).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '';
  });

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'most_liked', label: 'Most Liked' },
    { value: 'most_viewed', label: 'Most Viewed' },
    { value: 'upcoming_webinar', label: 'Upcoming Webinars' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Knowledge</h1>
            <p className="text-gray-600">
              Discover and browse through our knowledge base
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search knowledge, subject, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between max-w-4xl mx-auto mt-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters || hasActiveFilters
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="max-w-4xl mx-auto mt-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Active:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                    {searchQuery}
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:text-gray-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="w-80 flex-shrink-0">
              <KnowledgeFilters
                filters={filters}
                onFiltersChange={handleFilterChange}
              />
            </aside>
          )}

          {/* Content Area */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-8">
              <p className="text-gray-600">
                {total} {total === 1 ? 'result' : 'results'}
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-8">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-16">
                <p className="text-gray-600 mb-6">Failed to load knowledge items. Please try again.</p>
                <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                  Retry
                </button>
              </div>
            )}

            {/* Knowledge List */}
            {!isLoading && !error && knowledgeItems && knowledgeItems.length > 0 && (
              <div className="space-y-8">
                {knowledgeItems.map((item) => (
                  <KnowledgeCard
                    key={item.id}
                    knowledge={item}
                    className="border border-gray-200 hover:border-gray-300 transition-colors"
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && (!knowledgeItems || knowledgeItems.length === 0) && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">No knowledge found</h3>
                <p className="text-gray-600 mb-8">
                  Try adjusting your search terms or filters
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && !error && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-16">
                <button
                  disabled={page <= 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button
                        key={pageNum}
                        className={`px-4 py-2 rounded-lg ${
                          pageNum === page
                            ? 'bg-gray-900 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={page >= totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}