import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import crypto from "crypto";
import {sendEmail} from "../utils/sendEmail.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import  { randomInt as Mathrandom}  from "crypto";

const prisma = new PrismaClient();

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    //Create Otp 
    const otp = Mathrandom(100000, 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword, 
        phone, 

        isVerified: false,
        kycLevel: 0,
        emailOtp: otp,
        emailOtpExpiry: expiry,
       },
    });

    // Send OTP Email 
    await sendEmail({
      to: user.email,
      subject: "Verify Your Email",
      html: `
        <p>Hello ${user.name},</p>
        <p>Your OTP for email verification is: <strong>${otp}</strong></p>
        <p>This OTP expires in 10 minutes.</p>
      `,
    });

    // /const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: { id: user.id, name: user.name, email: user.email },

    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log("REQUEST BODY:", req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });
    

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    


    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// FORGOT PASSWORD
// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });

    // ALWAYS respond success even if user doesn't exist
    if (!user) {
      return res.json({
        message: "If this email exists, password reset instructions were sent",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: expiry,
      },
    });

    // ❗ FIX: Define resetUrl BEFORE using it
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <p>Hello ${user.name},</p>
        <p>You requested a password reset. Click below:</p>
        <a href="${resetUrl}" 
           style="padding:10px 20px;background:#4f46e5;color:white;text-decoration:none;border-radius:6px;">
          Reset Password
        </a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    return res.json({
      message: "If this email exists, password reset instructions were sent",
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password too short" });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null,
      }
    });

    return res.json({ message: "Password reset successful" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
// VERIFY EMAIL
export const verifyEmailOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) {
      return res.json({ message: "Already verified" });
    }

    if (!user.emailOtp || user.emailOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.emailOtpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        kycLevel: 1,
        emailOtp: null,
        emailOtpExpiry: null,
      },
    });

    res.json({ message: "Email verified successfully", kycLevel: 1 });

  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

