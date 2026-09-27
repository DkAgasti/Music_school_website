import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

function errMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export async function apiGetStudents(params = {}) {
  try {
    const response = await axiosClient.get("/students", { params });
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to fetch students"));
    return null;
  }
}

export async function apiGetStudentById(id) {
  try {
    const response = await axiosClient.get(`/students/${id}`);
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to fetch student"));
    return null;
  }
}

export async function apiGetStudentHistory(id) {
  try {
    const response = await axiosClient.get(`/students/${id}/history`);
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to fetch student history"));
    return null;
  }
}

export async function apiCreateStudent(data) {
  try {
    const response = await axiosClient.post("/students", data);
    toast.success("Student created successfully");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to create student"));
    return null;
  }
}

export async function apiUpdateStudent(id, data) {
  try {
    const response = await axiosClient.patch(`/students/${id}`, data);
    toast.success("Student updated successfully");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to update student"));
    return null;
  }
}

export async function apiDeleteStudent(id) {
  try {
    await axiosClient.delete(`/students/${id}`);
    toast.success("Student deleted");
    return true;
  } catch (error) {
    toast.error(errMessage(error, "Failed to delete student"));
    return false;
  }
}
