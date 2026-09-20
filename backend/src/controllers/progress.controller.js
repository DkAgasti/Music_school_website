import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addProgressNote = asyncHandler(async (req, res, next) => {
  const { studentId, note, rating, date } = req.body;

  if (!studentId || !note) {
    return next(new ApiError(400, "studentId and note are required"));
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
      studentId,
      note,
      rating: rating ? parseInt(rating, 10) : null,
      date: date ? new Date(date) : new Date(),
      authorId,
    },
    include: {
      student: { select: { id: true, name: true } },
      author: { select: { id: true, name: true } },
    },
  });

  return ApiResponse(res, 201, progressRecord);
});

export const listProgress = asyncHandler(async (req, res) => {
  const { studentId } = req.query;
  const where = studentId ? { studentId } : {};

  const notes = await prisma.progressNote.findMany({
    where,
    include: {
      author: { select: { id: true, name: true } },
      student: {
        select: {
          id: true,
          name: true,
          class: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { date: "desc" },
  });

  const formattedNotes = notes.map((n) => ({
    id: n.id,
    date: n.date,
    note: n.note,
    rating: n.rating,
    className: n.student?.class?.name || "Music Course",
    teacherName: n.author?.name || "Instructor",
    studentId: n.student?.id,
    studentName: n.student?.name,
  }));

  return ApiResponse(res, 200, formattedNotes);
});

export const updateProgressNote = asyncHandler(async (req, res, next) => {
  const { note, rating, date } = req.body;

  const existing = await prisma.progressNote.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new ApiError(404, "Progress note not found"));

  const data = {};
  if (note !== undefined) data.note = note;
  if (rating !== undefined) data.rating = rating ? parseInt(rating, 10) : null;
  if (date !== undefined) data.date = new Date(date);

  const updated = await prisma.progressNote.update({
    where: { id: req.params.id },
    data,
    include: {
      author: { select: { id: true, name: true } },
      student: { select: { id: true, name: true } },
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
