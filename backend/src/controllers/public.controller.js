import { prisma } from "../config/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listClasses = asyncHandler(async (req, res) => {
  const classes = await prisma.musicClass.findMany({ include: { teacher: true, batches: true } });
  return ApiResponse(res, 200, classes);
});

export const getClassBySlug = asyncHandler(async (req, res) => {
  const musicClass = await prisma.musicClass.findUnique({
    where: { slug: req.params.slug },
    include: { teacher: true, batches: true },
  });
  return ApiResponse(res, 200, musicClass);
});

export const listTeachers = asyncHandler(async (req, res) => {
  const teachers = await prisma.teacher.findMany();
  return ApiResponse(res, 200, teachers);
});

export const listTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
  return ApiResponse(res, 200, testimonials);
});
