import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createOrder as createRazorpayOrder, verifyPaymentSignature } from "../services/razorpay.service.js";
import { renderInvoicePdf } from "../services/invoice.service.js";
import { enrollFromAdmission } from "../services/enrollment.service.js";
import { invalidate } from "../utils/cache.js";

export const createPaymentOrder = asyncHandler(async (req, res, next) => {
  const { amount, studentId, purpose = "FEE" } = req.body;

  if (!amount || amount <= 0) {
    return next(new ApiError(400, "Valid payment amount is required"));
  }

  const validPurposes = ["ADMISSION", "FEE", "SHOP_ORDER"];
  if (!validPurposes.includes(purpose)) {
    return next(new ApiError(400, `Purpose must be one of: ${validPurposes.join(", ")}`));
  }

  if (studentId) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return next(new ApiError(404, "Student not found"));
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

// Self-service "Pay Fees" from the student portal, for ONE specific
// enrollment (a student may now be enrolled in several classes). Unlike
// createPaymentOrder above (public, client-supplied amount — used by the
// anonymous admission flow), this derives the amount server-side from the
// enrollment's own fee plan, and confirms the enrollment actually belongs
// to the requesting student, so a logged-in student can't spoof another
// student's enrollment or pay an arbitrary amount.
export const createFeePaymentOrder = asyncHandler(async (req, res, next) => {
  const { enrollmentId } = req.body;
  if (!enrollmentId) return next(new ApiError(400, "enrollmentId is required"));

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { feePlan: true, class: true },
  });

  if (!enrollment || enrollment.studentId !== req.student.id || !enrollment.active) {
    return next(new ApiError(404, "Enrollment not found"));
  }

  if (!enrollment.feePlan) {
    return next(new ApiError(400, "No fee plan is set up for this class yet. Please contact the school."));
  }

  const amountInPaise = enrollment.feePlan.amount;
  const receipt = `fee_${Date.now().toString().slice(-8)}`;
  const razorpayOrder = await createRazorpayOrder(amountInPaise, receipt);

  const payment = await prisma.payment.create({
    data: {
      amount: amountInPaise,
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      purpose: "FEE",
      studentId: req.student.id,
      enrollmentId: enrollment.id,
      status: "CREATED",
    },
  });

  return ApiResponse(res, 201, {
    payment,
    razorpayOrder,
    razorpayKey: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  });
});

export const verifyPayment = asyncHandler(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id) {
    return next(new ApiError(400, "razorpay_order_id and razorpay_payment_id are required"));
  }

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId: razorpay_order_id },
    include: {
      admission: { omit: { passwordHash: false } },
      order: true,
      student: true,
    },
  });

  if (!payment) {
    return next(new ApiError(404, `Payment record not found for order: ${razorpay_order_id}`));
  }

  // Already processed (e.g. a retried/duplicate verify call) — return the
  // existing result instead of re-running enrollment/stock side effects.
  if (payment.status === "PAID") {
    return ApiResponse(res, 200, {
      verified: true,
      payment,
      enrollment: null,
      message: "Payment already verified",
    });
  }

  // Verify signature unless in test/mock mode. This must not be skippable by
  // simply omitting razorpay_signature — without it, anyone who knows a
  // razorpayOrderId could mark that payment PAID for free.
  const isMock = razorpay_order_id.startsWith("order_mock_") || !process.env.RAZORPAY_KEY_SECRET;
  if (!isMock) {
    if (!razorpay_signature) {
      return next(new ApiError(400, "razorpay_signature is required"));
    }
    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return next(new ApiError(400, "Invalid payment signature verification failed"));
    }
  }

  // Update payment status to PAID
  let updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "PAID",
      razorpayPaymentId: razorpay_payment_id,
    },
  });

  let enrollmentResult = null;

  // Handle ADMISSION payment: Auto-enroll student
  if (payment.purpose === "ADMISSION" && payment.admission) {
    const { student, enrollment } = await enrollFromAdmission(payment.admission);

    await prisma.admission.update({
      where: { id: payment.admission.id },
      data: { status: "APPROVED" },
    });

    // Link this payment to the (newly or already) enrolled student so it
    // shows up in their payment history / totals.
    updatedPayment = await prisma.payment.update({
      where: { id: updatedPayment.id },
      data: { studentId: student.id, enrollmentId: enrollment.id },
    });

    enrollmentResult = { studentId: student.id, studentName: student.name };
  }

  // Handle SHOP_ORDER payment: mark Order as PAID
  if (payment.purpose === "SHOP_ORDER" && payment.order) {
    await prisma.order.update({
      where: { id: payment.order.id },
      data: { status: "PAID" },
    });

    // Atomic, guarded decrement — a plain `update` can't prevent two
    // concurrent orders for the last unit both succeeding and driving stock
    // negative. `updateMany` with a `gte` guard only actually decrements if
    // enough stock is still there.
    const stockResult = await prisma.product.updateMany({
      where: { id: payment.order.productId, stock: { gte: payment.order.quantity } },
      data: { stock: { decrement: payment.order.quantity } },
    });
    if (stockResult.count === 0) {
      console.error(`Order ${payment.order.id} paid but product ${payment.order.productId} had insufficient stock — needs manual review.`);
    }
    invalidate("shop:products");

    // If the buyer's email matches a student account, link this payment to
    // them so the order shows up in their Payment History too. Case/whitespace
    // insensitive since this is a guest checkout field, not the student's login.
    const buyerStudent = await prisma.student.findFirst({
      where: { email: { equals: payment.order.buyerEmail.trim(), mode: "insensitive" } },
    });
    if (buyerStudent) {
      updatedPayment = await prisma.payment.update({
        where: { id: updatedPayment.id },
        data: { studentId: buyerStudent.id },
      });
    }
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
  const { purpose, status, studentId, ids, page, limit } = req.query;

  const where = {};
  if (purpose) where.purpose = purpose;
  if (status) where.status = status;
  if (studentId) where.studentId = studentId;
  // Lets a caller (e.g. the Fees page enriching a specific page of rows with
  // real receipt numbers) fetch exactly the payments it needs instead of the
  // entire matching set.
  if (ids) where.id = { in: String(ids).split(",").filter(Boolean) };

  // No `page` param → unpaginated array, kept for any existing caller
  // (including the `ids` lookup above, which is already naturally small).
  const isPaginated = page !== undefined;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, email: true } },
        order: { select: { id: true, buyerName: true, productId: true, quantity: true } },
        admission: { select: { id: true, studentName: true, classId: true } },
      },
      orderBy: { createdAt: "desc" },
      ...(isPaginated ? { skip: (pageNum - 1) * pageSize, take: pageSize } : {}),
    }),
    isPaginated ? prisma.payment.count({ where }) : Promise.resolve(null),
  ]);

  if (!isPaginated) return ApiResponse(res, 200, payments);

  return ApiResponse(res, 200, {
    items: payments,
    total,
    page: pageNum,
    limit: pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
});

export const sendFeeReminder = asyncHandler(async (req, res, next) => {
  const { enrollmentId } = req.body;
  if (!enrollmentId) return next(new ApiError(400, "enrollmentId is required to send a reminder"));

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      student: { select: { name: true, email: true } },
      class: { select: { name: true, feePlans: { take: 1, orderBy: { amount: "asc" } } } },
      feePlan: true,
    },
  });
  if (!enrollment) return next(new ApiError(404, "Enrollment not found"));

  // Same fallback chain as the admin Fees dashboard, so the amount/date in
  // this email always matches what the admin sees on screen for this row —
  // never a client-supplied or hardcoded value.
  const feePlanAmount = enrollment.feePlan?.amount || enrollment.class?.feePlans?.[0]?.amount || 250000;
  const amount = Math.round(feePlanAmount / 100);
  const dueDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const targetEmail = enrollment.student.email;
  const targetName = enrollment.student.name;

  const result = await sendFeeReminderEmail(targetEmail, targetName || "Student", amount, dueDate);

  return ApiResponse(res, 200, {
    success: true,
    message: `Reminder successfully sent to ${targetEmail}`,
    emailResult: result,
  });
});

// Invoice download — a student may only download a receipt for their OWN
// payment; an admin can download any student's receipt (e.g. from the Fees
// & Payments screen). Either way, only once it has actually been paid.
export const downloadPaymentReceipt = asyncHandler(async (req, res, next) => {
  const payment = await prisma.payment.findUnique({
    where: { id: req.params.id },
    include: {
      student: true,
      enrollment: { include: { class: true, batch: true, feePlan: true } },
    },
  });

  if (!payment) return next(new ApiError(404, "Payment not found"));
  if (req.student && payment.studentId !== req.student.id) {
    return next(new ApiError(403, "You are not authorized to view this receipt"));
  }
  if (payment.status !== "PAID") {
    return next(new ApiError(400, "A receipt is only available for completed payments"));
  }

  const student = payment.student;
  const enrollment = payment.enrollment;

  const settingsRows = await prisma.siteContent.findMany();
  const settings = {};
  settingsRows.forEach((row) => {
    settings[row.key] = row.value;
  });

  const fullBusinessName = settings.businessName || "Synchrocity Music School";
  const [namePink, ...rest] = fullBusinessName.split(" ");
  const nameDark = rest.join(" ") || "Music School";

  const invoiceNo = `INV-${new Date(payment.createdAt).getFullYear()}-${payment.id.slice(-6).toUpperCase()}`;
  const issueDate = new Date(payment.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const paidAtLabel = new Date(payment.createdAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // The fee plan actually purchased at admission (Monthly/Quarterly/Yearly)
  // — NOT the class's overall curriculum length, which is unrelated to what
  // this specific admission payment covers.
  const feePlan = enrollment?.feePlan;
  const courseDurationLabel = feePlan?.durationMonths
    ? `${feePlan.durationMonths} Month${feePlan.durationMonths > 1 ? "s" : ""}${feePlan.name ? ` (${feePlan.name})` : ""}`
    : "One Time";

  const purposeMeta = {
    ADMISSION: {
      description: "Admission Fee",
      subLabel: "One Time",
      period: courseDurationLabel,
    },
    FEE: {
      description: enrollment?.class?.name ? `${enrollment.class.name} Class Fee` : "Course Fee",
      subLabel: "Monthly Tuition Fee",
      period: new Date(payment.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    },
    SHOP_ORDER: {
      description: "Shop Order Payment",
      subLabel: "Product Purchase",
      period: "One Time",
    },
  }[payment.purpose] || { description: payment.purpose, subLabel: "", period: "-" };

  const admissionNo = enrollment?.admissionId
    ? `ADM-${enrollment.admissionId.slice(-8).toUpperCase()}`
    : "-";

  const pdf = await renderInvoicePdf({
    invoiceNo,
    issueDate,
    paid: true,
    business: {
      namePink,
      nameDark,
      address: settings.address || "",
      phone: settings.phone || "",
      email: settings.email || "",
      website: settings.website || "",
    },
    student: {
      name: student.name,
      className: enrollment?.class?.name || "-",
      batchName: enrollment?.batch ? `${enrollment.batch.name} (${enrollment.batch.schedule})` : "-",
      admissionNo,
      phone: student.phone || "-",
    },
    items: [
      {
        description: purposeMeta.description,
        subLabel: purposeMeta.subLabel,
        period: purposeMeta.period,
        qty: 1,
        amountPaise: payment.amount,
      },
    ],
    subtotalPaise: payment.amount,
    discountPaise: 0,
    totalPaise: payment.amount,
    payment: {
      mode: "Razorpay (Online)",
      transactionId: payment.razorpayPaymentId || payment.razorpayOrderId,
      paidAtLabel,
    },
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="invoice-${payment.id}.pdf"`);
  // page.pdf() resolves to a Uint8Array (not a Node Buffer) — res.send()
  // only recognizes an actual Buffer as binary, otherwise it silently
  // JSON-serializes it, so wrap it explicitly.
  res.send(Buffer.from(pdf));
});

export const getStudentPayments = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const [payments, activeEnrollments] = await Promise.all([
    prisma.payment.findMany({ where: { studentId }, orderBy: { createdAt: "desc" } }),
    prisma.enrollment.findMany({ where: { studentId, active: true }, include: { feePlan: true } }),
  ]);

  const paidPayments = payments.filter((p) => p.status === "PAID");
  const totalPaidPaise = paidPayments.reduce((acc, p) => acc + p.amount, 0);

  const pendingDuesPaise = activeEnrollments.reduce((acc, e) => {
    const feePlanAmount = e.feePlan?.amount || 0;
    const paidForEnrollment = paidPayments
      .filter((p) => p.enrollmentId === e.id)
      .reduce((sum, p) => sum + p.amount, 0);
    return acc + Math.max(feePlanAmount - paidForEnrollment, 0);
  }, 0);

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
    pendingDuesRupees: Math.round(pendingDuesPaise / 100),
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


