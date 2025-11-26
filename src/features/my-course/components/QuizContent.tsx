"use client";

import { Toast } from "@/components/ui/Toast/Toast";

import { Content } from "@/api/contents";
import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  Flag,
  HelpCircle,
  RotateCw,
  Target,
} from "lucide-react";
import { DUMMY_USER_ID } from "@/config/api";
import {
  useQuizDetail,
  useQuizAttemptHistory,
  useQuestionDetail,
  useStartQuizAttempt,
  useHandleQuizAnswer,
  useSubmitQuizAttempt,
  useQuizAttemptById,
  useQuizAttemptForReview,
} from "@/hooks/useQuizAttempts";
import type {
  QuizDetailResponse,
  QuizAttemptHistoryResponse,
  QuestionDetail,
  QuizAttemptDetail,
} from "@/api/quiz-attempts";

type QuizQuestionType = "multiple_choice" | "true_false" | "short_answer";

interface QuizQuestion {
  id: number;
  type: QuizQuestionType;
  question: string;
  options?: string[];
}

interface QuizSession {
  attemptId: string;
  contentId: string;
  questionIds: string[];
  currentQuestionIndex: number;
  answerCodeMap: Record<string, string>;
  answeredQuestions: Record<string, boolean>;
  quizStartTime: string;
  durationLimit: number | null;
  timestamp: number;
}

interface QuizContentProps {
  content: Content;
  isSidebarOpen: boolean;
  onStartContent?: (contentId: string) => void;
  onFinishContent?: (contentId: string) => void;
}

// Session storage helpers
const getSessionKey = (contentId: string) => `quiz_session_${contentId}`;

const saveQuizSession = (session: QuizSession) => {
  try {
    sessionStorage.setItem(
      getSessionKey(session.contentId),
      JSON.stringify(session)
    );
  } catch (e) {
    console.error("Failed to save quiz session:", e);
  }
};

const loadQuizSession = (contentId: string): QuizSession | null => {
  try {
    const saved = sessionStorage.getItem(getSessionKey(contentId));
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error("Failed to load quiz session:", e);
    return null;
  }
};

const clearQuizSession = (contentId: string) => {
  try {
    sessionStorage.removeItem(getSessionKey(contentId));
  } catch (e) {
    console.error("Failed to clear quiz session:", e);
  }
};

export const QuizContent = ({
  content,
  isSidebarOpen,
  onStartContent,
  onFinishContent,
}: QuizContentProps) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<
    "info" | "warning" | "success"
  >("success");
  const [toastKey, setToastKey] = useState(0);
  const toastTimeoutRef = useRef<number | null>(null);
  const TOAST_HIDE_MS = 2000;
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [inProgressAttempt, setInProgressAttempt] =
    useState<QuizAttemptDetail | null>(null);
  const quizStartTimeRef = useRef<string | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<
    Record<string, boolean>
  >({});
  const [answerCodeMap, setAnswerCodeMap] = useState<Record<string, string>>(
    {}
  );
  const [quizTimeLeft, setQuizTimeLeft] = useState<number | null>(null);
  const [showQuizSubmitConfirm, setShowQuizSubmitConfirm] = useState(false);
  const [reviewAttemptId, setReviewAttemptId] = useState<string | null>(null);
  const hasAutoSubmittedRef = useRef(false);

  // Fetch quiz detail from API (info kuis statis)
  const { data: quizDetail, isLoading: isQuizDetailLoading } = useQuizDetail(
    content.id,
    { retry: false }
  );

  // Fetch attempt history from API (data dinamis)
  const { data: attemptHistory, isLoading: isHistoryLoading } =
    useQuizAttemptHistory(DUMMY_USER_ID, content.id, {
      retry: false,
    });

  // Fetch current attempt detail (if exists)
  const { data: currentAttempt, refetch: refetchCurrentAttempt } =
    useQuizAttemptById(currentAttemptId || "", {
      enabled: !!currentAttemptId,
    });

  const { data: reviewAttempt } = useQuizAttemptForReview(
    DUMMY_USER_ID,
    content.id,
    reviewAttemptId || "",
    {
      enabled: !!reviewAttemptId && isReviewMode,
      retry: false,
    }
  );

  const typedQuizDetail = quizDetail as QuizDetailResponse | undefined;
  const typedCurrentAttempt = currentAttempt as QuizAttemptDetail | undefined;
  const typedReviewAttempt = reviewAttempt as QuizAttemptDetail | undefined;
  const typedAttemptHistory = attemptHistory as
    | QuizAttemptHistoryResponse
    | undefined;

  const router = useRouter();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Treat tablets and smaller (width < 1024) as "mobile" for back behaviour
    const check = () =>
      setIsMobile(typeof window !== "undefined" && window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Detect IN_PROGRESS attempt on mount
  useEffect(() => {
    if (isQuizStarted) return; // Already started, skip
    if (!typedAttemptHistory) return;

    // Check sessionStorage first (for instant restore after refresh)
    const savedSession = loadQuizSession(content.id);
    if (savedSession) {
      // INSTANT RESTORE - No delay, no API call
      setCurrentAttemptId(savedSession.attemptId);
      setQuestionIds(savedSession.questionIds);
      setAnswerCodeMap(savedSession.answerCodeMap);
      setAnsweredQuestions(savedSession.answeredQuestions);
      setCurrentQuestionIndex(savedSession.currentQuestionIndex);
      quizStartTimeRef.current = savedSession.quizStartTime;

      // Calculate remaining time
      if (savedSession.durationLimit) {
        const elapsed =
          (Date.now() - new Date(savedSession.quizStartTime).getTime()) / 1000;
        const remaining = savedSession.durationLimit * 60 - elapsed;
        setQuizTimeLeft(remaining > 0 ? Math.floor(remaining) : 0);
      } else {
        setQuizTimeLeft(null);
      }

      setIsQuizStarted(true); // Show quiz immediately
      setIsReviewMode(false);
      return; // Done, skip pending detection
    }

    // No session (close tab case), check backend for pending attempt
    // Workaround: attempt is PENDING if quizEnd is empty/null or totalScore is null
    const pendingAttempt = typedAttemptHistory.attempts?.find(
      (attempt) => !attempt.quizEnd || attempt.totalScore === null
    );

    if (pendingAttempt) {
      setInProgressAttempt(pendingAttempt as any);
    }
  }, [typedAttemptHistory, content.id, isQuizStarted]);

  const handleResumeQuiz = async () => {
    if (!inProgressAttempt) return;

    try {
      // Fetch full attempt detail dari backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/quiz-attempts/${inProgressAttempt.id}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attempt detail");
      }

      const attemptDetail = (await response.json()) as QuizAttemptDetail;

      // Check if still pending
      if (
        attemptDetail.status === "SUBMITTED" ||
        attemptDetail.status === "GRADED"
      ) {
        clearQuizSession(content.id);
        setInProgressAttempt(null);
        alert("Kuis ini sudah dikumpulkan.");
        return;
      }

      // Restore state dari backend
      setCurrentAttemptId(attemptDetail.id);
      setQuestionIds(attemptDetail.questionOrder);

      // Populate answers dari backend
      const newCodeMap: Record<string, string> = {};
      const newAnsweredMap: Record<string, boolean> = {};
      attemptDetail.questionOrder.forEach((qId, index) => {
        const answerCode = attemptDetail.answer?.[index];
        if (answerCode) {
          newCodeMap[qId] = answerCode;
          newAnsweredMap[qId] = true;
        }
      });
      setAnswerCodeMap(newCodeMap);
      setAnsweredQuestions(newAnsweredMap);

      // Find first unanswered question
      const firstUnanswered = attemptDetail.answer.findIndex((a) => !a);
      setCurrentQuestionIndex(firstUnanswered >= 0 ? firstUnanswered : 0);

      // Calculate remaining time dari quizStart backend (timer tetap jalan)
      quizStartTimeRef.current = attemptDetail.quizStart;
      if (typedQuizDetail?.durationLimit) {
        const startTime = new Date(attemptDetail.quizStart).getTime();
        const elapsed = (Date.now() - startTime) / 1000;
        const totalTime = typedQuizDetail.durationLimit * 60;
        const remaining = totalTime - elapsed;
        setQuizTimeLeft(remaining > 0 ? Math.floor(remaining) : 0);
      } else {
        setQuizTimeLeft(null);
      }

      setIsQuizStarted(true);
      setIsReviewMode(false);
      setInProgressAttempt(null);

      // Save to sessionStorage untuk next refresh
      saveQuizSession({
        attemptId: attemptDetail.id,
        contentId: content.id,
        questionIds: attemptDetail.questionOrder,
        currentQuestionIndex: firstUnanswered >= 0 ? firstUnanswered : 0,
        answerCodeMap: newCodeMap,
        answeredQuestions: newAnsweredMap,
        quizStartTime: attemptDetail.quizStart,
        durationLimit: typedQuizDetail?.durationLimit || null,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Failed to resume quiz:", error);
      alert("Gagal melanjutkan kuis. Silakan coba lagi.");
    }
  };

  const handleBackToInfo = () => {
    // Di tablet/iPad dan desktop, kembali ke info kuis (reset state)
    clearQuizSession(content.id);
    setIsQuizStarted(false);
    setIsReviewMode(false);
    setReviewAttemptId(null);
    setCurrentQuestionIndex(0);
    setQuizTimeLeft(null);
  };

  const currentQuestionId =
    isReviewMode && typedReviewAttempt
      ? typedReviewAttempt.questionOrder?.[currentQuestionIndex] || ""
      : questionIds[currentQuestionIndex];

  const { data: currentQuestion } = useQuestionDetail(currentQuestionId || "", {
    enabled: !!currentQuestionId && isQuizStarted && !isReviewMode,
    retry: false,
  });

  const startQuizMutation = useStartQuizAttempt();
  const { saveOrUpdate: handleAnswer, isLoading: isSavingAnswer } =
    useHandleQuizAnswer();
  const submitQuizMutation = useSubmitQuizAttempt();

  const typedCurrentQuestion = currentQuestion as QuestionDetail | undefined;

  // Computed values from API data - attempts dari API terpisah
  const attempts = typedAttemptHistory?.attempts || [];
  const hasAttempts = attempts.length > 0;
  const attemptsUsed = attempts.length;
  const attemptsRemaining = (typedQuizDetail?.attemptLimit || 0) - attemptsUsed;
  const latestAttempt = hasAttempts ? attempts[0] : null;
  const totalQuestions =
    questionIds.length || typedQuizDetail?.totalQuestions || 0;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Not specified";
    }
  };

  const handleStartQuiz = async () => {
    try {
      if (onStartContent) {
        onStartContent(content.id);
      }

      const response = (await startQuizMutation.mutateAsync({
        idUser: DUMMY_USER_ID,
        idContent: content.id,
      })) as any;

      const newQuestionIds = response.questions.map((q: any) => q.question_id);
      const startTime = new Date().toISOString();

      setCurrentAttemptId(response.attemptId);
      setQuestionIds(newQuestionIds);
      setAnsweredQuestions({});
      setAnswerCodeMap({});
      quizStartTimeRef.current = startTime;

      if (typedQuizDetail?.durationLimit) {
        setQuizTimeLeft(typedQuizDetail.durationLimit * 60);
      } else {
        setQuizTimeLeft(null);
      }

      setIsQuizStarted(true);
      setIsReviewMode(false);
      setCurrentQuestionIndex(0);

      // Save to sessionStorage
      saveQuizSession({
        attemptId: response.attemptId,
        contentId: content.id,
        questionIds: newQuestionIds,
        currentQuestionIndex: 0,
        answerCodeMap: {},
        answeredQuestions: {},
        quizStartTime: startTime,
        durationLimit: typedQuizDetail?.durationLimit || null,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Failed to start quiz:", error);
      alert("Gagal memulai kuis. Silakan coba lagi.");
    }
  };

  const handleAnswerChange = async (
    questionId: string,
    value: string,
    codeAnswer?: string
  ) => {
    if (!currentAttemptId) return;

    try {
      const isUpdate = answeredQuestions[questionId];
      const currentFlag =
        typedCurrentAttempt?.flag?.[currentQuestionIndex] || false;

      // For multiple choice/true-false, use codeAnswer from mapping
      // For short answer/essay, use the value directly as code
      let codeToSend = codeAnswer || value;

      // Save the mapping for display purposes
      setAnswerCodeMap((prev) => ({ ...prev, [questionId]: codeToSend }));

      await handleAnswer(
        {
          idAttempt: currentAttemptId,
          idQuestion: questionId,
          answer: codeToSend,
          flag: currentFlag,
        },
        isUpdate
      );

      // Mark question as answered
      setAnsweredQuestions((prev) => ({ ...prev, [questionId]: true }));

      // Show toast on success with new key to force re-render
      // Show toast on success and auto-hide after TOAST_HIDE_MS
      setToastMessage("Jawaban tersimpan");
      setToastVariant("success");
      setToastKey((prev) => prev + 1);
      setShowToast(true);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = window.setTimeout(() => {
        setShowToast(false);
        toastTimeoutRef.current = null;
      }, TOAST_HIDE_MS);
    } catch (error) {
      console.error("Failed to save answer:", error);
    }
  };

  const toggleUnsure = async (questionId: string) => {
    if (!currentAttemptId) return;

    try {
      const currentFlag =
        typedCurrentAttempt?.flag?.[currentQuestionIndex] || false;
      const currentAnswerCode = answerCodeMap[questionId] || "";
      const isUpdate = answeredQuestions[questionId];

      await handleAnswer(
        {
          idAttempt: currentAttemptId,
          idQuestion: questionId,
          answer: currentAnswerCode,
          flag: !currentFlag,
        },
        isUpdate || !!currentAnswerCode
      );

      if (!answeredQuestions[questionId] && currentAnswerCode) {
        setAnsweredQuestions((prev) => ({ ...prev, [questionId]: true }));
      }

      // Show toast on success with new key to force re-render
      // Show toast on success and auto-hide after TOAST_HIDE_MS
      setToastMessage("Jawaban tersimpan");
      setToastVariant("success");
      setToastKey((prev) => prev + 1);
      setShowToast(true);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = window.setTimeout(() => {
        setShowToast(false);
        toastTimeoutRef.current = null;
      }, TOAST_HIDE_MS);
    } catch (error) {
      console.error("Failed to toggle flag:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const mm = m.toString().padStart(2, "0");
    const ss = s.toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // Effect to set question IDs when entering review mode
  useEffect(() => {
    if (isReviewMode && typedReviewAttempt?.questionOrder) {
      setQuestionIds(typedReviewAttempt.questionOrder);
    }
  }, [isReviewMode, typedReviewAttempt]);

  // Sync sessionStorage when quiz state changes
  useEffect(() => {
    if (
      !isQuizStarted ||
      isReviewMode ||
      !currentAttemptId ||
      !quizStartTimeRef.current
    )
      return;

    saveQuizSession({
      attemptId: currentAttemptId,
      contentId: content.id,
      questionIds,
      currentQuestionIndex,
      answerCodeMap,
      answeredQuestions,
      quizStartTime: quizStartTimeRef.current,
      durationLimit: typedQuizDetail?.durationLimit || null,
      timestamp: Date.now(),
    });
  }, [
    currentQuestionIndex,
    answerCodeMap,
    answeredQuestions,
    isQuizStarted,
    isReviewMode,
    currentAttemptId,
    questionIds,
    content.id,
    typedQuizDetail?.durationLimit,
  ]);

  // Beforeunload warning
  useEffect(() => {
    if (!isQuizStarted || isReviewMode) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue =
        "Jawaban Anda sudah tersimpan, tapi kuis belum selesai. Yakin keluar?";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isQuizStarted, isReviewMode]);

  // Effect to populate answerCodeMap from current attempt when it changes
  useEffect(() => {
    if (
      !isQuizStarted ||
      isReviewMode ||
      !typedCurrentAttempt ||
      !questionIds.length
    )
      return;

    const newCodeMap: Record<string, string> = {};
    const newAnsweredMap: Record<string, boolean> = {};

    questionIds.forEach((qId, index) => {
      const answerCode = typedCurrentAttempt.answer?.[index];
      if (answerCode) {
        newCodeMap[qId] = answerCode;
        newAnsweredMap[qId] = true;
      }
    });

    setAnswerCodeMap(newCodeMap);
    setAnsweredQuestions(newAnsweredMap);
  }, [typedCurrentAttempt, questionIds, isQuizStarted, isReviewMode]);

  useEffect(() => {
    if (
      !isQuizStarted ||
      isReviewMode ||
      quizTimeLeft === null ||
      quizTimeLeft <= 0
    )
      return;

    const interval = window.setInterval(() => {
      setQuizTimeLeft((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isQuizStarted, isReviewMode, quizTimeLeft]);

  useEffect(() => {
    if (!isQuizStarted) return;
    if (isReviewMode) return;
    if (quizTimeLeft !== 0) return;
    if (hasAutoSubmittedRef.current) return;
    hasAutoSubmittedRef.current = true;
    setShowQuizSubmitConfirm(false);
    handleSubmitQuiz();
  }, [isQuizStarted, isReviewMode, quizTimeLeft]);

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
    };
  }, []);

  const handleGoToQuestion = (index: number) => {
    if (index < 0 || index >= totalQuestions) return;
    setCurrentQuestionIndex(index);
  };

  const handleNext = () => {
    if (isLastQuestion) return;
    setCurrentQuestionIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
  };

  const handlePrevious = () => {
    if (isFirstQuestion) return;
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmitQuiz = async () => {
    if (!currentAttemptId) return;

    try {
      const result = await submitQuizMutation.mutateAsync(currentAttemptId);

      if (result.isPassed && onFinishContent) {
        onFinishContent(content.id);
      }

      // Clear sessionStorage
      clearQuizSession(content.id);

      setIsQuizStarted(false);
      setIsReviewMode(false);
      setCurrentAttemptId(null);
      setQuestionIds([]);
      setAnsweredQuestions({});
      setAnswerCodeMap({});
      setQuizTimeLeft(null);
      setCurrentQuestionIndex(0);
      quizStartTimeRef.current = null;

      // Show success toast
      setToastMessage("Kuis berhasil dikumpulkan!");
      setToastVariant("success");
      setToastKey((prev) => prev + 1);
      setShowToast(true);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = window.setTimeout(() => {
        setShowToast(false);
        toastTimeoutRef.current = null;
      }, TOAST_HIDE_MS);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      alert("Gagal mengumpulkan kuis. Silakan coba lagi.");
    }
  };

  const renderQuestionInput = () => {
    if (isReviewMode && typedReviewAttempt) {
      const currentAnswer =
        typedReviewAttempt.answer?.[currentQuestionIndex] || "";
      const correctAnswer =
        typedReviewAttempt.keyAnswer?.[currentQuestionIndex] || "";
      const questionType =
        typedReviewAttempt.questionType?.[currentQuestionIndex];
      const hasUserAnswer = !!currentAnswer;

      let statusLabel = "Belum dijawab";
      let statusClass = "text-gray-600";

      if (hasUserAnswer && correctAnswer) {
        const isCorrect =
          questionType === "SHORT_ANSWER" || questionType === "ESSAY"
            ? currentAnswer.trim().toLowerCase() ===
              correctAnswer.trim().toLowerCase()
            : currentAnswer === correctAnswer;

        if (isCorrect) {
          statusLabel = "Jawaban Anda benar";
          statusClass = "text-emerald-700";
        } else {
          statusLabel = "Jawaban Anda salah";
          statusClass = "text-rose-700";
        }
      }

      if (questionType === "SHORT_ANSWER" || questionType === "ESSAY") {
        return (
          <div className="mt-3 space-y-2 text-sm">
            <p className={`font-semibold ${statusClass}`}>{statusLabel}</p>
            <div className="rounded-md border border-gray-200 bg-white px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
                Jawaban Anda
              </p>
              <p className="text-sm text-gray-900 break-words">
                {hasUserAnswer
                  ? currentAnswer
                  : "Anda tidak menjawab soal ini."}
              </p>
            </div>
            {correctAnswer && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-emerald-700 mb-1">
                  Jawaban benar
                </p>
                <p className="text-sm font-semibold text-emerald-800 break-words">
                  {correctAnswer}
                </p>
              </div>
            )}
          </div>
        );
      }

      if (questionType === "TRUE_FALSE") {
        const options = ["true", "false"];
        const optionCodes =
          typedReviewAttempt.optionsCode?.[currentQuestionIndex] || options;

        return (
          <div className="mt-3 space-y-3 text-sm">
            <p className={`font-semibold ${statusClass}`}>{statusLabel}</p>

            <div className="space-y-2 rounded-md bg-blue-50/40 px-3 py-3 border border-blue-100">
              {options.map((option, index) => {
                const optionCode = optionCodes[index] || option;
                const isSelected =
                  currentAnswer.toLowerCase() === optionCode.toLowerCase();
                const isCorrect =
                  correctAnswer.toLowerCase() === optionCode.toLowerCase();
                let borderClass = "border-gray-200 bg-white";
                let textClass = "text-gray-800";

                if (isCorrect) {
                  borderClass = "border-emerald-500 bg-emerald-50";
                  textClass = "text-emerald-800";
                } else if (isSelected && !isCorrect) {
                  borderClass = "border-rose-500 bg-rose-50";
                  textClass = "text-rose-800";
                }

                return (
                  <div
                    key={option}
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 ${borderClass}`}
                  >
                    <span
                      className={`h-3 w-3 rounded-full border ${
                        isSelected
                          ? "bg-gray-500 border-gray-500"
                          : "border-gray-400"
                      }`}
                    />
                    <span className={`flex-1 text-left text-sm ${textClass}`}>
                      {option === "true" ? "Benar" : "Salah"}
                    </span>
                  </div>
                );
              })}
            </div>

            {correctAnswer && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-amber-700 mb-1">
                  Jawaban yang benar
                </p>
                <p className="text-sm font-semibold text-amber-800 break-words">
                  {correctAnswer.toLowerCase() === "true" ? "Benar" : "Salah"}
                </p>
              </div>
            )}
          </div>
        );
      }

      if (questionType === "MULTIPLE_CHOICE") {
        const options =
          typedReviewAttempt.optionsText?.[currentQuestionIndex] || [];
        const optionCodes =
          typedReviewAttempt.optionsCode?.[currentQuestionIndex] || [];

        if (options.length === 0) {
          return (
            <div className="text-center py-8 text-gray-500">
              Loading question options...
            </div>
          );
        }

        return (
          <div className="mt-3 space-y-3 text-sm">
            <p className={`font-semibold ${statusClass}`}>{statusLabel}</p>

            <div className="space-y-2 rounded-md bg-blue-50/40 px-3 py-3 border border-blue-100">
              {options.map((option, index) => {
                const optionCode = optionCodes[index] || option;
                const isSelected = currentAnswer === optionCode;
                const isCorrect = correctAnswer === optionCode;
                let borderClass = "border-gray-200 bg-white";
                let textClass = "text-gray-800";

                if (isCorrect) {
                  borderClass = "border-emerald-500 bg-emerald-50";
                  textClass = "text-emerald-800";
                } else if (isSelected && !isCorrect) {
                  borderClass = "border-rose-500 bg-rose-50";
                  textClass = "text-rose-800";
                }

                return (
                  <div
                    key={`${option}-${index}`}
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 ${borderClass}`}
                  >
                    <span
                      className={`h-3 w-3 rounded-full border ${
                        isSelected
                          ? "bg-gray-500 border-gray-500"
                          : "border-gray-400"
                      }`}
                    />
                    <span className={`flex-1 text-left text-sm ${textClass}`}>
                      {option}
                    </span>
                  </div>
                );
              })}
            </div>

            {correctAnswer && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-amber-700 mb-1">
                  Jawaban yang benar
                </p>
                <p className="text-sm font-semibold text-amber-800 break-words">
                  {options[optionCodes.indexOf(correctAnswer)] || correctAnswer}
                </p>
              </div>
            )}
          </div>
        );
      }

      return (
        <div className="text-center py-8 text-gray-500">
          Loading question options...
        </div>
      );
    }

    if (!typedCurrentQuestion) {
      return (
        <div className="text-center py-8 text-gray-500">
          Loading question...
        </div>
      );
    }

    const questionId = typedCurrentQuestion.id;
    const currentCodeAnswer = answerCodeMap[questionId] || "";

    if (
      typedCurrentQuestion.questionType === "SHORT_ANSWER" ||
      typedCurrentQuestion.questionType === "ESSAY"
    ) {
      return (
        <textarea
          value={currentCodeAnswer}
          onChange={(e) => handleAnswerChange(questionId, e.target.value)}
          className="mt-3 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[90px]"
          placeholder="Tulis jawaban Anda di sini..."
        />
      );
    }

    if (typedCurrentQuestion.optionsText) {
      return (
        <div className="mt-3 space-y-2">
          {typedCurrentQuestion.optionsText.map((option, index) => {
            const id = `q-${questionId}-opt-${index}`;
            const optionCode =
              typedCurrentQuestion.optionsCode?.[index] || option;
            const currentCodeAnswer = answerCodeMap[questionId];
            const isSelected = currentCodeAnswer === optionCode;
            return (
              <label
                key={index}
                htmlFor={id}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-900"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/60"
                }`}
              >
                <input
                  id={id}
                  type="radio"
                  name={`question-${questionId}`}
                  value={option}
                  checked={isSelected}
                  onChange={() =>
                    handleAnswerChange(questionId, option, optionCode)
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="flex-1 text-left">{option}</span>
              </label>
            );
          })}
        </div>
      );
    }

    return null;
  };

  const wrapperClasses =
    "relative w-full bg-white rounded-md transition-all duration-500 border border-gray-200 shadow-sm flex flex-col md:flex-row md:h-[520px] md:min-h-[520px] md:max-h-[520px]";

  if (!isQuizStarted && !isReviewMode) {
    if (isQuizDetailLoading || isHistoryLoading) {
      return (
        <div className={wrapperClasses}>
          <div className="flex items-center justify-center w-full h-full">
            <p className="text-gray-500">Loading quiz...</p>
          </div>
        </div>
      );
    }

    if (!typedQuizDetail) {
      return (
        <div className={wrapperClasses}>
          <div className="flex items-center justify-center w-full h-full">
            <p className="text-red-600">Failed to load quiz</p>
          </div>
        </div>
      );
    }
    return (
      <div className={wrapperClasses}>
        <div className="flex-1 p-3 md:p-4 md:pr-3 flex flex-col gap-4">
          <div className="flex items-center gap-3 md:mb-2">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-5 h-5 md:w-6 md:h-6 text-orange-600 leading-none" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-lg font-semibold text-gray-900 mb-1 truncate">
                {content.name}
              </p>
            </div>
          </div>

          <p className="text-xs md:text-base text-gray-600 whitespace-pre-line break-words">
            {content.description}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 flex items-start gap-2">
              <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Durasi
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {typedQuizDetail.durationLimit} menit
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 flex items-start gap-2">
              <div className="w-7 h-7 rounded-md bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Jumlah soal
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {typedQuizDetail.totalQuestions} soal
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 flex items-start gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Passing grade
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {typedQuizDetail.passingScore}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 flex items-start gap-2">
              <div className="w-7 h-7 rounded-md bg-sky-100 flex items-center justify-center flex-shrink-0">
                <RotateCw className="w-4 h-4 text-sky-600" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Jumlah attempt
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {typedQuizDetail.attemptLimit} kali
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 flex items-start gap-2">
              <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Tanggal mulai
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(typedQuizDetail?.content?.contentStart)}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 flex items-start gap-2">
              <div className="w-7 h-7 rounded-md bg-rose-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Tanggal selesai
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(typedQuizDetail?.content?.contentEnd)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-gray-200 bg-gray-50 flex flex-col p-3 md:p-4 gap-3">
          <div className="flex-1 flex flex-col min-h-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Riwayat pengerjaan
            </p>
            {hasAttempts ? (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {attempts.map((attempt, index) => {
                  const hasPassed = attempt.isPassed === true;
                  const hasFailed = attempt.isPassed === false;
                  const hasScore = attempt.totalScore !== null;

                  return (
                    <div
                      key={attempt.id}
                      className="rounded-lg border border-gray-200 bg-white p-3 space-y-1.5 flex-shrink-0"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Percobaan {attempt.attemptNo}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(attempt.quizEnd)}
                          </p>
                        </div>
                        {hasPassed && (
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium bg-green-50 text-green-700">
                            <CheckCircle className="w-3 h-3" />
                            Lulus
                          </span>
                        )}
                        {hasFailed && (
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium bg-red-50 text-red-700">
                            <CheckCircle className="w-3 h-3" />
                            Tidak Lulus
                          </span>
                        )}
                      </div>
                      {hasScore && (
                        <p className="text-xs text-gray-500">
                          Skor: {attempt.totalScore} / Passing grade:{" "}
                          {typedQuizDetail?.passingScore}
                        </p>
                      )}
                      <button
                        type="button"
                        className="mt-1 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => {
                          setReviewAttemptId(attempt.id);
                          setIsQuizStarted(true);
                          setIsReviewMode(true);
                          setQuizTimeLeft(null);
                          setCurrentQuestionIndex(0);
                        }}
                      >
                        Lihat review
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-3 text-xs text-gray-500">
                Belum ada riwayat pengerjaan.
              </div>
            )}
          </div>

          <div className="mt-auto pt-1">
            {inProgressAttempt ? (
              <div className="space-y-2">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm font-medium text-amber-900 mb-1">
                    ⚠️ Anda memiliki kuis yang belum selesai
                  </p>
                  <p className="text-xs text-amber-700">
                    Percobaan {inProgressAttempt.attemptNo} • Dimulai{" "}
                    {formatDate(inProgressAttempt.quizStart)}
                  </p>
                  {Object.keys(answerCodeMap).length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-amber-200 rounded-full h-2">
                        <div
                          className="bg-amber-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${(Object.keys(answerCodeMap).length / totalQuestions) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-amber-700 font-medium">
                        {Object.keys(answerCodeMap).length}/{totalQuestions}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  onClick={handleResumeQuiz}
                >
                  📝 Lanjutkan Kuis
                </button>
                {attemptsRemaining > 1 && (
                  <button
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Anda akan memulai percobaan baru. Percobaan sebelumnya akan dibatalkan. Lanjutkan?"
                        )
                      ) {
                        clearQuizSession(content.id);
                        setInProgressAttempt(null);
                        handleStartQuiz();
                      }
                    }}
                  >
                    🔄 Mulai Percobaan Baru ({attemptsRemaining - 1} tersisa)
                  </button>
                )}
              </div>
            ) : (
              <>
                <button
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  onClick={handleStartQuiz}
                  disabled={
                    attemptsRemaining <= 0 || startQuizMutation.isPending
                  }
                >
                  <span className="inline-flex items-center justify-center">
                    {startQuizMutation.isPending ? "Starting..." : "Mulai Kuis"}
                  </span>
                </button>
                <p className="mt-1.5 text-[11px] text-gray-500 text-center">
                  {attemptsRemaining > 0
                    ? `Anda memiliki ${attemptsRemaining} attempt tersisa.`
                    : "Anda sudah menggunakan semua attempt."}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showToast && (
        <div
          key={toastKey}
          className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5"
        >
          <Toast
            message={toastMessage}
            variant={toastVariant}
            onClose={() => {
              if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
                toastTimeoutRef.current = null;
              }
              setShowToast(false);
              // Reset after close to ensure next toast can appear
              setTimeout(() => setToastKey((prev) => prev + 1), 100);
            }}
            autoDismiss
            duration={TOAST_HIDE_MS}
          />
        </div>
      )}
      {/* ...existing code... */}
      <div className={wrapperClasses}>
        <div className="flex-1 flex flex-col p-3 md:p-4 md:pr-3">
          {/* Timer badge moved inside content so it doesn't overlap the question */}
          {!isReviewMode && (
            <div className="mb-3 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm border border-gray-200 w-fit">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              {quizTimeLeft !== null ? (
                <span className="text-xs font-semibold text-gray-900">
                  {formatTime(quizTimeLeft)}
                </span>
              ) : (
                <span className="text-xs text-gray-500">Tanpa batas waktu</span>
              )}
              <span className="ml-2 text-[11px] text-gray-500">
                Soal {currentQuestionIndex + 1} / {totalQuestions}
              </span>
            </div>
          )}
          {isReviewMode && (
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm border border-gray-200 w-fit">
                <span className="text-xs font-semibold text-gray-800">
                  Review jawaban
                </span>
                <span className="text-[11px] tracking-wide text-gray-500">
                  Soal {currentQuestionIndex + 1} dari {totalQuestions}
                </span>
              </div>
              <button
                type="button"
                onClick={handleBackToInfo}
                className="inline-flex items-center h-8 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 shadow-sm"
              >
                Kembali
              </button>
            </div>
          )}
          <div className="mb-4 flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm md:text-base font-semibold text-gray-900 leading-relaxed">
                {isReviewMode && typedReviewAttempt
                  ? typedReviewAttempt.questionText?.[currentQuestionIndex] ||
                    "Loading..."
                  : typedCurrentQuestion?.questionText || "Loading..."}
              </h3>
            </div>
          </div>

          {!isReviewMode && typedCurrentQuestion && (
            <div className="mb-2">
              <button
                type="button"
                onClick={() => toggleUnsure(typedCurrentQuestion.id)}
                disabled={isSavingAnswer}
                className={`inline-flex items-center justify-center gap-1 rounded-md border px-3 md:px-4 py-2 text-xs md:text-sm font-medium shadow-sm transition-colors disabled:opacity-50 ${
                  typedCurrentAttempt?.flag?.[currentQuestionIndex]
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Flag className="w-4 h-4 text-amber-700 mr-1" />
                {typedCurrentAttempt?.flag?.[currentQuestionIndex]
                  ? "Ditandai Ragu-ragu"
                  : "Tandai ragu-ragu"}
              </button>
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            {renderQuestionInput()}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              className={`inline-flex items-center justify-center rounded-md border px-3 py-2 text-xs md:text-sm font-medium shadow-sm transition-colors ${
                isFirstQuestion
                  ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              Previous Question
            </button>

            {isLastQuestion ? (
              !isReviewMode ? (
                <button
                  type="button"
                  onClick={() => setShowQuizSubmitConfirm(true)}
                  className="inline-flex items-center justify-center rounded-md border border-blue-600 bg-blue-600 px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  Submit Kuis
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center rounded-md border px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-gray-400 bg-gray-50 cursor-not-allowed"
                >
                  Next Question
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center justify-center rounded-md border border-blue-600 bg-blue-600 px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Next Question
              </button>
            )}
          </div>
        </div>

        <div className="hidden md:flex md:w-64 border-t md:border-t-0 md:border-l border-gray-200 bg-gray-50 flex-col p-3 md:p-4 gap-3">
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Navigasi soal
            </p>
            <div className="grid grid-cols-5 gap-2">
              {questionIds.map((qId, index) => {
                const isCurrent = index === currentQuestionIndex;
                const attemptToUse = isReviewMode
                  ? typedReviewAttempt
                  : typedCurrentAttempt;
                // Check if answered from our local map
                const isAnsweredLocal = !!answerCodeMap[qId];
                const isAnswered = isReviewMode
                  ? !!attemptToUse?.answer?.[index]
                  : isAnsweredLocal;
                const isUnsure = !!attemptToUse?.flag?.[index];

                // For review mode, determine if answer is correct
                let isCorrect = false;
                let isWrong = false;
                if (isReviewMode && attemptToUse) {
                  const userAnswer = attemptToUse.answer?.[index];
                  const correctAnswer = attemptToUse.keyAnswer?.[index];
                  if (userAnswer && correctAnswer) {
                    isCorrect = userAnswer === correctAnswer;
                    isWrong = userAnswer !== correctAnswer;
                  }
                }

                let baseClass =
                  "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50";

                if (isReviewMode) {
                  if (isCurrent) {
                    baseClass = "border-blue-600 bg-blue-500 text-white";
                  } else if (isCorrect) {
                    baseClass =
                      "border-emerald-500 bg-emerald-50 text-emerald-700";
                  } else if (isWrong) {
                    baseClass = "border-rose-500 bg-rose-50 text-rose-700";
                  } else {
                    baseClass = "border-gray-300 bg-white text-gray-700";
                  }
                } else if (isCurrent) {
                  baseClass = "border-blue-600 bg-blue-50 text-blue-700";
                } else if (isUnsure) {
                  baseClass = "border-amber-500 bg-amber-50 text-amber-700";
                } else if (isAnswered) {
                  baseClass =
                    "border-emerald-500 bg-emerald-50 text-emerald-700";
                }

                return (
                  <button
                    key={qId}
                    type="button"
                    onClick={() => handleGoToQuestion(index)}
                    className={`h-8 w-8 rounded-md text-xs font-medium border flex items-center justify-center transition-colors ${baseClass}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-auto pt-1 text-xs text-gray-500 space-y-1">
            {isReviewMode ? (
              <>
                <p>
                  <span className="inline-block h-2 w-3 rounded-sm bg-blue-500 align-middle mr-1" />
                  <span>Jawaban aktif</span>
                </p>
                <p>
                  <span className="inline-block h-2 w-3 rounded-sm bg-emerald-500 align-middle mr-1" />
                  <span>Jawaban benar</span>
                </p>
                <p>
                  <span className="inline-block h-2 w-3 rounded-sm bg-rose-500 align-middle mr-1" />
                  <span>Jawaban salah</span>
                </p>
                <p>
                  <span className="inline-block h-2 w-3 rounded-sm bg-gray-300 align-middle mr-1" />
                  <span>Belum dijawab</span>
                </p>
              </>
            ) : (
              <>
                <p>
                  <span className="inline-block h-2 w-3 rounded-sm bg-blue-500 align-middle mr-1" />
                  <span>Soal aktif</span>
                </p>
                <p>
                  <span className="inline-block h-2 w-3 rounded-sm bg-amber-500 align-middle mr-1" />
                  <span>Soal ragu-ragu</span>
                </p>
                <p>
                  <span className="inline-block h-2 w-3 rounded-sm bg-emerald-500 align-middle mr-1" />
                  <span>Soal terjawab</span>
                </p>
                <p>
                  <span className="inline-block h-2 w-3 rounded-sm bg-gray-300 align-middle mr-1" />
                  <span>Belum dijawab</span>
                </p>
              </>
            )}
          </div>
        </div>

        {showQuizSubmitConfirm && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-lg border border-gray-200">
              <p className="text-sm md:text-base font-semibold text-gray-900 mb-1">
                Apakah Anda yakin ingin mengirimkan jawaban Anda?
              </p>
              <p className="text-xs md:text-base text-gray-600 mb-4">
                Setelah Anda menekan Submit, semua jawaban akan dikunci dan
                tidak dapat diubah.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuizSubmitConfirm(false)}
                  className="px-3 py-1.5 text-xs md:text-base rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowQuizSubmitConfirm(false);
                    handleSubmitQuiz();
                  }}
                  className="px-3 py-1.5 text-xs md:text-base rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
