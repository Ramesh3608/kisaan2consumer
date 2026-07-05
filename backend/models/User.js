const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    fullName: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    phone: String,
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["consumer", "farmer", "admin", "agent"],
      default: "consumer",
    },
    upiId: { type: String, default: "" },
    location: { type: String, default: "" },
    // Structured service-area fields (mainly used by delivery agents) so admin can
    // match an agent to an order by exact city/state/pincode, as an alternative to
    // GPS-distance-based assignment.
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zip: { type: String, default: "" },
    addresses: [addressSchema],
    isBanned: { type: Boolean, default: false },
    // Email verification — new registrations start unverified and must enter a
    // code sent to their email before they can log in. Defaults to true so
    // accounts created before this feature was added aren't locked out.
    isVerified: { type: Boolean, default: true },
    verificationCode: { type: String, default: null },
    verificationCodeExpires: { type: Date, default: null },
    // Live GPS location — used for agents so admin can find the nearest one to a delivery
    currentLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      updatedAt: { type: Date, default: null },
    },
    // Farmer-specific
    farmName: { type: String, default: "" },
    farmDescription: { type: String, default: "" },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
