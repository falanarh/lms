import { CourseInfoCards } from "../CourseInfoCards";
import { CourseDescription } from "../CourseDescription";

interface CourseInformationTabProps {
  method: string;
  syllabusFile: string;
  totalJP: number;
  quota: number;
  description: string;
  zoomUrl?: string;
  isEnrolled?: boolean;
}

export const CourseInformationTab = ({
  method,
  syllabusFile,
  totalJP,
  quota,
  description,
  zoomUrl,
  isEnrolled = false,
}: CourseInformationTabProps) => {
  return (
    <div className="space-y-6">
      <CourseInfoCards
        method={method}
        syllabusFile={syllabusFile}
        totalJP={totalJP}
        quota={quota}
        zoomUrl={zoomUrl}
        isEnrolled={isEnrolled}
      />
      <CourseDescription description={description} />
    </div>
  );
};
