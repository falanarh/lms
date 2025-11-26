import axios from "axios";
import { API_BASE_URL } from "@/config/api";

export type StartActivityRequest = {
  idCourse: string;
  idUser: string;
};

export type StartActivityResponse = any;

export const startActivity = async (
  payload: StartActivityRequest
): Promise<StartActivityResponse> => {
  const url = `${API_BASE_URL}/activities/start`;
  const response = await axios.post(url, payload, {
    headers: { "Content-Type": "application/json" },
    withCredentials: false,
  });
  return response.data;
};

export type CheckEnrollResponse = {
  success: boolean;
  status: number;
  message: string;
  data: boolean | { isEnroll: boolean };
};

export const checkEnroll = async (
  idCourse: string,
  idUser: string
): Promise<CheckEnrollResponse> => {
  const params = new URLSearchParams();
  params.append("idCourse", idCourse);
  params.append("idUser", idUser);
  const url = `${API_BASE_URL}/activities/check-enroll?${params.toString()}`;
  const response = await axios.get(url, { withCredentials: false });
  return response.data as CheckEnrollResponse;
};