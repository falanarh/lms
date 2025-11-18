"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { useContentNavigation } from "@/hooks/useContentNavigation";
import { useContentUrl } from "@/features/my-course/hooks/useContentUrl";
import { useCreateReview } from "@/hooks/useReviews";
import { ContentPlayer, ContentNavigation, CourseContentsTab, CourseContentsSidebar, SidebarToggleButton, RatingsReviewsHeader, WriteReviewModal, MyCoursePageSkeleton } from "@/features/my-course/components";
import { Content } from "@/api/contents";
import { mockGroupCourseDetailResponse, mockGroupCourseSectionsResponse } from "@/features/my-course/constant/mockLearningApi";
import { Section } from "@/api/sections";

interface MyCoursePageProps {
  params: {
    id: string;
  };
}

export default function MyCoursePage({ params }: MyCoursePageProps) {
  const { id } = params;
  const course = mockGroupCourseDetailResponse.data;
  const sections: Section[] = useMemo(() => {
    return mockGroupCourseSectionsResponse.listSection.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      sequence: s.sequence,
      createdAt: new Date("2024-02-01T00:00:00.000Z"),
      updatedAt: new Date("2024-07-01T00:00:00.000Z"),
      listContents: s.listContent,
    }));
  }, []);
  const { activeContentId, updateContentInUrl } = useContentUrl(id);
  const createReviewMutation = useCreateReview(id);
  const [activeTab, setActiveTab] = useState<CourseTabType>('information');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [completedContentIds, setCompletedContentIds] = useState<string[]>([]);
  const [expandedSectionsData, setExpandedSectionsData] = useState<Record<string, Content[]>>({});
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsSidebarOpen(mq.matches);
  }, []);

  // Menggunakan mock stabil, tidak perlu validasi try/catch

  useEffect(() => {
    const firstSection = sections?.[0];
    if (firstSection && expandedSections.length === 0) {
      setExpandedSections([firstSection.id]);
      const contents = firstSection.listContents || [];
      if (contents.length > 0) {
        setExpandedSectionsData((prev) => ({ ...prev, [firstSection.id]: contents }));
      }
    }
  }, [sections]);

  useEffect(() => {
    if (sections && sections.length > 0) {
      const ids: string[] = [];
      sections.forEach((sec: Section & { listContents?: any[] }) => {
        (sec.listContents || []).forEach((c: any) => {
          const hasFinished = Array.isArray(c.activityContents) && c.activityContents.some((a: any) => a?.isFinished);
          if (hasFinished) ids.push(c.id);
        });
      });
      setCompletedContentIds(ids);
    }
  }, [sections]);

  useEffect(() => {
    if (isSidebarOpen && activeTab === 'course_contents') {
      setActiveTab('information');
    }
  }, [isSidebarOpen]);

  const firstSectionContents = useMemo(() => sections?.[0]?.listContents || [], [sections]);

  useEffect(() => {
    const allData: Record<string, Content[]> = {};
    sections.forEach((sec) => {
      const contents = (sec as any).listContents || [];
      if (contents.length > 0) {
        allData[sec.id] = contents;
      }
    });
    if (Object.keys(allData).length > 0) {
      setExpandedSectionsData(allData);
    }
  }, [sections]);

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
    setExpandedSections(prev => {
      const next = prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId];
      if (!prev.includes(sectionId)) {
        const section = sections.find(s => s.id === sectionId);
        const contents = section?.listContents || [];
        if (contents.length > 0) {
          setExpandedSectionsData(prevData => ({ ...prevData, [sectionId]: contents }));
        }
      }
      return next;
    });
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

  const handleMarkContentDone = () => {
    if (!selectedContent) return;
    setCompletedContentIds((prev) => {
      if (prev.includes(selectedContent.id)) {
        return prev.filter((id) => id !== selectedContent.id);
      }
      return [...prev, selectedContent.id];
    });
  };

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

  if (error) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
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
              onMarkAsDone={handleMarkContentDone}
              isCompleted={completedContentIds.includes(selectedContent.id)}
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
              disableFetchFirstForIndexZero={true}
              disableFetchAll={true}
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
          disableFetchFirstForIndexZero={true}
          disableFetchAll={true}
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
