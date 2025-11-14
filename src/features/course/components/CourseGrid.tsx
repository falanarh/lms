import { Course, VIEW_MODES, ViewModeValue } from '../types';
import { CourseCard } from './CourseCard';

interface CourseGridProps {
  courses: Course[];
  isLoading?: boolean;
  viewMode?: string;
}

export function CourseGrid({ courses, isLoading = false, viewMode = 'grid-4' }: CourseGridProps) {
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
            <div className="aspect-video bg-zinc-200 dark:bg-zinc-700" />
            <div className="p-6 space-y-3">
              <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full w-20" />
              <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-zinc-200 dark:bg-zinc-700 rounded" />
                  ))}
                </div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-16" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-zinc-200 dark:bg-zinc-700 rounded" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-24" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-zinc-200 dark:bg-zinc-700 rounded" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-20" />
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
          No courses found
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${gridClass}`}>
      {courses.map((course) => (
        <CourseCard 
          key={course.id} 
          course={course} 
          viewMode={viewMode as ViewModeValue} 
        />
      ))}
    </div>
  );
}
