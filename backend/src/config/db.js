import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

// Never leak password hashes through the API by default — queries that
// genuinely need to verify a password (login, change-password) explicitly
// override this per-call with `omit: { passwordHash: false }`.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    omit: {
      admin: { passwordHash: true },
      student: { passwordHash: true },
      admission: { passwordHash: true },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
