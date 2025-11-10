import { Star } from "lucide-react";
import React from "react";
import { renderStars } from "../hooks/stars";

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
  variant?: "amber" | "yellow" | "orange" | "blue" | "purple";

  /** Additional CSS classes */
  className?: string;
}

export function RatingSummaryCard({
  averageRating,
  totalRatings,
  ratingDistribution,
  title,
  variant = "amber",
  className = "",
}: RatingSummaryCardProps) {
  const variants = {
    amber: {
      bg: "white",
      border: "border-gray-200",
      iconBg: "from-amber-500 to-amber-600",
      divider: "border-gray-200",
      barGradient: "from-amber-400 to-orange-500",
    },
    yellow: {
      bg: "white",
      border: "border-gray-200",
      iconBg: "from-yellow-500 to-yellow-600",
      divider: "border-gray-200",
      barGradient: "from-yellow-400 to-amber-500",
    },
    orange: {
      bg: "white",
      border: "border-gray-200",
      iconBg: "from-orange-500 to-orange-600",
      divider: "border-gray-200",
      barGradient: "from-orange-400 to-red-500",
    },
    blue: {
      bg: "white",
      border: "border-gray-200",
      iconBg: "from-blue-500 to-blue-600",
      divider: "border-gray-200",
      barGradient: "from-blue-400 to-cyan-500",
    },
    purple: {
      bg: "white",
      border: "border-gray-200",
      iconBg: "from-purple-500 to-purple-600",
      divider: "border-gray-200",
      barGradient: "from-purple-400 to-pink-500",
    },
  };

  const colors = variants[variant];

  return (
    <div
      className={`bg-${colors.bg} rounded-2xl p-8 border ${colors.border} ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors.iconBg} flex items-center justify-center shadow-md`}
        >
          <Star className="w-5 h-5 text-white fill-white" strokeWidth={2} />
        </div>
        <h3 className="font-bold text-xl text-gray-900">{title}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8">
        {/* Left: Average Rating */}
        <div
          className={`flex flex-col items-center justify-center md:pr-8 md:border-r ${colors.divider}`}
        >
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
            {renderStars(averageRating, { size: "lg", strokeWidth: 1.5 })}
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
            const count =
              ratingDistribution[rating as keyof RatingDistribution];
            const percentage = (count / totalRatings) * 100;
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-20">
                  <Star
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                    strokeWidth={1.5}
                  />
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
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
