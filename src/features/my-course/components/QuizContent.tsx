"use client";

import { Content } from "@/api/contents";
import { useEffect, useState } from "react";
import { Calendar, CheckCircle, ClipboardList, Clock, Flag, HelpCircle, RotateCw, Target } from "lucide-react";

type QuizQuestionType = "multiple_choice" | "true_false" | "short_answer";

interface QuizQuestion {
  id: number;
  type: QuizQuestionType;
  question: string;
  options?: string[];
}

interface QuizContentProps {
  content: Content;
  isSidebarOpen: boolean;
}

export const QuizContent = ({ content, isSidebarOpen }: QuizContentProps) => {
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizUnsure, setQuizUnsure] = useState<Record<number, boolean>>({});
  const [quizTimeLeft, setQuizTimeLeft] = useState<number | null>(null);
  const [showQuizSubmitConfirm, setShowQuizSubmitConfirm] = useState(false);

  const quizInfo = {
    durationMinutes: 30,
    durationLabel: "30 menit",
    totalQuestions: 5,
    passingGrade: "75",
    startDate: "12 Nov 2025, 08:00",
    endDate: "20 Nov 2025, 23:59",
    attemptsAllowed: 3,
    attemptsUsed: 1,
  };

  const questions: QuizQuestion[] = [
    {
      id: 1,
      type: "multiple_choice",
      question: "Apa kepanjangan dari LMS?",
      options: [
        "Learning Management System",
        "Learning Media Service",
        "Lecture Management Software",
        "Learning Module Suite",
      ],
    },
    {
      id: 2,
      type: "true_false",
      question: "React adalah library JavaScript untuk membangun UI.",
      options: ["Benar", "Salah"],
    },
    {
      id: 3,
      type: "multiple_choice",
      question: "Format file manakah yang *tidak* umum untuk materi e-learning?",
      options: ["PDF", "MP4", "DOCX", "EXE"],
    },
    {
      id: 4,
      type: "short_answer",
      question: "Sebutkan satu manfaat menggunakan LMS untuk pembelajaran.",
    },
    {
      id: 5,
      type: "multiple_choice",
      question: "Berapa minimal nilai yang harus dicapai untuk lulus kuis ini?",
      options: ["60%", "70%", "75%", "80%"],
    },
  ];

  const correctAnswers: Record<number, string> = {
    1: "Learning Management System",
    2: "Benar",
    3: "EXE",
    4: "Mengelola pembelajaran secara terpusat",
    5: "75%",
  };

  const hasAttempt = quizInfo.attemptsUsed > 0;
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex] ?? questions[0];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const handleStartQuiz = (durationMinutes?: number) => {
    setIsQuizStarted(true);
    setIsReviewMode(false);
    setCurrentQuestionIndex(0);
    setQuizAnswers({});
    setQuizUnsure({});

    if (durationMinutes && durationMinutes > 0) {
      setQuizTimeLeft(durationMinutes * 60);
    } else {
      setQuizTimeLeft(null);
    }
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleUnsure = (questionId: number) => {
    setQuizUnsure((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const mm = m.toString().padStart(2, "0");
    const ss = s.toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  useEffect(() => {
    if (!isQuizStarted || isReviewMode || quizTimeLeft === null || quizTimeLeft <= 0) return;

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

  const handleSubmitQuiz = () => {
    setIsQuizStarted(false);
    setIsReviewMode(false);
    setQuizTimeLeft(null);
    setCurrentQuestionIndex(0);
  };

  const currentAnswer = quizAnswers[currentQuestion.id] ?? "";

  const renderQuestionInput = () => {
    if (isReviewMode) {
      const correct = correctAnswers[currentQuestion.id];
      const hasUserAnswer = !!currentAnswer;
      let statusLabel = "Belum dijawab";
      let statusClass = "text-gray-600";

      if (hasUserAnswer && correct) {
        const isCorrect =
          currentQuestion.type === "short_answer"
            ? currentAnswer.trim().toLowerCase() === correct.trim().toLowerCase()
            : currentAnswer === correct;

        if (isCorrect) {
          statusLabel = "Jawaban Anda benar";
          statusClass = "text-emerald-700";
        } else {
          statusLabel = "Jawaban Anda salah";
          statusClass = "text-rose-700";
        }
      }

      if (currentQuestion.type === "short_answer") {
        return (
          <div className="mt-3 space-y-2 text-sm">
            <p className={`font-semibold ${statusClass}`}>{statusLabel}</p>
            <div className="rounded-md border border-gray-200 bg-white px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Jawaban Anda</p>
              <p className="text-sm text-gray-900 break-words">
                {hasUserAnswer ? currentAnswer : "Anda tidak menjawab soal ini."}
              </p>
            </div>
            {correct && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-emerald-700 mb-1">Jawaban benar</p>
                <p className="text-sm font-semibold text-emerald-800 break-words">{correct}</p>
              </div>
            )}
          </div>
        );
      }

      return (
        <div className="mt-3 space-y-3 text-sm">
          <p className={`font-semibold ${statusClass}`}>{statusLabel}</p>

          <div className="space-y-2 rounded-md bg-blue-50/40 px-3 py-3 border border-blue-100">
            {currentQuestion.options?.map((option) => {
              const id = `q-${currentQuestion.id}-opt-${option}`;
              const isSelected = currentAnswer === option;
              const isCorrect = correct === option;
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
                      isSelected ? "bg-gray-500 border-gray-500" : "border-gray-400"
                    }`}
                  />
                  <span className={`flex-1 text-left text-sm ${textClass}`}>{option}</span>
                </div>
              );
            })}
          </div>

          {correct && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-amber-700 mb-1">Jawaban yang benar</p>
              <p className="text-sm font-semibold text-amber-800 break-words">{correct}</p>
            </div>
          )}
        </div>
      );
    }

    if (currentQuestion.type === "short_answer") {
      return (
        <textarea
          value={currentAnswer}
          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
          className="mt-3 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[90px]"
          placeholder="Tulis jawaban Anda di sini..."
        />
      );
    }

    if (currentQuestion.options) {
      return (
        <div className="mt-3 space-y-2">
          {currentQuestion.options.map((option) => {
            const id = `q-${currentQuestion.id}-opt-${option}`;
            const isSelected = currentAnswer === option;
            return (
              <label
                key={option}
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
                  name={`question-${currentQuestion.id}`}
                  value={option}
                  checked={isSelected}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
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

  const getIsCorrect = (q: QuizQuestion) => {
    const user = quizAnswers[q.id];
    const correct = correctAnswers[q.id];
    if (!user || !correct) return false;
    if (q.type === "short_answer") {
      return user.trim().toLowerCase() === correct.trim().toLowerCase();
    }
    return user === correct;
  };

  const correctCount = questions.filter((q) => getIsCorrect(q)).length;
  const answeredCount = questions.filter((q) => !!quizAnswers[q.id])?.length ?? 0;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  if (!isQuizStarted && !isReviewMode) {
    return (
      <div className={wrapperClasses}>
        <div className="flex-1 p-3 md:p-4 md:pr-3 flex flex-col gap-4">
          <div className="flex items-center gap-3 md:mb-2">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-5 h-5 md:w-6 md:h-6 text-orange-600 leading-none" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-lg font-semibold text-gray-900 mb-1 truncate">{content.name}</p>
            </div>
          </div>

          <p className="text-xs md:text-base text-gray-600 whitespace-pre-line break-words">{content.description}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 flex items-start gap-2">
              <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Durasi</p>
                <p className="text-sm font-semibold text-gray-900">{quizInfo.durationLabel}</p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 flex items-start gap-2">
              <div className="w-7 h-7 rounded-md bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Jumlah soal</p>
                <p className="text-sm font-semibold text-gray-900">{quizInfo.totalQuestions} soal</p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 flex items-start gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Passing grade</p>
                <p className="text-sm font-semibold text-gray-900">{quizInfo.passingGrade}</p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 flex items-start gap-2">
              <div className="w-7 h-7 rounded-md bg-sky-100 flex items-center justify-center flex-shrink-0">
                <RotateCw className="w-4 h-4 text-sky-600" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Jumlah attempt</p>
                <p className="text-sm font-semibold text-gray-900">{quizInfo.attemptsAllowed} kali</p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 flex items-start gap-2">
              <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Tanggal mulai</p>
                <p className="text-sm font-semibold text-gray-900">{quizInfo.startDate}</p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 flex items-start gap-2">
              <div className="w-7 h-7 rounded-md bg-rose-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Tanggal selesai</p>
                <p className="text-sm font-semibold text-gray-900">{quizInfo.endDate}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-gray-200 bg-gray-50 flex flex-col p-3 md:p-4 gap-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Riwayat pengerjaan</p>
            {hasAttempt ? (
              <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Percobaan 1</p>
                    <p className="text-xs text-gray-500">12 Nov 2025, 14.32</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-700">
                    <CheckCircle className="w-3 h-3" />
                    Lulus
                  </span>
                </div>
                <p className="text-xs text-gray-500">Skor: 85 / Passing grade: {quizInfo.passingGrade}</p>
                <p className="text-xs text-gray-400 mb-2">Attempt {quizInfo.attemptsUsed} dari {quizInfo.attemptsAllowed}</p>
                <button
                  type="button"
                  className="mt-1 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setIsQuizStarted(true);
                    setIsReviewMode(true);
                    setQuizTimeLeft(null);
                    setCurrentQuestionIndex(0);
                  }}
                >
                  Lihat review
                </button>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-3 text-xs text-gray-500">
                Belum ada riwayat pengerjaan.
              </div>
            )}
          </div>

          <div className="mt-auto pt-1">
            <button
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              onClick={() => handleStartQuiz(quizInfo.durationMinutes)}
            >
              <span className="inline-flex items-center justify-center">
                {/* Icon Play dihapus di sini untuk menghindari duplikasi import; bisa ditambahkan jika diperlukan */}
              </span>
              Mulai Kuis
            </button>
            <p className="mt-1.5 text-[11px] text-gray-500 text-center">
              Anda memiliki {quizInfo.attemptsAllowed - quizInfo.attemptsUsed} attempt tersisa.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClasses}>
      {isReviewMode ? (
        <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm border border-gray-200">
          <span className="text-xs font-semibold text-gray-800">Review jawaban</span>
          <span className="text-[11px] tracking-wide text-gray-500">
            Soal {currentQuestionIndex + 1} dari {totalQuestions}
          </span>
        </div>
      ) : (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm border border-gray-200">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          {quizTimeLeft !== null ? (
            <span className="text-xs font-semibold text-gray-900">{formatTime(quizTimeLeft)}</span>
          ) : (
            <span className="text-xs text-gray-500">Tanpa batas waktu</span>
          )}
          <span className="ml-2 text-[11px] text-gray-500">
            Soal {currentQuestionIndex + 1} / {totalQuestions}
          </span>
        </div>
      )}

      <div className="flex-1 flex flex-col p-3 md:p-4 md:pr-3">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-blue-600 mb-1">
              Soal {currentQuestionIndex + 1} dari {totalQuestions}
            </p>
            <h3 className="text-sm md:text-base font-semibold text-gray-900 leading-relaxed">
              {currentQuestion.question}
            </h3>
          </div>
          {isReviewMode && (
            <button
              type="button"
              onClick={() => {
                setIsQuizStarted(false);
                setIsReviewMode(false);
                setCurrentQuestionIndex(0);
                setQuizTimeLeft(null);
              }}
              className="inline-flex items-center rounded-full border border-gray-300 bg-white px-3 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
            >
              {"Kembali ke info kuis"}
            </button>
          )}
        </div>

        {!isReviewMode && (
          <div className="mb-2">
            <button
              type="button"
              onClick={() => toggleUnsure(currentQuestion.id)}
              className={`inline-flex items-center justify-center gap-1 rounded-md border px-3 md:px-4 py-2 text-xs md:text-sm font-medium shadow-sm transition-colors ${
                quizUnsure[currentQuestion.id]
                  ? "border-amber-500 bg-amber-50 text-amber-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Flag className="w-4 h-4 text-amber-700 mr-1" />
              {quizUnsure[currentQuestion.id] ? "Ditandai Ragu-ragu" : "Tandai ragu-ragu"}
            </button>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto pr-1">{renderQuestionInput()}</div>

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
          <p className="text-xs font-semibold text-gray-700 mb-2">Navigasi soal</p>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, index) => {
              const isCurrent = index === currentQuestionIndex;
              const isAnswered = !!quizAnswers[q.id];
              const isUnsure = !!quizUnsure[q.id];
              const isCorrect = getIsCorrect(q);
              const isWrong = isAnswered && !isCorrect;

              let baseClass =
                "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50";

              if (isReviewMode) {
                if (isCorrect) {
                  baseClass = "border-emerald-500 bg-emerald-50 text-emerald-700";
                } else if (isWrong) {
                  baseClass = "border-rose-500 bg-rose-50 text-rose-700";
                } else {
                  baseClass = "border-gray-300 bg-white text-gray-700";
                }
                if (isCurrent) {
                  baseClass += " ring-2 ring-blue-500";
                }
              } else if (isCurrent) {
                baseClass = "border-blue-600 bg-blue-50 text-blue-700";
              } else if (isUnsure) {
                baseClass = "border-amber-500 bg-amber-50 text-amber-700";
              } else if (isAnswered) {
                baseClass = "border-emerald-500 bg-emerald-50 text-emerald-700";
              }

              return (
                <button
                  key={q.id}
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

        <div className="mt-auto pt-1 text-[11px] text-gray-500 space-y-1">
          {isReviewMode ? (
            <>
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
            <p className="text-sm font-semibold text-gray-900 mb-1">Selesai mengerjakan kuis?</p>
            <p className="text-xs text-gray-600 mb-4">
              Setelah Anda submit, jawaban tidak dapat diubah lagi.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowQuizSubmitConfirm(false)}
                className="px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQuizSubmitConfirm(false);
                  handleSubmitQuiz();
                }}
                className="px-3 py-1.5 text-xs rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                Ya, submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
