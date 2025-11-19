/**
 * Enhanced Form Utilities and Helper Functions
 *
 * Optimized form components with TanStack Form integration
 * Enhanced for performance, type safety, and maintainability
 */

import React, { useState, useRef } from "react";
import { X, Upload, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { Dropdown } from "@/components/ui/Dropdown";

// Type definitions for TanStack Form field
interface FormField<T = unknown> {
  name: string;
  state: {
    value: T;
    meta: {
      errors: any[];
    };
  };
  handleChange: (value: T | null) => void;
  handleBlur: () => void;
}

/**
 * Helper function to safely extract error message from TanStack Form error object
 */
export function getErrorMessage(error: any): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error)
    return error.message;
  return String(error);
}

/**
 * TanStack Form Field Info Component (Official Pattern)
 * Displays field errors and validation state according to official docs
 * Standard error styling: text-red-600 text-xs mt-1.5
 */
export function FieldInfo({ field }: { field: FormField }) {
  const errors = field.state.meta.errors.filter(Boolean).map(getErrorMessage);

  // Remove duplicate error messages
  const uniqueErrors = Array.from(new Set(errors));

  return (
    <>
      {uniqueErrors.length > 0 ? (
        <p className="text-red-600 text-xs mt-1.5">{uniqueErrors.join(", ")}</p>
      ) : null}
    </>
  );
}

/**
 * Standalone Error Message Component for consistent error styling
 * Use this for custom fields that don't use FormField
 */
export function ErrorMessage({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) return null;

  return <p className="text-red-600 text-xs mt-1.5">{errors[0]}</p>;
}

/**
 * Custom input component that integrates with TanStack Form
 */
export function FormInput({
  field,
  label,
  placeholder,
  type = "text",
  required = false,
  className = "",
  ...props
}: {
  field: FormField<string | number>;
  label?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  className?: string;
  errorClassName?: string;
  [key: string]: unknown;
}) {
  // Get unique errors only
  const errors = field.state.meta.errors.filter(Boolean).map(getErrorMessage);
  const uniqueErrors = Array.from(new Set(errors));
  const hasError = uniqueErrors.length > 0;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={field.name}
          className="block text-sm font-medium text-gray-900"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={field.name}
        name={field.name}
        type={type}
        placeholder={placeholder}
        value={field.state.value ?? ""}
        onChange={(e) => {
          const value =
            type === "number"
              ? e.target.value === ""
                ? ""
                : Number(e.target.value)
              : e.target.value;
          field.handleChange(value as any);
        }}
        onBlur={field.handleBlur}
        className={`w-full px-4 h-12 border-2 rounded-lg focus:outline-none transition-all text-gray-900 placeholder:text-gray-400 ${
          hasError
            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
            : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        } ${className}`}
        {...props}
      />
      <FieldInfo field={field} />
    </div>
  );
}

/**
 * Custom textarea component that integrates with TanStack Form
 */
export function FormTextarea({
  field,
  label,
  placeholder,
  rows = 4,
  required = false,
  className = "",
  ...props
}: {
  field: FormField<string>;
  label?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  className?: string;
  errorClassName?: string;
  [key: string]: unknown;
}) {
  // Get unique errors only
  const errors = field.state.meta.errors.filter(Boolean).map(getErrorMessage);
  const uniqueErrors = Array.from(new Set(errors));
  const hasError = uniqueErrors.length > 0;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={field.name}
          className="block text-sm font-medium text-gray-900"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={field.name}
        name={field.name}
        placeholder={placeholder}
        value={field.state.value || ""}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        rows={rows}
        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all text-gray-900 resize-y min-h-[48px] max-h-[200px] placeholder:text-gray-400 ${
          hasError
            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
            : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        } ${className}`}
        {...props}
      />
      <FieldInfo field={field} />
    </div>
  );
}

/**
 * File upload field component
 */
export function FormFileUpload({
  field,
  label,
  accept,
  maxSize,
  required = false,
  previewUrl,
  onRemove,
  onThumbnailSelect,
  recommendations,
  ...props
}: {
  field: FormField<File | string | undefined>;
  label?: string;
  accept?: string;
  maxSize?: number;
  required?: boolean;
  className?: string;
  errorClassName?: string;
  previewUrl?: string;
  onRemove?: () => void;
  onThumbnailSelect?: (file: File) => void;
  recommendations?: {
    minWidth?: number;
    minHeight?: number;
    aspectRatio?: string;
    formats?: string[];
    optimalSize?: string;
  };
  [key: string]: unknown;
}) {
  const [warnings, setWarnings] = useState<string[]>([]);

  const displayValue = field.state.value;

  React.useEffect(() => {
    const value = field.state.value;
    const hasValue =
      value &&
      (value instanceof File ||
        (typeof value === "string" && value.length > 0));
    const hasErrors =
      field.state.meta.errors && field.state.meta.errors.length > 0;

    if (hasValue && hasErrors) {
      console.log("🔥 Auto-clear thumbnail errors");
      setTimeout(() => field.handleBlur(), 0);
    }
  }, [field.state.value, field.name]);

  const errors = field.state.meta.errors.filter(Boolean).map(getErrorMessage);
  const uniqueErrors = Array.from(new Set(errors));
  const hasError = uniqueErrors.length > 0;

  // Simple logic: Use previewUrl if available, otherwise create object URL dari File image
  const imageSource =
    previewUrl ||
    (displayValue instanceof File && displayValue.type.startsWith("image/")
      ? URL.createObjectURL(displayValue)
      : null);
  const isImageFile =
    displayValue instanceof File && displayValue.type.startsWith("image/");
  const shouldShowImage = !!imageSource;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {displayValue ? (
        // Preview mode - Increased size
        <div
          className={`relative border-2 rounded-lg overflow-hidden bg-gray-50 h-80 ${hasError ? "border-red-500" : "border-gray-300"}`}
        >
          {(() => {
            console.log("🎯 Render Logic Debug:", {
              imageSource: imageSource ? "EXISTS" : "NULL",
              isImageFile,
              shouldShowImage,
            });

            if (shouldShowImage) {
              console.log(
                "✅ Rendering image with source:",
                imageSource.substring(0, 50) + "..."
              );
              return (
                <img
                  src={imageSource}
                  alt="Preview"
                  className="w-full h-80 object-cover"
                />
              );
            } else {
              console.log(
                "❌ Showing file icon - imageSource:",
                !!imageSource,
                "isImageFile:",
                isImageFile
              );
              return (
                <div className="w-full h-80 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="mx-auto w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-7 h-7 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-900 text-sm font-medium truncate mb-2">
                      {displayValue instanceof File
                        ? displayValue.name
                        : "File uploaded"}
                    </p>
                    {displayValue instanceof File && (
                      <p className="text-gray-600 text-xs">
                        Size: {(displayValue.size / 1024 / 1024).toFixed(2)}MB •{" "}
                        {displayValue.type || "Unknown type"}
                      </p>
                    )}
                  </div>
                </div>
              );
            }
          })()}
          {onRemove && (
            <button
              type="button"
              onClick={() => {
                if (onRemove) onRemove();
                field.handleChange(undefined);
              }}
              className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {/* File info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-white text-sm font-medium truncate">
              {displayValue instanceof File
                ? displayValue.name
                : "Uploaded file"}
            </p>
            {displayValue instanceof File && (
              <p className="text-white/80 text-xs">
                {(displayValue.size / 1024 / 1024).toFixed(2)}MB •{" "}
                {displayValue.type || "Unknown"}
              </p>
            )}
          </div>
        </div>
      ) : (
        // Upload mode
        <div
          className={`border-2 border-dashed rounded-lg p-8 transition-colors bg-white hover:border-blue-400 ${hasError ? "border-red-500" : "border-gray-300"}`}
        >
          <input
            type="file"
            accept={accept}
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              console.log("📁 File selected:", file ? file.name : "No file");

              if (file) {
                console.log("✅ File is valid, processing...");

                // Process warnings
                if (file.type.startsWith("image/") && recommendations) {
                  const newWarnings: string[] = [];
                  const img = new Image();
                  img.onload = () => {
                    if (
                      recommendations.minWidth &&
                      img.width < recommendations.minWidth
                    ) {
                      newWarnings.push(
                        `Image width (${img.width}px) is smaller than recommended (${recommendations.minWidth}px)`
                      );
                    }
                    if (
                      recommendations.minHeight &&
                      img.height < recommendations.minHeight
                    ) {
                      newWarnings.push(
                        `Image height (${img.height}px) is smaller than recommended (${recommendations.minHeight}px)`
                      );
                    }
                    setWarnings(newWarnings);
                  };
                  img.src = URL.createObjectURL(file);
                }
                if (maxSize && file.size > maxSize) {
                  const actualSize = Math.round(file.size / 1024 / 1024);
                  const maxSizeMB = Math.round(maxSize / 1024 / 1024);
                  setWarnings((prev) => [
                    ...prev,
                    `File size (${actualSize}MB) is larger than recommended (${maxSizeMB}MB). This may affect performance.`,
                  ]);
                }

                // Create preview first
                if (onThumbnailSelect) {
                  console.log(
                    "📞 Calling onThumbnailSelect with file:",
                    file.name
                  );
                  onThumbnailSelect(file);
                }

                // Then update field value
                console.log("🔄 Updating field value with file:", file.name);
                field.handleChange(file as any);
              } else {
                console.log("❌ No file selected");
                field.handleChange(undefined);
              }
            }}
            className="hidden"
            id={`file-upload-${field.name}`}
            onBlur={() => field.handleBlur()}
            {...props}
          />
          <label
            htmlFor={`file-upload-${field.name}`}
            className="block text-center cursor-pointer"
          >
            <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-gray-100">
              <Upload className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-base font-medium mb-1 text-gray-900">
              Upload File
            </p>
            {maxSize && (
              <p className="text-sm text-gray-500">
                Up to {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            )}
          </label>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm font-medium text-blue-900 mb-1">
            Recommendations:
          </p>
          <ul className="text-xs text-blue-800 space-y-1">
            {recommendations.minWidth && (
              <li>• Minimum width: {recommendations.minWidth}px</li>
            )}
            {recommendations.minHeight && (
              <li>• Minimum height: {recommendations.minHeight}px</li>
            )}
            {recommendations.aspectRatio && (
              <li>• Aspect ratio: {recommendations.aspectRatio}</li>
            )}
            {recommendations.formats && (
              <li>• Formats: {recommendations.formats.join(", ")}</li>
            )}
            {recommendations.optimalSize && (
              <li>• Optimal size: {recommendations.optimalSize}</li>
            )}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-900 mb-1">Note:</p>
              <ul className="text-xs text-yellow-800 space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <FieldInfo field={field} />
    </div>
  );
}

/**
 * TanStack Form Submit Button Component (Official Pattern)
 * Displays submit state and handles form submission according to official docs
 */
export function FormSubmitButton({
  form,
  children,
  isSubmitting = false,
  className = "",
  ...props
}: {
  form: FormField;
  children: React.ReactNode;
  isSubmitting?: boolean;
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <form.Subscribe
      selector={(state: { canSubmit: boolean; isSubmitting: boolean }) => [
        state.canSubmit,
        state.isSubmitting,
      ]}
      children={([canSubmit, formIsSubmitting]: [boolean, boolean]) => (
        <button
          type="submit"
          disabled={!canSubmit || isSubmitting || formIsSubmitting}
          className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
          {...props}
        >
          {isSubmitting || formIsSubmitting ? "..." : children}
        </button>
      )}
    />
  );
}

/**
 * TanStack Form Reset Button Component (Official Pattern)
 * Handles form reset according to official docs
 */
export function FormResetButton({
  form,
  children,
  className = "",
  ...props
}: {
  form: FormField;
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        form.reset();
      }}
      className={`px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Enhanced form error display component
interface FormErrorProps {
  errors: string[] | string;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({
  errors,
  className = "",
}) => {
  const errorList = Array.isArray(errors) ? errors : [errors].filter(Boolean);

  if (errorList.length === 0) return null;

  return (
    <div
      className={cn(
        "bg-red-50 border border-red-200 rounded-lg p-4",
        className
      )}
    >
      <p className="text-red-800 text-sm font-medium mb-1">
        {errorList.length === 1 ? "Validation Error" : "Validation Errors"}
      </p>
      <ul className="text-red-600 text-sm space-y-1">
        {errorList.map((error, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">•</span>
            <span>{error}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Helper function to generate file preview
export const generateFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
};

export const FormDropdown = ({
  field,
  label,
  options,
  required = false,
  className = "",
  placeholder = "Select an option",
  actionButton,
  children,
  ...props
}: {
  field: FormField<string>;
  label?: string;
  options: { value: string; label: string }[];
  required?: boolean;
  className?: string;
  placeholder?: string;
  errorClassName?: string;
  actionButton?: React.ReactNode;
  children?: React.ReactNode;
  [key: string]: unknown;
}) => {
  // Get unique errors only
  const errors = field.state.meta.errors.filter(Boolean).map(getErrorMessage);
  const uniqueErrors = Array.from(new Set(errors));
  const hasError = uniqueErrors.length > 0;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor={field.name}
            className="block text-sm font-medium text-gray-900"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {actionButton}
        </div>
      )}
      <Dropdown
        items={options}
        value={field.state.value || ""}
        onChange={(value) => {
          field.handleChange(value);
          field.handleBlur();
        }}
        placeholder={placeholder}
        error={hasError}
        size="lg"
        variant="solid"
        className="w-full"
      />
      {children}
      <FieldInfo field={field} />
    </div>
  );
};

// Form field validation wrapper
export const validateField = (
  value: unknown,
  validator: z.ZodSchema
): string | undefined => {
  const result = validator.safeParse(value);
  if (!result.success) {
    return result.error.errors[0]?.message;
  }
  return undefined;
};

// Enhanced input with better styling and accessibility
interface EnhancedFormInputProps {
  field: FormField<string | number>;
  label?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  helperText?: string;
  onChange?: (value: string | number) => void;
  onBlur?: () => void;
  min?: string | number;
  max?: string | number;
  step?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const EnhancedFormInput: React.FC<EnhancedFormInputProps> = ({
  field,
  label,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  className = "",
  error,
  helperText,
  onChange,
  onBlur,
  min,
  max,
  step,
  icon,
  iconPosition = "left",
}) => {
  // Get unique errors only
  const errors = field.state.meta.errors.filter(Boolean).map(getErrorMessage);
  const uniqueErrors = Array.from(new Set(errors));
  const errorMessage = error || uniqueErrors[0];

  const inputRef = useRef<HTMLInputElement>(null);
  const hasError = !!errorMessage;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label
          htmlFor={field.name}
          className={cn(
            "block text-sm font-medium text-gray-900",
            required && 'after:content-["*"] after:ml-1 after:text-red-500'
          )}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {icon && iconPosition === "left" && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}

        <input
          ref={inputRef}
          id={field.name}
          type={type}
          value={field.state.value ?? ""}
          onChange={(e) => {
            const value =
              type === "number"
                ? e.target.value === ""
                  ? ""
                  : Number(e.target.value)
                : e.target.value;
            field.handleChange(value as any);
            onChange?.(value as any);
          }}
          onBlur={() => {
            field.handleBlur();
            onBlur?.();
          }}
          disabled={disabled}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={cn(
            "w-full px-4 py-3 border-2 rounded-lg transition-all duration-200",
            "placeholder:text-gray-400 text-gray-900",
            "disabled:bg-gray-50 disabled:text-gray-500",
            hasError
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50"
              : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            icon && iconPosition === "left" && "pl-10",
            icon && iconPosition === "right" && "pr-10"
          )}
        />

        {icon && iconPosition === "right" && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
      </div>

      {errorMessage && (
        <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
      )}

      {helperText && !errorMessage && (
        <p className="text-gray-500 text-sm">{helperText}</p>
      )}
    </div>
  );
};
