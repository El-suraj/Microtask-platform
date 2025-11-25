import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const createSubmission = async (req, res) => {
  try {
    const { taskId, proofImage } = req.body;
    if (!taskId || !proofImage) {
      return res.status(400).json({ message: "taskId and proofImage are required" });
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
    const { submissionId, message } = req.body;

    const submission = await prisma.submission.findUnique({ where: { id: submissionId } });

    if (!submission) return res.status(404).json({ message: "Submission not found" });

    if (submission.userId !== req.user.id)
      return res.status(403).json({ message: "You cannot appeal this submission" });

    if (submission.status !== "rejected")
      return res.status(400).json({ message: "Only rejected submissions can be appealed" });

    const appeal = await prisma.appeal.create({
      data: { submissionId, message }
    });
    res.status(201).json({ message: "Appeal submitted", appeal });
  } catch (err) {
    console.error("submit Appeal error", err);
    res.status(500).json({ message: "Server error" });
  }
};