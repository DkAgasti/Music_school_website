import { prisma } from "../config/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
  return ApiResponse(res, 200, testimonials);
});

export const createTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await prisma.testimonial.create({ data: req.body });
  return ApiResponse(res, 201, testimonial);
});

export const updateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await prisma.testimonial.update({
    where: { id: req.params.id },
    data: req.body,
  });
  return ApiResponse(res, 200, testimonial);
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
  await prisma.testimonial.delete({ where: { id: req.params.id } });
  return ApiResponse(res, 200, { id: req.params.id });
});
