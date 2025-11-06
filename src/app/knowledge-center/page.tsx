/**
 * Knowledge Center Page
 * Refactored to follow UI-only logic pattern
 * Following the API → Hooks → UI pattern from coding principles
 */

'use client';

import { useState } from 'react';
import { useKnowledgeCategories } from '@/hooks/useKnowledge';
import { KnowledgeType, SortOption } from '@/types/knowledge-center';
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
  const [selectedType, setSelectedType] = useState<KnowledgeType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Get categories for filters
  const { categories } = useKnowledgeCategories();

  // UI Handlers
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleTypeChange = (type: KnowledgeType | 'all') => {
    setSelectedType(type);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
  };

  return (
    <div className="min-h-screen bg-white">
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
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        categories={categories}
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