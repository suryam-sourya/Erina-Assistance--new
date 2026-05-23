import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/mongodb";
import Booking from "@/backend/models/Booking";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    const totalRequests = await Booking.countDocuments();
    
    // Support case-insensitive or mixed case status values
    const activeEmergencies = await Booking.countDocuments({
      status: { $in: ["emergency", "Emergency"] }
    });

    const pendingRequests = await Booking.countDocuments({
      status: { $in: ["pending", "Pending", "emergency", "Emergency"] }
    });

    // Sum up revenue from completed bookings
    const revenueAggregation = await Booking.aggregate([
      { 
        $match: { 
          status: { $in: ["completed", "Completed"] },
          paymentStatus: { $in: ["completed", "Completed"] }
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: "$paymentAmount" } 
        } 
      }
    ]);
    const revenueToday = revenueAggregation[0]?.total || 0;

    return NextResponse.json({
      totalBookings: totalRequests,
      activeBookings: pendingRequests, // matching user request field names
      totalRequests,
      activeEmergencies,
      pendingRequests,
      revenueToday,
      availableTechnicians: 3, // default/fallback since tech management is client-side in the MVP
    });
  } catch (error: any) {
    console.error("Error computing dashboard stats:", error);
    return NextResponse.json({
      success: false,
      error: error.message || error,
    }, { status: 500 });
  }
}
