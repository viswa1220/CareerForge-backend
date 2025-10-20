import express from "express";
import { signup, login, verifyEmail } from "./authController.js";

const router = express.Router();

// User authentication routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/verify-email", verifyEmail); // ✅ Email verification link

export default router;
