import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

function errMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

// Generic Razorpay order creation (rarely needed directly — admissions and
// shop orders already create their own order+payment in one call).
export async function apiCreatePaymentOrder(data) {
  try {
    const response = await axiosClient.post("/payments/order", data);
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to start payment"));
    return null;
  }
}

// Call this from the Razorpay checkout success handler to confirm payment
// server-side. Auto-enrolls the student (ADMISSION) or marks the order PAID
// and decrements stock (SHOP_ORDER).
export async function apiVerifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  try {
    const response = await axiosClient.post("/payments/verify", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Payment verification failed"));
    return null;
  }
}
