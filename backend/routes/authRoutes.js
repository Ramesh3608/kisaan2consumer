const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  register,
  login,
  getMe,
  updateProfile,
  addAddress,
  deleteAddress,
  updateLocation,
  verifyEmail,
  resendVerification,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post("/address", protect, addAddress);
router.delete("/address/:addressId", protect, deleteAddress);
router.put("/location", protect, updateLocation);

module.exports = router;
