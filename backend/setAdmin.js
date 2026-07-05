// Run with: npm run set-admin
// Creates the admin account if it doesn't exist, or updates its password/details
// if it does — WITHOUT touching any other users, products, or orders.
// Safe to run anytime on production, unlike seed.js which wipes everything.
require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");

const run = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin User";
  const phone = process.env.ADMIN_PHONE || "9000000000";

  if (!email || !password) {
    console.log("❌ Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env first.");
    process.exit(1);
  }

  let admin = await User.findOne({ email: email.toLowerCase() });

  if (admin) {
    admin.name = name;
    admin.phone = phone;
    admin.password = password; // pre-save hook re-hashes this automatically
    admin.role = "admin";
    admin.isVerified = true;
    admin.isBanned = false;
    await admin.save();
    console.log(`✅ Updated existing admin: ${admin.email}`);
  } else {
    admin = await User.create({
      name,
      email,
      phone,
      password,
      role: "admin",
      isVerified: true,
    });
    console.log(`✅ Created new admin: ${admin.email}`);
  }

  console.log("No other data was touched — all existing users, products, and orders are safe.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});