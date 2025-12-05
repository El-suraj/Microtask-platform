import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

/**
 * Helpers
 */
const maskAccount = (acct = "") => {
  if (!acct) return "";
  const s = String(acct);
  if (s.length <= 4) return "****";
  return `${"*".repeat(Math.max(0, s.length - 4))}${s.slice(-4)}`;
};

/**
 * GET /wallet/me
 * Returns wallet balance and user's bank details (masked)
 */
export const getMyWallet = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { id: true, walletBalance: true },
    });

    const bankDetails = await prisma.bankDetail.findMany({
      where: { userId: Number(userId) },
      orderBy: { isPrimary: "desc", createdAt: "desc" },
    });

    const masked = bankDetails.map((b) => ({
      id: b.id,
      bankName: b.bankName,
      accountNumberMasked: maskAccount(b.accountNumber),
      accountHolder: b.accountHolder,
      isPrimary: b.isPrimary,
      createdAt: b.createdAt,
    }));

    return res.json({ wallet: user, bankDetails: masked });
  } catch (error) {
    console.error("getMyWallet error", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * POST /wallet/bank - add bank detail for current user
 * body: { bankName, accountNumber, accountHolder?, isPrimary? }
 */
export const addBankDetail = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const { bankName, accountNumber, accountHolder, isPrimary } = req.body;
    if (!bankName || !accountNumber)
      return res
        .status(400)
        .json({ message: "bankName and accountNumber required" });

    // If isPrimary true, unset other primary flags in a transaction
    const result = await prisma.$transaction(async (tx) => {
      if (isPrimary) {
        await tx.bankDetail.updateMany({
          where: { userId: Number(userId), isPrimary: true },
          data: { isPrimary: false },
        });
      }

      const bd = await tx.bankDetail.create({
        data: {
          userId: Number(userId),
          bankName,
          accountNumber,
          accountHolder,
          isPrimary: Boolean(isPrimary),
        },
      });

      return bd;
    });

    const masked = {
      id: result.id,
      bankName: result.bankName,
      accountNumberMasked: maskAccount(result.accountNumber),
      accountHolder: result.accountHolder,
      isPrimary: result.isPrimary,
      createdAt: result.createdAt,
    };

    res.status(201).json({ message: "Bank detail added", bankDetail: masked });
  } catch (error) {
    console.error("addBankDetail error", error);
    if (error?.code === "P2002") {
      return res.status(409).json({ message: "This account is already added" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /wallet/bank - list current user's bank details
 */
export const listBankDetails = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const bankDetails = await prisma.bankDetail.findMany({
      where: { userId: Number(userId) },
      orderBy: { isPrimary: "desc", createdAt: "desc" },
    });

    const masked = bankDetails.map((b) => ({
      id: b.id,
      bankName: b.bankName,
      accountNumberMasked: maskAccount(b.accountNumber),
      accountHolder: b.accountHolder,
      isPrimary: b.isPrimary,
      createdAt: b.createdAt,
    }));

    res.json({ bankDetails: masked });
  } catch (error) {
    console.error("listBankDetails error", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * PUT /wallet/bank/:id/primary - set bank detail as primary
 */
export const setPrimaryBankDetail = async (req, res) => {
  try {
    const userId = req.user?.id;
    const id = Number(req.params.id);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const bd = await prisma.bankDetail.findUnique({ where: { id } });
    if (!bd || bd.userId !== Number(userId))
      return res.status(404).json({ message: "Bank detail not found" });

    await prisma.$transaction([
      prisma.bankDetail.updateMany({
        where: { userId: Number(userId), isPrimary: true },
        data: { isPrimary: false },
      }),
      prisma.bankDetail.update({
        where: { id },
        data: { isPrimary: true },
      }),
    ]);

    res.json({ message: "Primary bank updated" });
  } catch (error) {
    console.error("setPrimaryBankDetail error", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * PUT /wallet/bank/:id - update a bank detail (owner only)
 * body: { bankName?, accountNumber?, accountHolder? }
 */
export const updateBankDetail = async (req, res) => {
  try {
    const userId = req.user?.id;
    const id = Number(req.params.id);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const bd = await prisma.bankDetail.findUnique({ where: { id } });
    if (!bd || bd.userId !== Number(userId))
      return res.status(404).json({ message: "Bank detail not found" });

    const { bankName, accountNumber, accountHolder } = req.body;
    const updated = await prisma.bankDetail.update({
      where: { id },
      data: { bankName, accountNumber, accountHolder },
    });

    res.json({
      message: "Bank detail updated",
      bankDetail: {
        id: updated.id,
        bankName: updated.bankName,
        accountNumberMasked: maskAccount(updated.accountNumber),
        accountHolder: updated.accountHolder,
        isPrimary: updated.isPrimary,
        createdAt: updated.createdAt,
      },
    });
  } catch (error) {
    console.error("updateBankDetail error", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * DELETE /wallet/bank/:id - delete bank detail (owner only)
 */
export const deleteBankDetail = async (req, res) => {
  try {
    const userId = req.user?.id;
    const id = Number(req.params.id);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const bd = await prisma.bankDetail.findUnique({ where: { id } });
    if (!bd || bd.userId !== Number(userId))
      return res.status(404).json({ message: "Bank detail not found" });

    await prisma.bankDetail.delete({ where: { id } });

    res.json({ message: "Bank detail removed" });
  } catch (error) {
    console.error("deleteBankDetail error", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * POST /wallet/withdraw - create withdrawal request
 * body: { amount, bankDetailId? , bankName?, accountNumber?, accountHolder? }
 *
 * NOTE: This endpoint creates a withdrawal request in 'pending' state.
 * Admin must approve to perform actual fund transfer and ledger (transaction) update.
 */
export const requestWithdrawal = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const { amount, bankDetailId, bankName, accountNumber, accountHolder } =
      req.body;
    const parsed = Number(amount);
    if (!parsed || parsed <= 0)
      return res.status(400).json({ message: "Invalid amount" });

    let bankNameToUse = bankName;
    let accountNumberToUse = accountNumber;
    let accountHolderToUse = accountHolder;

    if (bankDetailId) {
      const bd = await prisma.bankDetail.findUnique({
        where: { id: Number(bankDetailId) },
      });
      if (!bd || bd.userId !== Number(userId))
        return res.status(404).json({ message: "Bank detail not found" });
      bankNameToUse = bd.bankName;
      accountNumberToUse = bd.accountNumber;
      accountHolderToUse = bd.accountHolder;
    } else {
      // if no bankDetailId provided, accept bankName/accountNumber in body
      if (!bankNameToUse || !accountNumberToUse) {
        return res
          .status(400)
          .json({
            message: "Provide bankDetailId or bankName & accountNumber",
          });
      }
    }

    // Create withdrawal request (no wallet deduction yet)
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: Number(userId),
        amount: parsed,
        bankName: bankNameToUse,
        accountNumber: accountNumberToUse,
        // store accountHolder if provided; otherwise null
        // status default is 'pending' per schema
        accountNumber: accountNumberToUse,
        bankName: bankNameToUse,
        // some schemas include accountHolder field; if not, remove
        ...(accountHolderToUse ? { accountHolder: accountHolderToUse } : {}),
      },
    });

    res.status(201).json({
      message: "Withdrawal request created",
      withdrawal: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        bankName: withdrawal.bankName,
        accountNumberMasked: maskAccount(withdrawal.accountNumber),
        status: withdrawal.status,
        createdAt: withdrawal.createdAt,
      },
    });
  } catch (error) {
    console.error("requestWithdrawal error", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /wallet/withdrawals
 * - If admin: return all withdrawal requests
 * - Else: return user's withdrawals
 */
export const listWithdrawals = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    let where = {};
    if (String(role).toLowerCase() !== "admin") {
      where = { userId: Number(userId) };
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const masked = withdrawals.map((w) => ({
      id: w.id,
      amount: w.amount,
      bankName: w.bankName,
      accountNumberMasked: maskAccount(w.accountNumber),
      status: w.status,
      createdAt: w.createdAt,
      userId: w.userId,
    }));

    res.json({ withdrawals: masked });
  } catch (error) {
    console.error("listWithdrawals error", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * PUT /wallet/withdrawals/:id/approve  (admin)
 * - Deduct user's walletBalance and create a transaction record on approve
 */
export const approveWithdrawal = async (req, res) => {
  try {
    const adminId = req.user?.id;
    const role = req.user?.role;
    if (!adminId) return res.status(401).json({ message: "Not authenticated" });
    if (String(role).toLowerCase() !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    const id = Number(req.params.id);
    const withdrawal = await prisma.withdrawal.findUnique({ where: { id } });
    if (!withdrawal)
      return res.status(404).json({ message: "Withdrawal not found" });
    if (withdrawal.status !== "pending")
      return res.status(400).json({ message: "Withdrawal not pending" });

    const user = await prisma.user.findUnique({
      where: { id: Number(withdrawal.userId) },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.walletBalance < withdrawal.amount) {
      // mark failed or rejected depending on policy
      await prisma.withdrawal.update({
        where: { id },
        data: { status: "rejected" },
      });
      return res
        .status(400)
        .json({ message: "Insufficient user wallet balance" });
    }

    // transaction: update wallet balance, create transaction, update withdrawal status
    await prisma.$transaction([
      prisma.user.update({
        where: { id: Number(user.id) },
        data: { walletBalance: { decrement: withdrawal.amount } },
      }),
      prisma.transaction.create({
        data: {
          userId: Number(user.id),
          amount: withdrawal.amount,
          type: "debit",
          status: "success",
          taskId: null,
        },
      }),
      prisma.withdrawal.update({
        where: { id },
        data: { status: "approved" },
      }),
    ]);

    res.json({ message: "Withdrawal approved" });
  } catch (error) {
    console.error("approveWithdrawal error", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * PUT /wallet/withdrawals/:id/reject  (admin)
 */
export const rejectWithdrawal = async (req, res) => {
  try {
    const adminId = req.user?.id;
    const role = req.user?.role;
    if (!adminId) return res.status(401).json({ message: "Not authenticated" });
    if (String(role).toLowerCase() !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    const id = Number(req.params.id);
    const { reason } = req.body;

    const withdrawal = await prisma.withdrawal.findUnique({ where: { id } });
    if (!withdrawal)
      return res.status(404).json({ message: "Withdrawal not found" });
    if (withdrawal.status !== "pending")
      return res.status(400).json({ message: "Withdrawal not pending" });

    await prisma.withdrawal.update({
      where: { id },
      data: { status: "rejected" },
    });

    // Optionally store admin note / reason (if schema supports it)
    // if you have an `adminNote` field: await prisma.withdrawal.update({ where: { id }, data: { adminNote: reason } });

    res.json({ message: "Withdrawal rejected" });
  } catch (error) {
    console.error("rejectWithdrawal error", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
