const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { addBookmark, getMyBookmarks, deleteBookmark } = require("../controllers/reviewController");

router.post("/", protect, authorize("consumer"), addBookmark);
router.get("/mine", protect, authorize("consumer"), getMyBookmarks);
router.delete("/:id", protect, authorize("consumer"), deleteBookmark);

module.exports = router;
