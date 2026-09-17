import { prisma } from "../config/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listFeePlans = asyncHandler(async (req, res) => {
  const where = req.query.classId ? { classId: req.query.classId } : {};
  const feePlans = await prisma.feePlan.findMany({
    where,
    include: { class: true },
    orderBy: { createdAt: "desc" },
  });
  return ApiResponse(res, 200, feePlans);
});

export const createFeePlan = asyncHandler(async (req, res) => {
  const feePlan = await prisma.feePlan.create({ data: req.body });
  return ApiResponse(res, 201, feePlan);
});

export const updateFeePlan = asyncHandler(async (req, res) => {
  const feePlan = await prisma.feePlan.update({
    where: { id: req.params.id },
    data: req.body,
  });
  return ApiResponse(res, 200, feePlan);
});

export const deleteFeePlan = asyncHandler(async (req, res) => {
  await prisma.feePlan.delete({ where: { id: req.params.id } });
  return ApiResponse(res, 200, { id: req.params.id });
});
