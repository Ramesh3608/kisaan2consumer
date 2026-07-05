const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getUsers,
  toggleBan,
  getStats,
  getAllProductsAdmin,
  toggleProductActive,
} = require("../controllers/adminController");

router.use(protect, authorize("admin"));

router.get("/users", getUsers);
router.put("/users/:id/ban", toggleBan);
router.get("/stats", getStats);
router.get("/products", getAllProductsAdmin);
router.put("/products/:id/toggle", toggleProductActive);

module.exports = router;
