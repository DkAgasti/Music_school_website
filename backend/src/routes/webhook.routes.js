import { Router } from "express";
import express from "express";
import { handleRazorpayWebhook } from "../controllers/webhook.controller.js";

const router = Router();

// Raw body is required here for Razorpay signature verification.
router.post("/razorpay", express.raw({ type: "application/json" }), handleRazorpayWebhook);

export default router;
