import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  markAttendance,
  markBulkAttendance,
  listAttendance,
  getStudentAttendanceStats,
} from "../controllers/attendance.controller.js";

const router = Router();

router.get("/", requireAuth, listAttendance);
router.post("/", requireAuth, markAttendance);
router.post("/bulk", requireAuth, markBulkAttendance);
router.get("/student/:studentId/stats", getStudentAttendanceStats);


export default router;
