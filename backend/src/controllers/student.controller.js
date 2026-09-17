import { prisma } from "../config/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listStudents = asyncHandler(async (req, res) => {
  const students = await prisma.student.findMany({ include: { batch: true, admission: true } });
  return ApiResponse(res, 200, students);
});

export const getStudent = asyncHandler(async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { id: req.params.id },
    include: {
      batch: { include: { class: true } },
      admission: true,
      attendance: true,
      progress: true,
      payments: true,
    },
  });
  return ApiResponse(res, 200, student);
});

export const updateStudent = asyncHandler(async (req, res) => {
  const student = await prisma.student.update({
    where: { id: req.params.id },
    data: req.body,
  });
  return ApiResponse(res, 200, student);
});
