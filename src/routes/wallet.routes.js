import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getMyWallet,
  requestWithdrawal,
  listWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getTransactions,
  topUpWallet
} from '../controllers/walletController.js';

const router = Router();

router.post('/withdraw', authMiddleware, requestWithdrawal);
router.post("/topup", authMiddleware, topUpWallet); // Optional: Top-up wallet route
router.get('/withdrawals', authMiddleware, listWithdrawals);
router.get("/transactions", authMiddleware, getTransactions);
router.get('/me', authMiddleware, getMyWallet);
// Admin
router.put('/withdrawals/:id/approve', authMiddleware, approveWithdrawal);
router.put('/withdrawals/:id/reject', authMiddleware, rejectWithdrawal);

export default router;
