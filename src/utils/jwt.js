import jwt from "jsonwebtoken";

export const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: String(user.role).toUpperCase() },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
