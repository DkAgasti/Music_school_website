import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createOrder as createRazorpayOrder, verifyPaymentSignature } from "../services/razorpay.service.js";

export const createPaymentOrder = asyncHandler(async (req, res, next) => {
  const { amount, studentId, purpose = "FEE" } = req.body;

  if (!amount || amount <= 0) {
    return next(new ApiError(400, "Valid payment amount is required"));
  }

  const validPurposes = ["ADMISSION", "FEE", "SHOP_ORDER"];
  if (!validPurposes.includes(purpose)) {
    return next(new ApiError(400, `Purpose must be one of: ${validPurposes.join(", ")}`));
  }

  const amountInPaise = Math.round(amount * 100);
  const receipt = `pay_${Date.now().toString().slice(-8)}`;
  const razorpayOrder = await createRazorpayOrder(amountInPaise, receipt);

  const payment = await prisma.payment.create({
    data: {
      amount: amountInPaise,
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      purpose,
      studentId: studentId || null,
      status: "CREATED",
    },
  });

  return ApiResponse(res, 201, { payment, razorpayOrder });
});

export const verifyPayment = asyncHandler(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id) {
    return next(new ApiError(400, "razorpay_order_id and razorpay_payment_id are required"));
  }

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId: razorpay_order_id },
    include: { admission: true, order: true, student: true },
  });

  if (!payment) {
    return next(new ApiError(404, `Payment record not found for order: ${razorpay_order_id}`));
  }

  // Verify signature unless in test/mock mode
  const isMock = razorpay_order_id.startsWith("order_mock_") || !process.env.RAZORPAY_KEY_SECRET;
  if (!isMock && razorpay_signature) {
    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return next(new ApiError(400, "Invalid payment signature verification failed"));
    }
  }

  // Update payment status to PAID
  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "PAID",
      razorpayPaymentId: razorpay_payment_id,
    },
  });

  let enrollmentResult = null;

  // Handle ADMISSION payment: Auto-enroll student
  if (payment.purpose === "ADMISSION" && payment.admission) {
    const admission = payment.admission;
    let student = await prisma.student.findUnique({ where: { admissionId: admission.id } });

    if (!student) {
      student = await prisma.student.create({
        data: {
          name: admission.studentName,
          dob: admission.dob,
          email: admission.email,
          phone: admission.phone,
          guardianName: admission.guardianName,
          address: admission.address,
          classId: admission.classId,
          batchId: admission.batchId,
          active: true,
          admissionId: admission.id,
        },
      });
    }

    await prisma.admission.update({
      where: { id: admission.id },
      data: { status: "APPROVED" },
    });

    enrollmentResult = { studentId: student.id, studentName: student.name };
  }

  // Handle SHOP_ORDER payment: mark Order as PAID
  if (payment.purpose === "SHOP_ORDER" && payment.order) {
    await prisma.order.update({
      where: { id: payment.order.id },
      data: { status: "PAID" },
    });

    // Decrement product stock if > 0
    await prisma.product.update({
      where: { id: payment.order.productId },
      data: { stock: { decrement: payment.order.quantity } },
    }).catch(() => {});
  }

  return ApiResponse(res, 200, {
    verified: true,
    payment: updatedPayment,
    enrollment: enrollmentResult,
    message: "Payment successfully verified and records updated",
  });
});

import { sendFeeReminderEmail } from "../services/email.service.js";

export const listPayments = asyncHandler(async (req, res) => {
  const { purpose, status, studentId } = req.query;

  const where = {};
  if (purpose) where.purpose = purpose;
  if (status) where.status = status;
  if (studentId) where.studentId = studentId;

  const payments = await prisma.payment.findMany({
    where,
    include: {
      student: { select: { id: true, name: true, email: true } },
      order: { select: { id: true, buyerName: true, productId: true, quantity: true } },
      admission: { select: { id: true, studentName: true, classId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return ApiResponse(res, 200, payments);
});

export const sendFeeReminder = asyncHandler(async (req, res, next) => {
  const { studentId, email, name, amount = 2500, dueDate = "1 May 2025" } = req.body;

  let targetEmail = email;
  let targetName = name;

  if (studentId && (!targetEmail || !targetName)) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (student) {
      targetEmail = targetEmail || student.email;
      targetName = targetName || student.name;
    }
  }

  if (!targetEmail) {
    return next(new ApiError(400, "Student email or studentId is required to send reminder"));
  }

  const result = await sendFeeReminderEmail(targetEmail, targetName || "Student", amount, dueDate);

  return ApiResponse(res, 200, {
    success: true,
    message: `Reminder successfully sent to ${targetEmail}`,
    emailResult: result,
  });
});

export const getStudentPayments = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const payments = await prisma.payment.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
  });

  const paidPayments = payments.filter((p) => p.status === "PAID");
  const totalPaidPaise = paidPayments.reduce((acc, p) => acc + p.amount, 0);

  const nextMonthDate = new Date();
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1, 1);
  const nextDueDate = nextMonthDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return ApiResponse(res, 200, {
    studentId,
    totalPaidPaise,
    totalPaidRupees: Math.round(totalPaidPaise / 100),
    pendingDuesRupees: 0,
    nextDueDate,
    transactions: payments.map((p) => ({
      id: p.id,
      date: p.createdAt,
      description: p.purpose === "ADMISSION" ? "Admission Fee" : "Monthly Course Fee",
      amountPaise: p.amount,
      amountRupees: Math.round(p.amount / 100),
      status: p.status === "PAID" ? "Paid" : p.status,
      receiptId: p.razorpayPaymentId || p.razorpayOrderId,
    })),
  });
});


