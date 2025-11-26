import axios from "axios";
import { API_QUIZ_BASE_URL } from "@/config/api";

export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"
  | "ESSAY";
export type QuizAttemptStatus = "PENDING" | "SUBMITTED" | "GRADED";

export interface QuizAttemptSummary {
  id: string;
  attemptNo: number;
  totalScore: number | null;
  isPassed: boolean | null;
  quizStart: string;
  quizEnd: string;
}

export interface QuizDetailResponse {
  idContent: string;
  content: {
    name: string;
    description: string;
    contentStart: string | null;
    contentEnd: string | null;
  };
  durationLimit: number;
  totalQuestions: number;
  maxPoint: number;
  passingScore: number;
  attemptLimit: number;
}

export interface QuizAttemptHistoryResponse {
  attempts: QuizAttemptSummary[];
}

export interface QuizStartResponse {
  success: boolean;
  message: string;
  attemptId: string;
  questions: Array<{
    question_id: string;
    question_number: string;
  }>;
}

export interface QuizAnswer {
  id: string;
  answer: string;
  codeAnswer: string;
}

export interface QuestionDetail {
  id: string;
  idContent: string;
  idQuestionTag: string;
  name: string;
  description: string;
  questionType: QuestionType;
  questionText: string;
  maxScore: number;
  optionsText: string[];
  optionsCode: string[];
  answers: QuizAnswer;
}

export interface SaveAnswerRequest {
  idAttempt: string;
  idQuestion: string;
  answer: string;
  flag: boolean;
}

export interface QuizAttemptDetail {
  id: string;
  idUser: string;
  idContent: string;
  questionOrder: string[];
  questionName?: string[];
  questionDescription?: string[];
  questionText: string[];
  optionsText?: string[][];
  optionsCode?: string[][];
  questionType: QuestionType[];
  questionScore: number[];
  keyAnswer: string[];
  answer: string[];
  flag: boolean[];
  rawScore: number[];
  attemptNo: number;
  status: QuizAttemptStatus;
  totalScore: number;
  finalScore?: number;
  isPassed: boolean;
  quizStart: string;
  quizEnd: string;
}

export const getQuizDetailByContent = async (
  idContent: string
): Promise<QuizDetailResponse> => {
  const response = await axios.get<QuizDetailResponse>(
    `${API_QUIZ_BASE_URL}/quizzes/${idContent}`,
    { withCredentials: false }
  );
  return response.data;
};

export const getQuizAttemptHistory = async (
  idUser: string,
  idContent: string
): Promise<QuizAttemptHistoryResponse> => {
  const response = await axios.get<QuizAttemptHistoryResponse>(
    `${API_QUIZ_BASE_URL}/quizzes/user/${idUser}/content/${idContent}`,
    { withCredentials: false }
  );
  return response.data;
};

export const startQuizAttempt = async (
  idUser: string,
  idContent: string
): Promise<QuizStartResponse> => {
  const response = await axios.post<QuizStartResponse>(
    `${API_QUIZ_BASE_URL}/quiz-attempts/start`,
    { idUser, idContent },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: false,
    }
  );
  return response.data;
};

export const getQuestionWithAnswer = async (
  idQuestion: string
): Promise<QuestionDetail> => {
  const response = await axios.get<QuestionDetail>(
    `${API_QUIZ_BASE_URL}/questions/${idQuestion}/with-answer`,
    { withCredentials: false }
  );
  return response.data;
};

export const saveQuizAnswer = async (
  payload: SaveAnswerRequest
): Promise<QuizAttemptDetail> => {
  const response = await axios.post<QuizAttemptDetail>(
    `${API_QUIZ_BASE_URL}/quiz-attempts/save-answer`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: false,
    }
  );
  return response.data;
};

export const updateQuizAnswer = async (
  payload: SaveAnswerRequest
): Promise<QuizAttemptDetail> => {
  const response = await axios.patch<QuizAttemptDetail>(
    `${API_QUIZ_BASE_URL}/quiz-attempts/save-answer`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: false,
    }
  );
  return response.data;
};

export const submitQuizAttempt = async (
  idAttempt: string
): Promise<QuizAttemptDetail> => {
  const response = await axios.post<QuizAttemptDetail>(
    `${API_QUIZ_BASE_URL}/quiz-attempts/submit`,
    { idAttempt },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: false,
    }
  );
  return response.data;
};

export const getQuizAttemptById = async (
  idAttempt: string
): Promise<QuizAttemptDetail> => {
  const response = await axios.get<QuizAttemptDetail>(
    `${API_QUIZ_BASE_URL}/quiz-attempts/${idAttempt}`,
    { withCredentials: false }
  );
  return response.data;
};

export const getQuizAttemptForReview = async (
  idUser: string,
  idContent: string,
  idAttempt: string
): Promise<QuizAttemptDetail> => {
  const response = await axios.get<QuizAttemptDetail>(
    `${API_QUIZ_BASE_URL}/quiz-attempts/${idUser}/${idContent}/${idAttempt}`,
    { withCredentials: false }
  );
  return response.data;
};
