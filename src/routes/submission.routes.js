import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createSubmission } from '../controllers/submissionController.js';

const router = Router();

router.post('/', authMiddleware, createSubmission);

export default router;
