'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  ChevronUp,
  ChevronDown,
  SearchX,
  BookOpen,
  Database,
  BarChart3,
  Globe,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Target,
  Cpu,
  Building2,
  MapPin,
  Users2,
  LayoutGrid
} from 'lucide-react';
import { Input } from '@/components/ui/Input/Input';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange
}: CategoryFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [canCollapse, setCanCollapse] = useState(true);
  const selectedButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get icon for category based on name
  const getCategoryIcon = (category: string) => {
    if (category === 'all') return LayoutGrid;

    const name = category.toLowerCase();
    if (name.includes('statistik') || name.includes('data') || name.includes('database')) return Database;
    if (name.includes('ekonomi') || name.includes('business') || name.includes('finance')) return BarChart3;
    if (name.includes('global') || name.includes('internasional') || name.includes('dunia')) return Globe;
    if (name.includes('kerja') || name.includes('pekerjaan') || name.includes('karir')) return Briefcase;
    if (name.includes('pelatihan') || name.includes('education') || name.includes('belajar')) return GraduationCap;
    if (name.includes('inovasi') || name.includes('teknologi') || name.includes('riset')) return Lightbulb;
    if (name.includes('target') || name.includes('goal') || name.includes('sasaran')) return Target;
    if (name.includes('sistem') || name.includes('komputer') || name.includes('it')) return Cpu;
    if (name.includes('organisasi') || name.includes('instansi') || name.includes('lembaga')) return Building2;
    if (name.includes('wilayah') || name.includes('daerah') || name.includes('regional')) return MapPin;
    if (name.includes('sosial') || name.includes('masyarakat') || name.includes('people')) return Users2;
    return BookOpen; // Default icon
  };

  // Prepare categories with "All Categories" option
  const allCategories = useMemo(() => {
    return [
      { value: 'all', label: 'All Categories', icon: LayoutGrid },
      ...categories.map(cat => ({
        value: cat,
        label: cat,
        icon: getCategoryIcon(cat)
      }))
    ];
  }, [categories]);

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    return allCategories.filter(category =>
      category.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCategories, searchTerm]);

  // Check if selected button would be visible in collapsed state
  useEffect(() => {
    const checkVisibility = () => {
      if (!selectedButtonRef.current || !containerRef.current) {
        setCanCollapse(true);
        return;
      }

      const buttonRect = selectedButtonRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      // Calculate button's position relative to container top
      const buttonOffsetTop = buttonRect.top - containerRect.top;

      // Max height when collapsed is 96px (max-h-24)
      const collapsedHeight = 96;

      // Check if button bottom would be visible in collapsed state
      const buttonBottom = buttonOffsetTop + buttonRect.height;
      const isVisible = buttonBottom <= collapsedHeight;

      setCanCollapse(isVisible);
    };

    // Run check after render
    setTimeout(checkVisibility, 0);

    // Recheck on window resize
    window.addEventListener('resize', checkVisibility);
    return () => window.removeEventListener('resize', checkVisibility);
  }, [selectedCategory, filteredCategories]);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Auto expand when searching
    if (e.target.value) {
      setIsExpanded(true);
    }
  };

  const onToggleExpand = () => {
    // Only allow collapse if selected category is visible when collapsed
    if (isExpanded && !canCollapse) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  const handleCategoryChange = (category: string) => {
    onCategoryChange(category);
  };

  const baseButtonClasses = "flex items-center gap-2 py-2 px-5 rounded-lg text-sm font-medium transition-all duration-200 border-2";

  return (
    <div className="group relative overflow-hidden bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 p-8 rounded-3xl border border-gray-200/60 shadow-sm hover:shadow-xl transition-all duration-500">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/20 to-blue-200/20 rounded-full blur-3xl -mr-32 -mt-32 transition-all duration-700 group-hover:scale-150 group-hover:opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-100/20 to-blue-100/20 rounded-full blur-3xl -ml-24 -mb-24 transition-all duration-700 group-hover:scale-125"></div>

      {/* Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 opacity-60"></div>

      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
            <h3 className="text-base font-bold text-gray-800 tracking-tight">
              Browse by Category
            </h3>
          </div>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => onCategoryChange('all')}
              className="group/clear flex items-center gap-1.5 px-4 py-2 text-sm text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 font-medium transition-all duration-300 rounded-lg border border-blue-200 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-200"
            >
              <span>Clear filter</span>
              <span className="text-lg leading-none transform transition-transform duration-300 group-hover/clear:rotate-90">×</span>
            </button>
          )}
        </div>

        {/* Input Pencarian */}
        <div className="mb-7">
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={onSearchChange}
            leftIcon={<Search className="w-5 h-5" />}
            size="md"
          />
        </div>

        {/* Wrapper untuk Expand/Collapse */}
        <div
          ref={containerRef}
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded || !canCollapse ? 'max-h-[30rem] overflow-y-auto' : 'max-h-24'
          }`}
        >
          <div className="flex flex-wrap gap-3 justify-center py-1">
            {filteredCategories.map((category) => {
              const isActive = selectedCategory === category.value;
              const activeClasses = "border-blue-300 ring-2 ring-blue-600 text-blue-600 bg-blue-50";
              const inactiveClasses = "text-gray-600 border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white";

              // Mendapatkan komponen Ikon dari data
              const IconComponent = category.icon;

              return (
                <button
                  key={category.value}
                  ref={isActive ? selectedButtonRef : null}
                  onClick={() => handleCategoryChange(category.value)}
                  className={`${baseButtonClasses} ${isActive ? activeClasses : inactiveClasses}`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tombol Tampilkan Semua / Lebih Sedikit */}
        {filteredCategories.length > 0 && (
          <div className="mt-6 pt-5 border-t border-gray-200/50 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-0.5 bg-gradient-to-r from-blue-400 to-blue-500"></div>
            <button
              onClick={onToggleExpand}
              className={`group/toggle flex items-center justify-center gap-2 w-full py-2.5 px-4 text-sm font-semibold transition-all duration-300 rounded-xl ${
                isExpanded && !canCollapse
                  ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                  : 'text-blue-600 hover:text-blue-700 bg-gradient-to-r from-blue-50/50 to-blue-50/70 hover:from-blue-100 hover:to-blue-100 border border-blue-200/50 hover:border-blue-300 hover:shadow-md'
              }`}
              disabled={isExpanded && !canCollapse}
            >
              {isExpanded ? (
                <>
                  <span>Show Less</span>
                  <ChevronUp className="w-4 h-4 transition-transform duration-300 group-hover/toggle:-translate-y-1" />
                </>
              ) : (
                <>
                  <span>Show All Categories ({allCategories.length})</span>
                  <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover/toggle:translate-y-1" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Pesan "Tidak Ditemukan" */}
        {filteredCategories.length === 0 && (
          <div className="text-center text-gray-500 py-12 px-4">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full blur-xl opacity-40"></div>
              <SearchX className="relative w-14 h-14 mx-auto text-gray-400" />
            </div>
            <p className="font-semibold text-gray-700 mb-1">No Categories Found</p>
            <p className="text-sm text-gray-500">Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
