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
import { useGroupCourse } from "@/hooks/useGroupCourse";
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
  const { data: courseDetail, isLoading, error } = useGroupCourse(id);
  const { activeTab, setActiveTab } = useCourseTab(id);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const { data: sections, isLoading: isSectionsLoading } = useSectionsByGroupId({
    groupId: id,
    enabled: activeTab === "course_contents",
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
    { label: course.course.title, isActive: true },
  ];

  return (
    <PageContainer>
      <CourseBreadcrumb items={breadcrumbItems} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-4">
          <CourseThumbnail 
            thumbnail={course.course.thumbnail || undefined}
            title={course.course.title}
          />
          <CourseTitle title={course.course.title} />
        </div>

        <div className="space-y-4">
            <CourseInfoCard
              category={course.course.description.category}
              rating={course.rating}
              totalRatings={course.totalUserRating}
              type={course.course.typeCourse}
              isEnrolled={isEnrolled}
              onToggle={handleEnrollToggle}
              courseId={id}
            />
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="space-y-6 pb-8">
          <CourseTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "information" && (
            <CourseInformationTab
              method={course.course.description.method}
              syllabusFile={course.course.description.silabus}
              totalJP={course.course.description.totalJp}
              quota={course.course.description.quota}
              description={course.course.description.description}
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
              groupCourseId={id}
            />
          )}
        </div>
    </PageContainer>
    );
}
