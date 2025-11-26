import axios from "axios";

export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "ESSAY"
  | "SHORT_ANSWER";

export interface QuestionRequest {
  name: string;
  description?: string;
  questionType: QuestionType;
  questionText: string;
  maxScore?: number; // Made optional since it's not in response
  idQuestionTag?: string; // Add tag ID
  optionsText?: string[];
  optionsCode?: string[];
  shuffleOptions?: boolean;
  answer: {
    answer: string;
    codeAnswer?: string | null;
  };
}

export interface Answer {
  id: string;
  answer: string;
  codeAnswer: string | null;
}

export interface QuestionTag {
  id: string;
  name: string;
  detail: string;
}

export interface MasterQuestionResponse {
  id: string;
  name: string;
  description: string;
  questionType: QuestionType;
  questionText: string;
  optionsCode: string[];
  optionsText: string[];
  shuffleOptions: boolean;
  masterAnswer: Answer;
  questionTag: QuestionTag | null; // Changed from 'tag' to 'questionTag'
  // Note: maxScore is not in the API response, will need to handle separately if needed
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

export interface GetMasterQuestionsParams {
  page?: number;
  perPage?: number;
  search?: string;
  type?: QuestionType;
  tagId?: string;
  tagName?: string;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_QUIZ_BASE_URL || "http://localhost:3002";

/**
 * Creates a master question with correct answer
 * POST /master-questions/with-correct-answer
 */
export const createMasterQuestion = async (
  questionData: QuestionRequest,
): Promise<MasterQuestionResponse> => {
  try {
    console.log(
      "📡 Creating master question with data:",
      JSON.stringify(questionData, null, 2),
    );

    const response = await axios.post<MasterQuestionResponse>(
      `${BASE_URL}/master-questions/with-correct-answer`,
      questionData,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: false,
      },
    );

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
      });
      // Throw a more user-friendly error message
      throw new Error(
        error.response?.data?.message ||
          `Failed to create question: ${error.message}`,
      );
    }
    throw error;
  }
};

/**
 * Get all master questions with pagination, search, and filters
 * GET /master-questions
 */
export const getMasterQuestions = async (
  params: GetMasterQuestionsParams = {},
): Promise<MasterQuestionsListResponse> => {
  try {
    const { page = 1, perPage = 20, search, type, tagId, tagName } = params;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("perPage", perPage.toString());

    // Add search parameter if provided
    if (search && search.trim()) {
      queryParams.append("name[contains]", search.trim());
      queryParams.append("name[mode]", "insensitive");
    }

    // Add type filter if provided
    if (type) {
      queryParams.append("questionType", type);
    }

    // Add tag filter if provided
    if (tagId) {
      queryParams.append("idQuestionTag", tagId);
    }

    if (tagName && tagName.trim()) {
      queryParams.append("questionTag[name][contains]", tagName.trim());
      queryParams.append("questionTag[mode][mode]", "insensitive");
    }

    const url = `${BASE_URL}/master-questions?${queryParams.toString()}`;
    console.log("📡 Fetching master questions from:", url);

    const response = await axios.get<MasterQuestionsListResponse>(url, {
      headers: {
        Accept: "application/json",
      },
      withCredentials: false,
    });

    console.log("📡 Master questions fetched:", {
      total: response.data.pageMeta.totalResultCount,
      page: response.data.pageMeta.page,
      resultsCount: response.data.data.length,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error fetching master questions:", error);
    throw error;
  }
};

/**
 * Get a specific master question by ID
 * GET /master-questions/:id
 */
export const getMasterQuestionById = async (
  id: string,
): Promise<MasterQuestionResponse> => {
  try {
    const response = await axios.get<MasterQuestionResponse>(
      `${BASE_URL}/master-questions/${id}`,
      {
        headers: {
          Accept: "application/json",
        },
        withCredentials: false,
      },
    );
    console.log("📡 Master question fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching master question by ID:", error);
    throw error;
  }
};

/**
 * Update a master question
 * PATCH /master-questions/:id/with-answer
 */
export const updateMasterQuestion = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<QuestionRequest>;
}): Promise<MasterQuestionResponse> => {
  try {
    console.log("📡 Updating master question:", id, data);

    const response = await axios.patch<MasterQuestionResponse>(
      `${BASE_URL}/master-questions/${id}/with-answer`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: false,
      },
    );

    console.log("📡 Master question updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating master question:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to update question: ${error.message}`,
      );
    }
    throw error;
  }
};

/**
 * Delete a master question
 * DELETE /master-questions/:id
 */
export const deleteMasterQuestion = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/master-questions/${id}`, {
      headers: {
        Accept: "application/json",
      },
      withCredentials: false,
    });
    console.log("📡 Master question deleted successfully:", id);
  } catch (error) {
    console.error("❌ Error deleting master question:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to delete question: ${error.message}`,
      );
    }
    throw error;
  }
};
