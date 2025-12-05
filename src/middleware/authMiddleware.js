import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  // dev helper: allow token via query for local debugging
  const devToken = process.env.NODE_ENV === "development" ? req.query?.token : undefined;
  const authHeader = req.headers.authorization || (devToken ? `Bearer ${devToken}` : undefined);

  // Log incoming auth header for debugging
  // console.debug("authMiddleware authHeader:", authHeader);

  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  const role = String(req.user.role || "").toUpperCase();
  if (role !== "ADMIN") return res.status(403).json({ message: "Admin only" });
  next();
};

// Export alias expected by routes
export const authenticateToken = authMiddleware;
