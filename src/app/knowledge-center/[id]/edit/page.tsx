/**
 * Edit Knowledge Center Page - UI-Only Implementation
 *
 * Architecture: API → Hooks → UI Pattern
 * - All business logic extracted to useEditKnowledgePage hook
 * - Page component focuses solely on UI rendering and user interactions
 * - Clean separation of concerns for better maintainability
 * - Type-safe with full TypeScript support
 * - Reuses components from create page for consistency
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Toast } from '@/components/ui/Toast/Toast';
import { createToastState } from '@/utils/toastUtils';
import { type ContentType } from '@/types/knowledge-center';
import KnowledgeTypeSelector from '@/components/knowledge-center/create/KnowledgeTypeSelector';
import BasicInfoForm from '@/components/knowledge-center/create/BasicInfoForm';
import ContentDetailsForm from '@/components/knowledge-center/create/ContentDetailsForm';
import ReviewStep from '@/components/knowledge-center/create/ReviewStep';
import WizardSidebar from '@/components/knowledge-center/create/WizardSidebar';
import WizardHeader from '@/components/knowledge-center/create/WizardHeader';
import WizardActions from '@/components/knowledge-center/create/WizardActions';
import { useEditKnowledgePage } from '@/hooks/useKnowledgeCenter';
import { useKnowledgeWizardForm } from '@/hooks/useKnowledgeWizardForm';
import {
  useKnowledgeSubjects,
  useCreateKnowledgeSubject,
  useUpdateKnowledgeSubject,
  useDeleteKnowledgeSubject,
} from '@/hooks/useKnowledgeSubject';
import { PENYELENGGARA_OPTIONS } from '@/constants/knowledge';
import type { KnowledgeSubject } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

// ============================================================================
// Constants
// ============================================================================

// Transform static data once at module level

export const dynamic = 'force-dynamic';

// ============================================================================
// Wizard Steps Configuration
// ============================================================================

const steps = [
  { id: 1, title: 'Content Type', description: 'What are you editing?' },
  { id: 2, title: 'Basic Info', description: 'Update the details' },
  { id: 3, title: 'Specific Details', description: 'Modify the content' },
  { id: 4, title: 'Final Review', description: 'Ready to update?' },
];

// ============================================================================
// Loading Component
// ============================================================================

const EditPageSkeleton = () => (
  <div className="min-h-screen bg-white">
    <div className="flex">
      {/* Left Sidebar Skeleton */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content Skeleton */}
      <div className="flex-1">
        {/* Header Skeleton */}
        <div className="border-b border-gray-200 px-8 py-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>

        {/* Content Skeleton */}
        <div className="px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
            <div className="flex space-x-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

export default function EditKnowledgePage() {
  const router = useRouter();
  const params = useParams();
  const knowledgeId = params.id as string;
  const toastState = createToastState();

  // ============================================================================
  // Form State Management
  // ============================================================================

  const wizard = useKnowledgeWizardForm();
  const {
    currentStep,
    formValues,
    thumbnailPreview,
    prevStep,
  } = wizard;

  // ============================================================================
  // Business Logic Hook (All business logic extracted here)
  // ============================================================================

  const {
    handleNextStep,
    handleStepNavigation,
    handleSubmit,
    isUpdating,
    submittingAs,
    isLoading,
    error,
  } = useEditKnowledgePage({
    knowledgeId,
    wizard,
    router,
    onSuccess: toastState.showSuccess,
    onError: toastState.showError,
  });

  // ============================================================================
  // Data Fetching for UI
  // ============================================================================

  const { data: knowledgeSubjects = [] } = useKnowledgeSubjects();
  
  // Use pre-computed constant instead of useMemo
  const penyelenggara = PENYELENGGARA_OPTIONS;

  // ============================================================================
  // Subject Management Mutations
  // ============================================================================

  const addSubjectMutation = useCreateKnowledgeSubject(
    (message) => toastState.showSuccess(message),
    (message) => toastState.showError(message)
  );

  const updateSubjectMutation = useUpdateKnowledgeSubject(
    (message) => toastState.showSuccess(message),
    (message) => toastState.showError(message)
  );

  const deleteSubjectMutation = useDeleteKnowledgeSubject(
    (message) => toastState.showSuccess(message),
    (message) => toastState.showError(message)
  );

  // Subject Management Handlers (UI → Mutation bridge)
  const handleAddSubject = (knowledgeSubject: KnowledgeSubject) => {
    addSubjectMutation.mutate(knowledgeSubject);
  };

  const handleUpdateSubject = (
    id: string,
    knowledgeSubject: Partial<KnowledgeSubject>
  ) => {
    updateSubjectMutation.mutate({ id, data: knowledgeSubject });
  };

  const handleDeleteSubject = (id: string) => {
    deleteSubjectMutation.mutate(id);
  };

  // Group subject handlers for cleaner prop passing
  const subjectHandlers = {
    onAdd: handleAddSubject,
    onUpdate: handleUpdateSubject,
    onDelete: handleDeleteSubject,
    isPending: {
      adding: addSubjectMutation.isPending,
      updating: updateSubjectMutation.isPending,
      deleting: deleteSubjectMutation.isPending,
    },
  };

  // ============================================================================
  // UI Effects
  // ============================================================================

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [currentStep]);

  // ============================================================================
  // Error Handling
  // ============================================================================

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Failed to Load Knowledge Center
          </h1>
          <p className="text-gray-600 mb-6">
            {error.message || 'An error occurred while loading the knowledge center.'}
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Loading State
  // ============================================================================

  if (isLoading) {
    return <EditPageSkeleton />;
  }

  // ============================================================================
  // Review Data - Computed inline, only memoize if expensive
  // ============================================================================

  const selectedSubjectName = formValues.idSubject
    ? knowledgeSubjects.find((subject) => subject.id === formValues.idSubject)?.name || ''
    : '';

  const reviewData = {
    title: formValues.title,
    description: formValues.description,
    idSubject: formValues.idSubject,
    subject: selectedSubjectName,
    penyelenggara: formValues.penyelenggara || '',
    createdBy: formValues.createdBy,
    type: formValues.type,
    publishedAt: formValues.publishedAt,
    tags: formValues.tags,
    thumbnail: formValues.thumbnail,
    webinar: formValues.webinar ? {
      zoomDate: formValues.webinar.zoomDate,
      zoomLink: formValues.webinar.zoomLink,
      youtubeLink: formValues.webinar.youtubeLink,
      recordLink: formValues.webinar.recordLink,
      vbLink: formValues.webinar.vbLink,
      noteFile: formValues.webinar.noteFile,
      jpCount: formValues.webinar.jpCount,
    } : undefined,
    knowledgeContent: formValues.knowledgeContent ? {
      contentType: formValues.knowledgeContent.contentType,
      mediaUrl: formValues.knowledgeContent.mediaUrl,
      document: formValues.knowledgeContent.document,
    } : undefined,
  };

  // ============================================================================
  // Step Content Rendering
  // ============================================================================

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <wizard.form.Subscribe selector={(state: any) => state.values.type}>
            {(selectedType: any) => (
              <KnowledgeTypeSelector
                selectedType={selectedType}
                onTypeSelect={(type) => {
                  wizard.form.setFieldValue('type' as any, type as any);
                }}
              />
            )}
          </wizard.form.Subscribe>
        );

      case 2:
        return (
          <BasicInfoForm
            wizard={wizard}
            subjects={knowledgeSubjects}
            penyelenggara={penyelenggara}
            subjectHandlers={subjectHandlers}
          />
        );

      case 3:
        if (!formValues.type) {
          return (
            <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-8 text-center">
              <p className="text-lg font-semibold text-gray-900">
                Please select a content type first
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Go back to step 1 and select a content type before continuing.
              </p>
            </div>
          );
        }

        return (
          <ContentDetailsForm
            wizard={wizard}
          />
        );

      case 4:
        return (
          <ReviewStep
            formData={reviewData as any}
            contentType={formValues.knowledgeContent?.contentType as ContentType || null}
            thumbnailPreview={thumbnailPreview}
          />
        );

      default:
        return null;
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <>
      <style jsx global>{`
        /* Modern minimal scrollbar styling */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #f9fafb;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
          transition: background-color 0.2s ease;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        /* Firefox scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f9fafb;
        }

        *:hover {
          scrollbar-color: #9ca3af #f9fafb;
        }
      `}</style>
      <div className="min-h-screen bg-white">
        <div className="flex">
          {/* Left Sidebar - Vertical Wizard */}
          <WizardSidebar
            steps={steps}
            currentStep={currentStep}
            onStepClick={handleStepNavigation}
          />

          {/* Right Content Area */}
          <div className="flex-1">
            {/* Top Bar */}
            <WizardHeader 
              steps={steps} 
              currentStep={currentStep}
            />

            {/* Content */}
            <div className="px-8 py-8">
              <div className="w-full">
                {renderStepContent()}

                {/* Actions */}
                <WizardActions
                  currentStep={currentStep}
                  totalSteps={steps.length}
                  isCreating={isUpdating}
                  submittingAs={submittingAs}
                  onPrevious={prevStep}
                  onNext={handleNextStep}
                  onSaveDraft={() => handleSubmit('draft')}
                  onPublish={() => handleSubmit('published')}
                  minBackStep={2}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
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
