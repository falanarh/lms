"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  useMasterContents,
  useCreateMasterContent,
  useUpdateMasterContent,
  useDeleteMasterContent,
} from "@/hooks/useMasterContent";
import { MasterContent } from "@/api/masterContent";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Drawer } from "@/components/ui/Drawer/Drawer";
import { Select } from "@/components/ui/Select/Select";
import { Pagination } from "@/components/shared/Pagination/Pagination";
import {
  ExternalLink,
  FileText,
  Video,
  HelpCircle,
  Link2,
  Package,
  Loader2,
  AlertCircle,
  X,
  CheckSquare,
  Edit3,
  Trash2,
  Search,
  Plus,
} from "lucide-react";
import Dropdown from "@/components/ui/Dropdown/Dropdown";
import { uploadFileToR2, validateFile } from "@/lib/uploadToR2";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog/ConfirmDialog";
import Toast from "@/components/ui/Toast/Toast";
import {
  validateCreateMasterContent,
  validateUpdateMasterContent,
  formatZodError,
} from "@/schemas/masterContent.schema";

// FileUploadArea Component - matches ActivityDrawerContent styling
const FileUploadArea = ({
  icon: Icon,
  label,
  accept,
  description,
  color,
  id,
  onChange,
  multiple = false,
}: any) => (
  <div>
    <Label>{label}</Label>
    <div
      className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-${color}-500 transition-colors cursor-pointer bg-white dark:bg-zinc-800`}
    >
      <Input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onChange}
        className="hidden"
        id={id}
      />
      <label htmlFor={id} className="cursor-pointer">
        <Icon className={`size-12 mx-auto mb-3 text-${color}-600`} />
        <p className="mb-1 text-gray-600 dark:text-zinc-400 font-medium">
          {description}
        </p>
      </label>
    </div>
  </div>
);

// UploadedFile Component - matches ActivityDrawerContent styling
const UploadedFile = ({ icon: Icon, name, color, onRemove, badge }: any) => (
  <div
    className={`p-3 bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-800 rounded-lg flex items-center justify-between transition-all`}
  >
    <div className="flex items-center gap-2">
      <Icon className={`size-4 text-${color}-600 dark:text-${color}-400}`} />
      <span
        className={`text-${color}-700 dark:text-${color}-300 text-sm font-medium truncate flex-1`}
      >
        {name}
      </span>
      {badge && (
        <Badge
          variant="outline"
          className={`text-xs border-${color}-300 dark:border-${color}-700 text-${color}-700 dark:text-${color}-300`}
        >
          {badge}
        </Badge>
      )}
    </div>
    <Button
      size="sm"
      variant="ghost"
      onClick={onRemove}
      className={`text-${color}-600 hover:text-${color}-700 hover:bg-${color}-100 dark:hover:bg-${color}-900/30 h-8 w-8 p-0`}
    >
      <X className="size-4" />
    </Button>
  </div>
);

export function BankContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Local state management instead of URL parameters
  const [currentPage, setCurrentPage] = useState(
    Math.max(1, parseInt(searchParams.get("page") || "1")),
  );
  const [perPage, setPerPage] = useState(
    Math.max(1, parseInt(searchParams.get("perPage") || "6")),
  );
  const [searchTitle, setSearchTitle] = useState(
    searchParams.get("search") || "",
  );
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "");

  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<MasterContent | null>(
    null,
  );
  const [searchInput, setSearchInput] = useState(searchTitle);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchTitle);
  const [formData, setFormData] = useState({
    type: "",
    name: "",
    description: "",
    contentUrl: "",
  });

  // File upload states
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploadedFileSize, setUploadedFileSize] = useState<string>("");

  // Video source selection
  const [videoSource, setVideoSource] = useState<"upload" | "link">("upload");
  const [videoUrl, setVideoUrl] = useState<string>("");

  // Toast and confirmation states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<
    "info" | "warning" | "success"
  >("success");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    id: string | null;
    title: string;
  }>({
    isOpen: false,
    id: null,
    title: "",
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Live validation function
  const validateFormData = (data: {
    type: string;
    name: string;
    description: string;
    contentUrl: string;
  }) => {
    const dataToValidate = {
      type: data.type,
      name: data.name,
      description: data.description || "",
      contentUrl: data.contentUrl || "",
    };

    const validationResult = validateCreateMasterContent(dataToValidate);

    if (!validationResult.success && validationResult.error) {
      const errors = formatZodError(validationResult.error);
      setValidationErrors(errors);
    } else {
      setValidationErrors({});
    }
  };

  // Live validation on form data changes
  useEffect(() => {
    // Only validate if drawer is open and form has some data
    if ((isCreateDrawerOpen || isEditDrawerOpen) && formData.type) {
      // Determine contentUrl based on type and source
      let contentUrl = "";
      if (formData.type === "LINK") {
        contentUrl = videoUrl;
      } else if (formData.type === "VIDEO" && videoSource === "link") {
        contentUrl = videoUrl;
      } else {
        contentUrl = uploadedFileUrl || "";
      }

      validateFormData({
        type: formData.type,
        name: formData.name,
        description: formData.description,
        contentUrl,
      });
    }
  }, [
    formData.type,
    formData.name,
    formData.description,
    videoUrl,
    uploadedFileUrl,
    videoSource,
    isCreateDrawerOpen,
    isEditDrawerOpen,
  ]);

  // Initialize local state from URL params only on component mount
  useEffect(() => {
    const initialPage = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const initialPerPage = Math.max(
      1,
      parseInt(searchParams.get("perPage") || "6"),
    );
    const initialSearch = searchParams.get("search") || "";
    const initialType = searchParams.get("type") || "";

    setCurrentPage(initialPage);
    setPerPage(initialPerPage);
    setSearchTitle(initialSearch);
    setTypeFilter(initialType);
    setSearchInput(initialSearch);
    setDebouncedSearchQuery(initialSearch);
  }, []); // Run only on mount

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchInput);
      // Update local state when debounced query changes
      setSearchTitle(searchInput.trim());
      setCurrentPage(1); // Reset to first page when searching
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Toast helper function
  const showToastMessage = (
    variant: "info" | "warning" | "success",
    message: string,
  ) => {
    setToastVariant(variant);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), variant === "success" ? 2000 : 3000);
  };

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useMasterContents({
    page: currentPage,
    perPage: perPage,
    searchQuery: debouncedSearchQuery,
    type: typeFilter,
  });

  const masterContents = response?.data || [];
  const pageMeta = response?.pageMeta;

  // Debug: Log pagination info
  console.log("🔍 BankContent Pagination Debug:", {
    currentPage,
    perPage,
    pageMeta,
    masterContentsLength: masterContents.length,
    shouldShowPagination: pageMeta?.totalPageCount > 1,
    searchQuery: debouncedSearchQuery,
    typeFilter: typeFilter,
  });

  // If current page is beyond available pages, reset to page 1
  useEffect(() => {
    const totalPages = pageMeta?.totalPageCount || 1;
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, pageMeta?.totalPageCount]);

  // Edit and Delete hooks
  const updateMasterContentMutation = useUpdateMasterContent({
    onSuccess: () => {
      showToastMessage("success", "Bank content berhasil diperbarui!");
      setIsEditDrawerOpen(false);
      setEditingContent(null);
      // Reset form
      setFormData({ type: "", name: "", description: "", contentUrl: "" });
      setUploadedFileUrl("");
      setUploadedFileName("");
      setUploadedFileSize("");
      setVideoUrl("");
      setVideoSource("upload");
      setUploadError("");
      setValidationErrors({});
      refetch();
    },
    onError: (error: any) => {
      showToastMessage(
        "warning",
        `${error.message || "Gagal memperbarui bank content"}`,
      );
    },
  });

  const deleteMasterContentMutation = useDeleteMasterContent({
    onSuccess: () => {
      showToastMessage("success", "Bank content berhasil dihapus!");
      refetch();
    },
    onError: (error: any) => {
      showToastMessage(
        "warning",
        `${error.message || "Gagal menghapus bank content"}`,
      );
    },
  });

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle per page change
  const handlePerPageChange = (perPageValue: string) => {
    const newPerPage = parseInt(perPageValue);
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing per page
  };

  // Handle search input change
  const handleSearch = (value: string) => {
    setSearchInput(value);
  };

  // Handle type filter
  const handleTypeFilter = (value: string) => {
    setTypeFilter(value === "all" ? "" : value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const createMasterContentMutation = useCreateMasterContent({
    onSuccess: () => {
      showToastMessage("success", "Bank content berhasil ditambahkan!");
      setIsCreateDrawerOpen(false);
      setFormData({ type: "", name: "", description: "", contentUrl: "" });
      setUploadedFileUrl("");
      setUploadedFileName("");
      setUploadedFileSize("");
      setVideoUrl("");
      setVideoSource("upload");
      setUploadError("");
      setValidationErrors({});
      refetch();
    },
    onError: (error: any) => {
      showToastMessage(
        "warning",
        `${error.message || "Gagal menambah bank content"}`,
      );
    },
  });

  const handleCreateContent = () => {
    // Clear previous validation errors
    setValidationErrors({});

    // Determine contentUrl and type based on source
    let contentUrl = "";
    let contentType = formData.type;

    if (formData.type === "LINK") {
      contentUrl = videoUrl;
    } else if (formData.type === "VIDEO" && videoSource === "link") {
      // ✅ Convert VIDEO with link source to LINK type (same as ActivityDrawerContent)
      contentType = "LINK";
      contentUrl = videoUrl;
    } else {
      contentUrl = uploadedFileUrl || "";
    }

    // Prepare data for validation
    const dataToValidate = {
      type: contentType,
      name: formData.name,
      description: formData.description || "",
      contentUrl,
    };

    // Validate with Zod schema
    const validationResult = validateCreateMasterContent(dataToValidate);

    if (!validationResult.success && validationResult.error) {
      const errors = formatZodError(validationResult.error);
      setValidationErrors(errors);

      // Show first error message
      const firstError = Object.values(errors)[0];
      showToastMessage("warning", firstError || "Data tidak valid");
      return;
    }

    // Additional file validation based on original type (before conversion)
    if (formData.type === "LINK" || (formData.type === "VIDEO" && videoSource === "link")) {
      if (!videoUrl.trim()) {
        showToastMessage(
          "warning",
          "Harap masukkan URL yang valid",
        );
        return;
      }
    } else if (formData.type !== "QUIZ" && formData.type !== "TASK") {
      // For VIDEO (upload), PDF, SCORM - file upload is required
      if (!uploadedFileUrl) {
        showToastMessage(
          "warning",
          `Harap upload file untuk tipe ${formData.type}`,
        );
        return;
      }
    }

    // Prepare data for API (use the converted type and contentUrl)
    const dataToSubmit = {
      type: contentType,
      name: formData.name,
      description: formData.description,
      contentUrl: contentUrl || uploadedFileUrl,
    };

    createMasterContentMutation.mutate(dataToSubmit);
  };

  const handleEditContent = (content: MasterContent) => {
    setEditingContent(content);
    setIsEditDrawerOpen(true);
    setValidationErrors({}); // Clear validation errors

    // Pre-fill form with existing data
    setFormData({
      type: content.type,
      name: content.name,
      description: content.description || "",
      contentUrl: content.contentUrl || "",
    });

    // Set file upload states if content exists
    if (content.contentUrl) {
      setUploadedFileUrl(content.contentUrl);
      // Extract filename from URL
      const fileName = content.contentUrl.split("/").pop() || content.name;
      setUploadedFileName(fileName);

      // Set video source if it's a video type with external URL
      if (content.type === "VIDEO" && content.contentUrl) {
        if (
          content.contentUrl.includes("youtube.com") ||
          content.contentUrl.includes("vimeo.com")
        ) {
          setVideoSource("link");
          setVideoUrl(content.contentUrl);
        } else {
          setVideoSource("upload");
        }
      }
    }
  };

  const handleUpdateContent = () => {
    if (!editingContent) {
      showToastMessage("warning", "Data konten tidak ditemukan");
      return;
    }

    // Clear previous validation errors
    setValidationErrors({});

    // Determine contentUrl and type based on source
    let contentUrl = "";
    let contentType = formData.type;

    if (formData.type === "LINK") {
      contentUrl = videoUrl;
    } else if (formData.type === "VIDEO" && videoSource === "link") {
      // ✅ Convert VIDEO with link source to LINK type (same as ActivityDrawerContent)
      contentType = "LINK";
      contentUrl = videoUrl;
    } else {
      contentUrl = uploadedFileUrl || editingContent.contentUrl || "";
    }

    // Prepare data for validation
    const dataToValidate = {
      type: contentType,
      name: formData.name,
      description: formData.description || "",
      contentUrl,
    };

    // Validate with Zod schema
    const validationResult = validateUpdateMasterContent(dataToValidate);

    if (!validationResult.success && validationResult.error) {
      const errors = formatZodError(validationResult.error);
      setValidationErrors(errors);

      // Show first error message
      const firstError = Object.values(errors)[0];
      showToastMessage("warning", firstError || "Data tidak valid");
      return;
    }

    // Additional file validation based on original type (before conversion)
    if (formData.type === "LINK" || (formData.type === "VIDEO" && videoSource === "link")) {
      if (!videoUrl.trim()) {
        showToastMessage(
          "warning",
          "Harap masukkan URL yang valid",
        );
        return;
      }
    } else if (formData.type !== "QUIZ" && formData.type !== "TASK") {
      // For VIDEO (upload), PDF, SCORM - file upload is required if new file was uploaded
      if (!uploadedFileUrl && !editingContent.contentUrl) {
        showToastMessage(
          "warning",
          `Harap upload file untuk tipe ${formData.type}`,
        );
        return;
      }
    }

    // Prepare data for API (use the converted type and contentUrl)
    const dataToSubmit = {
      type: contentType,
      name: formData.name,
      description: formData.description,
      contentUrl: contentUrl || editingContent.contentUrl,
    };

    updateMasterContentMutation.mutate({
      id: editingContent.id,
      updatedContent: dataToSubmit,
    });
  };

  const handleDeleteContent = (content: MasterContent) => {
    setDeleteConfirm({
      isOpen: true,
      id: content.id,
      title: content.name,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.id) {
      deleteMasterContentMutation.mutate(deleteConfirm.id);
    }
    setDeleteConfirm({ isOpen: false, id: null, title: "" });
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, id: null, title: "" });
  };

  // File upload handlers
  const handleFileUploadToR2 = async (
    file: File,
    onSuccess: (publicUrl: string, fileName: string) => void,
    contentType: string,
  ) => {
    if (!file) return;

    // Validate file based on content type
    const allowedTypes = {
      VIDEO: [
        "video/mp4",
        "video/mpeg",
        "video/quicktime",
        "video/x-msvideo",
        "video/webm",
      ],
      PDF: [
        "application/pdf",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/msword",
        "application/vnd.ms-powerpoint",
      ],
      SCORM: ["application/zip", "application/x-zip-compressed"],
      TASK: [
        "application/pdf",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/msword",
        "application/vnd.ms-powerpoint",
      ],
    };

    const maxSizes = {
      VIDEO: 50 * 1024 * 1024, // 50MB
      PDF: 5 * 1024 * 1024, // 5MB
      SCORM: 100 * 1024 * 1024, // 100MB
      TASK: 5 * 1024 * 1024, // 5MB
    };

    const types = allowedTypes[contentType as keyof typeof allowedTypes] || [];
    const maxSize =
      maxSizes[contentType as keyof typeof maxSizes] || 5 * 1024 * 1024;

    if (!validateFile(file, types, maxSize)) {
      const maxSizeMB = maxSize / (1024 * 1024);
      setUploadError(
        `File tidak valid. Pastikan file bertipe yang sesuai dan kurang dari ${maxSizeMB}MB`,
      );
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const uploadResult = await uploadFileToR2(file);
      setUploadedFileUrl(uploadResult.publicUrl);
      setUploadedFileName(uploadResult.fileName);
      setUploadedFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      onSuccess(uploadResult.publicUrl, uploadResult.fileName);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload gagal";
      setUploadError(errorMessage);
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleViewDocument = (content: MasterContent) => {
    if (!content.contentUrl || content.contentUrl.trim() === "") {
      alert("⚠️ No document URL available for this content");
      return;
    }

    // Open in new tab
    window.open(content.contentUrl, "_blank", "noopener,noreferrer");
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return <Video className="w-4 h-4" />;
      case "PDF":
        return <FileText className="w-4 h-4" />;
      case "QUIZ":
        return <HelpCircle className="w-4 h-4" />;
      case "LINK":
        return <Link2 className="w-4 h-4" />;
      case "TASK":
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const contentTypes = [
    { value: "VIDEO", label: "Video" },
    { value: "PDF", label: "PDF Document" },
    { value: "QUIZ", label: "Quiz" },
    { value: "TASK", label: "Task/Assignment" },
    { value: "LINK", label: "Link" },
    { value: "SCORM", label: "SCORM" },
  ];

  const typeFilterOptions = [
    { value: "all", label: "All Types" },
    { value: "VIDEO", label: "Video" },
    { value: "PDF", label: "PDF Document" },
    { value: "QUIZ", label: "Quiz" },
    { value: "TASK", label: "Task/Assignment" },
    { value: "LINK", label: "Link" },
    { value: "SCORM", label: "SCORM" },
  ];

  const perPageOptions = [
    { value: "6", label: "6" },
    { value: "12", label: "12" },
    { value: "24", label: "24" },
    { value: "48", label: "48" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading bank contents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading bank contents</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Bank Content
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {pageMeta
                ? `Manage ${pageMeta.totalResultCount} reusable content items for your courses`
                : "Manage reusable content for your courses"}
            </p>
          </div>
          <Button
            onClick={() => {
              setIsCreateDrawerOpen(true);
              setValidationErrors({}); // Clear validation errors
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Content
          </Button>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by title..."
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Type Filter Dropdown */}
          <div className="w-full sm:w-48">
            <Dropdown
              items={typeFilterOptions}
              value={typeFilter || "all"}
              onChange={handleTypeFilter}
              size="sm"
              variant="outline"
              searchable={false}
              placeholder="Filter by type"
              className="w-full"
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTitle || typeFilter) && (
          <div className="flex flex-wrap gap-2">
            {searchTitle && (
              <Badge variant="outline" className="flex items-center gap-1">
                Search: "{searchTitle}"
                <button
                  onClick={() => {
                    setSearchInput("");
                    setSearchTitle("");
                    setDebouncedSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </Badge>
            )}
            {typeFilter && (
              <Badge variant="outline" className="flex items-center gap-1">
                Type: {typeFilter}
                <button
                  onClick={() => {
                    setTypeFilter("");
                    setCurrentPage(1);
                  }}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Content Grid */}
      {masterContents && masterContents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {masterContents.map((content: MasterContent) => (
            <Card
              key={content.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      content.type === "VIDEO"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                        : content.type === "PDF"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : content.type === "QUIZ"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : content.type === "LINK"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    }`}
                  >
                    {getContentIcon(content.type)}
                    {content.type}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditContent(content)}
                      className="text-gray-500 hover:text-blue-600"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteContent(content)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {content.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {content.description || "No description available"}
                  </p>
                </div>

                {content.contentUrl && content.contentUrl.trim() !== "" && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-1 mb-1 font-medium">
                      Document URL:
                    </div>
                    <div className="break-all font-mono">
                      {content.contentUrl.length > 60
                        ? `${content.contentUrl.substring(0, 60)}...`
                        : content.contentUrl}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Created:{" "}
                    {content.createdAt
                      ? new Date(content.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </span>
                  <Button
                    onClick={() => handleViewDocument(content)}
                    variant="outline"
                    size="sm"
                    disabled={
                      !content.contentUrl || content.contentUrl.trim() === ""
                    }
                    className={`${
                      content.contentUrl && content.contentUrl.trim() !== ""
                        ? "text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        : "text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed"
                    }`}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    {content.contentUrl && content.contentUrl.trim() !== ""
                      ? "View Document"
                      : "No URL"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTitle || typeFilter
              ? "Tidak ada konten bank yang sesuai dengan kriteria pencarian Anda"
              : "Tidak ada konten bank yang tersedia"}
          </div>
          <Button
            onClick={() => setIsCreateDrawerOpen(true)}
            variant="outline"
            className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            Tambahkan bank content
          </Button>
        </div>
      )}

      {/* Pagination */}
      {pageMeta &&
        (pageMeta.totalPageCount > 1 || perPageOptions.length > 0) &&
        masterContents.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              {pageMeta.showingFrom > 0 && pageMeta.showingTo > 0 ? (
                <>
                  Menampilkan{" "}
                  <span className="font-medium">{pageMeta.showingFrom}</span> -{" "}
                  <span className="font-medium">{pageMeta.showingTo}</span> dari{" "}
                  <span className="font-medium">
                    {pageMeta.totalResultCount}
                  </span>{" "}
                  konten
                </>
              ) : (
                <>Total {pageMeta.totalResultCount} konten</>
              )}
            </div>

            <div className="flex items-center gap-4">
              {pageMeta.totalPageCount > 1 && (
                <div className="flex-1 flex justify-center">
                  <Pagination
                    totalPages={pageMeta.totalPageCount}
                    currentPage={pageMeta.page}
                    onPageChange={handlePageChange}
                    showPrevNext
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Tampilkan:
                </span>
                <Dropdown
                  items={perPageOptions}
                  value={perPage.toString()}
                  onChange={handlePerPageChange}
                  size="sm"
                  variant="outline"
                  searchable={false}
                  placeholder="Pilih"
                  className="min-w-32"
                />
              </div>
            </div>
          </div>
        )}

      {/* Create Content Drawer */}
      <Drawer
        isOpen={isCreateDrawerOpen}
        onClose={() => {
          setIsCreateDrawerOpen(false);
          setValidationErrors({});
        }}
        title="Tambah bank Content"
        size="lg"
        showFooter={false}
      >
        <div className="space-y-6">
          {/* Content Type Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content Type *
            </Label>
            <Select
              value={formData.type}
              onChange={(value) => {
                setFormData({ ...formData, type: value });
                // Reset video source when type changes
                if (value !== "VIDEO") {
                  setVideoSource("upload");
                  setVideoUrl("");
                }
                // Reset file upload state when type changes
                setUploadedFileUrl("");
                setUploadedFileName("");
                setUploadedFileSize("");
                setUploadError("");
              }}
              options={contentTypes}
              placeholder="Select content type"
              className="w-full"
            />
            {validationErrors.type && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {validationErrors.type}
              </p>
            )}
          </div>

          {/* Content Name */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content Name *
            </Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter content name"
              className={`w-full ${validationErrors.name ? "border-red-500" : ""}`}
            />
            {validationErrors.name && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {validationErrors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter content description"
              rows={3}
              className={`w-full ${validationErrors.description ? "border-red-500" : ""}`}
            />
            {validationErrors.description && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {validationErrors.description}
              </p>
            )}
          </div>

          {/* File Upload / URL Input based on type */}
          {formData.type === "LINK" && (
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                External Link *
              </Label>
              <Input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/resource"
                className={`w-full ${validationErrors.contentUrl ? "border-red-500" : ""}`}
              />
              {validationErrors.contentUrl && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {validationErrors.contentUrl}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter the external link URL
              </p>
            </div>
          )}

          {formData.type === "VIDEO" && (
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Video Source
              </Label>
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setVideoSource("upload")}
                  className={`flex-1 p-3 border-2 rounded-lg transition-all ${
                    videoSource === "upload"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Video className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <span className="text-sm font-medium">Upload Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVideoSource("link")}
                  className={`flex-1 p-3 border-2 rounded-lg transition-all ${
                    videoSource === "link"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Link2 className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                  <span className="text-sm font-medium">Video Link</span>
                </button>
              </div>

              {videoSource === "upload" && (
                <>
                  <FileUploadArea
                    icon={Video}
                    label="Upload Video"
                    accept="video/*"
                    description="Klik untuk upload video (Max 50MB) - Akan diupload ke Cloud Storage"
                    color="blue"
                    id="video-upload"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        const file = files[0];
                        handleFileUploadToR2(
                          file,
                          (url, name) => {
                            setUploadedFileUrl(url);
                            setUploadedFileName(name);
                          },
                          "VIDEO",
                        );
                      }
                    }}
                  />
                  {uploading && (
                    <div className="mt-3 flex items-center text-blue-600">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span className="text-sm">Mengupload video...</span>
                    </div>
                  )}
                  {uploadedFileName && !uploading && (
                    <div className="mt-3">
                      <UploadedFile
                        icon={Video}
                        name={uploadedFileName}
                        color="blue"
                        badge={uploadedFileSize}
                        onRemove={() => {
                          setUploadedFileUrl("");
                          setUploadedFileName("");
                          setUploadedFileSize("");
                        }}
                      />
                    </div>
                  )}
                  {!uploadedFileName &&
                    !uploading &&
                    validationErrors.contentUrl && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                        {validationErrors.contentUrl}
                      </p>
                    )}
                </>
              )}

              {videoSource === "link" && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Video URL *
                  </Label>
                  <Input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=example"
                    className={`w-full ${validationErrors.contentUrl ? "border-red-500" : ""}`}
                  />
                  {validationErrors.contentUrl && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {validationErrors.contentUrl}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter YouTube, Vimeo, or other video platform URL
                  </p>
                </div>
              )}
            </div>
          )}

          {formData.type === "PDF" && (
            <>
              <FileUploadArea
                icon={FileText}
                label="Upload Dokumen"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                description="Klik untuk upload dokumen (Max 5MB) - Akan diupload ke Cloud Storage"
                color="green"
                id="pdf-upload"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    const file = files[0];
                    handleFileUploadToR2(
                      file,
                      (url, name) => {
                        setUploadedFileUrl(url);
                        setUploadedFileName(name);
                      },
                      "PDF",
                    );
                  }
                }}
              />
              {uploading && (
                <div className="mt-3 flex items-center text-green-600">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="text-sm">Mengupload dokumen...</span>
                </div>
              )}
              {uploadedFileName && !uploading && (
                <div className="mt-3">
                  <UploadedFile
                    icon={FileText}
                    name={uploadedFileName}
                    color="green"
                    badge={uploadedFileSize}
                    onRemove={() => {
                      setUploadedFileUrl("");
                      setUploadedFileName("");
                      setUploadedFileSize("");
                    }}
                  />
                </div>
              )}
              {!uploadedFileName &&
                !uploading &&
                validationErrors.contentUrl && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    {validationErrors.contentUrl}
                  </p>
                )}
            </>
          )}

          {formData.type === "SCORM" && (
            <>
              <div>
                <Label>SCORM Package *</Label>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 mb-2">
                  Import konten pembelajaran dalam format SCORM 1.2 atau 2004
                  (Max 100MB) - Akan diupload ke Cloud Storage
                </p>
              </div>
              <FileUploadArea
                icon={Package}
                label=""
                accept=".zip"
                description="Klik untuk upload SCORM Package"
                color="purple"
                id="scorm-upload"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    const file = files[0];
                    handleFileUploadToR2(
                      file,
                      (url, name) => {
                        setUploadedFileUrl(url);
                        setUploadedFileName(name);
                      },
                      "SCORM",
                    );
                  }
                }}
              />
              {uploading && (
                <div className="mt-3 flex items-center text-purple-600">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="text-sm">Mengupload SCORM package...</span>
                </div>
              )}
              {uploadedFileName && !uploading && (
                <div className="mt-3">
                  <UploadedFile
                    icon={Package}
                    name={uploadedFileName}
                    color="purple"
                    badge={uploadedFileSize}
                    onRemove={() => {
                      setUploadedFileUrl("");
                      setUploadedFileName("");
                      setUploadedFileSize("");
                    }}
                  />
                </div>
              )}
              {!uploadedFileName &&
                !uploading &&
                validationErrors.contentUrl && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    {validationErrors.contentUrl}
                  </p>
                )}
            </>
          )}

          {/* Error Display */}
          {uploadError && (
            <div className="flex items-center text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">{uploadError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDrawerOpen(false);
                // Reset form
                setFormData({
                  type: "",
                  name: "",
                  description: "",
                  contentUrl: "",
                });
                setUploadedFileUrl("");
                setUploadedFileName("");
                setUploadedFileSize("");
                setVideoUrl("");
                setVideoSource("upload");
                setUploadError("");
                setValidationErrors({});
              }}
              disabled={createMasterContentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateContent}
              disabled={createMasterContentMutation.isPending || uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {(createMasterContentMutation.isPending || uploading) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {createMasterContentMutation.isPending
                ? "Creating..."
                : "Create Content"}
            </Button>
          </div>
        </div>
      </Drawer>

      {/* Edit Content Drawer */}
      <Drawer
        isOpen={isEditDrawerOpen}
        onClose={() => {
          setIsEditDrawerOpen(false);
          setValidationErrors({});
        }}
        title="Edit Bank Content"
        size="lg"
        showFooter={false}
      >
        <div className="space-y-6">
          {/* Content Type Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content Type *
            </Label>
            <Select
              value={formData.type}
              onChange={(value) => {
                setFormData({ ...formData, type: value });
                // Reset video source when type changes
                if (value !== "VIDEO") {
                  setVideoSource("upload");
                  setVideoUrl("");
                }
                // Reset file upload state when type changes
                setUploadedFileUrl("");
                setUploadedFileName("");
                setUploadedFileSize("");
                setUploadError("");
              }}
              options={contentTypes}
              placeholder="Select content type"
              className="w-full"
            />
            {validationErrors.type && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {validationErrors.type}
              </p>
            )}
          </div>

          {/* Content Name */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content Name *
            </Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter content name"
              className={`w-full ${validationErrors.name ? "border-red-500" : ""}`}
            />
            {validationErrors.name && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {validationErrors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter content description"
              rows={3}
              className={`w-full ${validationErrors.description ? "border-red-500" : ""}`}
            />
            {validationErrors.description && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {validationErrors.description}
              </p>
            )}
          </div>

          {/* File Upload / URL Input based on type */}
          {formData.type === "LINK" && (
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                External Link *
              </Label>
              <Input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/resource"
                className={`w-full ${validationErrors.contentUrl ? "border-red-500" : ""}`}
              />
              {validationErrors.contentUrl && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {validationErrors.contentUrl}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter the external link URL
              </p>
            </div>
          )}

          {formData.type === "VIDEO" && (
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Video Source
              </Label>
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setVideoSource("upload")}
                  className={`flex-1 p-3 border-2 rounded-lg transition-all ${
                    videoSource === "upload"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Video className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <span className="text-sm font-medium">Upload Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVideoSource("link")}
                  className={`flex-1 p-3 border-2 rounded-lg transition-all ${
                    videoSource === "link"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Link2 className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                  <span className="text-sm font-medium">Video Link</span>
                </button>
              </div>

              {videoSource === "upload" && (
                <>
                  <FileUploadArea
                    icon={Video}
                    label="Upload Video"
                    accept="video/*"
                    description="Klik untuk upload video (Max 50MB) - Akan diupload ke Cloud Storage"
                    color="blue"
                    id="video-upload-edit"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        const file = files[0];
                        handleFileUploadToR2(
                          file,
                          (url, name) => {
                            setUploadedFileUrl(url);
                            setUploadedFileName(name);
                          },
                          "VIDEO",
                        );
                      }
                    }}
                  />
                  {uploading && (
                    <div className="mt-3 flex items-center text-blue-600">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span className="text-sm">Mengupload video...</span>
                    </div>
                  )}
                  {uploadedFileName && !uploading && (
                    <div className="mt-3">
                      <UploadedFile
                        icon={Video}
                        name={uploadedFileName}
                        color="blue"
                        badge={uploadedFileSize}
                        onRemove={() => {
                          setUploadedFileUrl("");
                          setUploadedFileName("");
                          setUploadedFileSize("");
                        }}
                      />
                    </div>
                  )}
                  {editingContent &&
                    editingContent.contentUrl &&
                    !uploadedFileUrl &&
                    !uploading &&
                    videoSource === "upload" && (
                      <div className="mt-3">
                        <UploadedFile
                          icon={Video}
                          name={
                            editingContent.contentUrl.split("/").pop() ||
                            "existing video"
                          }
                          color="blue"
                          badge="Existing"
                          onRemove={() => {
                            setUploadedFileUrl("");
                            setUploadedFileName("");
                            setUploadedFileSize("");
                          }}
                        />
                      </div>
                    )}
                  {!uploadedFileName &&
                    !uploading &&
                    !editingContent?.contentUrl &&
                    validationErrors.contentUrl && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                        {validationErrors.contentUrl}
                      </p>
                    )}
                </>
              )}

              {videoSource === "link" && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Video URL *
                  </Label>
                  <Input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=example"
                    className={`w-full ${validationErrors.contentUrl ? "border-red-500" : ""}`}
                  />
                  {validationErrors.contentUrl && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {validationErrors.contentUrl}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter YouTube, Vimeo, or other video platform URL
                  </p>
                </div>
              )}
            </div>
          )}

          {formData.type === "PDF" && (
            <>
              <FileUploadArea
                icon={FileText}
                label="Upload Dokumen"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                description="Klik untuk upload dokumen (Max 5MB) - Akan diupload ke Cloud Storage"
                color="green"
                id="pdf-upload-edit"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    const file = files[0];
                    handleFileUploadToR2(
                      file,
                      (url, name) => {
                        setUploadedFileUrl(url);
                        setUploadedFileName(name);
                      },
                      "PDF",
                    );
                  }
                }}
              />
              {uploading && (
                <div className="mt-3 flex items-center text-green-600">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="text-sm">Mengupload dokumen...</span>
                </div>
              )}
              {uploadedFileName && !uploading && (
                <div className="mt-3">
                  <UploadedFile
                    icon={FileText}
                    name={uploadedFileName}
                    color="green"
                    badge={uploadedFileSize}
                    onRemove={() => {
                      setUploadedFileUrl("");
                      setUploadedFileName("");
                      setUploadedFileSize("");
                    }}
                  />
                </div>
              )}
              {editingContent &&
                editingContent.contentUrl &&
                !uploadedFileUrl &&
                !uploading && (
                  <div className="mt-3">
                    <UploadedFile
                      icon={FileText}
                      name={
                        editingContent.contentUrl.split("/").pop() ||
                        "existing document"
                      }
                      color="green"
                      badge="Existing"
                      onRemove={() => {
                        setUploadedFileUrl("");
                        setUploadedFileName("");
                        setUploadedFileSize("");
                      }}
                    />
                  </div>
                )}
              {!uploadedFileName &&
                !uploading &&
                !editingContent?.contentUrl &&
                validationErrors.contentUrl && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    {validationErrors.contentUrl}
                  </p>
                )}
            </>
          )}

          {formData.type === "SCORM" && (
            <>
              <div>
                <Label>SCORM Package</Label>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 mb-2">
                  Import konten pembelajaran dalam format SCORM 1.2 atau 2004
                  (Max 100MB) - Akan diupload ke Cloud Storage
                </p>
              </div>
              <FileUploadArea
                icon={Package}
                label=""
                accept=".zip"
                description="Klik untuk upload SCORM Package"
                color="purple"
                id="scorm-upload-edit"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    const file = files[0];
                    handleFileUploadToR2(
                      file,
                      (url, name) => {
                        setUploadedFileUrl(url);
                        setUploadedFileName(name);
                      },
                      "SCORM",
                    );
                  }
                }}
              />
              {uploading && (
                <div className="mt-3 flex items-center text-purple-600">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="text-sm">Mengupload SCORM package...</span>
                </div>
              )}
              {uploadedFileName && !uploading && (
                <div className="mt-3">
                  <UploadedFile
                    icon={Package}
                    name={uploadedFileName}
                    color="purple"
                    badge={uploadedFileSize}
                    onRemove={() => {
                      setUploadedFileUrl("");
                      setUploadedFileName("");
                      setUploadedFileSize("");
                    }}
                  />
                </div>
              )}
              {editingContent &&
                editingContent.contentUrl &&
                !uploadedFileUrl &&
                !uploading && (
                  <div className="mt-3">
                    <UploadedFile
                      icon={Package}
                      name={
                        editingContent.contentUrl.split("/").pop() ||
                        "existing package"
                      }
                      color="purple"
                      badge="Existing"
                      onRemove={() => {
                        setUploadedFileUrl("");
                        setUploadedFileName("");
                        setUploadedFileSize("");
                      }}
                    />
                  </div>
                )}
              {!uploadedFileName &&
                !uploading &&
                !editingContent?.contentUrl &&
                validationErrors.contentUrl && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    {validationErrors.contentUrl}
                  </p>
                )}
            </>
          )}

          {/* Error Display */}
          {uploadError && (
            <div className="flex items-center text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">{uploadError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDrawerOpen(false);
                // Reset form
                setEditingContent(null);
                setFormData({
                  type: "",
                  name: "",
                  description: "",
                  contentUrl: "",
                });
                setUploadedFileUrl("");
                setUploadedFileName("");
                setUploadedFileSize("");
                setVideoUrl("");
                setVideoSource("upload");
                setUploadError("");
                setValidationErrors({});
              }}
              disabled={updateMasterContentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateContent}
              disabled={updateMasterContentMutation.isPending || uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {(updateMasterContentMutation.isPending || uploading) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {updateMasterContentMutation.isPending
                ? "Updating..."
                : "Update Content"}
            </Button>
          </div>
        </div>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Hapus Bank Content?"
        description={`Apakah Anda yakin ingin menghapus "${deleteConfirm.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={deleteMasterContentMutation.isPending}
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <Toast
            variant={toastVariant}
            message={toastMessage}
            onClose={() => setShowToast(false)}
            autoDismiss={true}
            duration={toastVariant === "success" ? 2000 : 3000}
          />
        </div>
      )}

      {/* Styles for animations */}
      <style jsx global>{`
        @keyframes slide-in-from-bottom-5 {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-in {
          animation-duration: 200ms;
          animation-fill-mode: both;
        }
        .slide-in-from-bottom-5 {
          animation-name: slide-in-from-bottom-5;
        }
      `}</style>
    </div>
  );
}
