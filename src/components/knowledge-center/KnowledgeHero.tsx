/**
 * Knowledge Hero Section Component
 * Focused on UI logic and presentation only
 */

'use client';

import { Search, LayoutGrid, Calendar, BookOpen } from 'lucide-react';
import { Typewriter } from 'react-simple-typewriter';
import { useKnowledgeSubjects } from '@/hooks/useKnowledgeSubject';
import { KnowledgeType } from '@/types/knowledge-center';

interface KnowledgeHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: KnowledgeType | 'all';
  onTypeChange: (type: KnowledgeType | 'all') => void;
}

export default function KnowledgeHero({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
}: KnowledgeHeroProps) {
  const { data: knowledgeSubjects = [] } = useKnowledgeSubjects();

  const typeButtons = [
    {
      value: 'all' as KnowledgeType,
      label: 'All Content',
      icon: LayoutGrid,
      gradient: 'from-blue-600 to-blue-700',
      borderGradient: 'border-blue-300',
    },
    {
      value: 'webinar' as KnowledgeType,
      label: 'Webinars',
      icon: Calendar,
      gradient: 'from-blue-600 to-blue-700',
      borderGradient: 'border-blue-300',
    },
    {
      value: 'content' as KnowledgeType,
      label: 'Content',
      icon: BookOpen,
      gradient: 'from-blue-500 to-blue-600',
      borderGradient: 'border-blue-300',
    },
  ];

  return (
    <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-blue-50/30 border-b border-gray-200/50 overflow-hidden -mt-[74px] pt-20">
      {/* Animated Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large blur circles */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/30 via-blue-200/20 to-transparent rounded-full blur-3xl -mr-48 -mt-48 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-green-200/20 via-blue-200/20 to-transparent rounded-full blur-3xl -ml-32 -mb-32"></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-20"></div>

        {/* Floating decorative elements */}
        <div className="absolute top-24 left-20 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-blue-500/10 rounded-2xl rotate-12 backdrop-blur-sm border border-white/20"></div>
        <div className="absolute top-40 right-32 w-16 h-16 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full backdrop-blur-sm border border-white/20"></div>
        <div className="absolute bottom-32 right-20 w-24 h-24 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-3xl -rotate-6 backdrop-blur-sm border border-white/20"></div>
      </div>

      <div className="relative w-full max-w-7xl mx-auto mb-12 px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Section */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-blue-200/50 rounded-full text-sm text-blue-600 font-medium shadow-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Welcome to Knowledge Hub</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-blue-800 bg-clip-text text-transparent leading-snug">
            Knowledge Center
          </h1>

          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto my-2 leading-relaxed h-8">
            <Typewriter
              words={["Pusat pembelajaran dan berbagi pengetahuan untuk Pusdiklat BPS"]}
              loop={1}
              typeSpeed={50}
              delaySpeed={1000}
              cursor
              cursorStyle="|"
              cursorColor="#3B82F6"
            />
          </p>

          {/* Info Pills - Essential Information */}
          <div className="flex items-center justify-center gap-4 flex-wrap pb-2 my-5">
            {/* Categories Available */}
            <div className="group flex items-center gap-3 px-5 py-3 bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-sm border border-blue-200/70 rounded-xl text-sm font-medium shadow-sm hover:shadow-lg hover:border-blue-300 hover:scale-105 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform duration-300 animate-pulse-slow">
                <LayoutGrid className="w-5 h-5 text-white animate-bounce-gentle" />
              </div>
              <div className="text-left">
                <div className="text-xs text-blue-600 font-semibold mb-0.5">Categories</div>
                <div className="text-sm font-bold text-gray-900">
                  {knowledgeSubjects.length} Topics
                </div>
              </div>
            </div>

            {/* Multiple Formats */}
            <div className="group flex items-center gap-3 px-5 py-3 bg-gradient-to-br from-green-50 to-teal-50 backdrop-blur-sm border border-green-200/70 rounded-xl text-sm font-medium shadow-sm hover:shadow-lg hover:border-green-300 hover:scale-105 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform duration-300 animate-pulse-slow-delay">
                <BookOpen className="w-5 h-5 text-white animate-bounce-gentle-delay" />
              </div>
              <div className="text-left">
                <div className="text-xs text-green-600 font-semibold mb-0.5">Multiple Formats</div>
                <div className="text-sm font-bold text-gray-900">
                  Video, PDF, Audio
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-4xl mx-auto">
          <div className="relative mb-6 group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative flex items-center bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent overflow-hidden">
              <input
                type="text"
                placeholder="Search for webinars, videos, PDFs, audio content..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full px-6 py-4 pr-14 bg-transparent focus:outline-none text-gray-900 placeholder:text-gray-400"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition-colors">
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* Quick Filter Pills - Enhanced */}
          <div className="flex flex-wrap justify-center gap-3">
            {typeButtons.map((button) => {
              const Icon = button.icon;
              const isSelected = selectedType === button.value;

              return (
                <button
                  key={button.value}
                  onClick={() => onTypeChange(button.value)}
                  className={`group px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isSelected
                      ? `bg-gradient-to-r ${button.gradient} text-white shadow-lg shadow-blue-500/30 scale-105`
                      : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200/50 hover:border-blue-300 hover:shadow-md"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {button.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}