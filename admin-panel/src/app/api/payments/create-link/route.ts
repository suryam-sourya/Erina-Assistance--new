import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/mongodb";
import Booking from "@/backend/models/Booking";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({
        success: false,
        error: "Missing required parameter: bookingId",
      }, { status: 400 });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: "Booking not found",
      }, { status: 404 });
    }

    // If a payment link already exists, return it directly to avoid duplicate links
    if (booking.paymentLink) {
      return NextResponse.json({
        success: true,
        bookingId: booking._id,
        paymentLink: booking.paymentLink,
        paymentLinkId: booking.paymentLinkId,
      });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json({
        success: false,
        error: "Razorpay credentials are not configured in environment variables.",
      }, { status: 500 });
    }

    const amount = Number(booking.paymentAmount);
    if (!amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        error: "Booking payment amount must be greater than 0 to generate a payment link.",
      }, { status: 400 });
    }

    const amountInPaise = Math.round(amount * 100);
    const rawContact = booking.phone || booking.customer?.phone || "";
    const cleanedContact = rawContact.replace(/\D/g, "");
    
    // Clean to 10 digits or prepend country code
    const finalContact = cleanedContact.length === 10 ? `+91${cleanedContact}` : (cleanedContact.length > 10 ? `+${cleanedContact}` : cleanedContact);

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const callbackBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://erinaassistance.in";

    const linkPayload = {
      amount: amountInPaise,
      currency: "INR",
      accept_partial: false,
      description: `Roadside Assistance - Booking ${booking.ticketId || booking._id}`,
      customer: {
        name: booking.customerName || booking.customer?.name || "Customer",
        contact: finalContact || undefined,
      },
      notify: {
        sms: false,
        email: false,
      },
      reminder_enable: true,
      notes: {
        bookingId: booking._id.toString(),
        ticketId: booking.ticketId || "",
      },
      callback_url: `${callbackBaseUrl}/tracking?id=${booking.ticketId || booking._id}`,
      callback_method: "get",
    };

    const paymentLink = await razorpay.paymentLink.create(linkPayload);

    // Update booking in MongoDB
    booking.paymentLink = paymentLink.short_url;
    booking.paymentLinkId = paymentLink.id;
    await booking.save();

    return NextResponse.json({
      success: true,
      bookingId: booking._id,
      paymentLink: paymentLink.short_url,
      paymentLinkId: paymentLink.id,
    });
  } catch (error: any) {
    console.error("Error generating Razorpay payment link:", error);
    return NextResponse.json({
      success: false,
      error: error.message || error || "Failed to generate payment link.",
    }, { status: 500 });
  }
}
