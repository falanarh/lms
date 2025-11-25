"use client";

import { ChevronLeft } from "lucide-react";

interface SidebarToggleButtonProps {
  onClick: () => void;
}

export const SidebarToggleButton = ({ onClick }: SidebarToggleButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="
        fixed right-0 top-1/2 -translate-y-1/2 z-50
        bg-blue-600 hover:bg-blue-700 
        text-white
        rounded-l-xl 
        shadow-lg hover:shadow-xl
        transition-all duration-300 ease-in-out
        w-12 hover:w-40
        h-12
        flex items-center justify-start
        px-3 hover:px-4
        gap-3
        group
        overflow-hidden
      "
      title="Open course contents"
    >
      {/* Icon - Always visible */}
      <ChevronLeft 
        className="
          w-5 h-5 
          flex-shrink-0
          transition-transform duration-300
          group-hover:scale-110
        " 
      />
      
      {/* Text - Only visible on hover */}
      <span 
        className="
          whitespace-nowrap 
          font-semibold 
          text-sm
          opacity-0 group-hover:opacity-100
          -translate-x-2 group-hover:translate-x-0
          transition-all duration-500 ease-out
        "
      >
        Course Content
      </span>
    </button>
  );
};
