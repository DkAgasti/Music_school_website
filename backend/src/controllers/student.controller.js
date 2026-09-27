import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Fetches a student's full profile as several PARALLEL queries instead of
// one findUnique with deeply nested relations (measured much slower on
// Postgres — see git history). A student can now have several active
// Enrollments (one per class); attendance/progress/payments all key off
// `enrollmentId`, so they're fetched via a nested `enrollment.studentId`
// filter rather than a direct `studentId` column.
async function loadFullStudentProfile(where) {
  const student = await prisma.student.findFirst({
    where,
    include: {
      enrollments: {
        where: { active: true },
        include: { class: { include: { teachers: true } }, batch: true, feePlan: true },
        orderBy: { joinedDate: "asc" },
      },
    },
  });

  if (!student) return null;

  const [attendance, progress, payments, admissions] = await Promise.all([
    prisma.attendance.findMany({
      where: { enrollment: { studentId: student.id } },
      orderBy: { date: "desc" },
    }),
    prisma.progressNote.findMany({
      where: { enrollment: { studentId: student.id } },
      orderBy: { date: "desc" },
      include: { author: { select: { name: true } } },
    }),
    prisma.payment.findMany({
      where: { studentId: student.id },
      include: { order: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.admission.findMany({
      where: { OR: [{ studentId: student.id }, { enrollment: { studentId: student.id } }] },
      include: { class: true, batch: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { ...student, attendance, progress, payments, admissions };
}

function buildStudentProfileResponse(student) {
  const enrollmentById = new Map(student.enrollments.map((e) => [e.id, e]));
  const classNameFor = (enrollmentId) => enrollmentById.get(enrollmentId)?.class?.name || "Class";
  const scheduleFor = (enrollmentId) => enrollmentById.get(enrollmentId)?.batch?.schedule;

  const total = student.attendance.length;
  const present = student.attendance.filter((a) => a.status === "PRESENT").length;
  const late = student.attendance.filter((a) => a.status === "LATE").length;
  const absent = student.attendance.filter((a) => a.status === "ABSENT").length;
  const effectivePresent = present + late;
  const percentage = total > 0 ? Math.round((effectivePresent / total) * 100) : 100;

  const paidPayments = (student.payments || []).filter((p) => p.status === "PAID");
  const totalPaidPaise = paidPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalFeePaidRupees = Math.round(totalPaidPaise / 100);

  const nextMonthDate = new Date();
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1, 1);

  // Per-class fee breakdown — lets the frontend show/choose which
  // enrollment a "Pay Fees" click applies to.
  const classesSummary = student.enrollments.map((e) => {
    const paidForEnrollment = paidPayments
      .filter((p) => p.enrollmentId === e.id)
      .reduce((acc, p) => acc + p.amount, 0);
    const feePlanAmountPaise = e.feePlan?.amount || 0;
    const pendingPaise = Math.max(feePlanAmountPaise - paidForEnrollment, 0);
    return {
      enrollmentId: e.id,
      className: e.class?.name,
      feePlanName: e.feePlan?.name || null,
      feePlanAmountRupees: feePlanAmountPaise ? Math.round(feePlanAmountPaise / 100) : null,
      pendingDuesRupees: Math.round(pendingPaise / 100),
    };
  });
  const pendingDuesRupeesTotal = classesSummary.reduce((acc, c) => acc + c.pendingDuesRupees, 0);

  return {
    studentId: student.id,
    studentName: student.name,
    email: student.email,
    phone: student.phone,
    photoUrl: student.photoUrl,
    guardianName: student.guardianName,
    guardianPhone: student.guardianPhone,
    address: student.address,
    dob: student.dob,
    joinedDate: student.joinedDate,
    active: student.active,
    dashboardMetrics: {
      enrolledClassesCount: student.enrollments.length,
      attendancePercentage: `${percentage}%`,
      progressStatus: percentage >= 75 ? "On Track" : "Needs Attention",
      totalFeePaidRupees,
    },
    enrolledClasses: student.enrollments.map((e) => {
      const teacherName = e.class?.teachers?.[0]?.name || "Assigned Faculty";
      return {
        id: e.class?.id,
        enrollmentId: e.id,
        slug: e.class?.slug,
        name: e.class?.name,
        description: e.class?.description,
        syllabus: e.class?.syllabus,
        imageUrl: e.class?.imageUrl,
        durationMonths: e.feePlan?.durationMonths ?? e.class?.durationMonths ?? null,
        teacher: teacherName,
        teacherBio: e.class?.teachers?.[0]?.bio || null,
        teacherPhotoUrl: e.class?.teachers?.[0]?.photoUrl || null,
        schedule: e.batch?.schedule,
        batchName: e.batch?.name,
        batchCapacity: e.batch?.capacity,
        startedDate: e.joinedDate,
        status: e.active ? "Active" : "Inactive",
      };
    }),
    attendanceReport: {
      totalClasses: total,
      presentClasses: present,
      lateClasses: late,
      absentClasses: absent,
      attendancePercentage: `${percentage}%`,
      allRecords: student.attendance.map((a) => ({
        id: a.id,
        date: a.date,
        status: a.status,
        className: classNameFor(a.enrollmentId),
        schedule: scheduleFor(a.enrollmentId),
      })),
    },
    progressNotes: student.progress.map((p) => ({
      id: p.id,
      date: p.date,
      note: p.note,
      rating: p.rating,
      teacherName: p.author?.name || "Assigned Faculty",
      className: classNameFor(p.enrollmentId),
    })),
    paymentsSummary: {
      totalPaidRupees: totalFeePaidRupees,
      pendingDuesRupees: pendingDuesRupeesTotal,
      nextDueDate: nextMonthDate,
      // Kept for backward compatibility with a single-class display —
      // reflects the first active enrollment's plan. Prefer `classes` below.
      feePlanAmountRupees: classesSummary[0]?.feePlanAmountRupees ?? null,
      feePlanName: classesSummary[0]?.feePlanName ?? null,
      classes: classesSummary,
      transactions: student.payments.map((p) => ({
        id: p.id,
        date: p.createdAt,
        description: p.purpose === "ADMISSION"
          ? `${classNameFor(p.enrollmentId)} - Admission Fee`
          : p.purpose === "FEE"
          ? `${classNameFor(p.enrollmentId)} - Course Fee`
          : p.purpose === "SHOP_ORDER"
          ? `Shop Order${p.order?.product?.name ? ` - ${p.order.product.name}` : ""}`
          : "Order Payment",
        amountRupees: Math.round(p.amount / 100),
        status: p.status === "PAID" ? "Paid" : p.status === "CREATED" ? "Pending" : "Failed",
      })),
    },
    admissions: (student.admissions || []).map((a) => ({
      id: a.id,
      class: a.class?.name,
      batch: a.batch?.name,
      appliedOn: a.createdAt,
      status: a.status,
    })),
  };
}

// Used by the logged-in student portal (requireStudentAuth) — identifies the
// student from the JWT, not from an open phone/email lookup.
export const getMyProfile = asyncHandler(async (req, res, next) => {
  const student = await loadFullStudentProfile({ id: req.student.id });

  if (!student) {
    return next(new ApiError(404, "Student account not found"));
  }

  return ApiResponse(res, 200, buildStudentProfileResponse(student));
});

// Self-service profile edit — only fields a student may safely change
// without admin review. Email/name/class/batch/active stay admin-only
// (updateStudent below), since they affect records, certificates, and
// login identity.
export const updateMyProfile = asyncHandler(async (req, res, next) => {
  const { phone, dob, guardianName, guardianPhone, address, photoUrl } = req.body;

  const data = {};
  if (phone !== undefined) data.phone = phone;
  if (dob !== undefined) data.dob = dob ? new Date(dob) : null;
  if (guardianName !== undefined) data.guardianName = guardianName;
  if (guardianPhone !== undefined) data.guardianPhone = guardianPhone;
  if (address !== undefined) data.address = address;
  if (photoUrl !== undefined) data.photoUrl = photoUrl;

  const student = await prisma.student.update({
    where: { id: req.student.id },
    data,
  });

  if (!student) return next(new ApiError(404, "Student account not found"));

  const fullProfile = await loadFullStudentProfile({ id: student.id });
  return ApiResponse(res, 200, buildStudentProfileResponse(fullProfile));
});

export const listStudents = asyncHandler(async (req, res) => {
  const { classId, batchId, active, search, page, limit } = req.query;

  const where = {};
  if (classId || batchId || active !== undefined) {
    where.enrollments = {
      some: {
        ...(classId ? { classId } : {}),
        ...(batchId ? { batchId } : {}),
        ...(active !== undefined ? { active: active === "true" } : {}),
      },
    };
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  // No `page` param → unpaginated array, kept for any existing caller that
  // still expects a plain list (e.g. dropdowns elsewhere in the admin app).
  const isPaginated = page !== undefined;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        enrollments: {
          where: { active: true },
          include: {
            class: { select: { id: true, name: true, slug: true } },
            batch: { select: { id: true, name: true, schedule: true } },
            feePlan: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { joinedDate: "desc" },
      ...(isPaginated ? { skip: (pageNum - 1) * pageSize, take: pageSize } : {}),
    }),
    isPaginated ? prisma.student.count({ where }) : Promise.resolve(null),
  ]);

  // One bulk query for every student's attendance instead of an N+1 per row —
  // this list can have dozens of students.
  const attendanceRecords = await prisma.attendance.findMany({
    where: { enrollment: { studentId: { in: students.map((s) => s.id) } } },
    select: { status: true, enrollment: { select: { studentId: true } } },
  });

  const attendanceByStudent = new Map();
  for (const record of attendanceRecords) {
    const studentId = record.enrollment.studentId;
    const bucket = attendanceByStudent.get(studentId) || { total: 0, present: 0 };
    bucket.total += 1;
    if (record.status === "PRESENT" || record.status === "LATE") bucket.present += 1;
    attendanceByStudent.set(studentId, bucket);
  }

  const studentsWithAttendance = students.map((s) => {
    const bucket = attendanceByStudent.get(s.id);
    const attendancePercentage = bucket && bucket.total > 0
      ? Math.round((bucket.present / bucket.total) * 100)
      : 100;
    return { ...s, attendancePercentage: `${attendancePercentage}%` };
  });

  if (!isPaginated) return ApiResponse(res, 200, studentsWithAttendance);

  return ApiResponse(res, 200, {
    items: studentsWithAttendance,
    total,
    page: pageNum,
    limit: pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
});

export const getStudent = asyncHandler(async (req, res, next) => {
  const student = await prisma.student.findUnique({
    where: { id: req.params.id },
    include: {
      enrollments: {
        include: { class: true, batch: true, feePlan: true },
        orderBy: { joinedDate: "desc" },
      },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!student) return next(new ApiError(404, "Student not found"));

  const [attendance, progress] = await Promise.all([
    prisma.attendance.findMany({
      where: { enrollment: { studentId: student.id } },
      orderBy: { date: "desc" },
      take: 20,
    }),
    prisma.progressNote.findMany({
      where: { enrollment: { studentId: student.id } },
      orderBy: { date: "desc" },
      include: { author: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  const [totalClasses, presentCount] = await Promise.all([
    prisma.attendance.count({ where: { enrollment: { studentId: student.id } } }),
    prisma.attendance.count({
      where: { enrollment: { studentId: student.id }, status: { in: ["PRESENT", "LATE"] } },
    }),
  ]);
  const attendanceRate = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 100;

  return ApiResponse(res, 200, {
    ...student,
    attendance,
    progress,
    attendanceStats: {
      totalClasses,
      presentCount,
      absentCount: totalClasses - presentCount,
      attendancePercentage: `${attendanceRate}%`,
    },
  });
});

export const createStudent = asyncHandler(async (req, res, next) => {
  const { name, email, phone, classId, batchId, feePlanId, dob, guardianName, guardianPhone, address } = req.body;

  if (!name || !email || !phone || !classId || !batchId) {
    return next(new ApiError(400, "Missing required fields: name, email, phone, classId, batchId"));
  }

  const existing = await prisma.student.findUnique({ where: { email } });
  if (existing) return next(new ApiError(409, "A student with this email already exists"));

  const student = await prisma.student.create({
    data: {
      name,
      email,
      phone,
      dob: dob ? new Date(dob) : null,
      guardianName: guardianName || null,
      guardianPhone: guardianPhone || null,
      address: address || null,
      active: true,
      enrollments: {
        create: { classId, batchId, feePlanId: feePlanId || null, active: true },
      },
    },
    include: { enrollments: { include: { class: true, batch: true } } },
  });

  return ApiResponse(res, 201, student);
});

export const updateStudent = asyncHandler(async (req, res, next) => {
  const { name, email, phone, active, guardianName, guardianPhone, address, dob } = req.body;

  const existing = await prisma.student.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new ApiError(404, "Student not found"));

  if (email !== undefined && email !== existing.email) {
    const emailTaken = await prisma.student.findUnique({ where: { email } });
    if (emailTaken) return next(new ApiError(409, "A student with this email already exists"));
  }

  const data = {};
  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;
  if (phone !== undefined) data.phone = phone;
  if (active !== undefined) data.active = Boolean(active);
  if (guardianName !== undefined) data.guardianName = guardianName;
  if (guardianPhone !== undefined) data.guardianPhone = guardianPhone;
  if (address !== undefined) data.address = address;
  if (dob !== undefined) data.dob = dob ? new Date(dob) : null;

  const student = await prisma.student.update({
    where: { id: req.params.id },
    data,
    include: { enrollments: { include: { class: true, batch: true } } },
  });

  return ApiResponse(res, 200, student);
});

export const getStudentHistory = asyncHandler(async (req, res, next) => {
  const student = await prisma.student.findUnique({
    where: { id: req.params.id },
    include: {
      enrollments: {
        where: { active: true },
        include: { class: { include: { teachers: true } }, batch: true, feePlan: true, admission: true },
        orderBy: { joinedDate: "asc" },
      },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!student) return next(new ApiError(404, "Student not found"));

  const [attendance, progress] = await Promise.all([
    prisma.attendance.findMany({ where: { enrollment: { studentId: student.id } }, orderBy: { date: "desc" } }),
    prisma.progressNote.findMany({
      where: { enrollment: { studentId: student.id } },
      orderBy: { date: "desc" },
      include: { author: { select: { id: true, name: true } } },
    }),
  ]);

  const enrollmentById = new Map(student.enrollments.map((e) => [e.id, e]));
  const classNameFor = (enrollmentId) => enrollmentById.get(enrollmentId)?.class?.name || "Class";
  const scheduleFor = (enrollmentId) => enrollmentById.get(enrollmentId)?.batch?.schedule || "Scheduled Time";

  const totalClasses = attendance.length;
  const presentCount = attendance.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
  const absentCount = attendance.filter((a) => a.status === "ABSENT").length;
  const attendanceRate = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 100;

  const paidPayments = (student.payments || []).filter((p) => p.status === "PAID");
  const totalPaidPaise = paidPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalFeePaidRupees = Math.round(totalPaidPaise / 100);

  return ApiResponse(res, 200, {
    studentProfile: {
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      dob: student.dob,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      address: student.address,
      joinedDate: student.joinedDate,
      active: student.active,
    },
    dashboardMetrics: {
      enrolledClassesCount: student.enrollments.length,
      attendancePercentage: `${attendanceRate}%`,
      progressStatus: attendanceRate >= 75 ? "On Track" : "Needs Attention",
      totalFeePaidRupees,
    },
    enrolledClasses: student.enrollments.map((e) => ({
      id: e.class?.id,
      enrollmentId: e.id,
      name: e.class?.name,
      teacher: e.class?.teachers?.[0]?.name || "Assigned Faculty",
      schedule: e.batch?.schedule,
      batchName: e.batch?.name,
      status: e.active ? "Active" : "Inactive",
    })),
    attendanceHistory: {
      total: totalClasses,
      present: presentCount,
      absent: absentCount,
      percentage: `${attendanceRate}%`,
      records: attendance.map((a) => ({
        id: a.id,
        date: a.date,
        status: a.status,
        className: classNameFor(a.enrollmentId),
        schedule: scheduleFor(a.enrollmentId),
      })),
    },
    progressNotes: progress.map((p) => ({
      id: p.id,
      date: p.date,
      note: p.note,
      rating: p.rating ? `${p.rating}/5` : "N/A",
      teacherName: p.author?.name || "Assigned Faculty",
      className: classNameFor(p.enrollmentId),
    })),
    paymentHistory: student.payments,
    admissionDetails: student.enrollments.map((e) => e.admission).filter(Boolean),
  });
});

export const deleteStudent = asyncHandler(async (req, res, next) => {
  const student = await prisma.student.findUnique({ where: { id: req.params.id } });
  if (!student) return next(new ApiError(404, "Student not found"));

  await prisma.student.delete({ where: { id: req.params.id } });
  return ApiResponse(res, 200, { message: "Student deleted successfully", id: req.params.id });
});
