"use client";

import { use, useState, useEffect, useMemo, useCallback } from "react";
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
import { useContentNavigation } from "@/hooks/useContentNavigation";
import { useContentsBySectionId } from "@/hooks/useContentsBySectionId";
import { useContentUrl } from "@/features/my-course/hooks/useContentUrl";
import { useCreateReview } from "@/hooks/useReviews";
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
  const { activeContentId, updateContentInUrl } = useContentUrl(id);
  const createReviewMutation = useCreateReview(id);
  const [activeTab, setActiveTab] = useState<CourseTabType>('information');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [completedContentIds, setCompletedContentIds] = useState<string[]>([]);
  const [expandedSectionsData, setExpandedSectionsData] = useState<Record<string, Content[]>>({});
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsSidebarOpen(mq.matches);
  }, []);

  useEffect(() => {
    const firstSection = sections?.[0];
    if (firstSection && expandedSections.length === 0) {
      setExpandedSections([firstSection.id]);
    }
  }, [sections]);

  useEffect(() => {
    if (isSidebarOpen && activeTab === 'course_contents') {
      setActiveTab('information');
    }
  }, [isSidebarOpen]);

  // Prefetch first section and auto-select first content
  const firstSectionId = useMemo(() => sections?.[0]?.id ?? undefined, [sections]);

  const { data: firstSectionContents, isLoading: isLoadingFirstContents } = useContentsBySectionId({
    sectionId: firstSectionId || "",
    enabled: Boolean(firstSectionId) && !selectedContent,
  });

  // Restore content from URL on page load
  useEffect(() => {
    if (activeContentId && expandedSectionsData) {
      // Find content by ID across all sections
      for (const sectionContents of Object.values(expandedSectionsData)) {
        const foundContent = sectionContents.find(content => content.id === activeContentId);
        if (foundContent && foundContent.id !== selectedContent?.id) {
          setSelectedContent(foundContent);
          return;
        }
      }
    }
  }, [activeContentId, expandedSectionsData, selectedContent?.id]);

  // Auto-select first content if no content is selected and no URL content ID
  useEffect(() => {
    if (!selectedContent && !activeContentId && firstSectionContents && firstSectionContents.length > 0) {
      const contentToSelect = firstSectionContents[0];
      setSelectedContent(contentToSelect);
      updateContentInUrl(contentToSelect);
    }
  }, [firstSectionContents, selectedContent, activeContentId, updateContentInUrl]);

  // Handle expand/collapse section
  const handleToggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Enhanced content selection handler that syncs with URL
  const handleContentSelect = useCallback((content: Content) => {
    setSelectedContent(content);
    updateContentInUrl(content);
  }, [updateContentInUrl]);

  // Navigation system
  const handleSectionDataUpdate = useCallback((sectionId: string, contents: Content[]) => {
    setExpandedSectionsData(prev => {
      // Prevent unnecessary updates if data is the same
      if (prev[sectionId] && prev[sectionId].length === contents.length) {
        const isSame = prev[sectionId].every((content, index) => content.id === contents[index]?.id);
        if (isSame) return prev;
      }
      
      return {
        ...prev,
        [sectionId]: contents,
      };
    });
  }, []);

  const { handleNext, handlePrevious, isNavigating, navigationState } = useContentNavigation({
    sections: sections || [],
    selectedContent,
    expandedSectionsData,
    onContentSelect: handleContentSelect,
    onSectionDataUpdate: handleSectionDataUpdate,
  });

  const handleWriteReview = () => {
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (rating: number, review: string) => {
    try {
      await createReviewMutation.mutateAsync({
        rating,
        comment: review,
      });
      setIsReviewModalOpen(false);
      alert('Ulasan berhasil dikirim!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Gagal mengirim ulasan. Silakan coba lagi.');
    }
  };

  const isPageLoading = isLoading || isSectionsLoading || !course;
  const isWaitingForInitialContent = !selectedContent && (sections?.length ?? 0) > 0 && isLoadingFirstContents;

  if (isPageLoading || isWaitingForInitialContent) {
    return <MyCoursePageSkeleton />;
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

          {selectedContent && (
            <ContentNavigation
              onPrevious={handlePrevious}
              onNext={handleNext}
              hasPrevious={navigationState.hasPrevious}
              hasNext={navigationState.hasNext}
              isNavigating={isNavigating}
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
              onSelectContent={handleContentSelect}
              completedContentIds={completedContentIds}
              disableFetchFirstForIndexZero={Boolean(selectedContent)}
              onSectionDataUpdate={handleSectionDataUpdate}
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
          onSelectContent={handleContentSelect}
          onClose={handleCloseSidebar}
          completedContentIds={completedContentIds}
          disableFetchFirstForIndexZero={Boolean(selectedContent)}
          onSectionDataUpdate={handleSectionDataUpdate}
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
        isLoading={createReviewMutation.isPending}
      />
    </>
  );
}
