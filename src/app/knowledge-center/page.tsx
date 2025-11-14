/**
 * Knowledge Center Page
 * Refactored to follow UI-only logic pattern
 * Following the API → Hooks → UI pattern from coding principles
 */

'use client';

import { useState } from 'react';
import { SortOption, SORT_OPTIONS, KNOWLEDGE_TYPES, KnowledgeType } from '@/types/knowledge-center';
import {
  KnowledgeHero,
  KnowledgeStats,
  KnowledgeGrid,
  PopularCarousel,
  UpcomingWebinars,
  CreateKnowledgeButton,
} from '@/components/knowledge-center';

export default function KnowledgeCenterPage() {
  // UI State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<typeof KNOWLEDGE_TYPES.WEBINAR | typeof KNOWLEDGE_TYPES.CONTENT | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTIONS.NEWEST);

  // UI Handlers
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleTypeChange = (type: KnowledgeType | 'all') => {
    setSelectedType(type);
  };

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-200">
      {/* Hero Section with Full Screen Search */}
      <KnowledgeHero
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
      />

      {/* Stats Section */}
      <KnowledgeStats />

      {/* Main Content Area */}
      <KnowledgeGrid
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedType={selectedType}
        selectedSubject={selectedSubject}
        onSubjectChange={handleSubjectChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
      />

      {/* Upcoming Webinars Section */}
      <UpcomingWebinars />

      {/* Popular Knowledge Carousel Section */}
      <PopularCarousel />

      {/* Floating Create Knowledge Button */}
      <CreateKnowledgeButton />
    </div>
  );
}
