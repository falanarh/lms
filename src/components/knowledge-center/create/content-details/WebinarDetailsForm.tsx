/**
 * Webinar Details Form Component
 * Handles webinar-specific fields: date, links, JP credits, and notes upload
 */

'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import type { CreateKnowledgeFormData } from '@/types/knowledge-center';
import { webinarDetailsSchema, jpCountValidator } from '@/lib/validation/knowledge-schemas';
import { FormInput } from '@/lib/validation/form-utils';

interface WebinarDetailsFormProps {
  form: any; // TanStack Form API - complex generic type
  formValues: CreateKnowledgeFormData;
}

export default function WebinarDetailsForm({
  form,
  formValues,
}: WebinarDetailsFormProps) {
  // Local state for PDF preview
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);

  // Initialize preview from form value on mount (for step navigation)
  useEffect(() => {
    const currentValue = formValues.webinar?.noteFile;
    
    // Only initialize if we don't have a preview yet
    if (!pdfPreviewUrl && !selectedPdfFile) {
      if (currentValue instanceof File) {
        const url = URL.createObjectURL(currentValue);
        setPdfPreviewUrl(url);
        setSelectedPdfFile(currentValue);
      } else if (typeof currentValue === 'string' && currentValue) {
        // If it's already a URL string (after upload)
        setPdfPreviewUrl(currentValue);
      }
    }
  }, [formValues.webinar?.noteFile, pdfPreviewUrl, selectedPdfFile]);

  // Cleanup blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl && pdfPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  return (
    <div className="space-y-4">
      {/* Date and JP Credits */}
      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="webinar.zoomDate"
          validators={{
            onChange: webinarDetailsSchema.shape.zoomDate,
            onBlur: webinarDetailsSchema.shape.zoomDate,
          }}
        >
          {(field: any) => (
            <FormInput
              field={field}
              label="Webinar Date"
              type="datetime-local"
              required
            />
          )}
        </form.Field>

        <form.Field
          name="webinar.jpCount"
          validators={{
            onChange: ({ value }: any) => jpCountValidator.validate(value),
            onBlur: ({ value }: any) => jpCountValidator.validate(value),
          }}
        >
          {(field: any) => (
            <FormInput
              field={field}
              label="JP Credits"
              type="number"
              placeholder="0"
              required
            />
          )}
        </form.Field>
      </div>

      {/* Zoom and YouTube Links */}
      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="webinar.zoomLink"
          validators={{
            onChange: webinarDetailsSchema.shape.zoomLink,
            onBlur: webinarDetailsSchema.shape.zoomLink,
          }}
        >
          {(field: any) => (
            <FormInput
              field={field}
              label="Zoom Link"
              type="url"
              placeholder="https://zoom.us/j/..."
              required
            />
          )}
        </form.Field>

        <form.Field
          name="webinar.youtubeLink"
          validators={{
            onChange: webinarDetailsSchema.shape.youtubeLink,
            onBlur: webinarDetailsSchema.shape.youtubeLink,
          }}
        >
          {(field: any) => (
            <FormInput
              field={field}
              label="YouTube Link"
              type="url"
              placeholder="https://youtube.com/..."
            />
          )}
        </form.Field>
      </div>

      {/* Recording and Virtual Background Links */}
      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="webinar.recordLink"
          validators={{
            onChange: webinarDetailsSchema.shape.recordLink,
            onBlur: webinarDetailsSchema.shape.recordLink,
          }}
        >
          {(field: any) => (
            <FormInput
              field={field}
              label="Recording Link"
              type="url"
              placeholder="https://..."
            />
          )}
        </form.Field>

        <form.Field
          name="webinar.vbLink"
          validators={{
            onChange: webinarDetailsSchema.shape.vbLink,
            onBlur: webinarDetailsSchema.shape.vbLink,
          }}
        >
          {(field: any) => (
            <FormInput
              field={field}
              label="Virtual Background Link"
              type="url"
              placeholder="https://..."
            />
          )}
        </form.Field>
      </div>

      {/* Notes PDF Upload */}
      <form.Field name="webinar.noteFile">
        {(field: any) => (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Notes PDF
            </label>
            {selectedPdfFile || pdfPreviewUrl ? (
              <div className="relative border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg overflow-hidden bg-gray-50 h-64">
                <div className="w-full h-full flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-7 h-7 text-green-600" />
                    </div>
                    <p className="text-gray-900 text-sm font-medium truncate mb-2 max-w-xs">
                      {selectedPdfFile ? selectedPdfFile.name : 'PDF Selected'}
                    </p>
                    {selectedPdfFile && (
                      <>
                        <p className="text-gray-600 text-xs mb-3">
                          {(selectedPdfFile.size / 1024 / 1024).toFixed(2)}MB • PDF Document
                        </p>
                        <a
                          href={pdfPreviewUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-blue-600 hover:text-blue-700 text-sm underline"
                        >
                          Preview PDF
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    // Clear preview
                    if (pdfPreviewUrl && pdfPreviewUrl.startsWith('blob:')) {
                      URL.revokeObjectURL(pdfPreviewUrl);
                    }
                    setPdfPreviewUrl(null);
                    setSelectedPdfFile(null);
                    form.setFieldValue('webinar.noteFile' as any, undefined as any);
                  }}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg z-10"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Create preview URL immediately
                      const url = URL.createObjectURL(file);
                      setPdfPreviewUrl(url);
                      setSelectedPdfFile(file);
                      
                      // Save File object to form (will be uploaded on submit)
                      form.setFieldValue('webinar.noteFile' as any, file as any);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-medium mb-1">
                    Upload PDF Notes
                  </p>
                  <p className="text-sm text-gray-500">
                    Click to browse or drag and drop
                  </p>
                </div>
              </div>
            )}
            {/* Display errors */}
            {field.state.meta.errors.length > 0 && (
              <p className="text-red-600 text-xs mt-1.5">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>
    </div>
  );
}
