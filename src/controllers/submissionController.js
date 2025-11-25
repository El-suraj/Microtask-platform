import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const createSubmission = async (req, res) => {
  try {
    const { taskId, proofImage } = req.body;
    if (!taskId || !proofImage) {
      return res
        .status(400)
        .json({ message: "taskId and proofImage are required" });
    }

    const task = await prisma.task.findUnique({
      where: { id: Number(taskId) },
    });
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.remainingSlots <= 0) {
      return res.status(400).json({ message: "No slots remaining" });
    }

    const submission = await prisma.submission.create({
      data: {
        taskId: Number(taskId),
        userId: req.user.id,
        proofImage,
        status: "pending",
      },
    });

    res.status(201).json({ message: "Submission created", submission });
  } catch (err) {
    console.error("createSubmission error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const submitAppeal = async (req, res) => {
  try {
    const { submissionId, userId, message } = req.body;

    if (!submissionId || !userId || !message) {
      return res.status(400).json({
        success: false,
        message: "submissionId, userId and message are required"
      });
    }

    const existingAppeal = await prisma.appeal.findFirst({
      where: {
        submissionId: submissionId,
        userId: userId
      }
    });

    if (existingAppeal) {
      return res.status(400).json({
        success: false,
        message: "You have already appealed this submission"
      });
    }

    const appeal = await prisma.appeal.create({
      data: {
        submissionId,
        userId,
        message,
        status: "pending"
      }
    });

    return res.json({
      success: true,
      message: "Appeal submitted successfully",
      appeal
    });

  } catch (error) {
    console.log("submitAppeal Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
