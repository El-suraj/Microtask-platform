import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
    submitAppeal,
    getUserAppeals,
    adminGetAllAppeals,
    adminApproveAppeal,
    adminRejectAppeal
} from "../controllers/appealController.js";

const router = express.Router();

// Users submit appeal
router.post("/submit", authMiddleware, submitAppeal);

// Users view their appeals
router.get("/my-appeals", authMiddleware, getUserAppeals);

// Admin: view all appeals
router.get("/admin/appeals", authMiddleware, adminGetAllAppeals);

// Admin: approve appeal
router.put("/admin/appeals/:id/approve", authMiddleware, adminApproveAppeal);

// Admin: reject appeal
router.put("/admin/appeals/:id/reject", authMiddleware, adminRejectAppeal);

export default router;
