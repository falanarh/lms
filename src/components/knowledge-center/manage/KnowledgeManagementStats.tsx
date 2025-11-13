/**
 * Knowledge Management Stats Component
 * 
 * Analytics and statistics view for knowledge center management
 * Following the API → Hooks → UI pattern from coding principles
 */

'use client';

import React from 'react';
import { BarChart3, TrendingUp, Eye, ThumbsUp, Calendar, FileText, Video } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useKnowledge } from '@/hooks/useKnowledgeCenter';
import { KNOWLEDGE_TYPES, CONTENT_TYPES } from '@/types/knowledge-center';

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
          <span className="text-sm text-gray-500 ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default function KnowledgeManagementStats() {
  // Fetch all knowledge centers for stats calculation
  const { data: allKnowledge = [], isLoading } = useKnowledge({ limit: 1000 });
  const { data: webinars = [], isLoading: webinarsLoading } = useKnowledge({ 
    knowledgeType: KNOWLEDGE_TYPES.WEBINAR,
    limit: 1000 
  });
  const { data: content = [], isLoading: contentLoading } = useKnowledge({ 
    knowledgeType: KNOWLEDGE_TYPES.CONTENT,
    limit: 1000 
  });

  // Calculate stats
  const totalKnowledge = allKnowledge.length;
  const totalWebinars = webinars.length;
  const totalContent = content.length;
  const publishedCount = allKnowledge.filter(item => item.isFinal).length;
  const draftCount = allKnowledge.filter(item => !item.isFinal).length;
  
  const totalViews = allKnowledge.reduce((sum, item) => sum + (item.viewCount || 0), 0);
  const totalLikes = allKnowledge.reduce((sum, item) => sum + (item.likeCount || 0), 0);

  // Content type breakdown
  const videoContent = allKnowledge.filter(item => 
    item.knowledgeContent?.contentType === CONTENT_TYPES.VIDEO
  ).length;
  const pdfContent = allKnowledge.filter(item => 
    item.knowledgeContent?.contentType === CONTENT_TYPES.FILE
  ).length;
  const podcastContent = allKnowledge.filter(item => 
    item.knowledgeContent?.contentType === CONTENT_TYPES.PODCAST
  ).length;
  const articleContent = allKnowledge.filter(item => 
    item.knowledgeContent?.contentType === CONTENT_TYPES.ARTICLE
  ).length;

  const statsLoading = isLoading || webinarsLoading || contentLoading;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Knowledge Centers"
            value={totalKnowledge}
            icon={BarChart3}
            trend="up"
            trendValue="+12%"
            color="blue"
            isLoading={statsLoading}
          />
          <StatsCard
            title="Published"
            value={publishedCount}
            icon={FileText}
            trend="up"
            trendValue="+8%"
            color="green"
            isLoading={statsLoading}
          />
          <StatsCard
            title="Draft"
            value={draftCount}
            icon={FileText}
            color="orange"
            isLoading={statsLoading}
          />
          <StatsCard
            title="Total Views"
            value={totalViews.toLocaleString()}
            icon={Eye}
            trend="up"
            trendValue="+24%"
            color="purple"
            isLoading={statsLoading}
          />
        </div>
      </div>

      {/* Content Type Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
            value={totalLikes.toLocaleString()}
            icon={ThumbsUp}
            trend="up"
            trendValue="+18%"
            color="green"
            isLoading={statsLoading}
          />
          <StatsCard
            title="Avg. Views per Content"
            value={totalKnowledge > 0 ? Math.round(totalViews / totalKnowledge) : 0}
            icon={Eye}
            trend="up"
            trendValue="+5%"
            color="blue"
            isLoading={statsLoading}
          />
          <StatsCard
            title="Engagement Rate"
            value={totalViews > 0 ? `${((totalLikes / totalViews) * 100).toFixed(1)}%` : '0%'}
            icon={TrendingUp}
            trend="up"
            trendValue="+2.3%"
            color="purple"
            isLoading={statsLoading}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {statsLoading ? (
            <div className="space-y-4">
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
            <div className="space-y-4">
              {allKnowledge.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      item.type === KNOWLEDGE_TYPES.WEBINAR 
                        ? 'bg-purple-100 text-purple-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {item.type === KNOWLEDGE_TYPES.WEBINAR ? (
                        <Calendar className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{item.title}</p>
                      <p className="text-sm text-gray-500">
                        {item.isFinal ? 'Published' : 'Draft'} • {item.viewCount} views • {item.likeCount} likes
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              
              {allKnowledge.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No knowledge centers found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
