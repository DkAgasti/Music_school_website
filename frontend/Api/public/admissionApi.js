import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

// Requires: studentName, phone, email, classId, batchId, feePlanId
// (optional: dob, guardianName, address). Also creates a Razorpay order +
// Payment record server-side. Returns { admission, payment, razorpayOrder, razorpayKey }.
export async function apiSubmitAdmission(data) {
  try {
    const response = await axiosClient.post("/admissions", data);
    return response.data.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to submit admission");
    return null;
  }
}
