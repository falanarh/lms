import axios from "axios";

export type MasterContent = {
  id: string;
  type: string;
  contentUrl: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
};

const BASE_URL =
  process.env.NEXT_PUBLIC_COURSE_BASE_URL || "http://localhost:3000";

export const getMasterContents = async (
  page: number = 1,
  perPage: number = 10,
  searchQuery?: string,
  type?: string
): Promise<{
  data: MasterContent[];
  pageMeta: {
    page: number;
    perPage: number;
    hasPrev: boolean;
    hasNext: boolean;
    totalPageCount: number;
    showingFrom: number;
    showingTo: number;
    resultCount: number;
    totalResultCount: number;
  };
}> => {
  const params = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
  });

  // Add search parameters if search query is provided
  if (searchQuery && searchQuery.trim()) {
    params.append('name[contains]', searchQuery.trim());
    params.append('name[mode]', 'insensitive');
  }

  // Add type filter if provided
  if (type && type.trim()) {
    params.append('type', type.trim());
  }

  const response = await axios.get<{
    data: MasterContent[];
    pageMeta: {
      page: number;
      perPage: number;
      hasPrev: boolean;
      hasNext: boolean;
      totalPageCount: number;
      showingFrom: number;
      showingTo: number;
      resultCount: number;
      totalResultCount: number;
    };
  }>(`${BASE_URL}/master-contents?${params}`, {
    withCredentials: false,
  });

  return {
    data: response.data.data,
    pageMeta: response.data.pageMeta,
  };
};

export const createMasterContent = async (
  newContent: Omit<MasterContent, "id" | "createdAt" | "updatedAt">,
): Promise<MasterContent> => {
  const response = await axios.post<MasterContent>(
    `${BASE_URL}/master-contents`,
    newContent,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
};

export const updateMasterContent = async (
  id: string,
  updatedContent: Partial<Omit<MasterContent, "id" | "createdAt" | "updatedAt">>,
): Promise<MasterContent> => {
  const response = await axios.patch<MasterContent>(
    `${BASE_URL}/master-contents/${id}`,
    updatedContent,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
};

export const deleteMasterContent = async (
  id: string,
): Promise<void> => {
  await axios.delete(`${BASE_URL}/master-contents/${id}`);
};
