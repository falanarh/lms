'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar/Navbar';
import { useState } from 'react';
import { Bell, X } from 'lucide-react';

interface NavbarWrapperProps {
  user?: { name?: string; role: string; avatarUrl?: string };
}

export function NavbarWrapper({ user }: NavbarWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);

  // Check if current route is /course or its sub-routes
  const isCourseRoute = pathname.startsWith('/course');

  // Map pathname to navbar key
  const getActiveKey = (path: string): string => {
    // Remove trailing slash and get first segment
    const cleanPath = path === '/' ? 'home' : path.replace(/^\//, '').split('/')[0];

    // Map paths to navbar keys
    const pathMap: Record<string, string> = {
      '': 'home',
      'home': 'home',
      'my-course': 'my-course',
      'course': 'course',
      'faq': 'faq',
      'forum': 'forum',
      'knowledge-center': 'knowledge-center',
    };

    return pathMap[cleanPath] || ''; // Return empty string for 404 or unknown routes
  };

  const activeKey = getActiveKey(pathname);

  // Navigation items dengan href
  const navItems = [
    { key: 'home', label: 'Home', href: '/' },
    { key: 'my-course', label: 'My Course', href: '/my-course' },
    { key: 'course', label: 'Kursus', href: '/course' },
    { key: 'faq', label: 'FAQ', href: '/faq' },
    { key: 'forum', label: 'Forum', href: '/forum' },
    { key: 'knowledge-center', label: 'Knowledge Center', href: '/knowledge-center' },
  ];

  // Handle navigation ketika item di-klik
  const handleItemSelect = (key: string) => {
    const item = navItems.find((item) => item.key === key);
    if (item?.href) {
      router.push(item.href);
    }
  };

  // Dummy notifications
  const notifications = [
    {
      id: 1,
      title: 'Kursus Baru Tersedia',
      message: 'Kursus "Advanced Data Analysis" telah tersedia',
      time: '5 menit lalu',
      unread: true,
    },
    {
      id: 2,
      title: 'Pengingat Deadline',
      message: 'Tugas "Analisis Statistik Dasar" akan berakhir dalam 2 hari',
      time: '1 jam lalu',
      unread: true,
    },
    {
      id: 3,
      title: 'Sertifikat Tersedia',
      message: 'Selamat! Sertifikat untuk kursus "Python for Data Science" sudah dapat diunduh',
      time: '3 jam lalu',
      unread: false,
    },
    {
      id: 4,
      title: 'Diskusi Baru',
      message: 'Ada 3 balasan baru di forum diskusi kursus Anda',
      time: '5 jam lalu',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Notification badge component
  const notificationBadge = unreadCount > 0 ? (
    <span className="absolute -top-1 -right-1 size-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
      {unreadCount}
    </span>
  ) : null;

  return (
    <>
      <Navbar
        variant="solid"
        size="lg"
        items={navItems}
        activeKey={activeKey}
        onItemSelect={handleItemSelect}
        brandTitle="E-Warkop"
        user={isCourseRoute ? user : undefined}
        showNotifications={isCourseRoute}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        notificationBadge={notificationBadge}
        rightAction={
          !isCourseRoute ? (
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
            >
              Masuk
            </button>
          ) : undefined
        }
      />

      {/* Notification Panel - HANYA muncul di route /course */}
      {isCourseRoute && showNotifications && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowNotifications(false)}
          />

          {/* Notification Dropdown */}
          <div className="fixed top-20 right-4 sm:right-6 lg:right-10 xl:right-14 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-slideDown">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Notifikasi</h3>
                <p className="text-sm text-gray-600">
                  {unreadCount} notifikasi belum dibaca
                </p>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="size-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Bell size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-600">Tidak ada notifikasi</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        notif.unread ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {notif.unread && (
                          <div className="size-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm mb-1">
                            {notif.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-500">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 py-2">
                  Lihat Semua Notifikasi
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </>
  );
}