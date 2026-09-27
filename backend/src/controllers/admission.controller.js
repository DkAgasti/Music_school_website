import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createOrder } from "../services/razorpay.service.js";
import { sendAdmissionConfirmation } from "../services/email.service.js";
import { checkBatchCapacity, enrollFromAdmission } from "../services/enrollment.service.js";
import { invalidate } from "../utils/cache.js";

export const createAdmission = asyncHandler(async (req, res, next) => {
  const {
    studentName,
    dob,
    guardianName,
    phone,
    email,
    address,
    password,
    classId,
    batchId,
    feePlanId,
  } = req.body;

  if (!studentName || !phone || !email || !classId || !batchId || !feePlanId) {
    return next(new ApiError(400, "Missing required admission fields (studentName, phone, email, classId, batchId, feePlanId)"));
  }

  if (!password || password.length < 6) {
    return next(new ApiError(400, "A password (min 6 characters) is required to create your student login"));
  }

  const existingStudentEmail = await prisma.student.findUnique({ where: { email } });
  if (existingStudentEmail) {
    return next(new ApiError(409, "An account with this email already exists. Please log in instead."));
  }

  // Verify class, batch, and feePlan exist
  const [targetClass, targetBatch, targetFeePlan] = await Promise.all([
    prisma.class.findUnique({ where: { id: classId } }),
    prisma.batch.findUnique({ where: { id: batchId } }),
    prisma.feePlan.findUnique({ where: { id: feePlanId } }),
  ]);

  if (!targetClass) return next(new ApiError(404, "Class not found"));
  if (!targetBatch) return next(new ApiError(404, "Batch not found"));
  if (!targetFeePlan) return next(new ApiError(404, "Fee plan not found"));

  // Check batch capacity
  const enrolledCount = await checkBatchCapacity(batchId);
  const isWaitlist = enrolledCount >= targetBatch.capacity;
  const passwordHash = await bcrypt.hash(password, 12);

  const admission = await prisma.admission.create({
    data: {
      studentName,
      dob: dob ? new Date(dob) : null,
      guardianName: guardianName || "Self",
      phone,
      email,
      address,
      passwordHash,
      classId,
      batchId,
      feePlanId,
      status: isWaitlist ? "WAITLISTED" : "PENDING",
    },
    include: {
      class: true,
      batch: true,
      feePlan: true,
    },
  });

  // Create Razorpay order for the fee plan amount (stored in paise)
  const amountInPaise = targetFeePlan.amount;
  const razorpayOrder = await createOrder(amountInPaise, `adm_${admission.id.slice(-8)}`);

  // Create corresponding Payment record
  const payment = await prisma.payment.create({
    data: {
      amount: amountInPaise,
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      purpose: "ADMISSION",
      admissionId: admission.id,
      status: "CREATED",
    },
  });

  // Trigger non-blocking confirmation email
  sendAdmissionConfirmation(email, studentName).catch(() => {});

  return ApiResponse(res, 201, {
    admission,
    payment,
    razorpayOrder,
    razorpayKey: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  });
});

export const listAdmissions = asyncHandler(async (req, res) => {
  const { status, search, email, phone, page, limit } = req.query;

  const where = {};
  if (status) {
    where.status = status;
  }
  if (email) {
    where.email = email;
  }
  if (phone) {
    where.phone = phone;
  }
  if (search) {
    where.OR = [
      { studentName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  // No `page` param → unpaginated array, kept for any existing caller that
  // still expects a plain list.
  const isPaginated = page !== undefined;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const [admissions, total] = await Promise.all([
    prisma.admission.findMany({
      where,
      include: {
        class: true,
        batch: true,
        feePlan: true,
        payment: true,
        enrollment: { include: { student: true } },
      },
      orderBy: { createdAt: "desc" },
      ...(isPaginated ? { skip: (pageNum - 1) * pageSize, take: pageSize } : {}),
    }),
    isPaginated ? prisma.admission.count({ where }) : Promise.resolve(null),
  ]);

  const formatted = admissions.map((a) => ({
    ...a,
    admissionCode: `HMS-${new Date(a.createdAt).getFullYear()}-${a.id.slice(-3).toUpperCase()}`,
    className: a.class?.name,
    batchName: a.batch?.name,
    appliedOn: new Date(a.createdAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  }));

  if (!isPaginated) return ApiResponse(res, 200, formatted);

  return ApiResponse(res, 200, {
    items: formatted,
    total,
    page: pageNum,
    limit: pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
});

export const getAdmissionById = asyncHandler(async (req, res, next) => {
  const admission = await prisma.admission.findUnique({
    where: { id: req.params.id },
    include: {
      class: true,
      batch: true,
      feePlan: true,
      payment: true,
      enrollment: { include: { student: true } },
    },
  });

  if (!admission) return next(new ApiError(404, "Admission not found"));
  return ApiResponse(res, 200, admission);
});

export const updateAdmissionStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const admissionId = req.params.id;

  const validStatuses = ["PENDING", "APPROVED", "WAITLISTED", "REJECTED"];
  if (!validStatuses.includes(status)) {
    return next(new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`));
  }

  const admission = await prisma.admission.findUnique({
    where: { id: admissionId },
    include: { enrollment: true },
    omit: { passwordHash: false },
  });

  if (!admission) return next(new ApiError(404, "Admission not found"));

  let updatedStudent = null;

  // When status is changed to APPROVED, auto-enroll if not already done
  // (e.g. admin approving an offline/manual payment, without Razorpay).
  if (status === "APPROVED" && !admission.enrollment) {
    const result = await enrollFromAdmission(admission);
    updatedStudent = result.student;

    // Link any existing admission-fee payment to the newly enrolled student.
    await prisma.payment.updateMany({
      where: { admissionId: admission.id },
      data: { studentId: updatedStudent.id, enrollmentId: result.enrollment.id },
    });
    invalidate("classes"); // seat counts (batch._count.enrollments) just changed
  }

  // Moving an already-approved admission BACK to pending/waitlisted/rejected
  // must not leave its enrollment active — otherwise the student stays
  // enrolled (and counted against batch capacity) despite the reversal.
  if (status !== "APPROVED" && admission.enrollment?.active) {
    await prisma.enrollment.update({
      where: { id: admission.enrollment.id },
      data: { active: false },
    });
    invalidate("classes");
  }

  const updatedAdmission = await prisma.admission.update({
    where: { id: admissionId },
    data: { status },
    include: {
      class: true,
      batch: true,
      feePlan: true,
      enrollment: { include: { student: true } },
      payment: true,
    },
  });

  return ApiResponse(res, 200, {
    admission: updatedAdmission,
    student: updatedStudent || updatedAdmission.enrollment?.student || null,
  });
});

export const deleteAdmission = asyncHandler(async (req, res, next) => {
  const admission = await prisma.admission.findUnique({
    where: { id: req.params.id },
    include: { enrollment: true, payment: true },
  });
  if (!admission) return next(new ApiError(404, "Admission not found"));

  if (admission.enrollment || admission.payment) {
    return next(new ApiError(
      409,
      "Cannot delete: this admission already has an enrollment and/or payment linked to it"
    ));
  }

  await prisma.admission.delete({ where: { id: req.params.id } });
  return ApiResponse(res, 200, { message: "Admission deleted successfully", id: req.params.id });
});

// Self-service "join another class" — an already-logged-in student applies
// without re-entering name/email/phone/guardian/password (all pulled from
// their existing account). Goes through the same Admission + Payment
// pipeline as a brand-new signup so admin visibility and approval history
// stay consistent, it's just tagged with `studentId` from the start.
export const applyForAdditionalClass = asyncHandler(async (req, res, next) => {
  const { classId, batchId, feePlanId } = req.body;

  if (!classId || !batchId || !feePlanId) {
    return next(new ApiError(400, "classId, batchId, and feePlanId are required"));
  }

  const student = await prisma.student.findUnique({ where: { id: req.student.id } });
  if (!student) return next(new ApiError(404, "Student not found"));

  const alreadyEnrolled = await prisma.enrollment.findFirst({
    where: { studentId: student.id, classId, active: true },
  });
  if (alreadyEnrolled) {
    return next(new ApiError(409, "You are already enrolled in this class"));
  }

  const [targetClass, targetBatch, targetFeePlan] = await Promise.all([
    prisma.class.findUnique({ where: { id: classId } }),
    prisma.batch.findUnique({ where: { id: batchId } }),
    prisma.feePlan.findUnique({ where: { id: feePlanId } }),
  ]);

  if (!targetClass) return next(new ApiError(404, "Class not found"));
  if (!targetBatch) return next(new ApiError(404, "Batch not found"));
  if (!targetFeePlan) return next(new ApiError(404, "Fee plan not found"));

  const enrolledCount = await checkBatchCapacity(batchId);
  const isWaitlist = enrolledCount >= targetBatch.capacity;

  const admission = await prisma.admission.create({
    data: {
      studentName: student.name,
      dob: student.dob,
      guardianName: student.guardianName || "Self",
      phone: student.phone,
      email: student.email,
      address: student.address,
      classId,
      batchId,
      feePlanId,
      studentId: student.id,
      status: isWaitlist ? "WAITLISTED" : "PENDING",
    },
    include: { class: true, batch: true, feePlan: true },
  });

  const amountInPaise = targetFeePlan.amount;
  const razorpayOrder = await createOrder(amountInPaise, `adm_${admission.id.slice(-8)}`);

  const payment = await prisma.payment.create({
    data: {
      amount: amountInPaise,
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      purpose: "ADMISSION",
      admissionId: admission.id,
      studentId: student.id,
      status: "CREATED",
    },
  });

  return ApiResponse(res, 201, {
    admission,
    payment,
    razorpayOrder,
    razorpayKey: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  });
});
