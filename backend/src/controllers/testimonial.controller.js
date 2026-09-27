import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { invalidate } from "../utils/cache.js";

export const listTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
  return ApiResponse(res, 200, testimonials);
});

export const createTestimonial = asyncHandler(async (req, res, next) => {
  const { name, message } = req.body;
  if (!name || !message) return next(new ApiError(400, "name and message are required"));

  const testimonial = await prisma.testimonial.create({ data: req.body });
  invalidate("testimonials");
  return ApiResponse(res, 201, testimonial);
});

export const updateTestimonial = asyncHandler(async (req, res, next) => {
  const existing = await prisma.testimonial.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new ApiError(404, "Testimonial not found"));

  const testimonial = await prisma.testimonial.update({
    where: { id: req.params.id },
    data: req.body,
  });
  invalidate("testimonials");
  return ApiResponse(res, 200, testimonial);
});

export const deleteTestimonial = asyncHandler(async (req, res, next) => {
  const existing = await prisma.testimonial.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new ApiError(404, "Testimonial not found"));

  await prisma.testimonial.delete({ where: { id: req.params.id } });
  invalidate("testimonials");
  return ApiResponse(res, 200, { id: req.params.id });
});
