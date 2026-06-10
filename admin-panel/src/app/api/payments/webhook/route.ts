import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/backend/lib/mongodb";
import Booking from "@/backend/models/Booking";

// Razorpay sends a signature in the header to verify the webhook is genuine
function verifyRazorpaySignature(body: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // If a webhook secret is configured, verify the signature
    if (webhookSecret) {
      if (!signature) {
        console.warn("[Razorpay Webhook] Missing signature header.");
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
      }

      const isValid = verifyRazorpaySignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.warn("[Razorpay Webhook] Invalid signature — request rejected.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventType: string = event?.event || "";

    console.log(`[Razorpay Webhook] Received event: ${eventType}`);

    // Handle payment link paid event
    if (eventType === "payment_link.paid") {
      const paymentLinkId: string = event?.payload?.payment_link?.entity?.id || "";
      const paymentId: string = event?.payload?.payment?.entity?.id || "";
      const notes = event?.payload?.payment_link?.entity?.notes || {};
      const bookingMongoId: string = notes?.bookingId || "";

      console.log(`[Razorpay Webhook] Payment completed — linkId: ${paymentLinkId}, paymentId: ${paymentId}, bookingId: ${bookingMongoId}`);

      if (!bookingMongoId && !paymentLinkId) {
        console.warn("[Razorpay Webhook] No bookingId or paymentLinkId in event payload.");
        return NextResponse.json({ received: true, warning: "No booking reference found" });
      }

      await connectDB();

      // Find booking by MongoDB _id (from notes) or by paymentLinkId
      const booking = bookingMongoId
        ? await Booking.findById(bookingMongoId)
        : await Booking.findOne({ paymentLinkId });

      if (!booking) {
        console.warn(`[Razorpay Webhook] No booking found for paymentLinkId: ${paymentLinkId}, mongoId: ${bookingMongoId}`);
        // Return 200 so Razorpay doesn't retry — the booking may have already been cleaned up
        return NextResponse.json({ received: true, warning: "Booking not found" });
      }

      // Update payment status to COMPLETED
      booking.paymentStatus = "COMPLETED";
      await booking.save();

      console.log(`[Razorpay Webhook] ✅ Booking ${booking.ticketId || booking._id} paymentStatus set to COMPLETED. Razorpay Payment ID: ${paymentId}`);

      return NextResponse.json({ received: true, success: true });
    }

    // For all other events, just acknowledge receipt
    return NextResponse.json({ received: true, event: eventType });
  } catch (error: any) {
    console.error("[Razorpay Webhook] Unhandled error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed", detail: error?.message },
      { status: 500 }
    );
  }
}
