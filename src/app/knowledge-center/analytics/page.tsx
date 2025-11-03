'use client';

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  ThumbsUp,
  Users,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Filter,
  RefreshCw,
  BookOpen,
  Video,
  FileText,
  Headphones,
} from 'lucide-react';
import { useKnowledgeAnalytics, useKnowledge } from '@/hooks/useKnowledgeCenter';
import { Knowledge, KnowledgeType } from '@/types/knowledge-center';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'likes' | 'engagement'>('views');

  const { analytics, isLoading, refetch } = useKnowledgeAnalytics();
  const { data: knowledgeItems } = useKnowledge({ limit: 100 });

  // Generate sample data for charts (in real app, this would come from API)
  const generateTimeSeriesData = () => {
    const data = [];
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
        views: Math.floor(Math.random() * 1000) + 200,
        likes: Math.floor(Math.random() * 100) + 20,
        engagement: Math.floor(Math.random() * 50) + 10,
      });
    }
    return data;
  };

  const timeSeriesData = useMemo(() => generateTimeSeriesData(), [timeRange]);

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
  ];

  const metrics = [
    { value: 'views', label: 'Views', icon: Eye, color: 'blue' },
    { value: 'likes', label: 'Likes', icon: ThumbsUp, color: 'green' },
    { value: 'engagement', label: 'Engagement', icon: Users, color: 'purple' },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const getMetricData = () => {
    switch (selectedMetric) {
      case 'views':
        return timeSeriesData.map(d => ({ date: d.date, value: d.views }));
      case 'likes':
        return timeSeriesData.map(d => ({ date: d.date, value: d.likes }));
      case 'engagement':
        return timeSeriesData.map(d => ({ date: d.date, value: d.engagement }));
      default:
        return [];
    }
  };

  const getKnowledgeTypeStats = () => {
    if (!knowledgeItems) return [];

    const stats = knowledgeItems.reduce((acc, item) => {
      const type = item.knowledge_type;
      if (!acc[type]) {
        acc[type] = { name: type, count: 0, views: 0, likes: 0 };
      }
      acc[type].count += 1;
      acc[type].views += item.view_count;
      acc[type].likes += item.like_count;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(stats).map(stat => ({
      name: stat.name === 'webinar' ? 'Webinar' : 'Konten',
      value: stat.count,
      views: stat.views,
      likes: stat.likes,
    }));
  };

  const getTopSubjects = () => {
    if (!analytics?.top_subjects) return [];

    return analytics.top_subjects.map(subject => ({
      name: subject.subject,
      count: subject.count,
    }));
  };

  const getPopularKnowledge = () => {
    if (!knowledgeItems) return [];

    return knowledgeItems
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, 10)
      .map(item => ({
        id: item.id,
        title: item.title,
        type: item.knowledge_type,
        views: item.view_count,
        likes: item.like_count,
        engagementRate: ((item.like_count + item.dislike_count) / Math.max(item.view_count, 1)) * 100,
      }));
  };

  const getTypeIcon = (type: KnowledgeType) => {
    switch (type) {
      case 'webinar': return <Calendar className="w-4 h-4" />;
      case 'konten':
        const mediaType = (knowledgeItems?.find(k => k.knowledge_type === 'konten') as any)?.media_type;
        switch (mediaType) {
          case 'video': return <Video className="w-4 h-4" />;
          case 'pdf': return <FileText className="w-4 h-4" />;
          case 'audio': return <Headphones className="w-4 h-4" />;
          default: return <BookOpen className="w-4 h-4" />;
        }
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const exportData = () => {
    // Implement export functionality
    const data = {
      timeRange,
      analytics,
      popularKnowledge: getPopularKnowledge(),
      subjectStats: getTopSubjects(),
      typeStats: getKnowledgeTypeStats(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-center-analytics-${timeRange}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 bg-gray-200 rounded-lg"></div>
              <div className="h-80 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
              <p className="text-gray-600">
                Track performance and engagement metrics for your knowledge center
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => refetch()}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <BookOpen className="w-6 h-6 text-gray-700" />
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>12%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{analytics.total_knowledge}</h3>
              <p className="text-gray-600 text-sm">Total Knowledge</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <Calendar className="w-6 h-6 text-gray-700" />
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>8%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{analytics.total_webinars}</h3>
              <p className="text-gray-600 text-sm">Total Webinars</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <Eye className="w-6 h-6 text-gray-700" />
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>23%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {analytics.total_views.toLocaleString()}
              </h3>
              <p className="text-gray-600 text-sm">Total Views</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <ThumbsUp className="w-6 h-6 text-gray-700" />
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  <span>5%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{analytics.total_likes}</h3>
              <p className="text-gray-600 text-sm">Total Likes</p>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Time Series Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
              <div className="flex items-center gap-2">
                {metrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <button
                      key={metric.value}
                      onClick={() => setSelectedMetric(metric.value as any)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                        selectedMetric === metric.value
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {metric.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={selectedMetric === 'views' ? '#3B82F6' : selectedMetric === 'likes' ? '#10B981' : '#8B5CF6'}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Knowledge Type Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Content Distribution</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getKnowledgeTypeStats()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getKnowledgeTypeStats().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Subjects Bar Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Subjects</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getTopSubjects()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Knowledge Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Popular Knowledge</h3>
              <PieChartIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                    Knowledge
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                    Views
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                    Likes
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                    Engagement Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getPopularKnowledge().map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 line-clamp-1 max-w-xs">
                        {item.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <span className="text-sm text-gray-900 capitalize">
                          {item.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{item.views.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{item.likes}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(item.engagementRate, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900 min-w-[3rem]">
                          {item.engagementRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {getPopularKnowledge().length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
              <p className="text-gray-600">
                Start creating knowledge content to see analytics data here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}