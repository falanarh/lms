import { Star } from "lucide-react";
import React from "react";

type StarSize = "sm" | "md" | "lg";

interface RenderStarsOptions {
  /** Ukuran bintang - sm: 16px, md: 20px, lg: 24px */
  size?: StarSize;
  /** Stroke width untuk icon */
  strokeWidth?: number;
}

const sizeClasses: Record<StarSize, string> = {
  sm: "w-4 h-4", // 16px
  md: "w-5 h-5", // 20px
  lg: "w-6 h-6", // 24px
};

export const renderStars = (
  rating: number,
  options: RenderStarsOptions = {}
): React.ReactElement[] => {
  const { size = "sm", strokeWidth = 1.5 } = options;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const sizeClass = sizeClasses[size];

  return [...Array(5)].map((_, i) => {
    if (i < fullStars) {
      // Full star
      return (
        <Star
          key={i}
          className={`${sizeClass} fill-amber-400 text-amber-400`}
          strokeWidth={strokeWidth}
        />
      );
    } else if (i === fullStars && hasHalfStar) {
      // Half star - menggunakan wrapper dengan overflow hidden dan dua star
      return (
        <div key={i} className={`relative ${sizeClass}`}>
          {/* Background: empty star */}
          <Star
            className={`absolute inset-0 ${sizeClass} text-amber-400`}
            strokeWidth={strokeWidth}
          />
          {/* Foreground: half filled star dengan clip */}
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star
              className={`${sizeClass} fill-amber-400 text-amber-400`}
              strokeWidth={strokeWidth}
            />
          </div>
        </div>
      );
    } else {
      // Empty star
      return (
        <Star
          key={i}
          className={`${sizeClass} text-gray-300`}
          strokeWidth={strokeWidth}
        />
      );
    }
  });
};
