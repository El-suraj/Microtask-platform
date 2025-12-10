import express from 'express';
import { register, login } from '../controllers/authController.js';
import { registerValidation, loginValidation, validate } from '../validators/authvalidators.js';
import { forgotPassword, resetPassword, verifyEmailOtp } from "../controllers/authController.js";




const router = express.Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/verify-email", verifyEmailOtp);


export default router;
