import axios from "axios";
import { getStudentToken, clearStudentToken } from "@/lib/studentAuth";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api`;

// Separate instance from Api/axiosClient.js on purpose — it attaches the
// STUDENT token (lib/studentAuth), never the admin token, so an admin and a
// student session in the same browser can never bleed into each other.
const studentAxiosClient = axios.create({
  baseURL: BASE_URL,
});

studentAxiosClient.interceptors.request.use((config) => {
  const token = getStudentToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

studentAxiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      clearStudentToken();
      if (!window.location.pathname.startsWith("/student-login")) {
        window.location.href = "/student-login";
      }
    }
    return Promise.reject(error);
  }
);

export default studentAxiosClient;
