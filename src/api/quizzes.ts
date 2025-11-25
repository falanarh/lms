import axios from "axios";

export type Quiz = {
  idContent: string;
  idCurriculum?: string;
  curriculum?: string;
  // Primary duration field from API
  durationLimit: number;
  // Optional alias used in some UI components
  timeLimit?: number;
  totalQuestions?: number;
  maxPoint?: number;
  passingScore: number;
  attemptLimit?: number;
  shuffleQuestions: boolean;
  createdBy?: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  // Optional joined content metadata when quiz is fetched together with its content
  content?: {
    idSection?: string;
    type?: string;
    contentUrl?: string;
    name?: string;
    description?: string;
    contentStart?: string;
    contentEnd?: string;
    sequence?: number;
  };
};

export type QuizCreateRequest = {
  idContent?: string;
  idCurriculum?: string;
  curriculum?: string;
  durationLimit: number;
  maxPoint?: number;
  passingScore: number;
  attemptLimit?: number;
  shuffleQuestions: boolean;
  createdBy?: string;
};

export type QuizUpdateRequest = Partial<{
  idCurriculum: string;
  curriculum: string;
  durationLimit: number;
  maxPoint: number;
  passingScore: number;
  attemptLimit: number;
  shuffleQuestions: boolean;
  deleted: boolean;
}>;

const BASE_URL =
  process.env.NEXT_PUBLIC_QUIZ_BASE_URL || "http://localhost:3002";

export const getQuizzes = async (): Promise<Quiz[]> => {
  try {
    const response = await axios.get<Quiz[]>(`${BASE_URL}/quizzes`, {
      headers: {
        Accept: "application/json",
      },
      withCredentials: false,
    });
    console.log("📡 Fetching quizzes from:", BASE_URL);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching quizzes:", error);
    throw error;
  }
};

export const getQuizById = async (id: string): Promise<Quiz> => {
  try {
    const response = await axios.get<Quiz>(`${BASE_URL}/quizzes/${id}`, {
      headers: {
        Accept: "application/json",
      },
      withCredentials: false,
    });
    console.log("ini quiznya: ", response?.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching quiz by ID:", error);
    throw error;
  }
};

export const createQuiz = async (newQuiz: QuizCreateRequest): Promise<Quiz> => {
  try {
    const response = await axios.post<Quiz>(`${BASE_URL}/quizzes`, newQuiz, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: false,
    });
    console.log("📡 Quiz created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating quiz:", error);
    throw error;
  }
};

export const updateQuiz = async ({
  id,
  data,
}: {
  id: string;
  data: QuizUpdateRequest;
}): Promise<Quiz> => {
  try {
    const response = await axios.patch<Quiz>(
      `${BASE_URL}/quizzes/${id}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: false,
      },
    );
    console.log("📡 Updating quiz:", { id, data });
    return response.data;
  } catch (error) {
    console.error("❌ Error updating quiz:", error);
    throw error;
  }
};

export const deleteQuiz = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/quizzes/${id}`, {
      headers: {
        Accept: "application/json",
      },
      withCredentials: false,
    });
    console.log("📡 Deleting quiz:", id);
  } catch (error) {
    console.error("❌ Error deleting quiz:", error);
    throw error;
  }
};

// Combined operations for quiz + content (quiz service handles both tables)
export interface QuizWithContent {
  content: {
    idSection: string;
    type: string;
    contentUrl?: string;
    name: string;
    description?: string;
    contentStart?: string;
    contentEnd?: string;
    sequence: number;
  };
  quiz: QuizCreateRequest;
}

export const createQuizWithContent = async (
  quizWithContent: QuizWithContent,
): Promise<{ content: any; quiz: Quiz }> => {
  try {
    console.log("📡 Creating quiz with content via quiz service");

    // Create single request matching curl example
    const requestData = {
      content: quizWithContent.content,
      ...quizWithContent.quiz,
    };

    console.log("📡 Request data:", JSON.stringify(requestData, null, 2));
    console.log("📡 Request URL:", `${BASE_URL}/quizzes`);

    const response = await axios.post<{ content: any; quiz: Quiz }>(
      `${BASE_URL}/quizzes`,
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: false,
      },
    );

    console.log("📡 Quiz created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error in createQuizWithContent:", error);
    throw error;
  }
};

export const updateQuizWithContent = async ({
  id,
  data,
}: {
  id: string;
  data: QuizWithContent;
}) => {
  try {
    console.log(
      "📡 Updating quiz with content via quiz service - Step 1: Update content",
    );

    // Step 1: Update content first
    const contentResponse = await axios.patch<any>(
      `${BASE_URL}/contents/${id}`,
      data.content,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: false,
      },
    );

    console.log("📡 Content updated:", contentResponse.data);

    // Step 2: Update quiz
    const quizResponse = await axios.patch<Quiz>(
      `${BASE_URL}/quizzes/${id}`,
      data.quiz,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: false,
      },
    );

    console.log("📡 Quiz updated successfully:", quizResponse.data);
    return quizResponse.data;
  } catch (error) {
    console.error("❌ Error in updateQuizWithContent:", error);
    throw error;
  }
};
