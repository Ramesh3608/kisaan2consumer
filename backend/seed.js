// Run with: npm run seed
// Creates demo accounts for every role + sample products so you can test immediately.
require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");
const Product = require("./models/Product");
const Order = require("./models/Order");

const run = async () => {
  await connectDB();

  console.log("Clearing existing demo data...");
  await Promise.all([User.deleteMany({}), Product.deleteMany({}), Order.deleteMany({})]);

  console.log("Creating demo users...");
  const admin = await User.create({
    name: "ramesh",
    email: "chkramesh202021@gmail.com",
    phone: "7207298919",
    password: "Ramesh@6777",
    role: "admin",
    isVerified: true,
  });

  const farmer1 = await User.create({
    name: "Ramesh Kumar",
    email: "farmer@k2c.com",
    phone: "9000000002",
    password: "farmer123",
    role: "farmer",
    isVerified: true,
    farmName: "Green Valley Farms",
    farmDescription: "Organic fruits and vegetables grown sustainably.",
    location: "Kadapa, Andhra Pradesh",
    upiId: "ramesh@okaxis",
  });

  const farmer2 = await User.create({
    name: "Lakshmi Devi",
    email: "farmer2@k2c.com",
    phone: "9000000003",
    password: "farmer123",
    role: "farmer",
    isVerified: true,
    farmName: "Sunny Orchards",
    farmDescription: "Fresh seasonal fruits straight from the orchard.",
    location: "Chittoor, Andhra Pradesh",
    upiId: "lakshmi@okhdfc",
  });

  const consumer = await User.create({
    name: "Rahul Sharma",
    email: "consumer@k2c.com",
    phone: "8888888888",
    password: "consumer123",
    role: "consumer",
    isVerified: true,
    location: "Kadapa, Andhra Pradesh",
    addresses: [
      {
        label: "Home",
        fullName: "Rahul Sharma",
        street: "Chinna Chowk",
        city: "Kadapa",
        state: "Andhra Pradesh",
        zip: "516003",
        phone: "9999999999",
      },
    ],
  });

  const agent = await User.create({
    name: "Suresh Delivery",
    email: "agent@k2c.com",
    phone: "9000000004",
    password: "agent123",
    role: "agent",
    isVerified: true,
    location: "Kadapa, Andhra Pradesh",
    city: "Kadapa",
    state: "Andhra Pradesh",
    zip: "516003",
  });

  console.log("Creating demo products...");
  await Product.insertMany([
    {
      farmer: farmer1._id,
      name: "Green Grapes",
      description: "Juicy green grapes, freshly harvested.",
      category: "fruit",
      image: "https://commons.wikimedia.org/wiki/Special:FilePath/Green_grape_fruit.jpg?width=400",
      organic: false,
      prices: [
        { weight: "250gms", price: 25 },
        { weight: "500gms", price: 60 },
        { weight: "1kg", price: 120 },
      ],
      stock: 100,
    },
    {
      farmer: farmer1._id,
      name: "Almonds (Native)",
      description: "Organic almonds freshly collected.",
      category: "nuts",
      image: "https://commons.wikimedia.org/wiki/Special:FilePath/Almonds.jpg?width=400",
      organic: true,
      prices: [{ weight: "100gms", price: 150 }],
      stock: 50,
    },
    {
      farmer: farmer2._id,
      name: "Black Grapes",
      description: "Juicy black grapes.",
      category: "fruit",
      image: "https://commons.wikimedia.org/wiki/Special:FilePath/Grapes.jpg?width=400",
      organic: false,
      prices: [
        { weight: "100gms", price: 24 },
        { weight: "250gms", price: 52 },
      ],
      stock: 80,
    },
    {
      farmer: farmer1._id,
      name: "Onions",
      description: "Farm fresh onions.",
      category: "vegetable",
      image: "https://commons.wikimedia.org/wiki/Special:FilePath/Onions.jpg?width=400",
      organic: false,
      prices: [
        { weight: "250gms", price: 20 },
        { weight: "500gms", price: 40 },
        { weight: "1kg", price: 60 },
      ],
      stock: 200,
    },
    {
      farmer: farmer2._id,
      name: "Marigold",
      description: "Fresh marigold flowers.",
      category: "flowers",
      image: "https://commons.wikimedia.org/wiki/Special:FilePath/Marigold_(Blackish_Red_And_Yellow).jpg?width=400",
      organic: false,
      prices: [
        { weight: "50gms", price: 50 },
        { weight: "100gms", price: 75 },
      ],
      stock: 40,
    },
    {
      farmer: farmer1._id,
      name: "Brinjal",
      description: "Fresh purple brinjal.",
      category: "vegetable",
      image: "https://commons.wikimedia.org/wiki/Special:FilePath/Eggplants.jpg?width=400",
      organic: false,
      prices: [
        { weight: "100gms", price: 50 },
        { weight: "250gms", price: 75 },
      ],
      stock: 60,
    },
    {
      farmer: farmer2._id,
      name: "Fresh Carrots",
      description: "Crunchy organic carrots.",
      category: "vegetable",
      image: "https://commons.wikimedia.org/wiki/Special:FilePath/Carrots.JPG?width=400",
      organic: true,
      prices: [{ weight: "1kg", price: 30 }],
      stock: 90,
    },
    {
      farmer: farmer1._id,
      name: "Red Apples",
      description: "Sweet and crisp red apples.",
      category: "fruit",
      image: "https://commons.wikimedia.org/wiki/Special:FilePath/Red_Apple.jpg?width=400",
      organic: false,
      prices: [{ weight: "1kg", price: 180 }],
      stock: 70,
    },
  ]);

  console.log("✅ Seed complete!\n");
  console.log("Demo login credentials:");
  console.log("  Admin:    chkramesh202021@gmail.com / Ramesh@6777");
  console.log("  Farmer:   farmer@k2c.com / farmer123");
  console.log("  Farmer2:  farmer2@k2c.com / farmer123");
  console.log("  Consumer: consumer@k2c.com / consumer123");
  console.log("  Agent:    agent@k2c.com / agent123");

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
