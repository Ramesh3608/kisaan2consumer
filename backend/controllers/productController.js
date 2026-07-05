const Product = require("../models/Product");

// @route GET /api/products  (public, supports ?category=&search=&sort=)
exports.getProducts = async (req, res) => {
  try {
    const { category, search, sort, organic } = req.query;
    const filter = { isActive: true };
    if (category && category !== "all") filter.category = category;
    if (organic === "true") filter.organic = true;
    if (search) filter.$text = { $search: search };

    let query = Product.find(filter).populate("farmer", "name farmName location ratingAvg");

    if (sort === "price_low") query = query.sort({ "prices.0.price": 1 });
    else if (sort === "price_high") query = query.sort({ "prices.0.price": -1 });
    else query = query.sort({ createdAt: -1 });

    const products = await query;
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "farmer",
      "name farmName location ratingAvg ratingCount"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    }).limit(4);

    res.json({ product, related });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/products/farmer/mine
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, image, organic, prices, stock, harvestDate } = req.body;
    if (!name || !category || !prices || !prices.length) {
      return res.status(400).json({ message: "Name, category and at least one price/weight are required" });
    }
    const product = await Product.create({
      farmer: req.user._id,
      name,
      description,
      category,
      image,
      organic: !!organic,
      prices,
      stock,
      harvestDate,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.farmer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to edit this product" });
    }
    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.farmer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }
    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
