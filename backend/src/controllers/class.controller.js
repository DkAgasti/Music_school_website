import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { invalidate } from "../utils/cache.js";

// ─── Classes ─────────────────────────────────────────────────────────────────

export const listAdminClasses = asyncHandler(async (req, res) => {
  const classes = await prisma.class.findMany({
    include: {
      batches: true,
      feePlans: true,
      teachers: true,
      _count: { select: { enrollments: { where: { active: true } }, admissions: true } },
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
      enrollments: {
        where: { active: true },
        select: { id: true, student: { select: { id: true, name: true, active: true } } },
      },
    },
  });

  if (!musicClass) return next(new ApiError(404, "Class not found"));
  return ApiResponse(res, 200, musicClass);
});

export const createClass = asyncHandler(async (req, res, next) => {
  const { name, slug, description, syllabus, imageUrl, durationMonths, active = true, teachers } = req.body;

  if (!name) return next(new ApiError(400, "Class name is required"));

  const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const slugTaken = await prisma.class.findUnique({ where: { slug: generatedSlug } });
  if (slugTaken) return next(new ApiError(409, `A class with slug "${generatedSlug}" already exists`));

  const musicClass = await prisma.class.create({
    data: {
      name,
      slug: generatedSlug,
      description: description || "",
      syllabus,
      imageUrl,
      durationMonths: durationMonths ? parseInt(durationMonths, 10) : null,
      active: Boolean(active),
      ...(teachers ? { teachers } : {}),
    },
    include: { teachers: true },
  });

  invalidate("classes");
  invalidate("teachers");
  return ApiResponse(res, 201, musicClass);
});

export const updateClass = asyncHandler(async (req, res, next) => {
  const existing = await prisma.class.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new ApiError(404, "Class not found"));

  const musicClass = await prisma.class.update({
    where: { id: req.params.id },
    data: req.body,
    include: { batches: true, feePlans: true, teachers: true },
  });

  invalidate("classes");
  invalidate("teachers");
  return ApiResponse(res, 200, musicClass);
});

export const deleteClass = asyncHandler(async (req, res, next) => {
  const existing = await prisma.class.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new ApiError(404, "Class not found"));

  const [enrollmentCount, batchCount, feePlanCount, admissionCount] = await Promise.all([
    prisma.enrollment.count({ where: { classId: req.params.id } }),
    prisma.batch.count({ where: { classId: req.params.id } }),
    prisma.feePlan.count({ where: { classId: req.params.id } }),
    prisma.admission.count({ where: { classId: req.params.id } }),
  ]);
  if (enrollmentCount > 0 || batchCount > 0 || feePlanCount > 0 || admissionCount > 0) {
    return next(new ApiError(
      409,
      `Cannot delete: this class still has ${batchCount} batch(es), ${feePlanCount} fee plan(s), ${admissionCount} admission(s), and ${enrollmentCount} enrollment(s) referencing it`
    ));
  }

  await prisma.class.delete({ where: { id: req.params.id } });
  invalidate("classes");
  invalidate("teachers");
  return ApiResponse(res, 200, { message: "Class deleted successfully", id: req.params.id });
});

// ─── Batches & Timing ────────────────────────────────────────────────────────

export const listBatches = asyncHandler(async (req, res) => {
  const { classId, page, limit } = req.query;
  const where = classId ? { classId } : {};

  // No `page` param → unpaginated array, kept for the (already small,
  // classId-filtered) callers like the Add Class / Attendance dropdowns.
  const isPaginated = page !== undefined;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const [batches, total] = await Promise.all([
    prisma.batch.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, teachers: true } },
        enrollments: {
          where: { active: true },
          select: { id: true, student: { select: { id: true, name: true, active: true } } },
        },
        _count: { select: { enrollments: { where: { active: true } } } },
      },
      orderBy: { createdAt: "desc" },
      ...(isPaginated ? { skip: (pageNum - 1) * pageSize, take: pageSize } : {}),
    }),
    isPaginated ? prisma.batch.count({ where }) : Promise.resolve(null),
  ]);

  const formattedBatches = batches.map((b) => ({
    ...b,
    seatsLeft: Math.max(0, b.capacity - (b._count?.enrollments || 0)),
    teacherName: b.class?.teachers?.[0]?.name || "Assigned Faculty",
  }));

  if (!isPaginated) return ApiResponse(res, 200, formattedBatches);

  return ApiResponse(res, 200, {
    items: formattedBatches,
    total,
    page: pageNum,
    limit: pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
});

export const createBatch = asyncHandler(async (req, res, next) => {
  const { classId, name, schedule, capacity = 10, active = true } = req.body;

  if (!classId || !name || !schedule) {
    return next(new ApiError(400, "classId, name, and schedule are required"));
  }

  const cls = await prisma.class.findUnique({ where: { id: classId } });
  if (!cls) return next(new ApiError(404, "Class not found"));

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

  invalidate("classes");
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

  invalidate("classes");
  return ApiResponse(res, 200, batch);
});

export const deleteBatch = asyncHandler(async (req, res, next) => {
  const existing = await prisma.batch.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new ApiError(404, "Batch not found"));

  const [enrollmentCount, admissionCount] = await Promise.all([
    prisma.enrollment.count({ where: { batchId: req.params.id } }),
    prisma.admission.count({ where: { batchId: req.params.id } }),
  ]);
  if (enrollmentCount > 0 || admissionCount > 0) {
    return next(new ApiError(
      409,
      `Cannot delete: this batch still has ${admissionCount} admission(s) and ${enrollmentCount} enrollment(s) referencing it`
    ));
  }

  await prisma.batch.delete({ where: { id: req.params.id } });
  invalidate("classes");
  return ApiResponse(res, 200, { message: "Batch deleted successfully", id: req.params.id });
});
