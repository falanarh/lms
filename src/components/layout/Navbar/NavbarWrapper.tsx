'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar/Navbar';
import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useUser, type User } from '@/hooks/useUser'; // <--- import your hook

export function NavbarWrapper() {
  const pathname = usePathname();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);

  // fetch the current user
  const { user, loading } = useUser(); // <-- now real user data

  // Transform user data to match Navbar component's expected format
  const transformedUser = user ? {
    name: user.name,
    email: user.email_gojaks,
    role: user.roles?.[0]?.role_name || 'user',
    avatarUrl: undefined // can be added later if API provides avatar
  } : undefined;


  const isCourseRoute = pathname?.startsWith('/course');

  const navItems = [
    { key: 'home', label: 'Home', href: '/' },
    { key: 'my-course', label: 'My Course', href: '/my-course' },
    { key: 'course', label: 'Kursus', href: '/course' },
    { key: 'faq', label: 'FAQ', href: '/faq' },
    { key: 'knowledge-center', label: 'Knowledge Center', href: '/knowledge-center' },
  ];

  const getActiveKey = (path: string): string => {
    const cleanPath = path === '/' ? 'home' : path.replace(/^\//, '').split('/')[0];
    const pathMap: Record<string, string> = {
      '': 'home',
      'home': 'home',
      'my-course': 'my-course',
      'course': 'course',
      'faq': 'faq',
      'knowledge-center': 'knowledge-center',
    };
    return pathMap[cleanPath] || '';
  };

  const activeKey = pathname ? getActiveKey(pathname) : '';

  const handleItemSelect = (key: string) => {
    const item = navItems.find((item) => item.key === key);
    if (item?.href) router.push(item.href);
  };

  // showNotifications and notificationBadge same as before
  const notifications: Array<{ id: string; message: string; unread: boolean }> = [
    // Add your notifications here, or this can come from an API
  ];
  const unreadCount = notifications.filter(n => n.unread).length;
  const notificationBadge = unreadCount > 0 ? (
    <span className="absolute -top-1 -right-1 size-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
      {unreadCount}
    </span>
  ) : null;

  // Hide Navbar on /tutor-ai
  if (pathname?.startsWith('/tutor-ai')) return null;

  return (
    <Navbar
      variant="solid"
      size="lg"
      items={navItems}
      activeKey={activeKey}
      onItemSelect={handleItemSelect}
      brandTitle="E-Warkop"
      user={transformedUser} // <-- always pass transformed user when available
      isLoading={loading} // show skeletons if fetching
      showNotifications={isCourseRoute}
      onNotificationClick={() => setShowNotifications(!showNotifications)}
      notificationBadge={notificationBadge}
      rightAction={
        !isCourseRoute && !user ? ( // <-- show login button only if user is not authenticated
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
          >
            Masuk
          </button>
        ) : undefined
      }
    />
  );
}
