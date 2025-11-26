import { Sparkles } from "lucide-react";

interface SummaryFloatingButtonProps {
  onClick: () => void;
}

export const SummaryFloatingButton = ({ onClick }: SummaryFloatingButtonProps) => {
  return (
    <button
      type="button"
      aria-label="Lihat Summary"
      title="Lihat Summary"
      onClick={onClick}
      className="fixed right-6 bottom-24 md:right-8 md:bottom-24 z-50 group"
    >
      <div className="inline-flex items-center rounded-full bg-blue-600 text-white shadow-lg overflow-hidden transition-all duration-300 w-12 group-hover:w-40 h-12 px-3 hover:bg-blue-700">
        <Sparkles className="w-6 h-6 flex-shrink-0" />
        <span className="ml-2 text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Lihat Summary
        </span>
      </div>
    </button>
  );
};
