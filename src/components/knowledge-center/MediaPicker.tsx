/**
 * Media Picker Component
 * Focused on UI logic and presentation only
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, Video, FileText, Music } from 'lucide-react';
import { useKnowledgeSettings } from '@/hooks/useKnowledgeSettings';

interface MediaPickerProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile?: File;
  accept?: string;
  maxSize?: number;
  className?: string;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return Image;
  if (fileType.startsWith('video/')) return Video;
  if (fileType.startsWith('audio/')) return Music;
  if (fileType.includes('pdf') || fileType.includes('document')) return FileText;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function MediaPicker({
  onFileSelect,
  onFileRemove,
  selectedFile,
  accept = "image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.mp3,.wav,.ogg",
  maxSize,
  className = "",
}: MediaPickerProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { validateFile } = useKnowledgeSettings();

  const handleFileSelect = useCallback((file: File) => {
    setError('');

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    // Check custom max size if provided
    if (maxSize && file.size > maxSize) {
      setError(`File size exceeds ${formatFileSize(maxSize)} limit`);
      return;
    }

    onFileSelect(file);
  }, [onFileSelect, validateFile, maxSize]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    onFileRemove();
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (selectedFile) {
    const FileIcon = getFileIcon(selectedFile.type);
    return (
      <div className={`relative ${className}`}>
        <div className="border-2 border-green-200 rounded-xl p-6 bg-green-50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {selectedFile.name}
              </h4>
              <p className="text-xs text-gray-500">
                {formatFileSize(selectedFile.size)} • {selectedFile.type}
              </p>
            </div>
            <button
              onClick={removeFile}
              className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors duration-200"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            error
              ? 'bg-red-100'
              : isDragOver
              ? 'bg-blue-100'
              : 'bg-gray-200'
          }`}>
            <Upload className={`w-8 h-8 ${
              error
                ? 'text-red-600'
                : isDragOver
                ? 'text-blue-600'
                : 'text-gray-600'
            }`} />
          </div>

          <div className="mb-4">
            <h3 className={`text-lg font-medium mb-2 ${
              error
                ? 'text-red-900'
                : isDragOver
                ? 'text-blue-900'
                : 'text-gray-900'
            }`}>
              {isDragOver
                ? 'Drop your file here'
                : error
                ? 'Upload failed'
                : 'Upload media file'}
            </h3>
            <p className={`text-sm ${
              error
                ? 'text-red-600'
                : isDragOver
                ? 'text-blue-600'
                : 'text-gray-600'
            }`}>
              {error
                ? error
                : isDragOver
                ? 'Release to upload'
                : 'Drag and drop your file here, or click to browse'}
            </p>
          </div>

          <button
            onClick={openFileDialog}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm"
          >
            Choose File
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Supported formats: Images, Videos, Documents, Audio
          </p>
        </div>
      </div>
    </div>
  );
}