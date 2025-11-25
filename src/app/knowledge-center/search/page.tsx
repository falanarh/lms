"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Search, BookOpen } from 'lucide-react';
import { KnowledgeCard } from '@/components/knowledge-center';
import { Dropdown } from '@/components/ui/Dropdown/Dropdown';
import { Input } from '@/components/ui/Input/Input';
import { Skeleton } from '@/components/ui/skeleton';
import { useKnowledgeCenterSearch } from '@/hooks/useKnowledgeCenter';
import { useDebounce } from '@/hooks/useDebounce';
import { SortOption, SORT_OPTIONS } from '@/types/knowledge-center';
import Link from 'next/link';
import { Icon, IconName } from '@/components/ui/icon-picker';

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

function KnowledgeSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTIONS.NEWEST);

  // Debounce search query so that global search does not hit APIs on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Use the search API for live search results
  const { data: searchResults, isLoading: isSearchLoading, error: searchError } = useKnowledgeCenterSearch(
    debouncedSearchQuery,
    true, // Always enabled if there is a query, handled by hook
  );

  const isLoading = isSearchLoading;
  const error = searchError;

  const resultCount = searchResults?.data?.knowledgeCenters?.length || 0;

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // Update URL
    const newUrl = query ? `/knowledge-center/search?q=${encodeURIComponent(query)}` : '/knowledge-center/search';
    window.history.replaceState({}, '', newUrl);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
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

  // Update search query when URL changes
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    if (urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams]);

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

          {/* Search Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Search Knowledge Center'}
              </h1>
              <p className="text-gray-600 mt-1">
                Find knowledge centers and subjects across all categories
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="Search knowledge centers and subjects..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
              size="lg"
              containerClassName="w-full"
            />
          </div>
        </div>

        {searchQuery.length >= 2 && (
          <>
            {/* Results Summary */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
                  <p className="text-gray-600 mt-1">
                    {isLoading
                      ? 'Searching...'
                      : `${searchResults?.data?.knowledgeSubjects?.length || 0} subjects and ${searchResults?.data?.knowledgeCenters?.length || 0} knowledge centers found`}
                  </p>
                </div>

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

            {/* Knowledge Subjects Section */}
            {searchResults?.data?.knowledgeSubjects && searchResults.data.knowledgeSubjects.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Knowledge Subjects</h3>
                  {!isLoading && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                      {searchResults.data.knowledgeSubjects.length}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.data.knowledgeSubjects.map((subject: any) => (
                    <Link
                      key={subject.id}
                      href={`/knowledge-center/subject/${subject.id}`}
                      className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Icon name={(subject.icon) as IconName || 'book-open'} className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                            {subject.name}
                          </h4>
                          <p className="text-sm text-gray-600">Subject category</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Knowledge Centers Section */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Search className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">Knowledge Centers</h3>
                {!isLoading && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                    {searchResults?.data?.knowledgeCenters?.length || 0}
                  </span>
                )}
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(12)].map((_, index) => (
                    <KnowledgeCardSkeleton key={index} />
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-12">
                  <div className="text-red-600 mb-4">
                    Failed to load search results
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Knowledge Centers Grid - uses search results from API */}
              {!isLoading && !error && searchResults?.data?.knowledgeCenters?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {searchResults.data.knowledgeCenters.map((knowledge: any) => (
                    <KnowledgeCard key={knowledge.id} knowledge={knowledge} />
                  ))}
                </div>
              )}

              {/* Empty State - Only show if BOTH lists are empty */}
              {!isLoading && !error && 
               (!searchResults?.data?.knowledgeCenters || searchResults.data.knowledgeCenters.length === 0) && 
               (!searchResults?.data?.knowledgeSubjects || searchResults.data.knowledgeSubjects.length === 0) && (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      No results found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      No knowledge centers or subjects found matching "{searchQuery}". Try different keywords or browse categories.
                    </p>
                    <button
                      onClick={() => handleSearchChange('')}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Clear Search
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Initial State */}
        {searchQuery.length < 2 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Start Your Search
              </h3>
              <p className="text-gray-600 mb-6">
                Enter at least 2 characters to search for knowledge centers and subjects.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading fallback component
function KnowledgeSearchPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
            <div>
              <div className="h-8 bg-gray-200 rounded w-96 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-80"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto mb-8">
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, index) => (
            <KnowledgeCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Export the wrapped component
export default function KnowledgeSearchPageWrapper() {
  return (
    <Suspense fallback={<KnowledgeSearchPageLoading />}>
      <KnowledgeSearchPage />
    </Suspense>
  );
}
