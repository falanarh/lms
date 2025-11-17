/**
 * Log Activity Detail Page
 * 
 * Displays comprehensive details for a specific log entry
 * Different layouts and information based on log type
 */

'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, User, Globe, Monitor, BookOpen, Target, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Breadcrumb } from '@/components/ui/Breadcrumb/Breadcrumb';
import { useLogActivityById } from '@/hooks/useLogActivity';
import { LOG_TYPE_LABELS, LOG_TYPE_COLORS, CATEGORY_LABELS, LogActivity } from '@/types/log-activity';

export const dynamic = 'force-dynamic';

// ============================================================================
// Constants
// ============================================================================

const breadcrumbItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Log Activity Management', href: '/log-activity' },
  { label: 'Activity Detail', href: '#' },
];

// ============================================================================
// Helper Functions
// ============================================================================

const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDuration = (duration?: number) => {
  if (!duration) return 'N/A';
  
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

const getStatusIcon = (logType: string) => {
  switch (logType) {
    case 'login':
    case 'start_course':
    case 'complete_course':
    case 'pass_quiz':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'logout':
    case 'fail_quiz':
      return <XCircle className="w-5 h-5 text-red-600" />;
    case 'access_content':
    case 'submit_quiz':
    case 'post_forum':
      return <Info className="w-5 h-5 text-blue-600" />;
    default:
      return <AlertCircle className="w-5 h-5 text-yellow-600" />;
  }
};

// ============================================================================
// Detail Sections by Log Type
// ============================================================================

const AuthenticationDetails = ({ log }: { log: LogActivity }) => (
  <div className="space-y-8">
    {/* User Information */}
    <div className="bg-white border border-purple-100 rounded-3xl p-8 relative overflow-hidden">
      <div className="absolute top-6 right-6 opacity-5">
        <User className="w-20 h-20 text-purple-400" />
      </div>
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-purple-50 rounded-full opacity-40"></div>
      <div className="relative">
        <div className="mb-6 pb-3 border-b border-dashed border-purple-300">
          <h3 className="text-xl font-bold text-slate-900">Informasi Pengguna</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-xs font-medium text-purple-600 uppercase tracking-wider">Nama Lengkap</div>
            <div className="text-lg font-semibold text-slate-900">{log.userName}</div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-purple-600 uppercase tracking-wider">Email</div>
            <div className="text-slate-700">{log.userEmail}</div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-purple-600 uppercase tracking-wider">ID Pengguna</div>
            <code className="text-sm bg-purple-50 px-3 py-2 rounded-lg font-mono text-slate-800 block border border-purple-200">{log.userId}</code>
          </div>
        </div>
      </div>
    </div>

    {/* Session Information */}
    <div className="bg-white border border-emerald-100 rounded-3xl p-8 relative overflow-hidden">
      <div className="absolute top-6 right-6 opacity-5">
        <Monitor className="w-20 h-20 text-emerald-400" />
      </div>
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-50 rounded-full opacity-40"></div>
      <div className="relative">
        <div className="mb-6 pb-3 border-b border-dashed border-emerald-300">
          <h3 className="text-xl font-bold text-slate-900">Detail Sesi</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Alamat IP</div>
              <code className="text-sm bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 font-mono block">{log.ipAddress}</code>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider">ID Sesi</div>
              <code className="text-xs bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 font-mono text-slate-600 block break-all">{log.sessionId}</code>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Pemicu</div>
              <div className="text-slate-700">{log.trigger}</div>
            </div>
          </div>
          {log.userAgent && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider">User Agent</div>
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 text-xs font-mono text-slate-600 break-all leading-relaxed max-h-40 overflow-y-auto">
                {log.userAgent}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const CourseActivityDetails = ({ log }: { log: LogActivity }) => (
  <div className="space-y-8">
    {/* Course Information */}
    <div className="bg-white border border-indigo-100 rounded-3xl p-8 relative overflow-hidden">
      <div className="absolute top-6 right-6 opacity-5">
        <BookOpen className="w-20 h-20 text-indigo-400" />
      </div>
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-indigo-50 rounded-full opacity-40"></div>
      <div className="relative">
        <div className="mb-6 pb-3 border-b border-dashed border-indigo-300">
          <h3 className="text-xl font-bold text-slate-900">Informasi Kursus</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="text-xs font-medium text-indigo-600 uppercase tracking-wider">Nama Kursus</div>
              <div className="text-lg font-semibold text-slate-900">{log.courseName}</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-indigo-600 uppercase tracking-wider">ID Kursus</div>
              <code className="text-sm bg-indigo-50 px-3 py-2 rounded-lg font-mono text-slate-800 block border border-indigo-200">{log.courseId}</code>
            </div>
          </div>
          <div className="space-y-6">
            {log.sectionName && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-indigo-600 uppercase tracking-wider">Bagian</div>
                <div className="text-slate-700">{log.sectionName}</div>
              </div>
            )}
            {log.contentName && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-indigo-600 uppercase tracking-wider">Konten</div>
                <div className="text-slate-700">{log.contentName}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Activity Statistics */}
    <div className="bg-white border border-orange-100 rounded-3xl p-8 relative overflow-hidden">
      <div className="absolute top-6 right-6 opacity-5">
        <Target className="w-20 h-20 text-orange-400" />
      </div>
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-orange-50 rounded-full opacity-40"></div>
      <div className="relative">
        <div className="mb-6 pb-3 border-b border-dashed border-orange-300">
          <h3 className="text-xl font-bold text-slate-900">Detail Aktivitas</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-xs font-medium text-orange-600 uppercase tracking-wider">Durasi</div>
            <div className="text-lg font-bold text-slate-900">{formatDuration(log.duration)}</div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-orange-600 uppercase tracking-wider">Pemicu</div>
            <div className="text-slate-700">{log.trigger}</div>
          </div>
          {log.topicTitle && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-orange-600 uppercase tracking-wider">Topik</div>
              <div className="text-slate-700">{log.topicTitle}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const SystemActivityDetails = ({ log }: { log: LogActivity }) => (
  <div className="space-y-8">
    {/* System Information */}
    <div className="bg-white border border-red-100 rounded-3xl p-8 relative overflow-hidden">
      <div className="absolute top-6 right-6 opacity-5">
        <Globe className="w-20 h-20 text-red-400" />
      </div>
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-red-50 rounded-full opacity-40"></div>
      <div className="relative">
        <div className="mb-6 pb-3 border-b border-dashed border-red-300">
          <h3 className="text-xl font-bold text-slate-900">Informasi Sistem</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-xs font-medium text-red-600 uppercase tracking-wider">Alamat IP</div>
            <code className="text-sm bg-red-50 px-3 py-2 rounded-lg font-mono text-slate-800 block border border-red-200">{log.ipAddress}</code>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-red-600 uppercase tracking-wider">ID Sesi</div>
            <code className="text-xs bg-red-50 px-3 py-2 rounded-lg font-mono text-slate-600 block break-all border border-red-200">{log.sessionId}</code>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-red-600 uppercase tracking-wider">Pemicu</div>
            <div className="text-slate-700">{log.trigger}</div>
          </div>
        </div>
      </div>
    </div>

    {/* Technical Details */}
    {(log.userAgent || log.metadata) && (
      <div className="space-y-8">
        {log.userAgent && (
          <div className="bg-white border border-cyan-100 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-6 right-6 opacity-5">
              <Monitor className="w-20 h-20 text-cyan-400" />
            </div>
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-cyan-50 rounded-full opacity-40"></div>
            <div className="relative">
              <div className="mb-6 pb-3 border-b border-dashed border-cyan-300">
                <h3 className="text-xl font-bold text-slate-900">User Agent</h3>
              </div>
              <div className="bg-cyan-50 p-6 rounded-2xl border border-cyan-200 text-xs font-mono text-slate-700 break-all leading-relaxed max-h-48 overflow-y-auto">
                {log.userAgent}
              </div>
            </div>
          </div>
        )}
        {log.metadata && (
          <div className="bg-white border border-amber-100 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-6 right-6 opacity-5">
              <Info className="w-20 h-20 text-amber-400" />
            </div>
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-amber-50 rounded-full opacity-40"></div>
            <div className="relative">
              <div className="mb-6 pb-3 border-b border-dashed border-amber-300">
                <h3 className="text-xl font-bold text-slate-900">Metadata</h3>
              </div>
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-xs font-mono text-slate-700 overflow-x-auto">
                <pre className="whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

export default function LogActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const logId = params.id as string;

  const { data: log, isLoading, error } = useLogActivityById(logId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="py-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="py-6">
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Log Not Found</h2>
              <p className="text-gray-600 mb-6">The requested log activity could not be found.</p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const logTypeColor = LOG_TYPE_COLORS[log.logType as keyof typeof LOG_TYPE_COLORS] || 'bg-gray-100 text-gray-800';

  return (
    <div className="min-h-screen bg-slate-50 mb-16">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="py-8 max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-12">
            <div className="hidden md:block">
              <Breadcrumb separator="chevron" items={breadcrumbItems} />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </div>

          {/* Main Content */}
          <div className="space-y-12">
            {/* Activity Header */}
            <div className="bg-white border border-blue-200 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
              <div className="relative">
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    {getStatusIcon(log.logType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h1 className="text-3xl font-bold text-slate-900">
                        {LOG_TYPE_LABELS[log.logType as keyof typeof LOG_TYPE_LABELS] || log.logType}
                      </h1>
                      <span className="bg-blue-100 px-3 py-1 rounded-lg text-sm font-medium text-blue-700">
                        #{log.id}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xl leading-relaxed mb-6">{log.detail}</p>
                    
                    {/* Meta Information */}
                    <div className="flex flex-wrap gap-8 text-sm">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="text-slate-500 text-xs">Waktu</div>
                          <div className="font-medium text-slate-900 whitespace-nowrap">{formatTimestamp(log.timestamp)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-emerald-500" />
                        <div>
                          <div className="text-slate-500 text-xs">Durasi</div>
                          <div className="font-medium text-slate-900 whitespace-nowrap">{formatDuration(log.duration)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-purple-500" />
                        <div>
                          <div className="text-slate-500 text-xs">Pengguna</div>
                          <div className="font-medium text-slate-900 whitespace-nowrap">{log.userName}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div>
              {(log.logType.includes('login') || log.logType.includes('logout')) ? (
                <AuthenticationDetails log={log} />
              ) : log.courseName ? (
                <CourseActivityDetails log={log} />
              ) : (
                <SystemActivityDetails log={log} />
              )}
            </div>

            {/* Technical Information */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-6 right-6 opacity-5">
                <Info className="w-20 h-20 text-slate-400" />
              </div>
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-slate-100 rounded-full opacity-40"></div>
              <div className="relative">
                <div className="mb-6 pb-2 border-b border-dashed border-slate-300">
                  <h2 className="text-xl font-bold text-slate-900">Informasi Teknis</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-slate-600 uppercase tracking-wider">Log ID</div>
                    <div className="font-mono text-sm bg-slate-100 px-3 py-2 rounded-lg border border-slate-300">{log.id}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-slate-600 uppercase tracking-wider">Dibuat</div>
                    <div className="text-sm text-slate-700">{formatTimestamp(log.createdAt)}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-slate-600 uppercase tracking-wider">Kategori</div>
                    <div className="text-sm text-slate-700">
                      {CATEGORY_LABELS[log.logType as keyof typeof CATEGORY_LABELS] || 'System'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-slate-600 uppercase tracking-wider">Status</div>
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${logTypeColor}`}>
                      {log.logType}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
