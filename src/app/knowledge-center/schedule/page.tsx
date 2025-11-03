'use client';

import { useState, useMemo } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { id } from 'date-fns/locale/id';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Link,
  Edit,
  Plus,
  Filter,
  Search,
  Video,
  FileText,
  ExternalLink,
  Award,
  List,
} from 'lucide-react';
import { useWebinarSchedule, useWebinarScheduleManagement, useKnowledge } from '@/hooks/useKnowledgeCenter';
import { WebinarSchedule } from '@/types/knowledge-center';

export default function WebinarSchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { schedule: webinarSchedule, isLoading } = useWebinarSchedule();
  const { updateSchedule } = useWebinarScheduleManagement();
  const { data: knowledgeItems } = useKnowledge({ knowledge_type: ['webinar'] });

  // Parse and enhance schedule data
  const enhancedSchedule = useMemo(() => {
    if (!webinarSchedule) return [];

    return webinarSchedule.map(item => {
      const knowledge = knowledgeItems?.find(k => k.id === item.webinar_id);
      return {
        ...item,
        knowledge,
        parsedDate: parseISO(item.tgl_zoom),
      };
    });
  }, [webinarSchedule, knowledgeItems]);

  // Filter schedule based on search
  const filteredSchedule = useMemo(() => {
    if (!searchQuery) return enhancedSchedule;

    return enhancedSchedule.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.knowledge?.description && item.knowledge.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [enhancedSchedule, searchQuery]);

  // Calendar calculations
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get webinars for a specific date
  const getWebinarsForDate = (date: Date) => {
    return filteredSchedule.filter(item =>
      isSameDay(item.parsedDate, date)
    );
  };

  // Get webinars for selected date
  const selectedDateWebinars = selectedDate
    ? getWebinarsForDate(selectedDate)
    : [];

  // Navigation functions
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleStatusUpdate = async (id: string, status: WebinarSchedule['status']) => {
    try {
      await updateSchedule({ id, data: { status } });
    } catch (error) {
      console.error('Failed to update schedule:', error);
    }
  };

  const getStatusColor = (status: WebinarSchedule['status']) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'ongoing': return 'bg-green-100 text-green-700';
      case 'ended': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: WebinarSchedule['status']) => {
    switch (status) {
      case 'upcoming': return <Clock className="w-4 h-4" />;
      case 'ongoing': return <Video className="w-4 h-4" />;
      case 'ended': return <FileText className="w-4 h-4" />;
      default: return null;
    }
  };

  const isWebinarLive = (webinar: WebinarSchedule) => {
    const now = new Date();
    const startTime = parseISO(webinar.tgl_zoom);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // Assume 2 hours duration
    return now >= startTime && now <= endTime;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Webinar Schedule</h1>
              <p className="text-gray-600">
                Manage and track upcoming webinar schedules
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                Filters
              </button>

              <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                <Plus className="w-4 h-4" />
                Schedule Webinar
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredSchedule.filter(w => w.status === 'upcoming').length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-gray-600" />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Live Now</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredSchedule.filter(w => isWebinarLive(w)).length}
                  </p>
                </div>
                <Video className="w-8 h-8 text-gray-600" />
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">This Month</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {filteredSchedule.filter(w => isSameMonth(w.parsedDate, currentMonth)).length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold text-purple-900">{filteredSchedule.length}</p>
                </div>
                <Award className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="w-full lg:w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search webinars..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`p-2 ${viewMode === 'calendar' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Calendar className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Month Navigation (only for calendar view) */}
              {viewMode === 'calendar' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={previousMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="font-semibold text-gray-900 min-w-[150px] text-center">
                    {format(currentMonth, 'MMMM yyyy', { locale: id })}
                  </h3>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar/List View */}
          <div className="lg:col-span-2">
            {viewMode === 'calendar' ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                    <div key={`empty-${index}`} className="aspect-square" />
                  ))}

                  {/* Month days */}
                  {monthDays.map(day => {
                    const dayWebinars = getWebinarsForDate(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isTodayDate = isToday(day);

                    return (
                      <div
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={`aspect-square border rounded-lg p-1 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-100 border-blue-300'
                            : isTodayDate
                            ? 'bg-yellow-50 border-yellow-300'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-xs font-medium mb-1">
                          {format(day, 'd')}
                        </div>
                        {dayWebinars.length > 0 && (
                          <div className="space-y-1">
                            {dayWebinars.slice(0, 2).map((webinar, index) => (
                              <div
                                key={webinar.id}
                                className={`text-xs p-1 rounded truncate ${
                                  webinar.status === 'live'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                                title={webinar.title}
                              >
                                {format(webinar.parsedDate, 'HH:mm')} - {webinar.title}
                              </div>
                            ))}
                            {dayWebinars.length > 2 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{dayWebinars.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Webinar
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Participants
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSchedule.map((webinar) => (
                        <tr key={webinar.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {format(webinar.parsedDate, 'EEEE, d MMMM yyyy', { locale: id })}
                              </div>
                              <div className="text-sm text-gray-500">
                                {format(webinar.parsedDate, 'HH:mm')}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {webinar.title}
                              </div>
                              {(webinar.knowledge as any)?.subject && (
                                <div className="text-sm text-gray-500">
                                  {(webinar.knowledge as any).subject}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(webinar.status)}`}>
                              {getStatusIcon(webinar.status)}
                              {webinar.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {webinar.participants_count || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {(webinar.knowledge as any)?.link_zoom && (
                                <a
                                  href={(webinar.knowledge as any).link_zoom}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-blue-600 hover:text-blue-700"
                                  title="Join Zoom"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                className="p-1 text-gray-600 hover:text-gray-900"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Webinars */}
            {selectedDate && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: id })}
                </h3>
                <div className="space-y-3">
                  {selectedDateWebinars.length > 0 ? (
                    selectedDateWebinars.map((webinar) => (
                      <div
                        key={webinar.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{webinar.title}</h4>
                            <p className="text-sm text-gray-500">
                              {format(webinar.parsedDate, 'HH:mm')}
                            </p>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(webinar.status)}`}>
                            {getStatusIcon(webinar.status)}
                            {webinar.status}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {(webinar.knowledge as any)?.link_zoom && (
                            <a
                              href={(webinar.knowledge as any).link_zoom}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                              <Link className="w-4 h-4" />
                              Join Zoom
                            </a>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {webinar.participants_count || 0} participants
                            </span>
                            <button
                              className="text-blue-600 hover:text-blue-700"
                              title="Quick Edit"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No webinars scheduled for this date
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Upcoming Webinars */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Upcoming Webinars</h3>
              <div className="space-y-3">
                {filteredSchedule
                  .filter(w => w.status === 'upcoming')
                  .slice(0, 5)
                  .map((webinar) => (
                    <div
                      key={webinar.id}
                      className="border-l-4 border-blue-500 pl-4 py-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                            {webinar.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {format(webinar.parsedDate, 'd MMM, HH:mm', { locale: id })}
                          </p>
                        </div>
                        {isWebinarLive(webinar) && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            LIVE
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                {filteredSchedule.filter(w => w.status === 'upcoming').length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No upcoming webinars
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  Export Schedule
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  Import Calendar
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  Send Reminders
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}