import axios from "axios";
import { getToken, clearToken } from "@/lib/auth";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api`;

const axiosClient = axios.create({
  baseURL: BASE_URL,
});

axiosClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      clearToken();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
