-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "resetOtpExpiresAt" TIMESTAMP(3),
ADD COLUMN     "resetOtpHash" TEXT;
