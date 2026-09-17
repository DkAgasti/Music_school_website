import crypto from "crypto";
import { razorpay } from "../config/razorpay.js";

export async function createOrder(amountInPaise, receipt) {
  return razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt,
  });
}

export function verifyWebhookSignature(rawBody, signature) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature || ""));
}
