import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createPaymentOrder,
  verifyPayment,
  listPayments,
  sendFeeReminder,
  getStudentPayments,
} from "../controllers/payment.controller.js";

const router = Router();

router.post("/order", createPaymentOrder);
router.post("/verify", verifyPayment);
router.get("/", requireAuth, listPayments);
router.get("/student/:studentId", getStudentPayments);
router.post("/remind", requireAuth, sendFeeReminder);

export default router;


