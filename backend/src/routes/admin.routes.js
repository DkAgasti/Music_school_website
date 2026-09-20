import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getDashboardOverview,
  getFeeStatusOverview,
  sendAllFeeReminders,
} from "../controllers/admin.controller.js";

const router = Router();

router.get("/overview", requireAuth, getDashboardOverview);
router.get("/fee-status", requireAuth, getFeeStatusOverview);
router.post("/fee-reminders", requireAuth, sendAllFeeReminders);

export default router;


