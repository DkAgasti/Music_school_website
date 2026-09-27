import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

function errMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

// Public listing — only active classes, active batches, teachers, fee plans.
export async function apiGetClasses() {
  try {
    const response = await axiosClient.get("/classes");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to load classes"));
    return null;
  }
}

export async function apiGetClassBySlug(slug) {
  try {
    const response = await axiosClient.get(`/classes/${slug}`);
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to load class details"));
    return null;
  }
}
