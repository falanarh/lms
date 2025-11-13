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
import { CourseTabType } from "@/features/detail-course/types/tab";
import { useGroupCourse } from "@/hooks/useGroupCourse";
import { useSectionsByGroupId } from "@/hooks/useSectionsByGroupId";
import { useContentsBySectionId } from "@/hooks/useContentsBySectionId";
import { ContentPlayer, ContentNavigation, CourseContentsTab, CourseContentsSidebar, SidebarToggleButton, RatingsReviewsHeader, WriteReviewModal, MyCoursePageSkeleton } from "@/features/my-course/components";
import { Content } from "@/api/contents";

interface MyCoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function MyCoursePage({ params }: MyCoursePageProps) {
  const { id } = use(params);
  const { data: course, isLoading, error } = useGroupCourse(id);
  const { data: sections, isLoading: isSectionsLoading } = useSectionsByGroupId({ groupId: id });
  const [activeTab, setActiveTab] = useState<CourseTabType>('information');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [completedContentIds, setCompletedContentIds] = useState<string[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isBootingContent, setIsBootingContent] = useState(false);

  // TODO: Remove activities logic since contents are now fetched per section
  // Auto-expand first section on mount
  useEffect(() => {
    const firstSection = sections?.[0];
    if (firstSection && expandedSections.length === 0) {
      setExpandedSections([firstSection.id]);
    }
  }, [sections]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsSidebarOpen(mq.matches);
  }, []);

  // Auto-switch tab ketika sidebar toggle
  useEffect(() => {
    if (isSidebarOpen && activeTab === 'course_contents') {
      setActiveTab('information');
    }
  }, [isSidebarOpen]);

  // Prefetch contents for first section and auto-select first content
  const firstSectionId = useMemo(() => sections?.[0]?.id ?? undefined, [sections]);

  const { data: firstSectionContents, isLoading: isLoadingFirstContents } = useContentsBySectionId({
    sectionId: firstSectionId || "",
    enabled: Boolean(firstSectionId) && !selectedContent,
  });

  useEffect(() => {
    // Start booting when we intend to prefetch first section contents
    if (firstSectionId && !selectedContent) {
      setIsBootingContent(true);
    }
  }, [firstSectionId, selectedContent]);

  useEffect(() => {
    if (!selectedContent && firstSectionContents && firstSectionContents.length > 0) {
      setSelectedContent(firstSectionContents[0]);
      setIsBootingContent(false);
    }
    if (firstSectionContents && firstSectionContents.length === 0) {
      setIsBootingContent(false);
    }
  }, [firstSectionContents, selectedContent]);

  // Handle expand/collapse section
  const handleToggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Navigation handlers - simplified for now
  const handlePrevious = () => {
    // TODO: Implement navigation when content structure is finalized
  };

  const handleNext = () => {
    // TODO: Implement navigation when content structure is finalized
  };

  const handleMarkAsDone = () => {
    if (!selectedContent) return;
    setCompletedContentIds(prev =>
      prev.includes(selectedContent.id)
        ? prev.filter(id => id !== selectedContent.id)
        : [...prev, selectedContent.id]
    );
  };

  // Check navigation availability - simplified
  const hasPrevious = false; // TODO: Implement when navigation is ready
  const hasNext = false; // TODO: Implement when navigation is ready
  const isCompleted = selectedContent ? completedContentIds.includes(selectedContent.id) : false;

  // Handle write review
  const handleWriteReview = () => {
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = (rating: number, review: string) => {
  };

  // Loading state: tunda render penuh sampai konten awal siap (jika ada section pertama)
  const isInitialContentRequired = Boolean(firstSectionId);
  const isInitialContentPending = isInitialContentRequired && !selectedContent && (isLoadingFirstContents || isBootingContent);

  if (isLoading || isSectionsLoading || !course || isInitialContentPending) {
    return <MyCoursePageSkeleton />;
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
              sections={sections || []}
              expandedSections={expandedSections}
              onToggleSection={handleToggleSection}
              selectedContentId={selectedContent?.id}
              onSelectContent={setSelectedContent}
              completedContentIds={completedContentIds}
              disableFetchFirstForIndexZero={isBootingContent || Boolean(selectedContent)}
            />
          )}

          {activeTab === "discussion_forum" && <DiscussionForumTab />}

            {activeTab === "ratings_reviews" && (
              <>
                <RatingsReviewsHeader onWriteReview={handleWriteReview} />
                
                <RatingsReviewsTab
                  groupCourseId={id}
                />
              </>
            )}
          </div>
        </PageContainer>
      </div>

      {isSidebarOpen && (
        <CourseContentsSidebar
          sections={sections || []}
          expandedSections={expandedSections}
          onToggleSection={handleToggleSection}
          selectedContentId={selectedContent?.id}
          onSelectContent={setSelectedContent}
          onClose={handleCloseSidebar}
          completedContentIds={completedContentIds}
          disableFetchFirstForIndexZero={isBootingContent || Boolean(selectedContent)}
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
