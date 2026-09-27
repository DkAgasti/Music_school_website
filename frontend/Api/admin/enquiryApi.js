import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

function errMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export async function apiGetEnquiries(params = {}) {
  try {
    const response = await axiosClient.get("/enquiries", { params });
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to fetch enquiries"));
    return null;
  }
}

export async function apiToggleEnquiryHandled(id, handled) {
  try {
    const response = await axiosClient.patch(`/enquiries/${id}/handle`, {
      handled,
    });
    toast.success("Enquiry updated");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to update enquiry"));
    return null;
  }
}

export async function apiDeleteEnquiry(id) {
  try {
    await axiosClient.delete(`/enquiries/${id}`);
    toast.success("Enquiry deleted");
    return true;
  } catch (error) {
    toast.error(errMessage(error, "Failed to delete enquiry"));
    return false;
  }
}
