import { CourseContentsTab as UnifiedCourseContentsTab } from "@/features/my-course/components/CourseContentsTab";
import type { Section } from "@/api/sections";

interface CourseContentsTabProps {
  sections: Section[] | any[];
  expandedSections: string[];
  onToggleSection: (sectionId: string) => void;
}

export const CourseContentsTab = ({
  sections,
  expandedSections,
  onToggleSection,
}: CourseContentsTabProps) => {
  return (
    <UnifiedCourseContentsTab
      sections={sections as any}
      expandedSections={expandedSections}
      onToggleSection={onToggleSection}
      mode="preview"
    />
  );
};
