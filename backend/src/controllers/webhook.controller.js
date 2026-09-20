import { prisma } from "../config/db.js";
import { verifyWebhookSignature } from "../services/razorpay.service.js";

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
      include: { admission: true, order: true },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId: paymentEntity.id,
          status: "PAID",
        },
      });

      if (payment.purpose === "ADMISSION" && payment.admission) {
        const adm = payment.admission;
        const exists = await prisma.student.findUnique({ where: { admissionId: adm.id } });
        if (!exists) {
          await prisma.student.create({
            data: {
              name: adm.studentName,
              dob: adm.dob,
              email: adm.email,
              phone: adm.phone,
              guardianName: adm.guardianName,
              address: adm.address,
              classId: adm.classId,
              batchId: adm.batchId,
              active: true,
              admissionId: adm.id,
            },
          });
        }
        await prisma.admission.update({
          where: { id: adm.id },
          data: { status: "APPROVED" },
        });
      }

      if (payment.purpose === "SHOP_ORDER" && payment.order) {
        await prisma.order.update({
          where: { id: payment.order.id },
          data: { status: "PAID" },
        });
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
