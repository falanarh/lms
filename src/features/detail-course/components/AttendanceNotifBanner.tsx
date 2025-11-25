"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface AttendanceNotificationBannerProps {
  onClickSchedule: () => void;
  hasSchedule: boolean;
}

export function AttendanceNotificationBanner({
  onClickSchedule,
  hasSchedule,
}: AttendanceNotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!hasSchedule || !isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm md:text-base">
            Jadwal kursus telah tersedia. Jangan lupa untuk melakukan{" "}
            <strong>presensi</strong> pada waktu yang telah ditentukan. Klik{" "}
            <button
              onClick={onClickSchedule}
              className="font-bold underline hover:text-blue-100 transition-colors"
            >
              disini
            </button>{" "}
            untuk melihat jadwal lengkap.
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 hover:bg-white/20 rounded-lg p-1.5 transition-colors"
          aria-label="Tutup notifikasi"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}