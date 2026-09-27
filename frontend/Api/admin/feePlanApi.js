import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

function errMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export async function apiGetFeePlans(classId) {
  try {
    const response = await axiosClient.get("/fee-plans", {
      params: classId ? { classId } : {},
    });
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to fetch fee plans"));
    return null;
  }
}

export async function apiCreateFeePlan(data) {
  try {
    const response = await axiosClient.post("/fee-plans", data);
    toast.success("Fee plan created successfully");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to create fee plan"));
    return null;
  }
}

export async function apiUpdateFeePlan(id, data) {
  try {
    const response = await axiosClient.patch(`/fee-plans/${id}`, data);
    toast.success("Fee plan updated successfully");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to update fee plan"));
    return null;
  }
}

export async function apiDeleteFeePlan(id) {
  try {
    await axiosClient.delete(`/fee-plans/${id}`);
    toast.success("Fee plan deleted");
    return true;
  } catch (error) {
    toast.error(errMessage(error, "Failed to delete fee plan"));
    return false;
  }
}
