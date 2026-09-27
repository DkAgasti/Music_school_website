import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

// Uploads a local image File to Cloudinary via the backend and returns its
// hosted URL (e.g. https://res.cloudinary.com/.../image/upload/...).
export async function apiUploadImage(file, folder = "music-school") {
  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);

    const response = await axiosClient.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.data.url;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to upload image");
    return null;
  }
}
