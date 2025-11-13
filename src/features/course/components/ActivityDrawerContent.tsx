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
  AlertCircle,
  ClipboardList,
  Edit3,
} from "lucide-react";
import { useState, useEffect } from "react";

import SessionCard from "./SessionCardJadwalKurikulum";
import ActivityCard from "./ActivityCard";
import { QuizQuestionsManager } from "./QuizQuestionsManager";
import {
  getContentQueryKey,
  useCreateContent,
  useUpdateContent,
} from "@/hooks/useContent";
import { useSections } from "@/hooks/useSections";
import {
  useCreateQuizWithContent,
  useUpdateQuizWithContent,
  useCreateBulkQuestions,
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
  createTaskContentSchema,
  updateLinkContentSchema,
  updatePdfContentSchema,
  updateScormContentSchema,
  updateVideoContentSchema,
  updateTaskContentSchema,
  updateQuizContentSchema,
  createQuizContentSchema,
  createJadwalKurikulumContentSchema,
  updateJadwalKurikulumContentSchema,
  createContentSchema,
  updateContentSchema,
} from "@/schemas/content.schema";
import { create } from "sortablejs";
import { ZodError } from "zod";
import { uploadFileToR2, validateFile } from "@/lib/uploadToR2";

type ActivityType =
  | "VIDEO"
  | "LINK"
  | "PDF"
  | "QUIZ"
  | "SCORM"
  | "TASK"
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

const ACTIVITY_ROWS = [
  // Row 1: Documents and Videos
  [
    {
      type: "PDF",
      label: "PDF / Dokumen",
      description: "Upload PDF, DOC, PPT",
      icon: FileText,
      color: "green",
    },
    {
      type: "VIDEO",
      label: "Video Upload",
      description: "Upload file video lokal",
      icon: Video,
      color: "blue",
    },
  ],
  // Row 2: Quiz and Task
  [
    {
      type: "QUIZ",
      label: "Kuis",
      description: "Buat kuis interaktif",
      icon: CheckSquare,
      color: "purple",
    },
    {
      type: "TASK",
      label: "Tugas",
      description: "Upload dokumen tugas untuk mahasiswa",
      icon: ClipboardList,
      color: "indigo",
    },
  ],
  // Row 3: SCORM and External Links
  [
    {
      type: "SCORM",
      label: "SCORM Package",
      description: "Import konten SCORM 1.2 / 2004",
      icon: Package,
      color: "amber",
    },
    {
      type: "LINK",
      label: "Link Lainnya",
      description: "Tambahkan link eksternal",
      icon: Link,
      color: "orange",
    },
  ],
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

  // Get sections data to calculate next sequence
  const { data: sectionsData } = useSections();

  // Function to calculate the next sequence number
  const calculateNextSequence = (sectionId: string): number => {
    if (!sectionsData?.data) return 1;

    const section = sectionsData.data.find(section => section.id === sectionId);
    if (!section?.listContent || section.listContent.length === 0) return 1;

    // Find the highest sequence number and add 1
    const maxSequence = Math.max(...section.listContent.map(content => content.sequence || 0));
    return maxSequence + 1;
  };

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
      deadline: "", // ✅ NEW: Add deadline field for TASK type
      videoSource: "upload" as "upload" | "link", // ✅ NEW: Video source selection
      videoUrl: "", // ✅ NEW: Video URL for link option
    },
    onSubmit: async ({ value }) => {
      console.log("🚀 Form submission started:", {
        sectionId,
        isEditMode,
        selectedActivityType,
        formValue: value,
        contentStart: value.contentStart,
        contentEnd: value.contentEnd,
        restrictionEnabled,
        timeEnabled: restrictions.timeEnabled,
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
        // ✅ UPDATED: Prepare dates - z.coerce.date() akan otomatis convert string ke Date object
        let contentStart: Date | null = null;
        let contentEnd: Date | null = null;

        // Set dates if form values exist (from form fields)
        if (value.contentStart) {
          contentStart = new Date(value.contentStart);
          // ✅ Subtract 7 hours to convert from WIB to UTC for backend
          contentStart.setHours(contentStart.getHours() - 7);
          console.log("✅ Set contentStart (-7h UTC):", contentStart);
        }
        if (value.contentEnd) {
          contentEnd = new Date(value.contentEnd);
          // ✅ Subtract 7 hours to convert from WIB to UTC for backend
          contentEnd.setHours(contentEnd.getHours() - 7);
          console.log("✅ Set contentEnd (-7h UTC):", contentEnd);
        }
        console.log("📅 Final dates (UTC for backend):", { contentStart, contentEnd });

        if (selectedActivityType === "QUIZ") {
          // ========== QUIZ CREATION/UPDATE ==========
          const contentData = {
            idSection: sectionId!,
            name: value.name,
            description: value.description || "",
            type: "QUIZ",
            contentUrl: "", // Quiz doesn't need contentUrl
            sequence: isEditMode && initialData?.sequence
              ? initialData.sequence
              : calculateNextSequence(sectionId!),
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
            let updateData = {
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

            // ✅ NEW: Add deadline for TASK type - store in contentEnd for consistency
            if (selectedActivityType === "TASK" && deadlineEnabled && value.deadline) {
              const taskDeadline = new Date(value.deadline);
              // ✅ Subtract 7 hours to convert from WIB to UTC for backend
              taskDeadline.setHours(taskDeadline.getHours());
              updateData.contentEnd = taskDeadline;
              console.log("✅ TASK deadline saved (-7h UTC):", taskDeadline);
            }

            // ✅ NEW: Handle video source selection for VIDEO type
            if (selectedActivityType === "VIDEO" && value.videoSource === "link" && value.videoUrl) {
              // If user selected link option, change type to LINK and use videoUrl
              updateData.type = "LINK";
              updateData.contentUrl = value.videoUrl;
              // Remove videoFile if exists
              delete (updateData as any).videoFile;
              console.log("✅ VIDEO link mode UPDATE - converted to LINK type:", updateData);
            }

            console.log("🚀 Final updateData:", updateData);

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
            const sequence = calculateNextSequence(sectionId!);

            // Use union schema instead of individual schema selection

            let createData = {
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

            // ✅ NEW: Add deadline for TASK type - store in contentEnd for consistency
            if (selectedActivityType === "TASK" && deadlineEnabled && value.deadline) {
              const taskDeadline = new Date(value.deadline);
              // ✅ Subtract 7 hours to convert from WIB to UTC for backend
              taskDeadline.setHours(taskDeadline.getHours() - 7);
              createData.contentEnd = taskDeadline;
              console.log("✅ TASK deadline created (-7h UTC):", taskDeadline);
            }

            // ✅ NEW: Handle video source selection for VIDEO type
            if (selectedActivityType === "VIDEO" && value.videoSource === "link" && value.videoUrl) {
              // If user selected link option, change type to LINK and use videoUrl
              createData.type = "LINK";
              createData.contentUrl = value.videoUrl;
              // Remove videoFile if exists
              delete (createData as any).videoFile;
              console.log("✅ VIDEO link mode - converted to LINK type:", createData);
            }

            // Debug: Log complete createData object
            console.log("🚀 Final createData:", createData);

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
  const [taskSubmissionRequired, setTaskSubmissionRequired] = useState(true); // Default: true for TASK
  const [quizGradingEnabled, setQuizGradingEnabled] = useState(false);
  const [quizStartDate, setQuizStartDate] = useState("");
  const [quizEndDate, setQuizEndDate] = useState("");
  const [showQuizQuestionsManager, setShowQuizQuestionsManager] = useState(false);

  // Upload states for R2
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");

  // Video source selection state
  const [videoSource, setVideoSource] = useState<"upload" | "link">("upload");
  const [videoUrl, setVideoUrl] = useState("");

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

  // ✅ Set default values for TASK type
  useEffect(() => {
    if (selectedActivityType === "TASK") {
      // Set completion enabled by default for TASK
      setCompletionEnabled(true);
      setTaskSubmissionRequired(true);
    }
  }, [selectedActivityType]);

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
      } else if (initialData.type === "TASK") {
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
      }

      // ✅ Set dates if available
      let hasTimeRestriction = false;

      if (initialData.contentStart) {
        const startDateObj = new Date(initialData.contentStart);
        // ✅ Add 7 hours for WIB timezone display (UTC+7)
        startDateObj.setHours(startDateObj.getHours() + 7);
        const formattedStart = startDateObj.toISOString().slice(0, 16);
        form.setFieldValue("contentStart", formattedStart);
        setStartDate(formattedStart);
        hasTimeRestriction = true; // ✅ Ada contentStart = ada restriction
      }

      if (initialData.contentEnd) {
        const endDateObj = new Date(initialData.contentEnd);
        // ✅ Add 7 hours for WIB timezone display (UTC+7)
        endDateObj.setHours(endDateObj.getHours() + 7);
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

      // ✅ Set task deadline if available
      // For TASK type, deadline is stored in contentEnd
      if (initialData.type === "TASK" && initialData.contentEnd) {
        const deadlineObj = new Date(initialData.contentEnd);
        // ✅ Add 7 hours for WIB timezone display (UTC+7)
        deadlineObj.setHours(deadlineObj.getHours() + 7);
        const formattedDeadline = deadlineObj.toISOString().slice(0, 16);
        form.setFieldValue("deadline", formattedDeadline);
        setDeadlineDate(formattedDeadline);
        setDeadlineEnabled(true);
        setCompletionEnabled(true);
        console.log("✅ Set TASK deadline from contentEnd (+7h WIB):", formattedDeadline);
      } else if (initialData.deadline) {
        // Fallback if deadline field exists
        const deadlineObj = new Date(initialData.deadline);
        // ✅ Add 7 hours for WIB timezone display (UTC+7)
        deadlineObj.setHours(deadlineObj.getHours() + 7);
        const formattedDeadline = deadlineObj.toISOString().slice(0, 16);
        form.setFieldValue("deadline", formattedDeadline);
        setDeadlineDate(formattedDeadline);
        setDeadlineEnabled(true);
        setCompletionEnabled(true);
        console.log("✅ Set TASK deadline from deadline field (+7h WIB):", formattedDeadline);
      }
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

  // R2 Upload handlers
  const handleFileUploadToR2 = async (
    file: File,
    onSuccess: (publicUrl: string, fileName: string) => void,
    activityType: string
  ) => {
    if (!file) return;

    // Validate file based on activity type
    const allowedTypes = {
      VIDEO: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
      PDF: ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/msword', 'application/vnd.ms-powerpoint'],
      TASK: ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/msword', 'application/vnd.ms-powerpoint'],
      SCORM: ['application/zip', 'application/x-zip-compressed'],
    };

    const maxSizes = {
      VIDEO: 50 * 1024 * 1024, // 50MB
      PDF: 5 * 1024 * 1024, // 5MB
      TASK: 5 * 1024 * 1024, // 5MB
      SCORM: 100 * 1024 * 1024, // 100MB
    };

    const types = allowedTypes[activityType as keyof typeof allowedTypes] || [];
    const maxSize = maxSizes[activityType as keyof typeof maxSizes] || 5 * 1024 * 1024;

    if (!validateFile(file, types, maxSize)) {
      const maxSizeMB = maxSize / (1024 * 1024);
      setUploadError(`File tidak valid. Pastikan file bertipe yang sesuai dan kurang dari ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const uploadResult = await uploadFileToR2(file);
      setUploadedFileUrl(uploadResult.publicUrl);
      onSuccess(uploadResult.publicUrl, uploadResult.fileName);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload gagal';
      setUploadError(errorMessage);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUploadToR2 = async (file: File) => {
    // Validate file
    const allowedTypes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm'
    ];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!validateFile(file, allowedTypes, maxSize)) {
      setUploadError("File tidak valid. Pastikan file bertipe MP4/MOV/AVI/WebM dan kurang dari 50MB");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const { publicUrl, fileName } = await uploadFileToR2(file);

      // Update state
      setUploadedVideo(fileName);
      setUploadedFileUrl(publicUrl);

      // Update form values
      form.setFieldValue("contentUrl", publicUrl);
      form.setFieldValue("videoFile", file);

      // Show success message
      setShowToast(true);
      setToastMessage("Video berhasil diupload!");
      setToastVariant("success");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload gagal';
      setUploadError(errorMessage);
      setShowToast(true);
      setToastMessage(errorMessage);
      setToastVariant("warning");
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentUploadToR2 = async (file: File) => {
    // Validate file
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB
  
    if (!validateFile(file, allowedTypes, maxSize)) {
      setUploadError("File tidak valid. Pastikan file bertipe PDF/DOC/PPT dan kurang dari 5MB");
      return;
    }
  
    setUploading(true);
    setUploadError("");
  
    try {
      const { publicUrl, fileName } = await uploadFileToR2(file);
      
      // Update state
      const newMaterial = {
        id: `${fileName}-${Date.now()}`,
        title: fileName,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      };
      
      setUploadedMaterials(prev => [...prev, newMaterial]);
      setUploadedFileUrl(publicUrl);
      
      // Update form values
      form.setFieldValue("contentUrl", publicUrl);
      form.setFieldValue("documentFile", file);
      
      // Show success message
      setShowToast(true);
      setToastMessage("Dokumen berhasil diupload!");
      setToastVariant("success");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload gagal';
      setUploadError(errorMessage);
      setShowToast(true);
      setToastMessage(errorMessage);
      setToastVariant("warning");
    } finally {
      setUploading(false);
    }
  };

  const handleScormUploadToR2 = async (file: File) => {
    // Validate file
    const allowedTypes = [
      'application/zip',
      'application/x-zip-compressed'
    ];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!validateFile(file, allowedTypes, maxSize)) {
      setUploadError("File tidak valid. Pastikan file bertipe ZIP dan kurang dari 100MB");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const { publicUrl, fileName } = await uploadFileToR2(file);

      // Update state
      setUploadedScorm(fileName);
      setUploadedFileUrl(publicUrl);

      // Update form values
      form.setFieldValue("contentUrl", publicUrl);
      form.setFieldValue("scormFile", file);

      // Show success message
      setShowToast(true);
      setToastMessage("SCORM package berhasil diupload!");
      setToastVariant("success");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload gagal';
      setUploadError(errorMessage);
      setShowToast(true);
      setToastMessage(errorMessage);
      setToastVariant("warning");
    } finally {
      setUploading(false);
    }
  };

  const handleTaskUploadToR2 = (file: File) => {
    handleFileUploadToR2(file, (publicUrl, fileName) => {
      const newMaterial = {
        id: `${fileName}-${Date.now()}`,
        title: fileName,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      };

      setUploadedMaterials(prev => [...prev, newMaterial]);
      form.setFieldValue("contentUrl", publicUrl);
      form.setFieldValue("documentFile", file);
    }, 'TASK');
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
    } else if (selectedActivityType === "TASK") {
      contentUrl = uploadedMaterials[0]?.title || "";
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
              {selectedActivityType === "TASK"
                ? "Atur kriteria penyelesaian tugas"
                : "Atur kriteria kapan activity dianggap selesai"
              }
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

          {selectedActivityType === "TASK" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h6 className="font-medium">Wajib Mengumpulkan</h6>
                    <p className="text-sm text-gray-500">
                      Peserta harus mengumpulkan tugas untuk menyelesaikan aktivitas
                    </p>
                  </div>
                  <Switch
                    checked={taskSubmissionRequired}
                    onChange={setTaskSubmissionRequired}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h6 className="font-medium">Tenggat Waktu</h6>
                    <p className="text-sm text-gray-500">
                      Tetapkan deadline pengumpulan tugas
                    </p>
                  </div>
                  <Switch checked={deadlineEnabled} onChange={setDeadlineEnabled} />
                </div>
                {deadlineEnabled && (
                  <div>
                    <Label
                      htmlFor="taskDeadlineDate"
                      className="block text-sm font-medium text-gray-700 my-2"
                    >
                      Deadline Tugas
                    </Label>
                    <form.Field
                      name="deadline"
                      children={(field) => (
                        <Input
                          id="taskDeadlineDate"
                          type="datetime-local"
                          value={field.state.value}
                          onChange={(e) => {
                            field.handleChange(e.target.value);
                            setDeadlineDate(e.target.value); // Keep local state for UI sync
                          }}
                          onBlur={field.handleBlur}
                        />
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedActivityType !== "TASK" && (
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
          )}

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

        <div className="space-y-6">
          {ACTIVITY_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {row.map(({ type, label, description, icon: Icon, color }) => (
                <Card
                  key={type}
                  className={`p-6 cursor-pointer hover:border-${color}-500 hover:shadow-lg transition-all`}
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
              ))}
            </div>
          ))}
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

            {/* Only show completion sections for TASK and QUIZ */}
            {(selectedActivityType === "TASK" || selectedActivityType === "QUIZ") && (
              <CompletionSection />
            )}


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
          <>
            {/* Video Source Selection */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-gray-700 mb-3">
                Pilih sumber video
              </Label>
              <div className="flex gap-4">
                <Card
                  className={`flex-1 p-4 cursor-pointer transition-all border-2 ${
                    videoSource === "upload"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => {
                    setVideoSource("upload");
                    form.setFieldValue("videoSource", "upload");
                  }}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <Video className="size-6 text-blue-600" />
                    <span className="font-medium">Upload Video</span>
                    <span className="text-sm text-gray-500">File video lokal</span>
                  </div>
                </Card>
                <Card
                  className={`flex-1 p-4 cursor-pointer transition-all border-2 ${
                    videoSource === "link"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => {
                    setVideoSource("link");
                    form.setFieldValue("videoSource", "link");
                  }}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <Link className="size-6 text-orange-600" />
                    <span className="font-medium">Link Video</span>
                    <span className="text-sm text-gray-500">YouTube, platform lain</span>
                  </div>
                </Card>
              </div>
            </div>

            {/* Upload Video Section */}
            {videoSource === "upload" && (
              <form.Field
                name="videoFile"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) {
                      return "Video file harus diunggah";
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
                      description="Klik untuk upload video (Max 50MB) - Akan diupload ke Cloud Storage"
                      color="blue"
                      id="video-upload"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          const file = files[0];
                          field.handleChange(file);
                          handleVideoUploadToR2(file);
                        }
                      }}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-red-600 mt-1">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                    {uploading && (
                      <div className="mt-3 flex items-center text-blue-600">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span className="text-sm">Mengupload video...</span>
                      </div>
                    )}
                    {uploadedVideo && !uploading && (
                      <div className="mt-3">
                        <UploadedFile
                          icon={Video}
                          name={uploadedVideo}
                          color="blue"
                          onRemove={() => {
                            setUploadedVideo(null);
                            setUploadedFileUrl("");
                            field.handleChange(undefined);
                            form.setFieldValue("contentUrl", "");
                          }}
                        />
                      </div>
                    )}
                    {uploadError && (
                      <div className="mt-3 flex items-center text-red-600">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm">{uploadError}</span>
                      </div>
                    )}
                  </>
                )}
              />
            )}

            {/* Link Video Section */}
            {videoSource === "link" && (
              <form.Field
                name="videoUrl"
                validators={{
                  onChange: ({ value }) => {
                    if (!value || value.trim() === "") {
                      return "URL video harus diisi";
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
                    <Label>URL Video</Label>
                    <Input
                      type="url"
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                        setVideoUrl(e.target.value);
                        form.setFieldValue("contentUrl", e.target.value);
                      }}
                      onBlur={field.handleBlur}
                      placeholder="https://www.youtube.com/watch?v=example atau platform lain"
                      className="mt-1"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-red-600 mt-1">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Masukkan link video dari YouTube, Vimeo, atau platform video lainnya
                    </p>
                  </div>
                )}
              />
            )}
          </>
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
                  placeholder="https://example.com/resource"
                  className="mt-1"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    {field.state.meta.errors[0]}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Masukkan link eksternal
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
                  description="Klik untuk upload dokumen (Max 5MB) - Akan diupload ke Cloud Storage"
                  color="green"
                  id="material-upload"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      const file = files[0];
                      field.handleChange(file);
                      handleDocumentUploadToR2(file);
                    }
                  }}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    {field.state.meta.errors[0]}
                  </p>
                )}
                {uploading && (
                  <div className="mt-3 flex items-center text-green-600">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="text-sm">Mengupload dokumen...</span>
                  </div>
                )}
                {uploadedMaterials.length > 0 && !uploading && (
                  <div className="mt-3 space-y-2">
                    {uploadedMaterials.map((material) => (
                      <UploadedFile
                        key={material.id}
                        icon={FileText}
                        name={material.title}
                        color="green"
                        badge={material.size}
                        onRemove={() => {
                          handleRemoveMaterial(material.id);
                          setUploadedFileUrl("");
                          form.setFieldValue("contentUrl", "");
                          field.handleChange(undefined);
                        }}
                      />
                    ))}
                  </div>
                )}
                {uploadError && (
                  <div className="mt-3 flex items-center text-red-600">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">{uploadError}</span>
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
                      field.handleChange(file);
                      handleScormUploadToR2(file);
                    }
                  }}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    {field.state.meta.errors[0]}
                  </p>
                )}
                {uploading && (
                  <div className="mt-3 flex items-center text-purple-600">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="text-sm">Mengupload SCORM package...</span>
                  </div>
                )}
                {uploadedScorm && !uploading && (
                  <div className="mt-3">
                    <UploadedFile
                      icon={Package}
                      name={uploadedScorm}
                      color="purple"
                      onRemove={() => {
                        setUploadedScorm(null);
                        setUploadedFileUrl("");
                        field.handleChange(undefined);
                        form.setFieldValue("contentUrl", "");
                      }}
                    />
                  </div>
                )}
                {uploadError && (
                  <div className="mt-3 flex items-center text-red-600">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">{uploadError}</span>
                  </div>
                )}
              </>
            )}
          />
        )}

        {selectedActivityType === "TASK" && (
          <form.Field
            name="documentFile"
            validators={{
              onChange: ({ value }) => {
                if (!value && uploadedMaterials.length === 0) {
                  return "Dokumen tugas harus diupload";
                }
                return undefined;
              },
            }}
            children={(field) => (
              <>
                <div>
                  <Label>Dokumen Tugas</Label>
                  <p className="text-sm text-gray-500 mt-1 mb-2">
                    Upload dokumen tugas yang akan dikerjakan oleh mahasiswa
                    (Max 5MB) - Akan diupload ke Cloud Storage
                  </p>
                </div>
                <FileUploadArea
                  icon={ClipboardList}
                  label=""
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  description="Klik untuk upload dokumen tugas"
                  color="indigo"
                  id="task-upload"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      const file = files[0];
                      field.handleChange(file);
                      handleTaskUploadToR2(file);
                    }
                  }}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    {field.state.meta.errors[0]}
                  </p>
                )}
                {uploading && (
                  <div className="mt-3 flex items-center text-indigo-600">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="text-sm">Mengupload dokumen tugas...</span>
                  </div>
                )}
                {uploadedMaterials.length > 0 && !uploading && (
                  <div className="mt-3 space-y-2">
                    {uploadedMaterials.map((material) => (
                      <UploadedFile
                        key={material.id}
                        icon={ClipboardList}
                        name={material.title}
                        color="indigo"
                        badge={material.size}
                        onRemove={() => {
                          handleRemoveMaterial(material.id);
                          setUploadedFileUrl("");
                          form.setFieldValue("contentUrl", "");
                          field.handleChange(undefined);
                        }}
                      />
                    ))}
                  </div>
                )}
                {uploadError && (
                  <div className="mt-3 flex items-center text-red-600">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">{uploadError}</span>
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

            {/* ✅ Quiz Questions Management */}
            <Card className="p-6 border-2 border-blue-100 bg-linear-to-br from-blue-50/30 to-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 shadow-md">
                    <Edit3 className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Manajemen Soal</h3>
                    <p className="text-sm text-gray-600">
                      Buat dan kelola soal untuk quiz ini
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowQuizQuestionsManager(true)}
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Edit3 className="size-4 mr-2" />
                  Kelola Soal
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Info:</strong> Klik tombol "Kelola Soal" untuk membuat, mengedit, atau menghapus soal quiz. Anda dapat membuat berbagai jenis soal seperti pilihan ganda, essay, atau benar/salah.
                </p>
              </div>
            </Card>

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

  // ✅ Quiz Questions Manager View
  if (showQuizQuestionsManager) {
    const quizInfo = {
      id: contentId || '',
      title: form.state.values.name || 'Kuis Baru',
      description: form.state.values.description || '',
      timeLimit: quizTimeLimitEnabled ? parseInt(quizTimeLimit) || 60 : undefined,
      shuffleQuestions: quizShuffleQuestions,
      passingScore: passingGradeEnabled ? parseFloat(quizGradeToPass) || 60 : undefined,
      totalQuestions: 0, // Will be calculated
      maxPoints: 0 // Will be calculated
    };

    return (
      <QuizQuestionsManager
        quizInfo={quizInfo}
        onBack={() => setShowQuizQuestionsManager(false)}
        onSaveQuiz={(savedQuizInfo, questions, questionsToSave) => {
          // Update form values with quiz info
          form.setFieldValue("name", savedQuizInfo.title);
          form.setFieldValue("description", savedQuizInfo.description || "");

          // Update quiz-related state
          setQuizTimeLimitEnabled(!!savedQuizInfo.timeLimit);
          setQuizTimeLimit(savedQuizInfo.timeLimit?.toString() || "60");
          setQuizShuffleQuestions(savedQuizInfo.shuffleQuestions);
          setPassingGradeEnabled(!!savedQuizInfo.passingScore);
          setQuizGradeToPass(savedQuizInfo.passingScore?.toString() || "60");

          // Store questions to save when quiz is created (for create mode)
          if (questionsToSave && !contentId) {
            // Save questions to state for later use when quiz is created
            (window as any).tempQuestionsToSave = questionsToSave;
            console.log("Questions prepared for bulk creation:", questionsToSave);
          }

          setShowQuizQuestionsManager(false);
          showToastMessage("Soal kuis berhasil disimpan!", "success");
        }}
        initialQuestions={[]} // Will be populated from backend later
        contentId={contentId} // Pass the contentId for API calls
      />
    );
  }

  return null;
}
