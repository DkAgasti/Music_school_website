import { toast } from "react-toastify";
import axiosClient from "../axiosClient";
import { setToken } from "@/lib/auth";

function errMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export async function apiLogin(email, password) {
  try {
    const response = await axiosClient.post("/auth/login", { email, password });
    const { token, admin } = response.data.data;
    setToken(token);
    toast.success("Logged in successfully");
    return admin;
  } catch (error) {
    toast.error(errMessage(error, "Invalid email or password"));
    return null;
  }
}

export async function apiGetMe() {
  try {
    const response = await axiosClient.get("/auth/me");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to fetch admin profile"));
    return null;
  }
}

export async function apiChangePassword(currentPassword, newPassword) {
  try {
    const response = await axiosClient.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    toast.success("Password updated successfully");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to change password"));
    return null;
  }
}

export async function apiForgotPassword(email) {
  try {
    const response = await axiosClient.post("/auth/forgot-password", { email });
    toast.success("If an account exists, an OTP has been sent to it");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to send OTP"));
    return null;
  }
}

export async function apiResetPassword(email, otp, newPassword) {
  try {
    const response = await axiosClient.post("/auth/reset-password", {
      email,
      otp,
      newPassword,
    });
    toast.success("Password reset successfully");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to reset password"));
    return null;
  }
}
