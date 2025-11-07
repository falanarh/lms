"use client";

import { use, useState, useEffect } from "react";
import {
  CourseHeader,
  CourseTabNavigation,
  CourseInformationTab,
  DiscussionForumTab,
  RatingsReviewsTab,
  PageContainer,
} from "@/features/detail-course/components";
import { mockReviews } from "@/features/detail-course/constants/reviews";
import { mockEnrolledCourseDetail, mockEnrolledSections, mockEnrolledActivities } from "@/features/my-course/constant/mockEnrolledCourse";
import { CourseTabType } from "@/features/detail-course/types/tab";
import { ContentPlayer, CourseContentsTab, CourseContentsSidebar, SidebarToggleButton } from "@/features/my-course/components";
import { Content } from "@/api/contents";

interface MyCoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function MyCoursePage({ params }: MyCoursePageProps) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<CourseTabType>('information');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default: sidebar open

  // Menggunakan data dummy dari constants
  const course = mockEnrolledCourseDetail;
  const sections = mockEnrolledSections;
  const activities = mockEnrolledActivities;

  // Auto-select first content on mount
  useEffect(() => {
    const firstSection = sections[0];
    const firstContent = activities[firstSection?.id]?.[0];
    if (firstContent) {
      setSelectedContent(firstContent);
      setExpandedSections([firstSection.id]);
    }
  }, []);

  // Auto-switch tab ketika sidebar toggle
  useEffect(() => {
    if (isSidebarOpen && activeTab === 'course_contents') {
      // Jika sidebar dibuka dan user di tab course_contents, switch ke information
      setActiveTab('information');
    }
  }, [isSidebarOpen]);

  const handleToggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "My Courses", href: "/my-course" },
    { label: course.title, isActive: true },
  ];

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleOpenSidebar = () => {
    setIsSidebarOpen(true);
  };

  return (
    <>
      {/* Main Content with Dynamic Margin */}
      <div 
        className={`
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'lg:mr-[350px]' : 'mr-0'}
        `}
      >
        <PageContainer>
          <CourseHeader title={course.title} breadcrumbItems={breadcrumbItems} />

          {/* Content Player */}
          <ContentPlayer content={selectedContent} />

          {/* Tabs & Content */}
          <div className="space-y-6 pb-8 mt-8">
          <CourseTabNavigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            hiddenTabs={isSidebarOpen ? ['course_contents'] : []} 
          />

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
            <CourseContentsTab
              sections={sections}
              activities={activities}
              expandedSections={expandedSections}
              onToggleSection={handleToggleSection}
              selectedContentId={selectedContent?.id}
              onSelectContent={setSelectedContent}
            />
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
      </div>

      {/* Fixed Sidebar - Rendered outside main content */}
      {isSidebarOpen && (
        <CourseContentsSidebar
          sections={sections}
          activities={activities}
          expandedSections={expandedSections}
          onToggleSection={handleToggleSection}
          selectedContentId={selectedContent?.id}
          onSelectContent={setSelectedContent}
          onClose={handleCloseSidebar}
        />
      )}

      {/* Floating Toggle Button - Show when sidebar closed */}
      {!isSidebarOpen && (
        <SidebarToggleButton onClick={handleOpenSidebar} />
      )}
    </>
  );
}
