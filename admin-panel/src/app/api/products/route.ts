/**
 * GET  /api/products         — List all active products for dispatcher use
 * POST /api/products         — Create a new product in the catalog
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/mongodb";
import Product from "@/backend/models/Product";

// ── GET: List all products ─────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const category = searchParams.get("category");

    const filter: Record<string, unknown> = {};
    if (!includeInactive) filter.isActive = true;
    if (category) filter.category = category.toUpperCase();

    const products = await Product.find(filter).sort({ category: 1, name: 1 });

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[GET /api/products] Error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ── POST: Create a new product ─────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      name,
      brand,
      category,
      sku,
      description,
      hsnCode,
      gstRate,
      sellingPrice,
      costPrice,
      stockQty,
      lowStockThreshold,
    } = body;

    // Validate required fields
    if (!name || !brand || !sku || !sellingPrice) {
      return NextResponse.json(
        { success: false, error: "name, brand, sku, and sellingPrice are required." },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name:               name.trim(),
      brand:              brand.trim(),
      category:           (category || "OTHER").toUpperCase(),
      sku:                sku.trim().toUpperCase(),
      description:        description || "",
      hsnCode:            hsnCode || "8507",
      gstRate:            parseFloat(gstRate) || 0.28,
      sellingPrice:       parseFloat(sellingPrice),
      costPrice:          parseFloat(costPrice) || 0,
      stockQty:           parseInt(stockQty) || 0,
      lowStockThreshold:  parseInt(lowStockThreshold) || 2,
      isActive:           true,
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    // Handle duplicate SKU
    if (message.includes("duplicate key") || message.includes("E11000")) {
      return NextResponse.json(
        { success: false, error: "A product with this SKU already exists." },
        { status: 409 }
      );
    }
    console.error("[POST /api/products] Error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
