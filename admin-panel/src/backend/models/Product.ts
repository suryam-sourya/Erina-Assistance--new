/**
 * Product Model — Erina RSA Parts & Accessories Catalog
 *
 * Represents physical products (batteries, tyres, engine oil, etc.)
 * that technicians sell to motorists on-site during service calls.
 *
 * These products are ONLY sold in conjunction with a service booking.
 * This is NOT a general e-commerce inventory system.
 */

import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      // e.g. "Amaron 45Ah Battery", "Bosch T5 55Ah Battery"
    },
    brand: {
      type: String,
      required: true,
      trim: true,
      // e.g. "Amaron", "Exide", "Bosch", "MRF"
    },
    category: {
      type: String,
      required: true,
      uppercase: true,
      // "BATTERY", "TYRE", "ENGINE_OIL", "LUBRICANT", "OTHER"
      enum: ["BATTERY", "TYRE", "ENGINE_OIL", "LUBRICANT", "OTHER"],
      default: "OTHER",
    },
    sku: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      // e.g. "BAT-45AH-AMR", "TYR-185-65-R15-MRF"
    },
    description: {
      type: String,
      default: "",
      // Short product description for invoice and catalog display
    },
    hsnCode: {
      type: String,
      required: true,
      // GST HSN Code:
      //   8507 → Batteries (28% GST)
      //   4011 → Tyres (28% GST)
      //   2710 → Engine Oil (18% GST)
      //   3403 → Lubricants (18% GST)
      default: "8507",
    },
    gstRate: {
      type: Number,
      required: true,
      // As decimal: 0.28 for 28%, 0.18 for 18%
      // Product-specific rate — don't assume all products share the service GST rate
      default: 0.28,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
      // MRP / Selling price (GST INCLUSIVE) — what the customer pays
    },
    costPrice: {
      type: Number,
      default: 0,
      // Purchase cost (for internal margin tracking only)
    },
    stockQty: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      // Current available stock at hub
    },
    lowStockThreshold: {
      type: Number,
      default: 2,
      // Alert when stockQty falls below this
    },
    isActive: {
      type: Boolean,
      default: true,
      // Soft-disable without deleting — inactive products won't appear in the add-products modal
    },
  },
  { timestamps: true }
);

// Indexes for fast lookups
ProductSchema.index({ sku: 1 }, { unique: true });
ProductSchema.index({ category: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ stockQty: 1 });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
