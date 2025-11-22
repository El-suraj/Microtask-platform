import { Router } from "express";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware.js';
import {
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask
} from '../controllers/taskControllers.js';



const prisma = new PrismaClient();
const router = Router();

// Create a new task
router.post("/", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      reward,
      deadline,
      totalSlots,
      remainingSlots,
      proofType,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
     const slotsTotal = Number(totalSlots) || 1;
    const slotsRemaining = Number(remainingSlots ?? slotsTotal);
    const parsedDeadline = deadline ? new Date(deadline) : null;

   const task = await prisma.task.create({
      data: {
        title,
        description,
        reward,
        deadline: parsedDeadline,
        totalSlots: slotsTotal,
        remainingSlots: slotsRemaining,
        proofType,
        user:{connect: { id: req.user.id }},
      },
});


    res.json({ message: "Task created successfully", task });
  } catch (error) {
    console.error("Task creation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// router.post('/', authMiddleware, createTask);//


router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.put('/:id', authMiddleware, updateTask);
router.delete('/:id', authMiddleware, deleteTask);

export default router;
