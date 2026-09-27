import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

// GET /site-content returns a flat { key: value } map directly.
export async function apiGetSiteSettings() {
  try {
    const response = await axiosClient.get("/site-content");
    return response.data.data || {};
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to load site settings");
    return null;
  }
}

// Upserts a single key. The backend stores SiteContent as flat key/value
// rows, so saving the whole settings form fires one of these per changed key.
export async function apiUpdateSiteSetting(key, value) {
  try {
    const response = await axiosClient.post("/site-content", { key, value });
    return response.data.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || `Failed to save "${key}"`);
    return null;
  }
}
