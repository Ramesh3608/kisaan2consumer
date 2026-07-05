const mongoose = require("mongoose");

const weightPriceSchema = new mongoose.Schema(
  {
    weight: { type: String, required: true }, // e.g. "250gms", "1kg"
    price: { type: Number, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: ["fruit", "vegetable", "seeds", "flowers", "nuts", "dairy", "beverages", "snacks"],
      required: true,
    },
    image: { type: String, default: "" }, // emoji or icon key fallback used on frontend
    organic: { type: Boolean, default: false },
    prices: { type: [weightPriceSchema], required: true },
    stock: { type: Number, default: 100 },
    harvestDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
