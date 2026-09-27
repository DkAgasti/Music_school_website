import { Router } from "express";
import { requireAuth, requireStudentAuth, requireAnyAuth } from "../middleware/auth.js";
import {
  createPaymentOrder,
  createFeePaymentOrder,
  verifyPayment,
  listPayments,
  sendFeeReminder,
  getStudentPayments,
  downloadPaymentReceipt,
} from "../controllers/payment.controller.js";

const router = Router();

router.post("/order", createPaymentOrder);
router.post("/fee-order", requireStudentAuth, createFeePaymentOrder);
router.post("/verify", verifyPayment);
router.get("/", requireAuth, listPayments);
router.get("/student/:studentId", requireAuth, getStudentPayments);
router.post("/remind", requireAuth, sendFeeReminder);
router.get("/:id/receipt", requireAnyAuth, downloadPaymentReceipt);

export default router;


