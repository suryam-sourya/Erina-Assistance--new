/**
 * GET    /api/products/[id]  — Get single product
 * PUT    /api/products/[id]  — Update product (price, stock, active status)
 * DELETE /api/products/[id]  — Hard delete (use isActive=false for soft disable)
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/mongodb";
import Product from "@/backend/models/Product";

type Params = { params: Promise<{ id: string }> };

// ── GET ────────────────────────────────────────────────────────────────────

export async function GET(_req: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ── PUT ────────────────────────────────────────────────────────────────────

export async function PUT(req: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    // Only allow updating these fields — price, stock, description, active status
    const allowed = [
      "name", "brand", "category", "description",
      "hsnCode", "gstRate", "sellingPrice", "costPrice",
      "stockQty", "lowStockThreshold", "isActive",
    ];

    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    const product = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ── DELETE ─────────────────────────────────────────────────────────────────

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Product deleted." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
