/**
 * Log Activity Detail Page
 * 
 * Displays comprehensive details for a specific log entry
 * Different layouts and information based on log type
 */

'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, User, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Breadcrumb } from '@/components/ui/Breadcrumb/Breadcrumb';
import { useLogActivityById } from '@/hooks/useLogActivity';
import { LogActivity } from '@/types/log-activity';

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

const formatDuration = (durationMs: number | null | undefined) => {
  if (durationMs === null || durationMs === undefined) return 'N/A';
  
  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

const getStatusIcon = () => {
  return <Info className="w-5 h-5 text-blue-600" />;
};

// ============================================================================
// Generic Detail Section (menggunakan field yang tersedia di skema baru)
// ============================================================================

const GenericDetails = ({ log }: { log: LogActivity }) => (
  <div className="space-y-8">
    {/* User Information */}
    <div className="bg-white border border-slate-200 rounded-3xl p-8 relative overflow-hidden">
      <div className="relative">
        <div className="mb-6 pb-3 border-b border-dashed border-slate-300">
          <h3 className="text-xl font-bold text-slate-900">Informasi Pengguna</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-600 uppercase tracking-wider">Nama Pengguna</div>
            <div className="text-lg font-semibold text-slate-900">{log.nameUser}</div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-600 uppercase tracking-wider">ID Pengguna</div>
            <code className="text-sm bg-slate-50 px-3 py-2 rounded-lg font-mono text-slate-800 block border border-slate-200">{log.idUser}</code>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-600 uppercase tracking-wider">ID Log</div>
            <code className="text-sm bg-slate-50 px-3 py-2 rounded-lg font-mono text-slate-800 block border border-slate-200">{log.id}</code>
          </div>
        </div>
      </div>
    </div>

    {/* Activity Information */}
    <div className="bg-white border border-slate-200 rounded-3xl p-8 relative overflow-hidden">
      <div className="relative">
        <div className="mb-6 pb-3 border-b border-dashed border-slate-300">
          <h3 className="text-xl font-bold text-slate-900">Detail Aktivitas</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-600 uppercase tracking-wider">Waktu</div>
            <div className="text-sm text-slate-800">{formatTimestamp(log.timestamp)}</div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-600 uppercase tracking-wider">Durasi</div>
            <div className="text-sm text-slate-800">{formatDuration(log.duration)}</div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-600 uppercase tracking-wider">ID Log Type</div>
            <div className="text-sm text-slate-800">{log.idLogType}</div>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <div className="text-xs font-medium text-slate-600 uppercase tracking-wider">Deskripsi</div>
          <p className="text-sm text-slate-800 leading-relaxed">{log.details}</p>
        </div>
      </div>
    </div>
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
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30">
        <div className="px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="py-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3" />
              <div className="h-32 bg-gray-200 rounded" />
              <div className="h-64 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30">
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

  const logTypeName = log.logType?.name || 'Activity Log';
  const categoryName = log.categoryLogType?.name;

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
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-16 translate-x-16 opacity-60" />
              <div className="relative">
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                    {getStatusIcon()}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h1 className="text-3xl font-bold text-slate-900">
                        {logTypeName}
                      </h1>
                      <span className="bg-blue-100 px-3 py-1 rounded-lg text-sm font-medium text-blue-700">
                        #{log.id}
                      </span>
                      {categoryName && (
                        <span className="bg-emerald-50 px-3 py-1 rounded-lg text-xs font-medium text-emerald-700 border border-emerald-100">
                          {categoryName}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-xl leading-relaxed mb-6">{log.details}</p>

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
                          <div className="font-medium text-slate-900 whitespace-nowrap">{log.nameUser}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div>
              <GenericDetails log={log} />
            </div>

            {/* Technical Information */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-6 right-6 opacity-5">
                <Info className="w-20 h-20 text-slate-400" />
              </div>
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-slate-100 rounded-full opacity-40" />
              <div className="relative">
                <div className="mb-6 pb-2 border-b border-dashed border-slate-300">
                  <h2 className="text-xl font-bold text-slate-900">Informasi Teknis</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-slate-600 uppercase tracking-wider">Log ID</div>
                    <div className="font-mono text-sm bg-slate-100 px-3 py-2 rounded-lg border border-slate-300">{log.id}</div>
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
