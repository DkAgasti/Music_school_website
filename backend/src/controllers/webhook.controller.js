import { prisma } from "../config/db.js";
import { verifyWebhookSignature } from "../services/razorpay.service.js";
import { enrollFromAdmission } from "../services/enrollment.service.js";
import { invalidate } from "../utils/cache.js";

export async function handleRazorpayWebhook(req, res) {
  const signature = req.headers["x-razorpay-signature"];
  const valid = verifyWebhookSignature(req.body, signature);

  if (!valid && process.env.NODE_ENV === "production") {
    return res.status(400).json({ success: false, message: "Invalid webhook signature" });
  }

  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ success: false, message: "Invalid JSON payload" });
  }

  if (event.event === "payment.captured") {
    const paymentEntity = event.payload.payment.entity;
    const orderId = paymentEntity.order_id;

    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: orderId },
      include: {
        admission: { omit: { passwordHash: false } },
        order: true,
      },
    });

    // Already processed — Razorpay retries webhooks and the frontend also
    // calls /payments/verify for the same order, so this can legitimately
    // fire twice. Skip re-running enrollment/stock side effects.
    if (payment && payment.status !== "PAID") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId: paymentEntity.id,
          status: "PAID",
        },
      });

      if (payment.purpose === "ADMISSION" && payment.admission) {
        const { student, enrollment } = await enrollFromAdmission(payment.admission);
        await prisma.admission.update({
          where: { id: payment.admission.id },
          data: { status: "APPROVED" },
        });
        // Link this payment to the student so it shows up in their history.
        await prisma.payment.update({
          where: { id: payment.id },
          data: { studentId: student.id, enrollmentId: enrollment.id },
        });
      }

      if (payment.purpose === "SHOP_ORDER" && payment.order) {
        await prisma.order.update({
          where: { id: payment.order.id },
          data: { status: "PAID" },
        });
        const stockResult = await prisma.product.updateMany({
          where: { id: payment.order.productId, stock: { gte: payment.order.quantity } },
          data: { stock: { decrement: payment.order.quantity } },
        });
        if (stockResult.count === 0) {
          console.error(`Order ${payment.order.id} paid but product ${payment.order.productId} had insufficient stock — needs manual review.`);
        }
        invalidate("shop:products");

        // If the buyer's email matches a student account, link this payment
        // to them so the order shows up in their Payment History too. Case/
        // whitespace insensitive since this is a guest checkout field, not
        // the student's login.
        const student = await prisma.student.findFirst({
          where: { email: { equals: payment.order.buyerEmail.trim(), mode: "insensitive" } },
        });
        if (student) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { studentId: student.id },
          });
        }
      }
    }
  } else if (event.event === "payment.failed") {
    const paymentEntity = event.payload.payment.entity;
    await prisma.payment.updateMany({
      where: { razorpayOrderId: paymentEntity.order_id },
      data: { status: "FAILED" },
    });
  }

  return res.json({ success: true });
}
