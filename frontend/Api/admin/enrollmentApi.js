import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

function errMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

// A batch's roster is an Enrollment list (one row per student in that
// class+batch), not a Student list — a student can be in several batches.
export async function apiGetEnrollments(params = {}) {
  try {
    const response = await axiosClient.get("/enrollments", { params });
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to fetch enrollments"));
    return null;
  }
}

// Admin directly enrolling an existing student into another class — no
// payment step (that's the student-portal / public admission flow).
export async function apiCreateEnrollment(data) {
  try {
    const response = await axiosClient.post("/enrollments", data);
    toast.success("Student enrolled");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to enroll student"));
    return null;
  }
}

export async function apiUpdateEnrollment(id, data) {
  try {
    const response = await axiosClient.patch(`/enrollments/${id}`, data);
    toast.success("Enrollment updated");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to update enrollment"));
    return null;
  }
}
