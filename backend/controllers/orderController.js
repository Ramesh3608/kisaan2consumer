const Order = require("../models/Order");
const Product = require("../models/Product");
const { geocodeAddress } = require("../utils/geocode");
const { haversineKm } = require("../utils/distance");

const norm = (s) => (s || "").trim().toLowerCase();

// Categorizes how closely an agent's registered service area matches an order's
// delivery address: "exact" (city+state+zip all match), "city" (city+state match,
// zip differs/missing), "state" (state matches only), or "none".
const getAreaMatch = (agent, shippingAddress) => {
  const aCity = norm(agent.city);
  const aState = norm(agent.state);
  const aZip = norm(agent.zip);
  const oCity = norm(shippingAddress?.city);
  const oState = norm(shippingAddress?.state);
  const oZip = norm(shippingAddress?.zip);

  if (!aCity && !aState && !aZip) return "none";

  const cityMatch = aCity && oCity && aCity === oCity;
  const stateMatch = aState && oState && aState === oState;
  const zipMatch = aZip && oZip && aZip === oZip;

  if (cityMatch && stateMatch && zipMatch) return "exact";
  if (cityMatch && stateMatch) return "city";
  if (stateMatch) return "state";
  return "none";
};

// @route POST /api/orders   consumer places order (after payment verified)
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentId, razorpayOrderId } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let subtotal = 0;
    const orderItems = [];
    for (const it of items) {
      const product = await Product.findById(it.productId);
      if (!product) continue;
      const priceObj = product.prices.find((p) => p.weight === it.weight) || product.prices[0];
      const lineTotal = priceObj.price * it.qty;
      subtotal += lineTotal;
      orderItems.push({
        product: product._id,
        farmer: product.farmer,
        name: product.name,
        weight: priceObj.weight,
        price: priceObj.price,
        qty: it.qty,
      });
    }

    const shippingFee = 21.99;
    const total = subtotal + shippingFee;

    // Best-effort geocode of the delivery address so admin can later find the
    // nearest agent. If GOOGLE_MAPS_API_KEY isn't configured this just returns
    // null and the order is still created normally.
    const geo = await geocodeAddress(shippingAddress || {});
    const shippingAddressWithLocation = {
      ...shippingAddress,
      location: geo || { lat: null, lng: null },
    };

    const order = await Order.create({
      consumer: req.user._id,
      items: orderItems,
      shippingAddress: shippingAddressWithLocation,
      subtotal,
      shippingFee,
      total,
      paymentId: paymentId || "",
      razorpayOrderId: razorpayOrderId || "",
      paymentStatus: paymentId ? "Paid" : "Pending",
      status: "Pending",
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/orders/mine  (consumer)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ consumer: req.user._id })
      .populate("agent", "name phone")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/orders/farmer  (orders containing this farmer's items)
exports.getFarmerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ "items.farmer": req.user._id })
      .populate("consumer", "name phone")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/orders/:id/status   (farmer updates: Accepted/Packed)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const farmerOwnsItem = order.items.some(
      (i) => i.farmer.toString() === req.user._id.toString()
    );
    if (!farmerOwnsItem && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/orders  (admin - all orders)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("consumer", "name phone")
      .populate("agent", "name phone")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/orders/:id/assign  (admin manually assigns a specific agent)
exports.assignAgent = async (req, res) => {
  try {
    const { agentId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.agent = agentId;
    order.status = "Assigned";
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/orders/:id/nearest-agents  (admin — agents sorted by area match, then distance)
exports.getNearestAgents = async (req, res) => {
  try {
    const User = require("../models/User");
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const agents = await User.find({ role: "agent", isBanned: false }).select(
      "name phone currentLocation city state zip"
    );

    const orderLoc = order.shippingAddress?.location;
    const hasOrderLocation = orderLoc && orderLoc.lat != null && orderLoc.lng != null;

    const ranked = agents.map((a) => {
      const hasAgentLocation = a.currentLocation?.lat != null && a.currentLocation?.lng != null;
      let distanceKm = null;
      if (hasOrderLocation && hasAgentLocation) {
        distanceKm = haversineKm(orderLoc.lat, orderLoc.lng, a.currentLocation.lat, a.currentLocation.lng);
      }
      return {
        _id: a._id,
        name: a.name,
        phone: a.phone,
        distanceKm: distanceKm !== null ? Math.round(distanceKm * 10) / 10 : null,
        locationKnown: hasAgentLocation,
        areaMatch: getAreaMatch(a, order.shippingAddress),
      };
    });

    // Exact city+state+zip matches float to the top regardless of GPS distance,
    // then sort the rest by distance (nearest first), unknown-distance last.
    const areaRank = { exact: 0, city: 1, state: 2, none: 3 };
    ranked.sort((a, b) => {
      if (areaRank[a.areaMatch] !== areaRank[b.areaMatch]) {
        return areaRank[a.areaMatch] - areaRank[b.areaMatch];
      }
      if (a.distanceKm === null && b.distanceKm === null) return 0;
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });

    res.json({ agents: ranked, orderLocationKnown: hasOrderLocation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/orders/:id/assign-nearest  (admin — one-click assign the closest agent)
exports.assignNearestAgent = async (req, res) => {
  try {
    const User = require("../models/User");
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const agents = await User.find({ role: "agent", isBanned: false }).select("name currentLocation");
    const orderLoc = order.shippingAddress?.location;
    const hasOrderLocation = orderLoc && orderLoc.lat != null && orderLoc.lng != null;

    if (!hasOrderLocation) {
      return res.status(400).json({
        message:
          "Delivery address location is unknown (geocoding may not be configured). Please assign an agent manually.",
      });
    }

    const withLocation = agents.filter((a) => a.currentLocation?.lat != null && a.currentLocation?.lng != null);
    if (!withLocation.length) {
      return res.status(400).json({
        message: "No agents currently have a known location. Ask an agent to open their dashboard and share location.",
      });
    }

    let nearest = null;
    let nearestDist = Infinity;
    for (const a of withLocation) {
      const d = haversineKm(orderLoc.lat, orderLoc.lng, a.currentLocation.lat, a.currentLocation.lng);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = a;
      }
    }

    order.agent = nearest._id;
    order.status = "Assigned";
    await order.save();

    res.json({ order, assignedAgent: nearest.name, distanceKm: Math.round(nearestDist * 10) / 10 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/orders/:id/assign-matching  (admin — assign an agent whose service
// area exactly matches the order's city/state/pincode)
exports.assignMatchingAgent = async (req, res) => {
  try {
    const User = require("../models/User");
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const agents = await User.find({ role: "agent", isBanned: false }).select("name city state zip");
    const exactMatches = agents.filter((a) => getAreaMatch(a, order.shippingAddress) === "exact");

    if (!exactMatches.length) {
      return res.status(400).json({
        message:
          "No agent's city, state, and pincode exactly match this delivery address. Try 'Assign Nearest Agent' (GPS-based) or assign manually instead.",
      });
    }

    const chosen = exactMatches[0];
    order.agent = chosen._id;
    order.status = "Assigned";
    await order.save();

    res.json({ order, assignedAgent: chosen.name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/orders/:id/auto-assign  (admin — one-click smart assignment:
// tries exact city/state/pincode match first, falls back to GPS-nearest agent
// if no area match is found, and only errors out if neither method works)
exports.autoAssignAgent = async (req, res) => {
  try {
    const User = require("../models/User");
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const agents = await User.find({ role: "agent", isBanned: false }).select(
      "name city state zip currentLocation"
    );

    // Step 1 — exact area match (city + state + pincode)
    const exactMatches = agents.filter((a) => getAreaMatch(a, order.shippingAddress) === "exact");
    if (exactMatches.length) {
      const chosen = exactMatches[0];
      order.agent = chosen._id;
      order.status = "Assigned";
      await order.save();
      return res.json({ order, assignedAgent: chosen.name, method: "area_match" });
    }

    // Step 2 — GPS nearest agent (only reached if step 1 found nobody)
    const orderLoc = order.shippingAddress?.location;
    const hasOrderLocation = orderLoc && orderLoc.lat != null && orderLoc.lng != null;
    const withLocation = agents.filter((a) => a.currentLocation?.lat != null && a.currentLocation?.lng != null);

    if (hasOrderLocation && withLocation.length) {
      let nearest = null;
      let nearestDist = Infinity;
      for (const a of withLocation) {
        const d = haversineKm(orderLoc.lat, orderLoc.lng, a.currentLocation.lat, a.currentLocation.lng);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = a;
        }
      }
      order.agent = nearest._id;
      order.status = "Assigned";
      await order.save();
      return res.json({
        order,
        assignedAgent: nearest.name,
        distanceKm: Math.round(nearestDist * 10) / 10,
        method: "gps_nearest",
      });
    }

    // Step 3 — neither method worked, don't guess
    return res.status(400).json({
      message:
        "Couldn't auto-assign — no agent's area matches this address, and GPS location data isn't available. Please assign manually.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/orders/agent  (agent's assigned deliveries)
exports.getAgentOrders = async (req, res) => {
  try {
    const orders = await Order.find({ agent: req.user._id })
      .populate("consumer", "name phone")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/orders/:id/delivery-status  (agent updates: Picked Up / Out for Delivery / Delivered)
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.agent?.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("consumer", "name phone")
      .populate("agent", "name phone");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
