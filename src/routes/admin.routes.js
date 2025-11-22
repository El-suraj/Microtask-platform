import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  approveSubmission,
  rejectSubmission,
} from "../controllers/adminController.js";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const router = Router();
// Create an admin user (for testing/demo purposes)
router.post("/create-admin", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password, // you can hash later
        role: "admin"
      }
    });

    res.json({ message: "Admin created", admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create admin" });
  }
});

router.put("/submission/:id/approve", authMiddleware, approveSubmission);
router.put("/submission/:id/reject", authMiddleware, rejectSubmission);

export default router;
