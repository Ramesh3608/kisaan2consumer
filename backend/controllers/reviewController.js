const Review = require("../models/Review");
const User = require("../models/User");
const Bookmark = require("../models/Bookmark");

// @route POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { farmerId, orderId, rating, comment } = req.body;
    const review = await Review.create({
      farmer: farmerId,
      consumer: req.user._id,
      order: orderId,
      rating,
      comment,
    });

    const farmer = await User.findById(farmerId);
    if (farmer) {
      const newCount = farmer.ratingCount + 1;
      const newAvg = (farmer.ratingAvg * farmer.ratingCount + rating) / newCount;
      farmer.ratingAvg = Math.round(newAvg * 10) / 10;
      farmer.ratingCount = newCount;
      await farmer.save();
    }

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/reviews/farmer/:id
exports.getFarmerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ farmer: req.params.id })
      .populate("consumer", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/bookmarks
exports.addBookmark = async (req, res) => {
  try {
    const { productId, farmerId } = req.body;
    const bookmark = await Bookmark.create({
      consumer: req.user._id,
      product: productId || null,
      farmer: farmerId || null,
    });
    res.status(201).json(bookmark);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/bookmarks/mine
exports.getMyBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ consumer: req.user._id })
      .populate("product")
      .populate("farmer", "name farmName");
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/bookmarks/:id
exports.deleteBookmark = async (req, res) => {
  try {
    await Bookmark.findOneAndDelete({ _id: req.params.id, consumer: req.user._id });
    res.json({ message: "Removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
