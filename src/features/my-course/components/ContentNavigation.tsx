import { ChevronLeft, ChevronRight } from "lucide-react";

interface ContentNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const ContentNavigation = ({
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: ContentNavigationProps) => {
  return (
    <div className="flex items-center gap-2 justify-between md:gap-3 py-4">
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className={`
          flex items-center justify-center py-3 rounded-lg font-medium transition-all text-sm
          flex-1 md:flex-none md:w-40 px-4
          ${
            hasPrevious
              ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="ml-1">Previous</span>
      </button>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!hasNext}
        className={`
          flex items-center justify-center py-3 rounded-lg font-medium transition-all text-sm
          flex-1 md:flex-none md:w-40 px-4
          ${
            hasNext
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        <span className="mr-1">Next</span>
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
