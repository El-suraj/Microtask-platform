import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  myTasks,
  mySubmissions,
  myEarnings,
  dashboardOverview
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/my-tasks", authMiddleware, myTasks);
router.get("/my-submissions", authMiddleware, mySubmissions);
router.get("/earnings", authMiddleware, myEarnings);
router.get("/overview", authMiddleware, dashboardOverview);

export default router;
