/*
  Warnings:

  - You are about to drop the column `durationMonths` on the `Batch` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Batch" DROP COLUMN "durationMonths";

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "durationMonths" INTEGER;
