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

const buildHtml = (code) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px;">
    <h2 style="color:#2e7d32; margin-bottom: 4px;">🌱 FarmFresh</h2>
    <p style="color:#333;">Use the code below to verify your email address:</p>
    <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color:#1b5e20; margin: 20px 0;">${code}</p>
    <p style="color:#888; font-size: 13px;">This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
  </div>
`;

// Sends via Resend's HTTP API (https://resend.com). This works on hosts like
// Render's free tier that block outbound SMTP ports (25/465/587) — Resend uses
// a normal HTTPS request instead, so it isn't affected by that restriction.
const sendViaResend = async (to, code) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.includes("xxxx")) return null; // not configured

  // Resend lets unverified accounts send from onboarding@resend.dev to any
  // recipient — a custom "from" address requires verifying your own domain.
  const from = process.env.EMAIL_FROM || "FarmFresh <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Verify your Kisaan2Consumer (FarmFresh) account",
        html: buildHtml(code),
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Resend API error (${res.status}): ${errBody}`);
    }
    return { sent: true };
  } catch (err) {
    console.warn("Resend send failed:", err.message);
    return { sent: false, error: err.message };
  }
};

// Sends via traditional SMTP (Gmail, etc.) using nodemailer. Only works on
// hosts that allow outbound SMTP ports — will time out on Render's free tier.
const sendViaSmtp = async (to, code) => {
  const t = getTransporter();
  if (!t) return null; // not configured

  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject: "Verify your Kisaan2Consumer (FarmFresh) account",
      html: buildHtml(code),
    });
    return { sent: true };
  } catch (err) {
    console.warn("SMTP send failed:", err.message);
    return { sent: false, error: err.message };
  }
};

const sendVerificationEmail = async (to, code) => {
  // Prefer Resend (works everywhere, including Render free tier).
  const resendResult = await sendViaResend(to, code);
  if (resendResult?.sent) return resendResult;

  // Fall back to SMTP if Resend isn't configured (e.g. self-hosting elsewhere).
  const smtpResult = await sendViaSmtp(to, code);
  if (smtpResult?.sent) return smtpResult;

  // Neither configured or both failed — dev fallback: print the code so
  // registration/testing isn't blocked.
  console.log(`\n📧 [DEV MODE / SEND FAILED — fallback] Verification code for ${to}: ${code}\n`);
  return { sent: false, devMode: true };
};

module.exports = { generateVerificationCode, sendVerificationEmail };