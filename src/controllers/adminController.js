import pkg from "@prisma/client";
import { parse } from "dotenv";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Approve a submission: credit user wallet by task.amountPerTask and mark submission approved
export const approveSubmission = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Admin only ac1' });

    const id = Number(req.params.id);
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { task: true, user: true }
    });

    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    if (submission.status !== 'pending') return res.status(400).json({ message: 'Already processed' });

    // determine numeric amount to credit (handle Decimal / string / number)
    const rawAmount = submission?.task?.amountPerTask ?? submission?.task?.reward ?? null;
    const amount = rawAmount == null
      ? null
      : (typeof rawAmount === 'object' && typeof rawAmount.toNumber === 'function'
          ? rawAmount.toNumber()
          : Number(rawAmount));

    if (amount == null || Number.isNaN(amount)) {
      return res.status(400).json({ message: 'Task amount is invalid or missing' });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: submission.userId },
        data: { walletBalance: { increment: amount } }
      }),
      prisma.submission.update({
        where: { id },
        data: { status: 'approved', reviewedBy: req.user.id }
      }),
      prisma.task.update({
        where: { id: submission.taskId },
        data: { remainingSlots: { decrement: 1 } }
      })
    ]);

    res.json({ message: 'Submission approved and user credited' });
  } catch (err) {
    console.error('approveSubmission error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const rejectSubmission = async (req, res) => {
  try {
    // use same uppercase role check
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Admin only ac2' });

    const id = Number(req.params.id);
    const submission = await prisma.submission.findUnique({ where: { id } });
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    if (submission.status !== 'pending') return res.status(400).json({ message: 'Already processed' });

    await prisma.submission.update({
      where: { id },
      data: { status: 'rejected', reviewedBy: req.user.id }
    });

    res.json({ message: 'Submission rejected' });
  } catch (err) {
    console.error('rejectSubmission error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" }
    });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" }
    });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      include: { user: true, task: true },
      orderBy: { createdAt: "desc" }
    });

    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await prisma.withdrawal.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" }
    });

    res.json({ withdrawals });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllAppeals = async (req, res) => {
  try {
    const appeals = await prisma.appeal.findMany({ 
      include: { submission: true },
      orderBy: { createdAt: "desc" }
    }); 
    res.json({ appeals });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//Resolve an appeal by rejecting or approving the associated submission
export const resolveAppeal = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Admin only ac3' });  
    const appealId = Number(req.params.id);
    const { action, adminMessage } = req.body; // 'approve' or 'reject'
    const appeal = await prisma.appeal.findUnique({ where: { id: appealId }, include: { submission: true } });

    if (!appeal) return res.status(404).json({ message: 'Appeal not found' });
    const submission = await prisma.submission.findUnique({ 
      where: { id: appeal.submissionId } 
    });
    const task = await prisma.task.findUnique({
      where: { id: submission.taskId }
    });
    if (decision === 'approve') {
      // Approve the submission
      await prisma.user.update({
        where: { id: submission.userId },
        data: { balance: { increment: task.reward } }
      });
      //reduce escrow
      await prisma.task.update({
        where: { id: task.id },
        data: { escrowAmount: { decrement: task.reward } }
      });
      //mark submission as approved
      await prisma.submission.update({
        where: { id: submission.id },
        data: { status: 'approved', reviewedBy: req.user.id }
      });
    }else if (decision === 'reject') {
      // Just mark submission as rejected
      await prisma.submission.update({
        where: { id: submission.id },
        data: { status: 'rejected', reviewedBy: req.user.id }
      });
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject".' });
    }

    //update appeal record
    const updatedAppeal = await prisma.appeal.update({
      where: { id: appealId },
      data: {
        status: "resolved",
        adminDecision: decision,
        adminMessage: adminMessage || null,
        resolvedAt: new Date()
    }
    });
    res.json({ message: 'Appeal resolved', action: updatedAppeal });
  } catch (err) {
    console.error('resolveAppeal error', err);
    res.status(500).json({ message: 'Error resolving appeal', error: err.message });
  }
};