"use client";

import { useState } from "react";
import { mockCourseDetail, mockReviews } from "@/features/detail-course/constants";
import {
  CourseHeader,
  CourseThumbnail,
  CourseInfoCard,
  EnrollButton,
  CourseTabNavigation,
  CourseInformationTab,
  CourseContentsTab,
  DiscussionForumTab,
  RatingsReviewsTab,
} from "@/features/detail-course/components";

interface DetailCoursePageProps {
  params: {
    id: string;
  };
}

export default function DetailCoursePage({ params }: DetailCoursePageProps) {
  const course = mockCourseDetail;
  const [activeTab, setActiveTab] = useState("information");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
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
            <CourseThumbnail thumbnail={course.thumbnail} title={course.title} />
          </div>

          {/* Course Info */}
          <div className="space-y-4">
            <CourseInfoCard
              category={course.category}
              rating={course.rating}
              totalRatings={course.totalRatings}
              teacher={course.teacher}
              enrolled={course.enrolled}
              type={course.type}
            />
            <EnrollButton
              isEnrolled={isEnrolled}
              onToggle={() => setIsEnrolled(!isEnrolled)}
            />
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="space-y-6 pb-8">
          <CourseTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content - Information */}
          {activeTab === "information" && (
            <CourseInformationTab
              method={course.method}
              syllabusFile={course.syllabusFile}
              zoomLink={course.zoomLink}
              quota={course.quota}
              description={course.description}
            />
          )}

          {/* Tab Content - Course Contents */}
          {activeTab === "course_contents" && (
            <CourseContentsTab
              sections={course.sections}
              isEnrolled={isEnrolled}
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
            />
          )}

          {/* Tab Content - Discussion Forum */}
          {activeTab === "discussion_forum" && <DiscussionForumTab />}

          {/* Tab Content - Ratings & Reviews */}
          {activeTab === "ratings_reviews" && (
            <RatingsReviewsTab
              averageRating={course.rating}
              totalRatings={course.totalRatings}
              ratingDistribution={course.ratingDistribution}
              reviews={mockReviews}
            />
          )}
        </div>
      </div>
    </div>
  );
}
