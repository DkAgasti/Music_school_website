import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@musicschool.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      passwordHash,
    },
  });

  console.log(`Admin seeded: ${adminEmail}`);

  const guitar = await prisma.class.upsert({
    where: { slug: "guitar" },
    update: {},
    create: {
      name: "Guitar",
      slug: "guitar",
      description: "Learn acoustic and electric guitar from fundamentals to advanced techniques.",
      syllabus: "Chords, strumming, fingerpicking, scales, music theory basics.",
      active: true,
    },
  });

  const piano = await prisma.class.upsert({
    where: { slug: "piano" },
    update: {},
    create: {
      name: "Piano",
      slug: "piano",
      description: "Master the keyboard with classical and modern piano training.",
      syllabus: "Posture, finger exercises, scales, chords, sight-reading, compositions.",
      active: true,
    },
  });

  const vocals = await prisma.class.upsert({
    where: { slug: "vocals" },
    update: {},
    create: {
      name: "Vocals",
      slug: "vocals",
      description: "Develop your singing voice with breath control, pitch, and stage presence.",
      syllabus: "Breathing techniques, pitch training, raga basics, performance skills.",
      active: true,
    },
  });

  const batchData = [
    { classId: guitar.id, name: "Guitar Morning", schedule: "Mon/Wed/Fri 9:00 AM - 10:30 AM", capacity: 8 },
    { classId: guitar.id, name: "Guitar Evening", schedule: "Tue/Thu/Sat 6:00 PM - 7:30 PM", capacity: 8 },
    { classId: piano.id, name: "Piano Morning", schedule: "Mon/Wed/Fri 10:00 AM - 11:30 AM", capacity: 6 },
    { classId: piano.id, name: "Piano Evening", schedule: "Tue/Thu/Sat 5:00 PM - 6:30 PM", capacity: 6 },
    { classId: vocals.id, name: "Vocals Batch A", schedule: "Mon/Wed/Fri 11:00 AM - 12:30 PM", capacity: 10 },
    { classId: vocals.id, name: "Vocals Batch B", schedule: "Tue/Thu/Sat 4:00 PM - 5:30 PM", capacity: 10 },
  ];

  for (const batch of batchData) {
    await prisma.batch.upsert({
      where: { id: batch.classId + "-" + batch.name },
      update: {},
      create: batch,
    }).catch(() =>
      prisma.batch.create({ data: batch })
    );
  }

  console.log("Classes and batches seeded.");

  const feePlanData = [
    { classId: guitar.id, name: "Monthly", amount: 150000, durationMonths: 1 },
    { classId: guitar.id, name: "Quarterly", amount: 400000, durationMonths: 3 },
    { classId: guitar.id, name: "Yearly", amount: 1500000, durationMonths: 12 },
    { classId: piano.id, name: "Monthly", amount: 200000, durationMonths: 1 },
    { classId: piano.id, name: "Quarterly", amount: 550000, durationMonths: 3 },
    { classId: piano.id, name: "Yearly", amount: 2000000, durationMonths: 12 },
    { classId: vocals.id, name: "Monthly", amount: 120000, durationMonths: 1 },
    { classId: vocals.id, name: "Quarterly", amount: 320000, durationMonths: 3 },
    { classId: vocals.id, name: "Yearly", amount: 1200000, durationMonths: 12 },
  ];

  for (const fp of feePlanData) {
    await prisma.feePlan.create({ data: fp }).catch(() => {});
  }

  console.log("Fee plans seeded.");
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
