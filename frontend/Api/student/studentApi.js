import { toast } from "react-toastify";
import studentAxiosClient from "./studentAxiosClient";

// The student portal has 7 pages (Dashboard, Profile, Attendance, Classes,
// Payments, Progress, Admissions) that each independently call this same
// endpoint on mount — without caching, clicking through the sidebar re-runs
// the same slow DB round trip 7 times in one session. Cache the response in
// memory for a short window so navigating between pages is instant; the
// first load of the session still pays the real network cost once.
const CACHE_TTL = 30_000;
let cachedProfile = null;
let cachedAt = 0;
let inFlight = null;

// Returns the logged-in student's full profile: dashboardMetrics,
// enrolledClasses, attendanceReport, progressNotes, paymentsSummary,
// admissions. See backend student.controller.js buildStudentProfileResponse
// for the exact shape.
export async function apiGetMyProfile({ forceRefresh = false } = {}) {
  if (!forceRefresh && cachedProfile && Date.now() - cachedAt < CACHE_TTL) {
    return cachedProfile;
  }
  // If a fetch is already in flight (e.g. two pages mount at once), share
  // it instead of firing a second identical request.
  if (!forceRefresh && inFlight) {
    return inFlight;
  }

  inFlight = (async () => {
    try {
      const response = await studentAxiosClient.get("/students/me");
      cachedProfile = response.data.data;
      cachedAt = Date.now();
      return cachedProfile;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load your profile");
      return null;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

// Call on logout (or after any action that changes the student's own data)
// so the next fetch doesn't serve stale or another student's cached data.
export function clearMyProfileCache() {
  cachedProfile = null;
  cachedAt = 0;
  inFlight = null;
}

// Self-service profile edit — only phone, dob, guardianName, guardianPhone, address, and
// photoUrl are accepted by the backend; everything else is admin-only.
export async function apiUpdateMyProfile(data) {
  try {
    const response = await studentAxiosClient.patch("/students/me", data);
    cachedProfile = response.data.data;
    cachedAt = Date.now();
    toast.success("Profile updated");
    return cachedProfile;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to update profile");
    return null;
  }
}
