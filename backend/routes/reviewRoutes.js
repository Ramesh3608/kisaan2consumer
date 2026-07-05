const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { createReview, getFarmerReviews } = require("../controllers/reviewController");

router.post("/", protect, authorize("consumer"), createReview);
router.get("/farmer/:id", getFarmerReviews);

module.exports = router;
