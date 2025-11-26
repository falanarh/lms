import { BookOpen } from "lucide-react";
import Image from "next/image";

interface CourseThumbnailProps {
  thumbnail?: string;
  title: string;
}

export const CourseThumbnail = ({ thumbnail, title }: CourseThumbnailProps) => {
  // Render image thumbnail
  if (thumbnail) {
    const isExternal = /^https?:\/\//i.test(thumbnail);

    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-gray-200 dark:border-zinc-700">
        {isExternal ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={title}
            width={640}
            height={360}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <Image
            src={thumbnail}
            alt={title}
            width={640}
            height={360}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    );
  }

  // Fallback placeholder when no thumbnail
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-gray-200 dark:border-zinc-700">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
            <BookOpen
              className="w-10 h-10 text-blue-600 dark:text-blue-400"
              strokeWidth={1.5}
            />
          </div>
          <p className="text-gray-500 dark:text-zinc-400 font-medium text-sm">
            Course Thumbnail
          </p>
        </div>
      </div>
    </div>
  );
};
