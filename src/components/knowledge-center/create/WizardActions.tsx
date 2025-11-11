'use client';

import React from 'react';
import { ChevronLeft, ArrowRight, Loader2 } from 'lucide-react';

interface WizardActionsProps {
  currentStep: number;
  totalSteps: number;
  isCreating: boolean;
  isUploadingMedia?: boolean;
  isUploadingPDF?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export default function WizardActions({
  currentStep,
  totalSteps,
  isCreating,
  isUploadingMedia = false,
  isUploadingPDF = false,
  onPrevious,
  onNext,
  onSaveDraft,
  onPublish,
}: WizardActionsProps) {
  // Combine all loading states
  const isAnyRequestPending = isCreating || isUploadingMedia || isUploadingPDF;
  
  // Determine loading message
  const getLoadingMessage = () => {
    if (isCreating) return 'Publishing...';
    if (isUploadingMedia) return 'Uploading media...';
    if (isUploadingPDF) return 'Uploading PDF...';
    return 'Publish';
  };

  const getSavingMessage = () => {
    if (isCreating) return 'Saving...';
    if (isUploadingMedia) return 'Uploading media...';
    if (isUploadingPDF) return 'Uploading PDF...';
    return 'Save Draft';
  };

  return (
    <div className="flex items-center justify-between mt-12 pt-8 border-t border-[var(--border,rgba(0,0,0,0.12))]">
      <button
        onClick={onPrevious}
        disabled={currentStep === 1 || isAnyRequestPending}
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      <div className="flex items-center gap-3">
        {currentStep === totalSteps ? (
          <>
            <button
              onClick={onSaveDraft}
              disabled={isAnyRequestPending}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isAnyRequestPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {getSavingMessage()}
            </button>
            <button
              onClick={onPublish}
              disabled={isAnyRequestPending}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl"
            >
              {isAnyRequestPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {getLoadingMessage()}
                </>
              ) : (
                <>
                  Publish
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </>
        ) : (
          <button
            onClick={onNext}
            disabled={isAnyRequestPending}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl"
          >
            {isAnyRequestPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isUploadingMedia ? 'Uploading media...' : 'Uploading PDF...'}
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}