'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileVideo, FileText, Music, Image, AlertCircle } from 'lucide-react';
import { MediaType } from '@/types/knowledge-center';
import { useKnowledgeSettings } from '@/hooks/useKnowledgeCenter';

interface MediaPickerProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile?: File;
  accept?: string;
  maxSize?: number; // in bytes
  allowedTypes?: MediaType[];
  className?: string;
}

export default function MediaPicker({
  onFileSelect,
  onFileRemove,
  selectedFile,
  accept,
  maxSize,
  allowedTypes = ['video', 'pdf', 'audio'],
  className = ''
}: MediaPickerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { settings } = useKnowledgeSettings();

  const maxFileSize = maxSize || settings?.max_file_size || 50 * 1024 * 1024; // 50MB default
  const defaultAccept = [
    ...(allowedTypes.includes('video') ? ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'] : []),
    ...(allowedTypes.includes('pdf') ? ['application/pdf'] : []),
    ...(allowedTypes.includes('audio') ? ['audio/mp3', 'audio/wav', 'audio/ogg'] : []),
  ].join(',');

  const fileAccept = accept || defaultAccept;

  const getMediaType = (file: File): MediaType | null => {
    if (file.type.startsWith('video/')) return 'video';
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type.startsWith('audio/')) return 'audio';
    return null;
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size exceeds limit of ${Math.round(maxFileSize / (1024 * 1024))}MB`;
    }

    // Check file type
    const mediaType = getMediaType(file);
    if (!mediaType) {
      return 'Invalid file type. Please upload video, PDF, or audio files.';
    }

    if (!allowedTypes.includes(mediaType)) {
      return `File type ${mediaType} is not allowed.`;
    }

    return null;
  };

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setIsUploading(true);

    // Simulate upload process
    setTimeout(() => {
      onFileSelect(file);
      setIsUploading(false);
    }, 1000);
  }, [onFileSelect, maxFileSize, allowedTypes]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type?: MediaType) => {
    switch (type) {
      case 'video':
        return <FileVideo className="w-8 h-8 text-red-500" />;
      case 'pdf':
        return <FileText className="w-8 h-8 text-blue-500" />;
      case 'audio':
        return <Music className="w-8 h-8 text-green-500" />;
      default:
        return <Image className="w-8 h-8 text-gray-500" />;
    }
  };

  if (selectedFile) {
    const mediaType = getMediaType(selectedFile);

    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getFileIcon(mediaType || undefined)}
            <div>
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {formatFileSize(selectedFile.size)} • {mediaType?.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isUploading && (
          <div className="mt-3">
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Uploading file...</span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white border-2 border-dashed ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'} rounded-lg p-6 ${className}`}>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className="text-center"
      >
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Upload className="w-6 h-6 text-gray-600" />
        </div>

        <div className="mb-4">
          <p className="text-lg font-medium text-gray-900 mb-2">
            Upload your media file
          </p>
          <p className="text-sm text-gray-600 mb-1">
            Drag and drop your file here, or click to browse
          </p>
          <p className="text-xs text-gray-500">
            Maximum file size: {Math.round(maxFileSize / (1024 * 1024))}MB
          </p>
          <p className="text-xs text-gray-500">
            Supported formats: {allowedTypes.map(type => type.toUpperCase()).join(', ')}
          </p>
        </div>

        <button
          onClick={openFileDialog}
          disabled={isUploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : 'Choose File'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept={fileAccept}
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Upload Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {dragActive && (
        <div className="absolute inset-0 bg-blue-50 bg-opacity-50 rounded-lg border-2 border-blue-400 border-dashed flex items-center justify-center">
          <div className="text-center">
            <Upload className="w-12 h-12 text-blue-600 mx-auto mb-2" />
            <p className="text-lg font-medium text-blue-900">Drop your file here</p>
          </div>
        </div>
      )}
    </div>
  );
}