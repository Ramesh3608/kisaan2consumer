const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createOrder,
  getMyOrders,
  getFarmerOrders,
  updateOrderStatus,
  getAllOrders,
  assignAgent,
  getNearestAgents,
  assignNearestAgent,
  assignMatchingAgent,
  autoAssignAgent,
  getAgentOrders,
  updateDeliveryStatus,
  getOrderById,
} = require("../controllers/orderController");

router.post("/", protect, authorize("consumer"), createOrder);
router.get("/mine", protect, authorize("consumer"), getMyOrders);
router.get("/farmer", protect, authorize("farmer"), getFarmerOrders);
router.get("/agent", protect, authorize("agent"), getAgentOrders);
router.get("/", protect, authorize("admin"), getAllOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, authorize("farmer", "admin"), updateOrderStatus);
router.put("/:id/assign", protect, authorize("admin"), assignAgent);
router.get("/:id/nearest-agents", protect, authorize("admin"), getNearestAgents);
router.put("/:id/assign-nearest", protect, authorize("admin"), assignNearestAgent);
router.put("/:id/assign-matching", protect, authorize("admin"), assignMatchingAgent);
router.put("/:id/auto-assign", protect, authorize("admin"), autoAssignAgent);
router.put("/:id/delivery-status", protect, authorize("agent", "admin"), updateDeliveryStatus);

module.exports = router;
