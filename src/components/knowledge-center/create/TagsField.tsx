// ============================================================================
// TAGS FIELD COMPONENT - Proper React Component
// File: src/components/knowledge-center/create/TagsField.tsx
// ============================================================================

"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface TagsFieldProps {
  field: any; // TanStack Form field
  label?: string;
  placeholder?: string;
  required?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const TagsField: React.FC<TagsFieldProps> = ({
  field,
  label = "Tags",
  placeholder = "Add tags (press Enter or comma to add)",
  required = false,
}) => {
  const [localTagInput, setLocalTagInput] = useState("");
  
  // Get current tags from field value
  const currentFieldTags = field.state.value || [];

  // ✅ AUTO-CLEAR ERRORS - Valid karena ini proper React component!
  useEffect(() => {
    const hasValue = Array.isArray(currentFieldTags) && currentFieldTags.length > 0;
    const hasErrors = field.state.meta.errors && field.state.meta.errors.length > 0;
    
    if (hasValue && hasErrors) {
      console.log('🔥 Tags: Auto-clearing errors, tag count:', currentFieldTags.length);
      setTimeout(() => {
        field.handleBlur();
      }, 0);
    }
  }, [currentFieldTags.length, field]);

  // Handlers
  const handleAddTag = () => {
    const trimmedTag = localTagInput.trim();
    if (trimmedTag && !currentFieldTags.includes(trimmedTag)) {
      const newTags = [...currentFieldTags, trimmedTag];
      field.handleChange(newTags);
      setLocalTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = currentFieldTags.filter((tag: string) => tag !== tagToRemove);
    field.handleChange(updatedTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Check for errors
  const hasErrors = field.state.meta.errors && field.state.meta.errors.length > 0;

  return (
    <div>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Tags Container */}
      <div
        className={`border-2 ${
          hasErrors ? 'border-red-500' : 'border-[var(--border,rgba(0,0,0,0.12))]'
        } rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all max-h-[120px] overflow-y-auto`}
      >
        {/* Existing Tags */}
        {currentFieldTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {currentFieldTags.map((tag: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-medium shadow-sm hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                <span>#{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  type="button"
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Input */}
        <input
          type="text"
          value={localTagInput}
          onChange={(e) => setLocalTagInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={field.handleBlur}
          placeholder={
            currentFieldTags.length === 0
              ? placeholder
              : "Add another tag..."
          }
          className="w-full border-none focus:outline-none bg-transparent text-sm placeholder:text-gray-400"
        />
      </div>

      {/* Error Message */}
      {hasErrors && (
        <p className="mt-1.5 text-sm text-red-600">
          {field.state.meta.errors[0]}
        </p>
      )}
    </div>
  );
};

export default TagsField;