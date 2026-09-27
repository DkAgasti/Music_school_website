import { prisma } from "../config/db.js";

export async function checkBatchCapacity(batchId) {
  return prisma.enrollment.count({ where: { batchId, active: true } });
}

// Turns an approved Admission into a real Enrollment (+ Student, for a
// brand-new signup). Used from both the Razorpay verify flow and the admin's
// manual "approve" action, so the two paths can never drift apart.
//
// `admission` must have been fetched with `omit: { passwordHash: false }`
// when `admission.studentId` is null (brand-new signup needs the hash to
// create the Student's login).
export async function enrollFromAdmission(admission) {
  let student;

  if (admission.studentId) {
    // An already-logged-in student applying to join another class.
    student = await prisma.student.findUnique({ where: { id: admission.studentId } });
  } else {
    // Brand-new signup — reuse the student if this admission was already
    // processed once (defensive, shouldn't normally happen).
    student = await prisma.student.findUnique({ where: { email: admission.email } });
    if (!student) {
      student = await prisma.student.create({
        data: {
          name: admission.studentName,
          dob: admission.dob,
          email: admission.email,
          phone: admission.phone,
          guardianName: admission.guardianName,
          address: admission.address,
          passwordHash: admission.passwordHash,
          active: true,
        },
      });
    }
  }

  let enrollment = await prisma.enrollment.findUnique({ where: { admissionId: admission.id } });
  if (!enrollment) {
    enrollment = await prisma.enrollment.create({
      data: {
        studentId: student.id,
        classId: admission.classId,
        batchId: admission.batchId,
        feePlanId: admission.feePlanId,
        admissionId: admission.id,
        active: true,
      },
    });
  }

  return { student, enrollment };
}
