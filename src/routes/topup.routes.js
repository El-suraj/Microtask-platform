import express from "express";
import { topUpWallet, getTopUpHistory } from "../controllers/topupController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// User adds money to wallet
router.post("/topup", authMiddleware, topUpWallet);

// User views their top-up history
router.get("/topup/history", authMiddleware, getTopUpHistory);

export default router;
