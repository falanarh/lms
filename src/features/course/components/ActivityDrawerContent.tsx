"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/Switch/Switch";
import {
  ChevronLeft,
  Video,
  Link,
  FileText,
  CheckSquare,
  Package,
  Calendar,
  Plus,
  X,
  Lock,
  Loader2,
  Clock,
  Target,
  XCircle,
} from "lucide-react";
import { useState, useEffect } from "react";

import SessionCard from "./SessionCardJadwalKurikulum";
import ActivityCard from "./ActivityCard";
import {
  getContentQueryKey,
  useCreateContent,
  useUpdateContent,
} from "@/hooks/useContent";
import {
  useCreateQuizWithContent,
  useUpdateQuizWithContent,
} from "@/hooks/useQuiz";
import { useCourseSchedules } from "@/hooks/useCourseSchedules";
import { Toast } from "@/components/ui/Toast/Toast";
import { queryClient } from "@/lib/queryClient";
import { getSectionQueryKey } from "@/hooks/useSections";
import { Content } from "@/api/contents";
import { useForm } from "@tanstack/react-form";
import {
  createLinkContentSchema,
  createPdfContentSchema,
  createScormContentSchema,
  createVideoContentSchema,
  updateLinkContentSchema,
  updatePdfContentSchema,
  updateScormContentSchema,
  updateVideoContentSchema,
  updateQuizContentSchema,
  createQuizContentSchema,
  createJadwalKurikulumContentSchema,
  updateJadwalKurikulumContentSchema,
  createContentSchema,
  updateContentSchema,
} from "@/schemas/content.schema";
import { create } from "sortablejs";
import { ZodError } from "zod";

type ActivityType =
  | "VIDEO"
  | "LINK"
  | "PDF"
  | "QUIZ"
  | "SCORM"
  | "jadwal_kurikulum"
  | null;
type ContentSource = "new" | "curriculum" | null;

// Material type for session
interface SessionMaterial {
  type: "pdf" | "video" | "doc" | "ppt";
  title: string;
  size: string;
}

// Session type for curriculum selection
interface Session {
  id: string;
  title: string;
  date: string;
  status: "upcoming" | "ongoing" | "completed";
  topic: string;
  duration: string;
  instructor: string;
  description?: string;
  materials?: SessionMaterial[];
  jp?: number; // Jumlah Pertemuan
  masterContent?: {
    name: string;
    description: string;
    contentUrl: string | null;
    type: string;
  };
  groupCourse?: {
    name: string;
  };
}

interface RestrictionState {
  prerequisiteEnabled: boolean;
  timeEnabled: boolean;
}

interface UploadedMaterial {
  id: string;
  title: string;
  size: string;
}

// ✅ UPDATE: Tambahkan contentId dan initialData
interface ActivityDrawerContentProps {
  onClose: () => void;
  onSave?: () => void;
  sectionId?: string;
  contentId?: string; // ✅ BARU: untuk mode edit
  initialData?: Content; // ✅ BARU: data existing untuk edit
}

// Group ID for fetching course schedules
const GROUP_ID = "b8d1607e-4edf-4f7a-8a0b-0552191bdd71";

const ACTIVITY_OPTIONS = [
  {
    type: "VIDEO",
    label: "Video Upload",
    description: "Upload file video lokal",
    icon: Video,
    color: "blue",
  },
  {
    type: "LINK",
    label: "Link Eksternal",
    description: "YouTube atau e-Certificate",
    icon: Link,
    color: "orange",
  },
  {
    type: "PDF",
    label: "PDF / Dokumen",
    description: "Upload PDF, DOC, PPT",
    icon: FileText,
    color: "green",
  },
  {
    type: "QUIZ",
    label: "Kuis",
    description: "Buat kuis interaktif",
    icon: CheckSquare,
    color: "purple",
  },
  {
    type: "SCORM",
    label: "SCORM Package",
    description: "Import konten SCORM 1.2 / 2004",
    icon: Package,
    color: "amber",
    span: 2,
  },
];

const CONTENT_SOURCE_OPTIONS = [
  {
    value: "curriculum",
    label: "Jadwal Kurikulum",
    description: "Pilih dari jadwal kurikulum yang tersedia",
    icon: Calendar,
    color: "blue",
  },
  {
    value: "new",
    label: "Konten Baru",
    description: "Buat konten activity baru",
    icon: Plus,
    color: "green",
  },
];

export function ActivityDrawerContent({
  onClose,
  onSave,
  sectionId,
  contentId,
  initialData,
}: ActivityDrawerContentProps) {
  // ✅ Determine if this is edit mode
  const isEditMode = !!contentId && !!initialData;

  const { mutate: createContent, isPending: isCreating } = useCreateContent({
    onSuccess: async () => {
      setShowToast(true);
      setToastMessage("Activity berhasil ditambahkan!");
      setToastVariant("success");

      await Promise.all([
        queryClient.refetchQueries({ queryKey: getContentQueryKey() }),
        queryClient.refetchQueries({ queryKey: getSectionQueryKey() }),
      ]);

      setTimeout(() => {
        onClose();
        if (onSave) onSave();
      }, 1500);
    },
    onError: (error: any) => {
      setShowToast(true);
      console.log(error);
      setToastMessage(error?.message || "Gagal menambahkan activity");
      setToastVariant("warning");
    },
  });

  // ✅ Quiz hooks for combined operations
  const { mutate: createQuizWithContent, isPending: isCreatingQuiz } =
    useCreateQuizWithContent({
      onSuccess: async () => {
        setShowToast(true);
        setToastMessage("Quiz berhasil ditambahkan!");
        setToastVariant("success");

        await Promise.all([
          queryClient.refetchQueries({ queryKey: getContentQueryKey() }),
          queryClient.refetchQueries({ queryKey: getSectionQueryKey() }),
          queryClient.invalidateQueries({ queryKey: ["quizzes"] }),
        ]);

        setTimeout(() => {
          onClose();
          if (onSave) onSave();
        }, 1500);
      },
      onError: (error: any) => {
        setShowToast(true);
        console.log(error);
        setToastMessage(error?.message || "Gagal menambahkan quiz");
        setToastVariant("warning");
      },
    });

  const { mutate: updateQuizWithContent, isPending: isUpdatingQuiz } =
    useUpdateQuizWithContent({
      onSuccess: async () => {
        setShowToast(true);
        setToastMessage("Quiz berhasil diupdate!");
        setToastVariant("success");

        await Promise.all([
          queryClient.refetchQueries({ queryKey: getContentQueryKey() }),
          queryClient.refetchQueries({ queryKey: getSectionQueryKey() }),
          queryClient.invalidateQueries({ queryKey: ["quizzes"] }),
        ]);

        setTimeout(() => {
          onClose();
          if (onSave) onSave();
        }, 1500);
      },
      onError: (error: any) => {
        setShowToast(true);
        console.log(error);
        setToastMessage(error?.message || "Gagal mengupdate quiz");
        setToastVariant("warning");
      },
    });

  // ✅ BARU: Hook untuk update content
  const { mutate: updateContent, isPending: isUpdating } = useUpdateContent({
    onSuccess: async () => {
      setShowToast(true);
      setToastMessage("Activity berhasil diupdate!");
      setToastVariant("success");

      await Promise.all([
        queryClient.refetchQueries({ queryKey: getContentQueryKey() }),
        queryClient.refetchQueries({ queryKey: getSectionQueryKey() }),
      ]);

      setTimeout(() => {
        onClose();
        if (onSave) onSave();
      }, 1500);
    },
    onError: (error: any) => {
      setShowToast(true);
      console.log(error);
      setToastMessage(error?.message || "Gagal mengupdate activity");
      setToastVariant("warning");
    },
  });

  // ✅ UPDATE di bagian onSubmit form
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      contentUrl: "",
      videoFile: undefined as File | undefined,
      documentFile: undefined as File | undefined,
      scormFile: undefined as File | undefined,
      contentStart: "",
      contentEnd: "",
    },
    onSubmit: async ({ value }) => {
      console.log("🚀 Form submission started:", {
        sectionId,
        isEditMode,
        selectedActivityType,
        formValue: value,
      });

      if (!sectionId && !isEditMode) {
        console.log("❌ No section ID found");
        setShowToast(true);
        setToastMessage("Section ID tidak ditemukan");
        setToastVariant("warning");
        return;
      }

      if (!selectedActivityType) {
        console.log("❌ No activity type selected");
        setShowToast(true);
        setToastMessage("Pilih jenis activity terlebih dahulu");
        setToastVariant("warning");
        return;
      }

      try {
        console.log("✅ Form validation passed, proceeding with submission...");
        // ✅ UPDATED: Prepare dates - null jika restriction tidak enabled
        // z.coerce.date() akan otomatis convert string ke Date object
        let contentStart: Date | null = null;
        let contentEnd: Date | null = null;

        // Hanya set dates jika restrictionEnabled DAN timeEnabled
        if (restrictionEnabled && restrictions.timeEnabled) {
          if (value.contentStart) {
            contentStart = new Date(value.contentStart);
          }
          if (value.contentEnd) {
            contentEnd = new Date(value.contentEnd);
          }
        }
        // ✅ Jika restriction OFF, contentStart dan contentEnd tetap null

        if (selectedActivityType === "QUIZ") {
          // ========== QUIZ CREATION/UPDATE ==========
          const contentData = {
            idSection: sectionId!,
            name: value.name,
            description: value.description || "",
            type: "QUIZ",
            contentUrl: "", // Quiz doesn't need contentUrl
            sequence: 12, // Simplified
          };

          const quizData = {
            durationLimit: quizTimeLimitEnabled
              ? parseInt(quizTimeLimit) || 60
              : 60, // Minimum 1 required by DTO validation, set to 60 as default
            totalQuestions: 1, // DTO requires positive number
            maxPoint: 100, // Default, can be calculated from questions
            passingScore: passingGradeEnabled
              ? parseFloat(quizGradeToPass) || 60
              : 60,
            attemptLimit: parseInt(quizAttemptsAllowed) || 1,
            shuffleQuestions: quizShuffleQuestions,
          };

          if (isEditMode && contentId) {
            // UPDATE existing quiz
            updateQuizWithContent({
              id: contentId,
              data: {
                content: contentData,
                quiz: quizData,
              },
            });
          } else {
            // CREATE new quiz
            createQuizWithContent({
              content: contentData,
              quiz: quizData,
            });
          }
        } else {
          // ========== OTHER ACTIVITY TYPES ==========
          if (isEditMode && contentId) {
            // ========== MODE UPDATE ==========
            const updateData = {
              type: selectedActivityType,
              name: value.name,
              description: value.description || "",
              contentUrl: value.contentUrl || "",
              contentStart, // ✅ Date object or null - z.coerce.date() will handle it
              contentEnd, // ✅ Date object or null - z.coerce.date() will handle it
              ...(value.videoFile && { videoFile: value.videoFile }),
              ...(value.documentFile && { documentFile: value.documentFile }),
              ...(value.scormFile && { scormFile: value.scormFile }),
              // Add schedule data for jadwal_kurikulum
              ...(selectedActivityType === "jadwal_kurikulum" &&
                selectedSession && {
                  idSchedule: selectedSession.id,
                  scheduleName: selectedSession.title,
                  jp: selectedSession.jp,
                  scheduleDate: selectedSession.date,
                }),
            };

            const validatedData = updateContentSchema.parse(updateData);

            // ✅ Convert Date objects back to ISO strings for API
            const apiData = {
              ...validatedData,
              contentStart: validatedData.contentStart?.toISOString() ?? null,
              contentEnd: validatedData.contentEnd?.toISOString() ?? null,
            };

            updateContent({ id: contentId, data: apiData as any });
          } else {
            // ========== MODE CREATE ==========
            const sequence = 12; // Simplified

            // Use union schema instead of individual schema selection

            const createData = {
              idSection: sectionId!,
              type:
                selectedActivityType === "jadwal_kurikulum" && selectedSession
                  ? selectedSession.masterContent?.type
                  : selectedActivityType,
              name: value.name,
              description: value.description || "",
              contentUrl: value.contentUrl || "",
              sequence,
              contentStart, // ✅ Date object or null - z.coerce.date() will handle it
              contentEnd, // ✅ Date object or null - z.coerce.date() will handle it
              ...(value.videoFile && { videoFile: value.videoFile }),
              ...(value.documentFile && { documentFile: value.documentFile }),
              ...(value.scormFile && { scormFile: value.scormFile }),
              // Add schedule data for jadwal_kurikulum
              ...(selectedActivityType === "jadwal_kurikulum" &&
                selectedSession && {
                  idSchedule: selectedSession.id,
                  scheduleName: selectedSession.title,
                  jp: selectedSession.jp,
                  scheduleDate: selectedSession.date,
                }),
            };

            // Debug: Log complete createData object

            const validatedData = createContentSchema.parse(createData);

            // ✅ Convert Date objects back to ISO strings for API
            const apiData = {
              ...validatedData,
              contentStart: validatedData.contentStart?.toISOString() ?? null,
              contentEnd: validatedData.contentEnd?.toISOString() ?? null,
            };

            createContent(apiData as any);
          }
        }
      } catch (error) {
        console.log("❌ Form submission error:", {
          error,
          errorType:
            error instanceof Error ? error.constructor.name : "Unknown",
          isZodError: error instanceof ZodError,
          isRegularError: error instanceof Error,
          errorMessage: error instanceof Error ? error.message : String(error),
          zodIssues: error instanceof ZodError ? error.issues : null,
        });

        if (error instanceof ZodError) {
          setShowToast(true);
          setToastMessage(error.issues[0].message);
          setToastVariant("warning");
        } else if (error instanceof Error) {
          setShowToast(true);
          setToastMessage(error.message);
          setToastVariant("warning");
        } else {
          setShowToast(true);
          setToastMessage(
            `Terjadi kesalahan tidak diketahui: ${String(error)}`,
          );
          setToastVariant("warning");
        }
      }
    },
  });

  const [contentSource, setContentSource] = useState<ContentSource>(null);
  const [selectedActivityType, setSelectedActivityType] =
    useState<ActivityType>(null);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [uploadedMaterials, setUploadedMaterials] = useState<
    UploadedMaterial[]
  >([]);
  const [uploadedScorm, setUploadedScorm] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<
    "info" | "warning" | "success"
  >("success");
  const [restrictionEnabled, setRestrictionEnabled] = useState(false);
  const [restrictions, setRestrictions] = useState<RestrictionState>({
    prerequisiteEnabled: false,
    timeEnabled: false,
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [completionEnabled, setCompletionEnabled] = useState(false);
  const [mustOpenLink, setMustOpenLink] = useState(false);
  const [deadlineEnabled, setDeadlineEnabled] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [quizGradingEnabled, setQuizGradingEnabled] = useState(false);
  const [quizStartDate, setQuizStartDate] = useState("");
  const [quizEndDate, setQuizEndDate] = useState("");

  // Quiz specific state variables for database schema
  const [quizOpenDate, setQuizOpenDate] = useState("");
  const [quizCloseDate, setQuizCloseDate] = useState("");
  const [quizTimeLimitEnabled, setQuizTimeLimitEnabled] = useState(false);
  const [quizTimeLimit, setQuizTimeLimit] = useState("");
  const [quizTimeExpires, setQuizTimeExpires] = useState("auto-submit");
  const [quizAttemptsAllowed, setQuizAttemptsAllowed] = useState("1");
  const [quizGradingMethod, setQuizGradingMethod] = useState("highest");
  const [quizGradeToPass, setQuizGradeToPass] = useState("");
  const [quizShuffleQuestions, setQuizShuffleQuestions] = useState(false);
  const [quizTimingEnabled, setQuizTimingEnabled] = useState(false);
  const [passingGradeEnabled, setPassingGradeEnabled] = useState(false);

  // Fetch course schedules data - moved to top level to follow Rules of Hooks
  const {
    data: courseSchedules = [],
    isLoading,
    error,
  } = useCourseSchedules({
    idGroup: GROUP_ID,
  });

  // ✅ BARU: useEffect untuk pre-fill form saat edit mode - LENGKAP
  useEffect(() => {
    if (isEditMode && initialData) {
      // Set content source dan activity type
      setContentSource("new");
      setSelectedActivityType(initialData.type as ActivityType);

      // Set basic info
      form.setFieldValue("name", initialData.name || "");
      form.setFieldValue("description", initialData.description || "");

      // Set content based on type
      if (initialData.type === "LINK") {
        form.setFieldValue("contentUrl", initialData.contentUrl || "");
        setLinkUrl(initialData.contentUrl || "");
      } else if (initialData.type === "VIDEO") {
        form.setFieldValue("contentUrl", initialData.contentUrl || "");
        setUploadedVideo(initialData.contentUrl || "");
      } else if (initialData.type === "PDF") {
        if (initialData.contentUrl) {
          const fileName =
            initialData.contentUrl.split("/").pop() || initialData.contentUrl;
          setUploadedMaterials([
            {
              id: `existing-${Date.now()}`,
              title: fileName,
              size: "Unknown",
            },
          ]);
          form.setFieldValue("contentUrl", initialData.contentUrl);
        }
      } else if (initialData.type === "SCORM") {
        form.setFieldValue("contentUrl", initialData.contentUrl || "");
        setUploadedScorm(initialData.contentUrl || "");
      }

      // ✅ Set dates if available
      let hasTimeRestriction = false;

      if (initialData.contentStart) {
        const startDateObj = new Date(initialData.contentStart);
        const formattedStart = startDateObj.toISOString().slice(0, 16);
        form.setFieldValue("contentStart", formattedStart);
        setStartDate(formattedStart);
        hasTimeRestriction = true; // ✅ Ada contentStart = ada restriction
      }

      if (initialData.contentEnd) {
        const endDateObj = new Date(initialData.contentEnd);
        const formattedEnd = endDateObj.toISOString().slice(0, 16);
        form.setFieldValue("contentEnd", formattedEnd);
        setEndDate(formattedEnd);
        hasTimeRestriction = true; // ✅ Ada contentEnd = ada restriction
      }

      // ✅ Enable restriction section if contentStart OR contentEnd exists
      if (hasTimeRestriction) {
        setRestrictionEnabled(true);
        setRestrictions((prev) => ({ ...prev, timeEnabled: true }));
      }

      // ✅ TODO: Set completion settings if you store them in backend
      // For now, we assume completion is not stored in backend
      // If you have fields like `mustComplete`, `deadline`, etc in Content type:
      // setCompletionEnabled(initialData.mustComplete || false);
      // setDeadlineEnabled(!!initialData.deadline);
      // setDeadlineDate(initialData.deadline || "");
      // etc.
    }
  }, [isEditMode, initialData]);

  const handleSaveClick = () => {
    form.handleSubmit();
  };

  const handleRestrictionToggle = (type: keyof RestrictionState) => {
    setRestrictions((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleSessionSelect = (session: Session) => {
    console.log("🎯 Session selected:", session);

    // Set the selected session data
    setSelectedSession(session);

    // Auto-select the jadwal_kurikulum activity type
    console.log("🎯 Setting activity type to: jadwal_kurikulum");
    setSelectedActivityType("jadwal_kurikulum");

    // Pre-fill form with session data
    console.log("🎯 Pre-filling form with session data");
    form.setFieldValue("name", session.title);
    form.setFieldValue(
      "description",
      session.description ||
        session.masterContent?.description ||
        session.topic ||
        "",
    );
    console.log("🎯 Form values after pre-fill:", form.state.values);

    // If there's a content URL from masterContent, set it based on the material type
    if (session.masterContent?.contentUrl) {
      const contentUrl = session.masterContent.contentUrl;
      const contentType = session.masterContent.type.toLowerCase();

      // Set content URL based on material type
      form.setFieldValue("contentUrl", contentUrl);

      // Update the relevant state based on content type
      if (contentType === "video") {
        setUploadedVideo(contentUrl);
      } else if (contentType === "pdf") {
        setUploadedMaterials([
          {
            id: `curriculum-${Date.now()}`,
            title: session.masterContent.name,
            size: "Unknown",
          },
        ]);
      } else if (contentType === "link") {
        setLinkUrl(contentUrl);
      }
    }

    // Log JP information for debugging
    if (session.jp) {
      console.log("JP value:", session.jp);
      // You could set this to a duration field if you have one
      // For example: setDuration(`${session.jp * 45} menit`);
    }
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void,
  ) => {
    const file = event.target.files?.[0];
    if (file) setter(file.name);
  };

  const handleMaterialUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newMaterials = Array.from(files).map((file) => ({
      id: `${file.name}-${Date.now()}`,
      title: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    }));
    setUploadedMaterials((prev) => [...prev, ...newMaterials]);
  };

  const handleRemoveMaterial = (id: string) => {
    setUploadedMaterials((prev) =>
      prev.filter((material) => material.id !== id),
    );
  };

  // ✅ UPDATED: handleSave dengan logic untuk CREATE dan UPDATE
  const handleSave = () => {
    // Validation
    if (!sectionId && !isEditMode) {
      setShowToast(true);
      setToastMessage("Section ID tidak ditemukan");
      setToastVariant("warning");
      return;
    }

    if (!title.trim()) {
      setShowToast(true);
      setToastMessage("Judul activity tidak boleh kosong");
      setToastVariant("warning");
      return;
    }

    if (!selectedActivityType || selectedActivityType === "jadwal_kurikulum") {
      setShowToast(true);
      setToastMessage("Pilih tipe activity terlebih dahulu");
      setToastVariant("warning");
      return;
    }

    // Determine content_url based on activity type
    let contentUrl = "";
    if (selectedActivityType === "LINK") {
      if (!linkUrl.trim()) {
        setShowToast(true);
        setToastMessage("URL link tidak boleh kosong");
        setToastVariant("warning");
        return;
      }
      contentUrl = linkUrl;
    } else if (selectedActivityType === "VIDEO") {
      contentUrl = uploadedVideo || "";
    } else if (selectedActivityType === "PDF") {
      contentUrl = uploadedMaterials[0]?.title || "";
    } else if (selectedActivityType === "SCORM") {
      contentUrl = uploadedScorm || "";
    }

    // Prepare dates
    const now = new Date();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(now.getFullYear() + 1);

    const contentStart = new Date(startDate).toISOString();

    const contentEnd = new Date(endDate).toISOString();

    // ✅ LOGIC: Cek apakah ini UPDATE atau CREATE
    if (isEditMode && contentId) {
      // ========== MODE UPDATE ==========
      const updateData = {
        type: selectedActivityType,
        contentUrl: contentUrl,
        name: title,
        description: description || "",
        contentStart: contentStart,
        contentEnd: contentEnd,
        // sequence tidak perlu diupdate kecuali user drag-drop
      };

      updateContent({ id: contentId, data: updateData });
    } else {
      // ========== MODE CREATE ==========
      const sequence = 12; // Simplified - ideally from API or count

      const newContent = {
        idSection: sectionId!,
        type: selectedActivityType,
        contentUrl: contentUrl,
        name: title,
        description: description || "",
        contentStart: contentStart,
        contentEnd: contentEnd,
        sequence: sequence,
      };

      createContent(newContent);
    }
  };

  const BackButton = ({ onClick }: { onClick: () => void }) => (
    <Button variant="ghost" size="sm" onClick={onClick} className="my-4">
      <ChevronLeft className="size-4 mr-2" />
      Kembali
    </Button>
  );

  const CompletionSection = () => (
    <div className="my-4 space-y-4 border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-green-600 flex items-center justify-center">
            <CheckSquare className="size-5 text-white" />
          </div>
          <div>
            <h5 className="font-medium text-green-900">
              Pengaturan Penyelesaian
            </h5>
            <p className="text-sm text-green-700">
              Atur kriteria kapan activity dianggap selesai
            </p>
          </div>
        </div>
        <Switch checked={completionEnabled} onChange={setCompletionEnabled} />
      </div>

      {completionEnabled && (
        <div className="space-y-6">
          {selectedActivityType === "LINK" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h6 className="font-medium">Harus Membuka Tautan</h6>
                  <p className="text-sm text-gray-500">
                    Peserta harus membuka link ini agar dianggap selesai
                  </p>
                </div>
                <Switch checked={mustOpenLink} onChange={setMustOpenLink} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h6 className="font-medium">Tenggat Waktu</h6>
                <p className="text-sm text-gray-500">
                  Tetapkan deadline penyelesaian aktivitas
                </p>
              </div>
              <Switch checked={deadlineEnabled} onChange={setDeadlineEnabled} />
            </div>
            {deadlineEnabled && (
              <div>
                <Label
                  htmlFor="deadlineDate"
                  className="block text-sm font-medium text-gray-700 my-2"
                >
                  Deadline
                </Label>
                <Input
                  id="deadlineDate"
                  type="datetime-local"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                />
              </div>
            )}
          </div>

          {selectedActivityType === "QUIZ" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h6 className="font-medium">Penilaian</h6>
                    <p className="text-sm text-gray-500">
                      Aktifkan penilaian untuk kuis ini
                    </p>
                  </div>
                  <Switch
                    checked={quizGradingEnabled}
                    onChange={setQuizGradingEnabled}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="quizStartDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Mulai Kuis
                  </Label>
                  <Input
                    id="quizStartDate"
                    type="datetime-local"
                    value={quizStartDate}
                    onChange={(e) => setQuizStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="quizEndDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Selesai Kuis
                  </Label>
                  <Input
                    id="quizEndDate"
                    type="datetime-local"
                    value={quizEndDate}
                    onChange={(e) => setQuizEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

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
        className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-${color}-500 transition-colors`}
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
          <p className="mb-1 text-gray-600">{description}</p>
        </label>
      </div>
    </div>
  );

  const UploadedFile = ({ icon: Icon, name, color, onRemove, badge }: any) => (
    <div
      className={`p-3 bg-${color}-50 border border-${color}-200 rounded-lg flex items-center justify-between`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`size-4 text-${color}-600`} />
        <span className={`text-${color}-700`}>{name}</span>
        {badge && (
          <Badge variant="outline" className="text-xs">
            {badge}
          </Badge>
        )}
      </div>
      <Button size="sm" variant="ghost" onClick={onRemove}>
        <X className="size-4" />
      </Button>
    </div>
  );

  // ✅ UPDATE: RestrictionSection component
  const RestrictionSection = () => (
    <div className="my-4 space-y-4 border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-purple-600 flex items-center justify-center">
            <Lock className="size-5 text-white" />
          </div>
          <div>
            <h5 className="font-medium text-purple-900">Pembatasan Akses</h5>
            <p className="text-sm text-purple-600">
              Atur kapan dan bagaimana peserta dapat mengakses activity ini
            </p>
          </div>
        </div>
        <Switch
          checked={restrictionEnabled}
          onChange={(checked) => {
            setRestrictionEnabled(checked);
            // ✅ Jika restriction dimatikan, clear semua restriction settings
            if (!checked) {
              setRestrictions({
                prerequisiteEnabled: false,
                timeEnabled: false,
              });
              // ✅ Clear dates
              setStartDate("");
              setEndDate("");
              form.setFieldValue("contentStart", "");
              form.setFieldValue("contentEnd", "");
            }
          }}
        />
      </div>

      {restrictionEnabled && (
        <div className="space-y-6">
          <p className="text-sm text-gray-500">
            Pilih satu atau lebih pembatasan akses yang ingin diterapkan.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h6 className="font-medium">Activity Prasyarat</h6>
                <p className="text-sm text-gray-500">
                  Peserta harus menyelesaikan activity tertentu sebelum dapat
                  mengakses ini
                </p>
              </div>
              <Switch
                checked={restrictions.prerequisiteEnabled}
                onChange={() => handleRestrictionToggle("prerequisiteEnabled")}
              />
            </div>

            {restrictions.prerequisiteEnabled && (
              <div className="bg-gray-100 p-3 rounded-md text-sm text-gray-600">
                Pilih activity prasyarat dari daftar course sections.
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h6 className="font-medium">Pembatasan Waktu</h6>
                <p className="text-sm text-gray-500">
                  Tentukan rentang waktu kapan activity ini dapat diakses
                </p>
              </div>
              <Switch
                checked={restrictions.timeEnabled}
                onChange={(checked) => {
                  handleRestrictionToggle("timeEnabled");
                  // ✅ Jika time restriction dimatikan, clear dates
                  if (!checked) {
                    setStartDate("");
                    setEndDate("");
                    form.setFieldValue("contentStart", "");
                    form.setFieldValue("contentEnd", "");
                  }
                }}
              />
            </div>

            {restrictions.timeEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tersedia Mulai
                  </Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      form.setFieldValue("contentStart", e.target.value);
                    }}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tersedia Hingga
                  </Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      form.setFieldValue("contentEnd", e.target.value);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // ✅ SKIP content source selection if in edit mode
  if (isEditMode && !selectedActivityType) {
    // Auto-select based on initialData
    return null; // This shouldn't happen due to useEffect
  }

  // Curriculum Selection View
  if (contentSource === "curriculum" && !selectedActivityType) {
    return (
      <div>
        <BackButton onClick={() => setContentSource(null)} />
        <h4 className="mb-4">Pilih Sesi Kurikulum:</h4>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-12 rounded-xl bg-gray-200 animate-pulse"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Gagal Memuat Jadwal
            </h3>
            <p className="text-red-600 mb-4">
              Terjadi kesalahan saat memuat jadwal kurikulum. Silakan coba lagi.
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              Muat Ulang
            </Button>
          </div>
        )}

        {/* Success State */}
        {!isLoading && !error && (
          <div className="space-y-3">
            {courseSchedules.map((schedule) => {
              const sessionData = {
                id: schedule.id,
                title: schedule.name,
                date: new Date(schedule.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }),
                status: "upcoming" as const,
                topic: schedule.masterContent.name,
                duration: `${schedule.jp * 45} menit`, // Assuming JP = 45 minutes
                instructor: schedule.groupCourse.name,
                jp: schedule.jp, // Add JP value
                description: schedule.description, // Add description
                masterContent: schedule.masterContent, // Add masterContent data
                groupCourse: schedule.groupCourse, // Add groupCourse data
                materials: schedule.masterContent.contentUrl
                  ? [
                      {
                        type:
                          schedule.masterContent.type.toLowerCase() === "pdf"
                            ? ("pdf" as const)
                            : schedule.masterContent.type.toLowerCase() ===
                                "video"
                              ? ("video" as const)
                              : ("doc" as const),
                        title: schedule.masterContent.name,
                        size: "Unknown",
                      },
                    ]
                  : [],
              };

              return (
                <SessionCard
                  key={schedule.id}
                  title={sessionData.title}
                  topic={sessionData.topic}
                  status={sessionData.status}
                  date={sessionData.date}
                  duration={sessionData.duration}
                  instructor={sessionData.instructor}
                  materials={sessionData.materials}
                  jp={sessionData.jp}
                  onClick={() => handleSessionSelect(sessionData)}
                />
              );
            })}

            {/* Empty State */}
            {courseSchedules.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <div className="max-w-md mx-auto">
                  <Calendar className="size-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Belum Ada Jadwal
                  </h3>
                  <p className="text-gray-600">
                    Tidak ada jadwal kurikulum yang tersedia untuk saat ini.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

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
      </div>
    );
  }

  // Activity Type Selection View (skip if edit mode)
  if (contentSource === "new" && !selectedActivityType && !isEditMode) {
    return (
      <div className="space-y-4">
        <BackButton onClick={() => setContentSource(null)} />
        <h4 className="mb-4">Pilih jenis konten yang ingin ditambahkan:</h4>

        <div className="grid grid-cols-2 gap-4">
          {ACTIVITY_OPTIONS.map(
            ({ type, label, description, icon: Icon, color, span }) => (
              <Card
                key={type}
                className={`p-6 cursor-pointer hover:border-${color}-500 hover:shadow-lg transition-all ${span ? "col-span-2" : ""}`}
                onClick={() => setSelectedActivityType(type as ActivityType)}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div
                    className={`size-16 rounded-full bg-${color}-100 flex items-center justify-center`}
                  >
                    <Icon className={`size-8 text-${color}-600`} />
                  </div>
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                  </div>
                </div>
              </Card>
            ),
          )}
        </div>

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
      </div>
    );
  }

  // Activity Form View
  if (
    (contentSource && selectedActivityType) ||
    (isEditMode && selectedActivityType)
  ) {
    const showMaterialsList =
      selectedActivityType === "jadwal_kurikulum" && selectedSession;

    // Debug: Log form rendering state
    console.log("🎯 Form rendering:", {
      contentSource,
      selectedActivityType,
      isEditMode,
      showMaterialsList,
      hasSelectedSession: !!selectedSession,
    });

    return (
      <div className="space-y-4">
        {!isEditMode && (
          <BackButton
            onClick={() => {
              setSelectedActivityType(null);
              setSelectedSession(null);
            }}
          />
        )}

        {/* ✅ Show edit mode indicator */}
        {/* {isEditMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800 font-medium">
              📝 Mode Edit - Mengubah activity yang sudah ada
            </p>
          </div>
        )} */}

        {selectedActivityType !== "QUIZ" && (
          <>
            {/* ✅ Title Field with Validation */}
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.length < 3) {
                    return "Judul aktivitas harus minimal 3 karakter";
                  }
                  if (value.length > 200) {
                    return "Judul aktivitas maksimal 200 karakter";
                  }
                  return undefined;
                },
              }}
              children={(field) => (
                <div className="mb-4">
                  <Label htmlFor="activity-title">Judul Aktivitas</Label>
                  <Input
                    id="activity-title"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Masukkan judul aktivitas"
                    className="mt-1"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            />

            <form.Field
              name="description"
              validators={{
                onChange: ({ value }) => {
                  if (value && value.length > 0 && value.length < 10) {
                    return "Deskripsi harus minimal 10 karakter";
                  }
                  if (value && value.length > 1000) {
                    return "Deskripsi maksimal 1000 karakter";
                  }
                  return undefined;
                },
              }}
              children={(field) => (
                <div>
                  <Label htmlFor="activity-description">Deskripsi</Label>
                  <Textarea
                    id="activity-description"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Tambahkan deskripsi singkat tentang aktivitas ini"
                    className="mt-1 bg-transparent"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            />

            <RestrictionSection />
            <CompletionSection />

            {showMaterialsList && (
              <div className="mt-6">
                <Label className="mb-3 block">Materi Pembelajaran</Label>
                <div className="space-y-2">
                  {selectedSession.materials?.map(
                    (material: SessionMaterial, index: number) => {
                      return (
                        <ActivityCard
                          key={index}
                          title={material.title}
                          type={
                            material.type.toUpperCase() as
                              | "PDF"
                              | "VIDEO"
                              | "LINK"
                              | "SCORM"
                          }
                          showAction
                          actionLabel="Download"
                          onAction={() => {
                            console.log("View material:", material);
                          }}
                        />
                      );
                    },
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {selectedActivityType === "VIDEO" && (
          <form.Field
            name="videoFile"
            validators={{
              onChange: ({ value }) => {
                if (!value && !form.state.values.contentUrl) {
                  return "Video file atau URL harus diisi";
                }
                return undefined;
              },
            }}
            children={(field) => (
              <>
                <FileUploadArea
                  icon={Video}
                  label="Upload Video"
                  accept="video/*"
                  description="Klik untuk upload video (Max 50MB)"
                  color="blue"
                  id="video-upload"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      field.handleChange(file);
                      setUploadedVideo(file.name);
                    }
                  }}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    {field.state.meta.errors[0]}
                  </p>
                )}
                {uploadedVideo && (
                  <div className="mt-3">
                    <UploadedFile
                      icon={Video}
                      name={uploadedVideo}
                      color="blue"
                      onRemove={() => {
                        setUploadedVideo(null);
                        field.handleChange(undefined);
                      }}
                    />
                  </div>
                )}
              </>
            )}
          />
        )}

        {selectedActivityType === "LINK" && (
          <form.Field
            name="contentUrl"
            validators={{
              onChange: ({ value }) => {
                if (!value || value.trim() === "") {
                  return "URL link tidak boleh kosong";
                }
                try {
                  new URL(value);
                  return undefined;
                } catch {
                  return "Format URL tidak valid";
                }
              },
            }}
            children={(field) => (
              <div>
                <Label>Link Eksternal</Label>
                <Input
                  type="url"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="https://www.youtube.com/watch?v=example"
                  className="mt-1"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    {field.state.meta.errors[0]}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Masukkan link YouTube atau e-Certificate
                </p>
              </div>
            )}
          />
        )}

        {selectedActivityType === "PDF" && (
          <form.Field
            name="documentFile"
            validators={{
              onChange: ({ value }) => {
                if (!value && uploadedMaterials.length === 0) {
                  return "Dokumen harus diupload";
                }
                return undefined;
              },
            }}
            children={(field) => (
              <>
                <FileUploadArea
                  icon={FileText}
                  label="Upload Dokumen"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  description="Klik untuk upload dokumen (Max 5MB)"
                  color="green"
                  id="material-upload"
                  onChange={handleMaterialUpload}
                  multiple
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    {field.state.meta.errors[0]}
                  </p>
                )}
                {uploadedMaterials.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedMaterials.map((material) => (
                      <UploadedFile
                        key={material.id}
                        icon={FileText}
                        name={material.title}
                        color="green"
                        badge={material.size}
                        onRemove={() => handleRemoveMaterial(material.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          />
        )}

        {selectedActivityType === "SCORM" && (
          <form.Field
            name="scormFile"
            validators={{
              onChange: ({ value }) => {
                if (!value && !uploadedScorm) {
                  return "SCORM package harus diupload";
                }
                return undefined;
              },
            }}
            children={(field) => (
              <>
                <div>
                  <Label>SCORM Package</Label>
                  <p className="text-sm text-gray-500 mt-1 mb-2">
                    Import konten pembelajaran dalam format SCORM 1.2 atau 2004
                    (Max 100MB)
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
                    const file = e.target.files?.[0];
                    if (file) {
                      field.handleChange(file);
                      setUploadedScorm(file.name);
                    }
                  }}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    {field.state.meta.errors[0]}
                  </p>
                )}
                {uploadedScorm && (
                  <div className="mt-3">
                    <UploadedFile
                      icon={Package}
                      name={uploadedScorm}
                      color="purple"
                      onRemove={() => {
                        setUploadedScorm(null);
                        field.handleChange(undefined);
                      }}
                    />
                  </div>
                )}
              </>
            )}
          />
        )}

        {selectedActivityType === "QUIZ" && (
          <>
            {/* ✅ Title Field with Validation */}
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) =>
                  !value ? "Judul activity tidak boleh kosong" : undefined,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Judul Quiz *</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Masukkan judul quiz"
                    className={`h-12 ${
                      field.state.meta.errors.length > 0
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200"
                    }`}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <div className="flex items-center gap-1 text-red-600 text-sm">
                      <span className="text-xs">⚠️</span>
                      <span>{field.state.meta.errors[0]}</span>
                    </div>
                  )}
                </div>
              )}
            </form.Field>

            {/* ✅ Description Field - Make it consistent with other types */}
            <form.Field name="description">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Deskripsi Quiz</Label>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Tambahkan deskripsi untuk quiz ini"
                    className="min-h-[100px] border-gray-200 resize-none"
                  />
                </div>
              )}
            </form.Field>

            {/* 2. Pengaturan Waktu */}
            <Card className="p-6 border-2 border-green-100 bg-linear-to-br from-green-50/30 to-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-xl bg-linear-to-br from-green-600 to-emerald-600 shadow-md">
                    <Clock className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Pengaturan Waktu</h3>
                    <p className="text-sm text-gray-600">
                      Atur jadwal pembukaan dan penutupan quiz
                    </p>
                  </div>
                </div>
                <Switch
                  checked={quizTimingEnabled}
                  onChange={setQuizTimingEnabled}
                />
              </div>

              {quizTimingEnabled && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Open the Quiz */}
                    <div className="space-y-2">
                      <Label htmlFor="quiz-open">Quiz Dibuka</Label>
                      <div className="relative group">
                        <div
                          className={`relative rounded-lg border-2 transition-all ${
                            quizOpenDate
                              ? "border-green-300 bg-green-50/50 hover:border-green-400"
                              : "border-gray-200 bg-white hover:border-green-300"
                          }`}
                        >
                          <Input
                            id="quiz-open"
                            type="datetime-local"
                            value={quizOpenDate}
                            onChange={(e) => setQuizOpenDate(e.target.value)}
                            className={`border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-11 ${
                              quizOpenDate ? "text-green-900" : ""
                            }`}
                          />
                          {quizOpenDate && (
                            <button
                              type="button"
                              onClick={() => setQuizOpenDate("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-green-100 transition-colors opacity-0 group-hover:opacity-100"
                              aria-label="Clear date"
                            >
                              <XCircle className="size-4 text-green-600" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Close the Quiz */}
                    <div className="space-y-2">
                      <Label htmlFor="quiz-close">Quiz Ditutup</Label>
                      <div className="relative group">
                        <div
                          className={`relative rounded-lg border-2 transition-all ${
                            quizCloseDate
                              ? "border-red-300 bg-red-50/50 hover:border-red-400"
                              : "border-gray-200 bg-white hover:border-red-300"
                          }`}
                        >
                          <Input
                            id="quiz-close"
                            type="datetime-local"
                            value={quizCloseDate}
                            onChange={(e) => setQuizCloseDate(e.target.value)}
                            className={`border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-11 ${
                              quizCloseDate ? "text-red-900" : ""
                            }`}
                          />
                          {quizCloseDate && (
                            <button
                              type="button"
                              onClick={() => setQuizCloseDate("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                              aria-label="Clear date"
                            >
                              <XCircle className="size-4 text-red-600" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="my-6 border-t"></div>

                  {/* Time Limit */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl border-2 transition-all hover:border-blue-300 bg-linear-to-r from-blue-50/30 to-transparent">
                      <Label
                        htmlFor="time-limit-switch"
                        className="cursor-pointer"
                      >
                        <div className="font-medium">
                          Batasi Waktu Pengerjaan
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Setiap peserta punya waktu terbatas untuk mengerjakan
                        </p>
                      </Label>
                      <Switch
                        checked={quizTimeLimitEnabled}
                        onChange={setQuizTimeLimitEnabled}
                      />
                    </div>

                    {quizTimeLimitEnabled && (
                      <div className="space-y-4 p-4 rounded-xl bg-blue-50 border border-blue-200">
                        <div>
                          <Label
                            htmlFor="quiz-time-limit"
                            className="text-sm font-medium"
                          >
                            Durasi (Menit)
                          </Label>
                          <div className="relative mt-2">
                            <Input
                              id="quiz-time-limit"
                              type="number"
                              min="1"
                              placeholder="60"
                              value={quizTimeLimit}
                              onChange={(e) => setQuizTimeLimit(e.target.value)}
                              className="h-11 pr-16 bg-white border-blue-200 focus:border-blue-400"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                              menit
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* 3. Upaya & Penilaian */}
            <Card className="p-6 border-2 border-purple-100 bg-linear-to-br from-purple-50/30 to-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center size-10 rounded-xl bg-linear-to-br from-purple-600 to-violet-600 shadow-md">
                  <Target className="size-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Upaya & Penilaian</h3>
                  <p className="text-sm text-gray-600">
                    Atur jumlah percobaan dan kriteria kelulusan
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Attempts Allowed */}
                <div>
                  <Label
                    htmlFor="quiz-attempts"
                    className="font-medium mb-3 block"
                  >
                    Jumlah Upaya
                  </Label>
                  <Input
                    id="quiz-attempts"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={quizAttemptsAllowed}
                    onChange={(e) => setQuizAttemptsAllowed(e.target.value)}
                    className="h-11 border-2 hover:border-purple-300 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {quizAttemptsAllowed === "1"
                      ? "Cocok untuk ujian formal"
                      : "Ideal untuk latihan"}
                  </p>
                </div>

                {/* Grade to Pass */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label
                      htmlFor="passing-grade-switch"
                      className="cursor-pointer font-medium"
                    >
                      Atur Nilai Kelulusan
                    </Label>
                    <Switch
                      checked={passingGradeEnabled}
                      onChange={setPassingGradeEnabled}
                    />
                  </div>

                  {passingGradeEnabled && (
                    <div className="relative">
                      <Input
                        id="quiz-grade-pass"
                        type="number"
                        min="0"
                        max="100"
                        step="5"
                        placeholder="60"
                        value={quizGradeToPass}
                        onChange={(e) => setQuizGradeToPass(e.target.value)}
                        className={`h-12 pr-20 border-2 transition-all ${
                          quizGradeToPass
                            ? parseInt(quizGradeToPass) >= 80
                              ? "border-amber-300 bg-amber-50/50"
                              : "border-green-300 bg-green-50/50"
                            : "border-gray-200"
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {quizGradeToPass && (
                          <span
                            className={`text-sm font-medium ${
                              parseInt(quizGradeToPass) >= 80
                                ? "text-amber-700"
                                : "text-green-700"
                            }`}
                          >
                            {quizGradeToPass}%
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </>
        )}

        {selectedActivityType !== "QUIZ" && (
          <div className="flex justify-end gap-3 mt-8 mb-4 pt-4 border-t">
            {/* Temporary debug button */}

            <Button onClick={onClose} disabled={isCreating || isUpdating}>
              Batal
            </Button>
            <Button
              onClick={handleSaveClick}
              disabled={isCreating || isUpdating || form.state.isSubmitting}
            >
              {(isCreating || isUpdating) && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              {isCreating || isUpdating
                ? "Menyimpan..."
                : isEditMode
                  ? "Update Activity"
                  : "Simpan Activity"}
            </Button>
          </div>
        )}

        {selectedActivityType === "QUIZ" && (
          <div className="flex justify-end gap-3 mt-8 mb-4 pt-4 border-t">
            <Button
              onClick={onClose}
              disabled={isCreatingQuiz || isUpdatingQuiz}
            >
              Batal
            </Button>
            <Button
              onClick={form.handleSubmit}
              disabled={
                isCreatingQuiz || isUpdatingQuiz || form.state.isSubmitting
              }
            >
              {(isCreatingQuiz || isUpdatingQuiz) && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              {isCreatingQuiz || isUpdatingQuiz
                ? "Menyimpan..."
                : isEditMode
                  ? "Update Quiz"
                  : "Simpan Quiz"}
            </Button>
          </div>
        )}

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
      </div>
    );
  }

  // Initial Content Source Selection View (skip if edit mode)
  if (!isEditMode) {
    return (
      <div className="space-y-6">
        <div className="text-center my-8">
          <h4 className="mb-2">Dari mana konten activity ini berasal?</h4>
          <p className="text-sm text-gray-500">
            Pilih salah satu opsi di bawah untuk melanjutkan
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {CONTENT_SOURCE_OPTIONS.map(
            ({ value, label, description, icon: Icon, color }) => (
              <Card
                key={value}
                className={`p-6 cursor-pointer hover:border-${color}-500 hover:shadow-lg transition-all`}
                onClick={() => setContentSource(value as ContentSource)}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div
                    className={`size-16 rounded-full bg-${color}-100 flex items-center justify-center`}
                  >
                    <Icon className={`size-8 text-${color}-600`} />
                  </div>
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                  </div>
                </div>
              </Card>
            ),
          )}
        </div>

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
      </div>
    );
  }

  return null;
}
