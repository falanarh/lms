import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface ContentNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  onMarkAsDone: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  isCompleted: boolean;
}

export const ContentNavigation = ({
  onPrevious,
  onNext,
  onMarkAsDone,
  hasPrevious,
  hasNext,
  isCompleted,
}: ContentNavigationProps) => {
  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 py-4">
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className={`
          flex items-center justify-center sm:px-6 py-3 rounded-lg font-medium transition-all text-sm
          w-12 sm:w-auto px-0
          ${
            hasPrevious
              ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="hidden sm:inline ml-1">Previous</span>
      </button>

      {/* Mark as Done Button */}
      <button
        onClick={onMarkAsDone}
        className="flex items-center justify-center gap-2 flex-1 py-3 rounded-lg font-medium text-sm transition-all bg-blue-600 text-white hover:bg-blue-700"
      >
        {isCompleted ? (
          <>
            <Check className="w-5 h-5" />
            <span>Completed</span>
          </>
        ) : (
          <>
            <span>Mark as Done</span>
          </>
        )}
      </button>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!hasNext}
        className={`
          flex items-center justify-center sm:px-6 py-3 rounded-lg font-medium transition-all text-sm
          w-12 sm:w-auto px-0
          ${
            hasNext
              ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        <span className="hidden sm:inline mr-1">Next</span>
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
