import { BookOpen } from "lucide-react";

interface CourseThumbnailProps {
  thumbnail?: string;
  title: string;
}

export const CourseThumbnail = ({ thumbnail, title }: CourseThumbnailProps) => {
  // Render image thumbnail
  if (thumbnail) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-gray-200">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Fallback placeholder when no thumbnail
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-gray-200">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <BookOpen
              className="w-10 h-10 text-blue-600"
              strokeWidth={1.5}
            />
          </div>
          <p className="text-gray-500 font-medium text-sm">
            Course Thumbnail
          </p>
        </div>
      </div>
    </div>
  );
};
