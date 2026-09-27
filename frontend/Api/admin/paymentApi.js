import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

function errMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export async function apiGetPayments(params = {}) {
  try {
    const response = await axiosClient.get("/payments", { params });
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to fetch payments"));
    return null;
  }
}

export async function apiGetStudentPayments(studentId) {
  try {
    const response = await axiosClient.get(`/payments/student/${studentId}`);
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to fetch student payments"));
    return null;
  }
}

// Downloads a PDF receipt for any student's payment. The endpoint requires
// the admin's bearer token, so a plain <a href> can't be used — fetch as a
// blob and trigger the save via a temporary link.
export async function apiDownloadReceipt(paymentId) {
  try {
    const response = await axiosClient.get(`/payments/${paymentId}/receipt`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${paymentId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    toast.error("Failed to download receipt");
    return false;
  }
}

export async function apiSendFeeReminder(data) {
  try {
    const response = await axiosClient.post("/payments/remind", data);
    toast.success(response.data.data?.message || "Reminder sent");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to send reminder"));
    return null;
  }
}
