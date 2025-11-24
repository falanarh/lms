/**
 * Create Knowledge Center Page - UI-Only Implementation
 *
 * Architecture: API → Hooks → UI Pattern
 * - All business logic extracted to useCreateKnowledgePage hook
 * - Page component focuses solely on UI rendering and user interactions
 * - Clean separation of concerns for better maintainability
 * - Type-safe with full TypeScript support
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { useCreateKnowledgePage } from '@/hooks/useKnowledgeCenter';
import { useKnowledgeWizardForm } from '@/hooks/useKnowledgeWizardForm';
import {
  useKnowledgeSubjects,
  useCreateKnowledgeSubject,
  useUpdateKnowledgeSubject,
  useDeleteKnowledgeSubject,
} from '@/hooks/useKnowledgeSubject';
import { PENYELENGGARA_OPTIONS } from '@/constants/knowledge';
import type { KnowledgeSubject } from '@/types';

// ============================================================================
// Constants
// ============================================================================

// Transform static data once at module level

export const dynamic = 'force-dynamic';

// ============================================================================
// Wizard Steps Configuration
// ============================================================================

const steps = [
  { id: 1, title: 'Content Type', description: 'What are you creating?' },
  { id: 2, title: 'Basic Info', description: 'Tell us about it' },
  { id: 3, title: 'Specific Details', description: 'Add the content' },
  { id: 4, title: 'Final Review', description: 'Ready to publish?' },
];

// ============================================================================
// Main Component
// ============================================================================

export default function CreateKnowledgePage() {
  const router = useRouter();
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
    isCreating,
    submittingAs,
  } = useCreateKnowledgePage({
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
            <WizardHeader steps={steps} currentStep={currentStep} />

            {/* Content */}
            <div className="px-8 py-8">
              <div className="w-full">
                {renderStepContent()}

                {/* Actions */}
                <WizardActions
                  currentStep={currentStep}
                  totalSteps={steps.length}
                  isCreating={isCreating}
                  submittingAs={submittingAs}
                  onPrevious={prevStep}
                  onNext={handleNextStep}
                  onSaveDraft={() => handleSubmit('draft')}
                  onPublish={() => handleSubmit('published')}
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
