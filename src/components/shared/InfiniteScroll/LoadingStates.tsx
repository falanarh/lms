import React from 'react';
import { Loader2, AlertCircle, MessageSquare } from 'lucide-react';

interface LoadingStateProps {
  type: 'initial' | 'more';
  className?: string;
}

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

interface EmptyStateProps {
  search?: string;
  onReset?: () => void;
  className?: string;
}

/**
 * LoadingState - Component untuk menampilkan loading indicator
 */
export function LoadingState({ type, className = '' }: LoadingStateProps) {
  if (type === 'initial') {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Memuat topik...</p>
        <p className="text-gray-500 text-sm mt-1">Mohon tunggu sebentar</p>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center py-6 ${className}`}>
      <Loader2 className="w-5 h-5 text-blue-500 animate-spin mr-2" />
      <span className="text-gray-600 text-sm">Memuat lebih banyak topik...</span>
    </div>
  );
}

/**
 * ErrorState - Component untuk menampilkan error state
 */
export function ErrorState({ error, onRetry, className = '' }: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Terjadi Kesalahan
      </h3>
      <p className="text-gray-600 mb-6 max-w-md">
        {error || 'Gagal memuat topik. Silakan coba lagi.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}

/**
 * EmptyState - Component untuk menampilkan empty state
 */
export function EmptyState({ search, onReset, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {search ? 'Tidak Ada Hasil Pencarian' : 'Belum Ada Topik'}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md">
        {search
          ? `Tidak ada topik yang cocok dengan pencarian "${search}". Coba kata kunci lain.`
          : 'Belum ada topik di forum ini. Jadilah yang pertama memulai diskusi!'
        }
      </p>
      {search && onReset && (
        <button
          onClick={onReset}
          className="px-4 py-2 text-blue-500 hover:text-blue-600 transition-colors duration-200"
        >
          Hapus Pencarian
        </button>
      )}
    </div>
  );
}

/**
 * SkeletonLoader - Component untuk skeleton loading
 */
export function SkeletonLoader({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-8 md:space-y-12">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-100 shadow-lg animate-pulse overflow-hidden"
        >
          {/* Topic Header Skeleton */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>

          {/* Topic Stats Skeleton */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center gap-6">
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>

          {/* Discussions Skeleton Preview */}
          <div className="p-6 border-t border-gray-100 space-y-4">
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            {Array.from({ length: 2 }).map((_, replyIndex) => (
              <div key={replyIndex} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default {
  LoadingState,
  ErrorState,
  EmptyState,
  SkeletonLoader,
};