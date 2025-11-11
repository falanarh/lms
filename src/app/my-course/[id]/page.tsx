"use client";

import { use, useState, useEffect, useMemo } from "react";
import {
  CourseBreadcrumb,
  CourseTitle,
  CourseTabNavigation,
  CourseInformationTab,
  DiscussionForumTab,
  RatingsReviewsTab,
  PageContainer,
} from "@/features/detail-course/components";
import { mockReviews } from "@/features/detail-course/constants/reviews";
import { mockEnrolledSections, mockEnrolledActivities } from "@/features/my-course/constant/mockEnrolledCourse";
import { CourseTabType } from "@/features/detail-course/types/tab";
import { useGroupCourse } from "@/hooks/useGroupCourse";
import { ContentPlayer, ContentNavigation, CourseContentsTab, CourseContentsSidebar, SidebarToggleButton, RatingsReviewsHeader, WriteReviewModal } from "@/features/my-course/components";
import { Content } from "@/api/contents";

interface MyCoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function MyCoursePage({ params }: MyCoursePageProps) {
  const { id } = use(params);
  const { data: course, isLoading, error } = useGroupCourse(id);
  const [activeTab, setActiveTab] = useState<CourseTabType>('information');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [completedContentIds, setCompletedContentIds] = useState<string[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // TODO: Replace with API when sections endpoint is ready
  const sections = mockEnrolledSections;
  const activities = mockEnrolledActivities;

  // Flatten all contents for navigation
  const allContents = useMemo(() => {
    return sections.flatMap(section => activities[section.id] || []);
  }, [sections, activities]);

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
      setActiveTab('information');
    }
  }, [isSidebarOpen]);

  // Handle expand/collapse section
  const handleToggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Navigation handlers
  const handlePrevious = () => {
    if (!selectedContent) return;
    const currentIndex = allContents.findIndex(c => c.id === selectedContent.id);
    if (currentIndex > 0) {
      setSelectedContent(allContents[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (!selectedContent) return;
    const currentIndex = allContents.findIndex(c => c.id === selectedContent.id);
    if (currentIndex < allContents.length - 1) {
      setSelectedContent(allContents[currentIndex + 1]);
    }
  };

  const handleMarkAsDone = () => {
    if (!selectedContent) return;
    setCompletedContentIds(prev =>
      prev.includes(selectedContent.id)
        ? prev.filter(id => id !== selectedContent.id)
        : [...prev, selectedContent.id]
    );
  };

  // Check navigation availability
  const currentIndex = selectedContent ? allContents.findIndex(c => c.id === selectedContent.id) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allContents.length - 1;
  const isCompleted = selectedContent ? completedContentIds.includes(selectedContent.id) : false;

  // Handle write review
  const handleWriteReview = () => {
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = (rating: number, review: string) => {
  };

  // Loading state
  if (isLoading || !course) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Error state
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

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "My Courses", href: "/my-course" },
    { label: course.course.title, isActive: true },
  ];

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleOpenSidebar = () => {
    setIsSidebarOpen(true);
  };

  return (
    <>
      <div 
        className={`
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'lg:mr-[300px] xl:mr-[350px] 2xl:mr-[400px]' : 'mr-0'}
        `}
      >
        <PageContainer>
          <CourseBreadcrumb items={breadcrumbItems} />

          <ContentPlayer content={selectedContent} isSidebarOpen={isSidebarOpen} />

          {/* Navigation Buttons */}
          {selectedContent && (
            <ContentNavigation
              onPrevious={handlePrevious}
              onNext={handleNext}
              onMarkAsDone={handleMarkAsDone}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
              isCompleted={isCompleted}
            />
          )}

          <CourseTitle title={course.course.title} />

          {/* Tabs & Content */}
          <div className="space-y-6 pb-8 mt-8">
          <CourseTabNavigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            hiddenTabs={isSidebarOpen ? ['course_contents'] : []} 
          />

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
            <CourseContentsTab
              sections={sections}
              activities={activities}
              expandedSections={expandedSections}
              onToggleSection={handleToggleSection}
              selectedContentId={selectedContent?.id}
              onSelectContent={setSelectedContent}
              completedContentIds={completedContentIds}
            />
          )}

          {activeTab === "discussion_forum" && <DiscussionForumTab />}

            {activeTab === "ratings_reviews" && (
              <>
                <RatingsReviewsHeader onWriteReview={handleWriteReview} />
                
                <RatingsReviewsTab
                  averageRating={course.rating}
                  totalRatings={mockReviews.length}
                  ratingDistribution={{5: 2, 4: 1, 3: 3, 2: 0, 1: 0}}
                  reviews={mockReviews}
                />
              </>
            )}
          </div>
        </PageContainer>
      </div>

      {isSidebarOpen && (
        <CourseContentsSidebar
          sections={sections}
          activities={activities}
          expandedSections={expandedSections}
          onToggleSection={handleToggleSection}
          selectedContentId={selectedContent?.id}
          onSelectContent={setSelectedContent}
          onClose={handleCloseSidebar}
          completedContentIds={completedContentIds}
        />
      )}

      {/* Floating Toggle Button */}
      {!isSidebarOpen && (
        <SidebarToggleButton onClick={handleOpenSidebar} />
      )}

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleSubmitReview}
        courseName={course.course.title}
      />
    </>
  );
}
