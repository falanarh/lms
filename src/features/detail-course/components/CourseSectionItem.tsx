import { ChevronDown } from "lucide-react";
import { ActivityCard } from "./ActivityCard";
import { useContentsBySectionId } from "@/hooks/useContentsBySectionId";

interface Section {
  id: string;
  name: string;
  description: string;
  sequence: number;
}

interface CourseSectionItemProps {
  section: Section;
  index: number;
  isExpanded: boolean;
  onToggle: (sectionId: string) => void;
}

export const CourseSectionItem = ({
  section,
  index,
  isExpanded,
  onToggle,
}: CourseSectionItemProps) => {
  const { data: contents, isLoading: isContentsLoading } = useContentsBySectionId({
    sectionId: section.id,
    enabled: isExpanded,
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Section Header */}
      <button
        onClick={() => onToggle(section.id)}
        className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg border border-blue-600 border-2 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-bold text-base">
              {index + 1}
            </span>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 text-base">
              {section.name}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div className="">
          {isContentsLoading ? (
            <div className="p-6 text-center text-gray-500">
              Loading contents...
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {contents?.map((content) => (
                <ActivityCard
                  key={content.id}
                  activity={content}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
