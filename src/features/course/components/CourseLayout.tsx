import { ReactNode } from 'react';

interface CourseLayoutProps {
  children: ReactNode;
}

export function CourseLayout({ children }: CourseLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="px-6 sm:px-8 lg:px-12 xl:px-16 space-y-8 pt-16 pb-8">
        {children}
      </div>
    </div>
  );
}
