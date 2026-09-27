import { prisma } from "../config/db.js";
import { sendFeeDueReminderEmail } from "./email.service.js";

// Send a reminder 5, 3, and 1 day(s) before the due date, then once every
// day it stays unpaid past the due date.
const REMINDER_DAYS_BEFORE = [5, 3, 1];

// A student's real due date depends on what they actually paid for — a
// Monthly plan is due again in 1 month, a Yearly plan in 12 — so this is
// computed per enrollment from that enrollment's own fee plan duration and
// its own last paid cycle, not a shared calendar month like the admin Fees
// dashboard uses.
export async function getFeeDueEnrollments() {
  const enrollments = await prisma.enrollment.findMany({
    where: { active: true, student: { active: true }, feePlanId: { not: null } },
    include: {
      student: { select: { id: true, name: true, email: true } },
      class: { select: { name: true } },
      feePlan: true,
      // ADMISSION payments count too — this app's admission fee already
      // covers the student's first fee cycle (see admin fee-status logic).
      payments: {
        where: { purpose: { in: ["FEE", "ADMISSION"] }, status: "PAID" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return enrollments.map((enrollment) => {
    const cycleStart = enrollment.payments[0]?.createdAt || enrollment.joinedDate;
    const dueDate = new Date(cycleStart);
    dueDate.setMonth(dueDate.getMonth() + enrollment.feePlan.durationMonths);
    dueDate.setHours(0, 0, 0, 0);

    const daysUntilDue = Math.round((dueDate - today) / (1000 * 60 * 60 * 24));

    return { enrollment, dueDate, daysUntilDue };
  });
}

// Meant to run once a day (see the node-cron schedule in src/index.js, and
// the /api/cron/fee-reminders route for platforms where an external
// scheduler triggers it instead of an always-on process).
export async function runFeeDueReminders() {
  const dueList = await getFeeDueEnrollments();
  let sentCount = 0;

  for (const { enrollment, dueDate, daysUntilDue } of dueList) {
    const isReminderDay = REMINDER_DAYS_BEFORE.includes(daysUntilDue);
    const isOverdue = daysUntilDue <= 0;
    if (!isReminderDay && !isOverdue) continue;

    const feeRupees = Math.round(enrollment.feePlan.amount / 100);
    const dueDateLabel = dueDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    sendFeeDueReminderEmail(
      enrollment.student.email,
      enrollment.student.name,
      feeRupees,
      dueDateLabel,
      daysUntilDue,
      enrollment.class?.name
    ).catch(() => {});
    sentCount += 1;
  }

  return sentCount;
}
