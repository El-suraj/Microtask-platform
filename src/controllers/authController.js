import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";

const prisma = new PrismaClient();

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, phone },
    });

    const token = generateToken(user);

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
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
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: expiry,
      },
    });

    const resetUrl = `https://YOUR-FRONTEND-URL/#/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <p>Hello ${user.name},</p>
        <p>You requested a password reset. Click below:</p>
        <a href="${resetUrl}" target="_blank">Reset Password</a>
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
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return res.json({ message: "Password reset successful. You can now login." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
