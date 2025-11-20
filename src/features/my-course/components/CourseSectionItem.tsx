import { useEffect, useState } from "react";
import { ChevronDown, FileText, Video, Link as LinkIcon, Package, ClipboardList, FileCheck, File, Check, Lock } from "lucide-react";
import type { Content } from "@/api/contents";
import type { Section } from "@/api/sections";

interface CourseSectionItemProps {
  section: Section;
  index: number;
  isExpanded: boolean;
  onToggle: (sectionId: string) => void;
  selectedContentId?: string;
  onSelectContent?: (content: Content) => void;
  variant?: 'sidebar' | 'tab';
  completedContentIds?: string[];
  mode?: 'preview' | 'learning'; // preview = detail-course, learning = my-course
  onSectionDataUpdate?: (sectionId: string, contents: Content[]) => void;
  lockedContentIds?: string[];
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
          <ClipboardList className={`${iconSize} text-orange-600`} />
        </div>
      );
    case "task":
      return (
        <div className={`${boxSize} rounded-md bg-green-100 flex items-center justify-center flex-shrink-0`}>
          <FileCheck className={`${iconSize} text-green-600`} />
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
  selectedContentId,
  onSelectContent,
  variant = 'sidebar',
  completedContentIds = [],
  mode = 'learning',
  onSectionDataUpdate,
  lockedContentIds = [],
}: CourseSectionItemProps) => {
  const isTabVariant = variant === 'tab';
  const isPreviewMode = mode === 'preview';
  const isLearningMode = mode === 'learning';
  
  const providedContents = (section as any).listContents || (section as any).listContent || [];
  const contents: Content[] | undefined = providedContents;

  // Update parent component's expandedSectionsData when contents are fetched
  useEffect(() => {
    if (contents && isExpanded && onSectionDataUpdate) {
      onSectionDataUpdate(section.id, contents);
    }
  }, [contents, isExpanded, section.id, onSectionDataUpdate]);

  useEffect(() => {
    if (
      isExpanded &&
      isLearningMode &&
      index === 0 &&
      !selectedContentId &&
      contents &&
      contents.length > 0
    ) {
      onSelectContent?.(contents[0]);
    }
  }, [isExpanded, isLearningMode, index, selectedContentId, contents, onSelectContent]);
  return (
    <div className={`bg-white rounded-xl overflow-hidden border border-gray-200`}>
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
              <p className="text-sm text-gray-500 mt-1 ">
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
            ${isTabVariant ? 'px-5 pb-3 space-y-3' : 'px-0 pb-0 space-y-2'}
          `}>
            {contents && contents.length > 0 ? (
              contents.map((content) => {
              const isSelected = selectedContentId === content.id;
              const isCompleted = completedContentIds.includes(content.id);
              const isLocked = lockedContentIds.includes(content.id);
              
              return (
                <button
                  key={content.id}
                  onClick={() => (isLearningMode && !isLocked) ? onSelectContent?.(content) : undefined}
                  disabled={isPreviewMode || isLocked}
                  className={`
                    w-full flex items-center gap-3 transition-all ${isTabVariant ? 'rounded-lg border' : 'rounded-none'}
                    ${isTabVariant ? 'p-4' : 'pr-4 pl-8 py-3'}
                    ${isLearningMode 
                      ? (isLocked 
                        ? (isTabVariant ? 'cursor-not-allowed opacity-60' : 'cursor-not-allowed opacity-60')
                        : (isTabVariant ? 'hover:bg-gray-100 hover:border-gray-300 cursor-pointer' : 'hover:bg-gray-100 cursor-pointer')) 
                      : 'cursor-default opacity-75'
                    }
                    ${isSelected && isLearningMode
                      ? (isTabVariant ? 'bg-blue-50 border-blue-500' : 'bg-blue-50') 
                      : (isTabVariant ? 'border-gray-200' : '')
                    }
                  `}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {isPreviewMode ? (
                      <Lock className={`${isTabVariant ? 'w-4 h-5' : 'w-3 h-3'} text-gray-500`} />
                    ) : (
                      getContentIcon(content.type, isTabVariant)
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="flex-1 text-left min-w-0">
                    <h4 className={`
                      font-medium truncate
                      ${isTabVariant ? 'text-base' : 'text-sm'}
                      ${isPreviewMode 
                        ? 'text-gray-500' 
                        : isSelected ? 'text-blue-900' : 'text-gray-900'
                      }
                    `}>
                      {content.name}
                    </h4>
                    {isLearningMode && isTabVariant && content.description && (
                      <p className="hidden md:block text-sm text-gray-500 mt-1">
                        {content.description}
                      </p>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <div className={`${isTabVariant ? 'w-6 h-6' : 'w-4 h-4'} rounded-full bg-green-200 flex items-center justify-center`}>
                        <Check className={`${isTabVariant ? 'w-4 h-4' : 'w-3 h-3'} text-green-600`} strokeWidth={3} />
                      </div>
                    ) : isLocked ? (
                      <Lock className={`${isTabVariant ? 'w-5 h-5' : 'w-4 h-4'} text-gray-500`} strokeWidth={3} />
                    ) : (
                      <div className={`${isTabVariant ? 'w-6 h-6' : 'w-4 h-4'}`} />
                    )}
                  </div>
                </button>
              );
            })
            ) : (
              <div className="flex items-center justify-center py-4">
                <div className="text-sm text-gray-500">No contents available</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
