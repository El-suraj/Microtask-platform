import express from 'express';
import { register, login } from '../controllers/authController.js';
import { registerValidation, loginValidation, validate } from '../validators/authvalidators.js';

const router = express.Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);

export default router;
