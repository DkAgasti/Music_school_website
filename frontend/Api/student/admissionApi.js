import { toast } from "react-toastify";
import studentAxiosClient from "./studentAxiosClient";

// Logged-in student applying to join ANOTHER class — name/email/phone/
// guardian/password are all pulled from the existing account server-side,
// so only classId/batchId/feePlanId need to be sent.
export async function apiApplyForAdditionalClass({ classId, batchId, feePlanId }) {
  try {
    const response = await studentAxiosClient.post("/admissions/mine", { classId, batchId, feePlanId });
    return response.data.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to start enrollment");
    return null;
  }
}
