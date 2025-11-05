"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  Calendar,
  Link as LinkIcon,
  FileText,
  Save,
  Eye,
  Sparkles,
  Check,
  Video,
  FileAudio,
  File,
  Zap,
  ArrowRight,
  X,
  User,
} from "lucide-react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";
import MediaPicker from "@/components/knowledge-center/MediaPicker";
import { Input } from "@/components/ui/Input/Input";
import { Dropdown } from "@/components/ui/Dropdown/Dropdown";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import {
  useCreateKnowledge,
  useSubjects,
  usePenyelenggara,
} from "@/hooks/useKnowledgeCenter";
import {
  CreateKnowledgeFormData,
  CreateKnowledgeStep,
  KnowledgeType,
  MediaType,
} from "@/types/knowledge-center";
import { useCreateBlockNote } from "@blocknote/react";

const steps = [
  { id: 1, title: "Content Type", description: "What are you creating?" },
  { id: 2, title: "Basic Info", description: "Tell us about it" },
  { id: 3, title: "Specific Details", description: "Add the content" },
  { id: 4, title: "Final Review", description: "Ready to publish?" },
];

export default function CreateKnowledgePage() {
  const router = useRouter();
  const { createKnowledge, isCreating } = useCreateKnowledge();
  const { subjects } = useSubjects();
  const { penyelenggara } = usePenyelenggara();

  const [currentStep, setCurrentStep] = useState<CreateKnowledgeStep>(1);
  const [formData, setFormData] = useState<CreateKnowledgeFormData>({
    title: "",
    description: "",
    subject: "",
    penyelenggara: "",
    knowledge_type: undefined,
    author: "",
    tags: [],
    published_at: new Date().toISOString(),
    status: "draft",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [currentTagInput, setCurrentTagInput] = useState<string>("");
  const [contentType, setContentType] = useState<
    "article" | "video" | "podcast" | "pdf" | null
  >(null);
  // Creates a new editor instance.
  const editor = useCreateBlockNote();

  // Auto scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Auto scroll when content type changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [contentType]);

  // Auto scroll when user goes back to content type selection
  useEffect(() => {
    if (currentStep === 3 && !contentType) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [currentStep, contentType]);

  const updateFormData = (field: keyof CreateKnowledgeFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleThumbnailSelect = (file: File) => {
    updateFormData("thumbnail", file);

    // Create preview URL for image
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleThumbnailRemove = () => {
    updateFormData("thumbnail", undefined);
    setThumbnailPreview(null);
  };

  const validateStep = (step: CreateKnowledgeStep): boolean => {
    const newErrors: Record<string, string> = {};

    // switch (step) {
    //   case 1:
    //     if (!formData.knowledge_type) {
    //       newErrors.knowledge_type = "Pilih tipe knowledge";
    //     }
    //     break;

    //   case 2:
    //     if (!formData.title.trim()) {
    //       newErrors.title = "Title is required";
    //     }
    //     if (!formData.description.trim()) {
    //       newErrors.description = "Description is required";
    //     }
    //     if (!formData.subject) {
    //       newErrors.subject = "Subject is required";
    //     }
    //     if (!formData.penyelenggara) {
    //       newErrors.penyelenggara = "Penyelenggara is required";
    //     }
    //     if (!formData.author.trim()) {
    //       newErrors.author = "Author is required";
    //     }
    //     if (!formData.thumbnail && Number(currentStep) === 2) {
    //       newErrors.thumbnail = "Thumbnail is required";
    //     }
    //     break;

    //   case 3:
    //     if (formData.knowledge_type === "webinar") {
    //       if (!formData.tgl_zoom) {
    //         newErrors.tgl_zoom = "Tanggal webinar is required";
    //       }
    //     } else {
    //       if (!formData.media_resource) {
    //         newErrors.media_resource = "Media file is required";
    //       }
    //     }
    //     break;

    //   case 4:
    //     break;
    // }

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

  const handleSubmit = async (status: "draft" | "published") => {
    const finalData = { ...formData, status };

    try {
      await createKnowledge(finalData);
      router.push("/knowledge-center");
    } catch (error) {
      console.error("Failed to create knowledge:", error);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = currentTagInput.trim();

      if (newTag && !formData.tags.includes(newTag)) {
        updateFormData("tags", [...formData.tags, newTag]);
        setCurrentTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateFormData(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <button
                onClick={() => updateFormData("knowledge_type", "webinar")}
                className={`group relative p-8 rounded-xl border-2 transition-all duration-200 text-left ${
                  formData.knowledge_type === "webinar"
                    ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50"
                    : "border-[var(--border,rgba(0,0,0,0.12))] hover:border-green-300 bg-white"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-colors ${
                    formData.knowledge_type === "webinar"
                      ? "bg-gradient-to-br from-green-500 to-emerald-600"
                      : "bg-gray-100 group-hover:bg-green-50"
                  }`}
                >
                  <Calendar
                    className={`w-6 h-6 ${formData.knowledge_type === "webinar" ? "text-white" : "text-gray-700 group-hover:text-green-600"}`}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Webinar
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Live sessions with recordings and GOJAGS integration
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                    Zoom
                  </span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                    Recording
                  </span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                    JP
                  </span>
                </div>
                {formData.knowledge_type === "webinar" && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>

              <button
                onClick={() => updateFormData("knowledge_type", "konten")}
                className={`group relative p-8 rounded-xl border-2 transition-all duration-200 text-left ${
                  formData.knowledge_type === "konten"
                    ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50"
                    : "border-[var(--border,rgba(0,0,0,0.12))] hover:border-blue-300 bg-white"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-colors ${
                    formData.knowledge_type === "konten"
                      ? "bg-gradient-to-br from-blue-500 to-cyan-600"
                      : "bg-gray-100 group-hover:bg-blue-50"
                  }`}
                >
                  <FileText
                    className={`w-6 h-6 ${formData.knowledge_type === "konten" ? "text-white" : "text-gray-700 group-hover:text-blue-600"}`}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Content
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Articles, videos, PDFs, or audio files with rich content
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    Video
                  </span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    PDF
                  </span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    Audio
                  </span>
                </div>
                {formData.knowledge_type === "konten" && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            </div>

            {errors.knowledge_type && (
              <p className="text-red-600 text-sm">{errors.knowledge_type}</p>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter a clear, descriptive title"
                value={formData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
                className={`w-full px-4 h-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 ${
                  errors.title
                    ? "border-red-500"
                    : "border-[var(--border,rgba(0,0,0,0.12))]"
                }`}
              />
              {errors.title && (
                <p className="text-red-600 text-xs mt-1.5">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Describe what learners will gain from this content"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 resize-y min-h-[48px] max-h-[200px] scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full ${
                  errors.description
                    ? "border-red-500"
                    : "border-[var(--border,rgba(0,0,0,0.12))]"
                }`}
              />
              {errors.description && (
                <p className="text-red-600 text-xs mt-1.5">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Organizer <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  items={penyelenggara.map((p) => ({
                    value: p.name,
                    label: p.name,
                  }))}
                  value={formData.penyelenggara}
                  onChange={(value) => updateFormData("penyelenggara", value)}
                  placeholder="Select organizer"
                  error={!!errors.penyelenggara}
                  size="lg"
                  variant="solid"
                  className="w-full"
                />
                {errors.penyelenggara && (
                  <p className="text-red-600 text-xs mt-1.5">
                    {errors.penyelenggara}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Author <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter author name"
                    value={formData.author}
                    onChange={(e) => updateFormData("author", e.target.value)}
                    className={`w-full pl-10 pr-4 h-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 ${
                      errors.author
                        ? "border-red-500"
                        : "border-[var(--border,rgba(0,0,0,0.12))]"
                    }`}
                  />
                </div>
                {errors.author && (
                  <p className="text-red-600 text-xs mt-1.5">{errors.author}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  items={subjects.map((s) => ({
                    value: s.name,
                    label: s.name,
                  }))}
                  value={formData.subject}
                  onChange={(value) => updateFormData("subject", value)}
                  placeholder="Select subject"
                  error={!!errors.subject}
                  size="lg"
                  variant="solid"
                  className="w-full"
                />
                {errors.subject && (
                  <p className="text-red-600 text-xs mt-1.5">
                    {errors.subject}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Published Date
                </label>
                <input
                  type="datetime-local"
                  value={
                    formData.published_at
                      ? new Date(formData.published_at)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    updateFormData("published_at", e.target.value)
                  }
                  className="w-full px-4 h-12 border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Thumbnail <span className="text-red-500">*</span>
              </label>
              {thumbnailPreview ? (
                <div className="relative border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-64 object-cover"
                  />
                  <button
                    onClick={handleThumbnailRemove}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white text-sm font-medium truncate">
                      {(formData.thumbnail as File)?.name}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors bg-white">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleThumbnailSelect(file);
                    }}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    className="cursor-pointer block text-center"
                  >
                    <div className="mx-auto w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-7 h-7 text-gray-600" />
                    </div>
                    <p className="text-base font-medium text-gray-900 mb-1">
                      Upload Thumbnail
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, JPEG up to 10MB • Recommended size: 1200x630px
                    </p>
                  </label>
                </div>
              )}
              {errors.thumbnail && (
                <p className="text-red-600 text-xs mt-1.5">
                  {errors.thumbnail}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Tags
              </label>
              <div className="border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full max-h-[120px] overflow-y-auto">
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-medium shadow-sm hover:from-blue-600 hover:to-blue-700 transition-all"
                      >
                        <span>#{tag}</span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                          type="button"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <input
                  type="text"
                  value={currentTagInput}
                  onChange={(e) => setCurrentTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={
                    formData.tags.length === 0
                      ? "Type a tag and press Enter or comma"
                      : "Add another tag..."
                  }
                  className="w-full h-12 px-4 outline-none text-gray-900 placeholder:text-gray-400 text-sm"
                />
              </div>
              <p className="text-gray-500 text-xs mt-1.5">
                Press Enter or comma to add a tag
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {formData.knowledge_type === "webinar" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Webinar Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={
                        formData.tgl_zoom
                          ? new Date(formData.tgl_zoom)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        updateFormData("tgl_zoom", e.target.value)
                      }
                      className="w-full px-4 h-12 border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                    />
                    {errors.tgl_zoom && (
                      <p className="text-red-600 text-xs mt-1.5">
                        {errors.tgl_zoom}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      JP Credits
                    </label>
                    <input
                      type="number"
                      value={formData.jumlah_jp || ""}
                      onChange={(e) =>
                        updateFormData(
                          "jumlah_jp",
                          parseInt(e.target.value) || undefined
                        )
                      }
                      className="w-full px-4 h-12 border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Zoom Link
                    </label>
                    <input
                      type="url"
                      value={formData.link_zoom || ""}
                      onChange={(e) =>
                        updateFormData("link_zoom", e.target.value)
                      }
                      className="w-full px-4 h-12 border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      YouTube Link
                    </label>
                    <input
                      type="url"
                      value={formData.link_youtube || ""}
                      onChange={(e) =>
                        updateFormData("link_youtube", e.target.value)
                      }
                      className="w-full px-4 h-12 border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Recording Link
                    </label>
                    <input
                      type="url"
                      value={formData.link_record || ""}
                      onChange={(e) =>
                        updateFormData("link_record", e.target.value)
                      }
                      className="w-full px-4 h-12 border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Virtual Background Link
                    </label>
                    <input
                      type="url"
                      value={formData.link_vb || ""}
                      onChange={(e) =>
                        updateFormData("link_vb", e.target.value)
                      }
                      className="w-full px-4 h-12 border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Notes PDF
                  </label>
                  {formData.file_notulensi_pdf ? (
                    <div className="relative border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg overflow-hidden bg-gray-50 h-64">
                      <div className="w-full h-full flex items-center justify-center p-8">
                        <div className="text-center">
                          <div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <FileText className="w-7 h-7 text-green-600" />
                          </div>
                          <p className="text-gray-900 text-sm font-medium truncate mb-2">
                            {(formData.file_notulensi_pdf as File).name}
                          </p>
                          <p className="text-gray-600 text-xs">
                            {(
                              (formData.file_notulensi_pdf as File).size /
                              (1024 * 1024)
                            ).toFixed(2)}{" "}
                            MB • PDF
                          </p>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <p className="text-white text-sm font-medium truncate">
                          {(formData.file_notulensi_pdf as File)?.name}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          updateFormData("file_notulensi_pdf", undefined)
                        }
                        className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-green-400 transition-colors bg-white">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) updateFormData("file_notulensi_pdf", file);
                        }}
                        className="hidden"
                        id="notes-pdf-upload"
                      />
                      <label
                        htmlFor="notes-pdf-upload"
                        className="cursor-pointer block text-center"
                      >
                        <div className="mx-auto w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Upload className="w-7 h-7 text-gray-600" />
                        </div>
                        <p className="text-base font-medium text-gray-900 mb-1">
                          Upload Notes PDF
                        </p>
                        <p className="text-sm text-gray-500">PDF up to 10MB</p>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {!contentType ? (
                  <div className="space-y-8">
                    <div className="text-center mb-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Choose Content Type
                      </h3>
                      <p className="text-gray-600">
                        Select the type of content you want to create
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <button
                        onClick={() => setContentType("article")}
                        className={`group relative p-8 rounded-xl border-2 transition-all duration-200 text-left ${
                          contentType === "article"
                            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50"
                            : "border-[var(--border,rgba(0,0,0,0.12))] hover:border-blue-300 bg-white"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-colors ${
                            contentType === "article"
                              ? "bg-gradient-to-br from-blue-500 to-cyan-600"
                              : "bg-gray-100 group-hover:bg-blue-50"
                          }`}
                        >
                          <FileText
                            className={`w-6 h-6 ${
                              contentType === "article"
                                ? "text-white"
                                : "text-gray-700 group-hover:text-blue-600"
                            }`}
                          />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Article
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          Write articles with rich text content and formatting
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            Rich Text
                          </span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            No File
                          </span>
                        </div>
                        {contentType === "article" && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>

                      <button
                        onClick={() => setContentType("video")}
                        className={`group relative p-8 rounded-xl border-2 transition-all duration-200 text-left ${
                          contentType === "video"
                            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50"
                            : "border-[var(--border,rgba(0,0,0,0.12))] hover:border-blue-300 bg-white"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-colors ${
                            contentType === "video"
                              ? "bg-gradient-to-br from-blue-500 to-cyan-600"
                              : "bg-gray-100 group-hover:bg-blue-50"
                          }`}
                        >
                          <Video
                            className={`w-6 h-6 ${
                              contentType === "video"
                                ? "text-white"
                                : "text-gray-700 group-hover:text-blue-600"
                            }`}
                          />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Video
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          Upload video content with rich text descriptions
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            MP4
                          </span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            MOV
                          </span>
                        </div>
                        {contentType === "video" && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>

                      <button
                        onClick={() => setContentType("podcast")}
                        className={`group relative p-8 rounded-xl border-2 transition-all duration-200 text-left ${
                          contentType === "podcast"
                            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50"
                            : "border-[var(--border,rgba(0,0,0,0.12))] hover:border-blue-300 bg-white"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-colors ${
                            contentType === "podcast"
                              ? "bg-gradient-to-br from-blue-500 to-cyan-600"
                              : "bg-gray-100 group-hover:bg-blue-50"
                          }`}
                        >
                          <FileAudio
                            className={`w-6 h-6 ${
                              contentType === "podcast"
                                ? "text-white"
                                : "text-gray-700 group-hover:text-blue-600"
                            }`}
                          />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Podcast/Audio
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          Upload audio content with show notes and transcripts
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            MP3
                          </span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            WAV
                          </span>
                        </div>
                        {contentType === "podcast" && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>

                      <button
                        onClick={() => setContentType("pdf")}
                        className={`group relative p-8 rounded-xl border-2 transition-all duration-200 text-left ${
                          contentType === "pdf"
                            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50"
                            : "border-[var(--border,rgba(0,0,0,0.12))] hover:border-blue-300 bg-white"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-colors ${
                            contentType === "pdf"
                              ? "bg-gradient-to-br from-blue-500 to-cyan-600"
                              : "bg-gray-100 group-hover:bg-blue-50"
                          }`}
                        >
                          <FileText
                            className={`w-6 h-6 ${
                              contentType === "pdf"
                                ? "text-white"
                                : "text-gray-700 group-hover:text-blue-600"
                            }`}
                          />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          PDF
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          Upload PDF documents with descriptions and summaries
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            PDF
                          </span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            Document
                          </span>
                        </div>
                        {contentType === "pdf" && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Back button */}
                    <button
                      onClick={() => setContentType(null)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mb-4"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Change Content Type
                    </button>

                    {/* Content Type Header */}
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        {contentType === "article" && (
                          <FileText className="w-5 h-5 text-blue-600" />
                        )}
                        {contentType === "video" && (
                          <Video className="w-5 h-5 text-blue-600" />
                        )}
                        {contentType === "podcast" && (
                          <FileAudio className="w-5 h-5 text-blue-600" />
                        )}
                        {contentType === "pdf" && (
                          <FileText className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {contentType}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {contentType === "article" &&
                            "Create rich text articles"}
                          {contentType === "video" && "Upload video content"}
                          {contentType === "podcast" && "Upload audio content"}
                          {contentType === "pdf" && "Upload PDF documents"}
                        </p>
                      </div>
                    </div>

                    {/* Media Resource (only for video, podcast, pdf) */}
                    {contentType !== "article" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Media Resource <span className="text-red-500">*</span>
                        </label>
                        {formData.media_resource ? (
                          <div className="relative border-2 border-[var(--border,rgba(0,0,0,0.12))] rounded-lg overflow-hidden bg-gray-50 h-64">
                            <div className="w-full h-full flex items-center justify-center p-8">
                              <div className="text-center">
                                <div className="mx-auto w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                  {formData.media_resource.type.startsWith(
                                    "video/"
                                  ) ? (
                                    <Video className="w-7 h-7 text-blue-600" />
                                  ) : formData.media_resource.type ===
                                    "application/pdf" ? (
                                    <FileText className="w-7 h-7 text-blue-600" />
                                  ) : formData.media_resource.type.startsWith(
                                      "audio/"
                                    ) ? (
                                    <FileAudio className="w-7 h-7 text-blue-600" />
                                  ) : (
                                    <File className="w-7 h-7 text-blue-600" />
                                  )}
                                </div>
                                <p className="text-gray-900 text-sm font-medium truncate mb-2">
                                  {(formData.media_resource as File).name}
                                </p>
                                <p className="text-gray-600 text-xs">
                                  {(
                                    (formData.media_resource as File).size /
                                    (1024 * 1024)
                                  ).toFixed(2)}{" "}
                                  MB •{" "}
                                  {formData.media_resource.type.startsWith(
                                    "video/"
                                  )
                                    ? "Video"
                                    : formData.media_resource.type ===
                                        "application/pdf"
                                      ? "PDF"
                                      : formData.media_resource.type.startsWith(
                                            "audio/"
                                          )
                                        ? "Audio"
                                        : "File"}
                                </p>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                              <p className="text-white text-sm font-medium truncate">
                                {(formData.media_resource as File)?.name}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                updateFormData("media_resource", undefined)
                              }
                              className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors bg-white">
                            <input
                              type="file"
                              accept={
                                contentType === "video"
                                  ? "video/*"
                                  : contentType === "podcast"
                                    ? "audio/*"
                                    : contentType === "pdf"
                                      ? ".pdf"
                                      : "*"
                              }
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file)
                                  updateFormData("media_resource", file);
                              }}
                              className="hidden"
                              id="media-resource-upload"
                            />
                            <label
                              htmlFor="media-resource-upload"
                              className="cursor-pointer block text-center"
                            >
                              <div className="mx-auto w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Upload className="w-7 h-7 text-gray-600" />
                              </div>
                              <p className="text-base font-medium text-gray-900 mb-1">
                                Upload{" "}
                                {contentType === "video"
                                  ? "Video"
                                  : contentType === "podcast"
                                    ? "Audio"
                                    : "PDF"}{" "}
                                File
                              </p>
                              <p className="text-sm text-gray-500">
                                {contentType === "video" &&
                                  "MP4, MOV up to 50MB"}
                                {contentType === "podcast" &&
                                  "MP3, WAV up to 50MB"}
                                {contentType === "pdf" && "PDF up to 10MB"}
                              </p>
                            </label>
                          </div>
                        )}
                        {errors.media_resource && (
                          <p className="text-red-600 text-xs mt-1.5">
                            {errors.media_resource}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Content (Rich Text Editor) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Content
                      </label>
                      <div className="border border-gray-200 rounded-lg p-4 min-h-128 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                        <BlockNoteView className="" editor={editor} />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 via-cyan-50/50 to-green-50/30 rounded-lg p-6 border-2 border-blue-200/50 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-blue-600">
                    Type
                  </span>
                  <p className="font-medium text-gray-900">
                    {formData.knowledge_type === "webinar"
                      ? "Webinar"
                      : contentType
                      ? `Content (${contentType.charAt(0).toUpperCase() + contentType.slice(1)})`
                      : "Content"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-blue-600">
                    Subject
                  </span>
                  <p className="font-medium text-gray-900">
                    {formData.subject}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-blue-600">
                    Organizer
                  </span>
                  <p className="font-medium text-gray-900">
                    {formData.penyelenggara}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-blue-600">
                    Author
                  </span>
                  <p className="font-medium text-gray-900">{formData.author}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-blue-200/50">
                <span className="text-xs font-semibold text-blue-600">
                  Title
                </span>
                <p className="font-semibold text-gray-900 text-lg mt-1">
                  {formData.title}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-blue-600">
                  Description
                </span>
                <p className="text-gray-700 mt-1">{formData.description}</p>
              </div>

              {thumbnailPreview && (
                <div>
                  <span className="text-xs font-semibold text-blue-600 block mb-2">
                    Thumbnail
                  </span>
                  <div className="rounded-lg overflow-hidden border-2 border-blue-200">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              )}

              {formData.tags.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-blue-600 block mb-2">
                    Tags
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.knowledge_type === "webinar" && formData.tgl_zoom && (
                <div className="pt-4 border-t border-blue-200/50">
                  <span className="text-xs font-semibold text-green-600 block mb-2">
                    Webinar Details
                  </span>
                  <div className="text-sm space-y-1">
                    <p className="text-gray-700">
                      Date:{" "}
                      {new Date(formData.tgl_zoom).toLocaleString("id-ID")}
                    </p>
                    {formData.jumlah_jp && (
                      <p className="text-gray-700">JP: {formData.jumlah_jp}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style jsx global>{`
        /* Modern minimal scrollbar styling */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #f9fafb;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
          transition: background-color 0.2s ease;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        /* Firefox scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f9fafb;
        }

        *:hover {
          scrollbar-color: #9ca3af #f9fafb;
        }
      `}</style>
      <div className="min-h-screen bg-white">
        <div className="flex">
          {/* Left Sidebar - Vertical Wizard */}
          <div className="w-80 border-r border-[var(--border,rgba(0,0,0,0.12))]/50 min-h-screen p-8 bg-gradient-to-br from-slate-50 via-blue-50/40 to-blue-50/30">
            <div className="mb-12">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-blue-800 bg-clip-text text-transparent mb-1">
                Create Knowledge
              </h1>
              <p className="text-sm text-gray-600">Share your expertise</p>
            </div>

            {/* Vertical Steps */}
            <div className="space-y-1">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                const isLast = index === steps.length - 1;

                return (
                  <div key={step.id} className="relative">
                    <button
                      onClick={() => {
                        if (isCompleted) {
                          setCurrentStep(step.id as CreateKnowledgeStep);
                        }
                      }}
                      disabled={!isCompleted && !isActive}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
                          : isCompleted
                            ? "bg-white text-gray-900 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 cursor-pointer border border-green-200/50"
                            : "bg-transparent text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isActive
                              ? "bg-white text-blue-600"
                              : isCompleted
                                ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                                : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            step.id
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-semibold mb-0.5 ${
                              isActive
                                ? "text-white"
                                : isCompleted
                                  ? "text-gray-900"
                                  : "text-gray-400"
                            }`}
                          >
                            {step.title}
                          </p>
                          <p
                            className={`text-xs ${
                              isActive
                                ? "text-blue-100"
                                : isCompleted
                                  ? "text-gray-500"
                                  : "text-gray-400"
                            }`}
                          >
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Connector line */}
                    {!isLast && (
                      <div
                        className={`ml-7 h-2 w-px ${
                          isCompleted ? "bg-green-300" : "bg-gray-200"
                        }`}
                      ></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress percentage */}
            <div className="mt-8 pt-8 border-t border-[var(--border,rgba(0,0,0,0.12))]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-xs font-semibold text-blue-600">
                  {Math.round(((currentStep - 1) / (steps.length - 1)) * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out"
                  style={{
                    width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="border-b border-[var(--border,rgba(0,0,0,0.12))] px-8 py-6 bg-white">
              <div className="max-w-4xl">
                <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                  <span className="font-medium">Step {currentStep}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-600">
                    {steps[currentStep - 1].title}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {steps[currentStep - 1].description}
                </h2>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-8">
              <div className="w-full">
                {renderStepContent()}

                {/* Actions */}
                <div className="flex items-center justify-between mt-12 pt-8 border-t border-[var(--border,rgba(0,0,0,0.12))]">
                  <button
                    onClick={handlePrevious}
                    disabled={Number(currentStep) === 1}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>

                  <div className="flex items-center gap-3">
                    {Number(currentStep) === 4 ? (
                      <>
                        <button
                          onClick={() => handleSubmit("draft")}
                          disabled={isCreating}
                          className="px-5 py-2.5 text-sm font-medium border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          {isCreating ? "Saving..." : "Save Draft"}
                        </button>
                        <button
                          onClick={() => handleSubmit("published")}
                          disabled={isCreating}
                          className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl"
                        >
                          {isCreating ? "Publishing..." : "Publish"}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
