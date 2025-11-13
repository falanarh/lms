"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { QuizQuestionsManager, QuizInfo, QuizQuestion } from "@/features/course/components/QuizQuestionsManager";
import { 
  useQuizById, 
  useUpdateQuizWithContent,
} from "@/hooks/useQuiz";
import { useQuestions } from "@/hooks/useQuestions";

interface QuizPageProps {
  params: Promise<{
    courseId: string;
    quizId: string;
  }>;
}

export default function QuizPage({ params }: QuizPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  // Pagination state - start with page 1 and 5 items per page
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5); 
  
  // Fetch quiz data using the hook
  const { 
    data: quizData, 
    isLoading: isLoadingQuiz, 
    error: quizError 
  } = useQuizById(resolvedParams.quizId);

  // Fetch questions for this quiz with pagination
  const {
    data: questionsResponse,
    isLoading: isLoadingQuestions,
  } = useQuestions(resolvedParams.quizId, currentPage, perPage);

  // Mutations
  const updateQuizMutation = useUpdateQuizWithContent();

  const isLoading = isLoadingQuiz || isLoadingQuestions;
  const error = quizError ? "Failed to load quiz data" : null;

  const handleBack = () => {
    router.push(`/course/manage`);
  };

  const handleSaveQuiz = async (quizInfo: QuizInfo, questions: QuizQuestion[]) => {
    try {
      // Update quiz with content only - questions are handled directly in QuizQuestionsManager
      await updateQuizMutation.mutateAsync({
        id: resolvedParams.quizId,
        data: {
          content: {
            name: quizInfo.title,
            description: quizInfo.description || "",
          },
          quiz: {
            timeLimit: quizInfo.timeLimit,
            shuffleQuestions: quizInfo.shuffleQuestions,
            passingScore: quizInfo.passingScore,
          }
        }
      });
      router.push(`/course/manage`);
    } catch (err) {
      console.error("Error saving quiz:", err);
      alert("Failed to save quiz. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">Loading quiz...</p>
            <p className="text-sm text-gray-500 mt-1">Please wait a moment</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
        <div className="flex flex-col items-center gap-6 text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600">{error}</p>
          </div>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 font-medium"
          >
            Back to Course Management
          </button>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-amber-50 p-4">
        <div className="flex flex-col items-center gap-6 text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Not Found</h2>
            <p className="text-gray-600">The quiz you're looking for doesn't exist or has been removed.</p>
          </div>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 font-medium"
          >
            Back to Course Management
          </button>
        </div>
      </div>
    );
  }

  const quiz = quizData;
  
  // Transform API questions to QuizQuestion format
  const initialQuestions: QuizQuestion[] = questionsResponse?.data?.map((q, index) => {
    const questionType = q.questionType.toLowerCase() as "multiple_choice" | "essay" | "true_false";
    
    // For multiple choice, create options from optionsText and find correct answer
    let options = undefined;
    let correctAnswer = undefined;
    
    if (questionType === "multiple_choice" && q.optionsText && q.optionsText.length > 0) {
      const correctAnswerText = q.answers?.[0]?.answer || "";
      options = q.optionsText.map((text, idx) => ({
        id: String(idx),
        text: text,
        isCorrect: text === correctAnswerText,
        order: idx,
      }));
    } else if (questionType === "true_false") {
      // For true/false, get the correct answer from the answers array
      const answerValue = q.answers?.[0]?.answer?.toLowerCase();
      correctAnswer = answerValue === "true" ? "true" : "false";
    }
    
    return {
      id: q.id,
      questionText: q.questionText,
      questionType: questionType,
      points: q.maxScore,
      order: index, // Use index as order
      timeLimit: undefined, // Your backend doesn't have per-question time limit
      explanation: undefined, // Can be added if backend supports it
      options: options,
      correctAnswer: correctAnswer,
    };
  }) || [];

  // Get pagination metadata from API response
  const totalQuestions = questionsResponse?.pageMeta?.totalResultCount || 0;
  
  // Calculate total points from current page questions
  const totalPoints = initialQuestions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="min-h-screen">
      {/* Header with Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <Breadcrumb
              items={[
                { key: "courses", label: "Courses", href: "/course" },
                { key: "manage", label: "Manage Course", href: "/course/manage" },
                { key: "quiz", label: quiz.content?.name || "Quiz", href: `/course/${resolvedParams.courseId}/quiz/${resolvedParams.quizId}` },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Quiz Questions Manager */}
      <QuizQuestionsManager
        quizInfo={{
          id: quiz.idContent,
          title: quiz.content?.name || 'Quiz',
          description: quiz.content?.description || '',
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
        onPerPageChange={setPerPage} 
      />
    </div>
  );
} 