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
} from "@/features/detail-course/components";
import { useCourse } from "@/hooks/useCourse";
import { useCourseTab } from "@/features/detail-course/hooks/useCourseTab";
import { CourseLayout } from "@/features/course/components";

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

  if (isLoading || !courseDetail) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const course = courseDetail[0];

  const handleEnrollToggle = () => {
    setIsEnrolled(!isEnrolled);
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "All Courses", href: "/course" },
    { label: course.title, isActive: true },
  ];

  return (
    <CourseLayout>
        {/* Header */}
        <CourseHeader title={course.title} breadcrumbItems={breadcrumbItems} />

        {/* Thumbnail & Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Thumbnail */}
          <div className="lg:col-span-2">
            <CourseThumbnail thumbnail={course.thumbnail} title={course.title} />
          </div>

          {/* Course Info */}
          <div className="space-y-4">
            <CourseInfoCard
              category={course.description.category}
              rating={course.averageRating}
              totalRatings={course.totalUsers}
              isEnrolled={isEnrolled}
              type={course.typeCourse}
              onToggle={handleEnrollToggle}
            />
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="space-y-6 pb-8">
          <CourseTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "information" && (
            <CourseInformationTab
              method={course.description.method}
              syllabusFile=""
              zoomLink=""
              quota={course.description.quota}
              description={course.description.description}
            />
          )}

          {activeTab === "course_contents" && (
            <CourseContentsTab
              sections={[]}
              isEnrolled={isEnrolled}
              expandedSections={[]}
              onToggleSection={() => {}}
            />
          )}

          {activeTab === "discussion_forum" && <DiscussionForumTab />}

          {activeTab === "ratings_reviews" && (
            <RatingsReviewsTab
              averageRating={course.averageRating}
              totalRatings={course.totalUsers}
              ratingDistribution={{ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }}
              reviews={[]}
            />
          )}
        </div>
      </CourseLayout>
    );
}
