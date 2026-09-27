import { prisma } from "../config/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { invalidate } from "../utils/cache.js";

export const listTeachers = asyncHandler(async (req, res) => {
  const teachers = await prisma.teacher.findMany({
    include: { classes: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  return ApiResponse(res, 200, teachers);
});

export const createTeacher = asyncHandler(async (req, res) => {
  const teacher = await prisma.teacher.create({
    data: req.body,
    include: { classes: { select: { id: true, name: true, slug: true } } },
  });
  invalidate("teachers");
  invalidate("classes"); // teachers are nested in the public class response
  return ApiResponse(res, 201, teacher);
});

export const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await prisma.teacher.update({
    where: { id: req.params.id },
    data: req.body,
    include: { classes: { select: { id: true, name: true, slug: true } } },
  });
  invalidate("teachers");
  invalidate("classes");
  return ApiResponse(res, 200, teacher);
});

export const deleteTeacher = asyncHandler(async (req, res) => {
  await prisma.teacher.delete({ where: { id: req.params.id } });
  invalidate("teachers");
  invalidate("classes");
  return ApiResponse(res, 200, { id: req.params.id });
});
