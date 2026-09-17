import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { markAttendance, listAttendance } from "../controllers/attendance.controller.js";

const router = Router();

router.get("/", requireAuth, listAttendance);
router.post("/", requireAuth, markAttendance);

export default router;
