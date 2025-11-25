import axios from "axios";

export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "ESSAY"
  | "SHORT_ANSWER";

export interface QuestionRequest {
  idContent: string;
  idQuestionTag: string;
  name: string;
  questionType: QuestionType;
  questionText: string;
  maxScore: number;
  shuffleOptions: boolean;
  optionsCode?: string[];
  optionsText?: string[];
  answer: {
    answer: string | string[];
    codeAnswer?: string | null;
  };
}

export interface Answer {
  id: string;
  answer: string;
  codeAnswer: string;
}

export interface Question {
  id: string;
  idContent: string;
  name: string;
  questionType: QuestionType;
  questionText: string;
  maxScore: number;
  optionsText?: string[];
  answers: Answer[];
  tag?: {
    id: string;
    name: string;
    detail?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface QuestionResponse {
  id: string;
  idContent: string;
  name: string;
  questionType: QuestionType;
  questionText: string;
  maxScore: number;
  optionsText?: string[];
  answers: Answer[];
  shuffleOptions: boolean;
  tag?: {
    id: string;
    name: string;
    detail?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PageMeta {
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

export interface QuestionsListResponse {
  data: QuestionResponse[];
  pageMeta: PageMeta;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_QUIZ_BASE_URL || "http://localhost:3002";

/**
 * Creates a question with correct answer
 * Based on the curl example: POST /questions/with-correct-answer
 */
export const createQuestion = async (
  questionData: QuestionRequest,
): Promise<QuestionResponse> => {
  try {
    console.log(
      "📡 Creating question with data:",
      JSON.stringify(questionData, null, 2),
    );
    console.log(
      "📡 Sending request to:",
      `${BASE_URL}/questions/with-correct-answer`,
    );

    const response = await axios.post<QuestionResponse>(
      `${BASE_URL}/questions/with-correct-answer`,
      questionData,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: false,
      },
    );

    console.log("📡 Response status:", response.status);
    console.log("📡 Question created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating question:", error);
    if (axios.isAxiosError(error)) {
      console.error("❌ Axios error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
      });
    }
    throw error;
  }
};

/**
 * Get all questions for a specific content with pagination support
 * Updated to support pagination parameters
 */
export const getQuestionsByContentId = async (
  idContent: string,
  page: number = 1,
  perPage: number = 10,
): Promise<QuestionsListResponse> => {
  try {
    const response = await axios.get<QuestionsListResponse>(
      `${BASE_URL}/questions?idContent=${idContent}&page=${page}&perPage=${perPage}`,
      {
        headers: {
          Accept: "application/json",
        },
        withCredentials: false,
      },
    );
    console.log("📡 Questions fetched for content:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching questions by content ID:", error);
    throw error;
  }
};

/**
 * Get a specific question by ID
 */
export const getQuestionById = async (
  id: string,
): Promise<QuestionResponse> => {
  try {
    const response = await axios.get<QuestionResponse>(
      `${BASE_URL}/questions/${id}/with-answers`,
      {
        headers: {
          Accept: "application/json",
        },
        withCredentials: false,
      },
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching question by ID:", error);
    throw error;
  }
};

/**
 * Update a question
 */
export const updateQuestion = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<QuestionRequest>;
}): Promise<QuestionResponse> => {
  try {
    const response = await axios.patch<QuestionResponse>(
      `${BASE_URL}/questions/${id}/with-answer`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: false,
      },
    );
    console.log("📡 Question updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating question:", error);
    throw error;
  }
};

/**
 * Delete a question
 */
export const deleteQuestion = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/questions/${id}`, {
      headers: {
        Accept: "application/json",
      },
      withCredentials: false,
    });
    console.log("📡 Question deleted successfully:", id);
  } catch (error) {
    console.error("❌ Error deleting question:", error);
    throw error;
  }
};

/**
 * Bulk create questions for a content
 */
export const createBulkQuestions = async (
  questions: QuestionRequest[],
): Promise<QuestionResponse[]> => {
  try {
    const response = await axios.post<QuestionResponse[]>(
      `${BASE_URL}/questions/bulk`,
      { questions },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: false,
      },
    );
    console.log("📡 Bulk questions created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating bulk questions:", error);
    throw error;
  }
};
