/**
 * Knowledge Stats Section Component
 * Focused on UI logic and presentation only
 */

'use client';

import { BookOpen, Users, Eye, ThumbsUp } from 'lucide-react';
import { useKnowledgeStats } from '@/hooks/useKnowledge';

export default function KnowledgeStats() {
  const { stats, isLoading } = useKnowledgeStats();

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const statCards = [
    {
      title: 'Total Resources',
      value: stats?.totalKnowledge || 0,
      icon: BookOpen,
      background: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-white',
      subTextColor: 'text-blue-100',
    },
    {
      title: 'Webinars',
      value: stats?.totalWebinars || 0,
      icon: Users,
      background: 'bg-white border-2 border-green-100',
      textColor: 'bg-gradient-to-br from-green-600 to-green-700 bg-clip-text text-transparent',
      subTextColor: 'text-gray-600',
      hoverEffect: 'hover:border-green-300 hover:-translate-y-1',
    },
    {
      title: 'Total Views',
      value: (stats?.totalViews || 0).toLocaleString(),
      icon: Eye,
      background: 'bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200/50',
      textColor: 'bg-gradient-to-br from-purple-600 to-purple-700 bg-clip-text text-transparent',
      subTextColor: 'text-gray-600',
      hoverEffect: 'hover:border-purple-300 hover:-translate-y-1',
    },
    {
      title: 'Total Likes',
      value: stats?.totalLikes || 0,
      icon: ThumbsUp,
      background: 'bg-white border-2 border-orange-100',
      textColor: 'bg-gradient-to-br from-orange-600 to-orange-700 bg-clip-text text-transparent',
      subTextColor: 'text-gray-600',
      hoverEffect: 'hover:border-orange-300 hover:-translate-y-1',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            const isPrimaryCard = index === 0;

            return (
              <div
                key={card.title}
                className={`group relative overflow-hidden ${card.background} rounded-2xl p-6 transition-all duration-300 hover:shadow-xl ${
                  isPrimaryCard
                    ? 'hover:shadow-2xl hover:scale-105 cursor-pointer'
                    : `${card.hoverEffect} cursor-pointer`
                }`}
              >
                {/* Decorative elements for primary card */}
                {isPrimaryCard && (
                  <>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
                  </>
                )}

                {/* Decorative elements for other cards */}
                {!isPrimaryCard && (
                  <>
                    {card.title === 'Webinars' && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100 to-green-50 rounded-full -mr-12 -mt-12 transition-all duration-500 group-hover:scale-150 group-hover:opacity-50"></div>
                    )}
                    {card.title === 'Total Views' && (
                      <>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full -mr-12 -mt-12 transition-all duration-500 group-hover:scale-150 group-hover:opacity-50"></div>
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-purple-300/30 rounded-full transition-all duration-500 group-hover:scale-125 group-hover:rotate-45"></div>
                      </>
                    )}
                    {card.title === 'Total Likes' && (
                      <>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full -mr-12 -mt-12 transition-all duration-500 group-hover:scale-150 group-hover:opacity-50"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 via-orange-50/50 to-orange-100/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                        <div className="absolute bottom-2 right-2 w-2 h-2 bg-orange-400 rounded-full transition-all duration-300 group-hover:scale-150 group-hover:bg-orange-500"></div>
                      </>
                    )}
                  </>
                )}

                <div className="relative flex items-start gap-4">
                  <div className={`flex items-center justify-center w-14 h-14 ${
                    isPrimaryCard
                      ? 'bg-white/20 backdrop-blur-sm group-hover:rotate-12'
                      : card.title === 'Webinars'
                        ? 'bg-gradient-to-br from-green-400 to-green-500 group-hover:shadow-lg group-hover:shadow-green-200 group-hover:rotate-6'
                        : card.title === 'Total Views'
                          ? 'bg-gradient-to-br from-purple-400 to-purple-800 group-hover:shadow-lg group-hover:shadow-purple-200 group-hover:rotate-6'
                          : card.title === 'Total Likes'
                            ? 'bg-gradient-to-br from-orange-400 to-orange-500 group-hover:shadow-lg group-hover:shadow-orange-200 group-hover:rotate-6'
                            : 'bg-gray-400'
                  } rounded-xl flex-shrink-0 transition-all duration-300`}>
                    <Icon className={`w-7 h-7 ${isPrimaryCard ? 'text-white' : 'text-white'}`} />
                  </div>
                  <div className="flex-1">
                    <div className={`text-3xl font-bold mb-1 ${card.textColor}`}>
                      {card.value}
                    </div>
                    <div className={`text-sm ${card.subTextColor} font-medium`}>
                      {card.title}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}