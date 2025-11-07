import axios from "axios";

export type Content = {
  id: string;
  idSection: string;
  type: string;
  contentUrl: string;
  name: string;
  description: string;
  contentStart: string;
  contentEnd: string;
  sequence: number;
  createdAt?: string;
  updatedAt?: string;
  // Curriculum schedule fields for jadwal_kurikulum type
  idSchedule?: string;
  scheduleName?: string;
  jp?: number;
  scheduleDate?: string;
};

const BASE_URL =
  process.env.NEXT_PUBLIC_COURSE_BASE_URL || "http://localhost:3000";

export const getContents = async (): Promise<Content[]> => {
  const response = await axios.get<Content[]>(`${BASE_URL}/contents`, {
    withCredentials: false,
  });
  console.log(BASE_URL);
  return response.data;
};

export const createContent = async (
  newContent: Omit<Content, "id" | "createdAt" | "updatedAt">,
): Promise<Content> => {
  const response = await axios.post<Content>(
    `${BASE_URL}/contents`,
    newContent,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
};

export const updateContent = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Omit<Content, "id" | "createdAt" | "updatedAt">>;
}): Promise<Content> => {
  const response = await axios.patch<Content>(
    `${BASE_URL}/contents/${id}`,
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
};

export const deleteContent = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/contents/${id}`);
};

export const updateContentsSequence = async (
  updates: Array<{ id: string; sequence: number; idSection: string }>,
): Promise<void> => {
  console.log(
    "📡 Updating contents sequence (one by one):",
    updates.length,
    "items",
  );

  try {
    // Update semua contents secara parallel menggunakan existing endpoint
    await Promise.all(
      updates.map((update) => {
        console.log(
          `  ↳ Updating content ${update.id}: sequence=${update.sequence}, section=${update.idSection}`,
        );

        return axios.patch<Content>(
          `${BASE_URL}/contents/${update.id}`,
          {
            sequence: update.sequence,
            idSection: update.idSection,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }),
    );

    console.log("✅ All contents updated successfully");
  } catch (error: any) {
    console.error("❌ Failed to update contents:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};
