-- AlterTable
ALTER TABLE "Admission" ADD COLUMN "passwordHash" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN "passwordHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");
