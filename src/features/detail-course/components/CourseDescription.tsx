import { FileText } from "lucide-react";

interface CourseDescriptionProps {
  description: string;
}

export const CourseDescription = ({ description }: CourseDescriptionProps) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
          <FileText className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Description</h2>
      </div>
      <p className="text-gray-700 leading-relaxed">{description}</p>
    </div>
  );
};
