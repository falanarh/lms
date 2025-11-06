import { BookOpen, Download, Book, Users } from "lucide-react";

interface CourseInfoCardsProps {
  method: string;
  syllabusFile: string;
  totalJP: number;
  quota: number;
}

export const CourseInfoCards = ({
  method,
  syllabusFile,
  totalJP,
  quota,
}: CourseInfoCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Metode */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Metode
            </div>
            <div className="text-sm font-semibold text-gray-900 truncate">
              {method}
            </div>
          </div>
        </div>
      </div>

      {/* Silabus */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Silabus
            </div>
            <a
              href="#"
              className="text-sm font-semibold text-gray-900 hover:text-blue-700 truncate hover:underline block"
            >
              {syllabusFile}
            </a>
          </div>
        </div>
      </div>

      {/* Total Jam Pelajaran */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center flex-shrink-0">
            <Book className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Total Jam Pelajaran
            </div>
            <a
              href="#"
              className="text-sm font-semibold text-gray-900 hover:text-blue-700 truncate hover:underline block"
            >
              {totalJP}
            </a>
          </div>
        </div>
      </div>

      {/* Kuota Peserta */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Kuota Peserta
            </div>
            <div className="text-sm font-semibold text-gray-900 truncate">
              {quota} Orang
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
