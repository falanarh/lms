"use client";

import { use, useState } from "react";
import {
  CourseBreadcrumb,
  CourseThumbnail,
  CourseTitle,
  CourseInfoCard,
  CourseTabNavigation,
  CourseInformationTab,
  CourseContentsTab,
  DiscussionForumTab,
  RatingsReviewsTab,
  PageContainer,
  DetailCourseSkeleton,
} from "@/features/detail-course/components";
import { useCourse } from "@/hooks/useCourse";
import { useCourseTab } from "@/features/detail-course/hooks/useCourseTab";
import { useSectionsByGroupId } from "@/hooks/useSectionsByGroupId";
import { mockReviews } from "@/features/detail-course/constants/reviews";

interface DetailCoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function DetailCoursePage({ params }: DetailCoursePageProps) {
  const { id } = use(params);
  const { data: courseDetail, isLoading, error } = useCourse(id);
  const { activeTab, setActiveTab } = useCourseTab(id);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const { data: sections, isLoading: isSectionsLoading } = useSectionsByGroupId({
    groupId: courseDetail?.groupCourse?.id ?? "",
    enabled: activeTab === "course_contents" && Boolean(courseDetail?.groupCourse?.id),
  });

  if (isLoading || !courseDetail) {
    return (
      <PageContainer>
        <DetailCourseSkeleton />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Course</h2>
            <p className="text-gray-600">{error.message}</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const course = courseDetail;

  const handleEnrollToggle = () => {
    setIsEnrolled(true);
  };

  const handleToggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "All Courses", href: "/course" },
    { label: course.groupCourse.title, isActive: true },
  ];

  return (
    <PageContainer>
      <CourseBreadcrumb items={breadcrumbItems} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-4">
          <CourseThumbnail 
            thumbnail={course.groupCourse.thumbnail || undefined}
            title={course.groupCourse.title}
          />
          <CourseTitle title={course.groupCourse.title} />
        </div>

        <div className="space-y-4">
            <CourseInfoCard
              category={course.groupCourse.description.category}
              rating={course.rating}
              totalRatings={course.totalUserRating}
              type={course.groupCourse.typeCourse}
              isEnrolled={isEnrolled}
              onToggle={handleEnrollToggle}
              courseId={course.groupCourse.id}
            />
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="space-y-6 pb-8">
          <CourseTabNavigation activeTab={activeTab} onTabChange={setActiveTab} hiddenTabs={["summary"]} />

          {activeTab === "information" && (
            <CourseInformationTab
              method={course.groupCourse.description.method}
              syllabusFile={course.groupCourse.description.silabus}
              totalJP={course.groupCourse.description.totalJp}
              quota={course.groupCourse.description.quota}
              description={course.groupCourse.description.description}
              zoomUrl={course.zoomUrl || undefined}
              isEnrolled={false}
            />
          )}

          {activeTab === "course_contents" && (
            isSectionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading sections...</div>
              </div>
            ) : (
              <CourseContentsTab
                sections={sections || []}
                expandedSections={expandedSections}
                onToggleSection={handleToggleSection}
              />
            )
          )}

          {activeTab === "discussion_forum" && <DiscussionForumTab />}

          {activeTab === "ratings_reviews" && (
            <RatingsReviewsTab
              courseId={id}
            />
          )}
        </div>
    </PageContainer>
    );
}
