import { Star } from "lucide-react";
import React from "react";

export const renderStars = (rating: number): React.ReactElement[] => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return [...Array(5)].map((_, i) => {
    if (i < fullStars) {
      return (
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    } else if (i === fullStars && hasHalfStar) {
      return (
        <Star
          key={i}
          className="w-4 h-4 fill-yellow-400/50 text-yellow-400"
        />
      );
    } else {
      return <Star key={i} className="w-4 h-4 text-gray-300" />;
    }
  });
};
