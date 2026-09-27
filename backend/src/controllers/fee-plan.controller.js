import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { invalidate } from "../utils/cache.js";

export const listFeePlans = asyncHandler(async (req, res) => {
  const where = req.query.classId ? { classId: req.query.classId } : {};
  const feePlans = await prisma.feePlan.findMany({
    where,
    include: { class: true },
    orderBy: { createdAt: "desc" },
  });
  return ApiResponse(res, 200, feePlans);
});

export const createFeePlan = asyncHandler(async (req, res, next) => {
  const { classId, name, amount, durationMonths } = req.body;
  if (!classId || !name || !amount || !durationMonths) {
    return next(new ApiError(400, "classId, name, amount, and durationMonths are required"));
  }

  const cls = await prisma.class.findUnique({ where: { id: classId } });
  if (!cls) return next(new ApiError(404, "Class not found"));

  const feePlan = await prisma.feePlan.create({ data: req.body });
  invalidate("classes"); // feePlans are nested in the public class response
  return ApiResponse(res, 201, feePlan);
});

export const updateFeePlan = asyncHandler(async (req, res, next) => {
  const existing = await prisma.feePlan.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new ApiError(404, "Fee plan not found"));

  const feePlan = await prisma.feePlan.update({
    where: { id: req.params.id },
    data: req.body,
  });
  invalidate("classes");
  return ApiResponse(res, 200, feePlan);
});

export const deleteFeePlan = asyncHandler(async (req, res, next) => {
  const existing = await prisma.feePlan.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new ApiError(404, "Fee plan not found"));

  const [enrollmentCount, admissionCount] = await Promise.all([
    prisma.enrollment.count({ where: { feePlanId: req.params.id } }),
    prisma.admission.count({ where: { feePlanId: req.params.id } }),
  ]);
  if (enrollmentCount > 0 || admissionCount > 0) {
    return next(new ApiError(
      409,
      `Cannot delete: this fee plan still has ${admissionCount} admission(s) and ${enrollmentCount} enrollment(s) referencing it`
    ));
  }

  await prisma.feePlan.delete({ where: { id: req.params.id } });
  invalidate("classes");
  return ApiResponse(res, 200, { id: req.params.id });
});
