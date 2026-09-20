import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ─── Classes ─────────────────────────────────────────────────────────────────

export const listAdminClasses = asyncHandler(async (req, res) => {
  const classes = await prisma.class.findMany({
    include: {
      batches: true,
      feePlans: true,
      teachers: true,
      _count: { select: { students: true, admissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return ApiResponse(res, 200, classes);
});

export const getClassById = asyncHandler(async (req, res, next) => {
  const musicClass = await prisma.class.findUnique({
    where: { id: req.params.id },
    include: {
      batches: true,
      feePlans: true,
      teachers: true,
      students: { select: { id: true, name: true, active: true } },
    },
  });

  if (!musicClass) return next(new ApiError(404, "Class not found"));
  return ApiResponse(res, 200, musicClass);
});

export const createClass = asyncHandler(async (req, res, next) => {
  const { name, slug, description, syllabus, imageUrl, active = true } = req.body;

  if (!name) return next(new ApiError(400, "Class name is required"));

  const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const musicClass = await prisma.class.create({
    data: {
      name,
      slug: generatedSlug,
      description: description || "",
      syllabus,
      imageUrl,
      active: Boolean(active),
    },
  });

  return ApiResponse(res, 201, musicClass);
});

export const updateClass = asyncHandler(async (req, res, next) => {
  const existing = await prisma.class.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new ApiError(404, "Class not found"));

  const musicClass = await prisma.class.update({
    where: { id: req.params.id },
    data: req.body,
    include: { batches: true, feePlans: true },
  });

  return ApiResponse(res, 200, musicClass);
});

export const deleteClass = asyncHandler(async (req, res, next) => {
  const existing = await prisma.class.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new ApiError(404, "Class not found"));

  await prisma.class.delete({ where: { id: req.params.id } });
  return ApiResponse(res, 200, { message: "Class deleted successfully", id: req.params.id });
});

// ─── Batches & Timing ────────────────────────────────────────────────────────

export const listBatches = asyncHandler(async (req, res) => {
  const { classId } = req.query;
  const where = classId ? { classId } : {};

  const batches = await prisma.batch.findMany({
    where,
    include: {
      class: { select: { id: true, name: true, teachers: true } },
      students: { select: { id: true, name: true, active: true } },
      _count: { select: { students: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedBatches = batches.map((b) => ({
    ...b,
    seatsLeft: Math.max(0, b.capacity - (b._count?.students || 0)),
    teacherName: b.class?.teachers?.[0]?.name || "Assigned Faculty",
  }));

  return ApiResponse(res, 200, formattedBatches);
});

export const createBatch = asyncHandler(async (req, res, next) => {
  const { classId, name, schedule, capacity = 10, active = true } = req.body;

  if (!classId || !name || !schedule) {
    return next(new ApiError(400, "classId, name, and schedule are required"));
  }

  const batch = await prisma.batch.create({
    data: {
      classId,
      name,
      schedule,
      capacity: parseInt(capacity, 10) || 10,
      active: Boolean(active),
    },
    include: { class: true },
  });

  return ApiResponse(res, 201, batch);
});

export const updateBatch = asyncHandler(async (req, res, next) => {
  const existing = await prisma.batch.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new ApiError(404, "Batch not found"));

  const batch = await prisma.batch.update({
    where: { id: req.params.id },
    data: req.body,
    include: { class: true },
  });

  return ApiResponse(res, 200, batch);
});

export const deleteBatch = asyncHandler(async (req, res, next) => {
  const existing = await prisma.batch.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new ApiError(404, "Batch not found"));

  await prisma.batch.delete({ where: { id: req.params.id } });
  return ApiResponse(res, 200, { message: "Batch deleted successfully", id: req.params.id });
});
