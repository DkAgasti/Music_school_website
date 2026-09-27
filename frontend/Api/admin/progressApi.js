import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

function errMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export async function apiGetProgress(params = {}) {
  try {
    const response = await axiosClient.get("/progress", { params });
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to fetch progress notes"));
    return null;
  }
}

export async function apiAddProgressNote(data) {
  try {
    const response = await axiosClient.post("/progress", data);
    toast.success("Progress note added");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to add progress note"));
    return null;
  }
}

export async function apiUpdateProgressNote(id, data) {
  try {
    const response = await axiosClient.patch(`/progress/${id}`, data);
    toast.success("Progress note updated");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to update progress note"));
    return null;
  }
}

export async function apiDeleteProgressNote(id) {
  try {
    await axiosClient.delete(`/progress/${id}`);
    toast.success("Progress note deleted");
    return true;
  } catch (error) {
    toast.error(errMessage(error, "Failed to delete progress note"));
    return false;
  }
}
