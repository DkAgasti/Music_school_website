import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

// Requires: name, email, message (optional: phone)
export async function apiSubmitEnquiry(data) {
  try {
    const response = await axiosClient.post("/enquiries", data);
    toast.success("Your message has been sent!");
    return response.data.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to send your message");
    return null;
  }
}
