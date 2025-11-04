'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw, AlertCircle, Shield, FileText, Image, Video, Music } from 'lucide-react';
import { useKnowledgeSettings, useKnowledgeSettingsManagement } from '@/hooks/useKnowledgeCenter';

export default function KnowledgeSettingsPage() {
  const { settings, isLoading } = useKnowledgeSettings();
  const { updateSettings, isUpdating } = useKnowledgeSettingsManagement();

  const [formData, setFormData] = useState({
    rte_whitelist_tags: [] as string[],
    rte_allowed_attributes: {} as Record<string, string[]>,
    max_file_size: 50 * 1024 * 1024, // 50MB
    allowed_file_types: {
      video: ['mp4', 'avi', 'mov', 'wmv'],
      pdf: ['pdf'],
      audio: ['mp3', 'wav', 'ogg'],
      image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    },
    thumbnail_min_width: 800,
    thumbnail_min_height: 450,
    thumbnail_aspect_ratio: '16:9',
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'rte' | 'media' | 'thumbnails'>('rte');

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleFileTypeChange = (category: string, extensions: string[]) => {
    setFormData(prev => ({
      ...prev,
      allowed_file_types: {
        ...prev.allowed_file_types,
        [category]: extensions,
      },
    }));
    setHasChanges(true);
  };

  const handleAttributeChange = (tag: string, attribute: string, checked: boolean) => {
    setFormData(prev => {
      const newAttributes = { ...prev.rte_allowed_attributes };
      if (checked) {
        if (!newAttributes[tag]) newAttributes[tag] = [];
        if (!newAttributes[tag].includes(attribute)) {
          newAttributes[tag].push(attribute);
        }
      } else {
        if (newAttributes[tag]) {
          newAttributes[tag] = newAttributes[tag].filter(attr => attr !== attribute);
        }
      }
      return { ...prev, rte_allowed_attributes: newAttributes };
    });
    setHasChanges(true);
  };

  const handleTagToggle = (tag: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      rte_whitelist_tags: checked
        ? [...prev.rte_whitelist_tags, tag]
        : prev.rte_whitelist_tags.filter(t => t !== tag),
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateSettings(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleReset = () => {
    if (settings) {
      setFormData(settings);
      setHasChanges(false);
    }
  };

  const availableTags = [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'em', 'u', 's', 'strike',
    'ul', 'ol', 'li',
    'a', 'link',
    'blockquote', 'cite',
    'code', 'pre',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'img', 'picture',
    'br', 'hr',
    'div', 'span',
  ];

  const availableAttributes = {
    a: ['href', 'target', 'rel', 'title'],
    img: ['src', 'alt', 'width', 'height', 'title'],
    table: ['border', 'cellpadding', 'cellspacing'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan'],
    '*': ['class', 'id', 'style'],
  };

  const tabs = [
    { id: 'rte', label: 'Rich Text Editor', icon: FileText },
    { id: 'media', label: 'Media Settings', icon: Video },
    { id: 'thumbnails', label: 'Thumbnail Settings', icon: Image },
  ];

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
              <p className="text-gray-600">
                Configure Knowledge Center preferences and policies
              </p>
            </div>

            <div className="flex items-center gap-3">
              {hasChanges && (
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  Unsaved changes
                </div>
              )}

              <button
                onClick={handleReset}
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>

              <button
                onClick={handleSave}
                disabled={isUpdating || !hasChanges}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-8 bg-gray-100 p-1 rounded-lg w-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Rich Text Editor Settings */}
        {activeTab === 'rte' && (
          <div className="space-y-6">
            {/* Security Warning */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Security Notice</h3>
                  <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                    These settings control which HTML elements and attributes are allowed in rich text content.
                    Be conservative to prevent XSS attacks and maintain content security.
                  </p>
                </div>
              </div>
            </div>

            {/* Whitelist Tags */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Allowed HTML Tags</h3>
              <p className="text-gray-600 text-sm mb-4">
                Select which HTML tags are allowed in rich text content.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableTags.map((tag) => (
                  <label
                    key={tag}
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.rte_whitelist_tags.includes(tag)}
                      onChange={(e) => handleTagToggle(tag, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <code className="text-sm font-mono text-gray-700">&lt;{tag}&gt;</code>
                  </label>
                ))}
              </div>
            </div>

            {/* Allowed Attributes */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Allowed Attributes</h3>
              <p className="text-gray-600 text-sm mb-4">
                Configure which attributes are allowed for specific HTML tags.
              </p>

              <div className="space-y-4">
                {Object.entries(availableAttributes).map(([tag, attributes]) => (
                  <div key={tag} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      <code className="font-mono">&lt;{tag === '*' ? 'all tags' : tag}&gt;</code>
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {attributes.map((attr) => (
                        <label
                          key={attr}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={formData.rte_allowed_attributes[tag]?.includes(attr) || false}
                            onChange={(e) => handleAttributeChange(tag, attr, e.target.checked)}
                            className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="font-mono text-gray-700">{attr}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Media Settings */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">File Upload Settings</h3>

              <div className="space-y-6">
                {/* Max File Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum File Size
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="500"
                      value={formData.max_file_size / (1024 * 1024)}
                      onChange={(e) => handleInputChange('max_file_size', parseInt(e.target.value) * 1024 * 1024)}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={formData.max_file_size / (1024 * 1024)}
                      onChange={(e) => handleInputChange('max_file_size', parseInt(e.target.value) * 1024 * 1024)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">MB</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    Current limit: {formatFileSize(formData.max_file_size)}
                  </p>
                </div>

                {/* Allowed File Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Allowed File Extensions
                  </label>

                  <div className="space-y-4">
                    {/* Video Types */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Video className="w-5 h-5 text-red-600" />
                        <h4 className="font-medium text-gray-900">Video Files</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].map((ext) => (
                          <label
                            key={ext}
                            className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={formData.allowed_file_types.video.includes(ext)}
                              onChange={(e) => {
                                const newVideoTypes = e.target.checked
                                  ? [...formData.allowed_file_types.video, ext]
                                  : formData.allowed_file_types.video.filter(t => t !== ext);
                                handleFileTypeChange('video', newVideoTypes);
                              }}
                              className="w-3 h-3 text-blue-600 border-gray-300 rounded"
                            />
                            <span>.{ext}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Audio Types */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Music className="w-5 h-5 text-green-600" />
                        <h4 className="font-medium text-gray-900">Audio Files</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].map((ext) => (
                          <label
                            key={ext}
                            className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={formData.allowed_file_types.audio.includes(ext)}
                              onChange={(e) => {
                                const newAudioTypes = e.target.checked
                                  ? [...formData.allowed_file_types.audio, ext]
                                  : formData.allowed_file_types.audio.filter(t => t !== ext);
                                handleFileTypeChange('audio', newAudioTypes);
                              }}
                              className="w-3 h-3 text-blue-600 border-gray-300 rounded"
                            />
                            <span>.{ext}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Image Types */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Image className="w-5 h-5 text-blue-600" />
                        <h4 className="font-medium text-gray-900">Image Files</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].map((ext) => (
                          <label
                            key={ext}
                            className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={formData.allowed_file_types.image.includes(ext)}
                              onChange={(e) => {
                                const newImageTypes = e.target.checked
                                  ? [...formData.allowed_file_types.image, ext]
                                  : formData.allowed_file_types.image.filter(t => t !== ext);
                                handleFileTypeChange('image', newImageTypes);
                              }}
                              className="w-3 h-3 text-blue-600 border-gray-300 rounded"
                            />
                            <span>.{ext}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Thumbnail Settings */}
        {activeTab === 'thumbnails' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thumbnail Requirements</h3>

              <div className="space-y-6">
                {/* Dimensions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Width
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="100"
                        max="4000"
                        value={formData.thumbnail_min_width}
                        onChange={(e) => handleInputChange('thumbnail_min_width', parseInt(e.target.value))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">px</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Height
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="100"
                        max="4000"
                        value={formData.thumbnail_min_height}
                        onChange={(e) => handleInputChange('thumbnail_min_height', parseInt(e.target.value))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">px</span>
                    </div>
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Aspect Ratio
                  </label>
                  <select
                    value={formData.thumbnail_aspect_ratio}
                    onChange={(e) => handleInputChange('thumbnail_aspect_ratio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="16:9">16:9 (Widescreen)</option>
                    <option value="4:3">4:3 (Standard)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="9:16">9:16 (Vertical)</option>
                    <option value="3:2">3:2 (Photo)</option>
                  </select>
                  <p className="text-gray-500 text-sm mt-1">
                    This ratio will be used as the default for thumbnail cropping and display.
                  </p>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Preview
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
                    <div
                      className="bg-gray-200 rounded-lg mx-auto"
                      style={{
                        width: '320px',
                        height: '180px',
                        maxWidth: '100%',
                        aspectRatio: formData.thumbnail_aspect_ratio.replace(':', '/'),
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <Image className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm">Thumbnail Preview</p>
                          <p className="text-xs mt-1">
                            {formData.thumbnail_min_width} × {formData.thumbnail_min_height} minimum
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}