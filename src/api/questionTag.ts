import axios from "axios";
import { PageMeta } from "./review";

export type QuestionTags = {
  id: string;
  name: string;
  detail: string;
  createdAt: string;
  updatedAt: string;
};

export type QuestionTagsResponse = {
  data: QuestionTags[];
  pageMeta: PageMeta;
};

export type CreateQuestionTagRequest = {
  name: string;
  detail?: string;
};

export type GetQuestionTagsParams = {
  search?: string;
  page?: number;
  perPage?: number;
};

const BASE_URL =
  process.env.NEXT_PUBLIC_QUIZ_BASE_URL || "http://localhost:3000";

/**
 * Get question tags with optional search and pagination
 * Supports searching by name with case-insensitive mode
 */
export const getQuestionTags = async (
  params: GetQuestionTagsParams = {},
): Promise<QuestionTagsResponse> => {
  const { search, page = 1, perPage = 20 } = params;

  const queryParams = new URLSearchParams();

  // Add search parameters if search query exists
  if (search && search.trim()) {
    queryParams.append("name[contains]", search.trim());
    queryParams.append("name[mode]", "insensitive");
  }

  // Add pagination parameters
  queryParams.append("page", page.toString());
  queryParams.append("perPage", perPage.toString());

  const url = `${BASE_URL}/question-tags?${queryParams.toString()}`;

  console.log("📡 Fetching question tags from:", url);

  const response = await axios.get<QuestionTagsResponse>(url, {
    headers: {
      Accept: "application/json",
    },
  });

  console.log("📡 Question tags fetched:", response.data);
  return response.data;
};

/**
 * Create a new question tag
 */
export const createQuestionTag = async (
  data: CreateQuestionTagRequest,
): Promise<QuestionTags> => {
  try {
    console.log("📡 Creating question tag:", data);

    const response = await axios.post<QuestionTags>(
      `${BASE_URL}/question-tags`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    console.log("📡 Question tag created:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating question tag:", error);
    throw error;
  }
};
