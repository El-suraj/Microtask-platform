import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getMyWallet,
  requestWithdrawal,
  listWithdrawals,
  approveWithdrawal,
  rejectWithdrawal
} from '../controllers/walletController.js';

const router = Router();

router.get('/me', authMiddleware, getMyWallet);
router.post('/withdraw', authMiddleware, requestWithdrawal);
router.get('/withdrawals', authMiddleware, listWithdrawals);

// Admin
router.put('/withdrawals/:id/approve', authMiddleware, approveWithdrawal);
router.put('/withdrawals/:id/reject', authMiddleware, rejectWithdrawal);

export default router;
