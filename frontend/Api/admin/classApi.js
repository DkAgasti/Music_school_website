import { toast } from "react-toastify";
import axiosClient from "../axiosClient";

function errMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

// NOTE: uses /classes/manage/all (not the bare /classes list) — the bare
// GET /api/classes is shadowed by the public marketing-site route and never
// returns inactive classes or admin fields like batch/fee-plan counts.
export async function apiGetClasses() {
  try {
    const response = await axiosClient.get("/classes/manage/all");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to fetch classes"));
    return null;
  }
}

export async function apiGetClassById(id) {
  try {
    const response = await axiosClient.get(`/classes/manage/${id}`);
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to fetch class"));
    return null;
  }
}

// data may include `teacherIds: string[]` — translated here into the
// Prisma nested-write shape the backend's raw passthrough expects for the
// Class<->Teacher many-to-many relation.
export async function apiCreateClass({ teacherIds, ...rest }) {
  try {
    const payload = { ...rest };
    if (teacherIds?.length) {
      payload.teachers = { connect: teacherIds.map((id) => ({ id })) };
    }
    const response = await axiosClient.post("/classes", payload);
    toast.success("Class created successfully");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to create class"));
    return null;
  }
}

export async function apiUpdateClass(id, { teacherIds, ...rest }) {
  try {
    const payload = { ...rest };
    if (teacherIds !== undefined) {
      payload.teachers = { set: teacherIds.map((tid) => ({ id: tid })) };
    }
    const response = await axiosClient.patch(`/classes/${id}`, payload);
    toast.success("Class updated successfully");
    return response.data.data;
  } catch (error) {
    toast.error(errMessage(error, "Failed to update class"));
    return null;
  }
}

export async function apiDeleteClass(id) {
  try {
    await axiosClient.delete(`/classes/${id}`);
    toast.success("Class deleted");
    return true;
  } catch (error) {
    toast.error(errMessage(error, "Failed to delete class"));
    return false;
  }
}
