import { toast } from "react-toastify";
import studentAxiosClient from "./studentAxiosClient";

// Creates a Razorpay order for ONE of the logged-in student's enrollments
// (a student may be enrolled in several classes) — the amount is derived
// server-side from that enrollment's fee plan, never sent from the client.
export async function apiCreateFeePaymentOrder(enrollmentId) {
  try {
    const response = await studentAxiosClient.post("/payments/fee-order", { enrollmentId });
    return response.data.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to start payment");
    return null;
  }
}

// Downloads a PDF receipt for one of the logged-in student's own payments.
// The endpoint requires the student's bearer token, so a plain <a href>
// can't be used — fetch as a blob and trigger the save via a temporary link.
export async function apiDownloadReceipt(paymentId) {
  try {
    const response = await studentAxiosClient.get(`/payments/${paymentId}/receipt`, {
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
