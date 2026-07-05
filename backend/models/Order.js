const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    weight: String,
    price: Number,
    qty: { type: Number, default: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    consumer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    shippingAddress: {
      label: String,
      fullName: String,
      street: String,
      city: String,
      state: String,
      zip: String,
      phone: String,
      location: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
      },
    },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 21.99 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Packed",
        "Assigned",
        "Picked Up",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    paymentId: { type: String, default: "" },
    razorpayOrderId: { type: String, default: "" },
    paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
