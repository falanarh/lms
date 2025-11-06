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
import { useGroupCourse } from "@/hooks/useGroupCourse";
import { useCourseTab } from "@/features/detail-course/hooks/useCourseTab";

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
    <div className="min-h-screen">
        <div className="px-6 sm:px-8 lg:px-12 xl:px-16">
        {/* Header */}
        <CourseHeader title={course.title} breadcrumbItems={breadcrumbItems} />

        {/* Thumbnail & Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Thumbnail */}
          <div className="lg:col-span-2">
            <CourseThumbnail 
              thumbnail={(course as any).thumbnail || "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=450&fit=crop"} 
              title={course.title} 
            />
          </div>

          {/* Course Info */}
          <div className="space-y-4">
            <CourseInfoCard
              category={course.kategori}
              rating={course.rating}
              totalRatings={course.total_user}
              isEnrolled={isEnrolled}
              type={course.type_course}
              onToggle={handleEnrollToggle}
            />
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="space-y-6 pb-8">
          <CourseTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "information" && (
            <CourseInformationTab
              method={course.metode}
              syllabusFile=""
              totalJP={course.jp}
              quota={course.kuota}
              description={course.description}
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
              averageRating={course.rating}
              totalRatings={course.total_user}
              ratingDistribution={{ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }}
              reviews={[]}
            />
          )}
        </div>
      </div>
    </div>
    );
}
