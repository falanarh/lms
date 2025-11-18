/**
 * Knowledge Management Stats Component
 * 
 * Analytics and statistics view for knowledge center management
 * Following the API → Hooks → UI pattern from coding principles
 */

"use client";

import React from "react";
import {
  BarChart3,
  TrendingUp,
  Eye,
  ThumbsUp,
  Calendar,
  FileText,
  Video,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useKnowledge } from "@/hooks/useKnowledgeCenter";
import { useKnowledgeOverviewStats, useKnowledgeStats, useKnowledgeLastActivities } from "@/hooks/useKnowledgeStats";

// Stats card component
const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = 'blue',
  isLoading = false 
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  isLoading?: boolean;
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
        <div className="mt-4">
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && trendValue && (
        <div className="mt-4 flex items-center">
          <TrendingUp className={`w-4 h-4 mr-1 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trendValue}
          </span>
        </div>
      )}
    </div>
  );
};

function getTimeAgoLabel(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) {
    return `${seconds} detik yang lalu`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} menit yang lalu`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} jam yang lalu`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} hari yang lalu`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return `${weeks} minggu yang lalu`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} bulan yang lalu`;
  }

  const years = Math.floor(days / 365);
  return `${years} tahun yang lalu`;
}

export default function KnowledgeManagementStats() {
  // Fetch overview stats for high-level metrics
  const {
    stats: overviewStats,
    isLoading: overviewLoading,
  } = useKnowledgeOverviewStats();

  // Fetch aggregate stats (total views, total likes, etc.) from stats API
  const {
    stats: aggregateStats,
    isLoading: statsApiLoading,
  } = useKnowledgeStats();

  // Fetch all knowledge centers for engagement and recent activity
  const {
    data: allKnowledge = [],
    isLoading: knowledgeLoading,
  } = useKnowledge({ limit: 1000 });

  // Overview stats from overview API
  const totalKnowledge = overviewStats.totalPosts;
  const totalWebinars = overviewStats.totalWebinars;
  const publishedCount = overviewStats.totalPublished;
  const scheduledCount = overviewStats.totalScheduled;
  const draftCount = overviewStats.totalDrafts;

  // Fallback engagement stats
  const computedTotalViews = allKnowledge.reduce(
    (sum, item) => sum + (item.viewCount || 0),
    0,
  );
  const computedTotalLikes = allKnowledge.reduce(
    (sum, item) => sum + (item.likeCount || 0),
    0,
  );

  // Engagement stats prefer API, but fall back to local computation when API returns 0
  const totalViews = aggregateStats.totalViews || computedTotalViews;
  const totalLikes = aggregateStats.totalLikes || computedTotalLikes;

  // Content type breakdown from overview API
  const videoContent = overviewStats.totalVideos;
  const pdfContent = overviewStats.totalPdfs;
  const podcastContent = overviewStats.totalPodcasts;
  const articleContent = overviewStats.totalArticles;

  const statsLoading = overviewLoading || statsApiLoading || knowledgeLoading;

  // Fetch recent activities for Recent Activity section
  const {
    activities: recentActivities,
    isLoading: activitiesLoading,
  } = useKnowledgeLastActivities();

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
          <StatsCard
            title="Total Knowledge Centers"
            value={totalKnowledge}
            icon={BarChart3}
            color="blue"
            isLoading={statsLoading}
          />
          <StatsCard
            title="Published"
            value={publishedCount}
            icon={FileText}
            color="green"
            isLoading={statsLoading}
          />
          <StatsCard
            title="Scheduled"
            value={scheduledCount}
            icon={Calendar}
            color="purple"
            isLoading={statsLoading}
          />
          <StatsCard
            title="Draft"
            value={draftCount}
            icon={FileText}
            color="orange"
            isLoading={statsLoading}
          />
        </div>
      </div>

      {/* Content Type Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
          <StatsCard
            title="Webinars"
            value={totalWebinars}
            icon={Calendar}
            color="purple"
            isLoading={statsLoading}
          />
          <StatsCard
            title="Videos"
            value={videoContent}
            icon={Video}
            color="red"
            isLoading={statsLoading}
          />
          <StatsCard
            title="PDF Documents"
            value={pdfContent}
            icon={FileText}
            color="blue"
            isLoading={statsLoading}
          />
          <StatsCard
            title="Podcasts"
            value={podcastContent}
            icon={FileText}
            color="green"
            isLoading={statsLoading}
          />
          <StatsCard
            title="Articles"
            value={articleContent}
            icon={FileText}
            color="orange"
            isLoading={statsLoading}
          />
        </div>
      </div>

      {/* Engagement Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Likes"
            value={totalLikes}
            icon={ThumbsUp}
            color="green"
            isLoading={statsLoading}
          />
          <StatsCard
            title="Total Views"
            value={totalViews}
            icon={Eye}
            color="blue"
            isLoading={statsLoading}
          />
          <StatsCard
            title="Engagement Rate"
            value={totalViews > 0 ? `${((totalLikes / totalViews) * 100).toFixed(1)}%` : '0%'}
            icon={TrendingUp}
            color="purple"
            isLoading={statsLoading}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {activitiesLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentActivities.map((item, index) => (
                <div key={`${item.title}-${index}`} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                        item.activity === 'CREATED'
                          ? 'bg-emerald-100 text-emerald-600'
                          : item.activity === 'UPDATED'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate mb-1">{item.title}</p>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                            item.activity === 'CREATED'
                              ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                              : item.activity === 'UPDATED'
                              ? 'border-blue-200 text-blue-700 bg-blue-50'
                              : item.activity === 'DELETED'
                              ? 'border-red-200 text-red-700 bg-red-50'
                              : 'border-gray-200 text-gray-700 bg-gray-50'
                          }`}>
                            {item.activity === 'CREATED' ? 'Created' : item.activity === 'UPDATED' ? 'Updated' : item.activity === 'DELETED' ? 'Deleted' : item.activity}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border-2 ${
                            item.isFinal 
                              ? 'border-green-500 text-green-600 bg-white' 
                              : 'border-amber-400 text-amber-600 bg-white'
                          }`}>
                            {item.isFinal ? 'Published' : 'Draft'}
                          </span>
                          <div className="flex items-center space-x-3 text-xs text-gray-400">
                            <span className="flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              {item.viewCount}
                            </span>
                            <span className="flex items-center">
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              {item.likeCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <span className="text-xs text-gray-400">
                        {getTimeAgoLabel(item.updatedAt || item.publishedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {recentActivities.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No recent activities</p>
                  <p className="text-sm text-gray-400 mt-1">Activities will appear here when content is created or updated</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
