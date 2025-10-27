'use client';

import React, { useState } from 'react';
import { Clock, Award, ChevronDown, ChevronUp } from 'lucide-react';

// Interface untuk tipe data progress
interface ProgressData {
  completedActivities: number;  // Jumlah aktivitas yang sudah selesai
  totalActivities: number;       // Total aktivitas yang tersedia
  studyTime: number;             // Waktu belajar dalam menit
  quizScore: number;             // Skor quiz (bisa dalam bentuk persentase atau poin)
  completionPercentage: number;  // Persentase penyelesaian keseluruhan
}

// Props untuk komponen utama
interface ProgressCardProps {
  progressData: ProgressData;    // Data progress yang akan ditampilkan
  onExpand?: (isExpanded: boolean) => void; // Callback opsional ketika card di-expand/collapse
}

/**
 * Komponen Progress Bar sederhana
 * Menampilkan bar progress dengan persentase yang diberikan
 */
const Progress: React.FC<{ value: number; className?: string }> = ({ 
  value, 
  className = '' 
}) => {
  return (
    <div className={`w-full rounded-full overflow-hidden ${className}`}>
      <div 
        className="h-full bg-[#615fff] transition-all duration-300 ease-in-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

/**
 * Fungsi helper untuk memformat waktu belajar
 * Mengkonversi menit menjadi format jam dan menit yang mudah dibaca
 * @param minutes - Waktu belajar dalam menit
 * @returns String format waktu (contoh: "2j 30m" atau "45m")
 */
const formatStudyTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}j ${remainingMinutes}m` : `${hours}j`;
};

/**
 * Komponen utama ProgressCard
 * Card yang dapat di-expand/collapse untuk menampilkan progress belajar pengguna
 * 
 * Fitur:
 * - Menampilkan persentase penyelesaian aktivitas
 * - Progress bar visual
 * - Statistik waktu belajar dan skor quiz (pada desktop)
 * - Expandable/collapsible dengan animasi
 * - Hover effect untuk interaktivitas yang lebih baik
 */
const ProgressCard: React.FC<ProgressCardProps> = ({ 
  progressData, 
  onExpand 
}) => {
  // State untuk mengontrol apakah card dalam keadaan expanded atau tidak
  const [isExpanded, setIsExpanded] = useState(false);

  // Handler untuk toggle expand/collapse
  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    // Panggil callback jika disediakan
    onExpand?.(newState);
  };

  return (
    <div 
      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={handleToggle}
    >
      {/* Header Section - Judul dan Statistik */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Informasi Utama - Judul dan subtitle */}
          <div>
            <h3 className="font-['Figtree:Bold',_sans-serif] text-[16px] text-[#101828]">
              Progress Belajar Anda
            </h3>
            <p className="font-['Figtree:Regular',_sans-serif] text-[12px] text-[#6a7282] mt-0.5">
              {progressData.completedActivities} dari {progressData.totalActivities} aktivitas selesai
            </p>
          </div>
          
          {/* Compact Stats - Hanya tampil di desktop (md breakpoint ke atas) */}
          <div className="hidden md:flex items-center gap-4 ml-auto mr-6">
            {/* Statistik Waktu Belajar */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#f59e0b]" />
              <span className="font-['Figtree:SemiBold',_sans-serif] text-[14px] text-[#78350f]">
                {formatStudyTime(progressData.studyTime)}
              </span>
            </div>
            {/* Statistik Skor Quiz */}
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#10b981]" />
              <span className="font-['Figtree:SemiBold',_sans-serif] text-[14px] text-[#064e3b]">
                {progressData.quizScore}
              </span>
            </div>
          </div>
        </div>
        
        {/* Persentase dan Chevron Icon */}
        <div className="flex items-center gap-3">
          {/* Persentase penyelesaian */}
          <span className="font-['Figtree:Bold',_sans-serif] text-[20px] text-[#615fff]">
            {progressData.completionPercentage}%
          </span>
          {/* Icon expand/collapse - berubah berdasarkan state */}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-[#6a7282]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#6a7282]" />
          )}
        </div>
      </div>
      
      {/* Progress Bar - Selalu terlihat */}
      <div className="mt-3">
        <Progress 
          value={progressData.completionPercentage} 
          className="h-2 bg-gray-100"
        />
      </div>
    </div>
  );
};

export default ProgressCard;