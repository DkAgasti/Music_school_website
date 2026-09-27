import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

export async function apiGetGalleryImagesPaged({ page = 1, limit = 24, category } = {}) {
  try {
    const response = await axiosClient.get("/gallery", {
      params: { page, limit, ...(category && category !== "All" ? { category } : {}) },
    });
    return response.data.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to load gallery images");
    return null;
  }
}

export async function apiCreateGalleryImage({ url, caption, category, silent = false }) {
  try {
    const response = await axiosClient.post("/gallery", { url, caption, category });
    if (!silent) toast.success("Image added to gallery");
    return response.data.data;
  } catch (error) {
    if (!silent) toast.error(error?.response?.data?.message || "Failed to add image");
    return null;
  }
}

export async function apiDeleteGalleryImage(id) {
  try {
    await axiosClient.delete(`/gallery/${id}`);
    toast.success("Image removed");
    return true;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to remove image");
    return false;
  }
}
