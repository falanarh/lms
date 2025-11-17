/**
 * Log Activity Filters Component
 * 
 * Advanced filtering component for log activities
 * Following the coding principles for clean UI components
 */

'use client';

import React from 'react';
import { Filter, X, Calendar, User, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Dropdown } from '@/components/ui/Dropdown/Dropdown';
import { useLogActivityTableState } from '@/hooks/useLogActivity';
import { 
  LOG_TYPE_LABELS, 
  CATEGORY_LABELS,
  SORT_OPTIONS,
} from '@/types/log-activity';

interface LogActivityFiltersProps {
  filterState: ReturnType<typeof useLogActivityTableState>;
  onClearFilters: () => void;
}

export default function LogActivityFilters({
  filterState,
  onClearFilters,
}: LogActivityFiltersProps) {
  // Use shared filter state from props
  const {
    searchQuery,
    selectedLogTypes,
    selectedCategory,
    selectedUserName,
    selectedCourseName,
    dateRange,
    sortBy,
    hasActiveFilters,
    setSearchQuery,
    setSelectedLogTypes,
    setSelectedCategory,
    setSelectedUserName,
    setSelectedCourseName,
    setDateRange,
    setSortBy,
    clearFilters,
  } = filterState;

  // Transform log types for dropdown
  const logTypeOptions = [
    { value: 'all', label: 'All Log Types' },
    ...Object.entries(LOG_TYPE_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  // Get unique user names from dummy data (in real app, this would come from API)
  const userNameOptions = [
    { value: '', label: 'All Users' },
    { value: 'John Doe', label: 'John Doe' },
    { value: 'Jane Smith', label: 'Jane Smith' },
    { value: 'Mike Johnson', label: 'Mike Johnson' },
    { value: 'Sarah Wilson', label: 'Sarah Wilson' },
    { value: 'David Brown', label: 'David Brown' },
    { value: 'Emily Davis', label: 'Emily Davis' },
    { value: 'Chris Miller', label: 'Chris Miller' },
    { value: 'Lisa Garcia', label: 'Lisa Garcia' },
  ];

  // Get unique course names from dummy data (in real app, this would come from API)
  const courseNameOptions = [
    { value: '', label: 'All Courses' },
    { value: 'React Fundamentals', label: 'React Fundamentals' },
    { value: 'JavaScript Basics', label: 'JavaScript Basics' },
    { value: 'Python for Beginners', label: 'Python for Beginners' },
    { value: 'Data Science Essentials', label: 'Data Science Essentials' },
    { value: 'Web Development Bootcamp', label: 'Web Development Bootcamp' },
    { value: 'Machine Learning Intro', label: 'Machine Learning Intro' },
    { value: 'Database Design', label: 'Database Design' },
    { value: 'UI/UX Design Principles', label: 'UI/UX Design Principles' },
  ];

  // Transform categories for dropdown
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  // Sort options
  const sortOptions = [
    { value: SORT_OPTIONS.NEWEST, label: 'Newest First' },
    { value: SORT_OPTIONS.OLDEST, label: 'Oldest First' },
    { value: SORT_OPTIONS.TYPE, label: 'By Type' },
    { value: SORT_OPTIONS.USER, label: 'By User' },
    { value: SORT_OPTIONS.DURATION, label: 'By Duration' },
  ];


  const handleClearAll = () => {
    clearFilters();
    onClearFilters();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-gray-900">Advanced Filters</h3>
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                Active
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>
        </div>
        
        <p className="text-base text-zinc-600 leading-relaxed">
          Filter log activities by search terms, log types, categories, users, courses, and date ranges
        </p>
      </div>

      {/* Filter Container */}
      <div className="bg-white rounded-2xl px-6 py-6 border border-gray-200 shadow-sm">
        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Search */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <Input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="md"
              className="w-full"
            />
          </div>

          {/* Log Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Log Type
            </label>
            <Dropdown
              items={logTypeOptions}
              value={selectedLogTypes.length > 0 ? selectedLogTypes[0] : 'all'}
              onChange={(value) => {
                if (value === 'all') {
                  setSelectedLogTypes([]);
                } else {
                  setSelectedLogTypes([value]);
                }
              }}
              placeholder="Select log type"
              searchable={true}
              size="md"
              variant="outline"
              className="w-full"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <Dropdown
              items={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="Select category"
              searchable={false}
              size="md"
              variant="outline"
              className="w-full"
            />
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Sort By
            </label>
            <Dropdown
              items={sortOptions}
              value={sortBy}
              onChange={(value) => setSortBy(value as typeof SORT_OPTIONS.NEWEST)}
              placeholder="Sort by"
              searchable={false}
              size="md"
              variant="outline"
              className="w-full"
            />
          </div>

          {/* User Name Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <User className="w-4 h-4 inline mr-1" />
              User Name
            </label>
            <Dropdown
              items={userNameOptions}
              value={selectedUserName}
              onChange={(value) => setSelectedUserName(value)}
              placeholder="Select user"
              searchable={true}
              size="md"
              variant="outline"
              className="w-full"
            />
          </div>

          {/* Course Name Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <BookOpen className="w-4 h-4 inline mr-1" />
              Course Name
            </label>
            <Dropdown
              items={courseNameOptions}
              value={selectedCourseName}
              onChange={(value) => setSelectedCourseName(value)}
              placeholder="Select course"
              searchable={true}
              size="md"
              variant="outline"
              className="w-full"
            />
          </div>

          {/* Date Range Start */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date
            </label>
            <Input
              type="datetime-local"
              value={dateRange.start ? dateRange.start.toISOString().slice(0, 16) : ''}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value ? new Date(e.target.value) : undefined }))}
              size="md"
              className="w-full"
            />
          </div>

          {/* Date Range End */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4 inline mr-1" />
              End Date
            </label>
            <Input
              type="datetime-local"
              value={dateRange.end ? dateRange.end.toISOString().slice(0, 16) : ''}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value ? new Date(e.target.value) : undefined }))}
              size="md"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Active Filters:</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-blue-600 hover:text-blue-700 text-xs"
            >
              Clear All
            </Button>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-2">
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Search: "{searchQuery}"
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-blue-900" 
                  onClick={() => setSearchQuery('')}
                />
              </span>
            )}
            
            {selectedLogTypes.length > 0 && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Log Types ({selectedLogTypes.length})
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-blue-900" 
                  onClick={() => setSelectedLogTypes([])}
                />
              </span>
            )}
            
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Category: {CATEGORY_LABELS[selectedCategory as keyof typeof CATEGORY_LABELS]}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-blue-900" 
                  onClick={() => setSelectedCategory('all')}
                />
              </span>
            )}
          
          {selectedUserName && selectedUserName !== '' && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              User: {selectedUserName}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-blue-900" 
                onClick={() => setSelectedUserName('')}
              />
            </span>
          )}
          
          {selectedCourseName && selectedCourseName !== '' && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Course: {selectedCourseName}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-blue-900" 
                onClick={() => setSelectedCourseName('')}
              />
            </span>
          )}
          
          {(dateRange.start || dateRange.end) && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Date Range
              <X 
                className="w-3 h-3 cursor-pointer hover:text-blue-900" 
                onClick={() => setDateRange({ start: undefined, end: undefined })}
              />
            </span>
          )}
        </div>
        </div>
      )}
    </div>
  );
}
