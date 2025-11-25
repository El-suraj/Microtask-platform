import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// GET /tasks  (optional query: ?status=active)
export const getAllTasks = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json(tasks);
  } catch (err) {
    console.error("getAllTasks error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /tasks/:id
export const getTaskById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        submissions: {
          include: { user: { select: { id: true, name: true } } },
        },
        user: { select: { id: true, name: true } },
      },
    });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    console.error("getTaskById error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /tasks/:id  (only creator OR admin)
export const updateTask = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Only creator or admin
    if (req.user.id !== task.userId && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const {
      title,
      description,
      reward,
      amountPerTask,
      totalSlots,
      remainingSlots,
      proofType,
      deadline,
      status,
    } = req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (reward !== undefined) data.reward = Number(reward);
    if (amountPerTask !== undefined) data.amountPerTask = Number(amountPerTask);
    if (totalSlots !== undefined) data.totalSlots = Number(totalSlots);
    if (remainingSlots !== undefined)
      data.remainingSlots = Number(remainingSlots);
    if (proofType !== undefined) data.proofType = proofType;
    if (deadline !== undefined)
      data.deadline = deadline ? new Date(deadline) : null;
    if (status !== undefined) data.status = status;

    const updated = await prisma.task.update({
      where: { id },
      data,
    });

    res.json({ message: "Task updated", task: updated });
  } catch (err) {
    console.error("updateTask error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /tasks/:id (only creator or admin)
export const deleteTask = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.id !== task.userId && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.task.delete({ where: { id } });
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("deleteTask error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, reward, deadline, totalSlots, proofType } =
      req.body;
    const userId = Number(req.user?.id);

    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    if (!title) return res.status(400).json({ message: "Title is required" });

    const parsedReward = Number(reward);
    const parsedTotalSlots = Number(totalSlots);

    if (Number.isNaN(parsedReward) || parsedReward <= 0)
      return res
        .status(400)
        .json({ message: "Reward must be a positive number" });

    if (Number.isNaN(parsedTotalSlots) || parsedTotalSlots <= 0)
      return res
        .status(400)
        .json({ message: "totalSlots must be a positive integer" });

    const cost = parsedReward * parsedTotalSlots;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // check walletBalance (schema field may be 'walletBalance' - replace with your field as needed)
    const walletBalance =
      typeof user.walletBalance === "number"
        ? user.walletBalance
        : user.walletBalance
        ? Number(user.walletBalance)
        : undefined;
    if (walletBalance == null) {
      return res
        .status(400)
        .json({ message: "User wallet balance field is missing" });
    }

    if (walletBalance < cost)
      return res
        .status(400)
        .json({ message: "Insufficient balance to create task" });

    // Deduct from wallet with numeric value
    await prisma.user.update({
      where: { id: userId },
      data: { walletBalance: { decrement: cost } }, // use `walletBalance` (not `balance`)
    });

    // Create task: use relation connect if schema uses relations
    const taskData = {
      title,
      description,
      reward: parsedReward,
      deadline: deadline ? new Date(deadline) : null,
      totalSlots: parsedTotalSlots,
      remainingSlots: parsedTotalSlots,
      proofType,
      escrowAmount: cost,
    };

    // If your schema expects a relation field, connect it:
    // taskData.user = { connect: { id: userId } };
    // Alternatively, if schema expects userId scalar: taskData.userId = userId;

    // Choose one: replace with whichever matches your prisma schema.
    taskData.userId = userId; // change to `.user = { connect: { id: userId } }` if necessary

    const task = await prisma.task.create({
      data: taskData,
    });

    res.status(201).json({ message: "Task created with escrow", task });
  } catch (err) {
    console.error("createTask error", err);
    res.status(500).json({ message: "Server Error", err: err.message });
  }
};
