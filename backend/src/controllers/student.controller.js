import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const trackStudentProgress = asyncHandler(async (req, res, next) => {
  const { phone, email } = req.query;

  if (!phone && !email) {
    return next(new ApiError(400, "Please provide a registered phone number or email"));
  }

  const where = {};
  if (phone) where.phone = phone;
  if (email) where.email = email;

  const student = await prisma.student.findFirst({
    where,
    include: {
      class: { include: { teachers: true } },
      batch: true,
      attendance: { orderBy: { date: "desc" } },
      progress: {
        orderBy: { date: "desc" },
        include: { author: { select: { name: true } } },
      },
      payments: { orderBy: { createdAt: "desc" } },
      admission: { include: { feePlan: true } },
    },
  });

  if (!student) {
    return next(new ApiError(404, "No enrolled student found with this phone number or email"));
  }

  const total = student.attendance.length;
  const present = student.attendance.filter((a) => a.status === "PRESENT").length;
  const late = student.attendance.filter((a) => a.status === "LATE").length;
  const absent = student.attendance.filter((a) => a.status === "ABSENT").length;
  const effectivePresent = present + late;
  const percentage = total > 0 ? Math.round((effectivePresent / total) * 100) : 100;

  const paidPayments = (student.payments || []).filter((p) => p.status === "PAID");
  const totalPaidPaise = paidPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalFeePaidRupees = Math.round(totalPaidPaise / 100);


  const teacherName = student.class?.teachers?.[0]?.name || "Assigned Faculty";

  return ApiResponse(res, 200, {
    studentId: student.id,
    studentName: student.name,
    email: student.email,
    phone: student.phone,
    guardianName: student.guardianName,
    address: student.address,
    dob: student.dob,
    joinedDate: student.joinedDate,
    active: student.active,
    dashboardMetrics: {
      enrolledClassesCount: 1,
      attendancePercentage: `${percentage}%`,
      progressStatus: percentage >= 75 ? "On Track" : "Needs Attention",
      totalFeePaidRupees,
    },
    enrolledClasses: [
      {
        id: student.class?.id,
        name: student.class?.name,
        teacher: teacherName,
        schedule: student.batch?.schedule,
        batchName: student.batch?.name,
        status: student.active ? "Active" : "Inactive",
      },
    ],
    attendanceReport: {
      totalClasses: total,
      presentClasses: present,
      lateClasses: late,
      absentClasses: absent,
      attendancePercentage: `${percentage}%`,
      recentRecords: student.attendance.slice(0, 10).map((a) => ({
        id: a.id,
        date: a.date,
        status: a.status,
        className: student.class?.name,
        schedule: student.batch?.schedule,
      })),
    },
    progressNotes: student.progress.map((p) => ({
      id: p.id,
      date: p.date,
      note: p.note,
      rating: p.rating ? `${p.rating}/5` : "N/A",
      teacherName: p.author?.name || teacherName,
      className: student.class?.name,
    })),
    payments: student.payments,
    admission: student.admission,
  });
});

export const listStudents = asyncHandler(async (req, res) => {
  const { classId, batchId, active, search } = req.query;

  const where = {};
  if (classId) where.classId = classId;
  if (batchId) where.batchId = batchId;
  if (active !== undefined) where.active = active === "true";
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  const students = await prisma.student.findMany({
    where,
    include: {
      class: { select: { id: true, name: true, slug: true } },
      batch: { select: { id: true, name: true, schedule: true } },
      admission: { select: { id: true, status: true, feePlanId: true } },
    },
    orderBy: { joinedDate: "desc" },
  });

  return ApiResponse(res, 200, students);
});

export const getStudent = asyncHandler(async (req, res, next) => {
  const student = await prisma.student.findUnique({
    where: { id: req.params.id },
    include: {
      class: true,
      batch: true,
      admission: { include: { feePlan: true } },
      attendance: { orderBy: { date: "desc" }, take: 20 },
      progress: {
        orderBy: { date: "desc" },
        include: { author: { select: { id: true, name: true, email: true } } },
      },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!student) return next(new ApiError(404, "Student not found"));

  // Calculate attendance statistics
  const totalClasses = await prisma.attendance.count({ where: { studentId: student.id } });
  const presentCount = await prisma.attendance.count({
    where: { studentId: student.id, status: { in: ["PRESENT", "LATE"] } },
  });
  const attendanceRate = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 100;

  return ApiResponse(res, 200, {
    ...student,
    attendanceStats: {
      totalClasses,
      presentCount,
      absentCount: totalClasses - presentCount,
      attendancePercentage: `${attendanceRate}%`,
    },
  });
});

export const createStudent = asyncHandler(async (req, res, next) => {
  const { name, email, phone, classId, batchId, dob, guardianName, address } = req.body;

  if (!name || !email || !phone || !classId || !batchId) {
    return next(new ApiError(400, "Missing required fields: name, email, phone, classId, batchId"));
  }

  const student = await prisma.student.create({
    data: {
      name,
      email,
      phone,
      classId,
      batchId,
      dob: dob ? new Date(dob) : null,
      guardianName: guardianName || null,
      address: address || null,
      active: true,
    },
    include: { class: true, batch: true },
  });

  return ApiResponse(res, 201, student);
});

export const updateStudent = asyncHandler(async (req, res, next) => {
  const { name, email, phone, classId, batchId, active, guardianName, address, dob } = req.body;

  const data = {};
  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;
  if (phone !== undefined) data.phone = phone;
  if (classId !== undefined) data.classId = classId;
  if (batchId !== undefined) data.batchId = batchId;
  if (active !== undefined) data.active = Boolean(active);
  if (guardianName !== undefined) data.guardianName = guardianName;
  if (address !== undefined) data.address = address;
  if (dob !== undefined) data.dob = dob ? new Date(dob) : null;

  const student = await prisma.student.update({
    where: { id: req.params.id },
    data,
    include: { class: true, batch: true },
  });

  return ApiResponse(res, 200, student);
});

export const getStudentHistory = asyncHandler(async (req, res, next) => {
  const student = await prisma.student.findUnique({
    where: { id: req.params.id },
    include: {
      class: { include: { teachers: true } },
      batch: true,
      admission: { include: { feePlan: true, payment: true } },
      attendance: { orderBy: { date: "desc" } },
      progress: {
        orderBy: { date: "desc" },
        include: { author: { select: { id: true, name: true } } },
      },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!student) return next(new ApiError(404, "Student not found"));

  const totalClasses = student.attendance.length;
  const presentCount = student.attendance.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
  const absentCount = student.attendance.filter((a) => a.status === "ABSENT").length;
  const attendanceRate = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 100;

  const paidPayments = (student.payments || []).filter((p) => p.status === "PAID");
  const totalPaidPaise = paidPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalFeePaidRupees = Math.round(totalPaidPaise / 100);


  const teacherName = student.class?.teachers?.[0]?.name || "Assigned Faculty";

  return ApiResponse(res, 200, {
    studentProfile: {
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      dob: student.dob,
      guardianName: student.guardianName,
      address: student.address,
      joinedDate: student.joinedDate,
      active: student.active,
      enrolledClass: student.class?.name,
      currentBatch: student.batch?.name,
      batchSchedule: student.batch?.schedule,
      teacherName,
    },
    dashboardMetrics: {
      enrolledClassesCount: 1,
      attendancePercentage: `${attendanceRate}%`,
      progressStatus: attendanceRate >= 75 ? "On Track" : "Needs Attention",
      totalFeePaidRupees,
    },
    enrolledClasses: [
      {
        id: student.class?.id,
        name: student.class?.name,
        teacher: teacherName,
        schedule: student.batch?.schedule,
        batchName: student.batch?.name,
        status: student.active ? "Active" : "Inactive",
      },
    ],
    attendanceHistory: {
      total: totalClasses,
      present: presentCount,
      absent: absentCount,
      percentage: `${attendanceRate}%`,
      records: student.attendance.map((a) => ({
        id: a.id,
        date: a.date,
        status: a.status,
        className: student.class?.name || "Class",
        schedule: student.batch?.schedule || "Scheduled Time",
      })),
    },
    progressNotes: student.progress.map((p) => ({
      id: p.id,
      date: p.date,
      note: p.note,
      rating: p.rating ? `${p.rating}/5` : "N/A",
      teacherName: p.author?.name || teacherName,
      className: student.class?.name,
    })),
    paymentHistory: student.payments,
    admissionDetails: student.admission,
  });
});

export const deleteStudent = asyncHandler(async (req, res, next) => {
  const student = await prisma.student.findUnique({ where: { id: req.params.id } });
  if (!student) return next(new ApiError(404, "Student not found"));

  await prisma.student.delete({ where: { id: req.params.id } });
  return ApiResponse(res, 200, { message: "Student deleted successfully", id: req.params.id });
});
