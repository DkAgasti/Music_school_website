import { toast } from "react-toastify";
import studentAxiosClient from "./studentAxiosClient";
import { setStudentToken } from "@/lib/studentAuth";
import { clearMyProfileCache } from "./studentApi";

export async function apiStudentLogin(email, password) {
  try {
    const response = await studentAxiosClient.post("/auth/student-login", { email, password });
    const { token, student } = response.data.data;
    setStudentToken(token);
    clearMyProfileCache(); // never reuse a previous session's cached profile
    toast.success("Logged in successfully");
    return student;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Invalid email or password");
    return null;
  }
}
