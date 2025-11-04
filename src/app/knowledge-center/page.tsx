"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Calendar,
  Eye,
  ThumbsUp,
  Users,
  BookOpen,
  LayoutGrid,
  TrendingUp,
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import KnowledgeCard from "@/components/knowledge-center/KnowledgeCard";
import CategoryFilter from "@/components/knowledge-center/CategoryFilter";
import { Pagination } from "@/components/shared/Pagination/Pagination";
import { Dropdown } from "@/components/ui/Dropdown/Dropdown";
import { Input } from "@/components/ui/Input/Input";
import {
  useKnowledge,
  useWebinarSchedule,
  useKnowledgeAnalytics,
} from "@/hooks/useKnowledgeCenter";
import {
  KnowledgeType,
  MediaType,
  SortOption,
  KnowledgeQueryParams,
  Knowledge,
} from "@/types/knowledge-center";

export default function KnowledgeCenterPage() {
  // State for filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<KnowledgeType | "all">(
    "all"
  );
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: knowledgeItems,
    isLoading,
    error,
    total,
    totalPages,
  } = useKnowledge({
    search: searchQuery || undefined,
    knowledge_type: selectedType !== "all" ? [selectedType] : undefined,
    subject: selectedCategory !== "all" ? [selectedCategory] : undefined,
    sort: sortBy,
    page: currentPage,
    limit: 12,
  });

  // Get all knowledge items for categories (without filters)
  const { data: allKnowledgeItemsForCategories } = useKnowledge({
    limit: 1000, // Get all items to extract all categories
  });

  const { schedule: upcomingWebinars } = useWebinarSchedule();
  const { analytics } = useKnowledgeAnalytics();

  // Filter upcoming webinars from schedule data
  const upcomingWebinarsList = useMemo(() => {
    if (!upcomingWebinars) return [];
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return upcomingWebinars
      .filter((item) => {
        const webinarDate = new Date(item.tgl_zoom);
        return webinarDate > now && webinarDate <= sevenDaysFromNow;
      })
      .slice(0, 3);
  }, [upcomingWebinars]);

  // Get popular knowledge for carousel
  const { data: popularKnowledge } = useKnowledge({
    sort: "most_liked",
    limit: 10,
  });

  // Auto-scroll carousel state
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll effect
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || isPaused) return;

    const scrollSpeed = 1; // pixels per interval
    const intervalTime = 30; // milliseconds

    const interval = setInterval(() => {
      if (carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth) {
        carousel.scrollLeft = 0;
      } else {
        carousel.scrollLeft += scrollSpeed;
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Get unique categories/subjects from all knowledge data (not just current page)
  const categories = useMemo(() => {
    // Use all knowledge items to get all available categories
    const itemsToUse = allKnowledgeItemsForCategories || knowledgeItems || [];
    const subjects = [
      ...new Set(itemsToUse.map((item) => item.subject).filter(Boolean)),
    ];
    return subjects.sort(); // Sort alphabetically
  }, [allKnowledgeItemsForCategories, knowledgeItems]);

  const sortOptions = [
    { value: "newest", label: "Recently Added" },
    { value: "most_liked", label: "Most Popular" },
    { value: "most_viewed", label: "Most Viewed" },
    { value: "upcoming_webinar", label: "Upcoming Events" },
    { value: "popular", label: "Trending Now" },
  ];

  // Dropdown items untuk sort
  const sortDropdownItems = sortOptions.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  const isLoadingData = isLoading;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Full Screen Search - Modern Design */}
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50/40 to-purple-50/30 border-b border-gray-200/50 overflow-hidden">
        {/* Animated Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large blur circles */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/30 via-purple-200/20 to-transparent rounded-full blur-3xl -mr-48 -mt-48 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-green-200/20 via-blue-200/20 to-transparent rounded-full blur-3xl -ml-32 -mb-32"></div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-20"></div>

          {/* Floating decorative elements */}
          <div className="absolute top-20 left-20 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-2xl rotate-12 backdrop-blur-sm border border-white/20"></div>
          <div className="absolute top-40 right-32 w-16 h-16 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full backdrop-blur-sm border border-white/20"></div>
          <div className="absolute bottom-32 right-20 w-24 h-24 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-3xl -rotate-6 backdrop-blur-sm border border-white/20"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          {/* Title Section */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-blue-200/50 rounded-full text-sm text-blue-600 font-medium mb-6 shadow-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Welcome to Knowledge Hub</span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-snug">
              Knowledge Center
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Pusat pembelajaran dan berbagi pengetahuan untuk Pusdiklat BPS
            </p>

            {/* Stats Pills */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="group flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm text-gray-700 font-medium shadow-sm hover:shadow-md hover:border-blue-300/50 transition-all duration-300">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">{analytics?.total_knowledge || 0}+</span>
                <span className="text-gray-600">Resources</span>
              </div>
              <div className="group flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm text-gray-700 font-medium shadow-sm hover:shadow-md hover:border-purple-300/50 transition-all duration-300">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">{(analytics?.total_views || 0).toLocaleString()}+</span>
                <span className="text-gray-600">Views</span>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="max-w-4xl mx-auto">
            <div className="relative mb-6 group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative flex items-center bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 overflow-hidden">
                <Search className="absolute left-6 text-gray-400 w-6 h-6 transition-colors duration-300 group-hover:text-blue-500" />
                <input
                  type="text"
                  placeholder="Search for webinars, videos, PDFs, audio content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-16 pr-6 py-5 text-lg bg-transparent focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <span className="text-gray-400 hover:text-gray-600 text-xl">×</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Filter Pills - Enhanced */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setSelectedType("all")}
                className={`group px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  selectedType === "all"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105"
                    : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200/50 hover:border-blue-300 hover:shadow-md"
                }`}
              >
                <span className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  All Content
                </span>
              </button>
              <button
                onClick={() => setSelectedType("webinar")}
                className={`group px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  selectedType === "webinar"
                    ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/30 scale-105"
                    : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200/50 hover:border-green-300 hover:shadow-md"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Webinars
                </span>
              </button>
              <button
                onClick={() => setSelectedType("konten")}
                className={`group px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  selectedType === "konten"
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30 scale-105"
                    : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200/50 hover:border-purple-300 hover:shadow-md"
                }`}
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Content
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Modern Asymmetric Design */}
      <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Resources - Featured Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150"></div>
              <div className="relative flex items-start gap-4">
                <div className="flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex-shrink-0 transition-transform duration-300 group-hover:rotate-12">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-3xl font-bold text-white mb-1">
                    {analytics?.total_knowledge || 0}
                  </div>
                  <div className="text-sm text-blue-100 font-medium">Total Resources</div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
            </div>

            {/* Webinars - Elegant Card */}
            <div className="group relative overflow-hidden bg-white border-2 border-green-100 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-green-300 hover:-translate-y-1 cursor-pointer">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100 to-green-50 rounded-full -mr-12 -mt-12 transition-all duration-500 group-hover:scale-150 group-hover:opacity-50"></div>
              <div className="relative flex items-start gap-4">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex-shrink-0 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-200">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-3xl font-bold bg-gradient-to-br from-green-600 to-green-700 bg-clip-text text-transparent mb-1">
                    {analytics?.total_webinars || 0}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Webinars</div>
                </div>
              </div>
            </div>

            {/* Total Views - Vibrant Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-white border border-purple-200/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-purple-300 hover:-translate-y-1 cursor-pointer">
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-purple-300/30 rounded-full transition-all duration-500 group-hover:scale-125 group-hover:rotate-45"></div>
              <div className="relative flex items-start gap-4">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex-shrink-0 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-200 group-hover:rotate-6">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-purple-700 bg-clip-text text-transparent mb-1">
                    {(analytics?.total_views || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Total Views</div>
                </div>
              </div>
            </div>

            {/* Total Likes - Warm Card */}
            <div className="group relative overflow-hidden bg-white border-2 border-orange-100 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-orange-300 hover:-translate-y-1 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 via-orange-50/50 to-orange-100/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <div className="relative flex items-start gap-4">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex-shrink-0 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-orange-200 group-hover:scale-110">
                  <ThumbsUp className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-3xl font-bold bg-gradient-to-br from-orange-600 to-orange-700 bg-clip-text text-transparent mb-1">
                    {analytics?.total_likes || 0}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Total Likes</div>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 w-2 h-2 bg-orange-400 rounded-full transition-all duration-300 group-hover:scale-150 group-hover:bg-orange-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
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
                  : "All Resources"}
              </h2>
              <p className="text-gray-600 mt-1">
                {total || 0} items found
                {selectedType !== "all" &&
                  ` • ${selectedType === "webinar" ? "Webinars" : "Content"}`}
                {selectedCategory !== "all" && ` • ${selectedCategory}`}
              </p>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex items-center gap-4 max-w-3/5 w-full">
              <Input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
                size="md"
                containerClassName="flex-1 max-w-xl"
              />

              <Dropdown
                items={sortDropdownItems}
                value={sortBy}
                onChange={(value) => setSortBy(value as SortOption)}
                placeholder="Sort by"
                label="Sort by:"
                searchable={false}
                size="md"
                variant="outline"
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoadingData && (
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
          {!isLoadingData &&
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
          {!isLoadingData &&
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
                      : "No resources available. Check back later for new content."}
                  </p>
                  {(searchQuery ||
                    selectedType !== "all" ||
                    selectedCategory !== "all") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedType("all");
                        setSelectedCategory("all");
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            )}

          {/* Upcoming Webinars - Horizontal */}
          {upcomingWebinarsList.length > 0 && (
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">
                Upcoming Webinars
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingWebinarsList.map((webinar) => (
                  <div
                    key={webinar.id}
                    className="border-l-4 border-blue-500 pl-4"
                  >
                    <h4 className="font-medium text-gray-900 mb-1">
                      {webinar.title}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-3 h-3" />
                      {new Date(webinar.tgl_zoom).toLocaleDateString("id-ID", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination with Showing Info */}
          {!isLoadingData && knowledgeItems && knowledgeItems.length > 0 && (
            <div className="mt-12 flex items-center justify-between">
              {/* Showing X from Y Knowledge - Left */}
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{knowledgeItems.length}</span> from <span className="font-semibold text-gray-900">{total || 0}</span> Knowledge
              </p>

              {/* Pagination - Right */}
              {totalPages > 1 && (
                <Pagination
                  alignment="right"
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  className="max-w-xl"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Popular Knowledge Carousel Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-white font-medium mb-4">
              <TrendingUp className="w-4 h-4" />
              <span>Most Popular</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Trending Knowledge
            </h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Discover the most loved resources by our community
            </p>
          </div>

          {/* Carousel Container */}
          <div className="relative">
            <div
              ref={carouselRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="flex gap-6 overflow-x-hidden py-4 scrollbar-hide"
              style={{ scrollBehavior: "smooth" }}
            >
              {/* Duplicate items for infinite scroll effect */}
              {popularKnowledge && popularKnowledge.length > 0 && (
                <>
                  {[...popularKnowledge, ...popularKnowledge].map((knowledge, index) => (
                    <Link
                      key={`${knowledge.id}-${index}`}
                      href={`/knowledge-center/${knowledge.id}`}
                      className="group flex-shrink-0 w-80 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-48 bg-gradient-to-br from-blue-600 to-purple-600 overflow-hidden">
                        {knowledge.thumbnail ? (
                          <Image
                            src={knowledge.thumbnail}
                            alt={knowledge.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BookOpen className="w-16 h-16 text-white/40" />
                          </div>
                        )}
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                        {/* Popular Badge */}
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 bg-yellow-500 rounded-full text-xs font-bold text-white shadow-lg">
                          <Star className="w-3 h-3 fill-white" />
                          <span>Popular</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
                          {knowledge.title}
                        </h3>
                        <p className="text-sm text-blue-200/80 mb-4 line-clamp-2">
                          {knowledge.description}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-white/60">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            <span>{knowledge.like_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{knowledge.view_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            <span className="capitalize">{knowledge.knowledge_type}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </div>

            {/* Pause indicator */}
            {isPaused && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm font-medium pointer-events-none">
                Paused
              </div>
            )}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <Link
              href="/knowledge-center"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-900 rounded-xl hover:bg-blue-50 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              <span>Explore All Knowledge</span>
              <TrendingUp className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
