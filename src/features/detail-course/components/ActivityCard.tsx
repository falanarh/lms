import { Lock } from "lucide-react";
import { Content } from "@/api/contents";

interface ActivityCardProps {
  activity: Content;
}

export const ActivityCard = ({ activity }: ActivityCardProps) => {
  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-3 cursor-not-allowed"
      title="Enroll to access this content"
    >
      <div className="flex items-center gap-3">
        {/* Locked Icon */}
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border bg-gray-100 border-gray-300 text-gray-600">
          <Lock className="w-5 h-5" />
        </div>

        {/* Activity Name */}
        <div className="flex-1 flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-900 truncate">
            {activity.name}
          </span>
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-900 rounded-md whitespace-nowrap">
            Locked
          </span>
        </div>
      </div>
    </div>
  );
};
