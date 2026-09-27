import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

function errMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export async function apiGetAdmissions(params = {}) {
  try {
    const response = await axiosClient.get("/admissions", { params });
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to fetch admissions"));
    return null;
  }
}

export async function apiCreateAdmission(data) {
  try {
    const response = await axiosClient.post("/admissions", data);
    toast.success("Admission created successfully");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to create admission"));
    return null;
  }
}

export async function apiGetAdmissionById(id) {
  try {
    const response = await axiosClient.get(`/admissions/${id}`);
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to fetch admission"));
    return null;
  }
}

export async function apiUpdateAdmissionStatus(id, status) {
  try {
    const response = await axiosClient.patch(`/admissions/${id}/status`, { status });
    toast.success("Admission status updated");
    // The endpoint returns { admission, student } — callers here only ever
    // want the flat admission fields (mergeAdmissionUpdate expects them
    // un-nested), same as every other admission endpoint.
    return response.data.data.admission;
  } catch (error) {
    toast.error(errMessage(error, "Failed to update admission status"));
    return null;
  }
}

export async function apiDeleteAdmission(id) {
  try {
    await axiosClient.delete(`/admissions/${id}`);
    toast.success("Admission deleted");
    return true;
  } catch (error) {
    toast.error(errMessage(error, "Failed to delete admission"));
    return false;
  }
}
