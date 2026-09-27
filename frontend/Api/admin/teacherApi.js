import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

function errMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export async function apiGetTeachers() {
  try {
    const response = await axiosClient.get("/teachers/manage/all");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to fetch teachers"));
    return null;
  }
}

// data: { name, bio, photoUrl }
// Which classes a teacher teaches is assigned from the Classes admin page
// (a Teacher(s) dropdown per class), not from here.
export async function apiCreateTeacher(data) {
  try {
    const response = await axiosClient.post("/teachers", data);
    toast.success("Teacher added successfully");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to add teacher"));
    return null;
  }
}

export async function apiUpdateTeacher(id, data) {
  try {
    const response = await axiosClient.patch(`/teachers/${id}`, data);
    toast.success("Teacher updated successfully");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to update teacher"));
    return null;
  }
}

export async function apiDeleteTeacher(id) {
  try {
    await axiosClient.delete(`/teachers/${id}`);
    toast.success("Teacher deleted");
    return true;
  } catch (error) {
    toast.error(errMessage(error, "Failed to delete teacher"));
    return false;
  }
}
