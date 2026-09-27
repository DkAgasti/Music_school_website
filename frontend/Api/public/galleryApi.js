import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

export async function apiGetGalleryImages(category) {
  try {
    const response = await axiosClient.get("/gallery", {
      params: category && category !== "All" ? { category } : {},
    });
    return response.data.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to load gallery images");
    return null;
  }
}
