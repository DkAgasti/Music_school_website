import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

function errMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export async function apiGetAttendance(params = {}) {
  try {
    const response = await axiosClient.get("/attendance", { params });
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to fetch attendance"));
    return null;
  }
}

export async function apiMarkAttendance(enrollmentId, date, status) {
  try {
    const response = await axiosClient.post("/attendance", { enrollmentId, date, status });
    toast.success("Attendance marked");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to mark attendance"));
    return null;
  }
}

export async function apiMarkBulkAttendance(date, records) {
  try {
    const response = await axiosClient.post("/attendance/bulk", { date, records });
    toast.success(`Attendance saved for ${response.data.data.savedCount} students`);
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to save bulk attendance"));
    return null;
  }
}

export async function apiGetStudentAttendanceStats(studentId) {
  try {
    const response = await axiosClient.get(`/attendance/student/${studentId}/stats`);
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to fetch attendance stats"));
    return null;
  }
}
