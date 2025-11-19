import { EnrolledCourse, VIEW_MODES, ViewModeValue } from '../types';
import { MyCourseCard } from './MyCourseCard';

interface MyCourseGridProps {
  courses: EnrolledCourse[];
  isLoading?: boolean;
  viewMode?: string;
}

export function MyCourseGrid({ courses, isLoading = false, viewMode = 'grid-4' }: MyCourseGridProps) {
  const gridClass = VIEW_MODES.find(mode => mode.value === viewMode)?.gridClass ||
                   'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  if (isLoading) {
    return (
      <div className={`grid gap-6 ${gridClass}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden animate-pulse"
          >
            {/* Thumbnail Skeleton */}
            <div className="aspect-video bg-zinc-200 dark:bg-zinc-700 relative">
              <div className="absolute top-3 left-3 w-12 h-6 bg-zinc-300 dark:bg-zinc-600 rounded-full" />
              <div className="absolute bottom-3 left-3 right-3 h-8 bg-zinc-300 dark:bg-zinc-600 rounded-lg" />
            </div>

            {/* Content Skeleton */}
            <div className="p-6 space-y-3">
              <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full w-20" />
              <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
              <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />

              {/* Rating Skeleton */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-zinc-200 dark:bg-zinc-700 rounded" />
                  ))}
                </div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-16" />
              </div>

              {/* Info Skeleton */}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-zinc-200 dark:bg-zinc-700 rounded" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-24" />
              </div>

              {/* Progress Skeleton */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <div className="flex justify-between items-center mb-2">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-20" />
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-12" />
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-zinc-400 dark:text-zinc-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Belum ada kursus yang diikuti
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Mulai perjalanan belajar Anda dengan mendaftar kursus yang tersedia
        </p>
        <a
          href="/courses"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200"
        >
          Jelajahi Kursus
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${gridClass}`}>
      {courses.map((course) => (
        <MyCourseCard
          key={course.id}
          course={course}
          viewMode={viewMode as ViewModeValue}
        />
      ))}
    </div>
  );
}