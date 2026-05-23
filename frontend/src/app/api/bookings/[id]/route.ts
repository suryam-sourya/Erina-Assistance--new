import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    
    // Attempt to locate booking in MongoDB.
    const booking = await Booking.findById(resolvedParams.id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    const obj = booking.toObject();
    const normalizedBooking = {
      ...obj,
      id: obj.id || obj._id.toString(),
    };

    return NextResponse.json({
      success: true,
      booking: normalizedBooking,
    });
  } catch (error: any) {
    console.error("Error fetching single booking:", error);
    return NextResponse.json(
      { success: false, error: error.message || error },
      { status: 500 }
    );
  }
}
