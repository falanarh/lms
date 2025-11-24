import axios from "axios";

export type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "ESSAY" | "SHORT_ANSWER";

export interface QuestionRequest {
  name: string;
  description?: string;
  questionType: QuestionType;
  questionText: string;
  maxScore: number;
  optionsText?: string[];
  answer: {
    answer: string;
    codeAnswer?: string | null;
  };
}

export interface Answer {
  id: string;
  answer: string;
  codeAnswer: string;
}

export interface MasterQuestion {
  id: string;
  name: string;
  description?: string;
  idQuestionTag?: string | null;
  maxScore: number;
  questionText: string;
  questionType: QuestionType;
  optionsCode?: string[];
  optionsText?: string[];
  answer: Answer; // Single answer object, not array
  createdAt: string;
  updatedAt: string;
}

export interface MasterQuestionResponse {
  id: string;
  name: string;
  description?: string;
  idQuestionTag?: string | null;
  maxScore: number;
  questionText: string;
  questionType: QuestionType;
  optionsCode?: string[];
  optionsText?: string[];
  answer: Answer; // Single answer object, not array
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

export interface MasterQuestionsListResponse {
  data: MasterQuestionResponse[];
  pageMeta: PageMeta;
}

const BASE_URL = process.env.NEXT_PUBLIC_QUIZ_BASE_URL || "http://localhost:3002";

/**
 * Creates a master question with correct answer
 * Based on the curl example: POST /api/v1/master-questions/with-correct-answer
 */
export const createMasterQuestion = async (
  questionData: QuestionRequest
): Promise<MasterQuestionResponse> => {
  try {
    console.log("📡 Creating master question with data:", JSON.stringify(questionData, null, 2));
    console.log("📡 Sending request to:", `${BASE_URL}/api/v1/master-questions/with-correct-answer`);

    const response = await axios.post<MasterQuestionResponse>(
      `${BASE_URL}/api/v1/master-questions/with-correct-answer`,
      questionData,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: false,
      }
    );

    console.log("📡 Response status:", response.status);
    console.log("📡 Master question created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating master question:", error);
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
export const getMasterQuestions = async (
  page: number = 1,
  perPage: number = 10
): Promise<MasterQuestionsListResponse> => {
  try {
    const response = await axios.get<MasterQuestionsListResponse>(
      `${BASE_URL}/api/v1/master-questions?page=${page}&perPage=${perPage}`,
      {
        headers: {
          Accept: "application/json",
        },
        withCredentials: false,
      }
    );

    return response.data;
  } catch (error) {
    console.error("❌ Error fetching questions:", error);
    throw error;
  }
};

/**
 * Get a specific question by ID
 */
export const getMasterQuestionById = async (id: string): Promise<MasterQuestionResponse> => {
  try {
    const response = await axios.get<MasterQuestionResponse>(
      `${BASE_URL}/api/v1/master-questions/${id}`,
      {
        headers: {
          Accept: "application/json",
        },
        withCredentials: false,
      }
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
export const updateMasterQuestion = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<QuestionRequest>;
}): Promise<MasterQuestionResponse> => {
  try {
    const response = await axios.patch<MasterQuestionResponse>(
      `${BASE_URL}/api/v1/master-questions/${id}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: false,
      }
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
export const deleteMasterQuestion = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/api/v1/master-questions/${id}`, {
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
