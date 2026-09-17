import { prisma } from "../config/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addProgressNote = asyncHandler(async (req, res) => {
  const note = await prisma.progress.create({ data: req.body });
  return ApiResponse(res, 201, note);
});

export const listProgress = asyncHandler(async (req, res) => {
  const where = req.query.studentId ? { studentId: req.query.studentId } : {};
  const notes = await prisma.progress.findMany({ where, orderBy: { createdAt: "desc" } });
  return ApiResponse(res, 200, notes);
});
