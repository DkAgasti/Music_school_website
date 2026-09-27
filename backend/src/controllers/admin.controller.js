import { prisma } from "../config/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboardOverview = asyncHandler(async (req, res) => {
  // All the dashboard's counts/sums in ONE round trip instead of 13
  // separate ones — each round trip to this DB costs real time (it's on a
  // different continent from where this app usually runs), so collapsing
  // independent aggregates into a single query is a genuine perf win, not
  // just tidiness.
  const [counts] = await prisma.$queryRaw`
    SELECT
      (SELECT COUNT(*) FROM "Admission") AS "totalAdmissions",
      (SELECT COUNT(*) FROM "Admission" WHERE status = 'PENDING') AS "pendingAdmissions",
      (SELECT COUNT(*) FROM "Admission" WHERE status = 'APPROVED') AS "approvedAdmissions",
      (SELECT COUNT(*) FROM "Student") AS "totalStudents",
      (SELECT COUNT(*) FROM "Student" WHERE active = true) AS "activeStudents",
      (SELECT COUNT(*) FROM "Class" WHERE active = true) AS "totalClasses",
      (SELECT COUNT(*) FROM "Batch" WHERE active = true) AS "totalBatches",
      (SELECT COUNT(*) FROM "Enquiry" WHERE handled = false) AS "pendingEnquiries",
      (SELECT COUNT(*) FROM "Order") AS "totalOrders",
      (SELECT COUNT(*) FROM "Order" WHERE status = 'PAID') AS "paidOrders",
      (SELECT COALESCE(SUM(amount), 0) FROM "Payment" WHERE status = 'PAID') AS "totalRevenuePaise",
      (SELECT COUNT(*) FROM "Attendance") AS "totalAttendance",
      (SELECT COUNT(*) FROM "Attendance" WHERE status IN ('PRESENT', 'LATE')) AS "presentAttendance"
  `;

  const [recentAdmissions, recentOrders, recentEnquiries] = await Promise.all([
    prisma.admission.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        class: { select: { name: true } },
        batch: { select: { name: true } },
        feePlan: { select: { amount: true } },
        payment: { select: { amount: true, status: true } },
      },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { product: { select: { name: true, price: true } } },
    }),
    prisma.enquiry.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Postgres COUNT/SUM come back as BigInt via $queryRaw — convert to Number
  // before they hit JSON (BigInt isn't JSON-serializable and would 500).
  const totalAdmissions = Number(counts.totalAdmissions);
  const pendingAdmissions = Number(counts.pendingAdmissions);
  const approvedAdmissions = Number(counts.approvedAdmissions);
  const totalStudents = Number(counts.totalStudents);
  const activeStudents = Number(counts.activeStudents);
  const totalClasses = Number(counts.totalClasses);
  const totalBatches = Number(counts.totalBatches);
  const pendingEnquiries = Number(counts.pendingEnquiries);
  const totalOrders = Number(counts.totalOrders);
  const paidOrders = Number(counts.paidOrders);
  const totalRevenuePaise = Number(counts.totalRevenuePaise);
  const totalAttendance = Number(counts.totalAttendance);
  const presentAttendance = Number(counts.presentAttendance);

  const attendanceRate = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 100;

  return ApiResponse(res, 200, {
    stats: {
      admissions: {
        total: totalAdmissions,
        pending: pendingAdmissions,
        approved: approvedAdmissions,
      },
      students: {
        total: totalStudents,
        active: activeStudents,
      },
      classes: {
        total: totalClasses,
        batches: totalBatches,
      },
      attendanceRate: `${attendanceRate}%`,
      enquiries: {
        pending: pendingEnquiries,
      },
      orders: {
        total: totalOrders,
        paid: paidOrders,
      },
      revenue: {
        totalPaise: totalRevenuePaise,
        totalRupees: Math.round(totalRevenuePaise / 100),
      },
    },
    recent: {
      admissions: recentAdmissions,
      orders: recentOrders,
      enquiries: recentEnquiries,
    },
  });
});

import { sendFeeReminderEmail } from "../services/email.service.js";

export const getFeeStatusOverview = asyncHandler(async (req, res) => {
  const { month, year, status, page, limit } = req.query;

  const now = new Date();
  const targetYear = year ? parseInt(year, 10) : now.getFullYear();
  const targetMonth = month ? parseInt(month, 10) - 1 : now.getMonth();

  const startOfMonth = new Date(targetYear, targetMonth, 1);
  const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

  const monthName = startOfMonth.toLocaleString("default", { month: "long" }) + " " + targetYear;
  const dueDate = startOfMonth.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  // Step 1: a LIGHTWEIGHT pass over every active enrollment — just enough to
  // work out each one's paid/pending status and the month's totals — instead
  // of pulling full student/class details for every row just to compute an
  // aggregate. This still touches every row (paid/pending genuinely depends
  // on each enrollment's own payments), but it's a much smaller payload than
  // before, and only THIS pass runs over the full unpaginated set.
  const allEnrollments = await prisma.enrollment.findMany({
    where: { active: true, student: { active: true } },
    select: {
      id: true,
      feePlan: { select: { amount: true } },
      class: { select: { feePlans: { take: 1, orderBy: { amount: "asc" }, select: { amount: true } } } },
      payments: {
        where: { purpose: { in: ["FEE", "ADMISSION"] }, createdAt: { gte: startOfMonth, lte: endOfMonth } },
        select: { id: true, amount: true, status: true },
      },
    },
  });

  let collectedPaise = 0;
  let pendingPaise = 0;
  let pendingCount = 0;
  const paidIds = [];
  const pendingIds = [];

  for (const e of allEnrollments) {
    const feePlanAmount = e.feePlan?.amount || e.class?.feePlans?.[0]?.amount || 250000;
    const paidPayment = e.payments.find((p) => p.status === "PAID");
    if (paidPayment) {
      collectedPaise += paidPayment.amount;
      paidIds.push(e.id);
    } else {
      pendingPaise += feePlanAmount;
      pendingCount += 1;
      pendingIds.push(e.id);
    }
  }

  const matchingIds =
    status && status.toLowerCase() === "paid"
      ? paidIds
      : status && status.toLowerCase() === "pending"
      ? pendingIds
      : [...paidIds, ...pendingIds];

  // Step 2: only fetch full student/class details for the page actually
  // being displayed.
  const isPaginated = page !== undefined;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const pageIds = isPaginated ? matchingIds.slice((pageNum - 1) * pageSize, pageNum * pageSize) : matchingIds;

  const pageEnrollments = pageIds.length
    ? await prisma.enrollment.findMany({
        where: { id: { in: pageIds } },
        include: {
          student: { select: { id: true, name: true, email: true, phone: true } },
          class: { select: { id: true, name: true, feePlans: { take: 1, orderBy: { amount: "asc" } } } },
          feePlan: true,
          payments: {
            where: { purpose: { in: ["FEE", "ADMISSION"] }, createdAt: { gte: startOfMonth, lte: endOfMonth } },
          },
        },
      })
    : [];
  // `where: id IN (...)` doesn't preserve order — put the page back in the
  // same order matchingIds already established.
  const pageEnrollmentById = new Map(pageEnrollments.map((e) => [e.id, e]));
  const orderedPageEnrollments = pageIds.map((id) => pageEnrollmentById.get(id)).filter(Boolean);

  const rows = orderedPageEnrollments.map((e) => {
    const feePlanAmount = e.feePlan?.amount || e.class?.feePlans?.[0]?.amount || 250000;
    const paidPayment = e.payments.find((p) => p.status === "PAID");
    const isPaid = Boolean(paidPayment);
    return {
      studentId: e.student.id,
      studentName: e.student.name,
      email: e.student.email,
      phone: e.student.phone,
      enrollmentId: e.id,
      className: e.class?.name || "Music Course",
      feePaise: feePlanAmount,
      feeRupees: Math.round(feePlanAmount / 100),
      dueDate,
      status: isPaid ? "Paid" : "Pending",
      paymentId: paidPayment?.id || null,
    };
  });

  const response = {
    month: monthName,
    collectedThisMonthPaise: collectedPaise,
    collectedThisMonthRupees: Math.round(collectedPaise / 100),
    pendingDuesPaise: pendingPaise,
    pendingDuesRupees: Math.round(pendingPaise / 100),
    studentsPendingCount: pendingCount,
    totalActiveStudents: allEnrollments.length,
    students: rows,
  };

  if (isPaginated) {
    response.page = pageNum;
    response.limit = pageSize;
    response.total = matchingIds.length;
    response.totalPages = Math.max(1, Math.ceil(matchingIds.length / pageSize));
  }

  return ApiResponse(res, 200, response);
});

// Only reminds students who actually have an unpaid fee for the current
// month, each with THEIR OWN real amount/due date — not a flat blast of
// hardcoded values to every active student regardless of what they owe.
export const sendAllFeeReminders = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const dueDateLabel = startOfMonth.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { active: true, student: { active: true } },
    include: {
      student: { select: { id: true, name: true, email: true } },
      class: { select: { feePlans: { take: 1, orderBy: { amount: "asc" } } } },
      feePlan: true,
      payments: {
        where: { purpose: { in: ["FEE", "ADMISSION"] }, createdAt: { gte: startOfMonth, lte: endOfMonth } },
      },
    },
  });

  const pendingEnrollments = enrollments.filter((e) => !e.payments.some((p) => p.status === "PAID"));

  for (const e of pendingEnrollments) {
    const feePlanAmount = e.feePlan?.amount || e.class?.feePlans?.[0]?.amount || 250000;
    const feeRupees = Math.round(feePlanAmount / 100);
    sendFeeReminderEmail(e.student.email, e.student.name, feeRupees, dueDateLabel).catch(() => {});
  }

  return ApiResponse(res, 200, {
    success: true,
    message: `Fee reminders triggered for ${pendingEnrollments.length} students with pending dues.`,
    sentCount: pendingEnrollments.length,
  });
});


