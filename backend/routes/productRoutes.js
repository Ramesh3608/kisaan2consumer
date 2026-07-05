const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

router.get("/", getProducts);
router.get("/farmer/mine", protect, authorize("farmer"), getMyProducts);
router.get("/:id", getProductById);
router.post("/", protect, authorize("farmer"), createProduct);
router.put("/:id", protect, authorize("farmer", "admin"), updateProduct);
router.delete("/:id", protect, authorize("farmer", "admin"), deleteProduct);

module.exports = router;
