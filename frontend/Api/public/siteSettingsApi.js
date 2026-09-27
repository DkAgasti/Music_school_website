import axiosClient from "../axiosClient";

// GET /site-content already returns a flat { key: value } map (cached
// server-side). Never toasts — this renders the Navbar/Footer/Contact page,
// so a failed fetch should just fall back to defaults, not interrupt the visitor.
export async function apiGetSiteSettings() {
  try {
    const response = await axiosClient.get("/site-content");
    return response.data.data || {};
  } catch (error) {
    return {};
  }
}
