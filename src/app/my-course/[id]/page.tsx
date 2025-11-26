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
import { useContentNavigation } from "@/hooks/useContentNavigation";
import { useContentUrl } from "@/features/my-course/hooks/useContentUrl";
import { useCreateReview } from "@/hooks/useReviews";
import {
  ContentPlayer,
  ContentNavigation,
  CourseContentsTab,
  CourseContentsSidebar,
  SidebarToggleButton,
  RatingsReviewsHeader,
  WriteReviewModal,
  MyCoursePageSkeleton,
  SummaryTab,
} from "@/features/my-course/components";
import { Sparkles } from "lucide-react";
import { Toast } from "@/components/ui/Toast/Toast";
import { createToastState } from "@/utils/toastUtils";
import type { Content } from "@/api/contents";
import { useSectionContent } from "@/hooks/useSectionContent";
import { useCourse } from "@/hooks/useCourse";
import {
  useStartActivityContent,
  useFinishActivityContent,
} from "@/hooks/useActivityContents";
import { DUMMY_USER_ID } from "@/config/api";

interface MyCoursePageProps {
  params: Promise<{ id: string }>;
}

export default function MyCoursePage({ params }: MyCoursePageProps) {
  const { id } = use(params);
  const {
    data: courseDetail,
    isLoading: isCourseLoading,
    error,
  } = useCourse(id);
  const { data: sectionContent } = useSectionContent({ courseId: id });
  const sections = useMemo(() => {
    const rawSections = (sectionContent?.data?.listSection as any) || [];
    return [...rawSections].sort(
      (a: any, b: any) => (a?.sequence ?? 0) - (b?.sequence ?? 0)
    );
  }, [sectionContent]);
  const { activeContentId, updateContentInUrl } = useContentUrl(id);
  const createReviewMutation = useCreateReview(id);
  const [activeTab, setActiveTab] = useState<CourseTabType>("information");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [completedContentIds, setCompletedContentIds] = useState<string[]>([]);
  const [startedContentIds, setStartedContentIds] = useState<string[]>([]);
  const [expandedSectionsData, setExpandedSectionsData] = useState<
    Record<string, Content[]>
  >({});
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [lockedContentIds, setLockedContentIds] = useState<string[]>([]);
  const [taskSubmissionStatus, setTaskSubmissionStatus] = useState<
    Record<string, boolean>
  >({});
  const [isUrlResolved, setIsUrlResolved] = useState(false);
  const toastState = createToastState();
  const orderedContents = useMemo(() => {
    const secList: any[] = Array.isArray(sections) ? [...sections] : [];
    secList.sort((a, b) => (a?.sequence ?? 0) - (b?.sequence ?? 0));
    const flattened: Content[] = [];
    secList.forEach((sec: any) => {
      const contents = (
        (expandedSectionsData[sec.id] ||
          sec.listContents ||
          sec.listContent ||
          []) as Content[]
      ).slice();
      contents.sort(
        (a: any, b: any) => (a?.sequence ?? 0) - (b?.sequence ?? 0)
      );
      contents.forEach((c) => flattened.push(c));
    });
    return flattened;
  }, [sections, expandedSectionsData]);

  const unlockedContentId = useMemo(() => {
    for (const c of orderedContents) {
      const finished = Boolean((c as any)?.userStatus?.isFinished);
      if (!finished) return c.id;
    }
    return null;
  }, [orderedContents]);

  const startContentMutation = useStartActivityContent();
  const finishContentMutation = useFinishActivityContent();

  const course = courseDetail!;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsSidebarOpen(mq.matches);
  }, []);

  useEffect(() => {
    const firstSection = sections?.[0];
    if (firstSection && expandedSections.length === 0) {
      setExpandedSections([firstSection.id]);
      const contents =
        (firstSection as any).listContents ||
        (firstSection as any).listContent ||
        [];
      if (contents.length > 0) {
        const sortedContents = [...contents].sort(
          (a: any, b: any) => (a?.sequence ?? 0) - (b?.sequence ?? 0)
        );
        setExpandedSectionsData((prev) => ({
          ...prev,
          [firstSection.id]: sortedContents,
        }));
      }
    }
  }, [sections]);

  useEffect(() => {
    if (sections && sections.length > 0) {
      const ids: string[] = [];
      sections.forEach((sec: any) => {
        const contents = (sec.listContents || sec.listContent || []) as any[];
        contents.forEach((c: any) => {
          const hasFinished = Boolean(c?.userStatus?.isFinished);
          if (hasFinished) ids.push(c.id);
        });
      });
      setCompletedContentIds(ids);
    }
  }, [sections]);

  useEffect(() => {
    const locked: string[] = [];
    orderedContents.forEach((c: any) => {
      const finished = Boolean(c?.userStatus?.isFinished);
      const isUnlocked = unlockedContentId && c.id === unlockedContentId;
      if (!finished && !isUnlocked) locked.push(c.id);
    });
    setLockedContentIds(locked);
  }, [orderedContents, unlockedContentId]);

  useEffect(() => {
    if (isSidebarOpen && activeTab === "course_contents") {
      setActiveTab("information");
    }
  }, [isSidebarOpen]);

  const firstSectionContents = useMemo(() => {
    const s0 = sections?.[0] as any;
    return s0?.listContents || s0?.listContent || [];
  }, [sections]);

  useEffect(() => {
    const allData: Record<string, Content[]> = {};
    if (Array.isArray(sections)) {
      sections.forEach((sec: any) => {
        const contents = (sec.listContents ||
          sec.listContent ||
          []) as Content[];
        if (contents.length > 0) {
          const sortedContents = [...contents].sort(
            (a: any, b: any) => (a?.sequence ?? 0) - (b?.sequence ?? 0)
          );
          allData[sec.id] = sortedContents;
        }
      });
      if (Object.keys(allData).length > 0) {
        setExpandedSectionsData(allData);
      }
    }
  }, [sections]);

  // Restore content from URL on page load
  useEffect(() => {
    if (activeContentId && expandedSectionsData) {
      // Find content by ID across all sections
      for (const sectionContents of Object.values(expandedSectionsData)) {
        const foundContent = sectionContents.find(
          (content) => content.id === activeContentId
        );
        if (foundContent && foundContent.id !== selectedContent?.id) {
          setSelectedContent(foundContent);
          return;
        }
      }
    }
    if (!isUrlResolved) {
      setIsUrlResolved(true);
    }
  }, [activeContentId, expandedSectionsData, selectedContent?.id]);

  // Auto-select first content if no content is selected and no URL content ID
  useEffect(() => {
    if (!isUrlResolved) return;
    if (!selectedContent && !activeContentId) {
      let contentToSelect: Content | null = null;
      if (unlockedContentId) {
        contentToSelect =
          orderedContents.find((c) => c.id === unlockedContentId) || null;
      } else if (orderedContents.length > 0) {
        contentToSelect = orderedContents[0] || null;
      }
      if (contentToSelect) {
        setSelectedContent(contentToSelect);
        updateContentInUrl(contentToSelect);
      }
    }
  }, [
    orderedContents,
    unlockedContentId,
    selectedContent,
    activeContentId,
    updateContentInUrl,
    isUrlResolved,
  ]);

  useEffect(() => {
    if (!selectedContent) return;
    if (completedContentIds.includes(selectedContent.id)) return;
    if (startedContentIds.includes(selectedContent.id)) return;

    if (selectedContent.type === "QUIZ") {
      return;
    }

    startContentMutation.mutate({
      idCourse: id,
      idUser: DUMMY_USER_ID,
      idContent: selectedContent.id,
    });
    setStartedContentIds((prev) => [...prev, selectedContent.id]);
  }, [selectedContent?.id, completedContentIds, startedContentIds, id]);

  // Handle expand/collapse section
  const handleToggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId];
      if (!prev.includes(sectionId)) {
        const section = sections.find((s: any) => s.id === sectionId);
        const contents =
          (section as any)?.listContents || (section as any)?.listContent || [];
        if (contents.length > 0) {
          const sortedContents = [...contents].sort(
            (a: any, b: any) => (a?.sequence ?? 0) - (b?.sequence ?? 0)
          );
          setExpandedSectionsData((prevData) => ({
            ...prevData,
            [sectionId]: sortedContents,
          }));
        }
      }
      return next;
    });
  };

  // Enhanced content selection handler that syncs with URL
  const handleContentSelect = useCallback(
    (content: Content) => {
      if (lockedContentIds.includes(content.id)) {
        toastState.showError(
          "Content ini masih terkunci. Selesaikan content sebelumnya terlebih dahulu."
        );
        return;
      }

      const isCompleted = completedContentIds.includes(content.id);
      const isUnlocked = unlockedContentId
        ? content.id === unlockedContentId
        : false;

      if (!isCompleted && !isUnlocked) {
        toastState.showError(
          "Anda harus menyelesaikan content sebelumnya terlebih dahulu."
        );
        return;
      }

      setSelectedContent(content);
      updateContentInUrl(content);
    },
    [
      updateContentInUrl,
      completedContentIds,
      unlockedContentId,
      lockedContentIds,
      toastState,
    ]
  );

  // Navigation system
  const handleSectionDataUpdate = useCallback(
    (sectionId: string, contents: Content[]) => {
      setExpandedSectionsData((prev) => {
        // Prevent unnecessary updates if data is the same
        if (prev[sectionId] && prev[sectionId].length === contents.length) {
          const isSame = prev[sectionId].every(
            (content, index) => content.id === contents[index]?.id
          );
          if (isSame) return prev;
        }

        return {
          ...prev,
          [sectionId]: contents,
        };
      });
    },
    []
  );

  const { handleNext, handlePrevious, isNavigating, navigationState } =
    useContentNavigation({
      sections: (sections as any) || [],
      selectedContent,
      expandedSectionsData,
      orderedContents,
      unlockedContentId,
      onContentSelect: handleContentSelect,
      onSectionDataUpdate: handleSectionDataUpdate,
    });

  const handleMarkContentDone = () => {
    if (!selectedContent) return;

    if (selectedContent.type === "TASK") {
      const hasSubmitted = taskSubmissionStatus[selectedContent.id];
      if (!hasSubmitted) {
        toastState.showError("Anda harus mengumpulkan tugas terlebih dahulu!");
        return;
      }
    }

    finishContentMutation.mutate({
      idCourse: id,
      idUser: DUMMY_USER_ID,
      idContent: selectedContent.id,
      isFinished: true,
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
      toastState.showSuccess("Ulasan berhasil dikirim!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Gagal mengirim ulasan. Silakan coba lagi.");
    }
  };

  if (isCourseLoading || !courseDetail) {
    return (
      <PageContainer>
        <MyCoursePageSkeleton />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error Loading Course
            </h2>
            <p className="text-gray-600">{error.message}</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "My Courses", href: "/my-course" },
    { label: course.groupCourse.title, isActive: true },
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
          ${isSidebarOpen ? "lg:mr-[300px] xl:mr-[350px] 2xl:mr-[400px]" : "mr-0"}
        `}
      >
        <PageContainer>
          <CourseBreadcrumb items={breadcrumbItems} />

          <ContentPlayer
            content={selectedContent}
            isSidebarOpen={isSidebarOpen}
            onTaskSubmitted={(contentId, isRequired) => {
              if (!isRequired) {
                setTaskSubmissionStatus((prev) => ({
                  ...prev,
                  [contentId]: true,
                }));
              } else {
                setTaskSubmissionStatus((prev) => ({
                  ...prev,
                  [contentId]: true,
                }));
              }
            }}
            onStartContent={(contentId) => {
              if (!startedContentIds.includes(contentId)) {
                startContentMutation.mutate({
                  idCourse: id,
                  idUser: DUMMY_USER_ID,
                  idContent: contentId,
                });
                setStartedContentIds((prev) => [...prev, contentId]);
              }
            }}
            onFinishContent={(contentId) => {
              finishContentMutation.mutate({
                idCourse: id,
                idUser: DUMMY_USER_ID,
                idContent: contentId,
                isFinished: true,
              });
            }}
          />

          {selectedContent && (
            <ContentNavigation
              onPrevious={handlePrevious}
              onNext={handleNext}
              hasPrevious={navigationState.hasPrevious}
              hasNext={navigationState.hasNext}
              isNavigating={isNavigating}
              onMarkAsDone={handleMarkContentDone}
              isCompleted={completedContentIds.includes(selectedContent.id)}
              isMarkingAsDone={finishContentMutation.isPending}
            />
          )}

          <CourseTitle title={course.groupCourse.title} />

          {/* Tabs & Content */}
          <div id="course-tabs-top" className="space-y-6 pb-8 mt-8">
            <CourseTabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              hiddenTabs={isSidebarOpen ? ["course_contents"] : []}
            />

            {activeTab === "information" && (
              <CourseInformationTab
                method={course.groupCourse.description.method}
                syllabusFile={course.groupCourse.description.silabus}
                totalJP={course.groupCourse.description.totalJp}
                quota={course.groupCourse.description.quota}
                description={course.groupCourse.description.description}
                zoomUrl={course.zoomUrl || undefined}
                isEnrolled={true}
              />
            )}

            {activeTab === "course_contents" && (
              <CourseContentsTab
                sections={(sections as any) || []}
                expandedSections={expandedSections}
                onToggleSection={handleToggleSection}
                selectedContentId={selectedContent?.id}
                onSelectContent={handleContentSelect}
                completedContentIds={completedContentIds}
                onSectionDataUpdate={handleSectionDataUpdate}
                lockedContentIds={lockedContentIds}
              />
            )}

            {activeTab === "summary" && (
              <SummaryTab text={course.groupCourse.description.description} />
            )}

            {activeTab === "discussion_forum" && <DiscussionForumTab />}

            {activeTab === "ratings_reviews" && (
              <>
                <RatingsReviewsHeader onWriteReview={handleWriteReview} />

                <RatingsReviewsTab courseId={id} />
              </>
            )}
          </div>
        </PageContainer>
      </div>

      {isSidebarOpen && (
        <CourseContentsSidebar
          sections={(sections as any) || []}
          expandedSections={expandedSections}
          onToggleSection={handleToggleSection}
          selectedContentId={selectedContent?.id}
          onSelectContent={handleContentSelect}
          onClose={handleCloseSidebar}
          completedContentIds={completedContentIds}
          onSectionDataUpdate={handleSectionDataUpdate}
          lockedContentIds={lockedContentIds}
        />
      )}

      {/* Floating Toggle Button */}
      {!isSidebarOpen && <SidebarToggleButton onClick={handleOpenSidebar} />}

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleSubmitReview}
        courseName={course.groupCourse.title}
        isLoading={createReviewMutation.isPending}
      />

      <button
        type="button"
        aria-label="Lihat Summary"
        title="Lihat Summary"
        onClick={() => {
          setActiveTab("summary");
          setTimeout(() => {
            const el = document.getElementById("course-tabs-top");
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 0);
        }}
        className="fixed right-6 bottom-24 md:right-8 md:bottom-24 z-50 group"
      >
        <div className="inline-flex items-center rounded-full bg-blue-600 text-white shadow-lg overflow-hidden transition-all duration-300 w-12 group-hover:w-40 h-12 px-3 hover:bg-blue-700">
          <Sparkles className="w-6 h-6 flex-shrink-0" />
          <span className="ml-2 text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Lihat Summary
          </span>
        </div>
      </button>

      {toastState.toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2">
          <Toast
            variant={toastState.toast.variant}
            message={toastState.toast.message}
            onClose={toastState.dismissToast}
            autoDismiss
            duration={4000}
            dismissible
          />
        </div>
      )}
    </>
  );
}
