import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/mongodb";
import Booking from "@/backend/models/Booking";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const body = await req.json();

    // Find and update the booking. We accept both MongoDB ObjectId and string representation.
    const booking = await Booking.findByIdAndUpdate(
      resolvedParams.id,
      body,
      { new: true }
    );

    if (!booking) {
      return NextResponse.json({
        success: false,
        error: "Booking not found",
      }, { status: 404 });
    }

    const obj = booking.toObject();
    const normalizedBooking = {
      ...obj,
      id: obj.id || obj._id.toString(),
    };

    return NextResponse.json(normalizedBooking);
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return NextResponse.json({
      success: false,
      error: error.message || error,
    }, { status: 500 });
  }
}
