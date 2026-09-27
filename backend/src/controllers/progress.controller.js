import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addProgressNote = asyncHandler(async (req, res, next) => {
  const { enrollmentId, note, rating, date } = req.body;

  if (!enrollmentId || !note) {
    return next(new ApiError(400, "enrollmentId and note are required"));
  }

  // Get authorId from authenticated admin, or fallback to first admin
  let authorId = req.admin?.id;
  if (!authorId) {
    const admin = await prisma.admin.findFirst();
    if (!admin) return next(new ApiError(500, "No admin account found to author the note"));
    authorId = admin.id;
  }

  const progressRecord = await prisma.progressNote.create({
    data: {
      enrollmentId,
      note,
      rating: rating !== undefined && rating !== null && rating !== "" ? parseInt(rating, 10) : null,
      date: date ? new Date(date) : new Date(),
      authorId,
    },
    include: {
      enrollment: { include: { student: { select: { id: true, name: true } } } },
      author: { select: { id: true, name: true } },
    },
  });

  return ApiResponse(res, 201, progressRecord);
});

export const listProgress = asyncHandler(async (req, res) => {
  const { studentId, enrollmentId, search, page, limit } = req.query;

  const where = {};
  if (enrollmentId) where.enrollmentId = enrollmentId;
  if (studentId) where.enrollment = { studentId };
  if (search) {
    where.OR = [
      { note: { contains: search, mode: "insensitive" } },
      { enrollment: { student: { name: { contains: search, mode: "insensitive" } } } },
      { enrollment: { class: { name: { contains: search, mode: "insensitive" } } } },
    ];
  }

  // No `page` param → unpaginated array, kept for any existing caller that
  // still expects a plain list.
  const isPaginated = page !== undefined;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const [notes, total] = await Promise.all([
    prisma.progressNote.findMany({
      where,
      include: {
        author: { select: { id: true, name: true } },
        enrollment: {
          include: {
            student: { select: { id: true, name: true } },
            class: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { date: "desc" },
      ...(isPaginated ? { skip: (pageNum - 1) * pageSize, take: pageSize } : {}),
    }),
    isPaginated ? prisma.progressNote.count({ where }) : Promise.resolve(null),
  ]);

  const formattedNotes = notes.map((n) => ({
    id: n.id,
    date: n.date,
    note: n.note,
    rating: n.rating,
    className: n.enrollment?.class?.name || "Music Course",
    teacherName: n.author?.name || "Instructor",
    studentId: n.enrollment?.student?.id,
    studentName: n.enrollment?.student?.name,
    enrollmentId: n.enrollmentId,
  }));

  if (!isPaginated) return ApiResponse(res, 200, formattedNotes);

  return ApiResponse(res, 200, {
    items: formattedNotes,
    total,
    page: pageNum,
    limit: pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
});

export const updateProgressNote = asyncHandler(async (req, res, next) => {
  const { note, rating, date } = req.body;

  const existing = await prisma.progressNote.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new ApiError(404, "Progress note not found"));

  const data = {};
  if (note !== undefined) data.note = note;
  if (rating !== undefined) data.rating = rating !== null && rating !== "" ? parseInt(rating, 10) : null;
  if (date !== undefined) data.date = new Date(date);

  const updated = await prisma.progressNote.update({
    where: { id: req.params.id },
    data,
    include: {
      author: { select: { id: true, name: true } },
      enrollment: { include: { student: { select: { id: true, name: true } } } },
    },
  });

  return ApiResponse(res, 200, updated);
});

export const deleteProgressNote = asyncHandler(async (req, res, next) => {
  const existing = await prisma.progressNote.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new ApiError(404, "Progress note not found"));

  await prisma.progressNote.delete({ where: { id: req.params.id } });
  return ApiResponse(res, 200, { message: "Progress note deleted successfully", id: req.params.id });
});
