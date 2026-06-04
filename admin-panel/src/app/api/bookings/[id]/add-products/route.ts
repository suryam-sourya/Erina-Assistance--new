/**
 * POST /api/bookings/[id]/add-products
 *
 * Attaches sold products to an existing booking.
 *
 * Request body:
 *   items: Array<{ productId: string; quantity: number }>
 *
 * This endpoint:
 *   1. Validates the booking exists and is in-progress or completed
 *   2. Validates each product exists, is active, and has sufficient stock
 *   3. Atomically decrements stock for each product
 *   4. Appends product snapshots to booking.soldProducts[]
 *   5. Recalculates and updates booking.paymentAmount (service + products)
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/mongodb";
import Booking from "@/backend/models/Booking";
import Product from "@/backend/models/Product";

type Params = { params: Promise<{ id: string }> };

interface SoldItem {
  productId: string;
  quantity: number;
}

export async function POST(req: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const items: SoldItem[] = body.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "items[] is required and must be non-empty." },
        { status: 400 }
      );
    }

    // ── 1. Find the booking ───────────────────────────────────────────────
    // Support both MongoDB ObjectId (24-char hex) and custom ticketId (RSA-XXXX)
    const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    const booking = isValidMongoId
      ? await Booking.findById(id)
      : await Booking.findOne({ ticketId: id });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found." }, { status: 404 });
    }

    // ── 2. Validate all products and stock levels ─────────────────────────
    const productSnapshots = [];
    let productsTotal = 0; // GST-inclusive total for all products sold

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { success: false, error: `Invalid item: productId and quantity (≥1) are required.` },
          { status: 400 }
        );
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product "${item.productId}" not found.` },
          { status: 404 }
        );
      }
      if (!product.isActive) {
        return NextResponse.json(
          { success: false, error: `Product "${product.name}" is currently inactive.` },
          { status: 422 }
        );
      }
      if (product.stockQty < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for "${product.name}". Available: ${product.stockQty}, Requested: ${item.quantity}.`,
          },
          { status: 422 }
        );
      }

      // Snapshot at time of sale (preserves invoice history even if product changes later)
      productSnapshots.push({
        productId: product._id.toString(),
        name:      product.name,
        brand:     product.brand,
        sku:       product.sku,
        hsnCode:   product.hsnCode,
        gstRate:   product.gstRate,
        quantity:  item.quantity,
        unitPrice: product.sellingPrice, // GST-inclusive price at time of sale
      });

      productsTotal += product.sellingPrice * item.quantity;
    }

    // ── 3. Atomically decrement stock for each product ────────────────────
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockQty: -item.quantity },
      });
    }

    // ── 4. Append product snapshots to booking ────────────────────────────
    const existingProductsTotal = (booking.soldProducts || []).reduce(
      (sum: number, p: { unitPrice: number; quantity: number }) => sum + p.unitPrice * p.quantity,
      0
    );

    // Recalculate paymentAmount: original service amount + all sold products
    const originalServiceAmount = booking.paymentAmount - existingProductsTotal;
    const newPaymentAmount = Math.round((originalServiceAmount + productsTotal) * 100) / 100;

    booking.soldProducts = [...(booking.soldProducts || []), ...productSnapshots];
    booking.paymentAmount = newPaymentAmount;
    await booking.save();

    return NextResponse.json({
      success: true,
      message: `${productSnapshots.length} product(s) added to booking.`,
      productsAdded: productSnapshots,
      updatedPaymentAmount: newPaymentAmount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[POST /api/bookings/:id/add-products] Error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
