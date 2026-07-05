const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateVerificationCode, sendVerificationEmail } = require("../utils/email");

const genToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const CODE_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role, farmName, location, city, state, zip } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const allowedRoles = ["consumer", "farmer", "agent"]; // admin created manually/seed
    const finalRole = allowedRoles.includes(role) ? role : "consumer";

    const code = generateVerificationCode();

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: finalRole,
      farmName: farmName || "",
      location: location || "",
      city: city || "",
      state: state || "",
      zip: zip || "",
      isVerified: false,
      verificationCode: code,
      verificationCodeExpires: new Date(Date.now() + CODE_EXPIRY_MS),
    });

    await sendVerificationEmail(user.email, code);

    // No token yet — the account isn't usable until the email is verified.
    res.status(201).json({
      requiresVerification: true,
      email: user.email,
      message: "We've sent a verification code to your email. Enter it to activate your account.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (user.isBanned) {
      return res.status(403).json({ message: "Your account has been suspended" });
    }
    if (!user.isVerified) {
      return res.status(403).json({
        requiresVerification: true,
        email: user.email,
        message: "Please verify your email before logging in.",
      });
    }

    res.json({
      user: user.toSafeObject(),
      token: genToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/auth/verify-email
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "No account found for this email" });
    }
    if (user.isVerified) {
      return res.json({ user: user.toSafeObject(), token: genToken(user._id), alreadyVerified: true });
    }
    if (!user.verificationCode || user.verificationCode !== code) {
      return res.status(400).json({ message: "Incorrect verification code" });
    }
    if (!user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ message: "This code has expired. Please request a new one." });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    res.json({ user: user.toSafeObject(), token: genToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/auth/resend-verification
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "No account found for this email" });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "This account is already verified — you can log in." });
    }

    const code = generateVerificationCode();
    user.verificationCode = code;
    user.verificationCodeExpires = new Date(Date.now() + CODE_EXPIRY_MS);
    await user.save();

    await sendVerificationEmail(user.email, code);

    res.json({ message: "A new verification code has been sent to your email." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json(req.user);
};

// @route PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const fields = ["name", "phone", "upiId", "location", "farmName", "farmDescription", "city", "state", "zip"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) req.user[f] = req.body[f];
    });
    await req.user.save();
    res.json(req.user.toSafeObject());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/auth/address
exports.addAddress = async (req, res) => {
  try {
    req.user.addresses.push(req.body);
    await req.user.save();
    res.status(201).json(req.user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/auth/address/:addressId
exports.deleteAddress = async (req, res) => {
  try {
    req.user.addresses = req.user.addresses.filter(
      (a) => a._id.toString() !== req.params.addressId
    );
    await req.user.save();
    res.json(req.user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/auth/location   (agent shares their live GPS position)
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ message: "lat and lng (numbers) are required" });
    }
    req.user.currentLocation = { lat, lng, updatedAt: new Date() };
    await req.user.save();
    res.json(req.user.currentLocation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
