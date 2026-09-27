import { prisma } from "../config/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cached } from "../utils/cache.js";

const TTL = 60_000; // 60s safety-net; admin writes invalidate this immediately anyway

export const listClasses = asyncHandler(async (req, res) => {
  const classes = await cached("classes:list", TTL, () =>
    prisma.class.findMany({
      where: { active: true },
      include: {
        teachers: true,
        batches: {
          where: { active: true },
          include: { _count: { select: { enrollments: { where: { active: true } } } } },
        },
        feePlans: true,
      },
    })
  );
  return ApiResponse(res, 200, classes);
});

export const getClassBySlug = asyncHandler(async (req, res) => {
  const musicClass = await cached(`classes:${req.params.slug}`, TTL, () =>
    prisma.class.findUnique({
      where: { slug: req.params.slug },
      include: {
        teachers: true,
        batches: {
          where: { active: true },
          include: { _count: { select: { enrollments: { where: { active: true } } } } },
        },
        feePlans: true,
      },
    })
  );
  return ApiResponse(res, 200, musicClass);
});

export const listTeachers = asyncHandler(async (req, res) => {
  const teachers = await cached("teachers:list", TTL, () =>
    prisma.teacher.findMany({
      include: { classes: { select: { id: true, name: true, slug: true } } },
    })
  );
  return ApiResponse(res, 200, teachers);
});

export const listTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await cached("testimonials:list", TTL, () =>
    prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } })
  );
  return ApiResponse(res, 200, testimonials);
});

export const getPublicSiteContent = asyncHandler(async (req, res) => {
  const contentMap = await cached("site-content:map", TTL, async () => {
    const content = await prisma.siteContent.findMany();
    const map = {};
    content.forEach((item) => {
      map[item.key] = item.value;
    });
    return map;
  });
  return ApiResponse(res, 200, contentMap);
});
