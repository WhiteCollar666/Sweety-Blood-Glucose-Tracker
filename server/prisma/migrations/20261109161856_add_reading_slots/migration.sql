/*
  Warnings:

  - You are about to alter the column `glucoseValue` on the `GlucoseReading` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - A unique constraint covering the columns `[userId,measuredAt,slot]` on the table `GlucoseReading` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slot` to the `GlucoseReading` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReadingSlot" AS ENUM ('MORNING', 'AFTER_BREAKFAST', 'AFTER_LUNCH', 'AFTER_DINNER');

-- AlterTable
ALTER TABLE "GlucoseReading" ADD COLUMN     "slot" "ReadingSlot" NOT NULL,
ALTER COLUMN "glucoseValue" SET DATA TYPE INTEGER,
ALTER COLUMN "measuredAt" SET DATA TYPE DATE;

-- CreateIndex
CREATE UNIQUE INDEX "GlucoseReading_userId_measuredAt_slot_key" ON "GlucoseReading"("userId", "measuredAt", "slot");
