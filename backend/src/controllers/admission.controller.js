import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createOrder } from "../services/razorpay.service.js";
import { sendAdmissionConfirmation } from "../services/email.service.js";

export const createAdmission = asyncHandler(async (req, res, next) => {
  const {
    studentName,
    dob,
    guardianName,
    phone,
    email,
    address,
    classId,
    batchId,
    feePlanId,
  } = req.body;

  if (!studentName || !phone || !email || !classId || !batchId || !feePlanId) {
    return next(new ApiError(400, "Missing required admission fields (studentName, phone, email, classId, batchId, feePlanId)"));
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
  const enrolledCount = await prisma.student.count({
    where: { batchId, active: true },
  });
  const isWaitlist = enrolledCount >= targetBatch.capacity;

  const admission = await prisma.admission.create({
    data: {
      studentName,
      dob: dob ? new Date(dob) : null,
      guardianName: guardianName || "Self",
      phone,
      email,
      address,
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
  const { status, search, email, phone } = req.query;

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

  const admissions = await prisma.admission.findMany({
    where,
    include: {
      class: true,
      batch: true,
      feePlan: true,
      payment: true,
      student: true,
    },
    orderBy: { createdAt: "desc" },
  });

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

  return ApiResponse(res, 200, formatted);
});

export const getAdmissionById = asyncHandler(async (req, res, next) => {
  const admission = await prisma.admission.findUnique({
    where: { id: req.params.id },
    include: {
      class: true,
      batch: true,
      feePlan: true,
      payment: true,
      student: true,
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
    include: { student: true },
  });

  if (!admission) return next(new ApiError(404, "Admission not found"));

  let updatedStudent = admission.student;

  // When status is changed to APPROVED, auto-enroll as Student if not already created
  if (status === "APPROVED" && !admission.student) {
    updatedStudent = await prisma.student.create({
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

  const updatedAdmission = await prisma.admission.update({
    where: { id: admissionId },
    data: { status },
    include: {
      class: true,
      batch: true,
      feePlan: true,
      student: true,
      payment: true,
    },
  });

  return ApiResponse(res, 200, {
    admission: updatedAdmission,
    student: updatedStudent,
  });
});

export const deleteAdmission = asyncHandler(async (req, res, next) => {
  const admission = await prisma.admission.findUnique({ where: { id: req.params.id } });
  if (!admission) return next(new ApiError(404, "Admission not found"));

  await prisma.admission.delete({ where: { id: req.params.id } });
  return ApiResponse(res, 200, { message: "Admission deleted successfully", id: req.params.id });
});
