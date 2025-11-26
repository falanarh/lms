'use client';

import { usePathname } from 'next/navigation';
import { NavbarWrapper } from '@/components/layout/Navbar/NavbarWrapper';
import { Footer } from '@/components/layout/Footer/Footer';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  // Hide navbar and footer on login page
  const hideLayout = pathname?.startsWith('/login');

  if (hideLayout) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-200">
        {children}
      </div>
    );
  }

  return (
    <>
      <NavbarWrapper />
      <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 transition-colors duration-200">
        {children}
      </div>
      <Footer />
    </>
  );
}