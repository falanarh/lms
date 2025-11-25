"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import {
  Plus,
  Edit3,
  Trash2,
  GripVertical,
  Save,
  X,
  Check,
  CheckSquare,
  AlertCircle,
  Clock,
  Target,
  FileText,
  Layers,
  RefreshCw,
  Sparkles,
  Database,
  Search,
  ArrowLeft,
  Brain,
} from "lucide-react";
import { Toast } from "@/components/ui/Toast/Toast";
import { BlockNoteEditor } from "./BlockNoteEditor";
import {
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from "@/hooks/useQuestions";
import type { QuestionRequest } from "@/api/questions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog/ConfirmDialog";
import { useQuizById } from "@/hooks/useQuiz";
import Dropdown from "@/components/ui/Dropdown/Dropdown";
import { FileSpreadsheet } from "lucide-react";
import { ImportQuestionsModal } from "./importQuestionsModal";
import { Pagination } from '@/components/shared/Pagination/Pagination';
import { useMasterQuestions } from "@/hooks/useMasterQuestions";
import { BankQuestion } from "./BankSoal";
import { useQuestionValidation, useQuizQuestionValidation, validateQuestionForm, validateQuizQuestion, validateCreateQuestionRequest, validateAIGeneratedQuestion, type QuestionFormState } from "@/hooks/useQuestionValidation";

// Types for quiz questions
export interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: "multiple_choice" | "essay" | "true_false";
  points: number;
  order: number;
  options?: QuizOption[];
  correctAnswer?: string;
  explanation?: string;
  timeLimit?: number;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface QuizInfo {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  shuffleQuestions: boolean;
  passingScore?: number;
  totalQuestions: number;
  maxPoints: number;
  attemptLimit?: number;
}

interface PageMeta {
  page: number;
  perPage: number;
  hasPrev: boolean;
  hasNext: boolean;
  totalPageCount: number;
  showingFrom: number;
  showingTo: number;
  resultCount: number;
  totalResultCount: number;
}

interface QuizQuestionsManagerProps {
  quizInfo?: QuizInfo;
  onBack: () => void;
  onSaveQuiz?: (quizInfo: QuizInfo, questions: QuizQuestion[]) => void;
  initialQuestions?: QuizQuestion[];
  quizId: string;
  pageMeta?: PageMeta;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
}

// Helper function to map frontend question types to API question types
const mapQuestionTypeToAPI = (frontendType: string): "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" => {
  switch (frontendType.toLowerCase()) {
    case 'multiple_choice':
      return 'MULTIPLE_CHOICE';
    case 'true_false':
      return 'TRUE_FALSE';
    case 'essay':
    case 'short_answer':
      return 'SHORT_ANSWER';
    default:
      return 'MULTIPLE_CHOICE';
  }
};

export function QuizQuestionsManager({
  quizInfo,
  onBack,
  onSaveQuiz,
  initialQuestions = [],
  quizId,
  pageMeta,
  onPageChange,
  onPerPageChange,
}: QuizQuestionsManagerProps) {
  const { data: quizData, isLoading: quizLoading } = useQuizById(quizId);
  
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'info' | 'warning' | 'success'>('success');
  const [draggedQuestion, setDraggedQuestion] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const currentPage = pageMeta?.page || 1;
  const perPage = pageMeta?.perPage || 10;
  const totalPages = pageMeta?.totalPageCount || 1;
  const showingFrom = pageMeta?.showingFrom || 0;
  const showingTo = pageMeta?.showingTo || 0;
  const totalQuestions = pageMeta?.totalResultCount || 0;

  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);
  
  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const handlePerPageChange = (perPageValue: string) => {
    const newPerPage = parseInt(perPageValue);
    if (onPerPageChange) {
      onPerPageChange(newPerPage);
    }
  };

  const perPageOptions = [
    { value: '5', label: '5' },
    { value: '10', label: '10' },
    { value: '15', label: '15' },
    { value: '20', label: '20' },
  ];

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    questionId: string | null;
    questionText: string;
  }>({
    isOpen: false,
    questionId: null,
    questionText: "",
  });

  const createQuestionMutation = useCreateQuestion();
  const updateQuestionMutation = useUpdateQuestion();
  const deleteQuestionMutation = useDeleteQuestion();

  const showToastMessage = (variant: 'info' | 'warning' | 'success' = 'success', message: string) => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const handleCreateQuestion = () => {
    setShowQuestionOptionDialog(true);
  };

  const handleGenerateWithAI = () => {
    setShowAIGenerationModal(true);
  };

  const handleAddGeneratedQuestion = async (generatedQ: any) => {
    try {
      // Generate 3-character codes for multiple choice options
      const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 3; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };

      // Convert AI question to QuizQuestion format
      let optionsCode: string[] = [];
      let correctAnswerCode: string = '';

      if (generatedQ.question_type === 'multiple_choice' && generatedQ.options) {
        optionsCode = generatedQ.options.map(() => generateRandomCode());
        const correctIndex = parseInt(generatedQ.answer_text);
        correctAnswerCode = optionsCode[correctIndex] || optionsCode[0];
      }

      const quizQuestion: QuizQuestion = {
        id: `temp-${Date.now()}-${Math.random()}`,
        questionText: generatedQ.question_text,
        questionType: generatedQ.question_type === 'multiple_choice' ? 'multiple_choice' :
                     generatedQ.question_type === 'true_false' ? 'true_false' : 'essay',
        points: 10,
        order: questions.length,
        explanation: generatedQ.explanation || '',
        options: generatedQ.question_type === 'multiple_choice' && generatedQ.options ?
          generatedQ.options.map((text: string, index: number) => ({
            id: `opt-${index}`,
            text: text,
            isCorrect: index.toString() === generatedQ.answer_text,
            order: index
          })) :
          generatedQ.question_type === 'true_false' ? [
            { id: '1', text: 'Benar', isCorrect: generatedQ.answer_text === 'true', order: 0 },
            { id: '2', text: 'Salah', isCorrect: generatedQ.answer_text === 'false', order: 1 }
          ] : [],
        correctAnswer: generatedQ.question_type === 'true_false' ? generatedQ.answer_text :
                     generatedQ.question_type === 'essay' ? generatedQ.answer_text : undefined,
      };

      // Prepare API request for question creation
      const createRequest: QuestionRequest = {
        idContent: "f2a4b4ec-4e94-4bd8-a44e-22a9af311a81",
        name: `Question ${questions.length + 1}`, // Generate a name for the question
        questionType: mapQuestionTypeToAPI(generatedQ.question_type),
        questionText: generatedQ.question_text,
        maxScore: 10,
        optionsCode: generatedQ.question_type === 'multiple_choice' ? optionsCode : [],
        optionsText: generatedQ.question_type === 'multiple_choice' && generatedQ.options ?
          generatedQ.options.map((opt: string) => opt).filter((text: string) => text.trim()) :
          generatedQ.question_type === 'true_false' ? ["True", "False"] : [],
        answer: generatedQ.question_type === 'true_false' ?
          { answer: generatedQ.answer_text, codeAnswer: null } :
          generatedQ.question_type === 'essay' ? { answer: (generatedQ.answer_text || ""), codeAnswer: null } :
          generatedQ.question_type === 'multiple_choice' && generatedQ.options ?
            {
              answer: generatedQ.options[parseInt(generatedQ.answer_text)],
              codeAnswer: correctAnswerCode
            } : { answer: "", codeAnswer: null }
      };

      console.log('🤖 AI Question - Creating question:', {
        questionId: generatedQ.question_id,
        createRequest,
        quizQuestion
      });

      // Validate the create request before sending to API
      const requestValidation = validateCreateQuestionRequest(createRequest);
      if (!requestValidation.success) {
        console.error('❌ AI Question API request validation failed:', requestValidation.error);
        showToastMessage('warning', 'AI question data is invalid');
        return;
      }

      // Create question in backend
      const createdQuestion = await createQuestionMutation.mutateAsync(createRequest);

      // Add question to local state with backend ID
      const newQuestion: QuizQuestion = {
        ...quizQuestion,
        id: createdQuestion.id // Use the backend ID
      };

      setQuestions(prev => [...prev, newQuestion]);
      showToastMessage('success', 'Soal berhasil ditambahkan dari AI dan disimpan ke database!');

      console.log('🤖 AI Question - Successfully created:', createdQuestion);

    } catch (error) {
      console.error('🤖 AI Question - Error saving to backend:', error);
      showToastMessage('warning', 'Gagal menyimpan soal ke database, menambahkan ke lokal saja.');

      // Fallback: add to local state only if backend save fails
      const fallbackQuestion: QuizQuestion = {
        id: `temp-${Date.now()}-${Math.random()}`,
        questionText: generatedQ.question_text,
        questionType: generatedQ.question_type === 'multiple_choice' ? 'multiple_choice' :
                     generatedQ.question_type === 'true_false' ? 'true_false' : 'essay',
        points: 10,
        order: questions.length,
        explanation: generatedQ.explanation || '',
        options: generatedQ.question_type === 'multiple_choice' && generatedQ.options ?
          generatedQ.options.map((text: string, index: number) => ({
            id: `opt-${index}`,
            text: text,
            isCorrect: index.toString() === generatedQ.answer_text,
            order: index
          })) :
          generatedQ.question_type === 'true_false' ? [
            { id: '1', text: 'Benar', isCorrect: generatedQ.answer_text === 'true', order: 0 },
            { id: '2', text: 'Salah', isCorrect: generatedQ.answer_text === 'false', order: 1 }
          ] : [],
        correctAnswer: generatedQ.question_type === 'true_false' ? generatedQ.answer_text :
                     generatedQ.question_type === 'essay' ? generatedQ.answer_text : undefined,
      };

      setQuestions(prev => [...prev, fallbackQuestion]);
      showToastMessage('success', 'Soal berhasil ditambahkan dari AI (mode lokal)');
    }
  };

  const handleEditGeneratedQuestion = (question: any) => {
    setEditingGeneratedQuestion(JSON.parse(JSON.stringify(question))); // Deep copy
  };

  const handleSaveEditedGeneratedQuestion = () => {
    if (!editingGeneratedQuestion) return;

    // Update the question in the generatedQuestions array
    setGeneratedQuestions(prev =>
      prev.map(q => q.question_id === editingGeneratedQuestion.question_id ? editingGeneratedQuestion : q)
    );

    setEditingGeneratedQuestion(null);
    showToastMessage('success', 'Soal AI berhasil diperbarui!');
  };

  const handleCancelEditGeneratedQuestion = () => {
    setEditingGeneratedQuestion(null);
  };

  const handleToggleAIQuestionSelection = (index: number) => {
    const newSelection = new Set(selectedAIQuestions);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedAIQuestions(newSelection);
  };

  const handleSelectAllAIQuestions = () => {
    if (selectedAIQuestions.size === generatedQuestions.length) {
      setSelectedAIQuestions(new Set());
    } else {
      setSelectedAIQuestions(new Set(generatedQuestions.map((_, index) => index)));
    }
  };

  const handleAddSelectedAIQuestions = async () => {
    if (selectedAIQuestions.size === 0) {
      showToastMessage('warning', 'Silakan pilih setidaknya satu soal terlebih dahulu!');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const index of selectedAIQuestions) {
      const generatedQ = generatedQuestions[index];
      try {
        await handleAddGeneratedQuestion(generatedQ);
        successCount++;
      } catch (error) {
        console.error(`Failed to add AI question at index ${index}:`, error);
        failCount++;
      }
    }

    // Clear selection and close modal
    setSelectedAIQuestions(new Set());
    setShowAIGenerationModal(false);
    setGeneratedQuestions([]);

    if (successCount > 0) {
      showToastMessage('success', `Berhasil menambahkan ${successCount} soal dari AI!`);
    }
    if (failCount > 0) {
      showToastMessage('warning', `${failCount} soal gagal ditambahkan.`);
    }
  };

  const handleAddEditedGeneratedQuestion = async (editedQ: any) => {
    try {
      // Generate 3-character codes for multiple choice options
      const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 3; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };

      // Convert edited AI question to QuizQuestion format
      let optionsCode: string[] = [];
      let correctAnswerCode: string = '';

      if (editedQ.question_type === 'multiple_choice' && editedQ.options) {
        optionsCode = editedQ.options.map(() => generateRandomCode());
        const correctIndex = parseInt(editedQ.answer_text);
        correctAnswerCode = optionsCode[correctIndex] || optionsCode[0];
      }

      const quizQuestion: QuizQuestion = {
        id: `temp-${Date.now()}-${Math.random()}`,
        questionText: editedQ.question_text,
        questionType: editedQ.question_type === 'multiple_choice' ? 'multiple_choice' :
                     editedQ.question_type === 'true_false' ? 'true_false' : 'essay',
        points: 10,
        order: questions.length,
        explanation: editedQ.explanation || '',
        options: editedQ.question_type === 'multiple_choice' && editedQ.options ?
          editedQ.options.map((text: string, index: number) => ({
            id: `opt-${index}`,
            text: text,
            isCorrect: index.toString() === editedQ.answer_text,
            order: index
          })) :
          editedQ.question_type === 'true_false' ? [
            { id: '1', text: 'Benar', isCorrect: editedQ.answer_text === 'true', order: 0 },
            { id: '2', text: 'Salah', isCorrect: editedQ.answer_text === 'false', order: 1 }
          ] : [],
        correctAnswer: editedQ.question_type === 'true_false' ? editedQ.answer_text :
                     editedQ.question_type === 'essay' ? editedQ.answer_text : undefined,
      };

      // Prepare API request for question creation
      const createRequest: QuestionRequest = {
        idContent: "f2a4b4ec-4e94-4bd8-a44e-22a9af311a81",
        name: `Question ${questions.length + 1} (Edited)`, // Generate a name for the question
        questionType: mapQuestionTypeToAPI(editedQ.question_type),
        questionText: editedQ.question_text,
        maxScore: 10,
        optionsCode: editedQ.question_type === 'multiple_choice' ? optionsCode : [],
        optionsText: editedQ.question_type === 'multiple_choice' && editedQ.options ?
          editedQ.options.map((opt: string) => opt).filter((text: string) => text.trim()) :
          editedQ.question_type === 'true_false' ? ["True", "False"] : [],
        answer: editedQ.question_type === 'true_false' ?
          { answer: editedQ.answer_text, codeAnswer: null } :
          editedQ.question_type === 'essay' ? { answer: (editedQ.answer_text || ""), codeAnswer: null } :
          editedQ.question_type === 'multiple_choice' && editedQ.options ?
            {
              answer: editedQ.options[parseInt(editedQ.answer_text)],
              codeAnswer: correctAnswerCode
            } : { answer: "", codeAnswer: null }
      };

      console.log('🤖 AI Question - Creating edited question:', {
        questionId: editedQ.question_id,
        createRequest,
        quizQuestion
      });

      // Create question in backend
      const createdQuestion = await createQuestionMutation.mutateAsync(createRequest);

      // Add question to local state with backend ID
      const newQuestion: QuizQuestion = {
        ...quizQuestion,
        id: createdQuestion.id // Use the backend ID
      };

      setQuestions(prev => [...prev, newQuestion]);
      setEditingGeneratedQuestion(null);
      showToastMessage('success', 'Soal berhasil diedit dan disimpan ke database!');

      console.log('🤖 AI Question - Successfully created edited question:', createdQuestion);

    } catch (error) {
      console.error('🤖 AI Question - Error saving edited question to backend:', error);
      showToastMessage('warning', 'Gagal menyimpan soal ke database, menambahkan ke lokal saja.');

      // Fallback: add to local state only if backend save fails
      const fallbackQuestion: QuizQuestion = {
        id: `temp-${Date.now()}-${Math.random()}`,
        questionText: editedQ.question_text,
        questionType: editedQ.question_type === 'multiple_choice' ? 'multiple_choice' :
                     editedQ.question_type === 'true_false' ? 'true_false' : 'essay',
        points: 10,
        order: questions.length,
        explanation: editedQ.explanation || '',
        options: editedQ.question_type === 'multiple_choice' && editedQ.options ?
          editedQ.options.map((text: string, index: number) => ({
            id: `opt-${index}`,
            text: text,
            isCorrect: index.toString() === editedQ.answer_text,
            order: index
          })) :
          editedQ.question_type === 'true_false' ? [
            { id: '1', text: 'Benar', isCorrect: editedQ.answer_text === 'true', order: 0 },
            { id: '2', text: 'Salah', isCorrect: editedQ.answer_text === 'false', order: 1 }
          ] : [],
        correctAnswer: editedQ.question_type === 'true_false' ? editedQ.answer_text :
                     editedQ.question_type === 'essay' ? editedQ.answer_text : undefined,
      };

      setQuestions(prev => [...prev, fallbackQuestion]);
      setEditingGeneratedQuestion(null);
      showToastMessage('success', 'Soal berhasil diedit dari AI (mode lokal)');
    }
  };

  const handleGenerateQuestions = () => {
    // Static data for now
    const aiResponse = {
      "success": true,
      "generation_id": "8962c7ce-aae9-4e5a-9ec4-3b9a0feb7a0e",
      "file_names": [
        "LoRA. Low Rank Adaptation of LLM.pdf"
      ],
      "material_ids": [
        "6071803f93e4573eb7e0fb2c4e65976a"
      ],
      "ingestion_stats": {
        "processed": 0,
        "skipped": 1
      },
      "generated_questions": [
        {
          "question_id": "Q1",
          "question_text": "Apa yang dimaksud dengan tugas NL2SQL dalam konteks pemrosesan bahasa alami?",
          "question_type": "multiple_choice",
          "answer_text": "1",
          "options": [
            "Mengubah SQL menjadi bahasa alami",
            "Mengubah pertanyaan bahasa alami menjadi perintah SQL",
            "Meringkas artikel menjadi SQL",
            "Mengubah data tabel menjadi teks"
          ],
          "difficulty": "D2",
          "source_chunk": "CHUNK 1",
          "explanation": "NL2SQL adalah tugas yang mengubah pertanyaan dalam bahasa alami menjadi perintah SQL.",
          "cognitive_level": "C1",
          "question_pattern": "P1",
          "attempt_count": 0,
          "success_rate": 0
        },
        {
          "question_id": "Q2",
          "question_text": "Bagaimana pendekatan PreEmbed mempengaruhi kinerja model?",
          "question_type": "multiple_choice",
          "answer_text": "2",
          "options": [
            "Dengan menambah lapisan transformer",
            "Dengan menambahkan token khusus yang dapat dilatih di antara token input",
            "Dengan mengurangi jumlah parameter yang dapat dilatih",
            "Dengan menghapus lapisan adapter"
          ],
          "difficulty": "D2",
          "source_chunk": "CHUNK 3",
          "explanation": "PreEmbed menambahkan token khusus yang dapat dilatih di antara token input, yang dapat mempengaruhi kinerja model.",
          "cognitive_level": "C2",
          "question_pattern": "P1",
          "attempt_count": 0,
          "success_rate": 0
        },
        {
          "question_id": "Q3",
          "question_text": "Sebuah perusahaan menggunakan LoRA+PreﬁxEmbed untuk meningkatkan kinerja model pada dataset WikiSQL. Apa keuntungan utama dari pendekatan ini?",
          "question_type": "multiple_choice",
          "answer_text": "0",
          "options": [
            "Mengurangi jumlah parameter yang dapat dilatih",
            "Meningkatkan kecepatan pelatihan",
            "Memungkinkan penyesuaian yang lebih baik dengan data yang lebih sedikit",
            "Menghilangkan kebutuhan akan data validasi"
          ],
          "difficulty": "D2",
          "source_chunk": "CHUNK 5",
          "explanation": "LoRA+PreﬁxEmbed memungkinkan penyesuaian yang lebih baik dengan data yang lebih sedikit.",
          "cognitive_level": "C3",
          "question_pattern": "P2",
          "attempt_count": 0,
          "success_rate": 0
        },
        {
          "question_id": "Q4",
          "question_text": "Dalam situasi di mana Anda harus memilih antara AdapterH dan AdapterL untuk efisiensi, mana yang lebih efisien dan mengapa?",
          "question_type": "multiple_choice",
          "answer_text": "1",
          "options": [
            "AdapterH karena memiliki lebih banyak lapisan",
            "AdapterL karena diterapkan hanya setelah modul MLP dan LayerNorm",
            "AdapterH karena lebih mudah diimplementasikan",
            "AdapterL karena mengurangi jumlah token input"
          ],
          "difficulty": "D2",
          "source_chunk": "CHUNK 3",
          "explanation": "AdapterL lebih efisien karena diterapkan hanya setelah modul MLP dan LayerNorm, mengurangi kompleksitas.",
          "cognitive_level": "C4",
          "question_pattern": "P3",
          "attempt_count": 0,
          "success_rate": 0
        },
        {
          "question_id": "Q5",
          "question_text": "Evaluasi efektivitas LoRA dibandingkan dengan fine-tuning pada tugas MNLI dengan data terbatas.",
          "question_type": "multiple_choice",
          "answer_text": "2",
          "options": [
            "LoRA kurang efektif dibandingkan fine-tuning",
            "LoRA dan fine-tuning memiliki efektivitas yang sama",
            "LoRA lebih efektif dibandingkan fine-tuning",
            "Fine-tuning lebih efektif dibandingkan LoRA"
          ],
          "difficulty": "D2",
          "source_chunk": "CHUNK 8",
          "explanation": "LoRA lebih efektif dibandingkan fine-tuning pada tugas MNLI dengan data terbatas.",
          "cognitive_level": "C5",
          "question_pattern": "P2",
          "attempt_count": 0,
          "success_rate": 0
        }
      ],
      "metadata": {
        "timestamp": "2025-11-18T09:38:05.098433",
        "total_questions": 10,
        "question_types": [
          "multiple_choice"
        ],
        "difficulty": "D2",
        "rag_enabled": true,
        "chunks_retrieved": 31,
        "prompt_tokens": 6786,
        "completion_tokens": 1740,
        "total_tokens": 8526,
        "total_cost": 0.034365,
        "latency_ms": 29280.029800000193,
        "question_types_distribution": {
          "multiple_choice": 10
        },
        "cognitive_levels_distribution": {},
        "question_patterns_distribution": {}
      },
      "cache_status": "MISS",
      "processing_time_ms": 32120.81219999982,
      "error": null
    };

    setGeneratedQuestions(aiResponse.generated_questions);
    showToastMessage('success', `Berhasil generate ${aiResponse.generated_questions.length} soal!`);
  };

  const handleCreateNewQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `temp-${Date.now()}`,
      questionText: '',
      questionType: 'multiple_choice',
      points: 10,
      order: questions.length,
      options: [
        { id: '1', text: '', isCorrect: false, order: 0 },
        { id: '2', text: '', isCorrect: false, order: 1 },
        { id: '3', text: '', isCorrect: false, order: 2 },
        { id: '4', text: '', isCorrect: false, order: 3 }
      ]
    };
    setEditingQuestion(newQuestion);
    setIsCreatingQuestion(true);
    setQuestionFormSource('new');
    setShowQuestionOptionDialog(false);
  };

  const handleSelectFromBankSoal = () => {
    setShowBankSoalModal(true);
    setShowQuestionOptionDialog(false);
  };

  const handleBankSoalSelect = (bankQuestion: any) => {
    console.log("🔧 Bank Soal Selected:", bankQuestion);

    // Extract correct answer from bankQuestion.answer.answer
    // Based on API response: {"answer": {"answer": "text", "codeAnswer": "code"}}
    let correctAnswerText = "";
    let hasCorrectAnswer = false;

    if (bankQuestion.answer && bankQuestion.answer.answer && typeof bankQuestion.answer.answer === 'string') {
      correctAnswerText = bankQuestion.answer.answer.trim();
      hasCorrectAnswer = correctAnswerText !== "";
    }

    console.log("🔧 Answer extraction debug:", {
      bankQuestionAnswer: bankQuestion.answer,
      correctAnswerText,
      hasCorrectAnswer,
      optionsText: bankQuestion.optionsText,
      codeAnswer: bankQuestion.answer?.codeAnswer
    });

    // Convert API question type to frontend format
    let convertedQuestionType: 'multiple_choice' | 'true_false' | 'essay';
    switch (bankQuestion.questionType) {
      case 'MULTIPLE_CHOICE':
        convertedQuestionType = 'multiple_choice';
        break;
      case 'TRUE_FALSE':
        convertedQuestionType = 'true_false';
        break;
      case 'SHORT_ANSWER':
        convertedQuestionType = 'essay';
        break;
      default:
        convertedQuestionType = 'multiple_choice';
    }

    // Convert BankQuestion to QuizQuestion format with proper defaults
    const newQuestion: QuizQuestion = {
      id: `temp-${Date.now()}`,
      questionText: bankQuestion.questionText || '',
      questionType: convertedQuestionType,
      points: bankQuestion.maxScore || 1,
      order: questions.length,
      explanation: bankQuestion.description || '',
      correctAnswer: correctAnswerText,
      options: bankQuestion.optionsText && bankQuestion.optionsText.length > 0 ?
        bankQuestion.optionsText.map((optionText: string, index: number) => ({
          id: `opt-${index}`,
          text: optionText || '',
          isCorrect: hasCorrectAnswer ? optionText.trim() === correctAnswerText : false,
          order: index
        })) :
        // Provide default empty options for non-multiple choice questions
        convertedQuestionType === 'multiple_choice' ? [
          { id: 'opt-0', text: '', isCorrect: false, order: 0 },
          { id: 'opt-1', text: '', isCorrect: false, order: 1 },
          { id: 'opt-2', text: '', isCorrect: false, order: 2 },
          { id: 'opt-3', text: '', isCorrect: false, order: 3 }
        ] : undefined
    };

    console.log("🔧 Converted QuizQuestion:", {
      ...newQuestion,
      debug: {
        originalAnswer: bankQuestion.answer,
        correctAnswerText,
        hasCorrectAnswer,
        correctAnswerFieldValue: newQuestion.correctAnswer,
        optionsWithCorrect: newQuestion.options?.map(opt => ({
          text: opt.text,
          isCorrect: opt.isCorrect
        }))
      }
    });

    console.log("🔧 About to setEditingQuestion with correctAnswer:", newQuestion.correctAnswer);

    setEditingQuestion(newQuestion);
    setIsCreatingQuestion(true);
    setQuestionFormSource('bank');
    setShowBankSoalModal(false);

    // Debug: Check what was actually set
    setTimeout(() => {
      console.log("🔧 editingQuestion after setState:", editingQuestion);
    }, 100);
  };

  const [showImportModal, setShowImportModal] = useState(false);
  const [showQuestionOptionDialog, setShowQuestionOptionDialog] = useState(false);
  const [showBankSoalModal, setShowBankSoalModal] = useState(false);
  const [showAIGenerationModal, setShowAIGenerationModal] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [selectedAIQuestions, setSelectedAIQuestions] = useState<Set<number>>(new Set());
  const [editingGeneratedQuestion, setEditingGeneratedQuestion] = useState<any | null>(null);
  const [bankSoalSearch, setBankSoalSearch] = useState("");
  const [bankSoalPage, setBankSoalPage] = useState(1);
  const [debouncedBankSoalSearch, setDebouncedBankSoalSearch] = useState("");
  const [questionFormSource, setQuestionFormSource] = useState<'new' | 'bank' | null>(null);

  // Bank Soal data
  const {
    data: bankSoalResponse,
    isLoading: isLoadingBankSoal,
    error: bankSoalError,
  } = useMasterQuestions({
    page: bankSoalPage,
    perPage: 5,
    searchQuery: debouncedBankSoalSearch,
  });

  const bankSoalData = bankSoalResponse?.data || [];
  const bankSoalPageMeta = bankSoalResponse?.pageMeta;

  // Debug: Log the bank soal data
  console.log("🔍 Bank Soal Data:", {
    response: bankSoalResponse,
    data: bankSoalData,
    isLoading: isLoadingBankSoal,
    error: bankSoalError
  });

  // Debounce bank soal search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBankSoalSearch(bankSoalSearch);
      setBankSoalPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [bankSoalSearch]);

  const handleImportQuestions = async (importedQuestions: QuizQuestion[]) => {
    try {
      const createdQuestions: QuizQuestion[] = [];

      // Validate all imported questions first
      const validationResults = importedQuestions.map(question => {
        const validation = validateQuizQuestion(question);
        return {
          question,
          validation,
          index: importedQuestions.indexOf(question)
        };
      });

      // Check if any questions failed validation
      const failedValidations = validationResults.filter(result => !result.validation.success);
      if (failedValidations.length > 0) {
        console.error('❌ Import validation failed:', failedValidations);
        showToastMessage('warning', `${failedValidations.length} question(s) failed validation`);
        return;
      }

      for (const question of importedQuestions) {
        const questionName = question.questionText
          .replace(/<[^>]*>/g, '')
          .substring(0, 100)
          .trim() || "Question";
    
        const createRequest: QuestionRequest = {
          idContent: quizId,
          name: questionName,
          questionType: mapQuestionTypeToAPI(question.questionType),
          questionText: question.questionText,
          maxScore: question.points,
          optionsText: question.questionType === "multiple_choice" && question.options
            ? question.options.map(opt => opt.text).filter(text => text.trim())
            : question.questionType === "true_false"
            ? ["True", "False"]
            : undefined,
          answer: question.questionType === "multiple_choice" && question.options
            ? { answer: question.options.find(opt => opt.isCorrect)?.text || "" }
            : question.questionType === "true_false"
            ? { answer: (question.correctAnswer || "true") }
            : { answer: (question.correctAnswer || "") } // For essay questions, use correctAnswer or empty string
        };
    
        try {
          const createdQuestion = await createQuestionMutation.mutateAsync(createRequest);
          createdQuestions.push({
            ...question,
            id: createdQuestion.id
          });
        } catch (error) {
          console.error("Error creating question:", error);
        }
      }
    
      setQuestions([...questions, ...createdQuestions]);
      
      showToastMessage(
        'success',
        `Berhasil mengimport ${createdQuestions.length} dari ${importedQuestions.length} soal!`
      );
      
      setShowImportModal(false);
    } catch (error) {
      console.error("Error importing questions:", error);
      showToastMessage('warning', 'Gagal mengimport soal. Silakan coba lagi.');
    }
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion({ ...question });
    setIsCreatingQuestion(false);
  };

  const handleSaveQuestion = async (questionData: QuizQuestion) => {
    try {
      const questionName = questionData.questionText
        .replace(/<[^>]*>/g, '')
        .substring(0, 100)
        .trim() || "Question";

      if (isCreatingQuestion) {
        // For essay questions, ensure correctAnswer is provided
        let answerText = "";
        if (questionData.questionType === "multiple_choice" && questionData.options) {
          answerText = questionData.options.find(opt => opt.isCorrect)?.text || "";
        } else if (questionData.questionType === "true_false") {
          answerText = questionData.correctAnswer || "true";
        } else if (questionData.questionType === "essay") {
          answerText = questionData.correctAnswer || "Default essay answer";
          console.warn("📝 Essay question created with default answer:", answerText);
        }

        const createRequest: QuestionRequest = {
          idContent: quizId,
          name: questionName,
          questionType: mapQuestionTypeToAPI(questionData.questionType),
          questionText: questionData.questionText,
          maxScore: questionData.points,
          optionsText: questionData.questionType === "multiple_choice" && questionData.options
            ? questionData.options.map(opt => opt.text).filter(text => text.trim())
            : questionData.questionType === "true_false"
            ? ["True", "False"]
            : undefined,
          answer: {
            answer: answerText
          }
        };

        console.log("📝 Creating new question:", {
          ...createRequest,
          debug: {
            questionType: questionData.questionType,
            mappedType: mapQuestionTypeToAPI(questionData.questionType),
            correctAnswer: questionData.correctAnswer,
            finalAnswer: answerText
          }
        });

        const createdQuestion = await createQuestionMutation.mutateAsync(createRequest);
        const newQuestion = {
          ...questionData,
          id: createdQuestion.id
        };
        setQuestions([...questions, newQuestion]);
        showToastMessage('success', 'Soal berhasil ditambahkan!');
      } else {
        // For essay questions, ensure correctAnswer is provided
        let answerText = "";
        if (questionData.questionType === "multiple_choice" && questionData.options) {
          answerText = questionData.options.find(opt => opt.isCorrect)?.text || "";
        } else if (questionData.questionType === "true_false") {
          answerText = questionData.correctAnswer || "true";
        } else if (questionData.questionType === "essay") {
          answerText = questionData.correctAnswer || "Default essay answer";
          console.warn("📝 Essay question updated with default answer:", answerText);
        }

        const updateRequest: Partial<QuestionRequest> = {
          name: questionName,
          questionType: mapQuestionTypeToAPI(questionData.questionType),
          questionText: questionData.questionText,
          maxScore: questionData.points,
          optionsText: questionData.questionType === "multiple_choice" && questionData.options
            ? questionData.options.map(opt => opt.text).filter(text => text.trim())
            : questionData.questionType === "true_false"
            ? ["True", "False"]
            : undefined,
          answer: {
            answer: answerText
          }
        };

        console.log("📝 Updating question:", {
          ...updateRequest,
          debug: {
            questionType: questionData.questionType,
            mappedType: mapQuestionTypeToAPI(questionData.questionType),
            correctAnswer: questionData.correctAnswer,
            finalAnswer: answerText
          }
        });

        await updateQuestionMutation.mutateAsync({
          id: questionData.id,
          data: updateRequest,
        });
        setQuestions(questions.map(q => q.id === questionData.id ? questionData : q));
        showToastMessage('success', 'Soal berhasil diperbarui!');
      }

      setEditingQuestion(null);
      setIsCreatingQuestion(false);
    } catch (error) {
      console.error("Error saving question:", error);
      showToastMessage('warning', 'Gagal menyimpan soal. Silakan coba lagi.');
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    setDeleteConfirm({
      isOpen: true,
      questionId: questionId,
      questionText: question.questionText.replace(/<[^>]*>/g, '').substring(0, 50) || "Soal ini",
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.questionId) return;

    try {
      if (!deleteConfirm.questionId.startsWith('temp-') && !deleteConfirm.questionId.startsWith('question-')) {
        await deleteQuestionMutation.mutateAsync(deleteConfirm.questionId);
      }
      setQuestions(questions.filter(q => q.id !== deleteConfirm.questionId));
      showToastMessage('success', 'Soal berhasil dihapus!');

      setDeleteConfirm({
        isOpen: false,
        questionId: null,
        questionText: "",
      });
    } catch (error) {
      console.error("Error deleting question:", error);
      showToastMessage('warning', 'Gagal menghapus soal. Silakan coba lagi.');
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({
      isOpen: false,
      questionId: null,
      questionText: "",
    });
  };

  const handleDragStart = (e: React.DragEvent, questionId: string) => {
    setDraggedQuestion(questionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedQuestion) return;

    const draggedIndex = questions.findIndex(q => q.id === draggedQuestion);
    if (draggedIndex === targetIndex) return;

    const newQuestions = [...questions];
    const [movedQuestion] = newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(targetIndex, 0, movedQuestion);

    const reorderedQuestions = newQuestions.map((q, index) => ({
      ...q,
      order: index
    }));

    setQuestions(reorderedQuestions);
    setDraggedQuestion(null);
    setDragOverIndex(null);
  };

  const getQuestionTypeColor = (type: QuizQuestion['questionType']) => {
    switch (type) {
      case 'multiple_choice':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
      case 'essay':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800';
      case 'true_false':
        return 'bg-emerald-700 text-emerald-100 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600';
    }
  };

  const getQuestionTypeLabel = (type: QuizQuestion['questionType']) => {
    switch (type) {
      case 'multiple_choice':
        return 'Pilihan Ganda';
      case 'essay':
        return 'Short Answer';
      case 'true_false':
        return 'Benar/Salah';
      default:
        return type;
    }
  };

  if (quizLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-900/30 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl mb-4">
            <FileText className="size-8 text-blue-600 dark:text-blue-400 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-2">Memuat Data Kuis</h3>
          <p className="text-gray-500 dark:text-zinc-400 text-sm">Mohon tunggu sebentar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quiz Overview Stats */}
        <Card className="mb-6 border-0 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 px-6 py-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="size-4 opacity-90" />
                  <span className="text-blue-100 dark:text-blue-200 text-xs font-medium">Manajemen Soal Kuis</span>
                </div>
                <h1 className="text-2xl font-bold mb-1">{quizData?.content?.name || 'Kuis Baru'}</h1>
                {quizData?.content?.description && (
                  <p className="text-blue-50 dark:text-blue-100 text-sm line-clamp-1 max-w-2xl">{quizData.content.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 opacity-80" />
                  <div>
                    <p className="text-blue-100 dark:text-blue-200 text-xs">Total Soal</p>
                    <p className="text-lg font-semibold">{pageMeta?.totalResultCount || 0}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="size-4 opacity-80" />
                  <div>
                    <p className="text-blue-100 dark:text-blue-200 text-xs">Durasi</p>
                    <p className="text-lg font-semibold">{quizData?.timeLimit || 0} Menit</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Target className="size-4 opacity-80" />
                  <div>
                    <p className="text-blue-100 dark:text-blue-200 text-xs">Nilai Minimum</p>
                    <p className="text-lg font-semibold">{quizData?.passingScore || 0}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <RefreshCw className="size-4 opacity-80" />
                  <div>
                    <p className="text-blue-100 dark:text-blue-200 text-xs">Batas Percobaan</p>
                    <p className="text-lg font-semibold">{quizData?.attemptLimit || 'Tidak ada'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Questions Section */}
        <Card className="border-0 shadow-md">
          {/* Questions Header */}
          <div className="px-6 py-5 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                  Daftar Soal Kuis
                </h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                  {questions.length === 0 
                    ? 'Belum ada soal. Mulai tambahkan soal pertama.' 
                    : `Kelola ${pageMeta?.totalResultCount} soal untuk kuis ini`
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowImportModal(true)}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                >
                  <FileSpreadsheet className="size-4 mr-2" />
                  Import Excel
                </Button>
                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerateWithAI}
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-900/20 shadow-sm"
                  >
                    <Brain className="size-4 mr-2" />
                    Generate with AI
                  </Button>
                  <Button
                    onClick={handleCreateQuestion}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 shadow-sm"
                  >
                    <Plus className="size-4 mr-2" />
                    Tambah Soal
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="p-6 bg-gray-50 dark:bg-zinc-900">
            {questions.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl mb-4">
                  <FileText className="size-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-2">Belum Ada Soal</h3>
                <p className="text-gray-500 dark:text-zinc-400 mb-6 max-w-md mx-auto text-sm">
                  Tambahkan soal pertama untuk memulai membangun kuis Anda. Anda dapat menambahkan soal pilihan ganda, essay, atau benar/salah.
                </p>
                <Button 
                  onClick={handleCreateQuestion}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  <Plus className="size-4 mr-2" />
                  Tambah Soal Pertama
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, question.id)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`group relative bg-white dark:bg-zinc-800 rounded-lg border transition-all duration-150 ${
                        dragOverIndex === index
                          ? 'border-blue-400 dark:border-blue-500 shadow-md scale-[1.01]'
                          : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-sm'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="cursor-move p-1.5 hover:bg-gray-50 dark:hover:bg-zinc-700 rounded-md transition-colors">
                            <GripVertical className="size-4 text-gray-400 group-hover:text-gray-600 dark:text-zinc-500 dark:group-hover:text-zinc-400" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2.5">
                              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 dark:bg-blue-700 text-white text-xs font-bold">
                                {pageMeta ? (pageMeta.page - 1) * pageMeta.perPage + index + 1 : index + 1}
                              </div>
                              <Badge 
                                className={`${getQuestionTypeColor(question.questionType)} border text-xs px-2.5 py-0.5 font-medium`}
                              >
                                {getQuestionTypeLabel(question.questionType)}
                              </Badge>
                              <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400 text-xs px-2.5 py-0.5 font-medium">
                                {question.points} poin
                              </Badge>
                            </div>
                            
                            <div 
                              className="text-sm text-gray-700 dark:text-zinc-300 line-clamp-2 leading-relaxed mb-2"
                              dangerouslySetInnerHTML={{ __html: question.questionText || '<span class="text-gray-400 dark:text-zinc-500 italic">Soal belum diisi</span>' }}
                            />
                            {question.questionType === 'multiple_choice' && question.options && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
                                <Check className="size-3.5" />
                                <span>{question.options.filter(o => o.isCorrect).length} jawaban benar dari {question.options.length} opsi</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditQuestion(question)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 h-8 w-8 p-0"
                            >
                              <Edit3 className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 h-8 w-8 p-0"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pageMeta && (totalPages > 1 || onPerPageChange) && (
                  <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-zinc-700 pt-4">
                    <div className="text-sm text-gray-600 dark:text-zinc-400 whitespace-nowrap">
                      Menampilkan <span className="font-medium">{showingFrom}</span> - <span className="font-medium">{showingTo}</span> dari <span className="font-medium">{totalQuestions}</span> soal
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="flex-1 flex justify-center">
                        <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={handlePageChange} showPrevNext />
                        {/* <Pagination
                          totalPages={totalPages}
                          currentPage={currentPage}
                          onPageChange={handlePageChange}
                          showPrevNext={true}
                          showFirstLast={false}
                          size="sm"
                          siblingCount={3}
                          alignment="center"
                        /> */}
                      </div>
                    )}
                    
                    {onPerPageChange && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-zinc-400">Tampilkan:</span>
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
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Question Form Modal */}
      {editingQuestion && (
        <QuestionForm
          question={editingQuestion}
          onSave={handleSaveQuestion}
          onCancel={() => {
            setEditingQuestion(null);
            setIsCreatingQuestion(false);
            setQuestionFormSource(null);
          }}
          onBack={() => {
            if (questionFormSource === 'bank') {
              // If came from Bank Soal, go back to Bank Soal selection
              setShowBankSoalModal(true);
              setEditingQuestion(null);
              setIsCreatingQuestion(false);
              setQuestionFormSource(null);
            } else if (questionFormSource === 'new') {
              // If came from new question, go back to initial selection
              setShowQuestionOptionDialog(true);
              setEditingQuestion(null);
              setIsCreatingQuestion(false);
              setQuestionFormSource(null);
            }
          }}
          isCreating={isCreatingQuestion}
        />
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <Toast
            variant={toastVariant}
            message={toastMessage}
            onClose={() => setShowToast(false)}
            autoDismiss={true}
            duration={toastVariant === "success" ? 2000 : 3000}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Hapus Soal?"
        description={`Apakah Anda yakin ingin menghapus soal "${deleteConfirm.questionText}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={deleteQuestionMutation.isPending}
      />

      {showImportModal && (
        <ImportQuestionsModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportQuestions}
        />
      )}

      {/* Question Options Modal */}
      {showQuestionOptionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-600" />
                    Tambah Soal
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
                    Pilih cara untuk menambahkan soal ke kuis Anda
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuestionOptionDialog(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Create New Question Card */}
                <Card
                  className="p-8 cursor-pointer hover:shadow-xl hover:scale-105 hover:border-blue-400 transition-all duration-300 group bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-zinc-800"
                  onClick={handleCreateNewQuestion}
                >
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-all duration-300 group-hover:scale-110">
                      <Plus className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Buat Soal Baru
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                        Mulai dari awal dan buat soal sesuai kebutuhan Anda dengan pilihan lengkap
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="text-sm px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full font-medium border border-blue-200 dark:border-blue-700">
                        Pilihan Ganda
                      </span>
                      <span className="text-sm px-3 py-1.5 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full font-medium border border-green-200 dark:border-green-700">
                        Benar/Salah
                      </span>
                      <span className="text-sm px-3 py-1.5 bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded-full font-medium border border-orange-200 dark:border-orange-700">
                        Short Answer
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Bank Soal Card */}
                <Card
                  className="p-8 cursor-pointer hover:shadow-xl hover:scale-105 hover:border-purple-400 transition-all duration-300 group bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-zinc-800"
                  onClick={handleSelectFromBankSoal}
                >
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-all duration-300 group-hover:scale-110">
                      <Database className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Pilih dari Bank Soal
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                        Gunakan soal yang sudah tersimpan di Bank Soal untuk penghematan waktu
                      </p>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 rounded-full border border-purple-200 dark:border-purple-700">
                      <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        {bankSoalData?.length || 0} soal tersedia
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowQuestionOptionDialog(false)}
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bank Soal Selection Modal */}
      {showBankSoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowBankSoalModal(false);
                      setShowQuestionOptionDialog(true);
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 h-8 w-8 p-0"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                      <Database className="w-5 h-5 text-purple-600" />
                      Pilih dari Bank Soal
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
                      Pilih soal yang sudah ada untuk ditambahkan ke kuis Anda
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowBankSoalModal(false);
                    setQuestionFormSource(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Search Bar */}
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Cari soal berdasarkan judul atau pertanyaan..."
                  value={bankSoalSearch}
                  onChange={(e) => setBankSoalSearch(e.target.value)}
                  className="pl-10 w-full"
                />
                {bankSoalSearch && (
                  <button
                    type="button"
                    onClick={() => setBankSoalSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-gray-50 dark:bg-zinc-900 p-6 max-h-[60vh]">
  
              {isLoadingBankSoal ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-zinc-400">Memuat Bank Soal...</span>
                </div>
              ) : bankSoalError ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-red-500 text-center">
                    <Database className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-medium">Gagal memuat Bank Soal</p>
                    <p className="text-sm mt-1">Silakan coba lagi</p>
                  </div>
                </div>
              ) : bankSoalData.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-zinc-100 mb-2">
                    {bankSoalSearch ? "Tidak Ada Hasil Pencarian" : "Bank Soal Kosong"}
                  </h3>
                  <p className="text-gray-600 dark:text-zinc-400 text-sm max-w-md mx-auto">
                    {bankSoalSearch
                      ? `Tidak ada soal dengan kata kunci "${bankSoalSearch}". Coba kata kunci lain.`
                      : "Belum ada soal di Bank Soal. Tambahkan soal terlebih dahulu."
                    }
                  </p>
                  {bankSoalSearch && (
                    <button
                      onClick={() => setBankSoalSearch("")}
                      className="mt-3 text-sm text-purple-600 hover:text-purple-700"
                    >
                      Hapus pencarian
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {bankSoalData.map((question) => {
                    const getQuestionTypeIcon = (type: string) => {
                      switch (type) {
                        case 'multiple_choice': return CheckSquare;
                        case 'true_false': return AlertCircle;
                        case 'short_answer': return Edit3;
                        default: return FileText;
                      }
                    };

                    const getQuestionTypeColor = (type: string) => {
                      switch (type) {
                        case 'multiple_choice': return 'blue';
                        case 'true_false': return 'green';
                        case 'short_answer': return 'orange';
                        default: return 'gray';
                      }
                    };

                    const Icon = getQuestionTypeIcon(question.questionType);
                    const color = getQuestionTypeColor(question.questionType);

                    return (
                      <Card
                        key={question.id}
                        className="p-4 cursor-pointer hover:shadow-lg hover:border-purple-300 transition-all duration-200"
                        onClick={() => handleBankSoalSelect(question)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
                            <Icon className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-zinc-100 truncate">
                                {question.name}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                {question.maxScore} poin
                              </Badge>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-zinc-400 line-clamp-2 mb-2">
                              {question.questionText.replace(/<[^>]*>/g, '')}
                            </p>

                            {question.optionsText && question.optionsText.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-zinc-500">
                                <span>{question.optionsText.length} opsi</span>
                                <span>•</span>
                                <span>{question.optionsText.filter(opt => opt === question.answer?.answer).length} jawaban benar</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer with Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
              {bankSoalPageMeta && bankSoalPageMeta.totalPageCount > 1 && (
                <div className="flex justify-center mb-4">
                  <Pagination
                    totalPages={bankSoalPageMeta.totalPageCount}
                    currentPage={bankSoalPage}
                    onPageChange={setBankSoalPage}
                    showPrevNext
                  />
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowBankSoalModal(false)}
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Generation Modal */}
      {showAIGenerationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 dark:border-zinc-700 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Brain className="w-6 h-6" />
                  <div>
                    <h3 className="text-xl font-bold">Generate Questions with AI</h3>
                    <p className="text-purple-100 dark:text-purple-200 text-sm mt-1">
                      Generate quiz questions using AI from your materials
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAIGenerationModal(false);
                    setGeneratedQuestions([]);
                  }}
                  className="text-white hover:bg-white/20 dark:hover:bg-zinc-800/20 h-8 w-8 p-0"
                >
                  <X className="size-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-auto max-h-[calc(90vh-160px)] bg-gray-50 dark:bg-zinc-900">
              {generatedQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 mx-auto text-purple-500 dark:text-purple-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-2">Generate Questions with AI</h3>
                  <p className="text-gray-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
                    Click the button below to generate quiz questions from your materials using AI technology.
                  </p>
                  <Button
                    onClick={handleGenerateQuestions}
                    className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600"
                    disabled={false}
                  >
                    <Brain className="size-4 mr-2" />
                    Generate Questions
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
                        Generated Questions ({generatedQuestions.length})
                      </h4>
                      {generatedQuestions.length > 0 && (
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="select-all-ai-questions"
                            checked={selectedAIQuestions.size === generatedQuestions.length}
                            onChange={handleSelectAllAIQuestions}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label htmlFor="select-all-ai-questions" className="text-sm text-gray-700 dark:text-gray-300">
                            Select All ({selectedAIQuestions.size} selected)
                          </label>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={handleGenerateQuestions}
                      variant="outline"
                      size="sm"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-900/20"
                    >
                      <RefreshCw className="size-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {generatedQuestions.map((q, index) => (
                      <Card key={q.question_id} className={`p-4 bg-white dark:bg-zinc-800 border-2 ${
                        selectedAIQuestions.has(index)
                          ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/10'
                          : 'border-gray-200 dark:border-zinc-700'
                      }`}>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selectedAIQuestions.has(index)}
                              onChange={() => handleToggleAIQuestionSelection(index)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                  Q{index + 1}
                                </span>
                                <Badge className={`text-xs ${
                                  q.question_type === 'multiple_choice' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                  q.question_type === 'true_false' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                }`}>
                                  {q.question_type === 'multiple_choice' ? 'Pilihan Ganda' :
                                   q.question_type === 'true_false' ? 'Benar/Salah' : 'Short Answer'}
                                </Badge>
                              </div>
                              <p className="text-gray-900 dark:text-zinc-100 font-medium mb-3">
                                {q.question_text}
                              </p>

                              {q.question_type === 'multiple_choice' && q.options && (
                                <div className="space-y-2 mb-3">
                                  {q.options.map((option: string, optIndex: number) => {
                                    const isCorrect = optIndex.toString() === q.answer_text;
                                    return (
                                      <div key={optIndex} className={`flex items-center gap-2 p-2 rounded-lg ${
                                      isCorrect ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-zinc-900'
                                      }`}>
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                          isCorrect ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'
                                        }`}>
                                          {String.fromCharCode(65 + optIndex)}
                                        </span>
                                        <span className={`text-sm ${isCorrect ? 'text-green-800 dark:text-green-200 font-medium' : 'text-gray-700 dark:text-zinc-300'}`}>
                                          {option}
                                          {isCorrect && <Check className="w-3 h-3 ml-2 inline text-green-600" />}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {q.explanation && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                      Explanation
                                    </span>
                                  </div>
                                  <p className="text-sm text-blue-700 dark:text-blue-300">
                                    {q.explanation}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleEditGeneratedQuestion(q)}
                                variant="outline"
                                size="sm"
                                className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20"
                              >
                                <Edit3 className="size-3 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedAIQuestions.size > 0 && (
                  <span>{selectedAIQuestions.size} question{selectedAIQuestions.size > 1 ? 's' : ''} selected</span>
                )}
              </div>
              <div className="flex gap-3">
                {selectedAIQuestions.size > 0 && (
                  <Button
                    onClick={handleAddSelectedAIQuestions}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="size-4 mr-2" />
                    Add Selected Questions ({selectedAIQuestions.size})
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAIGenerationModal(false);
                    setGeneratedQuestions([]);
                    setSelectedAIQuestions(new Set());
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Generated Question Modal */}
      {editingGeneratedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 dark:border-zinc-700 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Edit3 className="w-5 h-5" />
                  <div>
                    <h3 className="text-xl font-bold">Edit Generated Question</h3>
                    <p className="text-blue-100 dark:text-blue-200 text-sm mt-1">
                      Edit the AI-generated question and save changes to select later
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEditGeneratedQuestion}
                  className="text-white hover:bg-white/20 dark:hover:bg-zinc-800/20 h-8 w-8 p-0"
                >
                  <X className="size-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-auto max-h-[calc(90vh-160px)] bg-gray-50 dark:bg-zinc-900">
              <div className="space-y-5">
                {/* Question Type */}
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-2 block">
                    Question Type
                  </Label>
                  <select
                    value={editingGeneratedQuestion.question_type || 'multiple_choice'}
                    onChange={(e) => setEditingGeneratedQuestion((prev: any) => ({
                      ...prev,
                      question_type: e.target.value,
                      answer_text: e.target.value === 'true_false' ? 'true' : prev.answer_text
                    }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                  >
                    <option value="multiple_choice">Pilihan Ganda</option>
                    <option value="true_false">Benar/Salah</option>
                    <option value="essay">Short Answer</option>
                  </select>
                </div>

                {/* Question Text */}
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
                  <Label htmlFor="ai-question-text" className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-2 block">
                    Question Text *
                  </Label>
                  <textarea
                    id="ai-question-text"
                    value={editingGeneratedQuestion.question_text || ''}
                    onChange={(e) => setEditingGeneratedQuestion((prev: any) => ({
                      ...prev,
                      question_text: e.target.value
                    }))}
                    placeholder="Enter your question here..."
                    className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 min-h-[100px] resize-y"
                  />
                </div>

                {/* Multiple Choice Options */}
                {editingGeneratedQuestion.question_type === 'multiple_choice' && (
                  <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Answer Options</Label>
                    </div>
                    <div className="space-y-2">
                      {editingGeneratedQuestion.options?.map((option: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700">
                          <input
                            type="radio"
                            name={`ai-correct-answer`}
                            checked={index.toString() === editingGeneratedQuestion.answer_text}
                            onChange={() => setEditingGeneratedQuestion((prev: any) => ({
                              ...prev,
                              answer_text: index.toString()
                            }))}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 text-xs font-semibold text-gray-600 dark:text-zinc-400">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(editingGeneratedQuestion.options || [])];
                              newOptions[index] = e.target.value;
                              setEditingGeneratedQuestion((prev: any) => ({
                                ...prev,
                                options: newOptions
                              }));
                            }}
                            placeholder={`Pilihan ${String.fromCharCode(65 + index)}`}
                            className="flex-1 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:border-blue-500 focus:ring-blue-500 text-sm h-9"
                          />
                          {index.toString() === editingGeneratedQuestion.answer_text && (
                            <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 text-xs px-2 py-0.5">
                              <Check className="size-3 mr-1" />
                              Correct
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* True/False Options */}
                {editingGeneratedQuestion.question_type === 'true_false' && (
                  <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
                    <Label className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-3 block">Correct Answer</Label>
                    <div className="space-y-2.5">
                      <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg border-2 border-gray-200 dark:border-zinc-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                        <input
                          type="radio"
                          name="ai-tf-answer"
                          checked={editingGeneratedQuestion.answer_text === 'true'}
                          onChange={() => setEditingGeneratedQuestion((prev: any) => ({
                            ...prev,
                            answer_text: 'true'
                          }))}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                            <Check className="size-4" />
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-zinc-100 text-sm">Benar</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg border-2 border-gray-200 dark:border-zinc-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                        <input
                          type="radio"
                          name="ai-tf-answer"
                          checked={editingGeneratedQuestion.answer_text === 'false'}
                          onChange={() => setEditingGeneratedQuestion((prev: any) => ({
                            ...prev,
                            answer_text: 'false'
                          }))}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                            <X className="size-4" />
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-zinc-100 text-sm">Salah</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Essay Answer */}
                {editingGeneratedQuestion.question_type === 'essay' && (
                  <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
                    <Label htmlFor="ai-essay-answer" className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-2 block flex items-center gap-1.5">
                      <Target className="size-3.5" />
                      Expected Answer (Optional)
                    </Label>
                    <Input
                      id="ai-essay-answer"
                      type="text"
                      value={editingGeneratedQuestion.answer_text || ''}
                      onChange={(e) => setEditingGeneratedQuestion((prev: any) => ({
                        ...prev,
                        answer_text: e.target.value
                      }))}
                      placeholder="Enter expected answer for grading reference..."
                      className="border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Explanation */}
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
                  <Label htmlFor="ai-explanation" className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-2 block flex items-center gap-1.5">
                    <AlertCircle className="size-3.5" />
                    Explanation (Optional)
                  </Label>
                  <textarea
                    id="ai-explanation"
                    value={editingGeneratedQuestion.explanation || ''}
                    onChange={(e) => setEditingGeneratedQuestion((prev: any) => ({
                      ...prev,
                      explanation: e.target.value
                    }))}
                    placeholder="Add explanation to help students understand..."
                    className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 min-h-[80px] resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCancelEditGeneratedQuestion}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEditedGeneratedQuestion}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                <Save className="size-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Question Form Component
interface QuestionFormProps {
  question: QuizQuestion;
  onSave: (question: QuizQuestion) => void;
  onCancel: () => void;
  onBack?: () => void;
  isCreating: boolean;
}

function QuestionForm({ question, onSave, onCancel, onBack, isCreating }: QuestionFormProps) {
  const [formData, setFormData] = useState<QuizQuestion>(question);
  const { validate, errors, clearErrors } = useQuizQuestionValidation();

  // Update form data when question prop changes (for Bank Soal selection)
  useEffect(() => {
    console.log("🔧 QuestionForm: question prop changed", question);
    console.log("🔧 QuestionForm: question.questionType:", question.questionType);
    console.log("🔧 QuestionForm: question.correctAnswer:", question.correctAnswer);

    // Set appropriate defaults based on question type
    const updatedFormData = {
      ...question,
      // Ensure defaults for missing fields
      points: question.points || 1,
      explanation: question.explanation || ''
    };

    // Handle options based on question type
    if (question.questionType === 'multiple_choice') {
      updatedFormData.options = question.options || [
        { id: '1', text: '', isCorrect: false, order: 0 },
        { id: '2', text: '', isCorrect: false, order: 1 }
      ];
    } else {
      // For true_false and essay, ensure no options
      updatedFormData.options = undefined;
    }

    // Handle correctAnswer based on question type
    if (question.questionType === 'true_false') {
      updatedFormData.correctAnswer = question.correctAnswer || 'true';
    } else if (question.questionType === 'essay') {
      updatedFormData.correctAnswer = question.correctAnswer || '';
    } else {
      updatedFormData.correctAnswer = question.correctAnswer || '';
    }

    setFormData(updatedFormData);
  }, [question]);

  const handleSave = () => {
    // Clear previous errors
    clearErrors();

    // Validate the form data
    const validation = validate(formData);

    if (!validation.success) {
      console.log('❌ Form validation failed:', validation.errors);
      console.log('❌ Form data being validated:', formData);
      console.log('❌ Current errors state after validation:', errors);
      // Errors will be displayed inline in the form fields
      return;
    }

    console.log('✅ Form validation passed, saving question...');
    onSave(formData);
  };

  const addOption = () => {
    const newOption: QuizOption = {
      id: `${Date.now()}`,
      text: '',
      isCorrect: false,
      order: formData.options?.length || 0
    };
    setFormData(prev => ({
      ...prev,
      options: [...(prev.options || []), newOption]
    }));
  };

  const removeOption = (optionId: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.filter(opt => opt.id !== optionId)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-zinc-700 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="text-white hover:bg-white/20 dark:hover:bg-zinc-800/20 h-8 w-8 p-0"
                >
                  <ArrowLeft className="size-5" />
                </Button>
              )}
              <div>
                <h3 className="text-xl font-bold">
                  {isCreating ? 'Tambah Soal Baru' : 'Edit Soal'}
                </h3>
                <p className="text-blue-100 dark:text-blue-200 text-sm mt-1">
                  {isCreating ? 'Buat soal baru untuk kuis Anda' : 'Perbarui informasi soal'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-white hover:bg-white/20 dark:hover:bg-zinc-800/20 h-8 w-8 p-0"
            >
              <X className="size-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-160px)] bg-gray-50 dark:bg-zinc-900">
          <div className="space-y-5">
            {/* Question Type & Points */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
                <Label htmlFor="question-type" className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-2 block">
                  Tipe Soal
                </Label>
                <select
                  id="question-type"
                  value={formData.questionType || 'multiple_choice'}
                  onChange={(e) => {
                    const newQuestionType = e.target.value as QuizQuestion['questionType'];

                    setFormData(prev => {
                      const updated = { ...prev, questionType: newQuestionType };

                      // Reset form based on question type
                      if (newQuestionType === 'multiple_choice') {
                        // For multiple choice, add default options
                        updated.options = [
                          { id: '1', text: '', isCorrect: false, order: 0 },
                          { id: '2', text: '', isCorrect: false, order: 1 }
                        ];
                      } else {
                        // For true_false and essay, remove options
                        updated.options = undefined;
                      }

                      // Reset correctAnswer based on type
                      if (newQuestionType === 'true_false') {
                        updated.correctAnswer = 'true';
                      } else {
                        updated.correctAnswer = '';
                      }

                      return updated;
                    });
                  }}
                  className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                >
                  <option value="multiple_choice">Pilihan Ganda</option>
                  <option value="essay">Short Answer</option>
                  <option value="true_false">Benar/Salah</option>
                </select>
              </div>

              {/* Debug - Remove this later */}
              {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
                  <p className="text-sm font-semibold text-red-800 mb-2">Validation Errors:</p>
                  <pre className="text-xs text-red-600 overflow-auto max-h-32">
                    {JSON.stringify(errors, null, 2)}
                  </pre>
                </div>
              )}

              <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
                <Label htmlFor="question-points" className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-2 block flex items-center gap-1.5">
                  <Target className="size-3.5" />
                  Poin
                </Label>
                <Input
                  id="question-points"
                  type="number"
                  min="1"
                  value={formData.points || 1}
                  onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                  className={`border ${errors.points ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-zinc-600 focus:border-blue-500 focus:ring-blue-500'} bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100`}
                />
                {errors.points && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.points}</p>
                )}
              </div>
            </div>

            {/* Question Text */}
            <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
              <Label htmlFor="question-text" className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-2 block">
                Pertanyaan *
              </Label>
              <div className={`border rounded-lg overflow-hidden focus-within:ring-2 ${
                errors.questionText ? 'border-red-500 focus-within:ring-red-500' : 'border-gray-300 dark:border-zinc-600 focus-within:border-blue-500 focus-within:ring-blue-500'
              }`}>
                <BlockNoteEditor
                  content={formData.questionText || ''}
                  onChange={(content) => setFormData(prev => ({ ...prev, questionText: content || '' }))}
                  placeholder="Tulis pertanyaan di sini..."
                />
              </div>
              {errors.questionText && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.questionText}</p>
              )}
            </div>

            {/* Multiple Choice Options */}
            {formData.questionType === 'multiple_choice' && (
              <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Pilihan Jawaban</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-8 text-xs"
                  >
                    <Plus className="size-3.5 mr-1" />
                    Tambah Opsi
                  </Button>
                </div>
                {errors.options && (
                  <p className="text-sm text-red-600 dark:text-red-400 mb-3">{errors.options}</p>
                )}
                <div className="space-y-2.5">
                  {formData.options?.map((option, index) => (
                    <div key={option.id} className="flex items-center gap-2.5 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700">
                      <input
                        type="radio"
                        name="correct-answer"
                        checked={option.isCorrect}
                        onChange={() => {
                          const newOptions = formData.options?.map(opt => ({
                            ...opt,
                            isCorrect: opt.id === option.id
                          }));
                          setFormData(prev => ({ ...prev, options: newOptions }));
                        }}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 text-xs font-semibold text-gray-600 dark:text-zinc-400">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <Input
                        value={option.text}
                        onChange={(e) => {
                          const newOptions = formData.options?.map(opt =>
                            opt.id === option.id ? { ...opt, text: e.target.value } : opt
                          );
                          setFormData(prev => ({ ...prev, options: newOptions }));
                        }}
                        placeholder={`Pilihan ${String.fromCharCode(65 + index)}`}
                        className="flex-1 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:border-blue-500 focus:ring-blue-500 text-sm h-9"
                      />
                      {option.isCorrect && (
                        <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 text-xs px-2 py-0.5">
                          <Check className="size-3 mr-1" />
                          Benar
                        </Badge>
                      )}
                      {formData.options && formData.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(option.id)}
                          className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* True/False Options */}
            {formData.questionType === 'true_false' && (
              <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
                <Label className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-3 block">Jawaban Benar/Salah</Label>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg border-2 border-gray-200 dark:border-zinc-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                    <input
                      type="radio"
                      name="tf-answer"
                      checked={formData.correctAnswer === 'true'}
                      onChange={() => setFormData(prev => ({ ...prev, correctAnswer: 'true' }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        <Check className="size-4" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-zinc-100 text-sm">Benar</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg border-2 border-gray-200 dark:border-zinc-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                    <input
                      type="radio"
                      name="tf-answer"
                      checked={formData.correctAnswer === 'false'}
                      onChange={() => setFormData(prev => ({ ...prev, correctAnswer: 'false' }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                        <X className="size-4" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-zinc-100 text-sm">Salah</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Essay Answer */}
            {formData.questionType === 'essay' && (
              <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
                <Label htmlFor="essay-answer" className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-2 block flex items-center gap-1.5">
                  <Target className="size-3.5" />
                  Jawaban yang Diharapkan (Opsional)
                </Label>
                <Input
                  id="essay-answer"
                  type="text"
                  value={formData.correctAnswer || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, correctAnswer: e.target.value }))}
                  placeholder="Masukkan jawaban yang diharapkan untuk referensi penilaian..."
                  className="border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2">
                  Jawaban ini akan digunakan sebagai referensi saat menilai jawaban essay
                </p>
              </div>
            )}

            {/* Explanation */}
            <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
              <Label htmlFor="question-explanation" className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-2 block flex items-center gap-1.5">
                <AlertCircle className="size-3.5" />
                Penjelasan Jawaban (Opsional)
              </Label>
              <div className="border border-gray-300 dark:border-zinc-600 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500">
                <BlockNoteEditor
                  content={formData.explanation || ''}
                  onChange={(content) => setFormData(prev => ({ ...prev, explanation: content }))}
                  placeholder="Tambahkan penjelasan untuk membantu siswa memahami..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="px-5 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            Batal
          </Button>
          <Button 
            onClick={handleSave}
            className="px-5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            <Save className="size-4 mr-2" />
            {isCreating ? 'Simpan Soal' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>
    </div>
  );
}