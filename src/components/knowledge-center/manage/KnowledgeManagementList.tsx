/**
 * Knowledge Management List Component
 * 
 * Following the API → Hooks → UI pattern from coding principles
 * - Focused on UI logic and presentation only
 * - Uses custom hooks for data fetching and business logic
 * - Clean separation of concerns for better maintainability
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, Grid3X3, List } from 'lucide-react';
import { Input } from '@/components/ui/Input/Input';
import { Dropdown } from '@/components/ui/Dropdown/Dropdown';
import { Button } from '@/components/ui/Button/Button';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/shared/Pagination/Pagination';
import KnowledgeManagementCard from './KnowledgeManagementCard';
// import KnowledgeManagementFilters from './KnowledgeManagementFilters'; // Component not implemented yet
import { useKnowledge } from '@/hooks/useKnowledgeCenter';
import { useKnowledgeSubjects } from '@/hooks/useKnowledgeSubject';
import { KnowledgeCenter, KnowledgeQueryParams, SORT_OPTIONS, KNOWLEDGE_TYPES } from '@/types/knowledge-center';
import Link from 'next/link';

interface KnowledgeManagementListProps {
  onEdit: (knowledge: KnowledgeCenter) => void;
  onDelete: (id: string) => void;
  onDuplicate: (knowledge: KnowledgeCenter) => void;
  onToggleStatus: (id: string, isFinal: boolean) => void;
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
  onToggleStatus, 
  isUpdating 
}: {
  knowledge: KnowledgeCenter;
  onEdit: () => void;
  onToggleStatus: () => void;
  isUpdating: boolean;
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
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
                <span className="flex items-center gap-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    knowledge.isFinal ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  {knowledge.isFinal ? 'Published' : 'Draft'}
                </span>
                <span>{knowledge.type}</span>
                <span>{new Date(knowledge.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            disabled={isUpdating}
          >
            Edit
          </Button>
          <Button
            variant={knowledge.isFinal ? 'outline' : 'solid'}
            size="sm"
            onClick={onToggleStatus}
            disabled={isUpdating}
          >
            {knowledge.isFinal ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function KnowledgeManagementList({
  onEdit,
  // onDelete,
  // onDuplicate,
  onToggleStatus,
  isDeleting,
  isUpdating,
}: KnowledgeManagementListProps) {
  // ============================================================================
  // State Management
  // ============================================================================
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<typeof KNOWLEDGE_TYPES.WEBINAR | typeof KNOWLEDGE_TYPES.CONTENT | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.NEWEST);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // ============================================================================
  // Data Fetching
  // ============================================================================
  
  const { data: subjects } = useKnowledgeSubjects();

  // Map subject name to ID for API filtering
  const subjectId = useMemo(() => {
    if (selectedSubject === 'all') return undefined;
    
    const subject = subjects?.find(s => s.name === selectedSubject);
    return subject?.id || selectedSubject;
  }, [selectedSubject, subjects]);

  // Build query params for API
  const queryParams: KnowledgeQueryParams = useMemo(() => ({
    search: searchQuery || undefined,
    knowledgeType: selectedType !== 'all' ? selectedType as typeof KNOWLEDGE_TYPES.WEBINAR | typeof KNOWLEDGE_TYPES.CONTENT : undefined,
    subject: subjectId ? [subjectId] : undefined,
    sort: sortBy,
    page: currentPage,
    limit: itemsPerPage,
    // Add status filter for management view
    ...(selectedStatus === 'published' && { 'isFinal': true }),
    ...(selectedStatus === 'draft' && { 'isFinal': false }),
  }), [searchQuery, selectedType, subjectId, sortBy, currentPage, itemsPerPage, selectedStatus]);

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
    setSearchQuery('');
    setSelectedType('all');
    setSelectedSubject('all');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    refetch();
  };

  // ============================================================================
  // Sort and Filter Options
  // ============================================================================

  const sortOptions = [
    { value: SORT_OPTIONS.NEWEST, label: 'Recently Added' },
    { value: SORT_OPTIONS.MOST_LIKED, label: 'Most Liked' },
    { value: SORT_OPTIONS.MOST_VIEWED, label: 'Most Viewed' },
    { value: 'title', label: 'Title A-Z' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: KNOWLEDGE_TYPES.WEBINAR, label: 'Webinars' },
    { value: KNOWLEDGE_TYPES.CONTENT, label: 'Content' },
  ];

  const hasActiveFilters = searchQuery || selectedType !== 'all' || selectedSubject !== 'all' || selectedStatus !== 'all';

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Knowledge Centers Management
          </h2>
          <p className="text-gray-600 mt-1">
            {total || 0} items found
            {selectedType !== 'all' && ` • ${selectedType === 'webinar' ? 'Webinars' : 'Content'}`}
            {selectedSubject !== 'all' && ` • ${selectedSubject}`}
            {selectedStatus !== 'all' && ` • ${selectedStatus}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isFetching}
          >
            Refresh
          </Button>
          
          <Link href="/knowledge-center/create">
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-4">
        {/* Main Search and Filter Row */}
        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
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
                  onChange={(value) => setSelectedType(value as typeof KNOWLEDGE_TYPES.WEBINAR | typeof KNOWLEDGE_TYPES.CONTENT | 'all')}
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
                  onChange={(value) => setSelectedStatus(value as 'all' | 'published' | 'draft')}
                  placeholder="All Status"
                  searchable={false}
                  size="md"
                  variant="outline"
                />
              </div>

              <div className="min-w-[140px]">
                <Dropdown
                  items={sortOptions.map(option => ({ value: option.value, label: option.label }))}
                  value={sortBy}
                  onChange={(value) => setSortBy(value as typeof SORT_OPTIONS.NEWEST)}
                  placeholder="Sort by"
                  searchable={false}
                  size="md"
                  variant="outline"
                />
              </div>
            </div>

            {/* View Toggle and Advanced Filter Toggle */}
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none border-0 px-3"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'solid' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none border-0 px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

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
                    {Object.values({
                      search: searchQuery,
                      type: selectedType !== 'all' ? selectedType : null,
                      subject: selectedSubject !== 'all' ? selectedSubject : null,
                      status: selectedStatus !== 'all' ? selectedStatus : null,
                    }).filter(Boolean).length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <h4 className="font-medium text-gray-900">Advanced Filters</h4>
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
                      { value: 'all', label: 'All Subjects' },
                      ...(subjects?.map(subject => ({
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

      {/* Loading State */}
      {(isLoading || isFetching) && (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
        }>
          {[...Array(itemsPerPage)].map((_, index) => (
            viewMode === 'grid' 
              ? <KnowledgeManagementCardSkeleton key={index} />
              : <KnowledgeManagementListSkeleton key={index} />
          ))}
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
      {!isLoading && !isFetching && !error && knowledgeItems && knowledgeItems.length > 0 && (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
        }>
          {knowledgeItems.map((knowledge) => (
            viewMode === 'grid' ? (
              <KnowledgeManagementCard
                key={knowledge.id}
                knowledge={knowledge}
                onEdit={() => onEdit(knowledge)}
                onToggleStatus={() => onToggleStatus(knowledge.id, !knowledge.isFinal)}
                isDeleting={isDeleting}
                isUpdating={isUpdating}
              />
            ) : (
              <KnowledgeManagementListItem
                key={knowledge.id}
                knowledge={knowledge}
                onEdit={() => onEdit(knowledge)}
                onToggleStatus={() => onToggleStatus(knowledge.id, !knowledge.isFinal)}
                isUpdating={isUpdating}
              />
            )
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isFetching && !error && (!knowledgeItems || knowledgeItems.length === 0) && (
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
                : 'No knowledge centers available. Create your first knowledge center to get started.'}
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
      {!isLoading && !isFetching && knowledgeItems && knowledgeItems.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            {/* Showing X from Y Knowledge */}
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{knowledgeItems.length}</span> from{' '}
                <span className="font-semibold text-gray-900">{total || 0}</span> Knowledge Centers
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
                  onChange={(value: string) => handleItemsPerPageChange(parseInt(value))}
                  items={[
                    { value: '6', label: '6' },
                    { value: '12', label: '12' },
                    { value: '24', label: '24' },
                    { value: '48', label: '48' },
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
  );
}
