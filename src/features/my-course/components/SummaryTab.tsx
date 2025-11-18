import { FileText } from "lucide-react";

interface SummaryTabProps {
  text?: string;
  imageUrl?: string | null;
}

export const SummaryTab = ({ text, imageUrl }: SummaryTabProps) => {
  return (
    <div id="summary-section" className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
            <FileText className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Summary</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      </div>
    </div>
  );
};