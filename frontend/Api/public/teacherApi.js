import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

export async function apiGetTeachers() {
  try {
    const response = await axiosClient.get("/teachers");
    return response.data.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to load teachers");
    return null;
  }
}
