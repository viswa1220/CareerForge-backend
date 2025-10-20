import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./auth/authRoutes.js";
import resumeRoutes from "./resumes/resumeRoutes.js";
import trackerRoutes from "./tracker/trackerRoutes.js";


dotenv.config();
const app = express();

app.use(express.json());

// 👇 Allow CORS (this fixes most 403/blocked errors)
import cors from "cors";
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.send("CareerForge backend is running 🚀");
});

app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/applications", trackerRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
