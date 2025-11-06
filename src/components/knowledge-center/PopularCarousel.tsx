/**
 * Popular Knowledge Carousel Component
 * Focused on UI logic and presentation only
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { TrendingUp } from 'lucide-react';
import { KnowledgeCard } from '@/components/knowledge-center';
import { usePopularKnowledge } from '@/hooks/useKnowledge';

export default function PopularCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const { data: popularKnowledge, isLoading } = usePopularKnowledge(10);

  // Auto-scroll effect
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || isPaused || !popularKnowledge) return;

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
  }, [isPaused, popularKnowledge]);

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50/50 via-blue-50/30 to-green-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded w-96 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-80 h-64 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!popularKnowledge || popularKnowledge.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50/50 via-blue-50/30 to-green-50/20 relative overflow-hidden border-b border-gray-200/50">
      {/* Smooth top fade transition */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-t from-transparent to-blue-50/40 pointer-events-none"></div>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-200/20 via-blue-200/20 to-transparent rounded-full blur-3xl -ml-32 -mt-32"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-green-200/20 via-blue-200/20 to-transparent rounded-full blur-3xl -mr-48 -mb-48"></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>

        {/* Floating decorative shapes */}
        <div className="absolute top-32 right-32 w-16 h-16 bg-gradient-to-br from-blue-300/20 to-blue-400/20 rounded-2xl rotate-45 backdrop-blur-sm"></div>
        <div className="absolute bottom-40 left-40 w-20 h-20 bg-gradient-to-br from-green-300/20 to-blue-300/20 rounded-full backdrop-blur-sm"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-full text-sm text-blue-600 font-semibold mb-4 shadow-sm">
            <TrendingUp className="w-4 h-4" />
            <span>Most Popular</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-900 to-blue-800 bg-clip-text text-transparent leading-snug">
            Trending Knowledge
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the most loved resources by our community
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <div
            ref={carouselRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex gap-6 overflow-x-hidden pt-4 pb-16 scrollbar-hide"
            style={{ scrollBehavior: 'smooth' }}
          >
            {/* Duplicate items for infinite scroll effect */}
            {[...popularKnowledge, ...popularKnowledge].map((knowledge, index) => (
              <div
                key={`${knowledge.id}-${index}`}
                className="flex-shrink-0 w-80 group/carousel"
              >
                {/* KnowledgeCard with custom styling for carousel */}
                <div className="relative h-full transition-all duration-300 group-hover/carousel:scale-105 group-hover/carousel:shadow-2xl group-hover/carousel:shadow-blue-500/20">
                  <KnowledgeCard knowledge={knowledge} />
                </div>
              </div>
            ))}
          </div>

          {/* Pause indicator */}
          {isPaused && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 text-sm font-semibold border border-gray-200 shadow-lg pointer-events-none">
              Paused
            </div>
          )}
        </div>

        {/* View All Button */}
        {/* <div className="text-center mt-12">
          <Link
            href="/knowledge-center"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
          >
            <span>Explore All Knowledge</span>
            <TrendingUp className="w-5 h-5" />
          </Link>
        </div> */}
      </div>
    </section>
  );
}