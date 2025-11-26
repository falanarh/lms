"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  QuizQuestionsManager,
  QuizInfo,
  QuizQuestion,
} from "@/features/course/components/QuizQuestionsManager";
import { useQuizById, useUpdateQuizWithContent } from "@/hooks/useQuiz";
import { useQuestions } from "@/hooks/useQuestions";

interface QuizPageProps {
  params: Promise<{
    id: string;
    quizId: string;
  }>;
}

export default function QuizPage({ params }: QuizPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const {
    data: quizData,
    isLoading: isLoadingQuiz,
    error: quizError,
  } = useQuizById(resolvedParams.quizId);

  const { data: questionsResponse, isLoading: isLoadingQuestions } =
    useQuestions(resolvedParams.quizId, currentPage, perPage);

  const updateQuizMutation = useUpdateQuizWithContent();

  const isLoading = isLoadingQuiz || isLoadingQuestions;
  const error = quizError ? "Failed to load quiz data" : null;

  const handleBack = () => {
    router.push(`/course/manage`);
  };

  const handleSaveQuiz = async (quizInfo: QuizInfo) => {
    try {
      await updateQuizMutation.mutateAsync({
        id: resolvedParams.quizId,
        data: {
          content: {
            idSection: resolvedParams.id,
            type: "quiz",
            name: quizInfo.title,
            description: quizInfo.description || "",
            sequence: 0,
          },
          quiz: {
            durationLimit: quizInfo.timeLimit || 0,
            passingScore: quizInfo.passingScore || 0,
            shuffleQuestions: quizInfo.shuffleQuestions || false,
          },
        },
      });
      router.push(`/course/manage`);
    } catch (err) {
      console.error("Error saving quiz:", err);
      alert("Failed to save quiz. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {/* Header with Breadcrumb Skeleton */}
        <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200 dark:border-zinc-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <div className="animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Overview Stats Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 px-6 py-6 animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-blue-400 rounded"></div>
                  <div className="h-6 w-12 bg-blue-400 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-12 bg-blue-400 rounded"></div>
                  <div className="h-6 w-8 bg-blue-400 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-blue-400 rounded"></div>
                  <div className="h-6 w-8 bg-blue-400 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-blue-400 rounded"></div>
                  <div className="h-6 w-16 bg-blue-400 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Questions List Skeleton */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700">
            {/* Questions Header Skeleton */}
            <div className="px-6 py-5 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <div className="space-y-2 animate-pulse">
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="flex items-center gap-2 animate-pulse">
                  <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="h-10 w-28 bg-blue-200 dark:bg-blue-700 rounded-lg"></div>
                </div>
              </div>
            </div>

            {/* Skeleton Question Items */}
            <div className="p-6 bg-gray-50 dark:bg-zinc-900 space-y-3">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 p-4 animate-pulse"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="h-5 w-12 bg-amber-100 dark:bg-amber-900/30 rounded-full"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="flex items-center gap-2 animate-pulse">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="flex items-center gap-2 animate-pulse">
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-red-900/20 dark:via-slate-900 dark:to-orange-900/20 p-4">
        <div className="flex flex-col items-center gap-6 text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 dark:shadow-red-900/30">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-zinc-400">{error}</p>
          </div>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30 dark:shadow-blue-900/30 hover:shadow-xl hover:shadow-blue-500/40 dark:hover:shadow-blue-900/40 font-medium"
          >
            Back to Course Management
          </button>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-amber-50 dark:from-yellow-900/20 dark:via-slate-900 dark:to-amber-900/20 p-4">
        <div className="flex flex-col items-center gap-6 text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-amber-600 dark:from-yellow-600 dark:to-amber-700 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30 dark:shadow-yellow-900/30">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
              Quiz Not Found
            </h2>
            <p className="text-gray-600 dark:text-zinc-400">
              The quiz you're looking for doesn't exist or has been removed.
            </p>
          </div>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30 dark:shadow-blue-900/30 hover:shadow-xl hover:shadow-blue-500/40 dark:hover:shadow-blue-900/40 font-medium"
          >
            Back to Course Management
          </button>
        </div>
      </div>
    );
  }

  const quiz = quizData;

  const initialQuestions: QuizQuestion[] =
    questionsResponse?.data?.map((q, index) => {
      // Map API question types back to frontend types
      let questionType: "multiple_choice" | "essay" | "true_false";
      switch (q.questionType.toUpperCase()) {
        case "MULTIPLE_CHOICE":
          questionType = "multiple_choice";
          break;
        case "TRUE_FALSE":
          questionType = "true_false";
          break;
        case "SHORT_ANSWER":
          questionType = "essay"; // Map API SHORT_ANSWER back to frontend essay
          break;
        default:
          questionType = "multiple_choice";
      }

      let options = undefined;
      let correctAnswer = undefined;

      if (
        questionType === "multiple_choice" &&
        q.optionsText &&
        q.optionsText.length > 0
      ) {
        // Fix: Use q.answers[0] to access first answer in array
        const correctAnswerText = q.answers?.[0]?.answer || "";
        const correctAnswerCode = q.answers?.[0]?.codeAnswer;

        options = q.optionsText.map((text, idx) => {
          // Check by text comparison
          let isCorrect = false;
          if (correctAnswerText) {
            isCorrect =
              text.trim().toLowerCase() ===
              correctAnswerText.trim().toLowerCase();
          }

          return {
            id: String(idx),
            text: text,
            isCorrect: isCorrect,
            order: idx,
          };
        });

        // Find the correct option to set as the correctAnswer
        const correctOption = options.find((opt) => opt.isCorrect);
        correctAnswer = correctOption ? correctOption.text : correctAnswerText;
      } else if (questionType === "true_false") {
        // Fix: Use q.answers[0].answer to access first answer in array
        const answerValue = q.answers?.[0]?.answer?.toLowerCase();
        correctAnswer = answerValue === "true" ? "true" : "false";
      } else if (questionType === "essay") {
        // For essay questions, the answer is the expected answer text
        correctAnswer = q.answers?.[0]?.answer || "";
      }

      return {
        id: q.id,
        questionText: q.questionText,
        questionType: questionType,
        points: q.maxScore,
        order: index,
        timeLimit: undefined,
        explanation: undefined,
        options: options,
        correctAnswer: correctAnswer,
        questionTagId: q.tag?.id || "",
        questionTagName: q.tag?.name || "",
        shuffleOptions: q.shuffleOptions || false,
      };
    }) || [];

  const totalQuestions = questionsResponse?.pageMeta?.totalResultCount || 0;
  const totalPoints = initialQuestions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header with Breadcrumb */}
      <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <Breadcrumb
              items={[
                { label: "Courses", href: "/course" },
                {
                  label: "Manage Course",
                  href: "/course/manage",
                },
                {
                  label: quiz.content?.name || "Quiz",
                  href: `/course/${resolvedParams.id}/quiz/${resolvedParams.quizId}`,
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Quiz Questions Manager */}
      <QuizQuestionsManager
        quizInfo={{
          id: quiz.idContent,
          title: quiz.content?.name || "Quiz",
          description: quiz.content?.description || "",
          timeLimit: quiz.timeLimit,
          shuffleQuestions: quiz.shuffleQuestions || false,
          passingScore: quiz.passingScore,
          totalQuestions: totalQuestions,
          maxPoints: totalPoints,
        }}
        onBack={handleBack}
        onSaveQuiz={handleSaveQuiz}
        initialQuestions={initialQuestions}
        quizId={resolvedParams.quizId}
        pageMeta={questionsResponse?.pageMeta}
        onPageChange={setCurrentPage}
        onPerPageChange={(newPerPage) => {
          setPerPage(newPerPage);
          setCurrentPage(1); // Reset to first page when changing perPage
        }}
      />
    </div>
  );
}
