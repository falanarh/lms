import axios from "axios";
import { API_BASE_URL } from "@/config/api";

export type SectionContentUserStatus = {
  isFinished: boolean;
  hasAccess?: boolean;
};

export type SectionContentActivity = {
  isFinished?: boolean;
};

export type SectionContentItem = {
  id: string;
  type: string;
  name: string;
  description: string;
  contentUrl: string;
  contentStart: string | null;
  contentEnd: string | null;
  sequence: number;
  activityContents: SectionContentActivity[];
  userStatus?: SectionContentUserStatus;
};

export type SectionItem = {
  id: string;
  name: string;
  description: string;
  sequence: number;
  listContent: SectionContentItem[];
};

export type SectionContentData = {
  id: string;
  idTeacher: string;
  zoomUrl?: string | null;
  listSection: SectionItem[];
};

export type SectionContentResponse = {
  data: SectionContentData;
};

export const getSectionContent = async (
  courseId: string,
  userId: string
): Promise<SectionContentResponse> => {
  const url = `${API_BASE_URL}/courses/${courseId}/sections-contents/${userId}`;
  const response = await axios.get(url);
  return response.data as SectionContentResponse;
};
