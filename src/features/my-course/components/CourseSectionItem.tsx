import { ChevronDown, FileText, Video, Link as LinkIcon, Package, ClipboardList, FileCheck } from "lucide-react";
import { Content } from "@/api/contents";

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
  contents: Content[];
  selectedContentId?: string;
  onSelectContent: (content: Content) => void;
  variant?: 'sidebar' | 'tab';
}

const getContentIcon = (type: string, isTabVariant: boolean = false) => {
  const boxSize = isTabVariant ? 'w-10 h-10' : 'w-6 h-6';
  const iconSize = isTabVariant ? 'w-5 h-5' : 'w-4 h-4';
  
  switch (type.toLowerCase()) {
    case "video":
      return (
        <div className={`${boxSize} rounded-md bg-red-100 flex items-center justify-center flex-shrink-0`}>
          <Video className={`${iconSize} text-red-600`} />
        </div>
      );
    case "pdf":
      return (
        <div className={`${boxSize} rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0`}>
          <FileText className={`${iconSize} text-blue-600`} />
        </div>
      );
    case "link":
      return (
        <div className={`${boxSize} rounded-md bg-green-100 flex items-center justify-center flex-shrink-0`}>
          <LinkIcon className={`${iconSize} text-green-600`} />
        </div>
      );
    case "scorm":
      return (
        <div className={`${boxSize} rounded-md bg-purple-100 flex items-center justify-center flex-shrink-0`}>
          <Package className={`${iconSize} text-purple-600`} />
        </div>
      );
    case "quiz":
      return (
        <div className={`${boxSize} rounded-md bg-orange-100 flex items-center justify-center flex-shrink-0`}>
          <ClipboardList className={`${iconSize} text-orange-600`} />
        </div>
      );
    case "assignment":
      return (
        <div className={`${boxSize} rounded-md bg-indigo-100 flex items-center justify-center flex-shrink-0`}>
          <FileCheck className={`${iconSize} text-indigo-600`} />
        </div>
      );
    default:
      return (
        <div className={`${boxSize} rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0`}>
          <FileText className={`${iconSize} text-gray-600`} />
        </div>
      );
  }
};

export const CourseSectionItem = ({
  section,
  index,
  isExpanded,
  onToggle,
  contents,
  selectedContentId,
  onSelectContent,
  variant = 'sidebar',
}: CourseSectionItemProps) => {
  const isTabVariant = variant === 'tab';
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Section Header */}
      <button
        onClick={() => onToggle(section.id)}
        className={`
          w-full flex items-center justify-between hover:bg-gray-50 transition-colors duration-200
          ${isTabVariant ? 'p-5' : 'p-4'}
        `}
      >
        <div className="flex items-center gap-4">
          <div className={`
            rounded-md border-2 border-blue-600 flex items-center justify-center flex-shrink-0
            ${isTabVariant ? 'w-8 h-8' : 'w-6 h-6'}
          `}>
            <span className={`
              text-blue-600 font-medium
              ${isTabVariant ? 'text-base' : 'text-sm'}
            `}>
              {index + 1}
            </span>
          </div>
          <div className="text-left">
            <h3 className={`
              font-semibold text-gray-900
              ${isTabVariant ? 'text-base' : 'text-sm'}
            `}>
              {section.name}
            </h3>
            {isTabVariant && section.description && (
              <p className="text-sm text-gray-500 mt-1">
                {section.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ChevronDown
            className={`
              text-gray-400 transition-transform duration-200
              ${isExpanded ? "rotate-180" : ""}
              ${isTabVariant ? 'w-5 h-5' : 'w-4 h-4'}
            `}
          />
        </div>
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div className="border-gray-200">
          <div className={`
            ${isTabVariant ? 'px-5 pb-3 space-y-3' : 'px-4 pb-2 space-y-2'}
          `}>
            {contents.map((content) => {
              const isSelected = selectedContentId === content.id;
              
              return (
                <button
                  key={content.id}
                  onClick={() => onSelectContent(content)}
                  className={`
                    w-full flex items-center gap-3 rounded-lg transition-all border
                    ${isTabVariant ? 'p-4' : 'p-3'}
                    ${isSelected 
                      ? 'bg-blue-50 border-blue-500' 
                      : 'border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }
                  `}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {getContentIcon(content.type, isTabVariant)}
                  </div>

                  {/* Content Info */}
                  <div className="flex-1 text-left">
                    <h4 className={`
                      font-medium
                      ${isTabVariant ? 'text-base' : 'text-sm'}
                      ${isSelected ? 'text-blue-900' : 'text-gray-900'}
                    `}>
                      {content.name}
                    </h4>
                    {isTabVariant && content.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {content.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
