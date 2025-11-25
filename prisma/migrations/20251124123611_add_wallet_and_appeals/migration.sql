-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "escrowAmount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Appeal" (
    "id" SERIAL NOT NULL,
    "submissionId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminDecision" TEXT,
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appeal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
