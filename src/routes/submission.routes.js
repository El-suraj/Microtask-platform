import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createSubmission, submitAppeal } from '../controllers/submissionController.js';

const router = Router();

router.post('/', authMiddleware, createSubmission);
router.post('/appeal', authMiddleware, submitAppeal);

export default router;
