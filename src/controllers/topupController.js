import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();


export const topUpWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    // Update user wallet
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        walletBalance: {
          increment: amount,
        },
      },
    });

    // Save transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: "topup",
        amount,
        status: "success",
      },
    });

    return res.json({
      success: true,
      message: "Wallet topped up successfully",
      balance: updatedUser.walletBalance,
      transaction,
    });

  } catch (error) {
    console.error("Top-up error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// Get top-up history
export const getTopUpHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await prisma.transaction.findMany({
      where: {
        userId,
        type: "topup",
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      history,
    });

  } catch (error) {
    console.error("Top-up history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
