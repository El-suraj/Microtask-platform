import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes  from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/task.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/tasks", taskRoutes);


app.get("/", (req, res) => res.send("Microtask Platform API is running!"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
