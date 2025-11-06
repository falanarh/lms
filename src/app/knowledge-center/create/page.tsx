'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from '@/components/ui/Toast/Toast';
import { createToastState } from '@/utils/toastUtils';
import {
  KnowledgeTypeSelector,
  BasicInfoForm,
  ContentDetailsForm,
  ReviewStep,
  WizardSidebar,
  WizardHeader,
  WizardActions,
} from '@/components/knowledge-center/create';
import {
  useCreateKnowledgeWizard,
  useSubjects,
  usePenyelenggara,
  useCreateKnowledge,
  useAddSubject,
  useUpdateSubject,
  useDeleteSubject,
  useKnowledgeSubjects,
  useCreateKnowledgeSubject,
  useUpdateKnowledgeSubject,
  useDeleteKnowledgeSubject,
} from '@/hooks/useKnowledge';

export const dynamic = 'force-dynamic';

const steps = [
  { id: 1, title: 'Content Type', description: 'What are you creating?' },
  { id: 2, title: 'Basic Info', description: 'Tell us about it' },
  { id: 3, title: 'Specific Details', description: 'Add the content' },
  { id: 4, title: 'Final Review', description: 'Ready to publish?' },
];

export default function CreateKnowledgePage() {
  const router = useRouter();
  const createKnowledgeMutation = useCreateKnowledge();
  const { subjects: oldSubjects } = useSubjects(); // Keep old subjects for backward compatibility
  const { subjects: knowledgeSubjects } = useKnowledgeSubjects(); // New knowledge subjects API
  const { penyelenggara } = usePenyelenggara();
  const wizard = useCreateKnowledgeWizard();
  const toastState = createToastState();

  // Use knowledge subjects if available, fallback to old subjects
  const subjects = knowledgeSubjects.length > 0 ? knowledgeSubjects : oldSubjects;

  // Subject management mutations - use new knowledge subjects API with toast callbacks
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

  // Subject management handlers
  const handleAddSubject = (subject: { name: string; icon?: string }) => {
    addSubjectMutation.mutate(subject);
  };

  const handleUpdateSubject = (id: string, subject: { name?: string; icon?: string }) => {
    updateSubjectMutation.mutate({ id, data: subject });
  };

  const handleDeleteSubject = (id: string) => {
    deleteSubjectMutation.mutate(id);
  };

  // Auto scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [wizard.currentStep]);

  // Auto scroll when content type changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [wizard.form.contentType]);

  // Auto scroll when user goes back to content type selection
  useEffect(() => {
    if (wizard.currentStep === 3 && !wizard.form.contentType) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [wizard.currentStep, wizard.form.contentType]);

  const handleSubmit = async (status: 'draft' | 'published') => {
    const formData = wizard.form.formData;

    // Transform form data to match API expected format
    const apiData: any = {
      title: formData.title,
      description: formData.description,
      subject: formData.subject,
      penyelenggara: formData.penyelenggara,
      knowledge_type: formData.knowledge_type,
      author: formData.author,
      tags: formData.tags,
      published_at: formData.published_at,
      status,
      thumbnail: formData.thumbnail,
      // Convert file objects to strings for API compatibility
      file_notulensi_pdf: formData.file_notulensi_pdf?.name,
      media_resource: formData.media_resource?.name,
      // Add content-specific fields
      content_richtext: formData.content_richtext,
      tgl_zoom: formData.tgl_zoom,
      link_zoom: formData.link_zoom,
      link_youtube: formData.link_youtube,
      link_record: formData.link_record,
      link_vb: formData.link_vb,
      jumlah_jp: formData.jumlah_jp,
    };

    try {
      await createKnowledgeMutation.mutateAsync(apiData);
      toastState.showSuccess(`Knowledge "${formData.title}" berhasil ${status === 'published' ? 'dipublikasi' : 'disimpan sebagai draft'}!`);
      router.push('/knowledge-center');
    } catch (error) {
      console.error('Failed to create knowledge:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal membuat knowledge. Silakan coba lagi.';
      toastState.showError(errorMessage);
    }
  };

  const renderStepContent = () => {
    switch (wizard.currentStep) {
      case 1:
        return (
          <KnowledgeTypeSelector
            selectedType={wizard.form.formData.knowledge_type}
            onTypeSelect={(type) => wizard.form.updateFormData('knowledge_type', type)}
            error={wizard.form.errors.knowledge_type}
          />
        );

      case 2:
        return (
          <BasicInfoForm
            formData={wizard.form.formData}
            thumbnailPreview={wizard.form.thumbnailPreview}
            currentTagInput={wizard.form.currentTagInput}
            subjects={subjects}
            penyelenggara={penyelenggara}
            errors={wizard.form.errors}
            onFieldChange={wizard.form.updateFormData}
            onThumbnailSelect={wizard.form.handleThumbnailSelect}
            onThumbnailRemove={wizard.form.handleThumbnailRemove}
            onTagInput={wizard.form.setCurrentTagInput}
            onAddTag={wizard.form.handleAddTag}
            onRemoveTag={wizard.form.handleRemoveTag}
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
        return (
          <ContentDetailsForm
            knowledgeType={wizard.form.formData.knowledge_type}
            contentType={wizard.form.contentType}
            formData={wizard.form.formData}
            errors={wizard.form.errors}
            onContentTypeChange={wizard.form.setContentType}
            onFieldChange={wizard.form.updateFormData}
          />
        );

      case 4:
        return (
          <ReviewStep
            formData={wizard.form.formData}
            contentType={wizard.form.contentType}
            thumbnailPreview={wizard.form.thumbnailPreview}
          />
        );

      default:
        return null;
    }
  };

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
            currentStep={wizard.currentStep}
            onStepClick={wizard.goToStep}
          />

          {/* Right Content Area */}
          <div className="flex-1">
            {/* Top Bar */}
            <WizardHeader steps={steps} currentStep={wizard.currentStep} />

            {/* Content */}
            <div className="px-8 py-8">
              <div className="w-full">
                {renderStepContent()}

                {/* Actions */}
                <WizardActions
                  currentStep={wizard.currentStep}
                  totalSteps={steps.length}
                  isCreating={createKnowledgeMutation.isPending}
                  onPrevious={wizard.handlePrevious}
                  onNext={wizard.handleNext}
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