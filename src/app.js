import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/task.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import submissionRoutes from './routes/submission.routes.js';
import helmet from "helmet";
import rateLimit from "express-rate-limit";


dotenv.config();

const app = express();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 0, // limit each IP to 100 requests per windowMs
  message:
    "Too many requests from this IP, please try again after a 15 minute break",
});
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api/auth', authLimiter);



app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/tasks", taskRoutes); // create/list/get/update/delete
app.use("/wallet", walletRoutes); // wallet & withdrawals
app.use("/admin", adminRoutes); // admin actions (approve submissions)
app.use('/submissions', submissionRoutes); // create submissions

app.get("/", (req, res) => res.send("Microtask Platform API is running!"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
