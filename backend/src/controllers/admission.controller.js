import { prisma } from "../config/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createOrder } from "../services/razorpay.service.js";
import { sendAdmissionConfirmation } from "../services/email.service.js";

export const createAdmission = asyncHandler(async (req, res) => {
  const { name, email, phone, batchId, amount } = req.body;

  const student = await prisma.student.create({
    data: { name, email, phone, batchId, admission: { create: {} } },
  });

  const order = await createOrder(amount * 100, `admission_${student.id}`);

  await sendAdmissionConfirmation(email, name);

  return ApiResponse(res, 201, { student, razorpayOrder: order });
});

export const listAdmissions = asyncHandler(async (req, res) => {
  const admissions = await prisma.admission.findMany({
    include: { student: { include: { batch: true } } },
    orderBy: { createdAt: "desc" },
  });
  return ApiResponse(res, 200, admissions);
});

export const updateAdmissionStatus = asyncHandler(async (req, res) => {
  const admission = await prisma.admission.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
  });
  return ApiResponse(res, 200, admission);
});
