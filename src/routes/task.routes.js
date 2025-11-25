import { Router } from "express";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { authMiddleware, requireAdmin } from "../middleware/authMiddleware.js";
import {
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  createTask,
} from "../controllers/taskControllers.js";

const prisma = new PrismaClient();
const router = Router();

// Create a new task
// router.post("/", authMiddleware, async (req, res) => {
//   try {
//     const { title, description, reward, deadline, totalSlots, proofType } = req.body;
//     const userId = req.user.id;

//     const cost = reward * totalSlots;

//     const user = await prisma.user.findUnique({ where: { id: userId } });

//     if (user.balance < cost)
//       return res.status(400).json({ message: "Insufficient balance to create task" });

//     // Deduct from wallet
//     await prisma.user.update({
//       where: { id: userId },
//       data: { balance: { decrement: cost } }
//     });

//     // Create task with escrow
//     const task = await prisma.task.create({
//       data: {
//         title,
//         description,
//         reward,
//         deadline: new Date(deadline),
//         totalSlots,
//         remainingSlots: totalSlots,
//         proofType,
//         userId,
//         escrowAmount: cost
//       }
//     });

//     res.json({ message: "Task created with escrow", task });

//   } catch (err) {
//     res.status(500).json({ message: "Server Error", err });
//   }
// });

router.post("/", authMiddleware, createTask); // Create a new task
router.get("/", getAllTasks);
router.get("/:id", getTaskById);
router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);

export default router;
