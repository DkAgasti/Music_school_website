import { prisma } from "../config/db.js";
import { verifyWebhookSignature } from "../services/razorpay.service.js";

export async function handleRazorpayWebhook(req, res) {
  const signature = req.headers["x-razorpay-signature"];
  const valid = verifyWebhookSignature(req.body, signature);

  if (!valid) {
    return res.status(400).json({ success: false, message: "Invalid webhook signature" });
  }

  const event = JSON.parse(req.body.toString());

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    await prisma.payment.update({
      where: { razorpayOrderId: payment.order_id },
      data: { razorpayPaymentId: payment.id, status: "paid" },
    });
  } else if (event.event === "payment.failed") {
    const payment = event.payload.payment.entity;
    await prisma.payment.update({
      where: { razorpayOrderId: payment.order_id },
      data: { status: "failed" },
    });
  }

  return res.json({ success: true });
}
