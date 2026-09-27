import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

function errMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export async function apiGetDashboardOverview() {
  try {
    const response = await axiosClient.get("/admin/overview");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to load dashboard overview"));
    return null;
  }
}

export async function apiGetFeeStatus({ month, year, status, page, limit } = {}) {
  try {
    const response = await axiosClient.get("/admin/fee-status", {
      params: { month, year, status, page, limit },
    });
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to load fee status"));
    return null;
  }
}

export async function apiSendAllFeeReminders() {
  try {
    const response = await axiosClient.post("/admin/fee-reminders");
    toast.success(response.data.data?.message || "Fee reminders sent");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to send fee reminders"));
    return null;
  }
}
