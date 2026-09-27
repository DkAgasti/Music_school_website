import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

export async function apiGetTestimonials() {
  try {
    const response = await axiosClient.get("/testimonials");
    return response.data.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to load testimonials");
    return null;
  }
}
