/*
  Warnings:

  - You are about to drop the column `amountPerTask` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `proofType` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `remainingSlots` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `totalSlots` on the `Task` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_createdBy_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "amountPerTask",
DROP COLUMN "createdBy",
DROP COLUMN "proofType",
DROP COLUMN "remainingSlots",
DROP COLUMN "totalSlots",
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "reward" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
