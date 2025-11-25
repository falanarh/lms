"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { Drawer } from "@/components/ui/Drawer/Drawer";
import { Pagination } from "@/components/shared/Pagination/Pagination";
import {
  HelpCircle,
  Brain,
  List,
  CheckSquare,
  Clock,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Edit3,
  Trash2,
  Copy,
  Eye,
  Search,
  Filter,
  FileText,
  Code,
  Target,
  Save,
  Layers,
  Check,
  GripVertical,
  Upload,
  FileSpreadsheet,
  Tag,
} from "lucide-react";
import Dropdown from "@/components/ui/Dropdown/Dropdown";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog/ConfirmDialog";
import { Toast } from "@/components/ui/Toast/Toast";
import { BlockNoteEditor } from "./BlockNoteEditor";
import {
  useMasterQuestions,
  useCreateMasterQuestion,
  useUpdateMasterQuestion,
  useDeleteMasterQuestion,
} from "@/hooks/useMasterQuestions";
import { Input } from "@/components/ui/Input";
import { ImportQuestionsModal } from "./importQuestionsModal";
import { QuestionTagSelector } from "@/components/shared/QuestionTagSelector/QuestionTagSelector";

// Types for Bank Soal - matching QuizQuestionsManager structure
interface BankQuestion {
  id: string;
  questionText: string;
  questionType: "multiple_choice" | "true_false" | "short_answer";
  points: number;
  order: number;
  options?: QuizOption[];
  correctAnswer?: string;
  explanation?: string;
  timeLimit?: number;
  title?: string; // For bank soal display
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  usageCount?: number;
  shuffleOptions?: boolean;
  questionTagId?: string;
  questionTagName?: string;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

// Component State
type QuestionType = "multiple_choice" | "true_false" | "short_answer";
type Difficulty = "EASY" | "MEDIUM" | "HARD" | null;

const QUESTION_TYPES = [
  {
    value: "multiple_choice",
    label: "Pilihan Ganda",
    icon: HelpCircle,
    color: "blue",
  },
  {
    value: "true_false",
    label: "Benar/Salah",
    icon: CheckSquare,
    color: "green",
  },
  {
    value: "short_answer",
    label: "Jawaban Singkat",
    icon: Edit3,
    color: "purple",
  },
];

// Question Form Component - matching QuizQuestionsManager structure
const QuestionForm = ({
  question,
  onSave,
  onCancel,
  isLoading = false,
}: {
  question?: BankQuestion;
  onSave: (data: Partial<BankQuestion>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) => {
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] =
    useState<QuestionType>("multiple_choice");
  const [points, setPoints] = useState(1);
  const [shuffleOptions, setShuffleOptions] = useState(false); // New state for shuffle options
  const [options, setOptions] = useState<QuizOption[]>([
    { id: "1", text: "", isCorrect: false, order: 0 },
    { id: "2", text: "", isCorrect: false, order: 1 },
    { id: "3", text: "", isCorrect: false, order: 2 },
    { id: "4", text: "", isCorrect: false, order: 3 },
  ]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [questionTagId, setQuestionTagId] = useState("");
  const [questionTagName, setQuestionTagName] = useState("");

  // Update form values when question prop changes
  useEffect(() => {
    if (question) {
      console.log("📝 Setting form values from question:", {
        questionText: question.questionText,
        questionType: question.questionType,
        points: question.points,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        options: question.options,
        shuffleOptions: question.shuffleOptions,
      });

      setQuestionText(question.questionText || "");
      setQuestionType(question.questionType || "multiple_choice");
      setPoints(question.points || 1);
      setCorrectAnswer(question.correctAnswer || "");
      setExplanation(question.explanation || "");
      setShuffleOptions(question.shuffleOptions || false); // Set shuffle options state
      setQuestionTagId(question.questionTagId || "");
      setQuestionTagName(question.questionTagName || "");

      // Set options for multiple choice questions
      if (
        question.questionType === "multiple_choice" &&
        question.options &&
        question.options.length > 0
      ) {
        setOptions(question.options);
      } else {
        // Reset to default options for non-multiple choice or when no options exist
        setOptions([
          { id: "1", text: "", isCorrect: false, order: 0 },
          { id: "2", text: "", isCorrect: false, order: 1 },
          { id: "3", text: "", isCorrect: false, order: 2 },
          { id: "4", text: "", isCorrect: false, order: 3 },
        ]);
      }
    } else {
      console.log("📝 Resetting form (new question mode)");
      // Reset form when no question (new question mode)
      setQuestionText("");
      setQuestionType("multiple_choice");
      setPoints(1);
      setCorrectAnswer("");
      setExplanation("");
      setQuestionTagId("");
      setQuestionTagName("");
      setShuffleOptions(false); // Reset shuffle options
      setOptions([
        { id: "1", text: "", isCorrect: false, order: 0 },
        { id: "2", text: "", isCorrect: false, order: 1 },
        { id: "3", text: "", isCorrect: false, order: 2 },
        { id: "4", text: "", isCorrect: false, order: 3 },
      ]);
    }
  }, [question]);

  const handleOptionTextChange = (optionId: string, text: string) => {
    setOptions(
      options.map((opt) => (opt.id === optionId ? { ...opt, text } : opt)),
    );
  };

  const handleOptionCorrectChange = (optionId: string, isCorrect: boolean) => {
    setOptions(
      options.map((opt) =>
        opt.id === optionId
          ? { ...opt, isCorrect }
          : { ...opt, isCorrect: false },
      ),
    );
  };

  const addOption = () => {
    const newOption: QuizOption = {
      id: Date.now().toString(),
      text: "",
      isCorrect: false,
      order: options.length,
    };
    setOptions([...options, newOption]);
  };

  const removeOption = (optionId: string) => {
    if (options.length > 2) {
      setOptions(options.filter((opt) => opt.id !== optionId));
    }
  };

  const handleSubmit = () => {
    if (!questionText.trim()) {
      alert("Pertanyaan tidak boleh kosong");
      return;
    }

    if (questionType === "multiple_choice") {
      const validOptions = options.filter((opt) => opt.text.trim() !== "");
      if (validOptions.length < 2) {
        alert("Pilihan ganda minimal harus memiliki 2 opsi");
        return;
      }
      const hasCorrectOption = options.some((opt) => opt.isCorrect);
      if (!hasCorrectOption) {
        alert("Pilih satu jawaban yang benar");
        return;
      }
    }

    if (
      (questionType === "true_false" || questionType === "short_answer") &&
      !correctAnswer.trim()
    ) {
      alert("Jawaban benar harus diisi");
      return;
    }

    const questionData: Partial<BankQuestion> = {
      questionText: questionText.trim(),
      questionType,
      points,
      shuffleOptions:
        questionType === "multiple_choice" ? shuffleOptions : undefined, // Only include for multiple choice
      options:
        questionType === "multiple_choice"
          ? options.filter((opt) => opt.text.trim() !== "")
          : undefined,
      correctAnswer:
        questionType === "multiple_choice"
          ? options.find((opt) => opt.isCorrect)?.text || ""
          : correctAnswer,
      explanation: explanation.trim() || undefined,
      title:
        questionText.trim().slice(0, 100) +
        (questionText.trim().length > 100 ? "..." : ""),
      questionTagId: questionTagId || undefined,
      questionTagName: questionTagName || undefined,
    };

    onSave(questionData);
  };

  return (
    <div className="space-y-6 py-2">
      {/* Question Text with Rich Text Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Teks Pertanyaan
        </label>
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <BlockNoteEditor
            content={questionText}
            onChange={(value) => setQuestionText(value)}
            placeholder="Ketik pertanyaan Anda di sini..."
            className="min-h-[120px]"
          />
        </div>
      </div>

      {/* Question Type and Points */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipe Pertanyaan
          </label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value as QuestionType)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {QUESTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Poin
          </label>
          <Input
            type="number"
            min="1"
            value={points}
            onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Question Type Specific Fields */}
      {questionType === "multiple_choice" && (
        <div className="space-y-4">
          {/* Shuffle Options Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Acak Urutan Opsi
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Opsi jawaban akan diacak setiap kali soal ditampilkan
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={shuffleOptions}
                onChange={(e) => setShuffleOptions(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Opsi Jawaban
              </label>
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tambah Opsi
              </button>
            </div>

            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-gray-500">
                    {String.fromCharCode(65 + index)}.
                  </div>

                  <input
                    type="radio"
                    checked={option.isCorrect}
                    onChange={() =>
                      handleOptionCorrectChange(option.id, !option.isCorrect)
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />

                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) =>
                      handleOptionTextChange(option.id, e.target.value)
                    }
                    placeholder={`Opsi ${String.fromCharCode(65 + index)}`}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(option.id)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Pilih salah satu opsi sebagai jawaban benar dengan mengklik radio
              button
            </p>
          </div>
        </div>
      )}

      <QuestionTagSelector
        selectedTagId={questionTagId}
        onTagSelect={(tagId, tagName) => {
          setQuestionTagId(tagId);
          setQuestionTagName(tagName);
        }}
        disabled={isLoading}
      />

      {questionType === "true_false" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Jawaban Benar
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={correctAnswer === "true"}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                value="true"
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-2"
              />
              <span className="text-sm">Benar</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={correctAnswer === "false"}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                value="false"
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-2"
              />
              <span className="text-sm">Salah</span>
            </label>
          </div>
        </div>
      )}

      {questionType === "short_answer" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Jawaban Benar (Untuk Referensi)
          </label>
          <textarea
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            placeholder="Masukkan jawaban yang benar untuk referensi penilaian..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Jawaban yang diharapkan untuk pertanyaan singkat
          </p>
        </div>
      )}

      {/* Explanation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Penjelasan Jawaban (Opsional)
        </label>
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <BlockNoteEditor
            content={explanation}
            onChange={(value) => setExplanation(value)}
            placeholder="Ketik penjelasan untuk jawaban benar..."
            className="min-h-[100px]"
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Penjelasan akan ditampilkan setelah peserta menjawab pertanyaan
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isLoading}
          loading={isLoading ? "true" : undefined}
        >
          {question ? "Perbarui" : "Simpan"} Pertanyaan
        </Button>
      </div>
    </div>
  );
};

export function BankSoal() {
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
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false); // New state for import modal
  const [editingQuestion, setEditingQuestion] = useState<BankQuestion | null>(
    null,
  );
  const [searchInput, setSearchInput] = useState(searchTitle);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchTitle);
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "");

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
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Helper function to map question types to API supported types
  const mapQuestionTypeToApi = (questionType: string): string => {
    switch (questionType?.toLowerCase()) {
      case "multiple_choice":
        return "MULTIPLE_CHOICE";
      case "true_false":
        return "TRUE_FALSE";
      case "short_answer":
        return "SHORT_ANSWER";
      default:
        return "MULTIPLE_CHOICE";
    }
  };

  // API Data fetching for questions
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useMasterQuestions({
    page: currentPage,
    perPage: perPage,
    searchQuery: debouncedSearchQuery,
    type: typeFilter ? mapQuestionTypeToApi(typeFilter) : undefined,
  });

  // Convert API data to BankQuestion format
  const masterQuestions =
    response?.data?.map((question) => {
      // Map API question types to our frontend types
      let mappedQuestionType: BankQuestion["questionType"];
      switch (question.questionType) {
        case "MULTIPLE_CHOICE":
          mappedQuestionType = "multiple_choice";
          break;
        case "TRUE_FALSE":
          mappedQuestionType = "true_false";
          break;
        case "SHORT_ANSWER":
          mappedQuestionType = "short_answer";
          break;
        default:
          mappedQuestionType = "multiple_choice";
      }

      // Extract the correct answer code from the answer object (kunci jawaban)
      const correctAnswerCode = question.masterAnswer?.codeAnswer || "";
      const correctAnswerText = question.masterAnswer?.answer || "";

      // Map options with correct answer detection
      const mappedOptions =
        question.optionsText?.map((option, index) => ({
          id: `${question.id}-${index}`,
          text: option || "",
          isCorrect: question.optionsCode?.[index] === correctAnswerCode, // Match by codeAnswer
          order: index,
        })) || [];

      // For multiple choice, find the correct answer text from options using codeAnswer
      let finalCorrectAnswer = "";
      if (mappedQuestionType === "multiple_choice" && correctAnswerCode) {
        // Find the index of the correct answer code
        const correctIndex = question.optionsCode?.indexOf(correctAnswerCode);
        if (
          correctIndex !== undefined &&
          correctIndex !== -1 &&
          question.optionsText?.[correctIndex]
        ) {
          finalCorrectAnswer = question.optionsText[correctIndex];
        } else {
          // Fallback: find from mapped options
          const correctOption = mappedOptions.find((opt) => opt.isCorrect);
          finalCorrectAnswer = correctOption?.text || correctAnswerText;
        }
      } else {
        // For true/false and short answer, use the answer text directly
        finalCorrectAnswer = correctAnswerText;
      }

      console.log("🔍 Mapping question:", {
        id: question.id,
        name: question.name,
        questionText: question.questionText,
        correctAnswerCode: correctAnswerCode,
        correctAnswerText: correctAnswerText,
        finalCorrectAnswer: finalCorrectAnswer,
        optionsText: question.optionsText,
        optionsCode: question.optionsCode,
        mappedOptions: mappedOptions,
        questionTagId: question.questionTag?.id || undefined,
        questionTagName: question.questionTag?.name || undefined,
      });

      return {
        id: question.id,
        questionText: question.questionText || "",
        questionType: mappedQuestionType,
        order: 0,
        title: question.name || "Soal",
        timeLimit: 60,
        explanation: question.description || "", // Use description as explanation
        usageCount: 0,
        shuffleOptions: question.shuffleOptions || false, // Map shuffleOptions from API
        options: mappedOptions,
        correctAnswer: finalCorrectAnswer, // This is the correct answer text
        questionTagId: question.questionTag?.id || undefined,
        questionTagName: question.questionTag?.name || undefined,
      };
    }) || [];

  const pageMeta = response?.pageMeta;

  // Add mutation hooks
  const createMasterQuestionMutation = useCreateMasterQuestion({
    mutationConfig: {
      onSuccess: () => {
        showToastMessage("success", "Soal berhasil ditambahkan!");
        setIsCreateDrawerOpen(false);
        refetch();
      },
      onError: (error: any) => {
        showToastMessage(
          "warning",
          `${error.message || "Gagal menambah soal"}`,
        );
      },
    },
  });

  const updateMasterQuestionMutation = useUpdateMasterQuestion({
    mutationConfig: {
      onSuccess: () => {
        showToastMessage("success", " Soal berhasil diperbarui!");
        setIsEditDrawerOpen(false);
        setEditingQuestion(null);
        refetch();
      },
      onError: (error: any) => {
        showToastMessage(
          "warning",
          `${error.message || "Gagal memperbarui soal"}`,
        );
      },
    },
  });

  const deleteMasterQuestionMutation = useDeleteMasterQuestion({
    mutationConfig: {
      onSuccess: () => {
        showToastMessage("success", "✅ Soal berhasil dihapus!");
        refetch();
      },
      onError: (error: any) => {
        showToastMessage(
          "warning",
          `${error.message || "Gagal menghapus soal"}`,
        );
      },
    },
  });

  // Use API data directly (API handles search and pagination)
  const paginatedQuestions = masterQuestions;
  const totalPages = pageMeta?.totalPageCount || 1;

  // Debug: Log pagination info
  console.log("🔍 Pagination Debug:", {
    currentPage,
    totalPages,
    pageMeta,
    paginatedQuestionsLength: paginatedQuestions.length,
    shouldShowPagination: totalPages > 1,
  });

  // Get question type info
  const getQuestionTypeInfo = (type: string) => {
    const typeInfo = QUESTION_TYPES.find((t) => t.value === type);
    return typeInfo || { icon: HelpCircle, color: "gray", label: type };
  };

  const perPageOptions = [
    { value: "6", label: "6" },
    { value: "12", label: "12" },
    { value: "24", label: "24" },
    { value: "48", label: "48" },
  ];

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

  // Handle filter changes
  const handleTypeFilter = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle search input change
  const handleSearch = (value: string) => {
    setSearchInput(value);
  };

  // Handle create question
  const handleCreateQuestion = (questionData: Partial<BankQuestion>) => {
    // Convert BankQuestion format to API format
    const apiData: any = {
      name: questionData.title || "",
      description: questionData.explanation || "", // Send explanation as description
      questionType: mapQuestionTypeToApi(questionData.questionType || ""),
      questionText: questionData.questionText || "",
      shuffleOptions: Boolean(questionData.shuffleOptions), // Ensure it's a boolean
      idQuestionTag: questionData.questionTagId || undefined,
      answer: {
        answer: questionData.correctAnswer || "",
        codeAnswer: null, // Will be set for multiple choice
      },
    };

    // Only include optionsText and optionsCode for multiple choice questions
    if (
      questionData.questionType === "multiple_choice" &&
      questionData.options
    ) {
      const validOptions = questionData.options.filter(
        (opt) => opt.text.trim() !== "",
      );
      apiData.optionsText = validOptions.map((opt) => opt.text);

      // Generate optionsCode (A, B, C, D, etc.)
      apiData.optionsCode = validOptions.map(
        (_, index) => String.fromCharCode(65 + index), // 65 is 'A' in ASCII
      );

      // Find the correct answer code
      const correctOptionIndex = validOptions.findIndex((opt) => opt.isCorrect);
      if (correctOptionIndex !== -1) {
        apiData.answer.codeAnswer = String.fromCharCode(
          65 + correctOptionIndex,
        );
        // Also set the answer text
        apiData.answer.answer = validOptions[correctOptionIndex].text;
      }
    }

    console.log("📤 Creating question with data:", apiData);
    createMasterQuestionMutation.mutate(apiData);
  };

  // Handle edit question
  const handleEditQuestion = (question: BankQuestion) => {
    console.log("🔧 Editing question:", question);
    setEditingQuestion(question);
    setIsEditDrawerOpen(true);
  };

  // Handle update question
  const handleUpdateQuestion = (questionData: Partial<BankQuestion>) => {
    if (!editingQuestion) return;

    // Convert BankQuestion format to API format
    const apiData: any = {
      name: questionData.title || "",
      description: questionData.explanation || "", // Send explanation as description
      questionType: mapQuestionTypeToApi(questionData.questionType || ""),
      questionText: questionData.questionText || "",
      shuffleOptions: Boolean(questionData.shuffleOptions),
      idQuestionTag: questionData.questionTagId || undefined,
      answer: {
        answer: questionData.correctAnswer || "",
        codeAnswer: null, // Will be set for multiple choice
      },
    };

    // Only include optionsText and optionsCode for multiple choice questions
    if (
      questionData.questionType === "multiple_choice" &&
      questionData.options
    ) {
      const validOptions = questionData.options.filter(
        (opt) => opt.text.trim() !== "",
      );
      apiData.optionsText = validOptions.map((opt) => opt.text);

      // Generate optionsCode (A, B, C, D, etc.)
      apiData.optionsCode = validOptions.map(
        (_, index) => String.fromCharCode(65 + index), // 65 is 'A' in ASCII
      );

      // Find the correct answer code
      const correctOptionIndex = validOptions.findIndex((opt) => opt.isCorrect);
      if (correctOptionIndex !== -1) {
        apiData.answer.codeAnswer = String.fromCharCode(
          65 + correctOptionIndex,
        );
        // Also set the answer text
        apiData.answer.answer = validOptions[correctOptionIndex].text;
      }
    }

    console.log("📤 Updating question with data:", apiData);
    updateMasterQuestionMutation.mutate({
      id: editingQuestion.id,
      data: apiData,
    });
  };

  // Handle delete question
  const handleDeleteQuestion = (question: BankQuestion) => {
    setDeleteConfirm({
      isOpen: true,
      id: question.id,
      title: question.title,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.id) {
      deleteMasterQuestionMutation.mutate(deleteConfirm.id);
    }
    setDeleteConfirm({ isOpen: false, id: null, title: "" });
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, id: null, title: "" });
  };

  // Handle import from Excel
  const handleImportQuestions = async (questions: any[]) => {
    try {
      // Convert imported questions to API format and create them
      for (const question of questions) {
        const apiData: any = {
          name:
            question.questionText.slice(0, 100) +
            (question.questionText.length > 100 ? "..." : ""),
          description: question.explanation || "",
          questionType: mapQuestionTypeToApi(question.questionType || ""),
          questionText: question.questionText || "",
          maxScore: question.points || 10,
          shuffleOptions: Boolean(question.shuffleOptions), // Ensure it's a boolean
          answer: {
            answer: question.correctAnswer || question.answer?.answer || "",
            codeAnswer: null, // Will be set for multiple choice
          },
        };

        // Only include optionsText and optionsCode for multiple choice questions
        if (question.questionType === "multiple_choice" && question.options) {
          const validOptions = question.options.filter(
            (opt: any) => opt.text.trim() !== "",
          );
          apiData.optionsText = validOptions.map((opt: any) => opt.text);

          // Generate optionsCode (A, B, C, D, etc.)
          apiData.optionsCode = validOptions.map(
            (_: any, index: number) => String.fromCharCode(65 + index), // 65 is 'A' in ASCII
          );

          // Find the correct answer code
          const correctOptionIndex = validOptions.findIndex(
            (opt: any) => opt.isCorrect,
          );
          if (correctOptionIndex !== -1) {
            apiData.answer.codeAnswer = String.fromCharCode(
              65 + correctOptionIndex,
            );
            // Also set the answer text
            apiData.answer.answer = validOptions[correctOptionIndex].text;
          }
        }

        console.log("📤 Importing question with data:", apiData);
        await createMasterQuestionMutation.mutateAsync(apiData);
      }

      showToastMessage(
        "success",
        `${questions.length} soal berhasil diimport!`,
      );
      setIsImportModalOpen(false);
      refetch();
    } catch (error: any) {
      showToastMessage("warning", `Gagal mengimport soal: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Bank Soal
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Kelola {pageMeta?.totalResultCount || masterQuestions.length} soal
              yang dapat digunakan kembali untuk kuis Anda
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsImportModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Import Excel
            </Button>
            <Button
              onClick={() => setIsCreateDrawerOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Soal
            </Button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col lg:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Cari berdasarkan judul atau pertanyaan..."
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Type Filter */}
            <div className="w-full sm:w-40">
              <Dropdown
                items={[
                  { value: "", label: "Semua Tipe" },
                  ...QUESTION_TYPES.map((t) => ({
                    value: t.value,
                    label: t.label,
                  })),
                ]}
                value={typeFilter || ""}
                onChange={handleTypeFilter}
                size="sm"
                variant="outline"
                searchable={false}
                placeholder="Tipe Soal"
                className="w-full"
              />
            </div>
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
                Tipe:{" "}
                {QUESTION_TYPES.find((t) => t.value === typeFilter)?.label}
                <button
                  onClick={() => handleTypeFilter("")}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading soal...</span>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>Error loading soal. Silakan coba lagi.</p>
          </div>
        </div>
      ) : paginatedQuestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedQuestions.map((question: BankQuestion) => {
            const typeInfo = getQuestionTypeInfo(question.questionType);
            const Icon = typeInfo.icon;

            return (
              <Card
                key={question.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Icon className={`w-4 h-4 text-${typeInfo.color}-600`} />
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full bg-${typeInfo.color}-100 text-${typeInfo.color}-800`}
                      >
                        {typeInfo.label}
                      </span>
                      {question.shuffleOptions &&
                        question.questionType === "multiple_choice" && (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                            Acak Opsi
                          </span>
                        )}

                      {question.questionTagName && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {question.questionTagName}
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditQuestion(question)}
                        className="text-gray-500 hover:text-blue-600"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {question.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {question.questionText}
                    </p>
                  </div>

                  {/* Tags */}
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {question.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTitle || typeFilter
              ? "Tidak ada soal yang sesuai dengan kriteria pencarian Anda"
              : "Tidak ada soal yang tersedia"}
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => setIsImportModalOpen(true)}
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Import Excel
            </Button>
            <Button
              onClick={() => setIsCreateDrawerOpen(true)}
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Soal
            </Button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pageMeta &&
        (pageMeta.totalPageCount > 1 || perPageOptions.length > 0) &&
        paginatedQuestions.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-zinc-700 pt-6">
            <div className="text-sm text-gray-600 dark:text-zinc-400 whitespace-nowrap">
              {pageMeta.showingFrom > 0 && pageMeta.showingTo > 0 ? (
                <>
                  Menampilkan{" "}
                  <span className="font-medium">{pageMeta.showingFrom}</span> -{" "}
                  <span className="font-medium">{pageMeta.showingTo}</span> dari{" "}
                  <span className="font-medium">
                    {pageMeta.totalResultCount}
                  </span>{" "}
                  soal
                </>
              ) : (
                <>Total {pageMeta.totalResultCount} soal</>
              )}
            </div>

            <div className="flex items-center gap-4">
              {pageMeta.totalPageCount > 1 && (
                <div className="flex-1 flex justify-center">
                  <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    showPrevNext
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-zinc-400">
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
                  className="min-w-20"
                />
              </div>
            </div>
          </div>
        )}

      {/* Create Question Drawer */}
      <Drawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        title="Tambah Soal Baru"
        size="lg"
        showFooter={false}
      >
        <QuestionForm
          onSave={handleCreateQuestion}
          onCancel={() => setIsCreateDrawerOpen(false)}
          isLoading={createMasterQuestionMutation.isPending}
        />
      </Drawer>

      {/* Edit Question Drawer */}
      <Drawer
        isOpen={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        title="Edit Soal"
        size="lg"
        showFooter={false}
      >
        <QuestionForm
          question={editingQuestion || undefined}
          onSave={handleUpdateQuestion}
          onCancel={() => setIsEditDrawerOpen(false)}
          isLoading={updateMasterQuestionMutation.isPending}
        />
      </Drawer>

      {/* Import Questions Modal */}
      <ImportQuestionsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportQuestions}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Hapus Soal?"
        description={`Apakah Anda yakin ingin menghapus soal "${deleteConfirm.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={deleteMasterQuestionMutation.isPending}
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
