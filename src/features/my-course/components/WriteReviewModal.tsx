import { useState } from "react";
import { X, Star } from "lucide-react";

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => void;
  courseName?: string;
  isLoading?: boolean;
}

const ratingLabels: Record<number, string> = {
  1: "Perlu Perbaikan",
  2: "Kurang Memuaskan",
  3: "Lumayan Baik",
  4: "Bagus",
  5: "Luar Biasa",
};

export const WriteReviewModal = ({
  isOpen,
  onClose,
  onSubmit,
  courseName = "kursus ini",
  isLoading = false,
}: WriteReviewModalProps) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");

  const handleSubmit = () => {
    console.log("Submit clicked - Rating:", rating, "Review length:", review.trim().length);
    if (rating === 0) {
      alert("Silakan berikan rating terlebih dahulu");
      return;
    }
    if (review.trim() === "") {
      alert("Silakan tulis ulasan Anda");
      return;
    }
    onSubmit(rating, review);
    handleClose();
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setReview("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Tulis Ulasan
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Bagikan pengalaman Anda tentang kursus {courseName}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Rating Section */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      strokeWidth={1.5}
                      className={`w-10 h-10 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-yellow-500"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Section */}
            <div>
              <label
                htmlFor="review"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Tulis Ulasan Anda
              </label>
              <textarea
                id="review"
                rows={6}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Ceritakan pengalaman Anda mengikuti kursus ini. Apa yang Anda sukai? Apa yang bisa ditingkatkan?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  Minimal 10 karakter
                </p>
                <p className="text-xs text-gray-500">
                  {review.length} karakter
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 pb-4 pt-0">
            <button
              onClick={handleClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || review.trim().length < 10}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Kirim Ulasan
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
