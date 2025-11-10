import React from "react";
import { Button } from "@/components/ui/Button";
import { Send } from "lucide-react";
import { createTopicFormState, topicFormValidation } from "@/utils/formUtils";

interface TopicCreationFormProps {
  onSubmit: (data: { title: string; content: string }) => Promise<void>;
  isSubmitting?: boolean;
}

export function TopicCreationForm({ onSubmit, isSubmitting = false }: TopicCreationFormProps) {
  const formState = createTopicFormState();
  const [touchedFields, setTouchedFields] = React.useState<{ title: boolean; content: boolean }>({
    title: false,
    content: false,
  });
  const [submitAttempted, setSubmitAttempted] = React.useState(false);

  const handleCollapseForm = () => {
    formState.collapseForm();
    setTouchedFields({ title: false, content: false });
    setSubmitAttempted(false);
  };

  const handleFieldBlur = (field: "title" | "content") => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    const validationErrors = topicFormValidation.validateForm(formState.formData);
    formState.setFieldErrors({
      ...formState.errors,
      [field]: validationErrors[field],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitAttempted(true);
    setTouchedFields({ title: true, content: true });

    if (!formState.validateForm()) {
      return;
    }

    try {
      await onSubmit(formState.formData);
      // Reset form setelah successful submission
      formState.resetForm();
      setSubmitAttempted(false);
      setTouchedFields({ title: false, content: false });
    } catch {
      // Error handling dilakukan di parent component
    }
  };

  const titleErrorMessage =
    (submitAttempted || touchedFields.title) ? formState.errors.title : undefined;
  const contentErrorMessage =
    (submitAttempted || touchedFields.content) ? formState.errors.content : undefined;

  if (!formState.isExpanded) {
    return (
      <div className="pl-8 py-4 pr-4">
        <div className="flex items-center gap-3">
          <div
            className="shrink-0 size-9 rounded-full bg-[color-mix(in_oklab,white_10%,var(--color-primary,#2563eb))] text-[var(--color-on-primary,#ffffff)] flex items-center justify-center shadow-sm"
            aria-label="Avatar Anda"
          >
            <span className="text-[var(--font-2xs,0.6875rem)] font-[var(--font-body-bold,600)]">
              U
            </span>
          </div>
            <div
              className="flex-1 text-base py-2 px-3 border border-gray-200 rounded-lg cursor-text hover:border-gray-300 transition-colors duration-200"
              onClick={formState.expandForm}
            >
              <span className="text-gray-400">Apa yang ingin Anda diskusikan?</span>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="shrink-0 size-9 rounded-full bg-[color-mix(in_oklab,white_10%,var(--color-primary,#2563eb))] text-[var(--color-on-primary,#ffffff)] flex items-center justify-center shadow-sm"
              aria-label="Avatar Anda"
            >
              <span className="text-[var(--font-2xs,0.6875rem)] font-[var(--font-body-bold,600)]">
                U
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Buat Topik Baru</h3>
          </div>
          <button
            type="button"
            onClick={handleCollapseForm}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Title Input */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Judul topik (minimal 3 karakter)..."
            value={formState.formData.title}
            onChange={(e) => formState.updateField('title', e.target.value)}
            onBlur={() => handleFieldBlur('title')}
            className={`w-full text-lg font-medium py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-400 ${
              titleErrorMessage
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-200 focus:border-blue-500'
            }`}
            autoFocus
          />
          {titleErrorMessage && (
            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {titleErrorMessage}
            </p>
          )}
        </div>

        {/* Content Textarea */}
        <div className="space-y-2">
          <textarea
            placeholder="Jelaskan lebih detail tentang topik yang ingin Anda diskusikan... (minimal 10 karakter)"
            value={formState.formData.content}
            onChange={(e) => formState.updateField('content', e.target.value)}
            onBlur={() => handleFieldBlur('content')}
            className={`w-full p-4 text-base border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-400 ${
              contentErrorMessage
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-200 focus:border-blue-500'
            }`}
            rows={4}
          />
          {contentErrorMessage && (
            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {contentErrorMessage}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Topik akan ditinjau sebelum dipublikasi</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="px-4 py-2 text-sm"
              onClick={handleCollapseForm}
              type="button"
            >
              Batal
            </Button>
            <Button
              size="sm"
              rightIcon={<Send className="w-4 h-4 transition-transform duration-200 group-hover:rotate-45" />}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Membuat..." : "Publikasi Topik"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
