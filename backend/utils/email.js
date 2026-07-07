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

// Sends via Brevo's HTTP API (https://brevo.com). Like Resend, this uses HTTPS
// instead of SMTP ports, so it works on Render's free tier. Unlike Resend,
// Brevo lets you verify just a single sender EMAIL (a 6-digit code, no DNS/
// domain setup) and then send to ANY recipient — no "testing mode" recipient
// restriction. This is the primary method; see README for setup.
const sendViaBrevo = async (to, code) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !senderEmail || apiKey.includes("xxxx")) return null; // not configured

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: "FarmFresh", email: senderEmail },
        to: [{ email: to }],
        subject: "Verify your Kisaan2Consumer (FarmFresh) account",
        htmlContent: buildHtml(code),
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Brevo API error (${res.status}): ${errBody}`);
    }
    return { sent: true };
  } catch (err) {
    console.warn("Brevo send failed:", err.message);
    return { sent: false, error: err.message };
  }
};

// Sends via Resend's HTTP API (https://resend.com). This works on hosts like
// Render's free tier that block outbound SMTP ports (25/465/587) — Resend uses
// a normal HTTPS request instead, so it isn't affected by that restriction.
// NOTE: without verifying your own domain on Resend, you can only send to the
// email address you signed up to Resend with — not arbitrary recipients. Use
// Brevo (above) instead if you need to email your actual users.
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
  // Prefer Brevo — works on Render free tier AND sends to any recipient
  // without needing domain verification.
  const brevoResult = await sendViaBrevo(to, code);
  if (brevoResult?.sent) return brevoResult;

  // Resend — also works on Render free tier, but restricted to your own
  // email until you verify a domain there.
  const resendResult = await sendViaResend(to, code);
  if (resendResult?.sent) return resendResult;

  // Fall back to SMTP if neither above is configured (e.g. self-hosting
  // somewhere that doesn't block SMTP ports).
  const smtpResult = await sendViaSmtp(to, code);
  if (smtpResult?.sent) return smtpResult;

  // Nothing configured or everything failed — dev fallback: print the code
  // so registration/testing isn't blocked.
  console.log(`\n📧 [DEV MODE / SEND FAILED — fallback] Verification code for ${to}: ${code}\n`);
  return { sent: false, devMode: true };
};

module.exports = { generateVerificationCode, sendVerificationEmail };