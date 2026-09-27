import { toast } from "react-toastify";
import studentAxiosClient from "./studentAxiosClient";

// Shared with the admin upload endpoint (backend accepts either an admin or
// a student bearer token) — uploads a local image File to Cloudinary and
// returns its hosted URL.
export async function apiUploadStudentImage(file, folder = "students") {
  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);

    const response = await studentAxiosClient.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.data.url;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to upload photo");
    return null;
  }
}
