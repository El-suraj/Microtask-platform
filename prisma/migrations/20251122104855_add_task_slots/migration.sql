/*
  Warnings:

  - Added the required column `remainingSlots` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalSlots` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "remainingSlots" INTEGER NOT NULL,
ADD COLUMN     "totalSlots" INTEGER NOT NULL;
