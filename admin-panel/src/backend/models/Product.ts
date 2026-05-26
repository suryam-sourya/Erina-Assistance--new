import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Amaron 65Ah Car Battery"
    sku: { type: String, trim: true, default: null },   // e.g. "BAT-AMR-65AH"
    category: {
      type: String,
      uppercase: true,
      enum: ["BATTERY", "TYRE", "OIL", "TOOLS", "ACCESSORIES", "OTHER"],
      default: "OTHER",
    },
    description: { type: String, default: "" },
    sellingPrice: { type: Number, required: true, min: 0 }, // ₹ customer-facing price
    costPrice: { type: Number, default: 0, min: 0 },        // ₹ internal cost (profit tracking)
    stock: { type: Number, default: 0, min: 0 },            // units at hub
    unit: {
      type: String,
      enum: ["pcs", "litre", "set", "pair", "kg"],
      default: "pcs",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for fast lookup
ProductSchema.index({ category: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ sku: 1 }, { sparse: true });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
