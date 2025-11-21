/**
 * Log Activity Stats Component
 * 
 * Following the API → Hooks → UI pattern from coding principles
 * - Focused on UI logic and presentation only
 * - Uses custom hooks for data fetching and business logic
 * - Clean separation of concerns for better maintainability
 */

'use client';

import React from 'react';
import { Activity, Users, TrendingUp, BarChart3, Calendar } from 'lucide-react';
import { useLogActivityStats } from '@/hooks/useLogActivity';

// ============================================================================
// Helper Functions
// ============================================================================

const formatNumber = (raw?: number | null): string => {
  const num = typeof raw === 'number' && !Number.isNaN(raw) ? raw : 0;

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// ============================================================================
// Skeleton Components
// ============================================================================

const StatCardSkeleton = ({ bgColor }: { bgColor: string }) => (
  <div className={`relative overflow-hidden ${bgColor} rounded-xl p-6 border border-gray-100 animate-pulse`}>
    {/* Content structure */}
    <div className="relative flex flex-col items-center text-center space-y-4">
      {/* Icon skeleton */}
      <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
        <div className="w-6 h-6 bg-gray-300 rounded"></div>
      </div>
      
      {/* Text content skeleton */}
      <div className="space-y-2">
        {/* Number skeleton */}
        <div className="h-6 bg-gray-200 rounded w-16 mx-auto"></div>
        {/* Title skeleton */}
        <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
      </div>
    </div>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

export default function LogActivityStats() {
  const { data: stats, isLoading, error, refetch } = useLogActivityStats();

  if (isLoading) {
    const skeletonCards = [
      { bgColor: 'bg-blue-50' },
      { bgColor: 'bg-green-50' },
      { bgColor: 'bg-purple-50' },
      { bgColor: 'bg-orange-50' },
      { bgColor: 'bg-cyan-50' },
      { bgColor: 'bg-pink-50' },
    ];

    return (
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {skeletonCards.map((card, index) => (
            <StatCardSkeleton key={index} bgColor={card.bgColor} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="text-red-600 mb-4">
          <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <h3 className="text-lg font-semibold">Failed to load statistics</h3>
          <p className="text-sm text-gray-600 mt-1">{error.message}</p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Logs',
      value: formatNumber(stats.totalLogs ?? 0),
      icon: BarChart3,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Today',
      value: formatNumber(stats.dailyActivityCount ?? 0),
      icon: Calendar,
      color: 'cyan',
      bgColor: 'bg-cyan-50',
      iconBg: 'bg-cyan-500',
      textColor: 'text-cyan-600',
    },
    {
      title: 'This Week',
      value: formatNumber(stats.weeklyActivityCount ?? 0),
      icon: Activity,
      color: 'pink',
      bgColor: 'bg-pink-50',
      iconBg: 'bg-pink-500',
      textColor: 'text-pink-600',
    },
    {
      title: 'Active Users',
      value: formatNumber(stats.totalUsers ?? 0),
      icon: Users,
      color: 'green',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      title: 'Most Active',
      value: stats.mostActiveLogType || 'N/A',
      icon: TrendingUp,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-500',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Activity Overview</h2>
            <p className="text-sm text-gray-500 mt-1">Real-time system activity metrics</p>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          
          return (
            <div
              key={card.title}
              className={`group relative overflow-hidden ${card.bgColor} rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100`}
            >
              {/* Simple hover effect */}
              <div className="absolute inset-0 bg-white/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

              <div className="relative flex flex-col items-center text-center space-y-4">
                {/* Icon */}
                <div className={`flex items-center justify-center w-12 h-12 ${card.iconBg} rounded-xl shadow-sm transition-all duration-300 group-hover:scale-110`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                {/* Content */}
                <div className="space-y-1">
                  <div className={`text-2xl font-bold ${card.textColor}`}>
                    {card.value}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {card.title}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
