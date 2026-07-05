const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// @route GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/admin/users/:id/ban
exports.toggleBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isBanned = !user.isBanned;
    await user.save();
    res.json(user.toSafeObject());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalFarmers, totalConsumers, totalAgents, totalProducts, totalOrders, orders] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "farmer" }),
        User.countDocuments({ role: "consumer" }),
        User.countDocuments({ role: "agent" }),
        Product.countDocuments(),
        Order.countDocuments(),
        Order.find(),
      ]);

    const revenue = orders
      .filter((o) => o.paymentStatus === "Paid")
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = orders.filter((o) => o.status === "Pending").length;

    res.json({
      totalUsers,
      totalFarmers,
      totalConsumers,
      totalAgents,
      totalProducts,
      totalOrders,
      revenue: Math.round(revenue * 100) / 100,
      pendingOrders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/admin/products
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find().populate("farmer", "name farmName email");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/admin/products/:id/toggle
exports.toggleProductActive = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    product.isActive = !product.isActive;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
