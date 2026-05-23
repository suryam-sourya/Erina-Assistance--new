import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const bookings = await Booking.find().sort({
      createdAt: -1,
    });
    
    // Normalize MongoDB _id to string id for compatibility with the frontend/Zustand store
    const normalizedBookings = bookings.map(b => {
      const obj = b.toObject();
      return {
        ...obj,
        id: obj.id || obj._id.toString(),
      };
    });

    return NextResponse.json(normalizedBookings);
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({
      success: false,
      error: error.message || error,
    }, { status: 500 });
  }
}
