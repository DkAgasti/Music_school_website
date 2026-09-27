import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Admin roster lookup — a batch's roster is now an Enrollment list, not a
// Student list, since one student can appear in several batches/classes.
export const listEnrollments = asyncHandler(async (req, res) => {
  const { batchId, classId, studentId, active } = req.query;

  const where = {};
  if (batchId) where.batchId = batchId;
  if (classId) where.classId = classId;
  if (studentId) where.studentId = studentId;
  if (active !== undefined) where.active = active === "true";

  const enrollments = await prisma.enrollment.findMany({
    where,
    include: {
      student: { select: { id: true, name: true, email: true, phone: true } },
      class: { select: { id: true, name: true } },
      batch: { select: { id: true, name: true, schedule: true } },
      feePlan: { select: { id: true, name: true, amount: true } },
    },
    orderBy: { joinedDate: "desc" },
  });

  return ApiResponse(res, 200, enrollments);
});

// Admin directly enrolling an EXISTING student into another class — no
// payment gate (that's the student-portal / public admission pipeline);
// this mirrors how admin already creates students directly today.
export const createEnrollment = asyncHandler(async (req, res, next) => {
  const { studentId, classId, batchId, feePlanId } = req.body;

  if (!studentId || !classId || !batchId) {
    return next(new ApiError(400, "studentId, classId, and batchId are required"));
  }

  const [student, cls, batch, feePlan] = await Promise.all([
    prisma.student.findUnique({ where: { id: studentId } }),
    prisma.class.findUnique({ where: { id: classId } }),
    prisma.batch.findUnique({ where: { id: batchId } }),
    feePlanId ? prisma.feePlan.findUnique({ where: { id: feePlanId } }) : null,
  ]);
  if (!student) return next(new ApiError(404, "Student not found"));
  if (!cls) return next(new ApiError(404, "Class not found"));
  if (!batch) return next(new ApiError(404, "Batch not found"));
  if (batch.classId !== classId) return next(new ApiError(400, "Batch does not belong to the selected class"));
  if (feePlanId) {
    if (!feePlan) return next(new ApiError(404, "Fee plan not found"));
    if (feePlan.classId !== classId) return next(new ApiError(400, "Fee plan does not belong to the selected class"));
  }

  const alreadyEnrolled = await prisma.enrollment.findFirst({
    where: { studentId, classId, active: true },
  });
  if (alreadyEnrolled) {
    return next(new ApiError(409, "This student is already enrolled in this class"));
  }

  const enrollment = await prisma.enrollment.create({
    data: { studentId, classId, batchId, feePlanId: feePlanId || null, active: true },
    include: { class: true, batch: true, feePlan: true },
  });

  return ApiResponse(res, 201, enrollment);
});

export const updateEnrollment = asyncHandler(async (req, res, next) => {
  const { active, batchId, feePlanId } = req.body;

  const existing = await prisma.enrollment.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new ApiError(404, "Enrollment not found"));

  if (batchId !== undefined) {
    const batch = await prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch) return next(new ApiError(404, "Batch not found"));
    if (batch.classId !== existing.classId) {
      return next(new ApiError(400, "Batch does not belong to this enrollment's class"));
    }
  }
  if (feePlanId !== undefined && feePlanId !== null) {
    const feePlan = await prisma.feePlan.findUnique({ where: { id: feePlanId } });
    if (!feePlan) return next(new ApiError(404, "Fee plan not found"));
    if (feePlan.classId !== existing.classId) {
      return next(new ApiError(400, "Fee plan does not belong to this enrollment's class"));
    }
  }

  const data = {};
  if (active !== undefined) data.active = Boolean(active);
  if (batchId !== undefined) data.batchId = batchId;
  if (feePlanId !== undefined) data.feePlanId = feePlanId;

  const enrollment = await prisma.enrollment.update({
    where: { id: req.params.id },
    data,
    include: { class: true, batch: true, feePlan: true },
  });

  return ApiResponse(res, 200, enrollment);
});
