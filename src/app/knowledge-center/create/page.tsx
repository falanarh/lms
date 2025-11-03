'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Upload, Calendar, Link, FileText, Save, Eye } from 'lucide-react';
import RichTextEditor from '@/components/knowledge-center/RichTextEditor';
import MediaPicker from '@/components/knowledge-center/MediaPicker';
import { useCreateKnowledge, useSubjects, usePenyelenggara } from '@/hooks/useKnowledgeCenter';
import { CreateKnowledgeFormData, CreateKnowledgeStep, KnowledgeType, MediaType } from '@/types/knowledge-center';

const steps = [
  { id: 1, title: 'Tipe Knowledge', description: 'Pilih jenis konten yang akan dibuat' },
  { id: 2, title: 'Informasi Umum', description: 'Isi data dasar knowledge' },
  { id: 3, title: 'Detail Konten', description: 'Lengkapi informasi spesifik' },
  { id: 4, title: 'Review & Publikasi', description: 'Periksa dan publikasikan' },
];

export default function CreateKnowledgePage() {
  const router = useRouter();
  const { createKnowledge, isCreating } = useCreateKnowledge();
  const { subjects } = useSubjects();
  const { penyelenggara } = usePenyelenggara();

  const [currentStep, setCurrentStep] = useState<CreateKnowledgeStep>(1);
  const [formData, setFormData] = useState<CreateKnowledgeFormData>({
    title: '',
    description: '',
    subject: '',
    penyelenggara: '',
    knowledge_type: undefined,
    author: 'Current User', // This should come from auth context
    tags: [],
    published_at: new Date().toISOString(),
    status: 'draft',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: keyof CreateKnowledgeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: CreateKnowledgeStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.knowledge_type) {
          newErrors.knowledge_type = 'Pilih tipe knowledge';
        }
        break;

      case 2:
        if (!formData.title.trim()) {
          newErrors.title = 'Title is required';
        }
        if (!formData.description.trim()) {
          newErrors.description = 'Description is required';
        }
        if (!formData.subject) {
          newErrors.subject = 'Subject is required';
        }
        if (!formData.penyelenggara) {
          newErrors.penyelenggara = 'Penyelenggara is required';
        }
        if (!formData.thumbnail && Number(currentStep) === 2) {
          newErrors.thumbnail = 'Thumbnail is required';
        }
        break;

      case 3:
        if (formData.knowledge_type === 'webinar') {
          if (!formData.tgl_zoom) {
            newErrors.tgl_zoom = 'Tanggal webinar is required';
          }
        } else {
          if (!formData.media_resource) {
            newErrors.media_resource = 'Media file is required';
          }
        }
        break;

      case 4:
        // Review step - no validation needed
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (Number(currentStep) < 4) {
        setCurrentStep((currentStep + 1) as CreateKnowledgeStep);
      }
    }
  };

  const handlePrevious = () => {
    if (Number(currentStep) > 1) {
      setCurrentStep((currentStep - 1) as CreateKnowledgeStep);
    }
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    const finalData = { ...formData, status };

    try {
      await createKnowledge(finalData);
      router.push('/knowledge-center');
    } catch (error) {
      console.error('Failed to create knowledge:', error);
    }
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    updateFormData('tags', tags);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pilih Tipe Knowledge</h2>
              <p className="text-gray-600 mb-6">
                Pilih jenis konten yang ingin Anda buat. Setiap tipe memiliki fitur dan kolom yang berbeda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => updateFormData('knowledge_type', 'webinar')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  formData.knowledge_type === 'webinar'
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <div className="text-left">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Webinar</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Scheduled content with Zoom links, recordings, and JP GOJAGS integration.
                  </p>
                </div>
              </button>

              <button
                onClick={() => updateFormData('knowledge_type', 'konten')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  formData.knowledge_type === 'konten'
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <div className="text-left">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Article</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Articles, videos, podcasts, or module files with single media resource.
                  </p>
                </div>
              </button>
            </div>

            {errors.knowledge_type && (
              <p className="text-red-600 text-sm">{errors.knowledge_type}</p>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Umum</h2>
              <p className="text-gray-600 mb-6">
                Isi data dasar knowledge yang akan dibuat.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan title knowledge"
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Deskripsikan knowledge ini secara singkat"
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => updateFormData('subject', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.name}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                {errors.subject && (
                  <p className="text-red-600 text-sm mt-1">{errors.subject}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Penyelenggara *
                </label>
                <select
                  value={formData.penyelenggara}
                  onChange={(e) => updateFormData('penyelenggara', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih penyelenggara</option>
                  {penyelenggara.map((org) => (
                    <option key={org.id} value={org.name}>
                      {org.name}
                    </option>
                  ))}
                </select>
                {errors.penyelenggara && (
                  <p className="text-red-600 text-sm mt-1">{errors.penyelenggara}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail *
                </label>
                <MediaPicker
                  onFileSelect={(file) => updateFormData('thumbnail', file)}
                  onFileRemove={() => updateFormData('thumbnail', undefined)}
                  selectedFile={formData.thumbnail as File}
                  accept="image/*"
                  allowedTypes={['video', 'pdf', 'audio']} // Allow any for thumbnail
                />
                {errors.thumbnail && (
                  <p className="text-red-600 text-sm mt-1">{errors.thumbnail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Published Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.published_at ? new Date(formData.published_at).toISOString().slice(0, 16) : ''}
                  onChange={(e) => updateFormData('published_at', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tag1, tag2, tag3"
                />
                <p className="text-gray-500 text-sm mt-1">
                  Pisahkan tags dengan koma
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {formData.knowledge_type === 'webinar' ? 'Detail Webinar' : 'Detail Konten'}
              </h2>
              <p className="text-gray-600 mb-6">
                Lengkapi informasi spesifik sesuai tipe knowledge.
              </p>
            </div>

            {formData.knowledge_type === 'webinar' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Webinar *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.tgl_zoom ? new Date(formData.tgl_zoom).toISOString().slice(0, 16) : ''}
                      onChange={(e) => updateFormData('tgl_zoom', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.tgl_zoom && (
                      <p className="text-red-600 text-sm mt-1">{errors.tgl_zoom}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link Zoom
                    </label>
                    <input
                      type="url"
                      value={formData.link_zoom || ''}
                      onChange={(e) => updateFormData('link_zoom', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link Recording
                    </label>
                    <input
                      type="url"
                      value={formData.link_record || ''}
                      onChange={(e) => updateFormData('link_record', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link YouTube
                    </label>
                    <input
                      type="url"
                      value={formData.link_youtube || ''}
                      onChange={(e) => updateFormData('link_youtube', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link Video Builder
                    </label>
                    <input
                      type="url"
                      value={formData.link_vb || ''}
                      onChange={(e) => updateFormData('link_vb', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jumlah JP
                    </label>
                    <input
                      type="number"
                      value={formData.jumlah_jp || ''}
                      onChange={(e) => updateFormData('jumlah_jp', parseInt(e.target.value) || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Notulensi PDF
                  </label>
                  <MediaPicker
                    onFileSelect={(file) => updateFormData('file_notulensi_pdf', file)}
                    onFileRemove={() => updateFormData('file_notulensi_pdf', undefined)}
                    selectedFile={formData.file_notulensi_pdf as File}
                    accept=".pdf"
                    allowedTypes={['pdf']}
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    Upload file notulensi dalam format PDF (maks 1 file)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GOJAGS Reference
                  </label>
                  <input
                    type="text"
                    value={formData.gojags_ref || ''}
                    onChange={(e) => updateFormData('gojags_ref', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ID atau link referensi GOJAGS"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Media Resource *
                  </label>
                  <MediaPicker
                    onFileSelect={(file) => updateFormData('media_resource', file)}
                    onFileRemove={() => updateFormData('media_resource', undefined)}
                    selectedFile={formData.media_resource as File}
                    allowedTypes={['video', 'pdf', 'audio']}
                  />
                  {errors.media_resource && (
                    <p className="text-red-600 text-sm mt-1">{errors.media_resource}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    Upload file video, PDF, atau audio (maks 1 file)
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content (Rich Text)
              </label>
              <RichTextEditor
                value={formData.content_richtext || ''}
                onChange={(value) => updateFormData('content_richtext', value)}
                placeholder="Tulis konten knowledge di sini..."
              />
              <p className="text-gray-500 text-sm mt-1">
                Gunakan rich text editor untuk membuat konten yang terstruktur
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Review & Publikasi</h2>
              <p className="text-gray-600 mb-6">
                Periksa kembali data yang telah Anda masukkan sebelum mempublikasikan.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-sm text-gray-600">Knowledge Type:</span>
                  <p className="font-medium text-gray-900">{formData.knowledge_type === 'webinar' ? 'Webinar' : 'Article'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Subject:</span>
                  <p className="font-medium text-gray-900">{formData.subject}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Organizer:</span>
                  <p className="font-medium text-gray-900">{formData.penyelenggara}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <p className="font-medium text-gray-900 capitalize">{formData.status}</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-600">Title:</span>
                <p className="font-medium text-gray-900 text-lg leading-relaxed">{formData.title}</p>
              </div>

              <div>
                <span className="text-sm text-gray-600">Description:</span>
                <p className="font-medium text-gray-900 leading-relaxed">{formData.description}</p>
              </div>

              {formData.tags.length > 0 && (
                <div className="md:col-span-2">
                  <span className="text-sm text-gray-600">Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.knowledge_type === 'webinar' && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Webinar Details:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {formData.tgl_zoom && (
                      <div>
                        <span className="text-gray-600">Tanggal:</span>
                        <p className="font-medium">
                          {new Date(formData.tgl_zoom).toLocaleString('id-ID')}
                        </p>
                      </div>
                    )}
                    {formData.jumlah_jp && (
                      <div>
                        <span className="text-gray-600">JP:</span>
                        <p className="font-medium">{formData.jumlah_jp}</p>
                      </div>
                    )}
                    {formData.link_zoom && (
                      <div>
                        <span className="text-gray-600">Zoom:</span>
                        <p className="font-medium text-blue-600 truncate">
                          {formData.link_zoom}
                        </p>
                      </div>
                    )}
                    {formData.gojags_ref && (
                      <div>
                        <span className="text-gray-600">GOJAGS:</span>
                        <p className="font-medium">{formData.gojags_ref}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {formData.knowledge_type === 'konten' && formData.media_resource && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Media Resource:</h3>
                  <p className="text-sm text-gray-600">
                    File: {(formData.media_resource as File).name}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Preview</h4>
                  <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                    Your knowledge content will appear like this on the detail and browse pages.
                  </p>
                  <button
                    type="button"
                    className="text-gray-700 hover:text-gray-900 text-sm font-medium mt-3 transition-colors"
                  >
                    Preview Knowledge →
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Knowledge</h1>
            <p className="text-gray-600">
              Create new knowledge content for the Knowledge Center
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      currentStep === step.id
                        ? 'bg-gray-900 text-white'
                        : currentStep > step.id
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium transition-colors ${
                      currentStep === step.id ? 'text-gray-900' : 'text-gray-600'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-4 transition-colors ${
                      currentStep > step.id ? 'bg-gray-700' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          {renderStepContent()}

          {/* Actions */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={Number(currentStep) === 1}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-3">
              {Number(currentStep) === 4 ? (
                <>
                  <button
                    onClick={() => handleSubmit('draft')}
                    disabled={isCreating}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {isCreating ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button
                    onClick={() => handleSubmit('published')}
                    disabled={isCreating}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {isCreating ? 'Publishing...' : 'Publish'}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={Number(currentStep) === 4}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}