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
  useAddSubject,
  useUpdateSubject,
  useDeleteSubject,
  useKnowledgeSubjects,
  useCreateKnowledgeSubject,
  useUpdateKnowledgeSubject,
  useDeleteKnowledgeSubject,
  useCreateKnowledgeCenter,
} from '@/hooks/useKnowledge';
import { PENYELENGGARA_DATA } from '@/api/knowledge';

export const dynamic = 'force-dynamic';

const steps = [
  { id: 1, title: 'Content Type', description: 'What are you creating?' },
  { id: 2, title: 'Basic Info', description: 'Tell us about it' },
  { id: 3, title: 'Specific Details', description: 'Add the content' },
  { id: 4, title: 'Final Review', description: 'Ready to publish?' },
];

export default function CreateKnowledgePage() {
  const router = useRouter();
  const wizard = useCreateKnowledgeWizard();
  const toastState = createToastState();

  // Use new knowledge subjects API
  const { subjects: knowledgeSubjects } = useKnowledgeSubjects();

  // Use hardcoded penyelenggara data
  const penyelenggara = PENYELENGGARA_DATA.map(item => ({
    id: item.value,
    name: item.value,
    description: '',
  }));

  // Knowledge center creation mutation with new API
  const createKnowledgeMutation = useCreateKnowledgeCenter(
    (message) => toastState.showSuccess(message),
    (message) => toastState.showError(message)
  );

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

    // Find subject ID from subject name
    const selectedSubject = knowledgeSubjects.find(s => s.name === formData.subject);

    if (!selectedSubject) {
      toastState.showError('Pilih subject terlebih dahulu!');
      return;
    }

    // Transform form data to match new API expected format
    const apiData: any = {
      createdBy: "019a356a-6f9e-7580-a774-417030c13ab8", // Hardcoded user ID for now
      idSubject: selectedSubject.id,
      title: formData.title,
      description: formData.description,
      type: formData.knowledge_type === 'webinar' ? 'webinar' : 'content',
      penyelenggara: formData.penyelenggara,
      thumbnail: formData.thumbnail || "https://via.placeholder.com/300x200",
      isFinal: status === 'published',
      publishedAt: formData.published_at ? formData.published_at.split('T')[0] : new Date().toISOString().split('T')[0],
    };

    // Add type-specific data
    if (formData.knowledge_type === 'webinar') {
      apiData.webinar = {
        zoomDate: formData.tgl_zoom ? formData.tgl_zoom.split('T')[0] : new Date().toISOString().split('T')[0],
        zoomLink: formData.link_zoom || "",
        recordLink: formData.link_record || "",
        youtubeLink: formData.link_youtube || "",
        vbLink: formData.link_vb || "",
        jpCount: formData.jumlah_jp || 0,
      };

      // Debug log for webinar data
      console.log('Debug: Webinar payload:', {
        zoomDate: apiData.webinar.zoomDate,
        zoomLink: apiData.webinar.zoomLink,
        recordLink: apiData.webinar.recordLink,
        youtubeLink: apiData.webinar.youtubeLink,
        vbLink: apiData.webinar.vbLink,
        jpCount: apiData.webinar.jpCount
      });
    } else {
      // Content type
      console.log('Debug: formData.content_richtext:', formData.content_richtext);
      console.log('Debug: content_richtext length:', formData.content_richtext?.length);

      const contentType = wizard.form.contentType || 'article';
      const knowledgeContent: any = {
        contentType: contentType,
        document: formData.content_richtext || "",
      };

      // Only include mediaUrl for non-article content types
      if (contentType !== 'article') {
        knowledgeContent.mediaUrl = formData.media_resource || "";
      }

      apiData.knowledgeContent = knowledgeContent;
      console.log('Debug: Final apiData.knowledgeContent.document length:', apiData.knowledgeContent.document.length);
    }

    try {
      await createKnowledgeMutation.mutateAsync(apiData);
      // Success message handled by mutation callback
      router.push('/knowledge-center');
    } catch (error) {
      // Error handled by mutation callback
      console.error('Failed to create knowledge:', error);
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
            isUploadingThumbnail={wizard.form.isUploadingThumbnail}
            subjects={knowledgeSubjects}
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
            onMediaUpload={wizard.form.handleMediaUpload}
            onPDFUpload={wizard.form.handlePDFUpload}
            isUploadingMedia={wizard.form.isUploadingMedia}
            isUploadingPDF={wizard.form.isUploadingPDF}
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