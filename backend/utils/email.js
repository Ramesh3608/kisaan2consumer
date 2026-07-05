const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS || EMAIL_USER.includes("xxxx")) {
    return null; // not configured
  }

  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT) || 587,
    secure: Number(EMAIL_PORT) === 465,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  return transporter;
};

// 6-digit numeric verification code
const generateVerificationCode = () => String(Math.floor(100000 + Math.random() * 900000));

const sendVerificationEmail = async (to, code) => {
  const t = getTransporter();

  if (!t) {
    // Dev fallback: no SMTP configured yet — print the code to the backend
    // console instead of blocking registration/testing.
    console.log(`\n📧 [DEV MODE — no email configured] Verification code for ${to}: ${code}\n`);
    return { sent: false, devMode: true };
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px;">
      <h2 style="color:#2e7d32; margin-bottom: 4px;">🌱 FarmFresh</h2>
      <p style="color:#333;">Use the code below to verify your email address:</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color:#1b5e20; margin: 20px 0;">${code}</p>
      <p style="color:#888; font-size: 13px;">This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject: "Verify your Kisaan2Consumer (FarmFresh) account",
      html,
    });
    return { sent: true };
  } catch (err) {
    console.warn("Failed to send verification email:", err.message);
    console.log(`\n📧 [EMAIL SEND FAILED — fallback] Verification code for ${to}: ${code}\n`);
    return { sent: false, error: err.message };
  }
};

module.exports = { generateVerificationCode, sendVerificationEmail };
