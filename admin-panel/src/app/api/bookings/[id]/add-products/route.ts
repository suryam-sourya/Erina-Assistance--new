import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/mongodb";
import Booking from "@/backend/models/Booking";
import Product from "@/backend/models/Product";

// POST — attach sold products to a booking, deduct stock, update totals
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { soldProducts } = await req.json();

    if (!Array.isArray(soldProducts) || soldProducts.length === 0) {
      return NextResponse.json(
        { success: false, error: "soldProducts array is required." },
        { status: 400 }
      );
    }

    // Validate and build line items
    const lineItems: any[] = [];
    let productsTotal = 0;

    for (const item of soldProducts) {
      if (!item.productId || !item.qty || item.qty < 1) continue;

      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) continue;

      const qty = Number(item.qty);
      const unitPrice = product.sellingPrice;
      const totalPrice = unitPrice * qty;

      lineItems.push({
        productId: product._id.toString(),
        name: product.name,
        sku: product.sku || null,
        qty,
        unitPrice,
        totalPrice,
      });

      productsTotal += totalPrice;

      // Deduct stock (clamp to 0 minimum)
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -Math.min(qty, product.stock) },
      });
    }

    if (lineItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid products found." },
        { status: 400 }
      );
    }

    // Generate invoice number: INV-YYYY-XXXX
    const year = new Date().getFullYear();
    const count = await Booking.countDocuments({ invoiceNumber: { $ne: null } });
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, "0")}`;

    // Update the booking
    const booking = await Booking.findByIdAndUpdate(
      id,
      {
        $set: {
          soldProducts: lineItems,
          invoiceNumber,
          invoiceGeneratedAt: new Date(),
          // Note: We do NOT overwrite paymentAmount here. paymentAmount represents the service charge.
          // The invoice page calculates the combined subtotal as service charge (paymentAmount) + productsSubtotal.
        },
      },
      { new: true }
    );

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      invoiceNumber,
      soldProducts: lineItems,
      productsTotal,
    });
  } catch (err: any) {
    console.error("POST /api/bookings/[id]/add-products error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
