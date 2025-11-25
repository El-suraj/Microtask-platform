import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const myTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const mySubmissions = async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { userId: req.user.id },
      include: {
        task: true
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const myEarnings = async (req, res) => {
  try {
    const earnings = await prisma.transaction.findMany({
      where: {
        userId: req.user.id,
        type: "credit"
      },
      orderBy: { createdAt: "desc" }
    });

    const total = earnings.reduce((sum, t) => sum + t.amount, 0);

    res.json({
      totalEarnings: total,
      history: earnings
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const dashboardOverview = async (req, res) => {
  try {
    const userId = req.user.id;

    const [user, tasks, submissions, earnings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, walletBalance: true, role: true }
      }),

      prisma.task.count({ where: { userId } }),

      prisma.submission.count({ where: { userId } }),

      prisma.transaction.findMany({
        where: { userId, type: "credit" }
      })
    ]);

    const totalEarnings = earnings.reduce((sum, t) => sum + t.amount, 0);

    res.json({
      user,
      stats: {
        tasksCreated: tasks,
        submissionsMade: submissions,
        totalEarnings
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

