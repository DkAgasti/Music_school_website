import { prisma } from "../config/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const markAttendance = asyncHandler(async (req, res) => {
  const record = await prisma.attendance.create({ data: req.body });
  return ApiResponse(res, 201, record);
});

export const listAttendance = asyncHandler(async (req, res) => {
  const where = req.query.studentId ? { studentId: req.query.studentId } : {};
  const records = await prisma.attendance.findMany({ where, orderBy: { date: "desc" } });
  return ApiResponse(res, 200, records);
});
