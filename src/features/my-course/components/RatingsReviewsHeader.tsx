import { MessageSquare } from "lucide-react";

interface RatingsReviewsHeaderProps {
  onWriteReview: () => void;
}

export const RatingsReviewsHeader = ({ onWriteReview }: RatingsReviewsHeaderProps) => {
  return (
    <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Heading & Description */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Bagikan Pengalaman Anda
          </h3>
          <p className="text-sm text-gray-600">
            Bantu calon peserta lain dengan memberikan ulasan tentang kursus ini
          </p>
        </div>

        {/* Right: Button */}
        <button 
          onClick={onWriteReview}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 hover:shadow-lg transition-all duration-200 whitespace-nowrap group"
        >
          <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Tulis Ulasan</span>
        </button>
      </div>
    </div>
  );
};
