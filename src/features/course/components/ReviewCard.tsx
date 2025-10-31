/**
 * ReviewCard Component
 * 
 * Komponen kartu review dengan avatar, rating bintang, dan testimoni.
 * Menampilkan ulasan pengguna
 */

import { Star, ThumbsUp, MessageCircle } from "lucide-react";
import React from "react";

interface ReviewCardProps {
  /** URL avatar reviewer */
  reviewerAvatar: string;
  
  /** Nama reviewer */
  reviewerName: string;
  
  /** Rating (1-5) */
  rating: number;
  
  /** Waktu posting (contoh: "2 days ago", "1 week ago") */
  timePosted: string;
  
  /** Teks ulasan */
  reviewText: string;
  
  /** Badge teks opsional (contoh: "Verified Purchase") */
  badge?: string;

  
  /** Additional CSS classes */
  className?: string;
}

export function ReviewCard({
  reviewerAvatar,
  reviewerName,
  rating,
  timePosted,
  reviewText,
  badge,
  className = ""
}: ReviewCardProps) {
  return (
    <div className={`group relative bg-white rounded-xl p-6 border border-gray-200 ${className}`}>
      <div className="flex items-start gap-4">
        {/* Avatar with Star Badge */}
        <div className="relative flex-shrink-0">
          <img 
            src={reviewerAvatar} 
            alt={reviewerName}
            className="w-14 h-14 rounded-xl object-cover border-2 border-gray-200 shadow-md"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg border-2 border-white flex items-center justify-center shadow-sm">
            <Star className="w-3 h-3 text-white fill-white" strokeWidth={2} />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              {/* Name & Badge */}
              <div className="flex items-center gap-2 mb-1">
                <div className="font-semibold text-base text-gray-900">
                  {reviewerName}
                </div>
                {badge && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    {badge}
                  </span>
                )}
              </div>
              
              {/* Rating & Time */}
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
                <span className="text-[13px] text-gray-500">
                  {timePosted}
                </span>
              </div>
            </div>
          </div>
          
          {/* Review Text */}
          <p className="text-[15px] leading-relaxed text-gray-700 mb-3">
            {reviewText}
          </p>
          
         
        </div>
      </div>
    </div>
  );
}