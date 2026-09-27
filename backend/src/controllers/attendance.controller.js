import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const markAttendance = asyncHandler(async (req, res, next) => {
  const { enrollmentId, date, status } = req.body;

  if (!enrollmentId || !date || !status) {
    return next(new ApiError(400, "enrollmentId, date, and status (PRESENT, ABSENT, LATE) are required"));
  }

  const validStatuses = ["PRESENT", "ABSENT", "LATE"];
  if (!validStatuses.includes(status)) {
    return next(new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`));
  }

  // Normalize date to start of day (midnight) to allow 1 record per enrollment per day
  const normalizedDate = new Date(new Date(date).setUTCHours(0, 0, 0, 0));

  const record = await prisma.attendance.upsert({
    where: {
      enrollmentId_date: {
        enrollmentId,
        date: normalizedDate,
      },
    },
    update: { status },
    create: {
      enrollmentId,
      date: normalizedDate,
      status,
    },
    include: {
      enrollment: { include: { student: { select: { id: true, name: true } } } },
    },
  });

  return ApiResponse(res, 201, record);
});

export const markBulkAttendance = asyncHandler(async (req, res, next) => {
  const { date, records } = req.body;
  // records: [ { enrollmentId: "...", status: "PRESENT" | "ABSENT" | "LATE" } ]

  if (!date || !Array.isArray(records) || records.length === 0) {
    return next(new ApiError(400, "date and an array of records [{ enrollmentId, status }] are required"));
  }

  const validStatuses = ["PRESENT", "ABSENT", "LATE"];
  const invalidRecord = records.find((r) => !r.enrollmentId || !validStatuses.includes(r.status));
  if (invalidRecord) {
    return next(new ApiError(400, `Every record needs an enrollmentId and a status of PRESENT, ABSENT, or LATE`));
  }

  const normalizedDate = new Date(new Date(date).setUTCHours(0, 0, 0, 0));

  // One transaction (one round trip) instead of N independent upserts, and
  // it's all-or-nothing — a bad record can't leave the batch half-saved.
  const results = await prisma.$transaction(
    records.map((r) =>
      prisma.attendance.upsert({
        where: {
          enrollmentId_date: {
            enrollmentId: r.enrollmentId,
            date: normalizedDate,
          },
        },
        update: { status: r.status },
        create: {
          enrollmentId: r.enrollmentId,
          date: normalizedDate,
          status: r.status,
        },
      })
    )
  );

  return ApiResponse(res, 200, {
    date: normalizedDate,
    savedCount: results.length,
    records: results,
  });
});

export const listAttendance = asyncHandler(async (req, res) => {
  const { studentId, batchId, classId, date, from, to, page, limit } = req.query;

  const where = {};
  if (studentId) where.enrollment = { studentId };
  if (batchId) where.enrollment = { ...where.enrollment, batchId };
  if (classId) where.enrollment = { ...where.enrollment, classId };
  if (date) {
    const start = new Date(new Date(date).setUTCHours(0, 0, 0, 0));
    const end = new Date(new Date(date).setUTCHours(23, 59, 59, 999));
    where.date = { gte: start, lte: end };
  } else if (from || to) {
    // Lets a caller ask for "this week"/"this month" server-side instead of
    // fetching the entire attendance history and filtering it in the browser.
    where.date = {};
    if (from) where.date.gte = new Date(new Date(from).setUTCHours(0, 0, 0, 0));
    if (to) where.date.lte = new Date(new Date(to).setUTCHours(23, 59, 59, 999));
  }

  // No `page` param → unpaginated array, kept for any existing caller that
  // still expects a plain list.
  const isPaginated = page !== undefined;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));

  const [records, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      include: {
        enrollment: {
          include: {
            student: { select: { id: true, name: true, email: true } },
            batch: { select: { id: true, name: true } },
            class: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { date: "desc" },
      ...(isPaginated ? { skip: (pageNum - 1) * pageSize, take: pageSize } : {}),
    }),
    isPaginated ? prisma.attendance.count({ where }) : Promise.resolve(null),
  ]);

  if (!isPaginated) return ApiResponse(res, 200, records);

  return ApiResponse(res, 200, {
    items: records,
    total,
    page: pageNum,
    limit: pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
});

export const getStudentAttendanceStats = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return next(new ApiError(404, "Student not found"));

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId, active: true },
    include: { class: { select: { name: true } }, batch: { select: { name: true, schedule: true } } },
  });

  const records = await prisma.attendance.findMany({
    where: { enrollment: { studentId } },
    include: { enrollment: { include: { class: true, batch: true } } },
    orderBy: { date: "desc" },
  });

  const total = records.length;
  const present = records.filter((r) => r.status === "PRESENT").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const effectivePresent = present + late;
  const percentage = total > 0 ? Math.round((effectivePresent / total) * 100) : 100;

  const formattedRecords = records.map((r) => ({
    id: r.id,
    date: r.date,
    status: r.status,
    className: r.enrollment?.class?.name || "Class",
    schedule: r.enrollment?.batch?.schedule || "Scheduled Time",
    batchName: r.enrollment?.batch?.name || "",
  }));

  return ApiResponse(res, 200, {
    studentId,
    studentName: student.name,
    enrolledClasses: enrollments.map((e) => e.class?.name).filter(Boolean),
    totalSessions: total,
    presentCount: present,
    lateCount: late,
    absentCount: absent,
    attendancePercentage: `${percentage}%`,
    records: formattedRecords,
  });
});
