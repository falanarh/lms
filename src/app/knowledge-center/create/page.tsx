/**
 * Create Knowledge Center Page - Clean Implementation
 *
 * Best practices implementation:
 * - Single source of truth for form state (TanStack Form)
 * - Clean separation of concerns
 * - Optimized rendering performance
 * - Type-safe with full TypeScript support
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from '@/components/ui/Toast/Toast';
import { createToastState } from '@/utils/toastUtils';
import {
  CONTENT_TYPES,
  KNOWLEDGE_TYPES,
  type ContentType,
} from '@/types/knowledge-center';
import KnowledgeTypeSelector from '@/components/knowledge-center/create/KnowledgeTypeSelector';
import BasicInfoForm from '@/components/knowledge-center/create/BasicInfoForm';
import ContentDetailsForm from '@/components/knowledge-center/create/ContentDetailsForm';
import ReviewStep from '@/components/knowledge-center/create/ReviewStep';
import WizardSidebar from '@/components/knowledge-center/create/WizardSidebar';
import WizardHeader from '@/components/knowledge-center/create/WizardHeader';
import WizardActions from '@/components/knowledge-center/create/WizardActions';
import { useCreateKnowledgeCenter } from '@/hooks/useKnowledgeCenter';
import { useKnowledgeWizardForm } from '@/hooks/useKnowledgeWizardForm';
import {
  useKnowledgeSubjects,
  useCreateKnowledgeSubject,
  useUpdateKnowledgeSubject,
  useDeleteKnowledgeSubject,
} from '@/hooks/useKnowledgeSubject';
import { PENYELENGGARA_DATA } from '@/api/knowledge-center';
import { knowledgeApi } from '@/api';
import type { KnowledgeSubject } from '@/types';

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
  // Form State Management with TanStack Form
  // ============================================================================

  const wizard = useKnowledgeWizardForm();
  const {
    currentStep,
    formValues,
    thumbnailPreview,
    nextStep,
    prevStep,
    goToStep,
    validateCurrentStep,
  } = wizard;

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const { data: knowledgeSubjects = [] } = useKnowledgeSubjects();

  const penyelenggara = useMemo(
    () =>
      PENYELENGGARA_DATA.map((item) => ({
        id: item.value,
        name: item.value,
        description: '',
      })),
    []
  );

  // ============================================================================
  // Mutations
  // ============================================================================

  const createKnowledgeMutation = useCreateKnowledgeCenter(
    (message) => toastState.showSuccess(message),
    (message) => toastState.showError(message)
  );

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

  // ============================================================================
  // Subject Management Handlers
  // ============================================================================

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

  // ============================================================================
  // Media Upload State
  // ============================================================================

  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isUploadingPDF, setIsUploadingPDF] = useState(false);

  // ============================================================================
  // Upload Handlers
  // ============================================================================

  const handleMediaUpload = async (
    file: File,
    type: 'video' | 'audio' | 'pdf'
  ) => {
    setIsUploadingMedia(true);
    try {
      let uploadedUrl = '';
      if (type === 'video') {
        uploadedUrl = await knowledgeApi.uploadVideo(file);
      } else if (type === 'audio') {
        uploadedUrl = await knowledgeApi.uploadAudio(file);
      } else {
        uploadedUrl = await knowledgeApi.uploadPDF(file);
      }

      wizard.form.setFieldValue('knowledgeContent', {
        ...(formValues.knowledgeContent || {}),
        mediaUrl: uploadedUrl,
      });
    } catch (error) {
      console.error('Media upload failed:', error);
      toastState.showError('Failed to upload media. Please try again.');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleNotesUpload = async (file: File) => {
    setIsUploadingPDF(true);
    try {
      const uploadedUrl = await knowledgeApi.uploadPDF(file);
      wizard.form.setFieldValue('webinar', {
        ...(formValues.webinar || {}),
        contentText: uploadedUrl,
      });
    } catch (error) {
      console.error('PDF upload failed:', error);
      toastState.showError('Failed to upload PDF. Please try again.');
    } finally {
      setIsUploadingPDF(false);
    }
  };

  // ============================================================================
  // Step Navigation
  // ============================================================================

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleNextStep = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      nextStep();
    } else {
      // Show error toast
      toastState.showError('Please fill in all required fields correctly');

      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [validateCurrentStep, nextStep, toastState]);

  const handleStepNavigation = useCallback(
    async (targetStep: number) => {
      if (targetStep === currentStep) return;

      if (targetStep > currentStep) {
        const isValid = await validateCurrentStep();
        if (!isValid) return;
      }

      goToStep(targetStep);
    },
    [currentStep, goToStep, validateCurrentStep]
  );

  // ============================================================================
  // Form Submission
  // ============================================================================

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!formValues.type) {
      toastState.showError('Please select a content type first!');
      return;
    }

    if (!formValues.idSubject) {
      toastState.showError('Please select a subject first!');
      return;
    }

    try {
      let thumbnailUrl =
        typeof formValues.thumbnail === 'string' && formValues.thumbnail
          ? formValues.thumbnail
          : 'https://via.placeholder.com/300x200';

      if (formValues.thumbnail instanceof File) {
        try {
          thumbnailUrl = await knowledgeApi.uploadImage(formValues.thumbnail);
        } catch (uploadError) {
          console.error('Failed to upload thumbnail:', uploadError);
          toastState.showError('Failed to upload thumbnail. Please try again.');
          return;
        }
      }

      const apiData: any = {
        createdBy: formValues.createdBy,
        idSubject: formValues.idSubject,
        title: formValues.title,
        description: formValues.description,
        type: formValues.type,
        penyelenggara: formValues.penyelenggara,
        thumbnail: thumbnailUrl,
        isFinal: status === 'published',
        publishedAt: formValues.publishedAt || new Date().toISOString(),
        tags: formValues.tags,
      };

      if (formValues.type === KNOWLEDGE_TYPES.WEBINAR && formValues.webinar) {
        apiData.webinar = {
          zoomDate: formValues.webinar.zoomDate || new Date().toISOString(),
          zoomLink: formValues.webinar.zoomLink || '',
          recordLink: formValues.webinar.recordLink || '',
          youtubeLink: formValues.webinar.youtubeLink || '',
          vbLink: formValues.webinar.vbLink || '',
          jpCount: formValues.webinar.jpCount || 0,
        };
      }

      if (
        formValues.type === KNOWLEDGE_TYPES.CONTENT &&
        formValues.knowledgeContent
      ) {
        const contentType = formValues.knowledgeContent.contentType || CONTENT_TYPES.ARTICLE;

        // Build knowledgeContent object based on content type
        apiData.knowledgeContent = {
          contentType,
          document: formValues.knowledgeContent.document || '',
        };

        // Only include mediaUrl for non-article content types
        // Articles only have rich text content (document), no media file
        if (contentType !== CONTENT_TYPES.ARTICLE) {
          apiData.knowledgeContent.mediaUrl = formValues.knowledgeContent.mediaUrl || '';
          console.log('📤 Including mediaUrl for content type:', contentType);
        } else {
          console.log('📝 Article type - mediaUrl excluded from submission');
        }

        console.log('📤 Final knowledgeContent to be sent:', apiData.knowledgeContent);
      }

      await createKnowledgeMutation.mutateAsync(apiData);
      router.push('/knowledge-center');
    } catch (error) {
      console.error('Failed to create knowledge:', error);
    }
  };

  // ============================================================================
  // Review Data
  // ============================================================================

  const selectedSubjectName = useMemo(() => {
    if (!formValues.idSubject) return '';
    return (
      knowledgeSubjects.find((subject) => subject.id === formValues.idSubject)
        ?.name || ''
    );
  }, [formValues.idSubject, knowledgeSubjects]);

  const reviewData: any = useMemo(() => {
    const data = {
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
      // Fix: Properly nest knowledgeContent object instead of flattening
      knowledgeContent: formValues.knowledgeContent ? {
        contentType: formValues.knowledgeContent.contentType,
        mediaUrl: formValues.knowledgeContent.mediaUrl,
        document: formValues.knowledgeContent.document,
      } : undefined,
    };

    console.log('📊 Review Data Structure:', data);
    console.log('📊 knowledgeContent:', data.knowledgeContent);

    return data;
  }, [formValues, selectedSubjectName]);

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
            onSubjectAdd={handleAddSubject}
            onSubjectUpdate={handleUpdateSubject}
            onSubjectDelete={handleDeleteSubject}
            isSubjectManagementPending={{
              adding: addSubjectMutation.isPending,
              updating: updateSubjectMutation.isPending,
              deleting: deleteSubjectMutation.isPending,
            }}
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
            onMediaUpload={handleMediaUpload}
            onPDFUpload={handleNotesUpload}
            isUploadingMedia={isUploadingMedia}
            isUploadingPDF={isUploadingPDF}
          />
        );

      case 4:
        return (
          <ReviewStep
            formData={reviewData}
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
                  isCreating={createKnowledgeMutation.isPending}
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
