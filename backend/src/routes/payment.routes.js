import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createPaymentOrder, listPayments } from "../controllers/payment.controller.js";

const router = Router();

router.post("/order", createPaymentOrder);
router.get("/", requireAuth, listPayments);

export default router;
