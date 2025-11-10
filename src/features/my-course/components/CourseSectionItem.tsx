import { ChevronDown, FileText, Video, Link as LinkIcon, Package, ClipboardList, FileCheck, File, Check } from "lucide-react";
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
  completedContentIds?: string[];
}

const getContentIcon = (type: string, isTabVariant: boolean = false) => {
  const boxSize = isTabVariant ? 'w-10 h-10' : 'w-6 h-6';
  const iconSize = isTabVariant ? 'w-5 h-5' : 'w-4 h-4';
  
  switch (type.toLowerCase()) {
    case "video":
      return (
        <div className={`${boxSize} rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0`}>
          <Video className={`${iconSize} text-blue-600`} />
        </div>
      );
    case "pdf":
      return (
        <div className={`${boxSize} rounded-md bg-red-100 flex items-center justify-center flex-shrink-0`}>
          <FileText className={`${iconSize} text-red-600`} />
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
          <FileCheck className={`${iconSize} text-orange-600`} />
        </div>
      );
    case "assignment":
      return (
        <div className={`${boxSize} rounded-md bg-green-100 flex items-center justify-center flex-shrink-0`}>
          <ClipboardList className={`${iconSize} text-green-600`} />
        </div>
      );
    default:
      return (
        <div className={`${boxSize} rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0`}>
          <File className={`${iconSize} text-gray-600`} />
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
  completedContentIds = [],
}: CourseSectionItemProps) => {
  const isTabVariant = variant === 'tab';
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Section Header */}
      <button
        onClick={() => onToggle(section.id)}
        className={`
          w-full flex items-center justify-between transition-colors duration-200
          ${isTabVariant ? 'p-5' : 'p-4'}
        `}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
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
          <div className="text-left flex-1 min-w-0">
            <h3 className={`
              font-semibold text-gray-900 truncate
              ${isTabVariant ? 'text-base' : 'text-sm'}
            `}>
              {section.name}
            </h3>
            {isTabVariant && section.description && (
              <p className="text-sm text-gray-500 mt-1 truncate">
                {section.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
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
              const isCompleted = completedContentIds.includes(content.id);
              
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
                  <div className="flex-1 text-left min-w-0">
                    <h4 className={`
                      font-medium truncate
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

                  {/* Completed Check Mark - Always reserve space in sidebar */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-600" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-5 h-5" />
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
