import { prisma } from "../config/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createOrder as createRazorpayOrder } from "../services/razorpay.service.js";

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount, studentId, orderId } = req.body;

  const razorpayOrder = await createRazorpayOrder(amount * 100, `payment_${Date.now()}`);

  const payment = await prisma.payment.create({
    data: {
      razorpayOrderId: razorpayOrder.id,
      amount: amount * 100,
      studentId,
      orderId,
    },
  });

  return ApiResponse(res, 201, { payment, razorpayOrder });
});

export const listPayments = asyncHandler(async (req, res) => {
  const payments = await prisma.payment.findMany({
    include: { student: true, order: true },
    orderBy: { createdAt: "desc" },
  });
  return ApiResponse(res, 200, payments);
});
