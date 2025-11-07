"use client";

import { use, useState } from "react";
import {
  CourseHeader,
  CourseThumbnail,
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
    return <div>Error: {error.message}</div>;
  }

  const course = courseDetail[0];

  const handleEnrollToggle = () => {
    // Hanya handle enroll action, redirect sudah dihandle di CourseInfoCard
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
    { label: course.title, isActive: true },
  ];

  return (
    <PageContainer>
        <CourseHeader title={course.title} breadcrumbItems={breadcrumbItems} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Thumbnail */}
          <div className="lg:col-span-2">
            <CourseThumbnail 
              thumbnail={(course as any).thumbnail || "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=450&fit=crop"}
              trailerUrl={(course as any).trailerUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
              title={course.title} 
            />
          </div>

          {/* Course Info */}
          <div className="space-y-4">
            <CourseInfoCard
              category={course.kategori}
              rating={course.rating}
              totalRatings={course.total_user}
              type={course.type_course}
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
              method={course.metode}
              syllabusFile={course.silabus}
              totalJP={course.jp}
              quota={course.kuota}
              description={course.description}
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
              averageRating={course.rating}
              totalRatings={mockReviews.length}
              ratingDistribution={{5: 2, 4: 1, 3: 0, 2: 0, 1: 0}}
              reviews={mockReviews}
            />
          )}
        </div>
    </PageContainer>
    );
}
