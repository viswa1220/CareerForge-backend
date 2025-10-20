import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { sendEmail } from "../utils/sendEmail.js";

const JWT_SECRET = process.env.JWT_SECRET || "careerforge_secret";

/* ==========================================================
   🔹 SIGNUP (with email verification)
   ========================================================== */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    // ✅ Password strength validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least 6 characters, including letters and numbers.",
      });
    }

    // ✅ Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user (not verified yet)
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, isVerified: false },
    });

    // ✅ Generate verification token (valid 24 hours)
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });

    // ✅ Build verification link
    const verifyLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;

    // ✅ Email template
    const html = `
      <h2>Welcome to CareerForge, ${name}!</h2>
      <p>Click below to verify your email address:</p>
      <a href="${verifyLink}" target="_blank">Verify My Email</a>
      <p>This link will expire in 24 hours.</p>
    `;

    // ✅ Send the email
    await sendEmail(email, "Verify your CareerForge account", html);

    res.status(201).json({
      message:
        "Signup successful. A verification email has been sent to your inbox.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ==========================================================
   📧 VERIFY EMAIL
   ========================================================== */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send("<h3>Missing verification token.</h3>");

    const decoded = jwt.verify(token, JWT_SECRET);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { isVerified: true },
    });

    res.send(
      `<h2>Email verified successfully!</h2><p>You can now log in to CareerForge.</p>`
    );
  } catch (error) {
    console.error("Verification error:", error);
    res.status(400).send("<h3>Invalid or expired verification link.</h3>");
  }
};

/* ==========================================================
   🔹 LOGIN
   ========================================================== */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Check verification
    if (!user.isVerified)
      return res
        .status(401)
        .json({ message: "Please verify your email before logging in." });

    // ✅ Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // ✅ Generate login token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
