import { prisma } from "../config/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboardOverview = asyncHandler(async (req, res) => {
  const [
    totalAdmissions,
    pendingAdmissions,
    approvedAdmissions,
    totalStudents,
    activeStudents,
    totalClasses,
    totalBatches,
    pendingEnquiries,
    totalOrders,
    paidOrders,
    paymentsAggregate,
    recentAdmissions,
    recentOrders,
    recentEnquiries,
  ] = await Promise.all([
    prisma.admission.count(),
    prisma.admission.count({ where: { status: "PENDING" } }),
    prisma.admission.count({ where: { status: "APPROVED" } }),
    prisma.student.count(),
    prisma.student.count({ where: { active: true } }),
    prisma.class.count({ where: { active: true } }),
    prisma.batch.count({ where: { active: true } }),
    prisma.enquiry.count({ where: { handled: false } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" },
    }),
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

  // Calculate overall attendance percentage
  const totalAttendance = await prisma.attendance.count();
  const presentAttendance = await prisma.attendance.count({
    where: { status: { in: ["PRESENT", "LATE"] } },
  });
  const attendanceRate = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 100;

  const totalRevenuePaise = paymentsAggregate._sum.amount || 0;

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
  const { month, year, status } = req.query;

  const now = new Date();
  const targetYear = year ? parseInt(year, 10) : now.getFullYear();
  const targetMonth = month ? parseInt(month, 10) - 1 : now.getMonth();

  const startOfMonth = new Date(targetYear, targetMonth, 1);
  const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

  const monthName = startOfMonth.toLocaleString("default", { month: "long" }) + " " + targetYear;

  const students = await prisma.student.findMany({
    where: { active: true },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          feePlans: { take: 1, orderBy: { amount: "asc" } },
        },
      },
      admission: { include: { feePlan: true } },
      payments: {
        where: {
          purpose: { in: ["FEE", "ADMISSION"] },
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  let collectedPaise = 0;
  let pendingPaise = 0;
  let pendingCount = 0;

  const studentFeeRows = students.map((s) => {
    const feePlanAmount = s.admission?.feePlan?.amount || s.class?.feePlans?.[0]?.amount || 250000;
    const paidPayment = s.payments.find((p) => p.status === "PAID");
    const isPaid = Boolean(paidPayment);

    const feeRupees = Math.round(feePlanAmount / 100);
    const dueDate = new Date(targetYear, targetMonth, 1).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    if (isPaid) {
      collectedPaise += paidPayment.amount;
    } else {
      pendingPaise += feePlanAmount;
      pendingCount += 1;
    }

    return {
      studentId: s.id,
      studentName: s.name,
      email: s.email,
      phone: s.phone,
      className: s.class?.name || "Music Course",
      feePaise: feePlanAmount,
      feeRupees,
      dueDate,
      status: isPaid ? "Paid" : "Pending",
      paymentId: paidPayment?.id || null,
    };
  });

  let filteredRows = studentFeeRows;
  if (status && status.toLowerCase() === "paid") {
    filteredRows = studentFeeRows.filter((r) => r.status === "Paid");
  } else if (status && status.toLowerCase() === "pending") {
    filteredRows = studentFeeRows.filter((r) => r.status === "Pending");
  }

  return ApiResponse(res, 200, {
    month: monthName,
    collectedThisMonthPaise: collectedPaise,
    collectedThisMonthRupees: Math.round(collectedPaise / 100),
    pendingDuesPaise: pendingPaise,
    pendingDuesRupees: Math.round(pendingPaise / 100),
    studentsPendingCount: pendingCount,
    totalActiveStudents: students.length,
    students: filteredRows,
  });
});

export const sendAllFeeReminders = asyncHandler(async (req, res) => {
  const pendingStudents = await prisma.student.findMany({
    where: { active: true },
    select: { id: true, name: true, email: true },
  });

  for (const s of pendingStudents) {
    sendFeeReminderEmail(s.email, s.name, 2500, "1st of the Month").catch(() => {});
  }

  return ApiResponse(res, 200, {
    success: true,
    message: `Fee reminders triggered for ${pendingStudents.length} students.`,
    sentCount: pendingStudents.length,
  });
});


