import {
  PlayCircle,
  File,
  Package,
  CircleCheck,
  ClipboardList,
  FileText,
  Lock,
} from "lucide-react";

interface Activity {
  id: string;
  type: string;
  name: string;
  restrictAccess: boolean;
}

interface ActivityCardProps {
  activity: Activity;
  isEnrolled: boolean;
}

// Get activity icon based on type and lock status
const getActivityIcon = (type: string, isLocked: boolean) => {
  if (isLocked) {
    return <Lock className="w-5 h-5" />;
  }

  switch (type) {
    case "video":
      return <PlayCircle className="w-5 h-5" />;
    case "pdf":
      return <File className="w-5 h-5" />;
    case "scorm":
      return <Package className="w-5 h-5" />;
    case "quiz":
      return <CircleCheck className="w-5 h-5" />;
    case "assignment":
      return <ClipboardList className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
};

// Get activity color based on type
const getActivityColor = (type: string) => {
  switch (type) {
    case "video":
      return "text-blue-60 bg-blue-600";
    case "pdf":
      return "text-red-60 bg-red-600";
    case "scorm":
      return "text-purple-60 bg-purple-600";
    case "quiz":
      return "text-green-60 bg-green-600";
    case "assignment":
      return "text-green-60 bg-green-600";
    default:
      return "text-blue-60 bg-blue-600";
  }
};

export const ActivityCard = ({ activity, isEnrolled }: ActivityCardProps) => {
  const isLocked = !isEnrolled && activity.restrictAccess;
  const colorClasses = getActivityColor(activity.type);

  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 p-3 transition-all duration-200
        ${
          isLocked
            ? "cursor-not-allowed"
            : "hover:shadow-sm hover:bg-blue-50 cursor-pointer"
        }
      `}
      title={isLocked ? "Enroll to access this content" : ""}
    >
      <div className="flex items-center gap-3">
        {/* Activity Icon */}
        <div
          className={`
          w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border
          ${isLocked ? "bg-gray-100 border-gray-300 text-gray-600" : colorClasses}
        `}
        >
          {getActivityIcon(activity.type, isLocked)}
        </div>

        {/* Activity Name */}
        <div className="flex-1 flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-900 truncate">
            {activity.name}
          </span>
          {isLocked && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-900 rounded-md whitespace-nowrap">
              Locked
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
