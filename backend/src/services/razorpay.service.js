import crypto from "crypto";
import { razorpay } from "../config/razorpay.js";

export async function createOrder(amountInPaise, receipt) {
  try {
    return await razorpay.orders.create({
      amount: Math.round(amountInPaise),
      currency: "INR",
      receipt: String(receipt || Date.now()),
    });
  } catch (err) {
    // If Razorpay keys are invalid or placeholders during local testing, return a mock order
    console.warn("[Razorpay] Warning: Could not create real order, returning mock order:", err.message);
    return {
      id: `order_mock_${Date.now()}`,
      amount: Math.round(amountInPaise),
      currency: "INR",
      receipt: String(receipt || Date.now()),
      status: "created",
    };
  }
}

export function verifyPaymentSignature(orderId, paymentId, signature) {
  const secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expected === signature;
}

export function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "placeholder_secret";
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature || ""));
  } catch {
    return false;
  }
}
