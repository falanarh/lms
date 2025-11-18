import { CheckIcon, Check, ChevronLeft, ChevronRight } from "lucide-react";

interface ContentNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  isNavigating?: boolean;
  onMarkAsDone?: () => void;
  isCompleted?: boolean;
}

export const ContentNavigation = ({
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  isNavigating = false,
  onMarkAsDone,
  isCompleted = false,
}: ContentNavigationProps) => {
  const isMarkDoneDisabled = !onMarkAsDone || isNavigating;

  return (
    <div className="flex items-center gap-2 justify-between md:gap-3 py-4">
      <button
        onClick={onPrevious}
        disabled={!hasPrevious || isNavigating}
        className={`
          flex items-center justify-center py-3 rounded-lg font-medium transition-all text-sm
          flex-none w-28 md:w-40 px-4
          ${hasPrevious && !isNavigating
            ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        {isNavigating ? (
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
        <span className="ml-1">Previous</span>
      </button>

      <button
        onClick={() => {
          if (!isMarkDoneDisabled && onMarkAsDone) {
            onMarkAsDone();
          }
        }}
        disabled={isMarkDoneDisabled}
        className={`
          flex items-center justify-center py-3 rounded-lg font-medium transition-all text-sm
          flex-1 px-4
          ${!isMarkDoneDisabled
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-100 border border-gray-200 text-gray-400"
          }
        `}
      >
        {isCompleted && <CheckIcon className="w-5 h-5 mr-1" />}
        <span className="mr-1">{isCompleted ? "Completed" : "Mark as done"}</span>
      </button>

      <button
        onClick={onNext}
        disabled={!hasNext || isNavigating}
        className={`
          flex items-center justify-center py-3 rounded-lg font-medium transition-all text-sm
          flex-none w-28 md:w-40 px-4
          ${hasNext && !isNavigating
            ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        <span className="mr-1">Next</span>
        {isNavigating ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};
