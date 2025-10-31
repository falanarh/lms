import { Star } from "lucide-react";
import React from "react";

/**
 * RatingSummaryCard Component
 * 
 * Komponen ringkasan rating dengan skor rata-rata dan distribusi rating.
 * Menampilkan visual rating secara lengkap dengan bar chart persentase.
 */

interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

interface RatingSummaryCardProps {
  /** Rata-rata rating (0-5) */
  averageRating: number;
  
  /** Total jumlah rating */
  totalRatings: number;
  
  /** Distribusi rating per bintang */
  ratingDistribution: RatingDistribution;
  
  /** Judul card */
  title?: string;
  
  /** Warna tema - default: amber */
  variant?: 'amber' | 'yellow' | 'orange' | 'blue' | 'purple';
  
  /** Additional CSS classes */
  className?: string;
}

export function RatingSummaryCard({
  averageRating,
  totalRatings,
  ratingDistribution,
  title,
  variant = 'amber',
  className = ""
}: RatingSummaryCardProps) {
  
  const variants = {
    amber: {
      bg: "from-amber-50 to-orange-50",
      border: "border-amber-200",
      iconBg: "from-amber-500 to-amber-600",
      divider: "border-amber-300",
      starFill: "fill-amber-500 text-amber-500",
      barGradient: "from-amber-400 to-orange-500"
    },
    yellow: {
      bg: "from-yellow-50 to-amber-50",
      border: "border-yellow-200",
      iconBg: "from-yellow-500 to-yellow-600",
      divider: "border-yellow-300",
      starFill: "fill-yellow-500 text-yellow-500",
      barGradient: "from-yellow-400 to-amber-500"
    },
    orange: {
      bg: "from-orange-50 to-red-50",
      border: "border-orange-200",
      iconBg: "from-orange-500 to-orange-600",
      divider: "border-orange-300",
      starFill: "fill-orange-500 text-orange-500",
      barGradient: "from-orange-400 to-red-500"
    },
    blue: {
      bg: "from-blue-50 to-cyan-50",
      border: "border-blue-200",
      iconBg: "from-blue-500 to-blue-600",
      divider: "border-blue-300",
      starFill: "fill-blue-500 text-blue-500",
      barGradient: "from-blue-400 to-cyan-500"
    },
    purple: {
      bg: "from-purple-50 to-pink-50",
      border: "border-purple-200",
      iconBg: "from-purple-500 to-purple-600",
      divider: "border-purple-300",
      starFill: "fill-purple-500 text-purple-500",
      barGradient: "from-purple-400 to-pink-500"
    }
  };
  
  const colors = variants[variant];
  
  return (
    <div className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-8 border ${colors.border} ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors.iconBg} flex items-center justify-center shadow-md`}>
          <Star className="w-5 h-5 text-white fill-white" strokeWidth={2} />
        </div>
        <h3 className="font-bold text-xl text-gray-900">
          {title}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8">
        {/* Left: Average Rating */}
        <div className={`flex flex-col items-center justify-center md:pr-8 md:border-r ${colors.divider}`}>
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="font-bold text-[52px] leading-[56px] text-gray-900">
                  {averageRating.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-6 h-6 ${i < Math.floor(averageRating) ? colors.starFill : 'text-gray-300'}`}
                strokeWidth={1.5}
              />
            ))}
          </div>
          <div className="font-semibold text-[15px] text-gray-700">
            Course Rating
          </div>
          <div className="text-[13px] text-gray-600 mt-1">
            ({totalRatings.toLocaleString()} ratings)
          </div>
        </div>

        {/* Right: Rating Distribution */}
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating as keyof RatingDistribution];
            const percentage = (count / totalRatings) * 100;
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-20">
                  <Star className={`w-4 h-4 ${colors.starFill}`} strokeWidth={1.5} />
                  <span className="font-semibold text-[15px] text-gray-700">
                    {rating}
                  </span>
                </div>
                <div className="flex-1 bg-white rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className={`h-full bg-gradient-to-r ${colors.barGradient} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="font-semibold text-[15px] text-gray-700 w-14 text-right">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}