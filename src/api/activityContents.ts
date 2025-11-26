import axios from "axios";
import { API_BASE_URL } from "@/config/api";

export type StartActivityContentPayload = {
  idCourse: string;
  idUser: string;
  idContent: string;
};

export type FinishActivityContentPayload = {
  idCourse: string;
  idUser: string;
  idContent: string;
  isFinished: boolean;
};

export const startActivityContent = async (
  payload: StartActivityContentPayload
) => {
  const url = `${API_BASE_URL}/activity-contents/start`;
  const res = await axios.post(url, payload);
  return res.data;
};

export const finishActivityContent = async (
  payload: FinishActivityContentPayload
) => {
  const url = `${API_BASE_URL}/activity-contents/finish`;
  const res = await axios.post(url, payload);
  return res.data;
};