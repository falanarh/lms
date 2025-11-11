/**
 * Webinar Details Form Component
 * Handles webinar-specific fields: date, links, JP credits, and notes upload
 */

'use client';

import React from 'react';
import { FileText, Upload, X } from 'lucide-react';
import type { CreateKnowledgeFormData } from '@/types/knowledge-center';
import { webinarDetailsSchema, jpCountValidator } from '@/lib/validation/knowledge-schemas';
import { FormInput } from '@/lib/validation/form-utils';

interface WebinarDetailsFormProps {
  form: any; // TanStack Form API - complex generic type
  formValues: CreateKnowledgeFormData;
  onPDFUpload?: (file: File) => Promise<void>;
  isUploadingPDF?: boolean;
}

export default function WebinarDetailsForm({
  form,
  formValues,
  onPDFUpload,
  isUploadingPDF = false,
}: WebinarDetailsFormProps) {
  const handlePDFUpload = async (file: File) => {
    if (onPDFUpload) {
      try {
        await onPDFUpload(file);
      } catch (error) {
        console.error('PDF upload failed:', error);
      }
    }
  };

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
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Notes PDF
        </label>
        {formValues.webinar?.contentText ? (
          <div className="relative border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg overflow-hidden bg-gray-50 h-64">
            <div className="w-full h-full flex items-center justify-center p-8">
              <div className="text-center">
                <div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-7 h-7 text-green-600" />
                </div>
                <p className="text-gray-900 text-sm font-medium truncate mb-2">
                  PDF Uploaded Successfully
                </p>
                <a
                  href={formValues.webinar.contentText}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm underline"
                >
                  View PDF
                </a>
              </div>
            </div>
            <button
              onClick={() => form.setFieldValue('webinar.contentText' as any, '' as any)}
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
                if (file) handlePDFUpload(file);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isUploadingPDF}
            />
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-1">
                {isUploadingPDF ? 'Uploading...' : 'Upload PDF Notes'}
              </p>
              <p className="text-sm text-gray-500">
                Click to browse or drag and drop
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
