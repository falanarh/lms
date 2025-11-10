/**
 * Knowledge Settings Hook
 *
 * Hook untuk mengelola pengaturan knowledge center
 * Digunakan oleh komponen MediaPicker dan settings lainnya
 */

import { useState, useCallback } from 'react';
import { useToast } from './useToast';

export interface KnowledgeSettings {
  maxFileSize: number; // in bytes
  allowedFileTypes: {
    video: string[];
    image: string[];
    document: string[];
    audio: string[];
  };
  autoSave: boolean;
  defaultVisibility: 'public' | 'private' | 'draft';
  enableComments: boolean;
  enableLikes: boolean;
  enableSharing: boolean;
}

const defaultSettings: KnowledgeSettings = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedFileTypes: {
    video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    document: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'],
    audio: ['mp3', 'wav', 'ogg', 'aac', 'm4a'],
  },
  autoSave: true,
  defaultVisibility: 'draft',
  enableComments: true,
  enableLikes: true,
  enableSharing: true,
};

export const useKnowledgeSettings = () => {
  const [settings, setSettings] = useState<KnowledgeSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError, showInfo } = useToast();

  const updateSettings = useCallback((newSettings: Partial<KnowledgeSettings>) => {
    setIsLoading(true);

    try {
      // Simulate API call
      setTimeout(() => {
        setSettings(prev => ({ ...prev, ...newSettings }));
        setIsLoading(false);
        showSuccess('Settings updated successfully');
      }, 500);
    } catch (error) {
      setIsLoading(false);
      showError('Failed to update settings: ' + (error as Error).message);
    }
  }, [showSuccess, showError]);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    showInfo('Settings reset to defaults');
  }, [showInfo]);

  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    // Check file size
    if (file.size > settings.maxFileSize) {
      const maxSizeMB = Math.round(settings.maxFileSize / (1024 * 1024));
      return {
        isValid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`,
      };
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension) {
      return { isValid: false, error: 'Invalid file extension' };
    }

    const allowedTypes = [
      ...settings.allowedFileTypes.video,
      ...settings.allowedFileTypes.image,
      ...settings.allowedFileTypes.document,
      ...settings.allowedFileTypes.audio,
    ];

    if (!allowedTypes.includes(fileExtension)) {
      return {
        isValid: false,
        error: `File type .${fileExtension} is not allowed`,
      };
    }

    return { isValid: true };
  }, [settings]);

  const getAllowedTypesForCategory = useCallback((category: keyof typeof settings.allowedFileTypes) => {
    return settings.allowedFileTypes[category];
  }, [settings]);

  return {
    settings,
    updateSettings,
    resetSettings,
    validateFile,
    getAllowedTypesForCategory,
    isLoading,
  };
};

export const useKnowledgeSettingsManagement = () => {
  const { settings, updateSettings, resetSettings, isLoading } = useKnowledgeSettings();

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoading,
  };
};

export type UseKnowledgeSettingsReturn = ReturnType<typeof useKnowledgeSettings>;
export type UseKnowledgeSettingsManagementReturn = ReturnType<typeof useKnowledgeSettingsManagement>;