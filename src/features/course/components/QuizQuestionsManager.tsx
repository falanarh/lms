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
  AlertCircle,
  Clock,
  Target,
  FileText,
  Layers,
  RefreshCw,
  Sparkles,
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

  const showToastMessage = (message: string, variant: 'info' | 'warning' | 'success' = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const handleCreateQuestion = () => {
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
  };

  const [showImportModal, setShowImportModal] = useState(false);

  const handleImportQuestions = async (importedQuestions: QuizQuestion[]) => {
    try {
      const createdQuestions: QuizQuestion[] = [];
        
      for (const question of importedQuestions) {
        const questionName = question.questionText
          .replace(/<[^>]*>/g, '')
          .substring(0, 100)
          .trim() || "Question";
    
        const createRequest: QuestionRequest = {
          idContent: quizId,
          name: questionName,
          questionType: question.questionType.toUpperCase() as "MULTIPLE_CHOICE" | "ESSAY" | "TRUE_FALSE" | "SHORT_ANSWER",
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
            : { answer: (question.correctAnswer || "1") } // For essay questions, use correctAnswer or default to "1"
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
        `Berhasil mengimport ${createdQuestions.length} dari ${importedQuestions.length} soal!`, 
        'success'
      );
      
      setShowImportModal(false);
    } catch (error) {
      console.error("Error importing questions:", error);
      showToastMessage('Gagal mengimport soal. Silakan coba lagi.', 'warning');
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
        const createRequest: QuestionRequest = {
          idContent: quizId,
          name: questionName,
          questionType: questionData.questionType.toUpperCase() as "MULTIPLE_CHOICE" | "ESSAY" | "TRUE_FALSE" | "SHORT_ANSWER",
          questionText: questionData.questionText,
          maxScore: questionData.points,
          optionsText: questionData.questionType === "multiple_choice" && questionData.options
            ? questionData.options.map(opt => opt.text).filter(text => text.trim())
            : questionData.questionType === "true_false"
            ? ["True", "False"]
            : undefined,
          answer: {
            answer: questionData.questionType === "multiple_choice" && questionData.options
              ? questionData.options.find(opt => opt.isCorrect)?.text || ""
              : questionData.questionType === "true_false"
              ? (questionData.correctAnswer || "true")
              : "",
          }
        };

        const createdQuestion = await createQuestionMutation.mutateAsync(createRequest);
        const newQuestion = {
          ...questionData,
          id: createdQuestion.id
        };
        setQuestions([...questions, newQuestion]);
        showToastMessage('Soal berhasil ditambahkan!', 'success');
      } else {
        const updateRequest: Partial<QuestionRequest> = {
          name: questionName,
          questionType: questionData.questionType.toUpperCase() as "MULTIPLE_CHOICE" | "ESSAY" | "TRUE_FALSE" | "SHORT_ANSWER",
          questionText: questionData.questionText,
          maxScore: questionData.points,
          optionsText: questionData.questionType === "multiple_choice" && questionData.options
            ? questionData.options.map(opt => opt.text).filter(text => text.trim())
            : questionData.questionType === "true_false"
            ? ["True", "False"]
            : undefined,
          answer: {
            answer: questionData.questionType === "multiple_choice" && questionData.options
              ? questionData.options.find(opt => opt.isCorrect)?.text || ""
              : questionData.questionType === "true_false"
              ? (questionData.correctAnswer || "true")
              : "",
          }
        };

        await updateQuestionMutation.mutateAsync({
          id: questionData.id,
          data: updateRequest,
        });
        setQuestions(questions.map(q => q.id === questionData.id ? questionData : q));
        showToastMessage('Soal berhasil diperbarui!', 'success');
      }

      setEditingQuestion(null);
      setIsCreatingQuestion(false);
    } catch (error) {
      console.error("Error saving question:", error);
      showToastMessage('Gagal menyimpan soal. Silakan coba lagi.', 'warning');
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
      showToastMessage('Soal berhasil dihapus!', 'success');

      setDeleteConfirm({
        isOpen: false,
        questionId: null,
        questionText: "",
      });
    } catch (error) {
      console.error("Error deleting question:", error);
      showToastMessage('Gagal menghapus soal. Silakan coba lagi.', 'warning');
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
        return 'Essay';
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
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
                >
                  <Sparkles className="size-4 mr-2" />
                  Generate Soal
                </Button>
                <Button 
                  onClick={() => setShowImportModal(true)}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                >
                  <FileSpreadsheet className="size-4 mr-2" />
                  Import Excel
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
    </div>
  );
}

// Question Form Component
interface QuestionFormProps {
  question: QuizQuestion;
  onSave: (question: QuizQuestion) => void;
  onCancel: () => void;
  isCreating: boolean;
}

function QuestionForm({ question, onSave, onCancel, isCreating }: QuestionFormProps) {
  const [formData, setFormData] = useState<QuizQuestion>(question);

  const handleSave = () => {
    if (!formData.questionText.trim()) {
      alert('Pertanyaan tidak boleh kosong');
      return;
    }

    if (formData.questionType === 'multiple_choice') {
      const hasValidOptions = formData.options?.some(opt => opt.text.trim()) &&
                             formData.options?.some(opt => opt.isCorrect);
      if (!hasValidOptions) {
        alert('Pilihan ganda harus memiliki minimal 1 opsi dan 1 jawaban benar');
        return;
      }
    }

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
            <div>
              <h3 className="text-xl font-bold">
                {isCreating ? 'Tambah Soal Baru' : 'Edit Soal'}
              </h3>
              <p className="text-blue-100 dark:text-blue-200 text-sm mt-1">
                {isCreating ? 'Buat soal baru untuk kuis Anda' : 'Perbarui informasi soal'}
              </p>
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
                  value={formData.questionType}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    questionType: e.target.value as QuizQuestion['questionType']
                  }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                >
                  <option value="multiple_choice">Pilihan Ganda</option>
                  <option value="essay">Essay</option>
                  <option value="true_false">Benar/Salah</option>
                </select>
              </div>

              <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
                <Label htmlFor="question-points" className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-2 block flex items-center gap-1.5">
                  <Target className="size-3.5" />
                  Poin
                </Label>
                <Input
                  id="question-points"
                  type="number"
                  min="1"
                  value={formData.points}
                  onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                  className="border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
              <Label htmlFor="question-text" className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-2 block">
                Pertanyaan *
              </Label>
              <div className="border border-gray-300 dark:border-zinc-600 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500">
                <BlockNoteEditor
                  content={formData.questionText}
                  onChange={(content) => setFormData(prev => ({ ...prev, questionText: content }))}
                  placeholder="Tulis pertanyaan di sini..."
                />
              </div>
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