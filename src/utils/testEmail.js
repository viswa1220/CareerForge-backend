import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

async function sendTestEmail() {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"CareerForge Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // send a test email to yourself
      subject: "CareerForge Email Test ✅",
      text: "If you’re reading this, Gmail App Password works perfectly!",
    });

    console.log("✅ Test email sent:", info.response);
  } catch (error) {
    console.error("❌ Email send failed:", error);
  }
}

sendTestEmail();
