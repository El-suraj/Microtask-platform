import pkg from "@prisma/client";
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
