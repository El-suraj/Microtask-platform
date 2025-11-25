import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

/**
 * ==========================
 * USER: Submit an Appeal
 * ==========================
 */
export const submitAppeal = async (req, res) => {
  try {
    const { submissionId, message } = req.body;
    const userId = req.user.id;

    if (!submissionId || !message) {
      return res.status(400).json({
        success: false,
        message: "submissionId and message are required",
      });
    }

    // Check if submission exists and belongs to user
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    if (submission.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only appeal your own submission",
      });
    }

    // Prevent duplicate appeal
    const existingAppeal = await prisma.appeal.findFirst({
      where: {
        submissionId,
        userId,
      },
    });

    if (existingAppeal) {
      return res.status(400).json({
        success: false,
        message: "You already submitted an appeal for this submission",
      });
    }

    const appeal = await prisma.appeal.create({
      data: {
        submissionId,
        userId,
        message,
        status: "pending",
      },
    });

    return res.json({
      success: true,
      message: "Appeal submitted successfully",
      appeal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * ==========================
 * USER: View My Appeals
 * ==========================
 */
export const getUserAppeals = async (req, res) => {
  try {
    const userId = req.user.id;

    const appeals = await prisma.appeal.findMany({
      where: { userId },
      include: {
        submission: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      appeals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * ==========================
 * ADMIN: View All Appeals
 * ==========================
 */
export const adminGetAllAppeals = async (req, res) => {
  try {
    const appeals = await prisma.appeal.findMany({
      include: {
        submission: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      appeals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * ==========================
 * ADMIN: Approve Appeal
 * ==========================
 */
export const adminApproveAppeal = async (req, res) => {
  try {
    const appealId = parseInt(req.params.id);

    const appeal = await prisma.appeal.findUnique({
      where: { id: appealId },
    });

    if (!appeal) {
      return res.status(404).json({
        success: false,
        message: "Appeal not found",
      });
    }

    // Update appeal
    const updated = await prisma.appeal.update({
      where: { id: appealId },
      data: {
        status: "approved",
        adminDecision: "approved",
        adminNote: "Submission reopened for reconsideration",
      },
    });

    // Reopen submission (set status back to pending)
    await prisma.submission.update({
      where: { id: appeal.submissionId },
      data: { status: "pending" },
    });

    return res.json({
      success: true,
      message: "Appeal approved. Submission reopened.",
      appeal: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * ==========================
 * ADMIN: Reject Appeal
 * ==========================
 */
export const adminRejectAppeal = async (req, res) => {
  try {
    const appealId = parseInt(req.params.id);
    const { note } = req.body;

    const appeal = await prisma.appeal.findUnique({
      where: { id: appealId },
    });

    if (!appeal) {
      return res.status(404).json({
        success: false,
        message: "Appeal not found",
      });
    }

    const updated = await prisma.appeal.update({
      where: { id: appealId },
      data: {
        status: "rejected",
        adminDecision: "rejected",
        adminNote: note || "Appeal rejected by admin",
      },
    });

    return res.json({
      success: true,
      message: "Appeal rejected",
      appeal: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
