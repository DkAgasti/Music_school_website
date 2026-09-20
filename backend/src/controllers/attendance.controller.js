import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const markAttendance = asyncHandler(async (req, res, next) => {
  const { studentId, date, status } = req.body;

  if (!studentId || !date || !status) {
    return next(new ApiError(400, "studentId, date, and status (PRESENT, ABSENT, LATE) are required"));
  }

  const validStatuses = ["PRESENT", "ABSENT", "LATE"];
  if (!validStatuses.includes(status)) {
    return next(new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`));
  }

  // Normalize date to start of day (midnight) to allow 1 record per student per day
  const normalizedDate = new Date(new Date(date).setUTCHours(0, 0, 0, 0));

  const record = await prisma.attendance.upsert({
    where: {
      studentId_date: {
        studentId,
        date: normalizedDate,
      },
    },
    update: { status },
    create: {
      studentId,
      date: normalizedDate,
      status,
    },
    include: {
      student: { select: { id: true, name: true } },
    },
  });

  return ApiResponse(res, 201, record);
});

export const markBulkAttendance = asyncHandler(async (req, res, next) => {
  const { date, records } = req.body;
  // records: [ { studentId: "...", status: "PRESENT" | "ABSENT" | "LATE" } ]

  if (!date || !Array.isArray(records) || records.length === 0) {
    return next(new ApiError(400, "date and an array of records [{ studentId, status }] are required"));
  }

  const normalizedDate = new Date(new Date(date).setUTCHours(0, 0, 0, 0));

  const results = await Promise.all(
    records.map(async (r) => {
      return prisma.attendance.upsert({
        where: {
          studentId_date: {
            studentId: r.studentId,
            date: normalizedDate,
          },
        },
        update: { status: r.status },
        create: {
          studentId: r.studentId,
          date: normalizedDate,
          status: r.status,
        },
      });
    })
  );

  return ApiResponse(res, 200, {
    date: normalizedDate,
    savedCount: results.length,
    records: results,
  });
});

export const listAttendance = asyncHandler(async (req, res) => {
  const { studentId, batchId, classId, date } = req.query;

  const where = {};
  if (studentId) where.studentId = studentId;
  if (batchId) where.student = { batchId };
  if (classId) where.student = { classId };
  if (date) {
    const start = new Date(new Date(date).setUTCHours(0, 0, 0, 0));
    const end = new Date(new Date(date).setUTCHours(23, 59, 59, 999));
    where.date = { gte: start, lte: end };
  }

  const records = await prisma.attendance.findMany({
    where,
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          batch: { select: { id: true, name: true } },
          class: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { date: "desc" },
  });

  return ApiResponse(res, 200, records);
});

export const getStudentAttendanceStats = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      class: { select: { name: true } },
      batch: { select: { name: true, schedule: true } },
    },
  });
  if (!student) return next(new ApiError(404, "Student not found"));

  const records = await prisma.attendance.findMany({
    where: { studentId },
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
    className: student.class?.name || "Class",
    schedule: student.batch?.schedule || "Scheduled Time",
    batchName: student.batch?.name || "",
  }));

  return ApiResponse(res, 200, {
    studentId,
    studentName: student.name,
    enrolledClass: student.class?.name,
    batchSchedule: student.batch?.schedule,
    totalSessions: total,
    presentCount: present,
    lateCount: late,
    absentCount: absent,
    attendancePercentage: `${percentage}%`,
    records: formattedRecords,
  });
});

