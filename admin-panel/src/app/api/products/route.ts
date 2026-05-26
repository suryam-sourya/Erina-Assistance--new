import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/mongodb";
import Product from "@/backend/models/Product";

export const dynamic = "force-dynamic";

// GET — list all active products (cached in Zustand, rarely called)
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({ isActive: true })
      .sort({ category: 1, name: 1 })
      .limit(200)
      .lean();

    return NextResponse.json({ success: true, products }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err: any) {
    console.error("GET /api/products error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST — create a new product
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { name, sku, category, description, sellingPrice, costPrice, stock, unit } = body;

    if (!name || sellingPrice === undefined) {
      return NextResponse.json(
        { success: false, error: "Product name and selling price are required." },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name: name.trim(),
      sku: sku?.trim() || null,
      category: category?.toUpperCase() || "OTHER",
      description: description?.trim() || "",
      sellingPrice: Number(sellingPrice),
      costPrice: Number(costPrice) || 0,
      stock: Number(stock) || 0,
      unit: unit || "pcs",
      isActive: true,
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/products error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
