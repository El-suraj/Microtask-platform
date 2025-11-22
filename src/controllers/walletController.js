import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// GET /wallet/me
export const getMyWallet = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, walletBalance: true }
    });
    res.json(user);
  } catch (err) {
    console.error('getMyWallet error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /wallet/withdraw  (create withdrawal request)
export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, bankName, accountNumber } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.walletBalance < Number(amount)) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: req.user.id,
        amount: Number(amount),
        bankName,
        accountNumber,
        status: 'pending'
      }
    });

    res.status(201).json({ message: 'Withdrawal requested', withdrawal });
  } catch (err) {
    console.error('requestWithdrawal error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /wallet/withdrawals (admin view or user-specific)
export const listWithdrawals = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const all = await prisma.withdrawal.findMany({
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(all);
    } else {
      const mine = await prisma.withdrawal.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(mine);
    }
  } catch (err) {
    console.error('listWithdrawals error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /wallet/withdrawals/:id/approve  (admin)
export const approveWithdrawal = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Admin only wc1' });

    const id = Number(req.params.id);
    const w = await prisma.withdrawal.findUnique({ where: { id } });
    if (!w) return res.status(404).json({ message: 'Withdrawal not found' });
    if (w.status !== 'pending') return res.status(400).json({ message: 'Already processed' });

    // Deduct user wallet and mark withdrawal approved
    await prisma.$transaction([
      prisma.user.update({
        where: { id: w.userId },
        data: { walletBalance: { decrement: Number(w.amount) } }
      }),
      prisma.withdrawal.update({
        where: { id },
        data: { status: 'approved' }
      })
    ]);

    res.json({ message: 'Withdrawal approved' });
  } catch (err) {
    console.error('approveWithdrawal error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const rejectWithdrawal = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only wc2' });

    const id = Number(req.params.id);
    const w = await prisma.withdrawal.findUnique({ where: { id } });
    if (!w) return res.status(404).json({ message: 'Withdrawal not found' });
    if (w.status !== 'pending') return res.status(400).json({ message: 'Already processed' });

    await prisma.withdrawal.update({
      where: { id },
      data: { status: 'rejected' }
    });

    res.json({ message: 'Withdrawal rejected' });
  } catch (err) {
    console.error('rejectWithdrawal error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
