/**
 * Knowledge Management Filters Component
 * 
 * Advanced filtering component for management view
 * Following the existing design patterns from KnowledgeFilters
 */

'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Dropdown } from '@/components/ui/Dropdown/Dropdown';
import { useKnowledgeSubjects } from '@/hooks/useKnowledgeSubject';

interface KnowledgeManagementFiltersProps {
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
  onClearFilters: () => void;
}

export default function KnowledgeManagementFilters({
  selectedSubject,
  onSubjectChange,
  onClearFilters,
}: KnowledgeManagementFiltersProps) {
  const { data: subjects = [] } = useKnowledgeSubjects();

  const subjectOptions = [
    { value: 'all', label: 'All Subjects' },
    ...subjects.map(subject => ({
      value: subject.id,
      label: subject.name,
    })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Advanced Filters</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4 mr-1" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Subject Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Subject</label>
          <Dropdown
            items={subjectOptions}
            value={selectedSubject}
            onChange={onSubjectChange}
            placeholder="Select subject"
            searchable={true}
            size="md"
            variant="outline"
          />
        </div>

        {/* Additional filters can be added here */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Created By</label>
          <Dropdown
            items={[
              { value: 'all', label: 'All Authors' },
              { value: 'me', label: 'Created by me' },
            ]}
            value="all"
            onChange={() => {}}
            placeholder="Select author"
            searchable={false}
            size="md"
            variant="outline"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Date Range</label>
          <Dropdown
            items={[
              { value: 'all', label: 'All Time' },
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'year', label: 'This Year' },
            ]}
            value="all"
            onChange={() => {}}
            placeholder="Select date range"
            searchable={false}
            size="md"
            variant="outline"
          />
        </div>
      </div>
    </div>
  );
}
