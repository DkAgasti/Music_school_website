import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

function errMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export async function apiGetBatches(classId, extraParams = {}) {
  try {
    const response = await axiosClient.get("/classes/batches/all", {
      params: { ...(classId ? { classId } : {}), ...extraParams },
    });
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to fetch batches"));
    return null;
  }
}

export async function apiCreateBatch(data) {
  try {
    const response = await axiosClient.post("/classes/batches", data);
    toast.success("Batch created successfully");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to create batch"));
    return null;
  }
}

export async function apiUpdateBatch(id, data) {
  try {
    const response = await axiosClient.patch(`/classes/batches/${id}`, data);
    toast.success("Batch updated successfully");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to update batch"));
    return null;
  }
}

export async function apiDeleteBatch(id) {
  try {
    await axiosClient.delete(`/classes/batches/${id}`);
    toast.success("Batch deleted");
    return true;
  } catch (error) {
    toast.error(errMessage(error, "Failed to delete batch"));
    return false;
  }
}
