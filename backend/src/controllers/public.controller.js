import { prisma } from "../config/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listClasses = asyncHandler(async (req, res) => {
  const classes = await prisma.class.findMany({
    where: { active: true },
    include: {
      teachers: true,
      batches: {
        where: { active: true },
        include: { _count: { select: { students: true } } },
      },
      feePlans: true,
    },
  });
  return ApiResponse(res, 200, classes);
});

export const getClassBySlug = asyncHandler(async (req, res) => {
  const musicClass = await prisma.class.findUnique({
    where: { slug: req.params.slug },
    include: {
      teachers: true,
      batches: {
        where: { active: true },
        include: { _count: { select: { students: true } } },
      },
      feePlans: true,
    },
  });
  return ApiResponse(res, 200, musicClass);
});

export const listTeachers = asyncHandler(async (req, res) => {
  const teachers = await prisma.teacher.findMany({
    include: { classes: { select: { id: true, name: true, slug: true } } },
  });
  return ApiResponse(res, 200, teachers);
});

export const listTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
  return ApiResponse(res, 200, testimonials);
});

export const listGalleryImages = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const where = category && category !== "All" ? { category } : {};
  const images = await prisma.galleryImage.findMany({ where, orderBy: { createdAt: "desc" } });
  return ApiResponse(res, 200, images);
});

export const getPublicSiteContent = asyncHandler(async (req, res) => {
  const content = await prisma.siteContent.findMany();
  const contentMap = {};
  content.forEach((item) => {
    contentMap[item.key] = item.value;
  });
  return ApiResponse(res, 200, contentMap);
});
