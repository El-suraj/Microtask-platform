import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  myTasks,
  mySubmissions,
  myEarnings,
  dashboardOverview,
} from "../controllers/dashboardController.js";
import { 
   getMyWallet,
   addBankDetail,
  listBankDetails,
  setPrimaryBankDetail,
  updateBankDetail,
  deleteBankDetail,
  requestWithdrawal,
  listWithdrawals,
  approveWithdrawal,
  rejectWithdrawal} from "../controllers/walletController.js";

const router = express.Router();

// All wallet routes require authentication
router.use(authenticateToken);

// Wallet info
router.get("/me", getMyWallet);

// Bank Details CRUD
router.post("/bank", addBankDetail);
router.get("/bank", listBankDetails);
router.put("/bank/:id", updateBankDetail);
router.put("/bank/:id/primary", setPrimaryBankDetail);
router.delete("/bank/:id", deleteBankDetail);

// Withdrawals
router.post("/withdraw", requestWithdrawal);
router.get("/withdrawals", listWithdrawals);
router.put("/withdrawals/:id/approve", approveWithdrawal);
router.put("/withdrawals/:id/reject", rejectWithdrawal);

// Dashboard
router.get("/overview", dashboardOverview);
router.get("/my-tasks", myTasks);
router.get("/my-submissions", mySubmissions);
router.get("/my-earnings", myEarnings);

export default router;