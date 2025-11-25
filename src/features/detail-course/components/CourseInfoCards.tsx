import { BookOpen, Download, Book, Users, Video } from "lucide-react";

interface CourseInfoCardsProps {
  method: string;
  syllabusFile: string;
  totalJP: number;
  quota: number;
  zoomUrl?: string;
  isEnrolled?: boolean;
}

export const CourseInfoCards = ({
  method,
  syllabusFile,
  totalJP,
  quota,
  zoomUrl,
  isEnrolled = false,
}: CourseInfoCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Metode */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700 hover:shadow-md dark:hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
              Metode
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-zinc-100 truncate">
              {method}
            </div>
          </div>
        </div>
      </div>

      {/* Silabus */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700 hover:shadow-md dark:hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
              Silabus
            </div>
            {syllabusFile ? (
              <a
                href={syllabusFile}
                target="_blank"
                rel="noopener noreferrer"
                download
                className=" flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 truncate hover:underline block"
              >
                Download Silabus
                <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </a>
            ) : (
              <span className="text-sm font-semibold text-gray-400 dark:text-zinc-500 truncate block">
                Tidak tersedia
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Total Jam Pelajaran */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700 hover:shadow-md dark:hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center flex-shrink-0">
            <Book className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
              Total Jam Pelajaran
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-zinc-100 truncate">
              {totalJP} JP
            </div>
          </div>
        </div>
      </div>

      {/* Kuota Peserta */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700 hover:shadow-md dark:hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
              Kuota Peserta
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-zinc-100 truncate">
              {quota} Orang
            </div>
          </div>
        </div>
      </div>

      {zoomUrl && (
        <div className="col-span-2 bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Video className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Zoom Meeting
              </div>
              {isEnrolled ? (
                <a
                  href={zoomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  Buka Zoom
                </a>
              ) : (
                <span
                  aria-disabled="true"
                  className="text-sm font-semibold text-blue-600 opacity-60 cursor-not-allowed"
                  title="Enroll untuk membuka Zoom"
                >
                  Buka Zoom
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
